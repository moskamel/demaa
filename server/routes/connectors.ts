import { Router } from 'express'
import { createClient } from '@libsql/client'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const CONNECTOR_CATALOG = [
  { type: 'aramex', name: 'Aramex', nameAr: 'أرامكس', category: 'shipping', logo: 'أ' },
  { type: 'smsa', name: 'SMSA', nameAr: 'SMSA', category: 'shipping', logo: 'S' },
  { type: 'jt', name: 'J&T Express', nameAr: 'J&T', category: 'shipping', logo: 'J' },
  { type: 'tabby', name: 'Tabby', nameAr: 'تابby', category: 'payment', logo: 'T' },
  { type: 'tamara', name: 'Tamara', nameAr: 'تمارا', category: 'payment', logo: 'تم' },
  { type: 'whatsapp', name: 'WhatsApp Business', nameAr: 'واتساب', category: 'messaging', logo: 'W' },
  { type: 'meta_ads', name: 'Meta Ads', nameAr: 'ميتا إعلانات', category: 'ads', logo: 'M' },
  { type: 'snapchat', name: 'Snapchat Ads', nameAr: 'سناب إعلانات', category: 'ads', logo: 'Sc' },
  { type: 'qoyod', name: 'Qoyod', nameAr: 'قيود', category: 'accounting', logo: 'ق' },
]

const VALID_TYPES = new Set(CONNECTOR_CATALOG.map(c => c.type))

function getDb() {
  const url = process.env.DATABASE_URL || `file://${new URL('../../dev.db', import.meta.url).pathname}`
  return createClient({ url })
}

function cuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

router.get('/', async (req: AuthRequest, res) => {
  const db = getDb()
  const result = await db.execute({
    sql: 'SELECT type, status, lastUsedAt FROM connector_states WHERE organizationId = ?',
    args: [req.orgId!],
  })
  const stateMap: Record<string, { status: string; lastUsedAt: string | null }> = {}
  for (const row of result.rows) {
    stateMap[row.type as string] = { status: row.status as string, lastUsedAt: row.lastUsedAt as string | null }
  }

  const connectors = CONNECTOR_CATALOG.map(c => ({
    ...c,
    status: stateMap[c.type]?.status || 'disconnected',
    lastUsed: stateMap[c.type]?.lastUsedAt
      ? new Date(stateMap[c.type].lastUsedAt!).toLocaleDateString('en-US')
      : undefined,
  }))
  res.json({ connectors })
})

router.post('/:type/connect', async (req: AuthRequest, res) => {
  const { type } = req.params
  if (!VALID_TYPES.has(type)) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  const db = getDb()
  const now = new Date().toISOString()
  await db.execute({
    sql: `INSERT INTO connector_states (id, organizationId, type, status, lastUsedAt, createdAt, updatedAt)
          VALUES (?, ?, ?, 'connected', ?, ?, ?)
          ON CONFLICT(organizationId, type) DO UPDATE SET status='connected', lastUsedAt=?, updatedAt=?`,
    args: [cuid(), req.orgId!, type, now, now, now, now, now],
  })
  res.json({ connected: true, type })
})

router.post('/:type/disconnect', async (req: AuthRequest, res) => {
  const { type } = req.params
  if (!VALID_TYPES.has(type)) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  const db = getDb()
  const now = new Date().toISOString()
  await db.execute({
    sql: `INSERT INTO connector_states (id, organizationId, type, status, createdAt, updatedAt)
          VALUES (?, ?, ?, 'disconnected', ?, ?)
          ON CONFLICT(organizationId, type) DO UPDATE SET status='disconnected', updatedAt=?`,
    args: [cuid(), req.orgId!, type, now, now, now],
  })
  res.json({ disconnected: true, type })
})

export default router
