import { Router } from 'express'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// Static connector catalog — in a real system this would be in the DB
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

// In-memory connector state per org (would normally be persisted)
const orgConnectorState: Record<string, Record<string, { status: string; lastUsed?: string }>> = {}

function getOrgState(orgId: string) {
  if (!orgConnectorState[orgId]) {
    orgConnectorState[orgId] = {
      aramex: { status: 'connected', lastUsed: 'اليوم' },
      smsa: { status: 'connected', lastUsed: 'أمس' },
      jt: { status: 'disconnected' },
      tabby: { status: 'connected', lastUsed: 'اليوم' },
      tamara: { status: 'expired' },
      whatsapp: { status: 'connected', lastUsed: 'منذ ساعة' },
      meta_ads: { status: 'disconnected' },
      snapchat: { status: 'disconnected' },
      qoyod: { status: 'disconnected' },
    }
  }
  return orgConnectorState[orgId]
}

router.get('/', async (req: AuthRequest, res) => {
  const state = getOrgState(req.orgId!)
  const connectors = CONNECTOR_CATALOG.map(c => ({
    ...c,
    status: state[c.type]?.status || 'disconnected',
    lastUsed: state[c.type]?.lastUsed,
  }))
  res.json({ connectors })
})

router.post('/:type/connect', async (req: AuthRequest, res) => {
  const { type } = req.params
  const state = getOrgState(req.orgId!)
  if (!state[type]) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  state[type] = { status: 'connected', lastUsed: 'الآن' }
  res.json({ connected: true, type })
})

router.post('/:type/disconnect', async (req: AuthRequest, res) => {
  const { type } = req.params
  const state = getOrgState(req.orgId!)
  if (!state[type]) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  state[type] = { status: 'disconnected' }
  res.json({ disconnected: true, type })
})

export default router
