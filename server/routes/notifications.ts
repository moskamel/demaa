import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res) => {
  const { unreadOnly, limit = '20' } = req.query as Record<string, string>
  const notifications = await prisma.notification.findMany({
    where: { organizationId: req.orgId, ...(unreadOnly === 'true' && { isRead: false }) },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit),
  })
  const unreadCount = await prisma.notification.count({ where: { organizationId: req.orgId, isRead: false } })
  res.json({ notifications, unreadCount })
})

router.post('/:id/read', async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, organizationId: req.orgId },
    data: { isRead: true, readAt: new Date() },
  })
  res.json({ read: true })
})

router.post('/read-all', async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: { organizationId: req.orgId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })
  res.json({ read: true })
})

export default router
