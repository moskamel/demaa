import Anthropic from '@anthropic-ai/sdk'
import { DEEMA_TOOLS } from './tools.js'
import { executeTool } from './executor.js'
import prisma from '../prisma.js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ChatContext {
  orgId: string
  userId?: string
  conversationId: string
  storeName?: string
  platform?: string
}

// Build system prompt with live org context
async function buildSystemPrompt(ctx: ChatContext): Promise<string> {
  const { orgId } = ctx

  const [store, memory, pendingCount, lowStockProducts] = await Promise.all([
    prisma.store.findFirst({ where: { organizationId: orgId, isActive: true } }),
    prisma.aiMemory.findMany({ where: { organizationId: orgId }, orderBy: { confidence: 'desc' }, take: 10 }),
    prisma.order.count({ where: { store: { organizationId: orgId }, status: 'pending' } }),
    prisma.product.count({ where: { store: { organizationId: orgId }, isActive: true, stock: { lt: 5 } } }),
  ])

  const memoryContext = memory.map(m => `- ${m.label || m.key}: ${m.value} (ثقة ${Math.round(m.confidence * 100)}%)`).join('\n')

  return `أنت ديما — المساعد الذكي لإدارة متاجر التجارة الإلكترونية العربية.
تعمل مع متجر: ${store?.name || ctx.storeName || 'المتجر'}
المنصة: ${store?.platform || ctx.platform || 'Salla'}
اليوم: ${new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## الوضع الحالي:
- الطلبات المعلقة: ${pendingCount} طلب
- منتجات منخفضة المخزون: ${lowStockProducts} منتج

## ذاكرتي عن المتجر:
${memoryContext || 'لا توجد بيانات مخزنة بعد'}

## قواعد أساسية:
1. تجاوب دائماً بالعربية بلهجة خليجية ودية واحترافية
2. قبل تنفيذ أي إجراء جماعي على أكثر من 5 عناصر، اطلب تأكيداً صريحاً
3. للطلبات ذات درجة مخاطرة عالية (>60)، نبّه قبل القبول
4. استخدم الأدوات للحصول على البيانات الحقيقية من قاعدة البيانات
5. كن محدداً وعملياً في ردودك — لا تطوّل بدون فائدة
6. عند تنفيذ إجراء، أكّد النتيجة بأرقام حقيقية من الأداة
7. لا تخترع بيانات — استخدم الأدوات دائماً لجلب البيانات الحقيقية

أنت نظام إدارة كامل. يمكنك قبول الطلبات، رفضها، شحنها، إدارة المنتجات، إنشاء كوبونات، وتحليل الأداء — كل ذلك عبر محادثة طبيعية.`
}

// Injection detection
const INJECTION_PATTERNS = [
  /ignore (previous|all|above|prior) instructions/i,
  /you are now|pretend you|act as|roleplay as/i,
  /system:\s*you/i,
  /\bsudo\b|\broot\b|\bpassword\b|\btoken\b.*leak/i,
  /reveal your (system|prompt|instructions)/i,
]

function detectInjection(text: string): boolean {
  return INJECTION_PATTERNS.some(p => p.test(text))
}

export async function chat(
  userMessage: string,
  ctx: ChatContext,
  onToken?: (token: string) => void
): Promise<{ response: string; toolsUsed: string[] }> {
  // Safety check
  if (detectInjection(userMessage)) {
    return {
      response: 'عذراً، لا أستطيع معالجة هذا الطلب.',
      toolsUsed: [],
    }
  }

  // Load conversation history (last 20 messages)
  const history = await prisma.message.findMany({
    where: { conversationId: ctx.conversationId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  })

  const systemPrompt = await buildSystemPrompt(ctx)
  const toolsUsed: string[] = []

  // Build messages array
  const messages: Anthropic.MessageParam[] = [
    ...history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  // Save user message
  await prisma.message.create({
    data: { conversationId: ctx.conversationId, role: 'user', content: userMessage },
  })

  // Agentic loop — run until Claude stops calling tools
  let finalResponse = ''
  const MAX_ITERATIONS = 10

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      tools: DEEMA_TOOLS,
      messages,
    })

    // Collect text chunks
    const textContent = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as Anthropic.TextBlock).text)
      .join('')

    if (textContent) finalResponse = textContent

    // If no tool calls, we're done
    if (response.stop_reason === 'end_turn') break

    // Process tool calls
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')
    if (toolUseBlocks.length === 0) break

    // Add assistant message with tool calls
    messages.push({ role: 'assistant', content: response.content })

    // Execute all tool calls
    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const block of toolUseBlocks) {
      const toolUse = block as Anthropic.ToolUseBlock
      toolsUsed.push(toolUse.name)

      let result: unknown
      try {
        result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>, {
          orgId: ctx.orgId,
          userId: ctx.userId,
        })
      } catch (err) {
        result = { error: (err as Error).message }
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      })
    }

    messages.push({ role: 'user', content: toolResults })
  }

  // Save assistant response
  await prisma.message.create({
    data: {
      conversationId: ctx.conversationId,
      role: 'assistant',
      content: finalResponse,
      toolCalls: JSON.stringify(toolsUsed),
    },
  })

  // Update conversation
  await prisma.conversation.update({
    where: { id: ctx.conversationId },
    data: { updatedAt: new Date() },
  })

  // Update usage
  const month = new Date().toISOString().slice(0, 7)
  await prisma.usageRecord.upsert({
    where: { organizationId_month: { organizationId: ctx.orgId, month } },
    update: { messagesUsed: { increment: 1 } },
    create: { organizationId: ctx.orgId, month, messagesUsed: 1 },
  })

  return { response: finalResponse, toolsUsed }
}
