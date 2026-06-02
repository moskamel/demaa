import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

function periodToDays(period: string): number {
  return { today: 0, '7d': 7, week: 7, '30d': 30, month: 30, '90d': 90 }[period] ?? 30
}

// GET /analytics/overview
router.get('/overview', async (req: AuthRequest, res) => {
  const period = (req.query.period as string) || '30d'
  const days = periodToDays(period)
  const since = new Date()
  if (days === 0) since.setHours(0, 0, 0, 0)
  else since.setDate(since.getDate() - days)

  const store = await prisma.store.findFirst({ where: { organizationId: req.orgId, isActive: true } })
  if (!store) { res.json({ totalRevenue: 0, totalOrders: 0, pendingOrders: 0, avgOrderValue: 0 }); return }

  const orders = await prisma.order.findMany({ where: { storeId: store.id, placedAt: { gte: since } } })
  const completed = orders.filter(o => ['accepted', 'shipped', 'delivered'].includes(o.status))
  const totalRevenue = completed.reduce((s, o) => s + o.total, 0)
  const pending = orders.filter(o => o.status === 'pending').length

  // City breakdown
  const cityMap: Record<string, { orders: number; revenue: number }> = {}
  completed.forEach(o => {
    if (!cityMap[o.city]) cityMap[o.city] = { orders: 0, revenue: 0 }
    cityMap[o.city].orders++
    cityMap[o.city].revenue += o.total
  })

  // Payment breakdown
  const payMap: Record<string, number> = {}
  orders.forEach(o => { payMap[o.paymentMethod] = (payMap[o.paymentMethod] || 0) + 1 })

  res.json({
    period,
    totalOrders: orders.length,
    completedOrders: completed.length,
    pendingOrders: pending,
    rejectedOrders: orders.filter(o => o.status === 'rejected').length,
    totalRevenue: totalRevenue / 100,
    avgOrderValue: completed.length ? Math.round(totalRevenue / completed.length) / 100 : 0,
    topCities: Object.entries(cityMap)
      .map(([city, d]) => [city, { orders: d.orders, revenue: d.revenue / 100 }])
      .sort((a: any, b: any) => b[1].revenue - a[1].revenue)
      .slice(0, 6),
    paymentBreakdown: payMap,
  })
})

// GET /analytics/activity
router.get('/activity', async (req: AuthRequest, res) => {
  const logs = await prisma.activityLog.findMany({
    where: { organizationId: req.orgId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  res.json({ logs })
})

export default router
