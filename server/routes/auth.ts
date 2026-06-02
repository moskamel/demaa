import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { signToken } from '../lib/jwt.js'
import type { AuthRequest } from '../middleware/auth.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  orgName: z.string().min(2),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /auth/signup
router.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'بيانات غير صحيحة', details: parsed.error.errors } })
    return
  }
  const { name, email, password, orgName } = parsed.data

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'البريد الإلكتروني مستخدم مسبقاً' } })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const slug = orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

    const org = await prisma.organization.create({ data: { name: orgName, slug } })
    const user = await prisma.user.create({ data: { name, email, passwordHash } })
    await prisma.teamMembership.create({ data: { organizationId: org.id, userId: user.id, role: 'ADMIN' } })

    // Default store
    await prisma.store.create({
      data: { organizationId: org.id, name: orgName, platform: 'salla', isActive: true },
    })

    // Subscription — unlimited pro plan
    await prisma.subscription.create({
      data: {
        organizationId: org.id,
        planId: 'pro',
        ordersLimit: 999999999,
        currentPeriodEnd: new Date(Date.now() + 365 * 86400000 * 100),
      },
    })

    const token = signToken({ userId: user.id, orgId: org.id, role: 'ADMIN' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email }, org: { id: org.id, name: org.name } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'خطأ في الخادم' } })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'بيانات غير صحيحة' } })
    return
  }
  const { email, password } = parsed.data

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' } })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' } })
      return
    }

    const membership = await prisma.teamMembership.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    })
    if (!membership) {
      res.status(403).json({ error: { code: 'NO_ORG', message: 'لا يوجد متجر مرتبط بهذا الحساب' } })
      return
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

    const token = signToken({ userId: user.id, orgId: membership.organizationId, role: membership.role })
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
      org: { id: membership.organizationId, name: membership.organization.name },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'خطأ في الخادم' } })
  }
})

// GET /auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'المستخدم غير موجود' } }); return }

    const membership = await prisma.teamMembership.findFirst({
      where: { userId: user.id, organizationId: req.orgId },
      include: { organization: true },
    })

    res.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl },
      org: membership ? { id: membership.organization.id, name: membership.organization.name } : null,
      role: membership?.role,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'خطأ في الخادم' } })
  }
})

// POST /auth/demo — instant demo login
router.post('/demo', async (_req, res) => {
  try {
    let demoUser = await prisma.user.findUnique({ where: { email: 'demo@deema.ai' } })
    if (!demoUser) {
      const passwordHash = await bcrypt.hash('demo1234', 12)
      const org = await prisma.organization.create({ data: { name: 'متجر النور', slug: 'demo-store-' + Date.now() } })
      demoUser = await prisma.user.create({ data: { name: 'تجريبي', email: 'demo@deema.ai', passwordHash } })
      await prisma.teamMembership.create({ data: { organizationId: org.id, userId: demoUser.id, role: 'ADMIN' } })

      const store = await prisma.store.create({
        data: { organizationId: org.id, name: 'متجر النور', platform: 'salla', isActive: true },
      })
      await prisma.subscription.create({
        data: { organizationId: org.id, planId: 'pro', ordersLimit: 999999999, currentPeriodEnd: new Date(Date.now() + 365 * 86400000 * 100) },
      })

      // Seed demo data
      await seedDemoData(org.id, store.id)
    }

    const membership = await prisma.teamMembership.findFirst({ where: { userId: demoUser.id } })
    const org = await prisma.organization.findUnique({ where: { id: membership!.organizationId } })
    const token = signToken({ userId: demoUser.id, orgId: membership!.organizationId, role: 'ADMIN' })

    res.json({ token, user: { id: demoUser.id, name: demoUser.name, email: demoUser.email }, org: { id: org!.id, name: org!.name } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'خطأ في الخادم' } })
  }
})

async function seedDemoData(orgId: string, storeId: string) {
  // Products
  const products = await Promise.all([
    prisma.product.create({ data: { storeId, name: 'عطر العود الملكي', price: 34000, stock: 12, category: 'عطور', lowStockAlert: 5 } }),
    prisma.product.create({ data: { storeId, name: 'سماعة JBL', price: 52000, stock: 3, category: 'إلكترونيات', lowStockAlert: 5 } }),
    prisma.product.create({ data: { storeId, name: 'كريم الوجه', price: 18000, stock: 0, category: 'عناية', lowStockAlert: 5 } }),
    prisma.product.create({ data: { storeId, name: 'حقيبة جلد', price: 45000, stock: 8, category: 'أزياء', lowStockAlert: 5 } }),
    prisma.product.create({ data: { storeId, name: 'ساعة ذكية', price: 89000, stock: 15, category: 'إلكترونيات', lowStockAlert: 5 } }),
  ])

  // Customers
  const customers = await Promise.all([
    prisma.customer.create({ data: { organizationId: orgId, name: 'محمد الأحمدي', phone: '0501234567', city: 'الرياض', segment: 'vip', totalOrders: 8, totalSpent: 272000 } }),
    prisma.customer.create({ data: { organizationId: orgId, name: 'سارة العمري', phone: '0551234567', city: 'جدة', segment: 'loyal', totalOrders: 4, totalSpent: 208000 } }),
    prisma.customer.create({ data: { organizationId: orgId, name: 'خالد المنصور', phone: '0561234567', city: 'الدمام', segment: 'regular', totalOrders: 2, totalSpent: 89000 } }),
    prisma.customer.create({ data: { organizationId: orgId, name: 'فاطمة الزهراني', phone: '0571234567', city: 'الرياض', segment: 'new', totalOrders: 0, totalSpent: 0 } }),
  ])

  // Orders
  const orderData = [
    { customerName: 'محمد الأحمدي', customerPhone: '0501234567', city: 'الرياض', total: 34000, paymentMethod: 'card', status: 'pending', isNewCustomer: false, riskScore: 10, customerId: customers[0].id },
    { customerName: 'سارة العمري', customerPhone: '0551234567', city: 'جدة', total: 52000, paymentMethod: 'tabby', status: 'pending', isNewCustomer: false, riskScore: 20, customerId: customers[1].id },
    { customerName: 'خالد المنصور', customerPhone: '0561234567', city: 'الدمام', total: 89000, paymentMethod: 'card', status: 'pending', isNewCustomer: false, riskScore: 15, customerId: customers[2].id },
    { customerName: 'فاطمة الزهراني', customerPhone: '0571234567', city: 'الرياض', total: 75000, paymentMethod: 'cash', status: 'pending', isNewCustomer: true, riskScore: 80, customerId: customers[3].id },
    { customerName: 'عبدالله السعيد', customerPhone: '0531234567', city: 'مكة', total: 18000, paymentMethod: 'card', status: 'accepted', isNewCustomer: false, riskScore: 5 },
    { customerName: 'نورا الحربي', customerPhone: '0541234567', city: 'جدة', total: 45000, paymentMethod: 'tamara', status: 'accepted', isNewCustomer: false, riskScore: 10 },
    { customerName: 'أحمد القحطاني', customerPhone: '0511234567', city: 'الرياض', total: 34000, paymentMethod: 'card', status: 'shipped', isNewCustomer: false, riskScore: 5, shipmentId: 'SMSA1234567890' },
    { customerName: 'منى الشهري', customerPhone: '0521234567', city: 'الطائف', total: 52000, paymentMethod: 'card', status: 'delivered', isNewCustomer: false, riskScore: 0 },
  ]

  for (const [i, od] of orderData.entries()) {
    const product = products[i % products.length]
    await prisma.order.create({
      data: {
        storeId,
        externalRef: `10${230 + i}`,
        customerId: od.customerId,
        customerName: od.customerName,
        customerPhone: od.customerPhone,
        city: od.city,
        total: od.total,
        paymentMethod: od.paymentMethod,
        status: od.status,
        isNewCustomer: od.isNewCustomer,
        riskScore: od.riskScore,
        shipmentId: od.shipmentId,
        placedAt: new Date(Date.now() - i * 3600000),
        items: {
          create: [{ productId: product.id, name: product.name, qty: 1, unitPrice: od.total, totalPrice: od.total }],
        },
      },
    })
  }

  // AI Memory
  const memoryItems = [
    { key: 'preferred_carrier', value: 'smsa', confidence: 0.92, label: 'شركة الشحن المفضلة' },
    { key: 'top_city', value: 'الرياض', confidence: 0.95, label: 'أعلى مدينة مبيعاً' },
    { key: 'best_sales_day', value: 'الجمعة', confidence: 0.78, label: 'أفضل يوم مبيعات' },
    { key: 'avg_order_value', value: '487', confidence: 0.99, label: 'متوسط قيمة الطلب (ر.س)' },
    { key: 'peak_hour', value: '21:00', confidence: 0.71, label: 'أعلى ساعة بيع' },
    { key: 'cash_ratio', value: '18%', confidence: 0.91, label: 'نسبة طلبات الكاش' },
  ]
  for (const m of memoryItems) {
    await prisma.aiMemory.create({ data: { organizationId: orgId, ...m } })
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      { organizationId: orgId, type: 'NEW_ORDER', priority: 'urgent', title: '4 طلبات جديدة بانتظار موافقتك', body: 'آخر طلب قبل 5 دقائق' },
      { organizationId: orgId, type: 'LOW_STOCK', priority: 'important', title: 'مخزون منخفض: كريم الوجه', body: 'نفد تماماً من المخزون' },
      { organizationId: orgId, type: 'RISK_ALERT', priority: 'important', title: 'طلب مشبوه #10233', body: 'كاش عند الاستلام · عميلة جديدة · قيمة 750 ر.س' },
    ],
  })

  // Coupons
  await prisma.coupon.createMany({
    data: [
      { organizationId: orgId, code: 'WELCOME20', type: 'percentage', value: 2000, minOrder: 15000, maxUsage: 100 },
      { organizationId: orgId, code: 'SUMMER50', type: 'fixed', value: 5000, minOrder: 30000, maxUsage: 50, usageCount: 18 },
    ],
  })
}

export default router
