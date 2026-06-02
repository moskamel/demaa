// ── Intent detection for Arabic e-commerce commands ──────────────────────────
// Maps natural Arabic text to structured intents + entities

export type Intent =
  | 'get_summary'
  | 'get_pending_orders'
  | 'get_accepted_orders'
  | 'get_shipped_orders'
  | 'get_order_detail'
  | 'accept_orders'
  | 'accept_single_order'
  | 'reject_order'
  | 'filter_orders_city'
  | 'create_shipment'
  | 'track_shipment'
  | 'get_stock'
  | 'get_products'
  | 'add_product'
  | 'update_price'
  | 'get_analytics'
  | 'create_coupon'
  | 'send_message'
  | 'switch_store'
  | 'out_of_scope'
  | 'unknown'
  | 'greeting'
  | 'confirm'
  | 'cancel'
  | 'get_activity_log'

export interface ParsedIntent {
  intent: Intent
  entities: {
    orderId?: string
    city?: string
    productName?: string
    price?: number
    percent?: number
    couponCode?: string
    discountAmount?: number
    discountType?: 'percent' | 'fixed'
    storeName?: string
    quantity?: number
    customerName?: string
    message?: string
    period?: 'today' | 'week' | 'month'
    filter?: 'cash' | 'card' | 'tabby' | 'tamara'
    productId?: string
  }
  raw: string
}

// Order IDs in text: #10231 or ١٠٢٣١
function extractOrderId(text: string): string | undefined {
  const m = text.match(/#(\d+)/) || text.match(/رقم\s+(\d+)/) || text.match(/طلب\s+(\d+)/)
  if (m) return m[1]
  // Arabic-Indic digits
  const arabic = text.match(/[٠-٩]{4,5}/)
  if (arabic) return arabic[0].replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

function extractPrice(text: string): number | undefined {
  const m = text.match(/(\d+)\s*(ج\.م|جنيه|ج\.?م)?/)
  if (m) return parseInt(m[1])
}

function extractPercent(text: string): number | undefined {
  const m = text.match(/(\d+)\s*%/) || text.match(/(\d+)\s*بالمئة/) || text.match(/(\d+)\s*بالميه/)
  if (m) return parseInt(m[1])
}

function extractCity(text: string): string | undefined {
  const cities = ['القاهرة', 'الإسكندرية', 'الجيزة', 'المنصورة', 'الإسماعيلية', 'الأقصر', 'أسوان', 'طنطا', 'الزقازيق', 'المحلة']
  return cities.find(c => text.includes(c))
}

function extractPeriod(text: string): 'today' | 'week' | 'month' | undefined {
  if (text.includes('اليوم') || text.includes('يوم')) return 'today'
  if (text.includes('أسبوع') || text.includes('الأسبوع') || text.includes('اسبوع')) return 'week'
  if (text.includes('شهر') || text.includes('الشهر')) return 'month'
}

const GREETINGS = ['مرحبا', 'أهلا', 'هلا', 'صباح', 'مساء', 'السلام', 'هاي', 'hi', 'hello']
const CONFIRM_WORDS = ['نعم', 'أكيد', 'اكيد', 'موافق', 'تمام', 'أيوه', 'ايوه', 'يلا', 'اوكي', 'ok', 'yes', 'نفّذ', 'نفذ', 'اكمل', 'كمّل']
const CANCEL_WORDS = ['لا', 'لأ', 'ألغِ', 'الغ', 'ألغ', 'إلغاء', 'إلغ', 'cancel', 'no', 'لا شكرا', 'توقف']

export function detectIntent(text: string): ParsedIntent {
  const t = text.trim().toLowerCase()
  const entities: ParsedIntent['entities'] = {}

  // ── Greetings ────────────────────────────────────────────────────────────
  if (GREETINGS.some(g => t.includes(g)) && t.length < 20) {
    return { intent: 'greeting', entities, raw: text }
  }

  // ── Confirm / Cancel ─────────────────────────────────────────────────────
  if (CONFIRM_WORDS.some(w => t === w || t.startsWith(w + ' ') || t.includes('نعم') || t.includes('نفّذ'))) {
    return { intent: 'confirm', entities, raw: text }
  }
  if (CANCEL_WORDS.some(w => t === w || t.startsWith(w))) {
    return { intent: 'cancel', entities, raw: text }
  }

  // ── Summary / Overview ───────────────────────────────────────────────────
  if ((t.includes('ملخص') || t.includes('كم طلب') || t.includes('وضع') || t.includes('أخبرني') || t.includes('اخبرني') || (t.includes('كيف') && t.includes('متجر')))) {
    return { intent: 'get_summary', entities, raw: text }
  }

  // ── Analytics ────────────────────────────────────────────────────────────
  if (t.includes('مبيعات') || t.includes('إحصاء') || t.includes('احصاء') || t.includes('تقرير') || t.includes('أرباح') || t.includes('ارباح') || t.includes('إيراد') || t.includes('ايراد')) {
    entities.period = extractPeriod(t)
    return { intent: 'get_analytics', entities, raw: text }
  }

  // ── Pending orders ───────────────────────────────────────────────────────
  if ((t.includes('معلق') || t.includes('معلقة') || t.includes('منتظر') || t.includes('ما اتقبل') || t.includes('لم تقبل')) && !t.includes('اقبل') && !t.includes('قبول')) {
    entities.city = extractCity(t)
    entities.filter = t.includes('كاش') ? 'cash' : t.includes('بطاقة') || t.includes('كارت') ? 'card' : undefined
    return { intent: 'get_pending_orders', entities, raw: text }
  }

  // ── Accept orders ────────────────────────────────────────────────────────
  if ((t.includes('اقبل') || t.includes('قبول') || t.includes('وافق') || t.includes('موافقة')) && !extractOrderId(t)) {
    entities.filter = t.includes('كاش') ? 'cash' : undefined
    return { intent: 'accept_orders', entities, raw: text }
  }

  // ── Accept single order ──────────────────────────────────────────────────
  const singleOrderAccept = extractOrderId(t)
  if (singleOrderAccept && (t.includes('اقبل') || t.includes('قبل') || t.includes('وافق'))) {
    entities.orderId = singleOrderAccept
    return { intent: 'accept_single_order', entities, raw: text }
  }

  // ── Reject order ─────────────────────────────────────────────────────────
  const rejectId = extractOrderId(t)
  if (t.includes('ارفض') || t.includes('رفض') || t.includes('إلغاء طلب') || (t.includes('الغ') && rejectId)) {
    entities.orderId = rejectId
    return { intent: 'reject_order', entities, raw: text }
  }

  // ── Order detail ─────────────────────────────────────────────────────────
  const detailId = extractOrderId(t)
  if (detailId && (t.includes('تفاصيل') || t.includes('وريني') || t.includes('اعرض') || t.includes('طلب'))) {
    entities.orderId = detailId
    return { intent: 'get_order_detail', entities, raw: text }
  }

  // ── Shipped / Accepted lists ─────────────────────────────────────────────
  if (t.includes('مشحون') || t.includes('تم شحن') || t.includes('في الشحن') || t.includes('عند الشاحن')) {
    return { intent: 'get_shipped_orders', entities, raw: text }
  }
  if (t.includes('مقبول') || t.includes('اتقبل') || t.includes('تم قبولها') || t.includes('قبلت')) {
    return { intent: 'get_accepted_orders', entities, raw: text }
  }

  // ── Track shipment ───────────────────────────────────────────────────────
  if (t.includes('وين وصل') || t.includes('تتبع') || t.includes('موقع الشحن') || t.includes('تتبع شحن') || (t.includes('شحن') && detailId)) {
    entities.orderId = extractOrderId(t)
    return { intent: 'track_shipment', entities, raw: text }
  }

  // ── Create shipment ──────────────────────────────────────────────────────
  if ((t.includes('اشحن') || t.includes('شحن') || t.includes('بوليصة') || t.includes('ارسل')) && !t.includes('تتبع') && !detailId) {
    return { intent: 'create_shipment', entities, raw: text }
  }

  // ── City filter ──────────────────────────────────────────────────────────
  if (extractCity(t) && (t.includes('طلبات') || t.includes('أوردرات') || t.includes('اوردر'))) {
    entities.city = extractCity(t)
    return { intent: 'filter_orders_city', entities, raw: text }
  }

  // ── Stock / inventory ────────────────────────────────────────────────────
  if (t.includes('مخزون') || t.includes('كام باقي') || t.includes('كم باقي') || t.includes('متوفر') || t.includes('ناقص')) {
    return { intent: 'get_stock', entities, raw: text }
  }

  // ── Products list ────────────────────────────────────────────────────────
  if ((t.includes('منتجات') || t.includes('بضاعة') || t.includes('سلع')) && !t.includes('ضيف') && !t.includes('اضف') && !t.includes('سعر') && !t.includes('خفّض') && !t.includes('رفع')) {
    return { intent: 'get_products', entities, raw: text }
  }

  // ── Add product ──────────────────────────────────────────────────────────
  if (t.includes('ضيف') || t.includes('اضف') || t.includes('أضف') || t.includes('منتج جديد') || t.includes('إضافة منتج')) {
    const priceMatch = extractPrice(t)
    entities.price = priceMatch
    // Extract product name after "منتج" or "ضيف"
    const nameMatch = t.match(/(?:منتج|ضيفي|ضيف|اضف)\s+([^\d]+?)(?:\s+سعره|\s+ب|\s+\d|$)/)
    if (nameMatch) entities.productName = nameMatch[1].trim()
    return { intent: 'add_product', entities, raw: text }
  }

  // ── Update price ─────────────────────────────────────────────────────────
  if (t.includes('سعر') || t.includes('خفّض') || t.includes('خفض') || t.includes('رفع') || t.includes('زود') || t.includes('غيّر') || t.includes('عدّل')) {
    entities.percent = extractPercent(t)
    entities.price = extractPrice(t)
    const isReduce = t.includes('خفّض') || t.includes('خفض') || t.includes('تخفيض') || t.includes('نزّل')
    if (isReduce && entities.percent) entities.percent = -entities.percent
    // product category
    if (t.includes('عطور') || t.includes('عطر')) entities.productName = 'عطور'
    else if (t.includes('سماع') || t.includes('إلكتروني')) entities.productName = 'إلكترونيات'
    return { intent: 'update_price', entities, raw: text }
  }

  // ── Coupon ───────────────────────────────────────────────────────────────
  if (t.includes('كوبون') || t.includes('كود خصم') || t.includes('اعمل خصم') || t.includes('برومو')) {
    entities.discountAmount = extractPercent(t) || extractPrice(t)
    entities.discountType = t.includes('%') || t.includes('بالمئة') || t.includes('بالميه') ? 'percent' : 'fixed'
    return { intent: 'create_coupon', entities, raw: text }
  }

  // ── Message ──────────────────────────────────────────────────────────────
  if (t.includes('رد') || t.includes('راسل') || t.includes('رسالة') || t.includes('ابلغ') || t.includes('أبلغ')) {
    entities.customerName = extractCustomerName(t)
    return { intent: 'send_message', entities, raw: text }
  }

  // ── Activity log ─────────────────────────────────────────────────────────
  if (t.includes('سجل') || t.includes('أنشطة') || t.includes('انشطة') || t.includes('تاريخ')) {
    return { intent: 'get_activity_log', entities, raw: text }
  }

  // ── Out of scope ─────────────────────────────────────────────────────────
  const outOfScope = ['فندق', 'سفر', 'طيران', 'رياضة', 'اخبار', 'أخبار', 'طبخ', 'وصفة', 'فيلم', 'موسيقى', 'حجز']
  if (outOfScope.some(w => t.includes(w))) {
    return { intent: 'out_of_scope', entities, raw: text }
  }

  // ── Pending catch-all when "وريني طلبات" ────────────────────────────────
  if (t.includes('طلبات') || t.includes('أوردرات') || t.includes('الطلبات')) {
    return { intent: 'get_pending_orders', entities, raw: text }
  }

  return { intent: 'unknown', entities, raw: text }
}

function extractCustomerName(text: string): string | undefined {
  const m = text.match(/(?:على|للعميل|عميل|بالعميل)\s+([^\s]+)/)
  return m ? m[1] : undefined
}
