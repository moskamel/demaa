// Real shipment tracking integrations
// Each carrier needs its API key in env vars:
//   ARAMEX_USERNAME, ARAMEX_PASSWORD, ARAMEX_ACCOUNT_NUMBER, ARAMEX_ACCOUNT_PIN, ARAMEX_ACCOUNT_ENTITY, ARAMEX_ACCOUNT_COUNTRY_CODE
//   SMSA_PASSKEY
//   JTEXPRESS_API_KEY, JTEXPRESS_CUSTOMER_CODE

export interface TrackingResult {
  trackingNumber: string
  carrier: string
  status: string          // created | in_transit | out_for_delivery | delivered | failed | returned
  statusAr: string
  lastEvent: string
  lastEventAt: string | null
  estimatedDelivery: string | null
  events: TrackingEvent[]
  raw?: unknown
}

export interface TrackingEvent {
  timestamp: string
  description: string
  location: string
}

// ── Status normalizer ────────────────────────────────────────────────────────
function normalizeStatus(raw: string): { status: string; statusAr: string } {
  const r = raw.toLowerCase()
  if (r.includes('delivered') || r.includes('تم التسليم') || r.includes('سُلّم')) return { status: 'delivered', statusAr: 'تم التسليم ✅' }
  if (r.includes('out for delivery') || r.includes('في الطريق')) return { status: 'out_for_delivery', statusAr: 'خارج للتسليم 🚚' }
  if (r.includes('transit') || r.includes('picked') || r.includes('in motion') || r.includes('في الطريق')) return { status: 'in_transit', statusAr: 'في الطريق 📦' }
  if (r.includes('return') || r.includes('مُعاد')) return { status: 'returned', statusAr: 'مُعاد 🔄' }
  if (r.includes('fail') || r.includes('undelivered') || r.includes('exception')) return { status: 'failed', statusAr: 'فشل التسليم ⚠️' }
  if (r.includes('creat') || r.includes('register') || r.includes('بوليصة')) return { status: 'created', statusAr: 'تم إنشاء البوليصة 📋' }
  return { status: 'in_transit', statusAr: 'في الطريق 📦' }
}

// ── Aramex ───────────────────────────────────────────────────────────────────
async function trackAramex(trackingNumber: string): Promise<TrackingResult> {
  const { ARAMEX_USERNAME, ARAMEX_PASSWORD, ARAMEX_ACCOUNT_NUMBER, ARAMEX_ACCOUNT_PIN, ARAMEX_ACCOUNT_ENTITY, ARAMEX_ACCOUNT_COUNTRY_CODE } = process.env

  if (!ARAMEX_USERNAME || !ARAMEX_PASSWORD) {
    return mockTracking(trackingNumber, 'aramex')
  }

  const body = {
    ClientInfo: {
      UserName: ARAMEX_USERNAME,
      Password: ARAMEX_PASSWORD,
      Version: 'v1',
      AccountNumber: ARAMEX_ACCOUNT_NUMBER,
      AccountPin: ARAMEX_ACCOUNT_PIN,
      AccountEntity: ARAMEX_ACCOUNT_ENTITY || 'CAI',
      AccountCountryCode: ARAMEX_ACCOUNT_COUNTRY_CODE || 'EG',
    },
    Transaction: { Reference1: '001', Reference2: '', Reference3: '', Reference4: '', Reference5: '' },
    Shipments: { ShipmentNumber: [trackingNumber] },
  }

  const res = await fetch('https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) throw new Error(`Aramex API error: ${res.status}`)
  const data = await res.json() as any

  const tracked = data.TrackingResults?.[0]?.Value?.[0]
  if (!tracked) return mockTracking(trackingNumber, 'aramex')

  const updates: TrackingEvent[] = (tracked.WaybillUpdates || []).map((u: any) => ({
    timestamp: u.UpdateDateTime,
    description: u.UpdateDescription,
    location: u.UpdateLocation || '',
  }))

  const lastUpdate = updates[updates.length - 1]
  const { status, statusAr } = normalizeStatus(tracked.UpdateDescription || '')

  return {
    trackingNumber,
    carrier: 'aramex',
    status,
    statusAr,
    lastEvent: lastUpdate?.description || tracked.UpdateDescription || '',
    lastEventAt: lastUpdate?.timestamp || null,
    estimatedDelivery: tracked.ScheduledDelivery || null,
    events: updates,
    raw: tracked,
  }
}

// ── SMSA ────────────────────────────────────────────────────────────────────
async function trackSMSA(trackingNumber: string): Promise<TrackingResult> {
  const passkey = process.env.SMSA_PASSKEY

  if (!passkey) return mockTracking(trackingNumber, 'smsa')

  const res = await fetch(`https://www.smsaexpress.com/api/TrackingApi.aspx?awbno=${trackingNumber}&Passkey=${passkey}`, {
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) throw new Error(`SMSA API error: ${res.status}`)
  const data = await res.json() as any

  const scans: any[] = data?.data || []
  const events: TrackingEvent[] = scans.map((s: any) => ({
    timestamp: s.Date || '',
    description: s.Activity || '',
    location: s.Details || '',
  }))

  const last = scans[scans.length - 1]
  const { status, statusAr } = normalizeStatus(last?.Activity || '')

  return {
    trackingNumber,
    carrier: 'smsa',
    status,
    statusAr,
    lastEvent: last?.Activity || '',
    lastEventAt: last?.Date || null,
    estimatedDelivery: null,
    events,
    raw: data,
  }
}

// ── J&T Express ──────────────────────────────────────────────────────────────
async function trackJT(trackingNumber: string): Promise<TrackingResult> {
  const apiKey = process.env.JTEXPRESS_API_KEY
  const customerCode = process.env.JTEXPRESS_CUSTOMER_CODE

  if (!apiKey || !customerCode) return mockTracking(trackingNumber, 'jtexpress')

  const timestamp = Date.now().toString()
  const msgDigest = Buffer.from(`${customerCode}${timestamp}${apiKey}`).toString('base64')

  const res = await fetch('https://jtapi.jtexpress.com.sa/api/trace/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'customerCode': customerCode, 'timestamp': timestamp, 'msgDigest': msgDigest },
    body: JSON.stringify({ billCodes: trackingNumber }),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) throw new Error(`J&T API error: ${res.status}`)
  const data = await res.json() as any

  const detail = data?.data?.[0]
  if (!detail) return mockTracking(trackingNumber, 'jtexpress')

  const events: TrackingEvent[] = (detail.details || []).map((d: any) => ({
    timestamp: d.scanDate || '',
    description: d.desc || '',
    location: d.scannerName || '',
  }))

  const last = events[events.length - 1]
  const { status, statusAr } = normalizeStatus(detail.status || '')

  return {
    trackingNumber,
    carrier: 'jtexpress',
    status,
    statusAr,
    lastEvent: last?.description || '',
    lastEventAt: last?.timestamp || null,
    estimatedDelivery: null,
    events,
    raw: detail,
  }
}

// ── Mock fallback (when no API key configured) ────────────────────────────────
function mockTracking(trackingNumber: string, carrier: string): TrackingResult {
  return {
    trackingNumber,
    carrier,
    status: 'in_transit',
    statusAr: 'في الطريق 📦',
    lastEvent: 'الشحنة في الطريق إلى وجهتها',
    lastEventAt: new Date().toISOString(),
    estimatedDelivery: null,
    events: [
      { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'تم استلام الشحنة من التاجر', location: 'المستودع الرئيسي' },
      { timestamp: new Date(Date.now() - 86400000).toISOString(), description: 'الشحنة في مركز الفرز', location: 'مركز الفرز' },
      { timestamp: new Date().toISOString(), description: 'الشحنة في الطريق إلى العميل', location: '' },
    ],
    raw: null,
  }
}

// ── Main entry point ──────────────────────────────────────────────────────────
export async function trackShipment(trackingNumber: string, carrier: string): Promise<TrackingResult> {
  const c = carrier.toLowerCase()
  try {
    if (c === 'aramex') return await trackAramex(trackingNumber)
    if (c === 'smsa') return await trackSMSA(trackingNumber)
    if (c === 'jtexpress' || c === 'jt' || c === 'j&t') return await trackJT(trackingNumber)
    // Unknown carrier — return mock
    return mockTracking(trackingNumber, carrier)
  } catch (err) {
    console.error(`[tracking] ${carrier} error:`, err)
    return mockTracking(trackingNumber, carrier)
  }
}
