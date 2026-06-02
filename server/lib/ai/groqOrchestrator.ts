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

export async function groqChat(
  userMessage: string,
  ctx: ChatContext
): Promise<{ response: string; toolsUsed: string[] }> {
  if (INJECTION_PATTERNS.some(p => p.test(userMessage))) {
    return { response: 'عذراً، لا أستطيع معالجة هذا الطلب.', toolsUsed: [] }
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

    // Add assistant message with tool calls
    messages.push({ role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls })

    // Execute all tool calls
    for (const toolCall of msg.tool_calls) {
      const name = toolCall.function.name
      toolsUsed.push(name)

      let result: unknown
      try {
        const input = JSON.parse(toolCall.function.arguments || '{}')
        result = await executeTool(name, input, { orgId: ctx.orgId, userId: ctx.userId })
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
