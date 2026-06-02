import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /ai/memory
router.get('/memory', async (req: AuthRequest, res) => {
  const memory = await prisma.aiMemory.findMany({
    where: { organizationId: req.orgId },
    orderBy: { confidence: 'desc' },
  })
  res.json({ memory })
})

// PUT /ai/memory/:key
router.put('/memory/:key', async (req: AuthRequest, res) => {
  const { value, confidence, label } = req.body
  const item = await prisma.aiMemory.upsert({
    where: { organizationId_key: { organizationId: req.orgId!, key: req.params.key } },
    update: { value, ...(confidence !== undefined && { confidence }), ...(label && { label }) },
    create: { organizationId: req.orgId!, key: req.params.key, value, confidence: confidence ?? 0.5, label },
  })
  res.json({ item })
})

// GET /ai/usage
router.get('/usage', async (req: AuthRequest, res) => {
  const records = await prisma.usageRecord.findMany({
    where: { organizationId: req.orgId },
    orderBy: { month: 'desc' },
    take: 6,
  })
  const sub = await prisma.subscription.findUnique({ where: { organizationId: req.orgId } })
  res.json({ records, subscription: sub })
})

export default router
