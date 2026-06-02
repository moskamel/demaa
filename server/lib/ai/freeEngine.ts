// Free AI engine — understands Arabic commands and uses real DB tools
// Runs when no ANTHROPIC_API_KEY is set. No external API needed.

import { executeTool } from './executor.js'
import prisma from '../prisma.js'

interface ChatCtx { orgId: string; userId?: string; conversationId: string }

interface Intent {
  name: string
  patterns: RegExp[]
  handler: (msg: string, ctx: ChatCtx) => Promise<string>
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return (n / 100).toLocaleString('ar-EG', { minimumFractionDigits: 0 }) + ' ج.م' }
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
    patterns: [/مخزون (منخفض|ناقص|نفد)|نفد المخزون|مخزون قليل|منتجات? ناقص/i, /المنتجات المنخفضة/i, /كام باقي/i],
    async handler(_msg, ctx) {
      const r = await executeTool('get_products', { lowStock: true, limit: 20 }, ctx) as any
      const products = r.products || []
      if (!products.length) return '✅ المخزون كامل، ما في منتجات تحتاج تعبئة.'
      const list = products.map((p: any) => `• ${p.name} — باقي **${p.stock}** قطعة`).join('\n')
      return `⚠️ **${products.length} منتج بمخزون منخفض:**\n\n${list}`
    }
  },

  // list products
  {
    name: 'get_products',
    patterns: [/منتجاتي|قائمة المنتجات|عندي منتجات|كل المنتجات|وريني المنتجات/i],
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
      const codeMatch = msg.match(/[A-Z]{3,10}/)
      const value = pctMatch ? parseInt(pctMatch[1]) : fixedMatch ? parseInt(fixedMatch[1]) : 10
      const type = pctMatch ? 'percentage' : 'fixed'
      const code = codeMatch ? codeMatch[0] : 'DEEMA' + Math.floor(Math.random() * 900 + 100)
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
        `• **${c.code}** — ${c.type === 'percentage' ? c.value / 100 + '%' : c.value / 100 + ' ج.م'} — استُخدم ${c.usageCount} مرة${c.maxUsage ? ' من ' + c.maxUsage : ''}`
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
    patterns: [/مساعدة|ايش تقدر|شو تقدر|قدراتك|أوامر/i],
    async handler() {
      return `أنا ديما، مساعدك الذكي لإدارة المتجر. إليك ما أقدر أفعله:\n\n` +
        `📦 **الطلبات**\n• "الطلبات المعلقة" — عرض الطلبات\n• "اقبل كل الطلبات" — قبول جماعي\n• "اشحن الطلبات المقبولة" — إنشاء شحنات\n• "ارفض طلب #10233" — رفض طلب\n\n` +
        `📊 **التحليلات**\n• "تقرير المبيعات" — إحصاءات شاملة\n• "مبيعات آخر أسبوع"\n\n` +
        `📦 **المنتجات**\n• "مخزون منخفض" — منتجات قاربت النفاد\n• "خفّض أسعار العطور 15%"\n• "زود أسعار الإلكترونيات 10%"\n\n` +
        `👥 **العملاء**\n• "عملائي" — قائمة العملاء\n• "عملاء VIP"\n\n` +
        `🎟️ **الكوبونات**\n• "أنشئ كوبون خصم 20%"\n• "أنشئ كوبون SUMMER30 بخصم 30%"\n\n` +
        `🧠 **الذاكرة**\n• "ايش تعرف عن متجري؟"`
    }
  },
]

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

  // Fallback — show pending orders as default helpful context
  try {
    const r = await executeTool('get_orders', { status: 'pending', limit: 5 }, ctx) as any
    const count = r.count || 0
    if (count > 0) {
      return {
        response: `ما فهمت طلبك تماماً، لكن عندك **${count} طلب معلق** يحتاج اهتمامك.\n\nأكتب "مساعدة" لقائمة الأوامر المتاحة، أو جرب:\n• "الطلبات المعلقة"\n• "تقرير المبيعات"\n• "مخزون منخفض"`,
        toolsUsed: ['get_orders'],
      }
    }
  } catch { /* silent */ }

  return {
    response: 'أكتب "مساعدة" لعرض قائمة الأوامر المتاحة.',
    toolsUsed: [],
  }
}
