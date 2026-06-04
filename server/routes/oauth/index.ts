// OAuth router — mounts all platform OAuth flows under /api/oauth
// Routes: GET /:platform/connect, GET /:platform/callback
// Custom (API key): POST /custom/connect

import { Router } from 'express'
import prisma from '../../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../../middleware/auth.js'
import { enforceStoreLimit } from '../../middleware/subscriptionLimits.js'
import { encryptToken, generateOAuthState, validateOAuthState } from '../../lib/crypto/tokens.js'
import { getPlatformIntegration, isValidPlatform, getPlatformMeta } from '../../lib/platforms/registry.js'
import type { Platform } from '../../lib/platforms/types.js'
import rateLimit from 'express-rate-limit'

const router = Router()
router.use(requireAuth)

// Rate limit: 5 connect attempts per hour per user
const connectRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => (req as AuthRequest).userId ?? req.ip ?? 'unknown',
  message: { error: { code: 'RATE_LIMITED', message: 'تجاوزت الحد المسموح به. حاول مرة أخرى بعد ساعة.' } },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── GET /:platform/connect ────────────────────────────────────────────────────

router.get('/:platform/connect', connectRateLimit, enforceStoreLimit, async (req: AuthRequest, res) => {
  const { platform } = req.params

  if (!isValidPlatform(platform)) {
    res.status(400).json({ error: { code: 'INVALID_PLATFORM', message: `المنصة "${platform}" غير مدعومة` } })
    return
  }

  const meta = getPlatformMeta(platform as Platform)
  if (meta.authType !== 'oauth2') {
    res.status(400).json({ error: { code: 'NOT_OAUTH', message: 'هذه المنصة تستخدم API key وليس OAuth' } })
    return
  }

  // Pre-create a pending store record so we have an ID for state
  const pendingStore = await prisma.store.create({
    data: {
      organizationId: req.orgId!,
      name: `متجر ${meta.name} جديد`,
      platform,
      connectionStatus: 'disconnected',
      isActive: false, // activated after OAuth completes
    },
  })

  const state = generateOAuthState(req.userId!, pendingStore.id)
  const redirectUri = buildRedirectUri(req, platform)
  const authUrl = getPlatformIntegration(platform as Platform).getAuthUrl(pendingStore.id, redirectUri)

  // Persist state for validation in callback
  await prisma.oAuthState.create({
    data: {
      organizationId: req.orgId!,
      platform,
      pendingStoreId: pendingStore.id,
      state,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  })

  // For API clients — return URL instead of redirect
  if (req.headers.accept?.includes('application/json')) {
    res.json({ authUrl, storeId: pendingStore.id })
    return
  }

  res.redirect(authUrl)
})

// ── GET /:platform/callback ───────────────────────────────────────────────────

router.get('/:platform/callback', async (req: AuthRequest, res) => {
  const { platform } = req.params
  const { code, state, error } = req.query as Record<string, string>

  if (error) {
    res.redirect(`/stores?error=${encodeURIComponent(`OAuth رُفض من المنصة: ${error}`)}`)
    return
  }

  if (!isValidPlatform(platform) || !code || !state) {
    res.redirect('/stores?error=oauth_invalid')
    return
  }

  let statePayload: ReturnType<typeof validateOAuthState>
  try {
    statePayload = validateOAuthState(state)
  } catch {
    res.redirect('/stores?error=oauth_state_invalid')
    return
  }

  // Verify state belongs to this user
  if (statePayload.userId !== req.userId) {
    res.redirect('/stores?error=oauth_unauthorized')
    return
  }

  // Look up the pending state record
  const oauthState = await prisma.oAuthState.findUnique({ where: { state } })
  if (!oauthState || oauthState.organizationId !== req.orgId) {
    res.redirect('/stores?error=oauth_state_not_found')
    return
  }

  // Clean up state record
  await prisma.oAuthState.delete({ where: { state } }).catch(() => {})

  try {
    const integration = getPlatformIntegration(platform as Platform)
    const redirectUri = buildRedirectUri(req, platform)
    const tokens = await integration.exchangeCode(code, redirectUri)

    // Test the connection
    const isAlive = await integration.testConnection(tokens.accessToken).catch(() => false)
    if (!isAlive) {
      await prisma.store.delete({ where: { id: oauthState.pendingStoreId! } }).catch(() => {})
      res.redirect('/stores?error=oauth_connection_failed')
      return
    }

    // Fetch store info from platform
    const storeInfo = await integration.getStoreInfo(tokens.accessToken).catch(() => null)

    // Encrypt tokens
    const encryptedAccess = encryptToken(tokens.accessToken)
    const encryptedRefresh = tokens.refreshToken ? encryptToken(tokens.refreshToken) : null

    // Activate the store
    const store = await prisma.store.update({
      where: { id: oauthState.pendingStoreId! },
      data: {
        name: storeInfo?.name ?? `متجر ${getPlatformMeta(platform as Platform).name}`,
        domain: storeInfo?.domain ?? undefined,
        externalStoreId: storeInfo?.externalId ?? undefined,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        tokenExpiresAt: tokens.expiresAt ?? undefined,
        connectionStatus: 'connected',
        isActive: true,
      },
    })

    // Set as active store
    await prisma.organization.update({
      where: { id: req.orgId! },
      data: { activeStoreId: store.id },
    })

    // Register webhooks in background
    const webhookBase = `${req.protocol}://${req.hostname}`
    integration.registerWebhooks(tokens.accessToken, store.id, webhookBase).catch((err: unknown) => {
      console.error(`[oauth] webhook registration failed for ${platform}:`, err)
    })

    await logActivity(req.orgId!, req.userId!, 'store_connected', 'store', store.id, `ربط متجر ${store.name} (${platform})`)

    res.redirect('/stores?success=connected')
  } catch (err) {
    console.error(`[oauth] ${platform} callback error:`, err)
    // Delete the pending store on failure
    await prisma.store.delete({ where: { id: oauthState.pendingStoreId! } }).catch(() => {})
    res.redirect('/stores?error=oauth_exchange_failed')
  }
})

// ── POST /custom/connect — API key based ──────────────────────────────────────

router.post('/custom/connect', connectRateLimit, enforceStoreLimit, async (req: AuthRequest, res) => {
  const { name, apiKey, baseUrl, platform = 'custom' } = req.body

  if (!name || !apiKey) {
    res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'اسم المتجر ومفتاح API مطلوبان' } })
    return
  }

  if (!isValidPlatform(platform)) {
    res.status(400).json({ error: { code: 'INVALID_PLATFORM', message: `المنصة "${platform}" غير مدعومة` } })
    return
  }

  const integration = getPlatformIntegration(platform as Platform)
  const isAlive = await integration.testConnection(apiKey).catch(() => false)
  if (!isAlive) {
    res.status(422).json({ error: { code: 'CONNECTION_FAILED', message: 'فشل الاتصال. تحقق من مفتاح API والرابط.' } })
    return
  }

  const encryptedToken = encryptToken(apiKey)

  const store = await prisma.store.create({
    data: {
      organizationId: req.orgId!,
      name,
      platform,
      domain: baseUrl ?? undefined,
      accessToken: encryptedToken,
      connectionStatus: 'connected',
      isActive: true,
      platformMeta: baseUrl ? JSON.stringify({ baseUrl }) : '{}',
    },
  })

  await prisma.organization.update({
    where: { id: req.orgId! },
    data: { activeStoreId: store.id },
  })

  await logActivity(req.orgId!, req.userId!, 'store_connected', 'store', store.id, `ربط متجر ${name} (${platform}) بـ API Key`)

  res.json({ store: { id: store.id, name: store.name, platform: store.platform } })
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildRedirectUri(req: AuthRequest, platform: string): string {
  const base = process.env.DEEMA_BASE_URL ?? `${req.protocol}://${req.hostname}`
  return `${base}/api/oauth/${platform}/callback`
}

async function logActivity(orgId: string, userId: string, action: string, entity: string, entityId: string, summary: string) {
  await prisma.activityLog.create({
    data: { organizationId: orgId, userId, action, entity, entityId, summary },
  }).catch(() => {})
}

export default router
