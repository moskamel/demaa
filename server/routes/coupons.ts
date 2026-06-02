import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res) => {
  const coupons = await prisma.coupon.findMany({
    where: { organizationId: req.orgId },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ coupons })
})

router.post('/', async (req: AuthRequest, res) => {
  const { code, type, value, minOrder, maxUsage, expiresAt } = req.body
  if (!code || !type || value == null) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'code, type, and value are required' } })
    return
  }
  const coupon = await prisma.coupon.create({
    data: {
      organizationId: req.orgId!,
      code: code.toUpperCase(),
      type,
      value: parseInt(value),
      minOrder: minOrder ? parseInt(minOrder) : null,
      maxUsage: maxUsage ? parseInt(maxUsage) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })
  res.json({ coupon })
})

router.patch('/:id', async (req: AuthRequest, res) => {
  const coupon = await prisma.coupon.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
  })
  if (!coupon) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  const updated = await prisma.coupon.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json({ coupon: updated })
})

router.delete('/:id', async (req: AuthRequest, res) => {
  const coupon = await prisma.coupon.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
  })
  if (!coupon) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  await prisma.coupon.delete({ where: { id: req.params.id } })
  res.json({ deleted: true })
})

export default router
