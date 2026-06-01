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
}

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
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

// ── Mock Orders ──────────────────────────────────────────────────────────────

export const ORDERS: Order[] = [
  { id: '10231', customer: 'محمد الأحمدي', phone: '0501234567', city: 'الرياض', total: 340, status: 'pending', payment: 'card', items: [{ name: 'عطر العود الملكي', qty: 1, price: 340 }], createdAt: '2025-01-15T06:12:00', address: 'حي النزهة، الرياض', issue: undefined },
  { id: '10232', customer: 'سارة العمري', phone: '0551234567', city: 'جدة', total: 520, status: 'pending', payment: 'tabby', items: [{ name: 'سماعة JBL', qty: 1, price: 520 }], createdAt: '2025-01-15T06:45:00', address: 'حي الزهراء، جدة' },
  { id: '10233', customer: 'عبدالله الشمري', phone: '0561234567', city: 'الرياض', total: 180, status: 'pending', payment: 'card', items: [{ name: 'كريم الوجه', qty: 2, price: 90 }], createdAt: '2025-01-15T07:10:00', address: 'حي العليا، الرياض' },
  { id: '10234', customer: 'فاطمة القحطاني', phone: '0571234567', city: 'الدمام', total: 750, status: 'pending', payment: 'cash', items: [{ name: 'عطر العود الملكي', qty: 2, price: 340 }, { name: 'كريم الوجه', qty: 1, price: 90 }], createdAt: '2025-01-15T07:30:00', address: 'حي الشاطئ، الدمام', issue: 'عميل يدفع كاش' },
  { id: '10235', customer: 'خالد المطيري', phone: '0581234567', city: 'الرياض', total: 290, status: 'pending', payment: 'card', items: [{ name: 'ساعة سمارت', qty: 1, price: 290 }], createdAt: '2025-01-15T07:55:00', address: 'حي الملقا، الرياض' },
  { id: '10236', customer: 'نورة السبيعي', phone: '0591234567', city: 'مكة', total: 430, status: 'pending', payment: 'tamara', items: [{ name: 'حقيبة جلد', qty: 1, price: 430 }], createdAt: '2025-01-15T08:15:00', address: 'حي العزيزية، مكة' },
  { id: '10237', customer: 'أحمد الدوسري', phone: '0541234567', city: 'الرياض', total: 195, status: 'pending', payment: 'card', items: [{ name: 'كريم الوجه', qty: 1, price: 90 }, { name: 'عطر صغير', qty: 1, price: 105 }], createdAt: '2025-01-15T08:40:00', address: 'حي السليمانية، الرياض' },
  { id: '10238', customer: 'ريم الزهراني', phone: '0531234567', city: 'جدة', total: 680, status: 'pending', payment: 'card', items: [{ name: 'سماعة JBL', qty: 1, price: 520 }, { name: 'كيبل شحن', qty: 2, price: 80 }], createdAt: '2025-01-15T08:55:00', address: 'حي الروضة، جدة' },
  { id: '10239', customer: 'ماجد العتيبي', phone: '0521234567', city: 'الدمام', total: 340, status: 'pending', payment: 'cash', items: [{ name: 'عطر العود الملكي', qty: 1, price: 340 }], createdAt: '2025-01-15T09:10:00', address: 'حي الفيصلية، الدمام', issue: 'عميل يدفع كاش' },
  { id: '10240', customer: 'هند الحربي', phone: '0511234567', city: 'الرياض', total: 840, status: 'pending', payment: 'tabby', items: [{ name: 'ساعة سمارت', qty: 2, price: 290 }, { name: 'كيبل شحن', qty: 2, price: 80 }], createdAt: '2025-01-15T09:25:00', address: 'حي الورود، الرياض' },
  { id: '10241', customer: 'تركي الرشيدي', phone: '0501111111', city: 'الرياض', total: 105, status: 'pending', payment: 'card', items: [{ name: 'عطر صغير', qty: 1, price: 105 }], createdAt: '2025-01-15T09:40:00', address: 'حي النرجس، الرياض' },
  { id: '10242', customer: 'منى الجهني', phone: '0502222222', city: 'المدينة', total: 260, status: 'pending', payment: 'card', items: [{ name: 'حقيبة جلد صغيرة', qty: 1, price: 260 }], createdAt: '2025-01-15T09:50:00', address: 'حي العزيزية، المدينة' },

  // Accepted orders
  { id: '10220', customer: 'وليد الغامدي', phone: '0503333333', city: 'الرياض', total: 480, status: 'accepted', payment: 'card', items: [{ name: 'سماعة JBL', qty: 1, price: 520 }], createdAt: '2025-01-15T05:00:00', address: 'حي الياسمين، الرياض' },
  { id: '10221', customer: 'لمياء السلمي', phone: '0504444444', city: 'جدة', total: 340, status: 'accepted', payment: 'card', items: [{ name: 'عطر العود الملكي', qty: 1, price: 340 }], createdAt: '2025-01-15T05:20:00', address: 'حي الحمراء، جدة' },
  { id: '10222', customer: 'بدر القرني', phone: '0505555555', city: 'أبها', total: 195, status: 'accepted', payment: 'tamara', items: [{ name: 'كريم الوجه', qty: 2, price: 90 }], createdAt: '2025-01-15T05:40:00', address: 'حي النور، أبها' },

  // Shipped orders
  { id: '10210', customer: 'عمر الأسمري', phone: '0506666666', city: 'الطائف', total: 290, status: 'shipped', payment: 'card', items: [{ name: 'ساعة سمارت', qty: 1, price: 290 }], createdAt: '2025-01-14T10:00:00', address: 'حي الهدا، الطائف', shipmentId: 'ARX-789012' },
  { id: '10211', customer: 'دانا الحازمي', phone: '0507777777', city: 'الرياض', total: 430, status: 'shipped', payment: 'tabby', items: [{ name: 'حقيبة جلد', qty: 1, price: 430 }], createdAt: '2025-01-14T11:00:00', address: 'حي المروج، الرياض', shipmentId: 'ARX-789013' },
  { id: '10212', customer: 'سلطان الشهري', phone: '0508888888', city: 'الدمام', total: 340, status: 'shipped', payment: 'card', items: [{ name: 'عطر العود الملكي', qty: 1, price: 340 }], createdAt: '2025-01-14T12:00:00', address: 'حي الراكة، الدمام', shipmentId: 'SMSA-456789' },

  // Rejected
  { id: '10205', customer: 'ليلى الحارثي', phone: '0509999999', city: 'جدة', total: 180, status: 'rejected', payment: 'cash', items: [{ name: 'كريم الوجه', qty: 2, price: 90 }], createdAt: '2025-01-14T08:00:00', address: 'حي الجامعة، جدة' },
]

// ── Mock Products ────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  { id: 'P001', name: 'عطر العود الملكي', sku: 'OUD-001', price: 340, stock: 24, category: 'عطور', active: true },
  { id: 'P002', name: 'سماعة JBL', sku: 'JBL-T520', price: 520, stock: 0, category: 'إلكترونيات', active: true },
  { id: 'P003', name: 'كريم الوجه', sku: 'CREAM-001', price: 90, stock: 8, category: 'عناية', active: true },
  { id: 'P004', name: 'ساعة سمارت', sku: 'WATCH-X1', price: 290, stock: 15, category: 'إلكترونيات', active: true },
  { id: 'P005', name: 'حقيبة جلد', sku: 'BAG-L01', price: 430, stock: 6, category: 'أزياء', active: true },
  { id: 'P006', name: 'عطر صغير', sku: 'OUD-002', price: 105, stock: 42, category: 'عطور', active: true },
  { id: 'P007', name: 'كيبل شحن', sku: 'CABLE-01', price: 40, stock: 60, category: 'إلكترونيات', active: true },
  { id: 'P008', name: 'حقيبة جلد صغيرة', sku: 'BAG-S01', price: 260, stock: 3, category: 'أزياء', active: true },
]

// ── Mock Analytics ───────────────────────────────────────────────────────────

export const ANALYTICS = {
  today: { orders: 47, revenue: 18_420, avgOrder: 392, topProduct: 'عطر العود الملكي' },
  week: { orders: 312, revenue: 124_680, avgOrder: 400, growth: 18, topProduct: 'عطر العود الملكي', topCity: 'الرياض' },
  month: { orders: 1_204, revenue: 489_200, avgOrder: 406, growth: 24, topProduct: 'عطر العود الملكي', topCity: 'الرياض' },
  byCity: [
    { city: 'الرياض', orders: 18, revenue: 6_840 },
    { city: 'جدة', orders: 12, revenue: 4_920 },
    { city: 'الدمام', orders: 8, revenue: 3_200 },
    { city: 'مكة', orders: 5, revenue: 2_150 },
    { city: 'المدينة', orders: 4, revenue: 1_310 },
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
  { id: 'N2', type: 'suspicious_order', priority: 'urgent', title: 'طلب يحتاج مراجعة', body: 'طلب #10234 من فاطمة — كاش 750 ر.س · عميلة جديدة', createdAt: 'منذ 18 دقيقة' },
  { id: 'N3', type: 'pending_too_long', priority: 'important', title: 'طلبات معلقة أكثر من ساعتين', body: '12 طلب في الانتظار منذ الصباح', createdAt: 'منذ 30 دقيقة' },
  { id: 'N4', type: 'connector_expired', priority: 'important', title: 'انتهت صلاحية تمارا', body: 'يحتاج تجديد الربط لاستمرار الدفع بالتقسيط', createdAt: 'منذ ساعتين' },
  { id: 'N5', type: 'weekly_report', priority: 'info', title: 'تقرير الأسبوع جاهز', body: '312 طلب · 124,680 ر.س · نمو 18%', createdAt: 'أمس', readAt: 'أمس' },
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
  { id: 'T1', name: 'محمد العتيبي', email: 'm.otaibi@noor.sa', role: 'admin', avatar: 'م', joinedAt: '2024-10-01', lastActive: 'الآن' },
  { id: 'T2', name: 'سارة الغامدي', email: 's.ghamdi@noor.sa', role: 'order_manager', avatar: 'س', joinedAt: '2024-11-15', lastActive: 'منذ ساعة' },
  { id: 'T3', name: 'نواف الشمري', email: 'n.shamri@noor.sa', role: 'customer_service', avatar: 'ن', joinedAt: '2025-01-01', lastActive: 'أمس' },
]

// ── Store state (mutable in-memory) ─────────────────────────────────────────

export const store = {
  orders: [...ORDERS] as Order[],
  products: [...PRODUCTS] as Product[],
  coupons: [...COUPONS] as Coupon[],
  activitiesLog: [] as { time: string; action: string; detail: string }[],

  getOrder: (id: string) => store.orders.find(o => o.id === id),
  getPendingOrders: () => store.orders.filter(o => o.status === 'pending'),
  getAcceptedOrders: () => store.orders.filter(o => o.status === 'accepted'),
  getShippedOrders: () => store.orders.filter(o => o.status === 'shipped'),

  acceptOrder: (id: string) => {
    const o = store.orders.find(o => o.id === id)
    if (o) {
      o.status = 'accepted'
      store.activitiesLog.unshift({ time: now(), action: `قبول طلب #${id}`, detail: `${o.customer} — ${o.total} ر.س` })
    }
    return o
  },

  rejectOrder: (id: string, reason = 'بناءً على طلب التاجر') => {
    const o = store.orders.find(o => o.id === id)
    if (o) {
      o.status = 'rejected'
      store.activitiesLog.unshift({ time: now(), action: `رفض طلب #${id}`, detail: `${o.customer} — السبب: ${reason}` })
    }
    return o
  },

  shipOrder: (id: string) => {
    const o = store.orders.find(o => o.id === id)
    if (o && o.status === 'accepted') {
      o.status = 'shipped'
      o.shipmentId = `ARX-${Math.floor(800000 + Math.random() * 100000)}`
      store.activitiesLog.unshift({ time: now(), action: `شحن طلب #${id}`, detail: `بوليصة: ${o.shipmentId}` })
    }
    return o
  },

  updateProductPrice: (id: string, newPrice: number) => {
    const p = store.products.find(p => p.id === id)
    if (p) {
      const old = p.price
      p.price = newPrice
      store.activitiesLog.unshift({ time: now(), action: `تحديث سعر ${p.name}`, detail: `من ${old} → ${newPrice} ر.س` })
    }
    return p
  },

  addProduct: (product: Omit<Product, 'id'>) => {
    const p = { ...product, id: `P${String(store.products.length + 1).padStart(3, '0')}` }
    store.products.push(p)
    store.activitiesLog.unshift({ time: now(), action: `إضافة منتج ${p.name}`, detail: `${p.price} ر.س · مخزون: ${p.stock}` })
    return p
  },

  addCoupon: (coupon: Omit<Coupon, 'uses'>) => {
    const c = { ...coupon, uses: 0 }
    store.coupons.push(c)
    store.activitiesLog.unshift({ time: now(), action: `إنشاء كوبون ${c.code}`, detail: `خصم ${c.discount}${c.type === 'percent' ? '%' : ' ر.س'}` })
    return c
  },
}

function now() {
  return new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
}
