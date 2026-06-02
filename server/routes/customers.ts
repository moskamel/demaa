import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res) => {
  const { segment, city, search, limit = '50' } = req.query as Record<string, string>
  const where: Record<string, unknown> = { organizationId: req.orgId }
  if (segment && segment !== 'all') where.segment = segment
  if (city) where.city = { contains: city }
  if (search) where.OR = [{ name: { contains: search } }, { phone: { contains: search } }]

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { totalSpent: 'desc' },
    take: parseInt(limit),
  })
  res.json({ customers })
})

router.get('/:id', async (req: AuthRequest, res) => {
  const customer = await prisma.customer.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
    include: { orders: { orderBy: { placedAt: 'desc' }, take: 10 } },
  })
  if (!customer) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  res.json({ customer })
})

export default router
