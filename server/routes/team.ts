import { Router } from 'express'
import bcrypt from 'bcryptjs'
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

const VALID_ROLES = ['ADMIN', 'ORDER_MANAGER', 'CUSTOMER_SERVICE']

router.patch('/:id/role', async (req: AuthRequest, res) => {
  const { role } = req.body
  if (!role || !VALID_ROLES.includes(role)) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'دور غير صالح' } }); return
  }
  const membership = await prisma.teamMembership.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
  })
  if (!membership) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }

  // Prevent downgrading self if last admin
  if (role !== 'ADMIN' && membership.userId === req.userId) {
    const adminCount = await prisma.teamMembership.count({ where: { organizationId: req.orgId, role: 'ADMIN' } })
    if (adminCount <= 1) {
      res.status(400).json({ error: { code: 'LAST_ADMIN', message: 'لا يمكن تغيير دورك أنت المسؤول الوحيد' } }); return
    }
  }

  const updated = await prisma.teamMembership.update({ where: { id: req.params.id }, data: { role } })
  res.json({ membership: updated })
})

router.delete('/:id', async (req: AuthRequest, res) => {
  const membership = await prisma.teamMembership.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
  })
  if (!membership) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }

  // Prevent removing last admin
  if (membership.role === 'ADMIN') {
    const adminCount = await prisma.teamMembership.count({ where: { organizationId: req.orgId, role: 'ADMIN' } })
    if (adminCount <= 1) {
      res.status(400).json({ error: { code: 'LAST_ADMIN', message: 'لا يمكن حذف المسؤول الوحيد' } }); return
    }
  }

  await prisma.teamMembership.delete({ where: { id: req.params.id } })
  res.json({ deleted: true })
})

// POST /team/invite — create or add existing user to org
router.post('/invite', async (req: AuthRequest, res) => {
  const { email, role = 'ORDER_MANAGER' } = req.body
  if (!email) { res.status(400).json({ error: { code: 'MISSING_EMAIL', message: 'البريد الإلكتروني مطلوب' } }); return }

  try {
    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      const tempPassword = Math.random().toString(36).slice(2, 10)
      const passwordHash = await bcrypt.hash(tempPassword, 12)
      user = await prisma.user.create({ data: { name: email.split('@')[0], email, passwordHash } })
    }

    // Check already a member
    const existing = await prisma.teamMembership.findUnique({
      where: { organizationId_userId: { organizationId: req.orgId!, userId: user.id } },
    })
    if (existing) {
      res.status(409).json({ error: { code: 'ALREADY_MEMBER', message: 'هذا المستخدم عضو بالفعل' } }); return
    }

    const membership = await prisma.teamMembership.create({
      data: { organizationId: req.orgId!, userId: user.id, role },
      include: { user: { select: { id: true, name: true, email: true, lastLoginAt: true } } },
    })

    res.json({
      member: {
        id: membership.id,
        userId: membership.userId,
        name: membership.user.name,
        email: membership.user.email,
        role: membership.role,
        avatar: membership.user.name.charAt(0),
        joinedAt: membership.createdAt,
        lastActive: membership.user.lastLoginAt,
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'خطأ في الخادم' } })
  }
})

export default router
