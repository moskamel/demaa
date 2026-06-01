// ── Response engine — maps ParsedIntent → Message ────────────────────────────
import type { ParsedIntent } from './intentDetector'
import { store, ANALYTICS } from '../store/mockData'
import type { Message, ActionButton } from '../types/chat'

// ── helpers ──────────────────────────────────────────────────────────────────

const btn = (label: string, variant: ActionButton['variant'] = 'secondary', cmd?: string): ActionButton =>
  ({ label, variant, cmd: cmd ?? label })

const fmt = (n: number) => n.toLocaleString('ar-SA')

function generateCouponCode(discount: number, type: string) {
  const prefix = type === 'percent' ? 'SAVE' : 'OFF'
  return `${prefix}${discount}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

// ── Main dispatch ─────────────────────────────────────────────────────────────

export function generateResponse(
  parsed: ParsedIntent,
  pendingConfirm: PendingConfirm | null,
  setPending: (p: PendingConfirm | null) => void,
): Message {

  const { intent, entities } = parsed

  // ── CONFIRM / CANCEL pending action ──────────────────────────────────────
  if (intent === 'confirm' && pendingConfirm) {
    return executePendingConfirm(pendingConfirm, setPending)
  }
  if (intent === 'cancel' && pendingConfirm) {
    setPending(null)
    return { role: 'deema', content: 'تم الإلغاء. في شيء ثاني أقدر أساعدك فيه؟' }
  }

  // ── GREETING ─────────────────────────────────────────────────────────────
  if (intent === 'greeting') {
    const pending = store.getPendingOrders()
    const lowStock = store.products.filter(p => p.stock < 5)
    return {
      role: 'deema',
      content: `أهلاً! 👋 كيف أقدر أساعدك؟\n\nالوضع الحالي:\n• ${pending.length} طلب معلق${lowStock.length > 0 ? `\n• ⚠️ ${lowStock.length} منتجات مخزونها منخفض` : ''}`,
      actions: [
        btn('وريني الطلبات المعلقة', 'primary', 'وريني الطلبات المعلقة'),
        btn('مبيعات هذا الأسبوع', 'secondary', 'مبيعات هذا الأسبوع'),
      ],
    }
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  if (intent === 'get_summary') {
    const pending = store.getPendingOrders()
    const accepted = store.getAcceptedOrders()
    const shipped = store.getShippedOrders()
    const lowStock = store.products.filter(p => p.stock < 5)
    const cashOrders = pending.filter(o => o.payment === 'cash')
    return {
      role: 'deema',
      content: 'ملخص متجرك الآن:',
      stats: [
        { n: String(pending.length), l: 'معلق', c: 'var(--gradient-orange)' },
        { n: String(accepted.length), l: 'مقبول', c: 'var(--ink)' },
        { n: String(shipped.length), l: 'مشحون', c: 'var(--semantic-success)' },
        { n: String(lowStock.length), l: 'مخزون منخفض', c: 'var(--gradient-coral)' },
      ],
      actions: [
        ...(pending.length > 0 ? [btn('اقبل الطلبات السليمة', 'primary', 'اقبل الطلبات السليمة')] : []),
        ...(cashOrders.length > 0 ? [btn(`${cashOrders.length} طلبات كاش ⚠️`, 'translucent', 'وريني طلبات الكاش')] : []),
        btn('مبيعات اليوم', 'secondary', 'مبيعات اليوم'),
      ],
    }
  }

  // ── PENDING ORDERS ────────────────────────────────────────────────────────
  if (intent === 'get_pending_orders') {
    let orders = store.getPendingOrders()
    if (entities.city) orders = orders.filter(o => o.city === entities.city)
    if (entities.filter === 'cash') orders = orders.filter(o => o.payment === 'cash')

    if (orders.length === 0) {
      return {
        role: 'deema',
        content: `ما في طلبات معلقة${entities.city ? ` في ${entities.city}` : ''}${entities.filter === 'cash' ? ' بالكاش' : ''} الآن. ✅`,
      }
    }

    const total = orders.reduce((s, o) => s + o.total, 0)
    const cashCount = orders.filter(o => o.payment === 'cash').length
    return {
      role: 'deema',
      content: `عندك ${orders.length} طلب معلق${entities.city ? ` في ${entities.city}` : ''} — إجمالي ${fmt(total)} ر.س${cashCount > 0 ? `\n\n⚠️ ${cashCount} طلبات بالكاش — تأكد قبل القبول` : ''}`,
      orderList: orders.slice(0, 6).map(o => ({
        id: o.id, customer: o.customer, city: o.city,
        total: o.total, payment: o.payment, status: o.status,
        issue: o.issue,
      })),
      actions: [
        btn('اقبل الجاهزة', 'primary', 'اقبل الطلبات السليمة'),
        ...(cashCount > 0 ? [btn(`تجاهل الكاش (${cashCount})`, 'secondary')] : []),
      ],
    }
  }

  // ── ACCEPT ORDERS (bulk) ─────────────────────────────────────────────────
  if (intent === 'accept_orders') {
    let pending = store.getPendingOrders()
    const cashOrders = pending.filter(o => o.payment === 'cash')
    const validOrders = entities.filter === 'cash' ? cashOrders : pending.filter(o => o.payment !== 'cash')
    const allOrders = pending

    if (allOrders.length === 0) {
      return { role: 'deema', content: 'ما في طلبات معلقة لقبولها الآن.' }
    }

    // Check if contradictory (accept all + reject cash in same message)
    const hasCash = cashOrders.length > 0

    // Ask which: all or without cash?
    if (hasCash && !entities.filter) {
      const total = validOrders.reduce((s, o) => s + o.total, 0)
      setPending({
        type: 'accept_bulk',
        data: { orders: validOrders.map(o => o.id) },
      })
      return {
        role: 'deema',
        content: `عندك ${pending.length} طلب معلق:\n• ${validOrders.length} طلبات بطاقة/تابby — ${fmt(total)} ر.س ✅\n• ${cashOrders.length} طلبات كاش ⚠️ (تحتاج مراجعة)\n\nأي منها تقبل؟`,
        actions: [
          btn(`اقبل البطاقات فقط (${validOrders.length})`, 'primary', `اقبل ${validOrders.length} طلب بدون الكاش`),
          btn(`اقبل الكل (${pending.length})`, 'secondary', `اقبل الكل بما فيهم الكاش`),
          btn('إلغاء', 'translucent'),
        ],
      }
    }

    const targetOrders = hasCash && entities.filter !== 'cash'
      ? validOrders
      : allOrders
    const total = targetOrders.reduce((s, o) => s + o.total, 0)

    setPending({
      type: 'accept_bulk',
      data: { orders: targetOrders.map(o => o.id) },
    })

    return {
      role: 'deema',
      content: `هتقبل ${targetOrders.length} طلب بمجموع ${fmt(total)} ر.س من متجر النور.\n\n✅ ${targetOrders.length} طلب سليم\n⏩ سيتم إنشاء بوالص الشحن تلقائياً`,
      actions: [
        btn('نعم، نفّذ', 'primary', 'نعم'),
        btn('لا، ألغِ', 'secondary', 'لا'),
        btn('وريني التفاصيل', 'translucent', `وريني الطلبات المعلقة`),
      ],
    }
  }

  // ── ACCEPT SINGLE ORDER ───────────────────────────────────────────────────
  if (intent === 'accept_single_order' && entities.orderId) {
    const order = store.getOrder(entities.orderId)
    if (!order) {
      return { role: 'deema', content: `ما لقيت طلب رقم #${entities.orderId} في متجرك. تأكد من الرقم.` }
    }
    if (order.status !== 'pending') {
      return { role: 'deema', content: `طلب #${entities.orderId} حالته "${statusLabel(order.status)}" — مش معلق.` }
    }
    store.acceptOrder(entities.orderId)
    return {
      role: 'deema',
      content: `✅ تم قبول طلب #${entities.orderId}\n\nالعميل: ${order.customer}\nالمبلغ: ${fmt(order.total)} ر.س\n\nهل تريد شحنه الآن؟`,
      actions: [
        btn('شحن الآن', 'primary', `اشحن طلب #${entities.orderId}`),
        btn('لاحقاً', 'secondary'),
      ],
    }
  }

  // ── REJECT ORDER ─────────────────────────────────────────────────────────
  if (intent === 'reject_order') {
    if (!entities.orderId) {
      return { role: 'deema', content: 'أي طلب تقصد؟ أعطني رقمه — مثلاً: "ارفض طلب #10231"' }
    }
    const order = store.getOrder(entities.orderId)
    if (!order) {
      return { role: 'deema', content: `ما لقيت طلب رقم #${entities.orderId} في متجرك.` }
    }
    if (order.status === 'rejected') {
      return { role: 'deema', content: `طلب #${entities.orderId} مرفوض أصلاً.` }
    }

    setPending({ type: 'reject_single', data: { orderId: entities.orderId } })
    return {
      role: 'deema',
      content: `تأكيد رفض طلب #${entities.orderId}؟\n\nالعميل: ${order.customer} — ${order.city}\nالمبلغ: ${fmt(order.total)} ر.س\n\n⚠️ هذا الإجراء لا يمكن التراجع عنه.`,
      actions: [
        btn('نعم، ارفض', 'primary', 'نعم'),
        btn('لا، ألغِ', 'secondary', 'لا'),
      ],
    }
  }

  // ── ORDER DETAIL ─────────────────────────────────────────────────────────
  if (intent === 'get_order_detail' && entities.orderId) {
    const order = store.getOrder(entities.orderId)
    if (!order) {
      return { role: 'deema', content: `ما لقيت طلب رقم #${entities.orderId} في متجرك. تأكد من الرقم وجرب مرة ثانية.` }
    }

    const itemsText = order.items.map(i => `• ${i.name} × ${i.qty} = ${fmt(i.qty * i.price)} ر.س`).join('\n')
    return {
      role: 'deema',
      content: `تفاصيل طلب #${order.id} — ${statusLabel(order.status)}\n\n👤 ${order.customer}\n📍 ${order.city} — ${order.address}\n📞 ${order.phone}\n💳 ${paymentLabel(order.payment)}\n\n${itemsText}\n\nالإجمالي: ${fmt(order.total)} ر.س`,
      actions: order.status === 'pending'
        ? [btn('قبول الطلب', 'primary', `اقبل طلب #${order.id}`), btn('رفض الطلب', 'secondary', `ارفض طلب #${order.id}`)]
        : order.status === 'accepted'
          ? [btn('شحن الآن', 'primary', `اشحن طلب #${order.id}`)]
          : order.status === 'shipped'
            ? [btn('تتبع الشحنة', 'secondary', `تتبع شحنة #${order.id}`)]
            : [],
    }
  }

  // ── GET ACCEPTED / SHIPPED ORDERS ─────────────────────────────────────────
  if (intent === 'get_accepted_orders') {
    const orders = store.getAcceptedOrders()
    if (orders.length === 0) return { role: 'deema', content: 'ما في طلبات مقبولة جاهزة للشحن الآن.' }
    const total = orders.reduce((s, o) => s + o.total, 0)
    return {
      role: 'deema',
      content: `عندك ${orders.length} طلب مقبول جاهز للشحن — ${fmt(total)} ر.س`,
      orderList: orders.map(o => ({ id: o.id, customer: o.customer, city: o.city, total: o.total, payment: o.payment, status: o.status })),
      actions: [btn('اشحن الكل', 'primary', 'اشحن الطلبات المقبولة')],
    }
  }

  if (intent === 'get_shipped_orders') {
    const orders = store.getShippedOrders()
    if (orders.length === 0) return { role: 'deema', content: 'ما في طلبات مشحونة حالياً.' }
    return {
      role: 'deema',
      content: `عندك ${orders.length} طلب في الشحن:`,
      orderList: orders.map(o => ({ id: o.id, customer: o.customer, city: o.city, total: o.total, payment: o.payment, status: o.status, shipmentId: o.shipmentId })),
    }
  }

  // ── CITY FILTER ───────────────────────────────────────────────────────────
  if (intent === 'filter_orders_city' && entities.city) {
    const all = store.orders.filter(o => o.city === entities.city && ['pending', 'accepted'].includes(o.status))
    if (all.length === 0) {
      return { role: 'deema', content: `ما في طلبات نشطة من ${entities.city} الآن.` }
    }
    const total = all.reduce((s, o) => s + o.total, 0)
    return {
      role: 'deema',
      content: `طلبات ${entities.city}: ${all.length} طلب — ${fmt(total)} ر.س`,
      orderList: all.map(o => ({ id: o.id, customer: o.customer, city: o.city, total: o.total, payment: o.payment, status: o.status })),
    }
  }

  // ── CREATE SHIPMENT ───────────────────────────────────────────────────────
  if (intent === 'create_shipment') {
    const accepted = store.getAcceptedOrders()
    if (accepted.length === 0) {
      return {
        role: 'deema',
        content: 'ما في طلبات مقبولة جاهزة للشحن. قبّل الطلبات أولاً ثم اشحنها.',
        actions: [btn('اقبل الطلبات المعلقة', 'primary', 'اقبل الطلبات السليمة')],
      }
    }
    const total = accepted.reduce((s, o) => s + o.total, 0)
    setPending({ type: 'ship_bulk', data: { orders: accepted.map(o => o.id) } })
    return {
      role: 'deema',
      content: `سأنشئ ${accepted.length} بوليصة شحن مع أرامكس\nإجمالي: ${fmt(total)} ر.س\n\n✅ جاهزة للإرسال`,
      actions: [
        btn('نعم، اشحن الكل', 'primary', 'نعم'),
        btn('إلغاء', 'secondary', 'لا'),
      ],
    }
  }

  // ── TRACK SHIPMENT ────────────────────────────────────────────────────────
  if (intent === 'track_shipment') {
    const orderId = entities.orderId
    if (!orderId) {
      return { role: 'deema', content: 'أي شحنة تقصد؟ أعطني رقم الطلب — مثلاً: "تتبع شحنة #10210"' }
    }
    const order = store.getOrder(orderId)
    if (!order || order.status !== 'shipped') {
      return { role: 'deema', content: `طلب #${orderId} ليس في مرحلة الشحن حالياً.` }
    }
    const statuses = ['تم استلام الطلب', 'جاري التجهيز', 'مع مندوب التوصيل', 'في الطريق للعميل']
    const current = statuses[Math.floor(Math.random() * statuses.length)]
    return {
      role: 'deema',
      content: `📦 شحنة طلب #${orderId}\nرقم البوليصة: ${order.shipmentId}\n\nالحالة الآن: ${current}\nالعميل: ${order.customer} — ${order.city}\n\nالوقت المتوقع: خلال ١–٢ أيام عمل`,
    }
  }

  // ── STOCK ─────────────────────────────────────────────────────────────────
  if (intent === 'get_stock') {
    const outOfStock = store.products.filter(p => p.stock === 0)
    return {
      role: 'deema',
      content: `مخزون المنتجات:`,
      productList: store.products.map(p => ({
        id: p.id, name: p.name, price: p.price, stock: p.stock, category: p.category,
      })),
      actions: outOfStock.length > 0
        ? [btn(`${outOfStock.length} منتجات نافدة ⚠️`, 'translucent')]
        : [],
    }
  }

  // ── PRODUCTS LIST ─────────────────────────────────────────────────────────
  if (intent === 'get_products') {
    return {
      role: 'deema',
      content: `منتجاتك (${store.products.length} منتج):`,
      productList: store.products.map(p => ({
        id: p.id, name: p.name, price: p.price, stock: p.stock, category: p.category,
      })),
      actions: [
        btn('إضافة منتج جديد', 'secondary', 'إضافة منتج جديد'),
        btn('تحديث الأسعار', 'secondary', 'خفّض أسعار العطور 10%'),
      ],
    }
  }

  // ── ADD PRODUCT ───────────────────────────────────────────────────────────
  if (intent === 'add_product') {
    const name = entities.productName || 'منتج جديد'
    const price = entities.price || 0

    if (!price) {
      return { role: 'deema', content: `ما عرفت السعر. مثال: "ضيف منتج عطر اسمه العود الفاخر سعره 280 ر.س"` }
    }

    const product = store.addProduct({
      name, sku: `SKU-${Date.now()}`, price, stock: 10,
      category: 'عطور', active: true,
    })

    return {
      role: 'deema',
      content: `✅ تم إضافة المنتج:\n\n📦 ${product.name}\nالسعر: ${fmt(product.price)} ر.س\nالمخزون الأولي: ١٠ قطعة\nرمز المنتج: ${product.sku}`,
      actions: [btn('وريني كل المنتجات', 'secondary', 'وريني المنتجات')],
    }
  }

  // ── UPDATE PRICE ──────────────────────────────────────────────────────────
  if (intent === 'update_price') {
    const percent = entities.percent
    const category = entities.productName

    if (!percent && !entities.price) {
      return { role: 'deema', content: 'كم النسبة أو القيمة الجديدة؟ مثال: "خفّض أسعار العطور 10%"' }
    }

    const targetProducts = category
      ? store.products.filter(p => p.category.includes(category) || p.name.includes(category))
      : store.products

    if (targetProducts.length === 0) {
      return { role: 'deema', content: `ما لقيت منتجات في فئة ${category}.` }
    }

    setPending({ type: 'update_price', data: { products: targetProducts.map(p => p.id), percent, price: entities.price } })

    const action = percent && percent < 0 ? `تخفيض ${Math.abs(percent)}%` : percent ? `رفع ${percent}%` : `تغيير السعر لـ ${entities.price} ر.س`

    return {
      role: 'deema',
      content: `${action} على ${targetProducts.length} منتج${category ? ` في فئة "${category}"` : ''}:\n\n${targetProducts.map(p => `• ${p.name}: ${fmt(p.price)} → ${fmt(calcNewPrice(p.price, percent, entities.price))} ر.س`).join('\n')}\n\nتأكيد التغيير؟`,
      actions: [
        btn('نعم، حدّث الأسعار', 'primary', 'نعم'),
        btn('لا، ألغِ', 'secondary', 'لا'),
      ],
    }
  }

  // ── ANALYTICS ────────────────────────────────────────────────────────────
  if (intent === 'get_analytics') {
    const period = entities.period || 'week'
    const data = period === 'today' ? ANALYTICS.today : period === 'month' ? ANALYTICS.month : ANALYTICS.week
    const periodLabel = period === 'today' ? 'اليوم' : period === 'month' ? 'هذا الشهر' : 'هذا الأسبوع'

    return {
      role: 'deema',
      content: `📊 تقرير ${periodLabel}:`,
      stats: [
        { n: String(data.orders), l: 'طلب', c: 'var(--gradient-orange)' },
        { n: fmt(data.revenue), l: 'ر.س إيراد', c: 'var(--ink)' },
        { n: fmt(data.avgOrder), l: 'متوسط الطلب', c: 'var(--semantic-success)' },
        ...('growth' in data ? [{ n: `+${(data as any).growth}%`, l: 'نمو', c: 'var(--gradient-violet)' }] : []),
      ],
      actions: [
        btn('تقرير اليوم', period === 'today' ? 'secondary' : 'translucent', 'مبيعات اليوم'),
        btn('تقرير الأسبوع', period === 'week' ? 'secondary' : 'translucent', 'مبيعات هذا الأسبوع'),
        btn('تقرير الشهر', period === 'month' ? 'secondary' : 'translucent', 'مبيعات هذا الشهر'),
      ],
    }
  }

  // ── CREATE COUPON ─────────────────────────────────────────────────────────
  if (intent === 'create_coupon') {
    const amount = entities.discountAmount
    const type = entities.discountType || 'percent'

    if (!amount) {
      return { role: 'deema', content: 'كم قيمة الخصم؟ مثال: "اعمل كوبون خصم 15%" أو "كوبون خصم 50 ر.س"' }
    }

    const code = generateCouponCode(amount, type)
    const coupon = store.addCoupon({ code, discount: amount, type, maxUses: 100, active: true })

    return {
      role: 'deema',
      content: `✅ تم إنشاء الكوبون:\n\n🎟 الكود: ${coupon.code}\nالخصم: ${coupon.discount}${type === 'percent' ? '%' : ' ر.س'}\nالاستخدام: حتى ١٠٠ مرة\nالحالة: فعّال ✅`,
      actions: [btn('وريني كل الكوبونات', 'secondary')],
    }
  }

  // ── SEND MESSAGE ──────────────────────────────────────────────────────────
  if (intent === 'send_message') {
    const name = entities.customerName || 'العميل'
    return {
      role: 'deema',
      content: `ما الرسالة التي تريد إرسالها لـ${name}؟`,
      actions: [
        btn('تأخر في الشحن — اعتذار', 'secondary', `أرسل رسالة اعتذار لـ${name} عن تأخر الشحن`),
        btn('تأكيد استلام الطلب', 'secondary', `أرسل تأكيد استلام لـ${name}`),
        btn('كتابة رسالة مخصصة', 'translucent'),
      ],
    }
  }

  // ── ACTIVITY LOG ─────────────────────────────────────────────────────────
  if (intent === 'get_activity_log') {
    if (store.activitiesLog.length === 0) {
      return { role: 'deema', content: 'ما في أنشطة مسجلة بعد في هذه الجلسة. ابدأ بإجراء أي عملية وستظهر هنا.', actions: [btn('افتح سجل الأنشطة الكامل', 'secondary')] }
    }
    const recent = store.activitiesLog.slice(0, 5)
    const text = recent.map(a => `• ${a.time} — ${a.action}\n  ${a.detail}`).join('\n\n')
    return {
      role: 'deema',
      content: `آخر ${recent.length} أنشطة في هذه الجلسة:\n\n${text}`,
      actions: [btn('عرض كل السجل', 'secondary')],
    }
  }

  // ── OUT OF SCOPE ──────────────────────────────────────────────────────────
  if (intent === 'out_of_scope') {
    return {
      role: 'deema',
      content: `أنا متخصص في إدارة متجرك فقط 😄\nفي حاجة تخص متجرك أقدر أساعدك فيها؟`,
      actions: [
        btn('وريني الطلبات', 'secondary', 'وريني الطلبات المعلقة'),
        btn('مبيعات اليوم', 'secondary', 'مبيعات اليوم'),
      ],
    }
  }

  // ── UNKNOWN ───────────────────────────────────────────────────────────────
  return {
    role: 'deema',
    content: `ما فهمت الأمر بشكل كامل 🤔\n\nأقدر أساعدك في:`,
    actions: [
      btn('الطلبات المعلقة', 'secondary', 'وريني الطلبات المعلقة'),
      btn('مبيعات هذا الأسبوع', 'secondary', 'مبيعات هذا الأسبوع'),
      btn('المنتجات والمخزون', 'secondary', 'وريني المنتجات'),
      btn('إنشاء كوبون', 'secondary', 'اعمل كوبون خصم 15%'),
    ],
  }
}

// ── Execute confirmed actions ─────────────────────────────────────────────────

export type PendingConfirm =
  | { type: 'accept_bulk'; data: { orders: string[] } }
  | { type: 'reject_single'; data: { orderId: string } }
  | { type: 'ship_bulk'; data: { orders: string[] } }
  | { type: 'update_price'; data: { products: string[]; percent?: number; price?: number } }

function executePendingConfirm(pending: PendingConfirm, setPending: (p: PendingConfirm | null) => void): Message {
  setPending(null)

  if (pending.type === 'accept_bulk') {
    const results = pending.data.orders.map(id => store.acceptOrder(id))
    const success = results.filter(Boolean).length
    const fail = pending.data.orders.length - success
    return {
      role: 'deema',
      content: `✅ تم قبول ${success} طلب بنجاح${fail > 0 ? `\n⚠️ ${fail} طلبات فشلت — تحقق منها يدوياً` : ''}\n\nهل تريد إنشاء بوالص الشحن الآن؟`,
      actions: [
        btn('اشحن الطلبات المقبولة', 'primary', 'اشحن الطلبات المقبولة'),
        btn('لاحقاً', 'secondary', 'لا'),
      ],
    }
  }

  if (pending.type === 'reject_single') {
    const order = store.rejectOrder(pending.data.orderId)
    return {
      role: 'deema',
      content: `✅ تم رفض طلب #${pending.data.orderId} — ${order?.customer}\n\nسيتم إشعار العميل تلقائياً.`,
    }
  }

  if (pending.type === 'ship_bulk') {
    const results = pending.data.orders.map(id => store.shipOrder(id))
    const success = results.filter(Boolean).length
    const shipmentIds = results.filter(Boolean).map(o => o!.shipmentId).join('، ')
    return {
      role: 'deema',
      content: `📦 تم إنشاء ${success} بوليصة شحن مع أرامكس\n\nأرقام البوالص:\n${shipmentIds}\n\nسيتم إشعار العملاء تلقائياً بتفاصيل الشحن.`,
    }
  }

  if (pending.type === 'update_price') {
    let updated = 0
    pending.data.products.forEach(id => {
      const p = store.products.find(prod => prod.id === id)
      if (p) {
        const newPrice = calcNewPrice(p.price, pending.data.percent, pending.data.price)
        store.updateProductPrice(id, newPrice)
        updated++
      }
    })
    return {
      role: 'deema',
      content: `✅ تم تحديث أسعار ${updated} منتج بنجاح.`,
      actions: [btn('وريني المنتجات', 'secondary', 'وريني المنتجات')],
    }
  }

  return { role: 'deema', content: 'تم.' }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusLabel(status: string) {
  const m: Record<string, string> = {
    pending: 'معلق ⏳', accepted: 'مقبول ✅', shipped: 'مشحون 📦',
    delivered: 'تم التسليم ✅', rejected: 'مرفوض ❌', cancelled: 'ملغي 🚫',
  }
  return m[status] || status
}

function paymentLabel(p: string) {
  const m: Record<string, string> = { card: 'بطاقة ائتمان', cash: 'كاش', tabby: 'تابby', tamara: 'تمارا' }
  return m[p] || p
}

function calcNewPrice(current: number, percent?: number, fixed?: number): number {
  if (percent !== undefined) return Math.round(current * (1 + percent / 100))
  if (fixed !== undefined) return fixed
  return current
}
