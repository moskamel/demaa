// ── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'accepted' | 'shipped' | 'delivered' | 'rejected' | 'cancelled'
export type PaymentMethod = 'card' | 'cash' | 'tabby' | 'tamara'

export interface Order {
  id: string
  customer: string
  phone: string
  city: string
  total: number
  status: OrderStatus
  payment: PaymentMethod
  items: { name: string; qty: number; price: number }[]
  createdAt: string
  address: string
  shipmentId?: string
  issue?: string
  // v3.0: Risk Scoring
  riskScore?: number           // 0–100
  suspiciousReason?: string    // human-readable reason
  isNewCustomer?: boolean
}

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  lowStockThreshold?: number
  category: string
  active: boolean
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  totalOrders: number
  totalSpent: number
}

export interface Coupon {
  code: string
  discount: number
  type: 'percent' | 'fixed'
  uses: number
  maxUses: number
  active: boolean
}

// ── v3.0: StoreInsights (AI Memory Layer) ───────────────────────────────────

export interface StoreInsight {
  key: string
  value: string
  confidence: number   // 0.0 → 1.0
  label: string        // human-readable description
  lastUpdated: string
}

export const STORE_INSIGHTS: StoreInsight[] = [
  { key: 'preferred_carrier', value: 'smsa', confidence: 0.92, label: 'شركة الشحن المفضلة', lastUpdated: 'منذ يومين' },
  { key: 'cod_rejection_threshold', value: '1000', confidence: 0.85, label: 'حد رفض الكاش (ج.م)', lastUpdated: 'منذ أسبوع' },
  { key: 'best_sales_day', value: 'friday', confidence: 0.78, label: 'أفضل يوم مبيعات', lastUpdated: 'منذ أسبوع' },
  { key: 'top_city', value: 'cairo', confidence: 0.95, label: 'أعلى مدينة مبيعاً', lastUpdated: 'اليوم' },
  { key: 'avg_order_value', value: '340', confidence: 0.99, label: 'متوسط قيمة الطلب', lastUpdated: 'اليوم' },
  { key: 'peak_hour', value: '21:00', confidence: 0.71, label: 'أوج ساعة الطلبات', lastUpdated: 'منذ 3 أيام' },
  { key: 'return_rate', value: '0.08', confidence: 0.88, label: 'معدل الإرجاع', lastUpdated: 'منذ أسبوع' },
  { key: 'top_product', value: 'عطر العود الملكي', confidence: 0.97, label: 'أكثر منتج مبيعاً', lastUpdated: 'اليوم' },
  { key: 'low_stock_risk', value: 'كريم الوجه,سماعة JBL', confidence: 0.99, label: 'منتجات خطر نفاد', lastUpdated: 'الآن' },
  { key: 'cash_ratio', value: '0.18', confidence: 0.91, label: 'نسبة الطلبات الكاش', lastUpdated: 'اليوم' },
]

// Helper to get insight value
export function getInsight(key: string): string | undefined {
  return STORE_INSIGHTS.find(i => i.key === key)?.value
}

// ── v3.0: Risk Scoring ───────────────────────────────────────────────────────

export function computeRiskScore(order: Omit<Order, 'riskScore' | 'suspiciousReason'>): { score: number; reason?: string } {
  let score = 0
  const reasons: string[] = []

  if (order.payment === 'cash') {
    score += 30
    reasons.push('كاش عند الاستلام')
    if (order.isNewCustomer) {
      score += 30
      reasons.push('عميل جديد')
    }
    if (order.total > 800) {
      score += 20
      reasons.push(`قيمة عالية (${order.total} ج.م)`)
    } else if (order.total > 500) {
      score += 10
    }
  }
  if (!order.address || order.address.length < 10) {
    score += 20
    reasons.push('عنوان غير مكتمل')
  }

  return { score: Math.min(score, 100), reason: reasons.length > 0 ? reasons.join(' · ') : undefined }
}

// ── v3.0: Feature Flags ──────────────────────────────────────────────────────

export const FEATURE_FLAGS = {
  whatsapp_beta: false,
  analytics_v2: false,
  embedded_mode: false,
  zid_integration: false,
  shopify_integration: false,
  team_management: true,   // Phase 2 enabled
  billing_automation: false,
  shipping_integrations: false,
  marketing_automation: false,
}

// ── v3.0: Usage Tracking ─────────────────────────────────────────────────────

export interface UsageRecord {
  month: string
  ordersProcessed: number
  productsUpdated: number
  messagesUsed: number
  aiTokensUsed: number
  planLimit: number
}

export const USAGE_RECORDS: UsageRecord[] = [
  { month: '2025-01', ordersProcessed: 543, productsUpdated: 18, messagesUsed: 287, aiTokensUsed: 124_000, planLimit: 1000 },
  { month: '2024-12', ordersProcessed: 891, productsUpdated: 34, messagesUsed: 412, aiTokensUsed: 198_000, planLimit: 1000 },
  { month: '2024-11', ordersProcessed: 734, productsUpdated: 22, messagesUsed: 356, aiTokensUsed: 167_000, planLimit: 1000 },
]

// ── Mock Orders ──────────────────────────────────────────────────────────────

export const ORDERS: Order[] = [
  { id: '10231', customer: 'محمد الحسيني', phone: '01012345678', city: 'القاهرة', total: 340, status: 'pending', payment: 'card', items: [{ name: 'عطر العود الملكي', qty: 1, price: 340 }], createdAt: '2025-01-15T06:12:00', address: 'حي المعادي، القاهرة', isNewCustomer: false },
  { id: '10232', customer: 'سارة علي', phone: '01112345678', city: 'الإسكندرية', total: 520, status: 'pending', payment: 'tabby', items: [{ name: 'سماعة JBL', qty: 1, price: 520 }], createdAt: '2025-01-15T06:45:00', address: 'حي سيدي بشر، الإسكندرية', isNewCustomer: false },
  { id: '10233', customer: 'كريم عبدالله', phone: '01212345678', city: 'القاهرة', total: 180, status: 'pending', payment: 'card', items: [{ name: 'كريم الوجه', qty: 2, price: 90 }], createdAt: '2025-01-15T07:10:00', address: 'حي مدينة نصر، القاهرة', isNewCustomer: false },
  { id: '10234', customer: 'فاطمة محمد', phone: '01512345678', city: 'الجيزة', total: 750, status: 'pending', payment: 'cash', items: [{ name: 'عطر العود الملكي', qty: 2, price: 340 }, { name: 'كريم الوجه', qty: 1, price: 90 }], createdAt: '2025-01-15T07:30:00', address: 'حي الدقي، الجيزة', issue: 'عميل يدفع كاش', isNewCustomer: true, riskScore: 80, suspiciousReason: 'كاش عند الاستلام · عميلة جديدة · قيمة 750 ج.م' },
  { id: '10235', customer: 'أحمد إبراهيم', phone: '01034567890', city: 'القاهرة', total: 290, status: 'pending', payment: 'card', items: [{ name: 'ساعة سمارت', qty: 1, price: 290 }], createdAt: '2025-01-15T07:55:00', address: 'حي مصر الجديدة، القاهرة', isNewCustomer: false },
  { id: '10236', customer: 'نورا مصطفى', phone: '01145678901', city: 'المنصورة', total: 430, status: 'pending', payment: 'tamara', items: [{ name: 'حقيبة جلد', qty: 1, price: 430 }], createdAt: '2025-01-15T08:15:00', address: 'شارع الجمهورية، المنصورة', isNewCustomer: false },
  { id: '10237', customer: 'عمر حسن', phone: '01256789012', city: 'القاهرة', total: 195, status: 'pending', payment: 'card', items: [{ name: 'كريم الوجه', qty: 1, price: 90 }, { name: 'عطر صغير', qty: 1, price: 105 }], createdAt: '2025-01-15T08:40:00', address: 'حي الزمالك، القاهرة', isNewCustomer: false },
  { id: '10238', customer: 'ريم خالد', phone: '01067890123', city: 'الإسكندرية', total: 680, status: 'pending', payment: 'card', items: [{ name: 'سماعة JBL', qty: 1, price: 520 }, { name: 'كيبل شحن', qty: 2, price: 80 }], createdAt: '2025-01-15T08:55:00', address: 'حي المنتزه، الإسكندرية', isNewCustomer: false },
  { id: '10239', customer: 'ياسر سامي', phone: '01178901234', city: 'الجيزة', total: 340, status: 'pending', payment: 'cash', items: [{ name: 'عطر العود الملكي', qty: 1, price: 340 }], createdAt: '2025-01-15T09:10:00', address: 'حي الهرم، الجيزة', issue: 'عميل يدفع كاش', isNewCustomer: true, riskScore: 60, suspiciousReason: 'كاش عند الاستلام · عميل جديد' },
  { id: '10240', customer: 'هند ماهر', phone: '01289012345', city: 'القاهرة', total: 840, status: 'pending', payment: 'tabby', items: [{ name: 'ساعة سمارت', qty: 2, price: 290 }, { name: 'كيبل شحن', qty: 2, price: 80 }], createdAt: '2025-01-15T09:25:00', address: 'حي التجمع الخامس، القاهرة', isNewCustomer: false },
  { id: '10241', customer: 'طارق سعيد', phone: '01090123456', city: 'القاهرة', total: 105, status: 'pending', payment: 'card', items: [{ name: 'عطر صغير', qty: 1, price: 105 }], createdAt: '2025-01-15T09:40:00', address: 'حي شبرا، القاهرة', isNewCustomer: false },
  { id: '10242', customer: 'منى يوسف', phone: '01101234567', city: 'الأقصر', total: 260, status: 'pending', payment: 'card', items: [{ name: 'حقيبة جلد صغيرة', qty: 1, price: 260 }], createdAt: '2025-01-15T09:50:00', address: 'شارع الكورنيش، الأقصر', isNewCustomer: false },

  // Accepted orders
  { id: '10220', customer: 'وليد نجيب', phone: '01212345679', city: 'القاهرة', total: 480, status: 'accepted', payment: 'card', items: [{ name: 'سماعة JBL', qty: 1, price: 520 }], createdAt: '2025-01-15T05:00:00', address: 'حي المقطم، القاهرة' },
  { id: '10221', customer: 'لمياء عادل', phone: '01023456780', city: 'الإسكندرية', total: 340, status: 'accepted', payment: 'card', items: [{ name: 'عطر العود الملكي', qty: 1, price: 340 }], createdAt: '2025-01-15T05:20:00', address: 'حي العجمي، الإسكندرية' },
  { id: '10222', customer: 'بدر فارس', phone: '01534567890', city: 'الإسماعيلية', total: 195, status: 'accepted', payment: 'tamara', items: [{ name: 'كريم الوجه', qty: 2, price: 90 }], createdAt: '2025-01-15T05:40:00', address: 'حي الإسماعيلية الجديدة' },

  // Shipped orders
  { id: '10210', customer: 'عمر جلال', phone: '01145678902', city: 'الإسماعيلية', total: 290, status: 'shipped', payment: 'card', items: [{ name: 'ساعة سمارت', qty: 1, price: 290 }], createdAt: '2025-01-14T10:00:00', address: 'شارع أحمد عرابي، الإسماعيلية', shipmentId: 'ARX-789012' },
  { id: '10211', customer: 'دانا حسام', phone: '01256789013', city: 'القاهرة', total: 430, status: 'shipped', payment: 'tabby', items: [{ name: 'حقيبة جلد', qty: 1, price: 430 }], createdAt: '2025-01-14T11:00:00', address: 'حي المهندسين، القاهرة', shipmentId: 'ARX-789013' },
  { id: '10212', customer: 'سلوى محمود', phone: '01067890124', city: 'الجيزة', total: 340, status: 'shipped', payment: 'card', items: [{ name: 'عطر العود الملكي', qty: 1, price: 340 }], createdAt: '2025-01-14T12:00:00', address: 'حي فيصل، الجيزة', shipmentId: 'SMSA-456789' },

  // Rejected
  { id: '10205', customer: 'ليلى رشدي', phone: '01189012345', city: 'الإسكندرية', total: 180, status: 'rejected', payment: 'cash', items: [{ name: 'كريم الوجه', qty: 2, price: 90 }], createdAt: '2025-01-14T08:00:00', address: 'حي كامب شيزار، الإسكندرية' },
]

// ── Mock Products ────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  { id: 'P001', name: 'عطر العود الملكي', sku: 'OUD-001', price: 340, stock: 24, lowStockThreshold: 10, category: 'عطور', active: true },
  { id: 'P002', name: 'سماعة JBL', sku: 'JBL-T520', price: 520, stock: 0, lowStockThreshold: 5, category: 'إلكترونيات', active: true },
  { id: 'P003', name: 'كريم الوجه', sku: 'CREAM-001', price: 90, stock: 8, lowStockThreshold: 15, category: 'عناية', active: true },
  { id: 'P004', name: 'ساعة سمارت', sku: 'WATCH-X1', price: 290, stock: 15, lowStockThreshold: 8, category: 'إلكترونيات', active: true },
  { id: 'P005', name: 'حقيبة جلد', sku: 'BAG-L01', price: 430, stock: 6, lowStockThreshold: 5, category: 'أزياء', active: true },
  { id: 'P006', name: 'عطر صغير', sku: 'OUD-002', price: 105, stock: 42, lowStockThreshold: 10, category: 'عطور', active: true },
  { id: 'P007', name: 'كيبل شحن', sku: 'CABLE-01', price: 40, stock: 60, lowStockThreshold: 20, category: 'إلكترونيات', active: true },
  { id: 'P008', name: 'حقيبة جلد صغيرة', sku: 'BAG-S01', price: 260, stock: 3, lowStockThreshold: 5, category: 'أزياء', active: true },
]

// ── Mock Analytics ───────────────────────────────────────────────────────────

export const ANALYTICS = {
  today: { orders: 47, revenue: 18_420, avgOrder: 392, topProduct: 'عطر العود الملكي' },
  week: { orders: 312, revenue: 124_680, avgOrder: 400, growth: 18, topProduct: 'عطر العود الملكي', topCity: 'القاهرة' },
  month: { orders: 1_204, revenue: 489_200, avgOrder: 406, growth: 24, topProduct: 'عطر العود الملكي', topCity: 'القاهرة' },
  byCity: [
    { city: 'القاهرة', orders: 18, revenue: 6_840 },
    { city: 'الإسكندرية', orders: 12, revenue: 4_920 },
    { city: 'الجيزة', orders: 8, revenue: 3_200 },
    { city: 'المنصورة', orders: 5, revenue: 2_150 },
    { city: 'الأقصر', orders: 4, revenue: 1_310 },
  ],
}

export const COUPONS: Coupon[] = [
  { code: 'WELCOME10', discount: 10, type: 'percent', uses: 45, maxUses: 100, active: true },
  { code: 'SAVE50', discount: 50, type: 'fixed', uses: 12, maxUses: 50, active: true },
  { code: 'SUMMER20', discount: 20, type: 'percent', uses: 50, maxUses: 50, active: false },
]

// ── Mock Connectors ──────────────────────────────────────────────────────────

export type ConnectorType = 'aramex' | 'smsa' | 'jt' | 'tabby' | 'tamara' | 'whatsapp' | 'meta_ads' | 'snapchat' | 'qoyod'
export type ConnectorStatus = 'connected' | 'expired' | 'error' | 'disconnected'

export interface Connector {
  type: ConnectorType
  name: string
  nameAr: string
  status: ConnectorStatus
  category: 'shipping' | 'payment' | 'messaging' | 'ads' | 'accounting'
  lastUsed?: string
  logo: string
}

export const CONNECTORS: Connector[] = [
  { type: 'aramex', name: 'Aramex', nameAr: 'أرامكس', status: 'connected', category: 'shipping', lastUsed: 'اليوم', logo: 'أ' },
  { type: 'smsa', name: 'SMSA', nameAr: 'SMSA', status: 'connected', category: 'shipping', lastUsed: 'أمس', logo: 'S' },
  { type: 'jt', name: 'J&T Express', nameAr: 'J&T', status: 'disconnected', category: 'shipping', logo: 'J' },
  { type: 'tabby', name: 'Tabby', nameAr: 'تابby', status: 'connected', category: 'payment', lastUsed: 'اليوم', logo: 'T' },
  { type: 'tamara', name: 'Tamara', nameAr: 'تمارا', status: 'expired', category: 'payment', logo: 'تم' },
  { type: 'whatsapp', name: 'WhatsApp Business', nameAr: 'واتساب', status: 'connected', category: 'messaging', lastUsed: 'منذ ساعة', logo: 'W' },
  { type: 'meta_ads', name: 'Meta Ads', nameAr: 'ميتا إعلانات', status: 'disconnected', category: 'ads', logo: 'M' },
  { type: 'snapchat', name: 'Snapchat Ads', nameAr: 'سناب إعلانات', status: 'disconnected', category: 'ads', logo: 'Sc' },
  { type: 'qoyod', name: 'Qoyod', nameAr: 'قيود', status: 'disconnected', category: 'accounting', logo: 'ق' },
]

// ── Mock Notifications ───────────────────────────────────────────────────────

export type NotifType = 'low_stock' | 'suspicious_order' | 'payment_failed' | 'pending_too_long' | 'weekly_report' | 'connector_expired' | 'orders_accepted' | 'shipment_created'
export type NotifPriority = 'urgent' | 'important' | 'info'

export interface Notification {
  id: string
  type: NotifType
  priority: NotifPriority
  title: string
  body: string
  readAt?: string
  createdAt: string
}

export const NOTIFICATIONS: Notification[] = [
  { id: 'N1', type: 'low_stock', priority: 'urgent', title: 'مخزون ينفد!', body: 'كريم الوجه — باقي 8 قطع فقط', createdAt: 'منذ 10 دقائق' },
  { id: 'N2', type: 'suspicious_order', priority: 'urgent', title: 'طلب يحتاج مراجعة', body: 'طلب #10234 من فاطمة — كاش 750 ج.م · عميلة جديدة', createdAt: 'منذ 18 دقيقة' },
  { id: 'N3', type: 'pending_too_long', priority: 'important', title: 'طلبات معلقة أكثر من ساعتين', body: '12 طلب في الانتظار منذ الصباح', createdAt: 'منذ 30 دقيقة' },
  { id: 'N4', type: 'connector_expired', priority: 'important', title: 'انتهت صلاحية تمارا', body: 'يحتاج تجديد الربط لاستمرار الدفع بالتقسيط', createdAt: 'منذ ساعتين' },
  { id: 'N5', type: 'weekly_report', priority: 'info', title: 'تقرير الأسبوع جاهز', body: '312 طلب · 124,680 ج.م · نمو 18%', createdAt: 'أمس', readAt: 'أمس' },
  { id: 'N6', type: 'shipment_created', priority: 'info', title: 'تم إنشاء 3 بوالص شحن', body: 'أرامكس · الطلبات 10210، 10211، 10212', createdAt: 'أمس', readAt: 'أمس' },
]

// ── Mock Team Members ─────────────────────────────────────────────────────────

export type TeamRole = 'admin' | 'order_manager' | 'customer_service'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  avatar: string
  joinedAt: string
  lastActive: string
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'T1', name: 'محمد الحسيني', email: 'm.husseini@noor.eg', role: 'admin', avatar: 'م', joinedAt: '2024-10-01', lastActive: 'الآن' },
  { id: 'T2', name: 'سارة علي', email: 's.ali@noor.eg', role: 'order_manager', avatar: 'س', joinedAt: '2024-11-15', lastActive: 'منذ ساعة' },
  { id: 'T3', name: 'كريم عبدالله', email: 'k.abdallah@noor.eg', role: 'customer_service', avatar: 'ك', joinedAt: '2025-01-01', lastActive: 'أمس' },
]

// ── Store state (mutable in-memory) ─────────────────────────────────────────

export const store = {
  orders: [...ORDERS] as Order[],
  products: [...PRODUCTS] as Product[],
  coupons: [...COUPONS] as Coupon[],
  activitiesLog: [] as { time: string; action: string; detail: string; before?: unknown; after?: unknown }[],

  getOrder: (id: string) => store.orders.find(o => o.id === id),
  getPendingOrders: () => store.orders.filter(o => o.status === 'pending'),
  getAcceptedOrders: () => store.orders.filter(o => o.status === 'accepted'),
  getShippedOrders: () => store.orders.filter(o => o.status === 'shipped'),
  getSuspiciousOrders: () => store.orders.filter(o => o.riskScore && o.riskScore >= 60),

  acceptOrder: (id: string) => {
    const o = store.orders.find(o => o.id === id)
    if (o) {
      const before = o.status
      o.status = 'accepted'
      store.activitiesLog.unshift({ time: now(), action: `قبول طلب #${id}`, detail: `${o.customer} — ${o.total} ج.م`, before: { status: before }, after: { status: 'accepted' } })
    }
    return o
  },

  rejectOrder: (id: string, reason = 'بناءً على طلب التاجر') => {
    const o = store.orders.find(o => o.id === id)
    if (o) {
      const before = o.status
      o.status = 'rejected'
      store.activitiesLog.unshift({ time: now(), action: `رفض طلب #${id}`, detail: `${o.customer} — السبب: ${reason}`, before: { status: before }, after: { status: 'rejected' } })
    }
    return o
  },

  shipOrder: (id: string) => {
    const o = store.orders.find(o => o.id === id)
    if (o && o.status === 'accepted') {
      o.status = 'shipped'
      o.shipmentId = `ARX-${Math.floor(800000 + Math.random() * 100000)}`
      store.activitiesLog.unshift({ time: now(), action: `شحن طلب #${id}`, detail: `بوليصة: ${o.shipmentId}`, before: { status: 'accepted' }, after: { status: 'shipped', shipmentId: o.shipmentId } })
    }
    return o
  },

  updateProductPrice: (id: string, newPrice: number) => {
    const p = store.products.find(p => p.id === id)
    if (p) {
      const old = p.price
      p.price = newPrice
      store.activitiesLog.unshift({ time: now(), action: `تحديث سعر ${p.name}`, detail: `من ${old} → ${newPrice} ج.م`, before: { price: old }, after: { price: newPrice } })
    }
    return p
  },

  addProduct: (product: Omit<Product, 'id'>) => {
    const p = { ...product, id: `P${String(store.products.length + 1).padStart(3, '0')}` }
    store.products.push(p)
    store.activitiesLog.unshift({ time: now(), action: `إضافة منتج ${p.name}`, detail: `${p.price} ج.م · مخزون: ${p.stock}` })
    return p
  },

  addCoupon: (coupon: Omit<Coupon, 'uses'>) => {
    const c = { ...coupon, uses: 0 }
    store.coupons.push(c)
    store.activitiesLog.unshift({ time: now(), action: `إنشاء كوبون ${c.code}`, detail: `خصم ${c.discount}${c.type === 'percent' ? '%' : ' ج.م'}` })
    return c
  },
}

function now() {
  return new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
}
