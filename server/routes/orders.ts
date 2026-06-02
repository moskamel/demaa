import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

function getStoreWhere(orgId: string) {
  return { store: { organizationId: orgId } }
}

// GET /orders
router.get('/', async (req: AuthRequest, res) => {
  const { status, city, payment, riskMin, search, limit = '50', cursor } = req.query as Record<string, string>
  const where: Record<string, unknown> = { ...getStoreWhere(req.orgId!) }
  if (status && status !== 'all') where.status = status
  if (city) where.city = { contains: city }
  if (payment) where.paymentMethod = payment
  if (riskMin) where.riskScore = { gte: parseInt(riskMin) }
  if (search) where.OR = [
    { externalRef: { contains: search } },
    { customerName: { contains: search } },
    { customerPhone: { contains: search } },
  ]

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { placedAt: 'desc' },
    take: parseInt(limit),
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  })

  res.json({ orders, meta: { count: orders.length, hasMore: orders.length === parseInt(limit) } })
})

// GET /orders/stats
router.get('/stats', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({ where: { organizationId: req.orgId, isActive: true } })
  if (!store) { res.json({ pending: 0, accepted: 0, shipped: 0, delivered: 0, rejected: 0 }); return }

  const [pending, accepted, shipped, delivered, rejected] = await Promise.all([
    prisma.order.count({ where: { storeId: store.id, status: 'pending' } }),
    prisma.order.count({ where: { storeId: store.id, status: 'accepted' } }),
    prisma.order.count({ where: { storeId: store.id, status: 'shipped' } }),
    prisma.order.count({ where: { storeId: store.id, status: 'delivered' } }),
    prisma.order.count({ where: { storeId: store.id, status: 'rejected' } }),
  ])
  res.json({ pending, accepted, shipped, delivered, rejected })
})

// GET /orders/:id
router.get('/:id', async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, ...getStoreWhere(req.orgId!) },
    include: { items: true, shipments: true, customer: true },
  })
  if (!order) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'الطلب غير موجود' } }); return }
  res.json({ order })
})

// POST /orders/:id/accept
router.post('/:id/accept', async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, status: 'pending', ...getStoreWhere(req.orgId!) },
  })
  if (!order) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'الطلب غير موجود أو ليس معلقاً' } }); return }

  await prisma.order.update({ where: { id: order.id }, data: { status: 'accepted', acceptedAt: new Date() } })
  await logActivity(req.orgId!, req.userId, 'accept_order', 'order', order.id, `قبول الطلب #${order.externalRef || order.id}`)
  res.json({ accepted: true, orderId: order.id })
})

// POST /orders/:id/reject
router.post('/:id/reject', async (req: AuthRequest, res) => {
  const { reason } = req.body
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, status: 'pending', ...getStoreWhere(req.orgId!) },
  })
  if (!order) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'الطلب غير موجود' } }); return }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'rejected', rejectionReason: reason || 'رفض من المتجر', rejectedAt: new Date() },
  })
  await logActivity(req.orgId!, req.userId, 'reject_order', 'order', order.id, `رفض الطلب #${order.externalRef || order.id}${reason ? ` — ${reason}` : ''}`)
  res.json({ rejected: true, orderId: order.id })
})

// POST /orders/bulk-accept
router.post('/bulk-accept', async (req: AuthRequest, res) => {
  const { orderIds } = req.body as { orderIds: string[] }
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    res.status(400).json({ error: { code: 'INVALID', message: 'يرجى تحديد الطلبات' } }); return
  }

  const result = await prisma.order.updateMany({
    where: { id: { in: orderIds }, status: 'pending', ...getStoreWhere(req.orgId!) },
    data: { status: 'accepted', acceptedAt: new Date() },
  })

  await logActivity(req.orgId!, req.userId, 'bulk_accept', 'order', undefined, `قبول ${result.count} طلب`)
  res.json({ accepted: result.count })
})

async function logActivity(orgId: string, userId: string | undefined, action: string, entity: string, entityId: string | undefined, summary: string) {
  await prisma.activityLog.create({
    data: { organizationId: orgId, userId, action, entity, entityId, summary },
  })
}

export default router
