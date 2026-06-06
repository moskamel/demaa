import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /ai/memory
router.get('/memory', async (req: AuthRequest, res) => {
  const memory = await prisma.aiMemory.findMany({
    where: { organizationId: req.orgId },
    orderBy: { confidence: 'desc' },
  })
  res.json({ memory })
})

// PUT /ai/memory/:key
router.put('/memory/:key', async (req: AuthRequest, res) => {
  const { value, confidence, label } = req.body
  const item = await prisma.aiMemory.upsert({
    where: { organizationId_key: { organizationId: req.orgId!, key: req.params.key } },
    update: { value, ...(confidence !== undefined && { confidence }), ...(label && { label }) },
    create: { organizationId: req.orgId!, key: req.params.key, value, confidence: confidence ?? 0.5, label },
  })
  res.json({ item })
})

// POST /ai/seed-demo — fill current org with realistic demo data
router.post('/seed-demo', async (req: AuthRequest, res) => {
  const orgId = req.orgId!

  // Get or create a store for this org
  let store = await prisma.store.findFirst({ where: { organizationId: orgId, isActive: true } })
  if (!store) {
    store = await prisma.store.create({
      data: { organizationId: orgId, name: 'متجر الأناقة السعودية', platform: 'shopify', isActive: true },
    })
  }
  const storeId = store.id

  // Clear existing demo data
  const stores = await prisma.store.findMany({ where: { organizationId: orgId } })
  for (const s of stores) {
    await prisma.shipment.deleteMany({ where: { order: { storeId: s.id } } }).catch(() => {})
    await prisma.orderItem.deleteMany({ where: { order: { storeId: s.id } } })
    await prisma.order.deleteMany({ where: { storeId: s.id } })
    await prisma.product.deleteMany({ where: { storeId: s.id } })
  }
  await prisma.customer.deleteMany({ where: { organizationId: orgId } })
  await prisma.coupon.deleteMany({ where: { organizationId: orgId } })
  await prisma.notification.deleteMany({ where: { organizationId: orgId } })
  await prisma.aiMemory.deleteMany({ where: { organizationId: orgId } })

  const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const daysAgo = (n: number) => new Date(Date.now() - n * 86400000)

  const CITIES = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'الطائف', 'أبها', 'تبوك', 'القصيم', 'حائل']
  const NAMES = ['محمد الغامدي', 'أحمد العتيبي', 'عبدالله القحطاني', 'خالد الزهراني', 'سلطان الشهري', 'نورة السبيعي', 'سارة المطيري', 'ريم الحربي', 'فهد الشمري', 'عمر العنزي', 'يوسف الرشيدي', 'منى الجهني', 'دانا الرويلي', 'بندر الصاعدي', 'تركي السلمي', 'هند البقمي', 'إبراهيم الدوسري', 'علي العمري']

  // Products
  const productsData = [
    { name: 'عطر الأوقات الذهبية', category: 'عطور', price: 28900, stock: 45 },
    { name: 'عطر ليلة الياسمين', category: 'عطور', price: 19900, stock: 3 },
    { name: 'عطر عود الملوك', category: 'عطور', price: 75000, stock: 0 },
    { name: 'سماعات لاسلكية ProSound', category: 'إلكترونيات', price: 18900, stock: 12 },
    { name: 'ساعة ذكية FitPro 3', category: 'إلكترونيات', price: 24900, stock: 2 },
    { name: 'شاحن لاسلكي سريع 65W', category: 'إلكترونيات', price: 8900, stock: 67 },
    { name: 'مكبر صوت بلوتوث', category: 'إلكترونيات', price: 12500, stock: 0 },
    { name: 'كريم مرطب الوجه الفاخر', category: 'عناية', price: 9500, stock: 89 },
    { name: 'سيروم فيتامين سي', category: 'عناية', price: 14900, stock: 4 },
    { name: 'قميص أناقة الرجل', category: 'أزياء', price: 8900, stock: 34 },
    { name: 'عباءة التميّز النسائية', category: 'أزياء', price: 17900, stock: 18 },
    { name: 'حذاء رياضي CloudRun', category: 'أزياء', price: 32000, stock: 9 },
    { name: 'حقيبة جلدية كلاسيك', category: 'أزياء', price: 45000, stock: 1 },
    { name: 'مجموعة أدوات القهوة', category: 'منزل', price: 21900, stock: 22 },
    { name: 'مكملات بروتين واي 2كجم', category: 'رياضة', price: 16500, stock: 7 },
    { name: 'حصيرة يوغا مضادة للانزلاق', category: 'رياضة', price: 5900, stock: 63 },
  ]

  const products = await Promise.all(
    productsData.map(p => prisma.product.create({ data: { storeId, ...p, lowStockAlert: 5 } }))
  )

  // Customers
  const customersData = NAMES.map((name, i) => ({
    name,
    city: rand(CITIES),
    phone: `05${randInt(10000000, 99999999)}`,
    totalOrders: randInt(1, 15),
    totalSpent: randInt(5000, 200000),
    segment: i < 3 ? 'vip' : i < 7 ? 'loyal' : i < 12 ? 'regular' : 'new',
  }))
  const customers = await Promise.all(
    customersData.map(c => prisma.customer.create({ data: { organizationId: orgId, ...c } }))
  )

  // Orders (120)
  const STATUSES = ['pending', 'pending', 'pending', 'accepted', 'accepted', 'shipped', 'shipped', 'delivered', 'delivered', 'delivered', 'rejected', 'cancelled']
  const PAYMENTS = ['card', 'card', 'card', 'cash', 'tabby', 'tamara', 'stcpay']

  for (let i = 0; i < 120; i++) {
    const customer = rand(customers)
    const status = rand(STATUSES)
    const payment = rand(PAYMENTS)
    const product = rand(products)
    const qty = randInt(1, 3)
    const subtotal = product.price * qty
    const shipping = 1500
    const total = subtotal + shipping
    const riskScore = payment === 'cash' ? randInt(40, 90) : randInt(0, 25)
    const placedAt = daysAgo(randInt(0, 60))

    const order = await prisma.order.create({
      data: {
        storeId,
        customerId: customer.id,
        externalRef: String(10001 + i),
        customerName: customer.name,
        customerPhone: customer.phone ?? '',
        city: customer.city ?? rand(CITIES),
        status,
        paymentMethod: payment,
        paymentStatus: status === 'delivered' ? 'paid' : 'pending',
        subtotal,
        shippingFee: shipping,
        total,
        riskScore,
        placedAt,
        items: {
          create: [{ productId: product.id, name: product.name, qty, unitPrice: product.price, totalPrice: subtotal }],
        },
      },
    })

    if (status === 'shipped' || status === 'delivered') {
      const carriers = ['aramex', 'smsa', 'jtexpress']
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          carrier: rand(carriers),
          trackingNumber: `TRK${randInt(100000000, 999999999)}`,
          status: status === 'delivered' ? 'delivered' : 'created',
        },
      })
    }
  }

  // Coupons
  await prisma.coupon.createMany({
    data: [
      { organizationId: orgId, code: 'WELCOME20', type: 'percentage', value: 2000, maxUsage: 100, usageCount: 34 },
      { organizationId: orgId, code: 'SUMMER15', type: 'percentage', value: 1500, maxUsage: 200, usageCount: 87 },
      { organizationId: orgId, code: 'VIP30', type: 'percentage', value: 3000, maxUsage: 30, usageCount: 12 },
      { organizationId: orgId, code: 'EID25', type: 'percentage', value: 2500, maxUsage: 500, usageCount: 203 },
    ],
  })

  // Notifications
  await prisma.notification.createMany({
    data: [
      { organizationId: orgId, type: 'order_alert', priority: 'high', title: '⚠️ طلب مشبوه يحتاج مراجعة', body: 'طلب #10087 — دفع كاش — مخاطرة 82%' },
      { organizationId: orgId, type: 'stock_alert', priority: 'high', title: '🔴 نفد المخزون: عطر عود الملوك', body: 'المنتج نفد تماماً' },
      { organizationId: orgId, type: 'stock_alert', priority: 'medium', title: '🟡 مخزون منخفض: ساعة FitPro', body: 'باقي 2 قطعة فقط' },
      { organizationId: orgId, type: 'sale', priority: 'info', title: '🎉 وصلت 100 طلب هذا الشهر!', body: 'مبروك! تجاوزت هدف الشهر' },
    ],
  })

  // AI Memory
  await prisma.aiMemory.createMany({
    data: [
      { organizationId: orgId, key: 'top_city', value: 'الرياض', label: 'أكثر مدينة طلباً', confidence: 0.95 },
      { organizationId: orgId, key: 'top_product', value: 'عطر الأوقات الذهبية', label: 'أكثر منتج مبيعاً', confidence: 0.9 },
      { organizationId: orgId, key: 'avg_order_value', value: '285 ريال', label: 'متوسط قيمة الطلب', confidence: 0.88 },
      { organizationId: orgId, key: 'peak_hours', value: '8-11 مساءً', label: 'أوقات الذروة', confidence: 0.82 },
    ],
  })

  res.json({ success: true, message: 'تم تحميل البيانات التجريبية بنجاح', counts: { products: products.length, orders: 120, customers: customers.length } })
})

// GET /ai/usage
router.get('/usage', async (req: AuthRequest, res) => {
  const records = await prisma.usageRecord.findMany({
    where: { organizationId: req.orgId },
    orderBy: { month: 'desc' },
    take: 6,
  })
  const sub = await prisma.subscription.findUnique({ where: { organizationId: req.orgId } })
  res.json({ records, subscription: sub })
})

export default router
