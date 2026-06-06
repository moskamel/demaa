// Free AI engine — understands Arabic commands and uses real DB tools
// Runs when no ANTHROPIC_API_KEY is set. No external API needed.

import { executeTool } from './executor.js'
import prisma from '../prisma.js'

interface ChatCtx { orgId: string; userId?: string; conversationId: string }

const statusLabels: Record<string, string> = {
  pending: 'معلق', accepted: 'مقبول', shipped: 'مشحون',
  delivered: 'مُسلَّم', rejected: 'مرفوض', cancelled: 'ملغي',
}

interface Intent {
  name: string
  patterns: RegExp[]
  handler: (msg: string, ctx: ChatCtx) => Promise<string>
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return (n / 100).toLocaleString('ar-EG', { minimumFractionDigits: 0 }) + ' ريال' }
function pct(n: number) { return Math.round(n) + '%' }

// ── Intents ──────────────────────────────────────────────────────────────────

const INTENTS: Intent[] = [

  // greeting
  {
    name: 'greeting',
    patterns: [/^(هلا|أهلاً|مرحبا|السلام|مساء|صباح|يا ديما|هي|هاي)/i],
    async handler(_msg, _ctx) {
      return 'هلا والله! 👋 أنا ديما مساعدك الذكي. كيف أقدر أساعدك اليوم؟\n\nأقدر أساعدك في:\n• 📦 الطلبات — قبول، رفض، شحن\n• 📊 التحليلات — مبيعات ومؤشرات\n• 📦 المنتجات — مخزون وأسعار\n• 👥 العملاء — شرائح وبيانات\n• 🎟️ الكوبونات — إنشاء وإدارة'
    }
  },

  // pending orders
  {
    name: 'get_pending',
    patterns: [/طلبات? (معلق|بانتظار|جديد)/i, /كم.*(طلب|معلق)/i, /الطلبات المعلقة/i, /وريني الطلبات/i, /وش عندي/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_orders', { status: 'pending', limit: 50 }, ctx) as any
      const orders = r.orders || []
      if (!orders.length) return '✅ ما في طلبات معلقة حالياً، كل شيء مرتب!'
      const list = orders.slice(0, 8).map((o: any) =>
        `• #${o.externalRef || o.id.slice(-6)} — ${o.customerName} — ${fmt(o.total)} — ${o.city}${o.riskScore > 60 ? ' ⚠️ مخاطرة' : ''}`
      ).join('\n')
      return `📦 عندك **${orders.length} طلب معلق**:\n\n${list}${orders.length > 8 ? `\n... و${orders.length - 8} طلب إضافي` : ''}\n\nتبي أقبل الكل؟ قول "اقبل كل الطلبات"`
    }
  },

  // accept all pending
  {
    name: 'accept_all',
    patterns: [/اقبل (كل|جميع|الطلبات)/i, /قبول (كل|جميع)/i, /وافق (على )?(كل|جميع)/i, /اقبل الطلبات/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_orders', { status: 'pending', limit: 100 }, ctx) as any
      const orders = r.orders || []
      const safe = orders.filter((o: any) => o.riskScore < 60)
      const risky = orders.filter((o: any) => o.riskScore >= 60)
      if (!safe.length && !risky.length) return 'ما في طلبات معلقة تحتاج قبول.'
      let response = ''
      if (safe.length) {
        const res = await executeTool('accept_orders', { orderIds: safe.map((o: any) => o.id) }, ctx) as any
        response += `✅ تم قبول **${res.accepted} طلب** بنجاح!\n`
      }
      if (risky.length) {
        response += `\n⚠️ تم تخطي **${risky.length} طلب** ذو مخاطرة عالية:\n`
        response += risky.map((o: any) => `• #${o.externalRef || o.id.slice(-6)} — ${o.customerName} (مخاطرة ${o.riskScore}%)`).join('\n')
        response += '\nقول "اقبل رغم المخاطرة" إذا تبي أقبلها أيضاً.'
      }
      return response
    }
  },

  // accept despite risk
  {
    name: 'accept_risky',
    patterns: [/اقبل (رغم|مع) المخاطرة/i, /اقبل المشبوه/i, /اقبل الكل بدون استثناء/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_orders', { status: 'pending', limit: 100 }, ctx) as any
      const risky = (r.orders || []).filter((o: any) => o.riskScore >= 60)
      if (!risky.length) return 'ما في طلبات مشبوهة معلقة.'
      const res = await executeTool('accept_orders', { orderIds: risky.map((o: any) => o.id) }, ctx) as any
      return `✅ تم قبول ${res.accepted} طلب مشبوه. تنبيه: تأكد من متابعة هذه الطلبات.`
    }
  },

  // analytics / sales
  {
    name: 'analytics',
    patterns: [/تحليل|مبيعات|إيراد|أداء|إحصاء|تقرير|كم ربح|كم حصلت/i, /وش أكثر/i, /مبيعات اليوم/i],
    async handler(msg, ctx) {
      const period = /أسبوع|7/.test(msg) ? '7d' : /90|3 شهر/.test(msg) ? '90d' : '30d'
      const r = await executeTool('get_analytics', { period }, ctx) as any
      const periodLabel = period === '7d' ? 'آخر 7 أيام' : period === '90d' ? 'آخر 90 يوم' : 'آخر 30 يوم'
      const cities = (r.topCities || []).slice(0, 3).map(([c, d]: [string, any]) => `  ${c}: ${d.orders} طلب`).join('\n')
      return `📊 **تقرير المبيعات — ${periodLabel}**\n\n` +
        `💰 الإيراد الكلي: **${fmt(r.totalRevenue * 100)}**\n` +
        `📦 إجمالي الطلبات: **${r.totalOrders}**\n` +
        `✅ طلبات مكتملة: ${r.completedOrders}\n` +
        `⏳ معلقة: ${r.pendingOrders}\n` +
        `❌ مرفوضة: ${r.rejectedOrders} (${pct(r.rejectionRate)})\n` +
        `💵 متوسط قيمة الطلب: ${fmt(r.avgOrderValue * 100)}\n\n` +
        `🏙️ أبرز المدن:\n${cities || '  لا بيانات'}`
    }
  },

  // products low stock
  {
    name: 'low_stock',
    patterns: [/مخزون (منخفض|ناقص|نفد|قليل)|نفد المخزون|مخزون قليل|منتجات? ناقص|قليلة المخزون|منخفض المخزون/i, /المنتجات المنخفضة/i, /كام باقي/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_products', { lowStock: true, limit: 20 }, ctx) as any
      const products = r.products || []
      if (!products.length) return '✅ المخزون كامل، ما في منتجات تحتاج تعبئة.'
      const list = products.map((p: any) => `• ${p.name} — باقي **${p.stock}** قطعة`).join('\n')
      return `⚠️ **${products.length} منتج بمخزون منخفض:**\n\n${list}`
    }
  },

  // most expensive / cheapest product
  {
    name: 'product_price_query',
    patterns: [/أغلى منتج|أرخص منتج|أعلى سعر|أدنى سعر|ما أغلى|وش أغلى/i],
    async handler(msg, ctx) {
      const r = await executeTool('get_products', { limit: 100 }, ctx) as any
      const products = (r.products || []).sort((a: any, b: any) => b.price - a.price)
      if (!products.length) return 'ما في منتجات مضافة بعد.'
      if (/أرخص|أدنى/.test(msg)) {
        const p = products[products.length - 1]
        return `📦 **أرخص منتج لديك:**\n\n• ${p.name} — ${fmt(p.price)} — مخزون: ${p.stock}`
      }
      const p = products[0]
      return `📦 **أغلى منتج لديك:**\n\n• ${p.name} — ${fmt(p.price)} — مخزون: ${p.stock}`
    }
  },

  // stock alerts / notifications
  {
    name: 'stock_alert',
    patterns: [/نبّهني|نبهني|أنبهني|تنبيه.*مخزون|إشعار.*مخزون|مخزون.*نفاد|عند نفاد/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_products', { lowStock: true, limit: 20 }, ctx) as any
      const products = r.products || []
      if (!products.length) return '✅ المخزون كامل الآن، ما في منتجات تقترب من النفاد. سأنبهك تلقائياً عند انخفاض أي منتج.'
      const list = products.map((p: any) => `• ${p.name} — باقي **${p.stock}** قطعة`).join('\n')
      return `⚠️ هذه المنتجات تقترب من النفاد الآن:\n\n${list}\n\n💡 يمكنك قول "تجديد مخزون [اسم المنتج]" لإعادة التعبئة.`
    }
  },

  // inactive / unavailable products
  {
    name: 'inactive_products',
    patterns: [/منتجات? غير النشطة|منتجات? معطلة|منتجات? غير متوفرة|غير متاحة/i],
    async handler(_msg, ctx) {
      const products = await (prisma as any).product.findMany({
        where: { store: { organizationId: ctx.orgId }, isActive: false },
        take: 20,
      })
      if (!products.length) return '✅ كل منتجاتك نشطة ومتاحة للبيع.'
      const list = products.map((p: any) => `• ${p.name} — ${fmt(p.price)}`).join('\n')
      return `⚠️ **المنتجات غير النشطة (${products.length}):**\n\n${list}`
    }
  },

  // compare today vs yesterday
  {
    name: 'compare_today_yesterday',
    patterns: [/قارن|مقارنة|مبيعات الأمس|أمس مقابل اليوم/i],
    async handler(_msg, ctx) {
      const [today, week] = await Promise.all([
        executeTool('get_analytics', { period: 'today' }, ctx) as any,
        executeTool('get_analytics', { period: '7d' }, ctx) as any,
      ])
      const todayRev = today.totalRevenue ?? 0
      const avgDaily = (week.totalRevenue ?? 0) / 7
      const diff = todayRev - avgDaily
      const sign = diff >= 0 ? '▲' : '▼'
      return `📊 **مقارنة المبيعات:**\n\n• اليوم: **${fmt(todayRev * 100)}**\n• متوسط يومي (7 أيام): **${fmt(avgDaily * 100)}**\n• الفرق: ${sign} ${fmt(Math.abs(diff) * 100)}`
    }
  },

  // orders count today
  {
    name: 'orders_count_today',
    patterns: [/كم عدد الطلبات اليوم|طلبات اليوم|الطلبات اليوم/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_analytics', { period: 'today' }, ctx) as any
      return `📦 **طلبات اليوم:**\n\n• إجمالي: **${r.totalOrders ?? 0}** طلب\n• مكتملة: ${r.completedOrders ?? 0}\n• معلقة: ${r.pendingOrders ?? 0}\n• مرفوضة: ${r.rejectedOrders ?? 0}`
    }
  },

  // average order value
  {
    name: 'avg_order_value',
    patterns: [/متوسط قيمة الطلب|متوسط الطلب|معدل الطلب/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_analytics', { period: '30d' }, ctx) as any
      return `💰 متوسط قيمة الطلب (آخر 30 يوم): **${fmt((r.avgOrderValue ?? 0) * 100)}**`
    }
  },

  // last N orders
  {
    name: 'last_orders',
    patterns: [/آخر \d+ طلب|آخر طلبات|أحدث الطلبات/i],
    async handler(msg, ctx) {
      const match = msg.match(/(\d+)/)
      const limit = match ? Math.min(parseInt(match[1]), 20) : 10
      const r = await executeTool('get_orders', { status: 'all', limit }, ctx) as any
      const orders = r.orders || []
      if (!orders.length) return 'ما في طلبات بعد.'
      const list = orders.map((o: any) =>
        `• #${o.externalRef || o.id.slice(-6)} — ${o.customerName} — ${fmt(o.total)} — ${statusLabels[o.status] || o.status}`
      ).join('\n')
      return `📦 **آخر ${orders.length} طلب:**\n\n${list}`
    }
  },

  // shipped orders today
  {
    name: 'shipped_today',
    patterns: [/الطلبات المشحونة اليوم|شحنات اليوم|تم شحنها اليوم/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_orders', { status: 'shipped', limit: 50 }, ctx) as any
      const orders = r.orders || []
      if (!orders.length) return 'ما في طلبات مشحونة اليوم.'
      const list = orders.slice(0, 10).map((o: any) =>
        `• #${o.externalRef || o.id.slice(-6)} — ${o.customerName}${o.shipmentId ? ' — ' + o.shipmentId : ''}`
      ).join('\n')
      return `🚚 **الطلبات المشحونة (${orders.length}):**\n\n${list}`
    }
  },

  // pending shipping / awaiting shipment
  {
    name: 'pending_shipment',
    patterns: [/في انتظار الشحن|طلبات بانتظار الشحن|كم طلب.*شحن|لم يُشحن/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_orders', { status: 'accepted', limit: 100 }, ctx) as any
      const orders = r.orders || []
      if (!orders.length) return '✅ ما في طلبات مقبولة بانتظار الشحن.'
      return `📦 **${orders.length} طلب مقبول في انتظار الشحن.**\n\nقول "اشحن الطلبات المقبولة" لإنشاء الشحنات.`
    }
  },

  // delayed / stuck orders
  {
    name: 'delayed_orders',
    patterns: [/طلبات متأخرة|طلبات عالقة|متأخر|فشل التوصيل/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_failed_deliveries', { limit: 20 }, ctx) as any
      const orders = r.orders || []
      if (!orders.length) return '✅ ما في طلبات متأخرة أو عالقة.'
      const list = orders.slice(0, 8).map((o: any) =>
        `• #${o.externalRef || o.id.slice(-6)} — ${o.customerName} — ${o.status}`
      ).join('\n')
      return `⚠️ **${orders.length} طلب متأخر أو عالق:**\n\n${list}`
    }
  },

  // top selling products
  {
    name: 'top_products',
    patterns: [/أكثر المنتجات مبيعاً|أكثر المنتجات.*طلباً|أكثر منتج|أفضل منتج/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_analytics', { period: '30d' }, ctx) as any
      const top = r.topProducts || []
      if (!top.length) return 'ما في بيانات كافية بعد لتحديد أكثر المنتجات مبيعاً.'
      const list = top.slice(0, 5).map(([name, count]: [string, number], i: number) =>
        `${i + 1}. ${name} — **${count}** قطعة مباعة`
      ).join('\n')
      return `🏆 **أكثر المنتجات مبيعاً (آخر 30 يوم):**\n\n${list}`
    }
  },

  // weekly / monthly revenue
  {
    name: 'period_revenue',
    patterns: [/إيرادات هذا الأسبوع|مبيعات هذا الأسبوع|إيراد الأسبوع|تقرير المبيعات الشهري|إيرادات الشهر/i],
    async handler(msg, ctx) {
      const period = /شهر/.test(msg) ? '30d' : '7d'
      const r = await executeTool('get_analytics', { period }, ctx) as any
      const label = period === '30d' ? 'هذا الشهر' : 'هذا الأسبوع'
      return `📊 **إيرادات ${label}:**\n\n💰 **${fmt((r.totalRevenue ?? 0) * 100)}**\n📦 ${r.totalOrders ?? 0} طلب\n✅ ${r.completedOrders ?? 0} مكتمل`
    }
  },

  // active coupons
  {
    name: 'active_coupons',
    patterns: [/الكوبونات النشطة|كوبونات نشطة|كوبون فعال/i],
    async handler(_msg, ctx) {
      const coupons = await (prisma as any).coupon.findMany({
        where: { organizationId: ctx.orgId, isActive: true },
        orderBy: { createdAt: 'desc' }, take: 10,
      })
      if (!coupons.length) return 'ما في كوبونات نشطة حالياً.'
      const list = coupons.map((c: any) =>
        `• **${c.code}** — ${c.type === 'percentage' ? c.value / 100 + '%' : c.value / 100 + ' $'} — استُخدم ${c.usageCount} مرة`
      ).join('\n')
      return `🎟️ **الكوبونات النشطة (${coupons.length}):**\n\n${list}`
    }
  },

  // coupon usage count
  {
    name: 'coupon_usage',
    patterns: [/كم مرة استُخدم|استخدام الكوبون|أداء الكوبون/i],
    async handler(_msg, ctx) {
      const coupons = await (prisma as any).coupon.findMany({
        where: { organizationId: ctx.orgId },
        orderBy: { usageCount: 'desc' }, take: 10,
      })
      if (!coupons.length) return 'ما في كوبونات مضافة بعد.'
      const list = coupons.map((c: any) =>
        `• **${c.code}** — استُخدم **${c.usageCount}** مرة${c.maxUsage ? ' من ' + c.maxUsage : ''}`
      ).join('\n')
      return `🎟️ **أداء الكوبونات:**\n\n${list}`
    }
  },

  // top spenders / best customers
  {
    name: 'top_customers',
    patterns: [/أكثر العملاء شراءً|أكثر العملاء إنفاقاً|أفضل العملاء|أعلى منفقين/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_customers', { segment: 'vip', limit: 10 }, ctx) as any
      const customers = r.customers || []
      if (!customers.length) return 'ما في بيانات عملاء كافية بعد.'
      const list = customers.slice(0, 5).map((c: any, i: number) =>
        `${i + 1}. ${c.name} — ${fmt(c.totalSpent)} — ${c.totalOrders} طلب`
      ).join('\n')
      return `👑 **أكثر العملاء شراءً:**\n\n${list}`
    }
  },

  // performance report / stats this month
  {
    name: 'performance_report',
    patterns: [/تقرير الأداء|إحصائيات هذا الشهر|إحصاءات الشهر|أداء المتجر/i],
    async handler(_msg, ctx) {
      const [r30, r7] = await Promise.all([
        executeTool('get_analytics', { period: '30d' }, ctx) as any,
        executeTool('get_analytics', { period: '7d' }, ctx) as any,
      ])
      return `📊 **تقرير الأداء:**\n\n` +
        `**آخر 30 يوم:**\n💰 إيراد: **${fmt((r30.totalRevenue ?? 0) * 100)}**\n📦 طلبات: ${r30.totalOrders ?? 0}\n\n` +
        `**آخر 7 أيام:**\n💰 إيراد: **${fmt((r7.totalRevenue ?? 0) * 100)}**\n📦 طلبات: ${r7.totalOrders ?? 0}`
    }
  },

  // add new product
  {
    name: 'add_product_hint',
    patterns: [/أضف منتج|إضافة منتج|منتج جديد/i],
    async handler() {
      return `لإضافة منتج جديد، اذهب إلى **المنتجات** في القائمة الجانبية ثم اضغط "إضافة منتج".\n\nأو أخبرني بتفاصيل المنتج (الاسم، السعر، الكمية) وسأساعدك.`
    }
  },

  // delivery time
  {
    name: 'delivery_time',
    patterns: [/متوسط وقت التوصيل|وقت التوصيل|كم يستغرق التوصيل/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_analytics', { period: '30d' }, ctx) as any
      const avgDays = r.avgDeliveryDays ?? 3
      return `🚚 متوسط وقت التوصيل (آخر 30 يوم): **${avgDays} أيام**`
    }
  },

  // list products
  {
    name: 'get_products',
    patterns: [/منتجاتي|قائمة المنتجات|عندي منتجات|كل المنتجات|وريني المنتجات|جميع المنتجات/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_products', { limit: 20 }, ctx) as any
      const products = r.products || []
      if (!products.length) return 'ما في منتجات مضافة بعد.'
      const list = products.map((p: any) => `• ${p.name} — ${fmt(p.price)} — مخزون: ${p.stock}`).join('\n')
      return `📦 **منتجاتك (${products.length}):**\n\n${list}`
    }
  },

  // customers
  {
    name: 'get_customers',
    patterns: [/عملائي|قائمة العملاء|كم عميل|العملاء الـ|شريحة/i],
    async handler(msg, ctx) {
      const segment = /vip|كبار/.test(msg) ? 'vip' : /وفي|مخلص/.test(msg) ? 'loyal' : undefined
      const r = await executeTool('get_customers', { segment, limit: 20 }, ctx) as any
      const customers = r.customers || []
      if (!customers.length) return 'ما في عملاء مسجلين بعد.'
      const list = customers.slice(0, 8).map((c: any) =>
        `• ${c.name} — ${c.city || 'غير محدد'} — ${c.totalOrders} طلب — ${fmt(c.totalSpent)} إجمالي`
      ).join('\n')
      return `👥 **العملاء${segment ? ` (${segment})` : ''} — ${customers.length} عميل:**\n\n${list}`
    }
  },

  // create coupon
  {
    name: 'create_coupon',
    patterns: [/أنشئ? كوبون|كوبون خصم|أضف كوبون/i],
    async handler(msg, ctx) {
      // Extract percent from message e.g. "كوبون خصم 20%"
      const pctMatch = msg.match(/(\d+)\s*%/)
      const fixedMatch = msg.match(/(\d+)\s*ج\.?م/)
      const namedCode = msg.match(/اسمه\s+([A-Z0-9]{2,15})/i) || msg.match(/رمزه\s+([A-Z0-9]{2,15})/i) || msg.match(/كود\s+([A-Z0-9]{2,15})/i)
      const codeMatch = namedCode ? null : msg.match(/[A-Z][A-Z0-9]{2,14}/)
      const value = pctMatch ? parseInt(pctMatch[1]) : fixedMatch ? parseInt(fixedMatch[1]) : 10
      const type = pctMatch ? 'percentage' : 'fixed'
      const code = namedCode ? namedCode[1].toUpperCase() : codeMatch ? codeMatch[0] : 'DEEMA' + Math.floor(Math.random() * 900 + 100)
      const r = await executeTool('create_coupon', { code, type, value, maxUsage: 100 }, ctx) as any
      const c = r.coupon
      return `🎟️ تم إنشاء الكوبون!\n\n• الرمز: **${c.code}**\n• الخصم: ${type === 'percentage' ? value + '%' : fmt(value * 100)}\n• الحد الأقصى: 100 استخدام`
    }
  },

  // ship orders
  {
    name: 'ship_orders',
    patterns: [/اشحن|شحن الطلبات? المقبولة|أرسل الطلبات/i],
    async handler(msg, ctx) {
      const r = await executeTool('get_orders', { status: 'accepted', limit: 50 }, ctx) as any
      const orders = r.orders || []
      if (!orders.length) return 'ما في طلبات مقبولة جاهزة للشحن.'
      const carrier = /أرامكس|aramex/.test(msg) ? 'aramex' : /نقل|naqel/.test(msg) ? 'naqel' : 'smsa'
      const res = await executeTool('create_shipments', { orderIds: orders.map((o: any) => o.id), carrier }, ctx) as any
      return `🚚 تم إنشاء **${res.created} شحنة** عبر ${carrier.toUpperCase()}!\n\nأرقام التتبع:\n${(res.trackingNumbers || []).map((t: string) => `• ${t}`).join('\n')}`
    }
  },

  // update price by percent
  {
    name: 'bulk_price',
    patterns: [/خفّض|رفع|زود|غيّر أسعار?|خصم \d+%|زيادة \d+%/i],
    async handler(msg, ctx) {
      const upMatch = msg.match(/(زود|ارفع|زيادة).*?(\d+)\s*%/i)
      const downMatch = msg.match(/(خفّض|خفض|خصم).*?(\d+)\s*%/i)
      const catMatch = msg.match(/(عطور|إلكترونيات|أزياء|عناية)/)
      if (!upMatch && !downMatch) return 'أخبرني النسبة المئوية، مثلاً: "خفّض أسعار العطور 10%"'
      const pctVal = upMatch ? parseInt(upMatch[2]) : -parseInt(downMatch![2])
      const category = catMatch ? catMatch[1] : undefined
      const r = await executeTool('bulk_update_prices', { percentChange: pctVal, category }, ctx) as any
      const dir = pctVal > 0 ? `زيادة ${pctVal}%` : `خصم ${Math.abs(pctVal)}%`
      return `✅ تم تحديث أسعار **${r.updated} منتج** بنسبة ${dir}${category ? ` في تصنيف "${category}"` : ''}!`
    }
  },

  // notifications
  {
    name: 'notifications',
    patterns: [/إشعارات?|أخبار|تنبيهات?|ايش الجديد/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_notifications', { limit: 5 }, ctx) as any
      const notifs = r.notifications || []
      if (!notifs.length) return '🔔 ما في إشعارات جديدة.'
      const list = notifs.map((n: any) => `• **${n.title}**${n.body ? '\n  ' + n.body : ''}`).join('\n')
      return `🔔 **آخر الإشعارات:**\n\n${list}`
    }
  },

  // AI memory / insights
  {
    name: 'memory',
    patterns: [/ذاكرة|رؤى|تعرف|ايش تعرف|معلوماتك عن متجري/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_ai_memory', {}, ctx) as any
      const memory = r.memory || []
      if (!memory.length) return 'ما جمعت رؤى كافية عن متجرك بعد. ابدأ باستخدام المتجر وسأتعلم!'
      const list = memory.map((m: any) => `• **${m.label || m.key}**: ${m.value} (ثقة ${Math.round(m.confidence * 100)}%)`).join('\n')
      return `🧠 **ما أعرفه عن متجرك:**\n\n${list}`
    }
  },

  // reject order
  {
    name: 'reject_order',
    patterns: [/ارفض طلب|رفض طلب #?(\w+)/i],
    async handler(msg, ctx) {
      const match = msg.match(/#?([a-z0-9]{6,})/i)
      if (!match) return 'أعطني رقم الطلب مثلاً: "ارفض طلب #10233"'
      // Find order by externalRef or id suffix
      const r = await executeTool('get_orders', { status: 'pending', limit: 50 }, ctx) as any
      const order = (r.orders || []).find((o: any) =>
        o.externalRef === match[1] || o.id.endsWith(match[1])
      )
      if (!order) return `ما لقيت طلب #${match[1]} في الطلبات المعلقة.`
      const res = await executeTool('reject_order', { orderId: order.id, reason: 'رفض من المتجر' }, ctx) as any
      return `❌ تم رفض طلب **#${order.externalRef || match[1]}** للعميل ${order.customerName}.`
    }
  },

  // coupons list
  {
    name: 'get_coupons',
    patterns: [/كوبونات|قائمة الكوبونات|عندي كوبون/i],
    async handler(_msg, ctx) {
      const coupons = await prisma.coupon.findMany({ where: { organizationId: ctx.orgId }, orderBy: { createdAt: 'desc' }, take: 10 })
      if (!coupons.length) return 'ما في كوبونات مضافة بعد. أنشئ كوبون الآن!'
      const list = coupons.map((c: any) =>
        `• **${c.code}** — ${c.type === 'percentage' ? c.value / 100 + '%' : c.value / 100 + ' $'} — استُخدم ${c.usageCount} مرة${c.maxUsage ? ' من ' + c.maxUsage : ''}`
      ).join('\n')
      return `🎟️ **كوبوناتك (${coupons.length}):**\n\n${list}`
    }
  },

  // activity log
  {
    name: 'activity_log',
    patterns: [/سجل الأنشطة|آخر الأنشطة|الأنشطة الأخيرة/i],
    async handler(_msg, ctx) {
      const logs = await prisma.activityLog.findMany({
        where: { organizationId: ctx.orgId },
        orderBy: { createdAt: 'desc' },
        take: 8,
      })
      if (!logs.length) return 'ما في أنشطة مسجلة بعد.'
      const list = logs.map((l: any) => `• ${l.summary} — ${new Date(l.createdAt).toLocaleString('ar-EG')}`).join('\n')
      return `📋 **آخر الأنشطة:**\n\n${list}`
    }
  },

  // help
  {
    name: 'help',
    patterns: [/مساعدة|ايش تقدر|شو تقدر|قدراتك|أوامر|كيف أستخدمك|شو تعرف تسوي/i],
    async handler() {
      return `أنا ديما، مساعدك الذكي لإدارة المتجر. إليك كل ما أقدر أفعله:\n\n` +
        `📦 **الطلبات**\n• "الطلبات المعلقة" / "اقبل كل الطلبات"\n• "اشحن الطلبات المقبولة" / "ارفض طلب #10233"\n• "أنشئ طلب للعميل محمد 0512..." — طلب يدوي\n• "ابحث عن طلب #10023" / "طلب اسمه محمد"\n• "الطلبات المشبوهة" — مخاطرة عالية\n\n` +
        `💵 **الكاش والمدفوعات**\n• "طلبات الكاش" — المبالغ غير المحصلة\n• "سجّل تحصيل كل الكاش"\n\n` +
        `📊 **التحليلات والتقارير**\n• "تقرير المبيعات" / "مبيعات آخر أسبوع"\n• "تقرير الأرباح الحقيقية"\n• "توقع المبيعات القادمة"\n• "أداء المتجر" — تقرير شامل\n\n` +
        `📦 **المنتجات والمخزون**\n• "مخزون منخفض" / "تقرير المخزون الكامل"\n• "أضف منتج اسمه X سعره 150 مخزون 30"\n• "أوقف منتج [الاسم]" / "احذف منتج [الاسم]"\n• "خفّض أسعار العطور 15%"\n\n` +
        `👥 **العملاء**\n• "عملائي" / "عملاء VIP" / "عملاء جدد"\n• "ابحث عن عميل محمد" / "أضف عميل [الاسم]"\n• "عملاء لم يشتروا" — churn\n• "احظر عميل [الاسم]"\n\n` +
        `👨‍💼 **الفريق والموظفين**\n• "فريقي" — قائمة الموظفين\n• "أضف موظف ahmed@domain.com"\n• "احذف موظف ahmed@domain.com"\n\n` +
        `🎟️ **الكوبونات**\n• "أنشئ كوبون خصم 20%" / "احذف كوبون SUMMER20"\n\n` +
        `↩️ **المرتجعات**\n• "إرجاع طلب #10023 بسبب تلف"\n• "المرتجعات" — قائمة كاملة\n\n` +
        `🧠 **الذاكرة**\n• "ايش تعرف عن متجري؟"`
    }
  },

  // General questions about today / status
  {
    name: 'today_summary',
    patterns: [/كيف حال المتجر|وضع المتجر|ملخص اليوم|ايش صار اليوم|احوال|أخبار المتجر/i],
    async handler(_msg, ctx) {
      const [pending, analytics, lowStock] = await Promise.all([
        executeTool('get_orders', { status: 'pending', limit: 5 }, ctx) as any,
        executeTool('get_analytics', { period: 'today' }, ctx) as any,
        executeTool('get_products', { lowStock: true, limit: 5 }, ctx) as any,
      ])
      const pendingCount = pending.count ?? pending.orders?.length ?? 0
      const revenue = analytics.totalRevenue ?? 0
      const lowStockCount = lowStock.products?.length ?? 0
      return `📊 **ملخص متجرك اليوم:**\n\n` +
        `📦 طلبات معلقة تنتظرك: **${pendingCount}**\n` +
        `💰 إيراد اليوم: **${fmt(revenue * 100)}**\n` +
        `⚠️ منتجات قاربت النفاد: **${lowStockCount}**\n\n` +
        (pendingCount > 0 ? `💡 ابدأ بـ "اقبل كل الطلبات" لمعالجة الطلبات المعلقة.` : '✅ كل شيء تمام!')
    }
  },

  // Questions about what to do / recommendations
  {
    name: 'recommendations',
    patterns: [/ايش أسوي|وش أسوي|ماذا أفعل|نصيحة|توصية|اقترح|ايش تنصح/i],
    async handler(_msg, ctx) {
      const [pending, lowStock] = await Promise.all([
        executeTool('get_orders', { status: 'pending', limit: 100 }, ctx) as any,
        executeTool('get_products', { lowStock: true, limit: 10 }, ctx) as any,
      ])
      const pendingCount = pending.count ?? pending.orders?.length ?? 0
      const lowStockCount = lowStock.products?.length ?? 0
      const tips: string[] = []
      if (pendingCount > 0) tips.push(`📦 عندك **${pendingCount} طلب معلق** — اقبلهم وابدأ الشحن`)
      if (lowStockCount > 0) tips.push(`⚠️ **${lowStockCount} منتج** مخزونه منخفض — أعد التعبئة قبل ما ينفد`)
      if (tips.length === 0) tips.push('✅ متجرك بوضع ممتاز! جرب "تقرير المبيعات" لتحليل أعمق')
      return `💡 **توصياتي لك الآن:**\n\n${tips.join('\n\n')}`
    }
  },

  // ── FEATURE: Add new product ─────────────────────────────────────────────────
  {
    name: 'create_product',
    patterns: [/أضف منتج|إضافة منتج|منتج جديد.*اسمه|اسمه.*سعره|أنشئ? منتج/i],
    async handler(msg, ctx) {
      const nameMatch = msg.match(/اسمه\s+(.+?)\s+(?:سعره|بسعر|ب)/) || msg.match(/منتج[:\s]+(.+?)\s+(?:سعره|بسعر|ب)/)
      const priceMatch = msg.match(/(?:سعره|بسعر|ب)\s*([\d,]+)/)
      const stockMatch = msg.match(/(?:مخزون|كمية|عدد)\s*([\d]+)/)
      const categoryMatch = msg.match(/(?:تصنيف|قسم|فئة)\s+(\S+)/)
      const costMatch = msg.match(/(?:تكلفة|سعر الشراء|كلفة)\s*([\d,]+)/)

      if (!nameMatch || !priceMatch) {
        return `لإضافة منتج أخبرني:\n• الاسم\n• السعر\n• الكمية (اختياري)\n\nمثال: **"أضف منتج اسمه عطر الورد سعره 150 مخزون 30"**`
      }

      const name = nameMatch[1].trim()
      const price = parseFloat(priceMatch[1].replace(/,/g, ''))
      const stock = stockMatch ? parseInt(stockMatch[1]) : 0
      const category = categoryMatch ? categoryMatch[1] : undefined
      const costPrice = costMatch ? parseFloat(costMatch[1].replace(/,/g, '')) : undefined

      const r = await executeTool('create_product', { name, price, stock, category, costPrice }, ctx) as any
      if (r.error) return `❌ ${r.error}`
      const p = r.product
      return `✅ **تم إضافة المنتج بنجاح!**\n\n• الاسم: **${p.name}**\n• السعر: **${p.price} ريال**\n• المخزون: **${p.stock} قطعة**${category ? `\n• التصنيف: ${category}` : ''}`
    }
  },

  // ── FEATURE: Returns ─────────────────────────────────────────────────────────
  {
    name: 'create_return',
    patterns: [/إرجاع|مرتجع|استرجاع|أرجع طلب|إرجاع طلب|رجع طلب/i],
    async handler(msg, ctx) {
      const match = msg.match(/#?([a-z0-9]{4,})/i)
      if (!match) return 'أعطني رقم الطلب، مثال: **"إرجاع طلب #10023"**'

      const r = await executeTool('get_orders', { status: 'all', limit: 100 }, ctx) as any
      const order = (r.orders || []).find((o: any) =>
        o.externalRef === match[1] || o.id.endsWith(match[1])
      )
      if (!order) return `ما لقيت طلب #${match[1]}.`

      const reasonMatch = msg.match(/(?:بسبب|سبب|لأن)\s+(.+)/)
      const reason = reasonMatch ? reasonMatch[1].trim() : 'طلب العميل'

      const res = await executeTool('create_return', { orderId: order.id, reason, restockItems: true }, ctx) as any
      if (res.error) return `❌ ${res.error}`
      return `↩️ **تم قبول المرتجع بنجاح!**\n\n• الطلب: **#${order.externalRef || match[1]}**\n• العميل: ${order.customerName}\n• السبب: ${reason}\n• المبلغ المسترد: **${(res.refundAmount).toLocaleString('ar-EG')} ريال**\n• المخزون: تم استعادته تلقائياً ✅`
    }
  },

  {
    name: 'get_returns',
    patterns: [/المرتجعات|قائمة المرتجعات|وريني المرتجعات|كم مرتجع/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_returns', { status: 'all', limit: 20 }, ctx) as any
      const returns = r.returns || []
      if (!returns.length) return '✅ ما في مرتجعات حالياً.'
      const list = returns.slice(0, 8).map((ret: any) =>
        `• طلب #${ret.orderId?.slice(-6)} — ${ret.reason} — ${(ret.refundAmount / 100).toLocaleString('ar-EG')} ريال`
      ).join('\n')
      return `↩️ **المرتجعات (${returns.length}):**\n\n${list}`
    }
  },

  // ── FEATURE: Real profit report ───────────────────────────────────────────────
  {
    name: 'profit_report',
    patterns: [/تقرير الأرباح|الأرباح الحقيقية|صافي الربح|هامش الربح|كم ربحت|ربح المتجر|تكلفة.*إيراد/i],
    async handler(msg, ctx) {
      const period = /أسبوع|7/.test(msg) ? '7d' : /90|3 شهر/.test(msg) ? '90d' : /اليوم/.test(msg) ? 'today' : '30d'
      const r = await executeTool('get_profit_report', { period }, ctx) as any
      const label = period === 'today' ? 'اليوم' : period === '7d' ? 'آخر 7 أيام' : period === '90d' ? 'آخر 90 يوم' : 'آخر 30 يوم'
      const fmt = (n: number) => n.toLocaleString('ar-EG', { minimumFractionDigits: 0 })
      return `💰 **تقرير الأرباح الحقيقية — ${label}**\n\n` +
        `📦 الطلبات: **${r.ordersCount}**\n` +
        `💵 الإيراد الكلي: **${fmt(r.totalRevenue)} ريال**\n` +
        `🏭 تكلفة البضاعة: ${fmt(r.totalCost)} ريال\n` +
        `🚚 تكلفة الشحن: ${fmt(r.totalShipping)} ريال\n` +
        `──────────────────\n` +
        `✅ **صافي الربح: ${fmt(r.netProfit)} ريال**\n` +
        `📊 هامش الربح: **${r.marginPercent}%**` +
        (r.note ? `\n\n⚠️ ${r.note}` : '')
    }
  },

  // ── FEATURE: Customer messages ────────────────────────────────────────────────
  {
    name: 'send_customer_message',
    patterns: [/أرسل رسالة|ارسل.*عميل|واتساب.*عميل|تواصل مع|راسل العميل|أبلغ العميل/i],
    async handler(msg, ctx) {
      const nameMatch = msg.match(/(?:للعميل|العميل|لـ)\s+(\S+)/)
      const msgMatch = msg.match(/(?:الرسالة|قل له|أخبره|النص)[:\s]+[""]?(.+?)[""]?$/)

      if (!msgMatch) {
        return `لإرسال رسالة لعميل قل:\n**"أرسل رسالة للعميل محمد الرسالة: شكراً لطلبك، سيصل غداً"**`
      }

      const customerName = nameMatch ? nameMatch[1] : 'العميل'
      const message = msgMatch[1].trim()

      const r = await executeTool('send_customer_message', { customerName, message, channel: 'whatsapp' }, ctx) as any
      return `📱 **تم تحضير الرسالة:**\n\n• إلى: **${customerName}**\n• القناة: WhatsApp\n• الرسالة: "${message}"\n\n⚠️ ${r.note}`
    }
  },

  {
    name: 'vip_followup',
    patterns: [/متابعة.*VIP|عملاء VIP|كبار العملاء|أفضل عملاء|راسل.*VIP/i],
    async handler(_msg, ctx) {
      const r = await executeTool('analyze_customers', {}, ctx) as any
      const vip = r.vip || []
      if (!vip.length) return 'ما في عملاء VIP بعد — يحتاج العميل 5+ طلبات أو إنفاق 1000+ ريال.'
      const list = vip.slice(0, 5).map((c: any) =>
        `• **${c.name}** — ${c.totalOrders} طلب — ${c.totalSpent?.toLocaleString('ar-EG')} ريال`
      ).join('\n')
      return `👑 **عملاء VIP (${vip.length}):**\n\n${list}\n\n💡 قول "أرسل رسالة للعميل [الاسم] الرسالة: [النص]" للتواصل معهم`
    }
  },

  // ── Create manual order ─────────────────────────────────────────────────────
  {
    name: 'create_order',
    patterns: [/أنشئ? طلب|طلب جديد|طلب يدوي|أضف طلب|سجّل طلب|إنشاء طلب/i],
    async handler(msg, ctx) {
      const nameMatch = msg.match(/(?:للعميل|الزبون|العميل)[:\s]+(\S+(?:\s+\S+)?)/i)
        || msg.match(/(?:اسمه|اسم العميل)[:\s]+(\S+(?:\s+\S+)?)/i)
      const phoneMatch = msg.match(/(?:رقمه|رقم الجوال|جوال|الرقم)[:\s]*(05\d{8}|\d{10})/i)
        || msg.match(/(05\d{8})/)
      const cityMatch = msg.match(/(?:مدينة|من|في)[:\s]+(\S+)/i)
      const productMatch = msg.match(/(?:منتج|بضاعة|سلعة)[:\s]+(.+?)(?:\s+سعر|\s+بسعر|$)/i)
      const priceMatch = msg.match(/(?:سعره?|بسعر|ثمنه)[:\s]*([\d,]+)/i) || msg.match(/([\d,]{2,}) ريال/i)

      if (!nameMatch || !priceMatch) {
        return `لإنشاء طلب يدوي أخبرني:\n• اسم العميل\n• رقم الجوال\n• المدينة\n• المنتج والسعر\n\nمثال:\n**"أنشئ طلب للعميل محمد 0512345678 من الرياض منتج عطر سعره 150"**`
      }

      const customerName = nameMatch[1].trim()
      const customerPhone = phoneMatch?.[1] ?? undefined
      const city = cityMatch?.[1] ?? 'غير محدد'
      const productName = productMatch?.[1]?.trim() ?? 'منتج'
      const price = parseFloat(priceMatch[1].replace(/,/g, ''))

      const r = await executeTool('create_order', {
        customerName, customerPhone, city,
        items: [{ name: productName, qty: 1, unitPrice: price }],
        paymentMethod: /كاش|نقد/.test(msg) ? 'cash' : 'card',
      }, ctx) as any

      if (r.error) return `❌ ${r.error}`
      const o = r.order
      return `✅ **تم إنشاء الطلب بنجاح!**\n\n• رقم الطلب: **#${o.externalRef}**\n• العميل: ${o.customerName}\n• المدينة: ${o.city}\n• الإجمالي: **${o.total} ريال**\n• الحالة: معلق`
    }
  },

  // ── Team management ──────────────────────────────────────────────────────────
  {
    name: 'get_team',
    patterns: [/فريقي|أعضاء الفريق|موظفيني|الموظفين|من في الفريق|أعضاء|قائمة الفريق/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_team', {}, ctx) as any
      const members = r.members || []
      if (!members.length) return 'ما في أعضاء في الفريق بعد. ادعُ موظفاً بقول "أضف موظف [البريد الإلكتروني]"'
      const roleLabels: Record<string, string> = { ADMIN: 'مسؤول', ORDER_MANAGER: 'مدير طلبات', CUSTOMER_SERVICE: 'خدمة عملاء' }
      const list = members.map((m: any) =>
        `• **${m.name}** — ${roleLabels[m.role] || m.role} — ${m.email}`
      ).join('\n')
      return `👥 **فريقك (${members.length} عضو):**\n\n${list}`
    }
  },

  {
    name: 'invite_member',
    patterns: [/أضف موظف|دعوة موظف|ادعُ|أضف عضو|موظف جديد|إضافة موظف/i],
    async handler(msg, ctx) {
      const emailMatch = msg.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)
      if (!emailMatch) return 'أعطني البريد الإلكتروني للموظف.\n\nمثال: **"أضف موظف ahmed@domain.com"**'

      const role = /مسؤول|admin/i.test(msg) ? 'ADMIN'
        : /خدمة عملاء|customer/i.test(msg) ? 'CUSTOMER_SERVICE'
        : 'ORDER_MANAGER'

      const r = await executeTool('invite_team_member', { email: emailMatch[0], role }, ctx) as any
      if (r.error) return `❌ ${r.error}`

      const roleLabels: Record<string, string> = { ADMIN: 'مسؤول', ORDER_MANAGER: 'مدير طلبات', CUSTOMER_SERVICE: 'خدمة عملاء' }
      return `✅ **تم إضافة الموظف!**\n\n• البريد: **${emailMatch[0]}**\n• الدور: ${roleLabels[role]}\n\n💡 سيتمكن من تسجيل الدخول بهذا البريد.`
    }
  },

  {
    name: 'remove_member',
    patterns: [/احذف موظف|أزل موظف|فصل موظف|إزالة عضو/i],
    async handler(msg, ctx) {
      const emailMatch = msg.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)
      if (!emailMatch) return 'أعطني البريد الإلكتروني للموظف الذي تريد إزالته.'

      const r = await executeTool('remove_team_member', { memberEmail: emailMatch[0] }, ctx) as any
      if (r.error) return `❌ ${r.error}`
      return `✅ تم إزالة الموظف **${emailMatch[0]}** من الفريق.`
    }
  },

  // ── Cash collection ──────────────────────────────────────────────────────────
  {
    name: 'cash_orders',
    patterns: [/طلبات كاش|طلبات نقدية|كاش لم يُحصّل|ديون الكاش|طلبات بالكاش غير محصلة/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_cash_orders', { limit: 30 }, ctx) as any
      const orders = r.orders || []
      if (!orders.length) return '✅ كل طلبات الكاش محصّلة، ما في مبالغ معلقة.'
      const list = orders.slice(0, 8).map((o: any) =>
        `• #${o.externalRef || o.id.slice(-6)} — ${o.customerName} — ${(o.total / 100).toLocaleString('ar-EG')} ريال — ${o.city}`
      ).join('\n')
      return `💵 **طلبات الكاش غير المحصّلة (${orders.length}):**\n\n${list}\n\n💰 **إجمالي المبالغ: ${r.totalUnpaid.toLocaleString('ar-EG')} ريال**\n\nقول "سجّل تحصيل كل الكاش" لتحديثها.`
    }
  },

  {
    name: 'collect_cash',
    patterns: [/سجّل تحصيل|تحصيل الكاش|حصّلت الكاش|تم التحصيل|وصل الكاش/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_cash_orders', { limit: 100 }, ctx) as any
      const orders = r.orders || []
      if (!orders.length) return '✅ ما في طلبات كاش تحتاج تحصيل.'
      const ids = orders.map((o: any) => o.id)
      await executeTool('mark_payment_collected', { orderIds: ids }, ctx)
      return `✅ **تم تسجيل تحصيل ${orders.length} طلب كاش بنجاح!**\n\n💰 المبلغ المحصّل: **${r.totalUnpaid.toLocaleString('ar-EG')} ريال**`
    }
  },

  // ── Product management ───────────────────────────────────────────────────────
  {
    name: 'deactivate_product',
    patterns: [/أوقف منتج|عطّل منتج|أخفِ منتج|إيقاف منتج|أخرج منتج|سحب منتج/i],
    async handler(msg, ctx) {
      const nameMatch = msg.match(/(?:منتج|اسمه)[:\s]+(.+?)(?:\s*$)/i)
      if (!nameMatch) return 'أخبرني اسم المنتج.\n\nمثال: **"أوقف منتج عطر الورد"**'
      const r = await executeTool('deactivate_product', { productName: nameMatch[1].trim() }, ctx) as any
      if (r.error) return `❌ ${r.error}`
      return `⏸️ تم إيقاف منتج **"${r.name}"** — لن يظهر للعملاء حتى تعيد تشغيله.`
    }
  },

  {
    name: 'delete_product',
    patterns: [/احذف منتج|حذف منتج|امسح منتج/i],
    async handler(msg, ctx) {
      const nameMatch = msg.match(/(?:منتج|اسمه)[:\s]+(.+?)(?:\s*$)/i)
      if (!nameMatch) return 'أخبرني اسم المنتج.\n\nمثال: **"احذف منتج عطر الورد"**'
      const r = await executeTool('delete_product', { productName: nameMatch[1].trim() }, ctx) as any
      if (r.error) return `❌ ${r.error}`
      return `🗑️ تم حذف منتج **"${r.name}"** بنجاح.`
    }
  },

  // ── Search ───────────────────────────────────────────────────────────────────
  {
    name: 'search_order',
    patterns: [/ابحث عن طلب|بحث طلب|فين طلب|وين طلب|أين طلب|طلب رقم|طلب اسمه/i],
    async handler(msg, ctx) {
      const match = msg.match(/(?:طلب|رقم|بحث)[:\s]+#?(\S+)/i)
        || msg.match(/#?([a-z0-9]{4,})/i)
        || msg.match(/اسمه\s+(\S+)/i)
      if (!match) return 'أعطني رقم الطلب أو اسم العميل.\n\nمثال: **"ابحث عن طلب #10023"** أو **"طلب اسمه محمد"**'

      const r = await executeTool('search_order', { query: match[1] }, ctx) as any
      const orders = r.orders || []
      if (!orders.length) return `ما لقيت طلبات بـ "${match[1]}".`
      const list = orders.map((o: any) =>
        `• #${o.externalRef || o.id.slice(-6)} — ${o.customerName} — ${fmt(o.total)} — ${statusLabels[o.status] || o.status} — ${o.city}`
      ).join('\n')
      return `🔍 **نتائج البحث (${orders.length}):**\n\n${list}`
    }
  },

  {
    name: 'search_customer',
    patterns: [/ابحث عن عميل|بحث عميل|فين عميل|عميل اسمه|هل عندي عميل/i],
    async handler(msg, ctx) {
      const match = msg.match(/(?:عميل|اسمه|رقم)[:\s]+(\S+(?:\s+\S+)?)/i)
        || msg.match(/(05\d{8})/)
      if (!match) return 'أعطني اسم العميل أو رقم جواله.\n\nمثال: **"ابحث عن عميل محمد"**'

      const r = await executeTool('search_customer', { query: match[1] }, ctx) as any
      const customers = r.customers || []
      if (!customers.length) return `ما لقيت عملاء بـ "${match[1]}".`
      const list = customers.map((c: any) =>
        `• **${c.name}** — ${c.city || '—'} — ${c.totalOrders} طلب — ${fmt(c.totalSpent)}`
      ).join('\n')
      return `🔍 **نتائج البحث (${customers.length}):**\n\n${list}`
    }
  },

  // ── Add customer ─────────────────────────────────────────────────────────────
  {
    name: 'add_customer',
    patterns: [/أضف عميل|عميل جديد|سجّل عميل|أنشئ? عميل/i],
    async handler(msg, ctx) {
      const nameMatch = msg.match(/(?:اسمه|الاسم)[:\s]+(\S+(?:\s+\S+)?)/i)
        || msg.match(/(?:عميل)[:\s]+(\S+(?:\s+\S+)?)/i)
      const phoneMatch = msg.match(/(05\d{8})/)
      const cityMatch = msg.match(/(?:من|مدينة|في)[:\s]+(\S+)/i)

      if (!nameMatch) return 'أعطني اسم العميل.\n\nمثال: **"أضف عميل اسمه محمد 0512345678 من جدة"**'

      const r = await executeTool('add_customer', {
        name: nameMatch[1].trim(),
        phone: phoneMatch?.[1],
        city: cityMatch?.[1],
      }, ctx) as any

      if (r.error) return `❌ ${r.error}`
      const c = r.customer
      return `✅ **تم إضافة العميل!**\n\n• الاسم: **${c.name}**${c.phone ? `\n• الجوال: ${c.phone}` : ''}${c.city ? `\n• المدينة: ${c.city}` : ''}`
    }
  },

  // ── Block customer ────────────────────────────────────────────────────────────
  {
    name: 'block_customer',
    patterns: [/احظر عميل|حظر عميل|بلوك عميل|أوقف عميل|امنع عميل/i],
    async handler(msg, ctx) {
      const match = msg.match(/(?:عميل|اسمه)[:\s]+(\S+(?:\s+\S+)?)/i)
        || msg.match(/(05\d{8})/)
      if (!match) return 'أعطني اسم أو رقم العميل.\n\nمثال: **"احظر عميل محمد"**'

      const r = await executeTool('search_customer', { query: match[1] }, ctx) as any
      const customers = r.customers || []
      if (!customers.length) return `ما لقيت عميل بـ "${match[1]}".`
      const c = customers[0]
      const res = await executeTool('block_customer', { customerId: c.id }, ctx) as any
      if (res.error) return `❌ ${res.error}`
      return `🚫 تم حظر العميل **${c.name}** — لن يتمكن من الطلب مجدداً.`
    }
  },

  // ── Delete coupon ─────────────────────────────────────────────────────────────
  {
    name: 'delete_coupon',
    patterns: [/احذف كوبون|أوقف كوبون|ألغِ كوبون|أبطل كوبون/i],
    async handler(msg, ctx) {
      const codeMatch = msg.match(/(?:كوبون|رمز)[:\s]+([A-Z0-9]{2,15})/i)
        || msg.match(/([A-Z][A-Z0-9]{3,14})/)
      if (!codeMatch) return 'أعطني رمز الكوبون.\n\nمثال: **"احذف كوبون SUMMER20"**'
      const r = await executeTool('delete_coupon', { code: codeMatch[1].toUpperCase() }, ctx) as any
      if (r.error) return `❌ ${r.error}`
      return `🗑️ تم إيقاف الكوبون **${r.deleted}** — لن يمكن استخدامه بعد الآن.`
    }
  },

  // ── Risk orders ───────────────────────────────────────────────────────────────
  {
    name: 'risk_orders',
    patterns: [/طلبات مشبوهة|طلبات خطرة|مخاطرة عالية|تقرير المخاطر|طلبات بمخاطرة/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_risk_orders', { minRisk: 60, limit: 20 }, ctx) as any
      const orders = r.orders || []
      if (!orders.length) return '✅ ما في طلبات مشبوهة حالياً.'
      const list = orders.map((o: any) =>
        `• #${o.externalRef || o.id.slice(-6)} — ${o.customerName} — ${fmt(o.total)} — ⚠️ مخاطرة ${o.riskScore}%`
      ).join('\n')
      return `⚠️ **الطلبات المشبوهة (${orders.length}):**\n\n${list}\n\n💡 راجع كل طلب قبل الشحن. قول "ارفض طلب #XXXX" لرفض أي منها.`
    }
  },

  // ── Stores ────────────────────────────────────────────────────────────────────
  {
    name: 'get_stores',
    patterns: [/متاجري|متجري|المتاجر المرتبطة|ايش المتاجر|المتاجر الموصولة/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_stores', {}, ctx) as any
      const stores = r.stores || []
      if (!stores.length) return 'ما في متاجر مرتبطة بعد. اذهب لـ "ربط متجر" لإضافة متجرك.'
      const list = stores.map((s: any) =>
        `• **${s.name}** — ${s.platform} — ${s.isActive ? '✅ نشط' : '⏸️ موقوف'}`
      ).join('\n')
      return `🏪 **متاجرك (${stores.length}):**\n\n${list}`
    }
  },

  // ── Churn risk customers ──────────────────────────────────────────────────────
  {
    name: 'churn_customers',
    patterns: [/عملاء لم يشتروا|عملاء مهجورين|عملاء غابوا|عملاء خسرناهم|churn|عملاء مفقودين/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_churn_customers', {}, ctx) as any
      const customers = r.customers || []
      if (!customers.length) return '✅ ما في عملاء في خطر الاختفاء.'
      const list = customers.slice(0, 8).map((c: any) =>
        `• **${c.name}** — ${c.totalOrders} طلب — ${fmt(c.totalSpent)} إجمالي — آخر طلب: ${c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('ar-EG') : 'غير معروف'}`
      ).join('\n')
      return `⚠️ **${customers.length} عميل لم يشتر منذ ${r.daysInactive}+ يوم:**\n\n${list}\n\n💡 أرسل لهم رسالة أو كوبون خصم لاستعادتهم.`
    }
  },

  // ── New customers ─────────────────────────────────────────────────────────────
  {
    name: 'new_customers',
    patterns: [/عملاء جدد|العملاء الجدد|كم عميل جديد|عملاء هذا الشهر/i],
    async handler(msg, ctx) {
      const days = /أسبوع|7/.test(msg) ? 7 : 30
      const r = await executeTool('get_new_customers', { days, limit: 10 }, ctx) as any
      const customers = r.customers || []
      const label = days === 7 ? 'آخر 7 أيام' : 'آخر 30 يوم'
      if (!customers.length) return `ما في عملاء جدد في ${label}.`
      const list = customers.slice(0, 6).map((c: any) =>
        `• **${c.name}** — ${c.city || '—'}${c.phone ? ' — ' + c.phone : ''}`
      ).join('\n')
      return `🆕 **${customers.length} عميل جديد (${label}):**\n\n${list}`
    }
  },

  // ── Inventory forecast ────────────────────────────────────────────────────────
  {
    name: 'inventory_report',
    patterns: [/تقرير المخزون الكامل|وضع المخزون|تقرير الجرد|كامل المخزون/i],
    async handler(_msg, ctx) {
      const r = await executeTool('inventory_report', {}, ctx) as any
      const out = r.outOfStock || {}
      const low = r.lowStock || {}
      return `📦 **تقرير المخزون الكامل:**\n\n` +
        `• إجمالي المنتجات: **${r.total}**\n` +
        `• 🔴 نافدة: **${out.count || 0}** منتج\n` +
        `• 🟡 منخفضة: **${low.count || 0}** منتج\n` +
        `• ✅ كافية: **${r.healthy || 0}** منتج\n` +
        `• 💰 قيمة المخزون الكلية: **${(r.totalInventoryValue || 0).toLocaleString('ar-EG')} ريال**\n\n` +
        (low.alerts?.length ? `**أقرب منتجات للنفاد:**\n` +
          low.alerts.slice(0, 5).map((a: any) =>
            `• ${a.name} — ${a.stock} قطعة — متبقي **${a.daysLeft} يوم**`
          ).join('\n') : '')
    }
  },

  // ── Sales forecast ────────────────────────────────────────────────────────────
  {
    name: 'sales_forecast',
    patterns: [/توقع المبيعات|المبيعات القادمة|توقع الأسبوع القادم|ما المتوقع|متوقع الأسبوع/i],
    async handler(_msg, ctx) {
      const r = await executeTool('sales_forecast', {}, ctx) as any
      const fc = r.nextWeekForecast || {}
      return `📈 **توقع الأسبوع القادم:**\n\n` +
        `💰 الإيراد المتوقع: **${(fc.revenue || 0).toLocaleString('ar-EG')} ريال**\n` +
        `📦 الطلبات المتوقعة: **${fc.orders || 0} طلب**\n\n` +
        `📊 الاتجاه العام: **${r.trendLabel || '—'}** (${r.trend >= 0 ? '+' : ''}${r.trend}% مقارنة ببداية الشهر)`
    }
  },

  // ── Thank you / appreciation
  {
    name: 'thanks',
    patterns: [/شكر|ممتاز|عظيم|حلو|تمام|مشكور|برافو|أحسنت|يسلمو|الله يعطيك/i],
    async handler() {
      const replies = [
        'العفو! دائماً في خدمتك 😊',
        'يسعدني! في أي شيء آخر أقدر أساعدك؟',
        'شكراً لك! هل تحتاج شيء آخر؟',
        'الشكر لله! متجرك يشتغل عال العال 💪',
      ]
      return replies[Math.floor(Math.random() * replies.length)]
    }
  },

  // Who are you
  {
    name: 'identity',
    patterns: [/من أنت|من انت|عرّف نفسك|ايش اسمك|شو اسمك|انت من|انت ايش/i],
    async handler() {
      return `أنا **ديما** 🤖 — مساعدك الذكي لإدارة متجرك الإلكتروني!\n\nأقدر أساعدك في إدارة الطلبات، تحليل المبيعات، متابعة المخزون، وإنشاء كوبونات الخصم — كل ذلك بالعربية.\n\nكيف أقدر أساعدك اليوم؟`
    }
  },
]

// ── Smart contextual fallback ─────────────────────────────────────────────────

async function smartFallback(msg: string, ctx: ChatCtx): Promise<string> {
  try {
    const [pendingR, analyticsR, lowStockR] = await Promise.all([
      executeTool('get_orders', { status: 'pending', limit: 100 }, ctx).catch(() => ({ orders: [], count: 0 })) as any,
      executeTool('get_analytics', { period: '7d' }, ctx).catch(() => null) as any,
      executeTool('get_products', { lowStock: true, limit: 5 }, ctx).catch(() => ({ products: [] })) as any,
    ])

    const pendingCount = pendingR.count ?? pendingR.orders?.length ?? 0
    const revenue = analyticsR?.totalRevenue ?? 0
    const lowStockCount = lowStockR.products?.length ?? 0

    const storeCtx = [
      pendingCount > 0 ? `📦 عندك **${pendingCount} طلب معلق**` : null,
      revenue > 0 ? `💰 إيراد آخر 7 أيام: **${fmt(revenue * 100)}**` : null,
      lowStockCount > 0 ? `⚠️ **${lowStockCount} منتج** بمخزون منخفض` : null,
    ].filter(Boolean).join('\n')

    const suggestions = [
      pendingCount > 0 ? '"اقبل كل الطلبات"' : null,
      lowStockCount > 0 ? '"مخزون منخفض"' : null,
      '"تقرير المبيعات"',
      '"مساعدة"',
    ].filter(Boolean).slice(0, 3).map(s => `• ${s}`).join('\n')

    let response = `فهمت! دعني أفيدك بما يخص متجرك:\n\n`
    if (storeCtx) response += `${storeCtx}\n\n`
    response += `هل تريد أن أساعدك في شيء من هذا؟\n${suggestions}`

    return response
  } catch {
    return `أنا ديما وأنا هنا لمساعدتك! 😊\n\nجرّب:\n• "الطلبات المعلقة"\n• "تقرير المبيعات"\n• "مساعدة" — لعرض كل ما أقدر أفعله`
  }
}

// ── Main dispatch ─────────────────────────────────────────────────────────────

export async function freeChat(
  message: string,
  ctx: ChatCtx
): Promise<{ response: string; toolsUsed: string[] }> {
  const msg = message.trim()

  for (const intent of INTENTS) {
    if (intent.patterns.some(p => p.test(msg))) {
      try {
        const response = await intent.handler(msg, ctx)
        return { response, toolsUsed: [intent.name] }
      } catch (err) {
        console.error('freeEngine error:', err)
        return { response: 'عذراً، صار خطأ أثناء تنفيذ الطلب. حاول مجدداً.', toolsUsed: [] }
      }
    }
  }

  const response = await smartFallback(msg, ctx)
  return { response, toolsUsed: ['context_lookup'] }
}
