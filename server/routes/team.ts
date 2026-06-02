import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res) => {
  const memberships = await prisma.teamMembership.findMany({
    where: { organizationId: req.orgId },
    include: { user: { select: { id: true, name: true, email: true, lastLoginAt: true } } },
    orderBy: { createdAt: 'asc' },
  })
  const members = memberships.map(m => ({
    id: m.id,
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    avatar: m.user.name.charAt(0),
    joinedAt: m.createdAt,
    lastActive: m.user.lastLoginAt,
  }))
  res.json({ members })
})

router.patch('/:id/role', async (req: AuthRequest, res) => {
  const { role } = req.body
  if (!role) { res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'role is required' } }); return }
  const membership = await prisma.teamMembership.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
  })
  if (!membership) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  const updated = await prisma.teamMembership.update({
    where: { id: req.params.id },
    data: { role },
  })
  res.json({ membership: updated })
})

router.delete('/:id', async (req: AuthRequest, res) => {
  const membership = await prisma.teamMembership.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
  })
  if (!membership) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  await prisma.teamMembership.delete({ where: { id: req.params.id } })
  res.json({ deleted: true })
})

export default router
