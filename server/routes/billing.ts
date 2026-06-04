// Subscription management routes
// POST /api/billing/upgrade — upgrade/change plan
// POST /api/billing/cancel — cancel subscription (sets to cancelled at period end)
// POST /api/billing/reactivate — reactivate cancelled subscription
// GET  /api/billing/status — full subscription status with days remaining

import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const PLAN_LIMITS: Record<string, { ordersLimit: number; stores: number; label: string; price: number }> = {
  free:       { ordersLimit: 100,      stores: 1, label: 'مجاني',      price: 0 },
  starter:    { ordersLimit: 500,      stores: 1, label: 'المبتدئ',    price: 99 },
  growth:     { ordersLimit: 2000,     stores: 2, label: 'النمو',      price: 249 },
  pro:        { ordersLimit: 10000,    stores: 3, label: 'الاحترافي',  price: 499 },
  enterprise: { ordersLimit: Infinity, stores: 99, label: 'المؤسسات', price: 999 },
}

// GET /api/billing/status
router.get('/status', async (req: AuthRequest, res) => {
  const sub = await prisma.subscription.findUnique({ where: { organizationId: req.orgId } })
  if (!sub) { res.json({ subscription: null }); return }

  const now = new Date()
  const daysRemaining = Math.max(0, Math.ceil((sub.currentPeriodEnd.getTime() - now.getTime()) / 86400000))
  const usagePercent = sub.ordersLimit > 0 ? Math.round((sub.ordersUsed / sub.ordersLimit) * 100) : 0
  const planMeta = PLAN_LIMITS[sub.planId] ?? PLAN_LIMITS.free

  res.json({
    subscription: {
      ...sub,
      daysRemaining,
      usagePercent,
      planLabel: planMeta.label,
      planPrice: planMeta.price,
      isExpiringSoon: daysRemaining <= 7,
      isExpired: daysRemaining === 0,
      isCancelled: sub.status === 'cancelled',
      canReactivate: sub.status === 'cancelled' && daysRemaining > 0,
    },
  })
})

// POST /api/billing/upgrade
router.post('/upgrade', async (req: AuthRequest, res) => {
  const { planId } = req.body as { planId: string }

  if (!planId || !PLAN_LIMITS[planId]) {
    res.status(400).json({ error: { code: 'INVALID_PLAN', message: 'الباقة المختارة غير صحيحة' } }); return
  }

  const sub = await prisma.subscription.findUnique({ where: { organizationId: req.orgId } })
  if (!sub) { res.status(404).json({ error: { code: 'NO_SUBSCRIPTION' } }); return }

  const limits = PLAN_LIMITS[planId]
  const updated = await prisma.subscription.update({
    where: { organizationId: req.orgId! },
    data: {
      planId,
      status: 'active',
      ordersLimit: limits.ordersLimit === Infinity ? 999999 : limits.ordersLimit,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })

  await prisma.activityLog.create({
    data: {
      organizationId: req.orgId!,
      userId: req.userId,
      action: 'plan_upgraded',
      entity: 'subscription',
      entityId: updated.id,
      summary: `ترقية الباقة إلى ${limits.label}`,
    },
  })

  res.json({ subscription: updated, message: `تم الترقية إلى باقة ${limits.label}` })
})

// POST /api/billing/cancel
router.post('/cancel', async (req: AuthRequest, res) => {
  const sub = await prisma.subscription.findUnique({ where: { organizationId: req.orgId } })
  if (!sub) { res.status(404).json({ error: { code: 'NO_SUBSCRIPTION' } }); return }

  if (sub.status === 'cancelled') {
    res.status(400).json({ error: { code: 'ALREADY_CANCELLED', message: 'الاشتراك ملغى بالفعل' } }); return
  }

  const updated = await prisma.subscription.update({
    where: { organizationId: req.orgId! },
    data: { status: 'cancelled' },
  })

  await prisma.activityLog.create({
    data: {
      organizationId: req.orgId!,
      userId: req.userId,
      action: 'subscription_cancelled',
      entity: 'subscription',
      entityId: updated.id,
      summary: 'إلغاء الاشتراك — يبقى الوصول حتى نهاية الفترة الحالية',
    },
  })

  const daysRemaining = Math.max(0, Math.ceil((updated.currentPeriodEnd.getTime() - Date.now()) / 86400000))
  res.json({ cancelled: true, daysRemaining, message: `تم إلغاء الاشتراك. سيستمر وصولك لمدة ${daysRemaining} يوم.` })
})

// POST /api/billing/reactivate
router.post('/reactivate', async (req: AuthRequest, res) => {
  const sub = await prisma.subscription.findUnique({ where: { organizationId: req.orgId } })
  if (!sub) { res.status(404).json({ error: { code: 'NO_SUBSCRIPTION' } }); return }

  if (sub.status !== 'cancelled') {
    res.status(400).json({ error: { code: 'NOT_CANCELLED', message: 'الاشتراك ليس ملغى' } }); return
  }

  const updated = await prisma.subscription.update({
    where: { organizationId: req.orgId! },
    data: {
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  res.json({ reactivated: true, subscription: updated, message: 'تم تفعيل الاشتراك مجدداً' })
})

export default router
