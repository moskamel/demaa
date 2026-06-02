import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { chat } from '../lib/ai/orchestrator.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /conversations
router.get('/', async (req: AuthRequest, res) => {
  const convs = await prisma.conversation.findMany({
    where: { organizationId: req.orgId },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    include: { _count: { select: { messages: true } } },
  })
  res.json({ conversations: convs })
})

// POST /conversations — start new conversation
router.post('/', async (req: AuthRequest, res) => {
  const conv = await prisma.conversation.create({
    data: {
      organizationId: req.orgId!,
      userId: req.userId,
      title: req.body.title || 'محادثة جديدة',
    },
  })
  res.json({ conversation: conv })
})

// GET /conversations/:id/messages
router.get('/:id/messages', async (req: AuthRequest, res) => {
  const messages = await prisma.message.findMany({
    where: { conversationId: req.params.id },
    orderBy: { createdAt: 'asc' },
  })
  res.json({ messages })
})

// POST /conversations/:id/messages — send message to AI
router.post('/:id/messages', async (req: AuthRequest, res) => {
  const { message } = req.body
  if (!message?.trim()) {
    res.status(400).json({ error: { code: 'EMPTY_MESSAGE', message: 'الرسالة فارغة' } })
    return
  }

  const conv = await prisma.conversation.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
  })
  if (!conv) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'المحادثة غير موجودة' } })
    return
  }

  try {
    const result = await chat(message, {
      orgId: req.orgId!,
      userId: req.userId,
      conversationId: req.params.id,
    })
    res.json({ response: result.response, toolsUsed: result.toolsUsed })
  } catch (err) {
    console.error('AI error:', err)
    // Fallback when no API key
    const fallback = generateFallback(message)
    res.json({ response: fallback, toolsUsed: [], fallback: true })
  }
})

// DELETE /conversations/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.conversation.deleteMany({
    where: { id: req.params.id, organizationId: req.orgId },
  })
  res.json({ deleted: true })
})

function generateFallback(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('مرحب') || lower.includes('هلا') || lower.includes('أهلاً'))
    return 'أهلاً وسهلاً! أنا ديما. يبدو أن مفتاح Claude API غير مضبوط حالياً. يرجى إضافة ANTHROPIC_API_KEY في ملف .env لتفعيل الذكاء الاصطناعي الكامل.'
  if (lower.includes('طلب'))
    return 'لاستعراض الطلبات بشكل كامل، يحتاج النظام لمفتاح Claude API. يمكنك الاطلاع على الطلبات مباشرة من صفحة الطلبات.'
  return 'للاستفادة من قدرات ديما الكاملة، يرجى إضافة ANTHROPIC_API_KEY في ملف .env'
}

export default router
