import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /settings/profile
router.get('/profile', async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl } })
})

// PATCH /settings/profile
router.patch('/profile', async (req: AuthRequest, res) => {
  const { name, phone, avatarUrl } = req.body
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'الاسم يجب أن يكون حرفين على الأقل' } }); return
  }
  if (phone !== undefined && phone !== '' && !/^[\d\s+\-()٠-٩]{7,20}$/.test(phone)) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'رقم الجوال غير صحيح' } }); return
  }
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name.trim()
  if (phone !== undefined) data.phone = phone || null
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl

  const user = await prisma.user.update({ where: { id: req.userId }, data })
  res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone } })
})

// POST /settings/change-password
router.post('/change-password', async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'يرجى إدخال كلمة المرور الحالية والجديدة' } })
    return
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' } })
    return
  }
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: { code: 'WRONG_PASSWORD', message: 'كلمة المرور الحالية غير صحيحة' } })
    return
  }
  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } })
  res.json({ changed: true })
})

// GET /settings/store
router.get('/store', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({ where: { organizationId: req.orgId, isActive: true } })
  const org = await prisma.organization.findUnique({ where: { id: req.orgId } })
  res.json({ store: store || null, org: org || null })
})

// PATCH /settings/store
router.patch('/store', async (req: AuthRequest, res) => {
  const { orgName, storeName } = req.body
  if (orgName) {
    await prisma.organization.update({ where: { id: req.orgId }, data: { name: orgName } })
  }
  if (storeName) {
    const store = await prisma.store.findFirst({ where: { organizationId: req.orgId, isActive: true } })
    if (store) await prisma.store.update({ where: { id: store.id }, data: { name: storeName } })
  }
  res.json({ updated: true })
})

export default router
