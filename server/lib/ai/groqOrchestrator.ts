// Groq AI orchestrator — uses Llama 3.3 70B (free) with real DB tool use
import Groq from 'groq-sdk'
import { executeTool } from './executor.js'
import prisma from '../prisma.js'

let groq: Groq | null = null
function getGroq(): Groq {
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return groq
}

export interface ChatContext {
  orgId: string
  userId?: string
  conversationId: string
}

const INJECTION_PATTERNS = [
  /ignore (previous|all|above|prior) instructions/i,
  /you are now|pretend you|act as|roleplay as/i,
  /system:\s*you/i,
  /reveal your (system|prompt|instructions)/i,
]

// Convert our tool schema to Groq/OpenAI format
const GROQ_TOOLS: Groq.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_orders',
      description: 'جلب قائمة الطلبات من قاعدة البيانات',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'shipped', 'delivered', 'all'] },
          city: { type: 'string' },
          payment: { type: 'string' },
          limit: { type: 'number' },
          riskMin: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'accept_orders',
      description: 'قبول طلبات معلقة',
      parameters: {
        type: 'object',
        properties: {
          orderIds: { type: 'array', items: { type: 'string' } },
        },
        required: ['orderIds'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reject_order',
      description: 'رفض طلب معلق',
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['orderId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_shipments',
      description: 'إنشاء شحنات للطلبات المقبولة',
      parameters: {
        type: 'object',
        properties: {
          orderIds: { type: 'array', items: { type: 'string' } },
          carrier: { type: 'string' },
        },
        required: ['orderIds'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_products',
      description: 'جلب قائمة المنتجات',
      parameters: {
        type: 'object',
        properties: {
          lowStock: { type: 'boolean' },
          category: { type: 'string' },
          limit: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_product',
      description: 'تحديث سعر أو مخزون منتج',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          price: { type: 'number' },
          stock: { type: 'number' },
          percentChange: { type: 'number' },
        },
        required: ['productId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'bulk_update_prices',
      description: 'تحديث أسعار منتجات بنسبة مئوية',
      parameters: {
        type: 'object',
        properties: {
          percentChange: { type: 'number' },
          category: { type: 'string' },
        },
        required: ['percentChange'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_analytics',
      description: 'تقرير مبيعات وتحليلات المتجر',
      parameters: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['today', '7d', '30d', '90d'] },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_coupon',
      description: 'إنشاء كوبون خصم',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          type: { type: 'string', enum: ['percentage', 'fixed'] },
          value: { type: 'number' },
          minOrder: { type: 'number' },
          maxUsage: { type: 'number' },
          expiresInDays: { type: 'number' },
        },
        required: ['code', 'type', 'value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_customers',
      description: 'جلب قائمة العملاء',
      parameters: {
        type: 'object',
        properties: {
          segment: { type: 'string', enum: ['vip', 'loyal', 'regular', 'new', 'all'] },
          city: { type: 'string' },
          limit: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_notifications',
      description: 'جلب الإشعارات الأخيرة',
      parameters: {
        type: 'object',
        properties: {
          unreadOnly: { type: 'boolean' },
          limit: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_ai_memory',
      description: 'استرجاع الذاكرة والرؤى عن المتجر',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_product',
      description: 'إضافة منتج جديد إلى المتجر بالاسم والسعر والكمية',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'number', description: 'سعر البيع بالريال' },
          stock: { type: 'number' },
          category: { type: 'string' },
          description: { type: 'string' },
          sku: { type: 'string' },
          costPrice: { type: 'number', description: 'سعر التكلفة بالريال' },
        },
        required: ['name', 'price'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_customer_message',
      description: 'إرسال رسالة متابعة أو تواصل مع عميل معين',
      parameters: {
        type: 'object',
        properties: {
          customerId: { type: 'string' },
          customerName: { type: 'string' },
          channel: { type: 'string', enum: ['whatsapp', 'sms', 'email'] },
          message: { type: 'string' },
          orderId: { type: 'string' },
        },
        required: ['message'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_return',
      description: 'إنشاء مرتجع لطلب — يعيد المخزون تلقائياً ويسجل السبب',
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'string' },
          reason: { type: 'string' },
          refundAmount: { type: 'number' },
          restockItems: { type: 'boolean' },
        },
        required: ['orderId', 'reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_returns',
      description: 'جلب قائمة المرتجعات',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'all'] },
          limit: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_profit_report',
      description: 'تقرير الأرباح الحقيقية — إيرادات وتكاليف وهامش الربح الصافي',
      parameters: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['today', '7d', '30d', '90d'] },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_customers',
      description: 'تحليل متقدم للعملاء: churn risk، VIP، عملاء جدد لم يعيدوا الشراء، أعلى منفقين',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'inventory_report',
      description: 'تقرير المخزون الكامل: منتجات نافدة، منخفضة، تنبيهات إعادة طلب مع توقع أيام متبقية',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'sales_forecast',
      description: 'توقع مبيعات الأسبوع القادم بناءً على بيانات الأسابيع الـ١٢ الماضية مع اتجاه النمو',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'restock_product',
      description: 'تجديد مخزون منتج — إضافة كمية أو تحديد رقم جديد',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          addQty: { type: 'number' },
          newStock: { type: 'number' },
        },
        required: ['productId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'track_shipment',
      description: 'تتبع شحنة حقيقي عبر Aramex أو SMSA أو J&T — يجلب آخر حالة وتاريخ الأحداث',
      parameters: {
        type: 'object',
        properties: {
          trackingNumber: { type: 'string', description: 'رقم التتبع' },
          carrier: { type: 'string', enum: ['aramex', 'smsa', 'jtexpress'], description: 'شركة الشحن' },
          orderId: { type: 'string', description: 'معرف الطلب — يُستخدم إذا لم يُعطَ رقم التتبع' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_failed_deliveries',
      description: 'جلب الشحنات الفاشلة والمعادة والطلبات العالقة منذ أكثر من 10 أيام',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_order',
      description: 'إنشاء طلب يدوي جديد للعميل مع منتجات وسعر',
      parameters: {
        type: 'object',
        properties: {
          customerName: { type: 'string' },
          customerPhone: { type: 'string' },
          city: { type: 'string' },
          paymentMethod: { type: 'string', enum: ['cash', 'card', 'tabby', 'tamara'] },
          notes: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                qty: { type: 'number' },
                unitPrice: { type: 'number' },
                productId: { type: 'string' },
              },
              required: ['name', 'qty', 'unitPrice'],
            },
          },
        },
        required: ['customerName', 'city', 'items'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_team',
      description: 'جلب قائمة أعضاء الفريق والموظفين في المتجر',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'invite_team_member',
      description: 'دعوة موظف جديد أو إضافة عضو للفريق بدور معين',
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'ORDER_MANAGER', 'CUSTOMER_SERVICE'] },
        },
        required: ['email'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_team_member',
      description: 'إزالة موظف من الفريق',
      parameters: {
        type: 'object',
        properties: {
          memberId: { type: 'string' },
          memberEmail: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_cash_orders',
      description: 'جلب طلبات الكاش المُسلَّمة التي لم يتم تحصيل ثمنها بعد',
      parameters: {
        type: 'object',
        properties: { limit: { type: 'number' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mark_payment_collected',
      description: 'تسجيل تحصيل المبالغ النقدية لطلبات الكاش',
      parameters: {
        type: 'object',
        properties: {
          orderIds: { type: 'array', items: { type: 'string' } },
        },
        required: ['orderIds'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deactivate_product',
      description: 'إيقاف منتج مؤقتاً وإخفاؤه عن المتجر دون حذفه',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          productName: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_product',
      description: 'حذف منتج من المتجر',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          productName: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_order',
      description: 'البحث عن طلب بالرقم أو اسم العميل أو الجوال',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'رقم الطلب أو اسم العميل' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_customer',
      description: 'البحث عن عميل بالاسم أو رقم الجوال',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_customer',
      description: 'إضافة عميل جديد يدوياً',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          city: { type: 'string' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'block_customer',
      description: 'حظر عميل من الطلب مستقبلاً',
      parameters: {
        type: 'object',
        properties: {
          customerId: { type: 'string' },
        },
        required: ['customerId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_coupon',
      description: 'إلغاء كوبون خصم وإيقافه',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string' },
        },
        required: ['code'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_risk_orders',
      description: 'جلب الطلبات المشبوهة ذات درجة مخاطرة عالية',
      parameters: {
        type: 'object',
        properties: {
          minRisk: { type: 'number', description: 'الحد الأدنى لدرجة المخاطرة (0-100)' },
          limit: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_stores',
      description: 'جلب قائمة المتاجر المرتبطة بالحساب',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_churn_customers',
      description: 'جلب العملاء الذين لم يشتروا منذ فترة طويلة (45+ يوم)',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_new_customers',
      description: 'جلب العملاء الجدد في آخر X يوم',
      parameters: {
        type: 'object',
        properties: {
          days: { type: 'number' },
          limit: { type: 'number' },
        },
      },
    },
  },
]

async function buildSystemPrompt(ctx: ChatContext): Promise<string> {
  const [store, memory, pendingCount, lowStockCount] = await Promise.all([
    prisma.store.findFirst({ where: { organizationId: ctx.orgId, isActive: true } }),
    prisma.aiMemory.findMany({ where: { organizationId: ctx.orgId }, orderBy: { confidence: 'desc' }, take: 8 }),
    prisma.order.count({ where: { store: { organizationId: ctx.orgId }, status: 'pending' } }),
    prisma.product.count({ where: { store: { organizationId: ctx.orgId }, isActive: true, stock: { lt: 5 } } }),
  ])

  const memCtx = memory.map(m => `- ${m.label || m.key}: ${m.value}`).join('\n')

  return `أنت ديما — مساعد ذكي لإدارة متاجر التجارة الإلكترونية العربية.
متجر: ${store?.name || 'المتجر'} | منصة: ${store?.platform || 'Salla'}
الطلبات المعلقة الآن: ${pendingCount} | منتجات منخفضة المخزون: ${lowStockCount}

ذاكرة المتجر:
${memCtx || 'لا توجد بيانات بعد'}

قواعد:
- رد دائماً بالعربية بأسلوب خليجي ودي
- استخدم الأدوات لجلب البيانات الحقيقية دائماً — لا تخترع أرقاماً
- للإجراءات الجماعية (>5 عناصر) اطلب تأكيداً
- للطلبات ذات مخاطرة عالية (>60%) نبّه قبل القبول
- كن مختصراً وعملياً`
}

const DANGEROUS_TOOLS = new Set(['accept_orders', 'bulk_update_prices', 'create_return', 'restock_product'])
const BULK_THRESHOLD = 5
const CONFIRM_PATTERN = /^(نعم نفذ|نعم|موافق|تمام نفذ|اوك نفذ|ok|yes)/i
const CANCEL_PATTERN = /^(لا|إلغاء|الغِ|cancel|no)/i

export async function groqChat(
  userMessage: string,
  ctx: ChatContext
): Promise<{ response: string; toolsUsed: string[] }> {
  if (INJECTION_PATTERNS.some(p => p.test(userMessage))) {
    return { response: 'عذراً، لا أستطيع معالجة هذا الطلب.', toolsUsed: [] }
  }

  // Handle confirmation of pending bulk action
  if (CONFIRM_PATTERN.test(userMessage.trim())) {
    const pending = await prisma.aiMemory.findUnique({
      where: { organizationId_key: { organizationId: ctx.orgId, key: 'pending_bulk_action' } },
    })
    if (pending) {
      const { tool, input } = JSON.parse(pending.value) as { tool: string; input: Record<string, unknown> }
      await prisma.aiMemory.delete({ where: { organizationId_key: { organizationId: ctx.orgId, key: 'pending_bulk_action' } } })
      const result = await executeTool(tool, input, { orgId: ctx.orgId, userId: ctx.userId })
      const summary = JSON.stringify(result, null, 2)
      return { response: `✅ تم التنفيذ بنجاح!\n\n${summary}`, toolsUsed: [tool] }
    }
  }

  if (CANCEL_PATTERN.test(userMessage.trim())) {
    await prisma.aiMemory.deleteMany({ where: { organizationId: ctx.orgId, key: 'pending_bulk_action' } })
    const pending = await prisma.aiMemory.findUnique({ where: { organizationId_key: { organizationId: ctx.orgId, key: 'pending_bulk_action' } } })
    if (!pending) {
      // Only respond as cancel if there was actually a pending action
    }
  }

  const history = await prisma.message.findMany({
    where: { conversationId: ctx.conversationId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  })

  const systemPrompt = await buildSystemPrompt(ctx)
  const toolsUsed: string[] = []

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: userMessage },
  ]

  let finalResponse = ''
  const MAX_ITERATIONS = 8

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      system: systemPrompt,
      tools: GROQ_TOOLS,
      tool_choice: 'auto',
      messages,
    })

    const choice = response.choices[0]
    const msg = choice.message

    if (msg.content) finalResponse = msg.content

    if (choice.finish_reason === 'stop' || !msg.tool_calls?.length) break

    messages.push({ role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls })

    for (const toolCall of msg.tool_calls) {
      const name = toolCall.function.name
      toolsUsed.push(name)

      let parsedInput: Record<string, unknown> = {}
      try { parsedInput = JSON.parse(toolCall.function.arguments || '{}') } catch {}

      // Confirmation gate for dangerous bulk actions
      if (DANGEROUS_TOOLS.has(name)) {
        const ids = (parsedInput.orderIds as string[] | undefined) ?? (parsedInput.productIds as string[] | undefined) ?? []
        if (ids.length > BULK_THRESHOLD) {
          await prisma.aiMemory.upsert({
            where: { organizationId_key: { organizationId: ctx.orgId, key: 'pending_bulk_action' } },
            create: { organizationId: ctx.orgId, key: 'pending_bulk_action', value: JSON.stringify({ tool: name, input: parsedInput }), label: 'إجراء معلق للتأكيد', confidence: 1 },
            update: { value: JSON.stringify({ tool: name, input: parsedInput }), updatedAt: new Date() },
          })
          return {
            response: `⚠️ هذا الإجراء سيؤثر على **${ids.length} عنصر**.\n\nهل تريد المتابعة؟\n• اكتب **"نعم نفذ"** للتأكيد\n• اكتب **"لا"** للإلغاء`,
            toolsUsed,
          }
        }
      }

      let result: unknown
      try {
        result = await executeTool(name, parsedInput, { orgId: ctx.orgId, userId: ctx.userId })
      } catch (err) {
        result = { error: (err as Error).message }
      }

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      })
    }
  }

  return { response: finalResponse || 'تم تنفيذ الطلب.', toolsUsed }
}

export async function groqStream(
  userMessage: string,
  ctx: ChatContext,
  callbacks: {
    onToken: (token: string) => void
    onTool: (name: string) => void
    onDone: (fullResponse: string, toolsUsed: string[]) => Promise<void>
  }
): Promise<void> {
  // Run full tool-use pass first (Groq tool calls can't stream mid-execution)
  const result = await groqChat(userMessage, ctx)

  // Stream the final response word by word
  const words = result.response.split(' ')
  for (const word of words) {
    callbacks.onToken(word + ' ')
    await new Promise(r => setTimeout(r, 20))
  }

  result.toolsUsed.forEach(t => callbacks.onTool(t))
  await callbacks.onDone(result.response, result.toolsUsed)
}
