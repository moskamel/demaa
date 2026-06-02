import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { registerStoreWebhooks } from '../lib/webhooks/registry.js'

const router = Router()
router.use(requireAuth)

async function orgStoreIds(orgId: string): Promise<string[]> {
  const stores = await prisma.store.findMany({ where: { organizationId: orgId }, select: { id: true } })
  return stores.map(s => s.id)
}

// GET /api/webhooks/stats
router.get('/stats', async (req: AuthRequest, res) => {
  const ids = await orgStoreIds(req.orgId!)

  const [total, processed, failed, dead, pending, retrying] = await Promise.all([
    prisma.webhookEvent.count({ where: { storeId: { in: ids } } }),
    prisma.webhookEvent.count({ where: { storeId: { in: ids }, status: 'processed' } }),
    prisma.webhookEvent.count({ where: { storeId: { in: ids }, status: 'failed' } }),
    prisma.webhookEvent.count({ where: { storeId: { in: ids }, status: 'dead' } }),
    prisma.webhookEvent.count({ where: { storeId: { in: ids }, status: 'pending' } }),
    prisma.webhookEvent.count({ where: { storeId: { in: ids }, status: 'failed', nextRetryAt: { lte: new Date() } } }),
  ])

  const byPlatform = await prisma.webhookEvent.groupBy({
    by: ['platform', 'status'],
    where: { storeId: { in: ids } },
    _count: { _all: true },
    orderBy: { platform: 'asc' },
  })

  const successRate = total > 0 ? Math.round((processed / total) * 100) : 100

  const registrations = await prisma.webhookRegistration.findMany({
    where: { storeId: { in: ids } },
    include: { store: { select: { name: true, domain: true } } },
    orderBy: { createdAt: 'desc' },
  })

  res.json({ stats: { total, processed, failed, dead, pending, retrying, successRate }, byPlatform, registrations })
})

// GET /api/webhooks/events
router.get('/events', async (req: AuthRequest, res) => {
  const { platform, status, limit = '50', cursor } = req.query as Record<string, string>
  const ids = await orgStoreIds(req.orgId!)

  const where: Record<string, unknown> = { storeId: { in: ids } }
  if (platform) where.platform = platform
  if (status) where.status = status

  const events = await prisma.webhookEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit),
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true, platform: true, topic: true, status: true, attempts: true,
      error: true, createdAt: true, processedAt: true,
      lastAttemptAt: true, nextRetryAt: true, idempotencyKey: true,
      storeId: true,
    },
  })

  res.json({ events, meta: { count: events.length, hasMore: events.length === parseInt(limit) } })
})

// GET /api/webhooks/events/:id — full event with payload
router.get('/events/:id', async (req: AuthRequest, res) => {
  const ids = await orgStoreIds(req.orgId!)
  const event = await prisma.webhookEvent.findFirst({
    where: { id: req.params.id, storeId: { in: ids } },
  })
  if (!event) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  res.json({ event })
})

// POST /api/webhooks/events/:id/retry — manually retry a failed/dead event
router.post('/events/:id/retry', async (req: AuthRequest, res) => {
  const ids = await orgStoreIds(req.orgId!)
  const event = await prisma.webhookEvent.findFirst({ where: { id: req.params.id, storeId: { in: ids } } })
  if (!event) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  if (event.status === 'processed') { res.json({ skipped: true, reason: 'already processed' }); return }

  // Reset nextRetryAt to now so retry worker picks it up on next tick
  await prisma.webhookEvent.update({
    where: { id: event.id },
    data: { status: 'failed', nextRetryAt: new Date(Date.now() - 1000), error: null },
  })
  res.json({ queued: true, eventId: event.id })
})

// DELETE /api/webhooks/events/dead — purge all dead-letter events for this org
router.delete('/events/dead', async (req: AuthRequest, res) => {
  const ids = await orgStoreIds(req.orgId!)
  const { count } = await prisma.webhookEvent.deleteMany({
    where: { storeId: { in: ids }, status: 'dead' },
  })
  res.json({ deleted: count })
})

// GET /api/webhooks/registrations
router.get('/registrations', async (req: AuthRequest, res) => {
  const ids = await orgStoreIds(req.orgId!)
  const registrations = await prisma.webhookRegistration.findMany({
    where: { storeId: { in: ids } },
    include: { store: { select: { id: true, name: true, platform: true, domain: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ registrations })
})

// POST /api/webhooks/registrations/refresh — re-register all webhooks for active stores
router.post('/registrations/refresh', async (req: AuthRequest, res) => {
  const stores = await prisma.store.findMany({
    where: { organizationId: req.orgId!, isActive: true, accessToken: { not: null } },
  })
  const results = await Promise.allSettled(
    stores.map(s => registerStoreWebhooks(s.id, s.platform, s.domain ?? '', s.accessToken!))
  )
  const ok = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  res.json({ refreshed: ok, failed, total: stores.length })
})

export default router
