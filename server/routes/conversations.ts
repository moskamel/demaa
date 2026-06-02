import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { groqChat } from '../lib/ai/groqOrchestrator.js'
import { freeChat } from '../lib/ai/freeEngine.js'
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

// POST /conversations
router.post('/', async (req: AuthRequest, res) => {
  const conv = await prisma.conversation.create({
    data: { organizationId: req.orgId!, userId: req.userId, title: req.body.title || 'محادثة جديدة' },
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

// POST /conversations/:id/messages
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

  const ctx = { orgId: req.orgId!, userId: req.userId, conversationId: req.params.id }
  let result: { response: string; toolsUsed: string[] }

  if (process.env.GROQ_API_KEY) {
    try {
      result = await groqChat(message, ctx)
    } catch (err) {
      console.error('Groq error:', err)
      result = await freeChat(message, ctx)
    }
  } else {
    result = await freeChat(message, ctx)
  }

  await saveMessages(req.params.id, message, result)
  await prisma.conversation.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } })

  res.json({ response: result.response, toolsUsed: result.toolsUsed })
})

async function saveMessages(convId: string, userMsg: string, result: { response: string; toolsUsed: string[] }) {
  await prisma.message.createMany({
    data: [
      { conversationId: convId, role: 'user', content: userMsg },
      { conversationId: convId, role: 'assistant', content: result.response, toolCalls: JSON.stringify(result.toolsUsed) },
    ],
  })
}

// DELETE /conversations/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.conversation.deleteMany({ where: { id: req.params.id, organizationId: req.orgId } })
  res.json({ deleted: true })
})

export default router
