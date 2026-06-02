import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res) => {
  const stores = await prisma.store.findMany({
    where: { organizationId: req.orgId },
    include: { _count: { select: { orders: true, products: true } } },
  })
  res.json({ stores })
})

router.post('/', async (req: AuthRequest, res) => {
  const { name, platform, domain } = req.body
  const store = await prisma.store.create({
    data: { organizationId: req.orgId!, name, platform, domain, isActive: true },
  })
  res.json({ store })
})

router.get('/:id', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
    include: { _count: { select: { orders: true, products: true } } },
  })
  if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  res.json({ store })
})

router.post('/:id/sync', async (req: AuthRequest, res) => {
  await prisma.store.updateMany({
    where: { id: req.params.id, organizationId: req.orgId },
    data: { syncStatus: 'syncing', lastSyncAt: new Date() },
  })
  // In production: queue sync job via BullMQ
  setTimeout(async () => {
    await prisma.store.updateMany({
      where: { id: req.params.id },
      data: { syncStatus: 'idle' },
    })
  }, 3000)
  res.json({ syncing: true })
})

export default router
