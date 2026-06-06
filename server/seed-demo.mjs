// Demo seed script — fills the DB with realistic Arabic store data
// Run: node server/seed-demo.mjs

import { createClient } from '@libsql/client'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = createClient({ url: 'file:' + join(__dirname, 'dev.db') })

function cuid() {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

function hash(password) {
  return createHash('sha256').update(password).digest('hex')
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

// ── Data ──────────────────────────────────────────────────────────────────────

const CITIES = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'الطائف', 'أبها', 'تبوك', 'القصيم', 'حائل', 'جازان', 'نجران', 'الجوف']

const FIRST_NAMES = ['محمد', 'أحمد', 'عبدالله', 'عبدالرحمن', 'خالد', 'سلطان', 'فهد', 'سعد', 'ناصر', 'عمر', 'يوسف', 'إبراهيم', 'علي', 'حسن', 'مصطفى', 'عبدالعزيز', 'تركي', 'بندر', 'فيصل', 'نورة', 'سارة', 'لمى', 'ريم', 'هند', 'منى', 'دانا', 'رنا', 'شيماء', 'ليلى', 'أميرة']

const LAST_NAMES = ['الغامدي', 'العتيبي', 'القحطاني', 'الزهراني', 'الشهري', 'العمري', 'الدوسري', 'السبيعي', 'المطيري', 'الحربي', 'الشمري', 'العنزي', 'الرشيدي', 'البقمي', 'السلمي', 'الجهني', 'الرويلي', 'الصاعدي']

const PRODUCTS_DATA = [
  { name: 'عطر الأوقات الذهبية', category: 'عطور', price: 28900, stock: 45, sku: 'PRF-001' },
  { name: 'عطر ليلة الياسمين', category: 'عطور', price: 19900, stock: 3, sku: 'PRF-002' },
  { name: 'عطر مسك الفجر', category: 'عطور', price: 35000, stock: 28, sku: 'PRF-003' },
  { name: 'عطر عود الملوك', category: 'عطور', price: 75000, stock: 0, sku: 'PRF-004' },
  { name: 'سماعات لاسلكية ProSound X1', category: 'إلكترونيات', price: 18900, stock: 12, sku: 'ELEC-001' },
  { name: 'ساعة ذكية FitPro 3', category: 'إلكترونيات', price: 24900, stock: 2, sku: 'ELEC-002' },
  { name: 'شاحن لاسلكي سريع 65W', category: 'إلكترونيات', price: 8900, stock: 67, sku: 'ELEC-003' },
  { name: 'مكبر صوت بلوتوث مقاوم للماء', category: 'إلكترونيات', price: 12500, stock: 0, sku: 'ELEC-004' },
  { name: 'كريم مرطب الوجه الفاخر', category: 'عناية', price: 9500, stock: 89, sku: 'SKIN-001' },
  { name: 'سيروم فيتامين سي المركّز', category: 'عناية', price: 14900, stock: 4, sku: 'SKIN-002' },
  { name: 'غسول الوجه بالطين الأخضر', category: 'عناية', price: 6500, stock: 55, sku: 'SKIN-003' },
  { name: 'قميص أناقة الرجل', category: 'أزياء', price: 8900, stock: 34, sku: 'FASH-001' },
  { name: 'عباءة التميّز النسائية', category: 'أزياء', price: 17900, stock: 18, sku: 'FASH-002' },
  { name: 'حذاء رياضي CloudRun Pro', category: 'أزياء', price: 32000, stock: 9, sku: 'FASH-003' },
  { name: 'حقيبة جلدية كلاسيك', category: 'أزياء', price: 45000, stock: 1, sku: 'FASH-004' },
  { name: 'مجموعة أدوات القهوة المتخصص', category: 'منزل', price: 21900, stock: 22, sku: 'HOME-001' },
  { name: 'طقم وسائد قطن 1000 خيط', category: 'منزل', price: 11900, stock: 41, sku: 'HOME-002' },
  { name: 'مصباح طاولة LED ذكي', category: 'منزل', price: 7500, stock: 0, sku: 'HOME-003' },
  { name: 'مكملات بروتين واي 2كجم', category: 'رياضة', price: 16500, stock: 7, sku: 'SPORT-001' },
  { name: 'حصيرة يوغا مضادة للانزلاق', category: 'رياضة', price: 5900, stock: 63, sku: 'SPORT-002' },
]

const STATUSES = ['pending', 'pending', 'pending', 'accepted', 'accepted', 'shipped', 'shipped', 'delivered', 'delivered', 'delivered', 'rejected', 'cancelled']
const PAYMENT_METHODS = ['card', 'card', 'card', 'cash', 'tabby', 'tamara', 'stcpay']

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('🌱 Starting demo seed...\n')

// 1. User & Org
const userId = cuid()
const orgId = cuid()
const storeId = cuid()
const now = new Date().toISOString()

// Check if demo user already exists
const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: ['demo@deema.ai'] })
if (existing.rows.length > 0) {
  console.log('⚠️  Demo user already exists. Clearing old data first...')
  // Get org
  const mem = await db.execute({ sql: 'SELECT organizationId FROM team_memberships WHERE userId = ?', args: [existing.rows[0].id] })
  if (mem.rows.length > 0) {
    const existingOrgId = mem.rows[0].organizationId
    const stores = await db.execute({ sql: 'SELECT id FROM stores WHERE organizationId = ?', args: [existingOrgId] })
    for (const s of stores.rows) {
      await db.execute({ sql: 'DELETE FROM shipments WHERE orderId IN (SELECT id FROM orders WHERE storeId = ?)', args: [s.id] })
      await db.execute({ sql: 'DELETE FROM order_items WHERE orderId IN (SELECT id FROM orders WHERE storeId = ?)', args: [s.id] })
      await db.execute({ sql: 'DELETE FROM orders WHERE storeId = ?', args: [s.id] })
      await db.execute({ sql: 'DELETE FROM products WHERE storeId = ?', args: [s.id] })
    }
    await db.execute({ sql: 'DELETE FROM customers WHERE organizationId = ?', args: [existingOrgId] })
    await db.execute({ sql: 'DELETE FROM coupons WHERE organizationId = ?', args: [existingOrgId] })
    await db.execute({ sql: 'DELETE FROM notifications WHERE organizationId = ?', args: [existingOrgId] })
    await db.execute({ sql: 'DELETE FROM ai_memory WHERE organizationId = ?', args: [existingOrgId] })
    await db.execute({ sql: 'DELETE FROM conversations WHERE organizationId = ?', args: [existingOrgId] })
    await db.execute({ sql: 'DELETE FROM activity_logs WHERE organizationId = ?', args: [existingOrgId] })
    console.log('✅ Old data cleared\n')
  }
  // Use existing user/org
  const existingUserId = existing.rows[0].id
  const existingMem = await db.execute({ sql: 'SELECT organizationId FROM team_memberships WHERE userId = ?', args: [existingUserId] })
  const existingOrgId = existingMem.rows[0]?.organizationId

  await runSeed(existingUserId, existingOrgId)
} else {
  // Create new user
  await db.execute({
    sql: `INSERT INTO users (id, email, passwordHash, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [userId, 'demo@deema.ai', hash('demo1234'), 'أحمد التاجر', now, now],
  })

  await db.execute({
    sql: `INSERT INTO organizations (id, name, slug, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
    args: [orgId, 'متجر ديما التجريبي', 'deema-demo', now, now],
  })

  await db.execute({
    sql: `INSERT INTO team_memberships (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, ?)`,
    args: [cuid(), orgId, userId, 'OWNER', now],
  })

  await db.execute({
    sql: `INSERT INTO subscriptions (id, organizationId, planId, status, ordersUsed, ordersLimit, currentPeriodEnd, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [cuid(), orgId, 'growth', 'active', 0, 1000, daysAgo(-30), now, now],
  })

  console.log('✅ User created: demo@deema.ai / demo1234')
  await runSeed(userId, orgId)
}

async function runSeed(uId, oId) {
  const sId = cuid()

  // 2. Store
  await db.execute({
    sql: `INSERT INTO stores (id, organizationId, name, platform, domain, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [sId, oId, 'متجر الأناقة السعودية', 'shopify', 'anaga-ksa.myshopify.com', 1, now, now],
  })

  // activeStoreId column may not exist in this DB version — skip

  console.log('✅ Store created')

  // 3. Products
  const productIds = []
  for (const p of PRODUCTS_DATA) {
    const pid = cuid()
    productIds.push({ id: pid, name: p.name, price: p.price })
    await db.execute({
      sql: `INSERT INTO products (id, storeId, name, category, price, stock, sku, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [pid, sId, p.name, p.category, p.price, p.stock, p.sku, p.stock > 0 ? 1 : 1, now, now],
    })
  }
  console.log(`✅ ${PRODUCTS_DATA.length} products created`)

  // 4. Customers
  const customerIds = []
  const customerCount = 18
  for (let i = 0; i < customerCount; i++) {
    const cid = cuid()
    const name = `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`
    const city = rand(CITIES)
    const orders = randInt(1, 12)
    const spent = orders * randInt(10000, 80000)
    const segment = orders >= 8 ? 'vip' : orders >= 4 ? 'loyal' : orders >= 2 ? 'regular' : 'new'
    customerIds.push({ id: cid, name, city })
    await db.execute({
      sql: `INSERT INTO customers (id, organizationId, name, phone, email, city, segment, totalOrders, totalSpent, lastOrderAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [cid, oId, name, `05${randInt(10000000, 99999999)}`, `${name.replace(/\s/g, '').toLowerCase()}@example.com`, city, segment, orders, spent, daysAgo(randInt(1, 30)), daysAgo(randInt(30, 90)), now],
    })
  }
  console.log(`✅ ${customerCount} customers created`)

  // 5. Orders (120 orders over last 60 days)
  const orderCount = 120
  let orderNum = 10001
  for (let i = 0; i < orderCount; i++) {
    const oid = cuid()
    const customer = rand(customerIds)
    const status = rand(STATUSES)
    const payment = rand(PAYMENT_METHODS)
    const daysBack = randInt(0, 60)
    const placedDate = daysAgo(daysBack)
    const itemCount = randInt(1, 3)
    const riskScore = payment === 'cash' ? randInt(40, 90) : randInt(0, 30)

    // Calculate total from random products
    let total = 0
    const orderItems = []
    for (let j = 0; j < itemCount; j++) {
      const product = rand(productIds)
      const qty = randInt(1, 3)
      const itemTotal = product.price * qty
      total += itemTotal
      orderItems.push({ productId: product.id, name: product.name, qty, unitPrice: product.price, totalPrice: itemTotal })
    }

    const shippingFee = 1500
    total += shippingFee

    await db.execute({
      sql: `INSERT INTO orders (id, storeId, customerId, externalRef, customerName, customerPhone, city, status, paymentMethod, paymentStatus, subtotal, shippingFee, total, currency, riskScore, isNewCustomer, placedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [oid, sId, customer.id, String(orderNum++), customer.name, `05${randInt(10000000, 99999999)}`, customer.city, status, payment, status === 'delivered' ? 'paid' : 'pending', total - shippingFee, shippingFee, total, 'SAR', riskScore, i > customerCount ? 0 : 1, placedDate, placedDate, placedDate],
    })

    // Order items
    for (const item of orderItems) {
      await db.execute({
        sql: `INSERT INTO order_items (id, orderId, productId, name, qty, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [cuid(), oid, item.productId, item.name, item.qty, item.unitPrice, item.totalPrice],
      })
    }

    // Shipment for shipped/delivered orders
    if (status === 'shipped' || status === 'delivered') {
      const carriers = ['aramex', 'smsa', 'jtexpress']
      const carrier = rand(carriers)
      const tracking = `${carrier.toUpperCase().slice(0, 3)}${randInt(100000000, 999999999)}`
      await db.execute({
        sql: `INSERT INTO shipments (id, orderId, carrier, trackingNumber, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [cuid(), oid, carrier, tracking, status === 'delivered' ? 'delivered' : 'created', placedDate, placedDate],
      })
    }
  }
  console.log(`✅ ${orderCount} orders created with items and shipments`)

  // 6. Coupons
  const coupons = [
    { code: 'WELCOME20', type: 'percentage', value: 2000, maxUsage: 100, usageCount: 34 },
    { code: 'SUMMER15', type: 'percentage', value: 1500, maxUsage: 200, usageCount: 87 },
    { code: 'FLASH50', type: 'fixed', value: 5000, maxUsage: 50, usageCount: 50, isActive: false },
    { code: 'VIP30', type: 'percentage', value: 3000, maxUsage: 30, usageCount: 12 },
    { code: 'EID25', type: 'percentage', value: 2500, maxUsage: 500, usageCount: 203 },
  ]
  for (const c of coupons) {
    await db.execute({
      sql: `INSERT INTO coupons (id, organizationId, code, type, value, maxUsage, usageCount, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [cuid(), oId, c.code, c.type, c.value, c.maxUsage, c.usageCount, c.isActive !== false ? 1 : 0, daysAgo(randInt(5, 40))],
    })
  }
  console.log(`✅ ${coupons.length} coupons created`)

  // 7. Notifications
  const notifications = [
    { type: 'order_alert', priority: 'high', title: '⚠️ طلب مشبوه يحتاج مراجعة', body: 'طلب #10087 من الرياض — دفع كاش — مخاطرة 82%' },
    { type: 'stock_alert', priority: 'high', title: '🔴 نفد المخزون: عود الملوك', body: 'المنتج PRF-004 نفد تماماً. آخر 5 طلبات مرفوضة.' },
    { type: 'stock_alert', priority: 'medium', title: '🟡 مخزون منخفض: ساعة ذكية FitPro', body: 'باقي فقط 2 قطعة — أعد الطلب قبل النفاد' },
    { type: 'sale_milestone', priority: 'info', title: '🎉 وصلت 100 طلب هذا الشهر!', body: 'مبروك! تجاوزت هدف الشهر. إيراد: 48,320 ريال' },
    { type: 'order_alert', priority: 'medium', title: '📦 15 طلب معلق ينتظر قبولك', body: 'أقدم طلب منذ 6 ساعات — لا تتأخر' },
  ]
  for (const n of notifications) {
    await db.execute({
      sql: `INSERT INTO notifications (id, organizationId, type, priority, title, body, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [cuid(), oId, n.type, n.priority, n.title, n.body, 0, daysAgo(randInt(0, 3))],
    })
  }
  console.log(`✅ ${notifications.length} notifications created`)

  // 8. AI Memory
  const memories = [
    { key: 'top_city', value: 'الرياض', label: 'أكثر مدينة طلباً', confidence: 0.95 },
    { key: 'top_product', value: 'عطر الأوقات الذهبية', label: 'أكثر منتج مبيعاً', confidence: 0.9 },
    { key: 'avg_order_value', value: '285 ريال', label: 'متوسط قيمة الطلب', confidence: 0.88 },
    { key: 'peak_hours', value: '8 مساءً — 11 مساءً', label: 'أوقات الذروة', confidence: 0.82 },
    { key: 'cash_risk', value: 'طلبات الكاش من الرياض لديها نسبة إلغاء 34%', label: 'نمط المخاطرة', confidence: 0.76 },
  ]
  for (const m of memories) {
    await db.execute({
      sql: `INSERT INTO ai_memory (id, organizationId, key, value, label, confidence, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [cuid(), oId, m.key, m.value, m.label, m.confidence, now, now],
    })
  }
  console.log(`✅ AI memory seeded`)

  // 9. Activity log
  const activities = [
    'قبول 12 طلب معلق دفعة واحدة',
    'إنشاء كوبون خصم EID25 بقيمة 25%',
    'تحديث مخزون: سيروم فيتامين سي → 50 قطعة',
    'رفض طلب #10043 بسبب عنوان غير صحيح',
    'إنشاء 8 شحنات عبر Aramex',
    'إضافة منتج جديد: حصيرة يوغا',
    'تخفيض أسعار العطور بنسبة 10%',
  ]
  for (let i = 0; i < activities.length; i++) {
    await db.execute({
      sql: `INSERT INTO activity_logs (id, organizationId, userId, action, entity, entityId, summary, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [cuid(), oId, uId, 'manual', 'order', cuid(), activities[i], daysAgo(i)],
    })
  }
  console.log(`✅ Activity log seeded`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Demo seed complete!\n')
  console.log('🔑 Login:')
  console.log('   Email:    demo@deema.ai')
  console.log('   Password: demo1234')
  console.log('\n📊 Data summary:')
  console.log(`   🏪 1 store (Shopify — متجر الأناقة السعودية)`)
  console.log(`   📦 ${orderCount} orders (mixed statuses, last 60 days)`)
  console.log(`   🛍️  ${PRODUCTS_DATA.length} products (some out of stock)`)
  console.log(`   👥 ${customerCount} customers (VIP, loyal, new)`)
  console.log(`   🎟️  ${coupons.length} coupons`)
  console.log(`   🔔 ${notifications.length} notifications`)
  console.log('\n💬 Try asking the AI:')
  console.log('   • "وريني الطلبات المعلقة"')
  console.log('   • "كم مبيعات هذا الشهر؟"')
  console.log('   • "ما أكثر منتج مبيعاً؟"')
  console.log('   • "وريني المنتجات قليلة المخزون"')
  console.log('   • "اقبل كل الطلبات المعلقة"')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

process.exit(0)
