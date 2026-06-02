// Ecwid (Lightspeed E-Series) REST API integration
// Auth: Bearer token (store-level secret key)
// Docs: https://api-docs.ecwid.com/reference/orders
// Base: https://app.ecwid.com/api/v3/{storeId}

// token format: "storeId:secretToken"
function parseToken(token: string): { storeId: string; secretToken: string } {
  const idx = token.indexOf(':')
  if (idx === -1) throw new Error('Ecwid token must be in format storeId:secretToken')
  return { storeId: token.slice(0, idx), secretToken: token.slice(idx + 1) }
}

function base(storeId: string) {
  return `https://app.ecwid.com/api/v3/${storeId}`
}

export interface EcwidOrder {
  id: number
  orderNumber: number
  paymentStatus: string
  fulfillmentStatus: string
  createDate: string
  total: number
  paymentMethod: string
  shippingPerson?: {
    name?: string
    phone?: string
    city?: string
    street?: string
  }
  items?: Array<{ name: string; quantity: number; price: number }>
}

interface EcwidOrdersResponse {
  items?: EcwidOrder[]
  total?: number
}

export async function fetchOrders(domain: string, token: string): Promise<EcwidOrder[]> {
  const { storeId, secretToken } = parseToken(token)
  const res = await fetch(`${base(storeId)}/orders?limit=50&sortBy=TIME_PLACED_DESC&token=${secretToken}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[ecwid] fetchOrders failed (${res.status}): ${body}`)
    return []
  }
  const data = await res.json() as EcwidOrdersResponse
  return data.items ?? []
}

export async function cancelOrder(domain: string, token: string, externalId: string): Promise<void> {
  const { storeId, secretToken } = parseToken(token)
  const res = await fetch(`${base(storeId)}/orders/${externalId}?token=${secretToken}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fulfillmentStatus: 'WILL_NOT_DELIVER' }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Ecwid cancel failed (${res.status}): ${body}`)
  }
}

export async function fulfillOrder(
  domain: string,
  token: string,
  externalId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  const { storeId, secretToken } = parseToken(token)
  const body: Record<string, unknown> = { fulfillmentStatus: 'SHIPPED' }
  if (trackingNumber) {
    body.trackingNumber = trackingNumber
    body.shippingCarrierName = carrier || 'other'
  }
  const res = await fetch(`${base(storeId)}/orders/${externalId}?token=${secretToken}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const body2 = await res.text()
    throw new Error(`Ecwid fulfill failed (${res.status}): ${body2}`)
  }
}
