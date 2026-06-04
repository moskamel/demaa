import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { groqChat } from '../lib/ai/groqOrchestrator.js'
import { freeChat } from '../lib/ai/freeEngine.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /conversations — only return conversations that have at least one message
router.get('/', async (req: AuthRequest, res) => {
  const convs = await prisma.conversation.findMany({
    where: { organizationId: req.orgId, messages: { some: {} } },
    orderBy: { updatedAt: 'desc' },
    take: 30,
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

// POST /conversations/:id/messages/stream — SSE streaming
router.post('/:id/messages/stream', async (req: AuthRequest, res) => {
  const { message } = req.body
  if (!message?.trim()) { res.status(400).json({ error: { code: 'EMPTY_MESSAGE', message: 'الرسالة فارغة' } }); return }

  const conv = await prisma.conversation.findFirst({ where: { id: req.params.id, organizationId: req.orgId } })
  if (!conv) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'المحادثة غير موجودة' } }); return }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  const ctx = { orgId: req.orgId!, userId: req.userId, conversationId: req.params.id }

  try {
    if (process.env.GROQ_API_KEY) {
      const { groqStream } = await import('../lib/ai/groqOrchestrator.js')
      await groqStream(message, ctx, {
        onToken: (token: string) => send('token', { token }),
        onTool: (name: string) => send('tool', { name }),
        onDone: async (fullResponse: string, toolsUsed: string[]) => {
          await saveMessages(req.params.id, message, { response: fullResponse, toolsUsed })
          await prisma.conversation.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } })
          send('done', { response: fullResponse, toolsUsed })
          res.end()
        },
      })
    } else {
      const { freeChat } = await import('../lib/ai/freeEngine.js')
      const result = await freeChat(message, ctx)
      const words = result.response.split(' ')
      for (const word of words) {
        send('token', { token: word + ' ' })
        await new Promise(r => setTimeout(r, 25))
      }
      await saveMessages(req.params.id, message, result)
      await prisma.conversation.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } })
      send('done', { response: result.response, toolsUsed: result.toolsUsed })
      res.end()
    }
  } catch (err) {
    console.error('[stream error]', err)
    send('error', { message: 'حدث خطأ في المعالجة' })
    res.end()
  }
})

// PATCH /conversations/:id
router.patch('/:id', async (req: AuthRequest, res) => {
  const { title } = req.body
  const conv = await prisma.conversation.updateMany({ where: { id: req.params.id, organizationId: req.orgId }, data: { title } })
  res.json({ updated: conv.count > 0 })
})

// DELETE /conversations/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.conversation.deleteMany({ where: { id: req.params.id, organizationId: req.orgId } })
  res.json({ deleted: true })
})

export default router
