// Token auto-refresh middleware
// Wraps any platform API call: if it gets a 401 it refreshes the token,
// saves the new tokens to DB, and retries the call once.

import prisma from '../lib/prisma.js'
import { encryptToken, decryptToken, safeDecryptToken } from '../lib/crypto/tokens.js'
import { getPlatformIntegration, isValidPlatform } from '../lib/platforms/registry.js'
import type { Platform } from '../lib/platforms/types.js'

export class TokenRefreshError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TokenRefreshError'
  }
}

/**
 * Wraps a platform API call with automatic token refresh on 401.
 *
 * @param storeId   DB store ID
 * @param apiCall   Async function that receives the decrypted access token
 * @returns         Result of apiCall
 *
 * Flow:
 *   1. Decrypt current access token
 *   2. Run apiCall(token)
 *   3. On 401 → refresh token via platform OAuth
 *   4. Encrypt + save new tokens to DB
 *   5. Retry apiCall once with new token
 *   6. On refresh failure → mark store DISCONNECTED + throw
 */
export async function withTokenRefresh<T>(
  storeId: string,
  apiCall: (accessToken: string) => Promise<T>,
): Promise<T> {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) throw new TokenRefreshError(`Store not found: ${storeId}`)
  if (!store.accessToken) throw new TokenRefreshError(`Store ${storeId} has no access token`)

  const accessToken = decryptToken(store.accessToken)

  try {
    return await apiCall(accessToken)
  } catch (err: unknown) {
    // Only refresh on 401 Unauthorized
    if (!is401(err)) throw err

    const refreshTokenEnc = store.refreshToken
    if (!refreshTokenEnc) {
      await markDisconnected(storeId, store.platform)
      throw new TokenRefreshError(`No refresh token for store ${storeId} — store marked disconnected`)
    }

    const refreshToken = safeDecryptToken(refreshTokenEnc)
    if (!refreshToken) {
      await markDisconnected(storeId, store.platform)
      throw new TokenRefreshError(`Failed to decrypt refresh token for store ${storeId}`)
    }

    if (!isValidPlatform(store.platform)) {
      throw new TokenRefreshError(`Unknown platform: ${store.platform}`)
    }

    let newTokens
    try {
      const integration = getPlatformIntegration(store.platform as Platform)
      newTokens = await integration.refreshToken(refreshToken)
    } catch (refreshErr) {
      console.error(`[tokenRefresh] refresh failed for store ${storeId}:`, refreshErr)
      await markDisconnected(storeId, store.platform)
      const platformLabel = store.platform === 'salla' ? 'سلة' : store.platform === 'zid' ? 'زد' : store.platform
      throw new TokenRefreshError(
        `انتهت صلاحية اتصال متجر ${platformLabel}، يرجى إعادة الربط`,
      )
    }

    // Encrypt and persist new tokens
    await prisma.store.update({
      where: { id: storeId },
      data: {
        accessToken: encryptToken(newTokens.accessToken),
        refreshToken: newTokens.refreshToken ? encryptToken(newTokens.refreshToken) : undefined,
        tokenExpiresAt: newTokens.expiresAt ?? undefined,
      },
    })

    // Retry with fresh token
    return await apiCall(newTokens.accessToken)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function is401(err: unknown): boolean {
  if (err instanceof Error) {
    // SallaApiError / ZidApiError / ShopifyApiError carry a .status field
    const e = err as Error & { status?: number }
    if (e.status === 401) return true
    // Some integrations embed the status in the message
    if (e.message.includes('(401)') || e.message.includes('401')) return true
  }
  return false
}

async function markDisconnected(storeId: string, platform: string): Promise<void> {
  await prisma.store.update({
    where: { id: storeId },
    data: { connectionStatus: 'disconnected', isActive: false },
  }).catch(() => {})

  // Create a notification so the merchant knows their store needs re-connection
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { organizationId: true, name: true },
  }).catch(() => null)

  if (store) {
    const platformLabel = platform === 'salla' ? 'سلة' : platform === 'zid' ? 'زد' : platform
    await prisma.notification.create({
      data: {
        organizationId: store.organizationId,
        type: 'store_disconnected',
        priority: 'critical',
        title: `انتهت صلاحية اتصال متجر ${platformLabel}`,
        body: `يرجى إعادة ربط متجر "${store.name}" من صفحة المتاجر`,
      },
    }).catch(() => {})
  }
}
