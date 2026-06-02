// Wix Stores REST API integration
// Auth: API Key (site-level) — generated from Wix Business Manager
// Docs: https://dev.wix.com/docs/rest/business-solutions/e-commerce/orders/introduction
// Base: https://www.wixapis.com/ecom/v1

const BASE = 'https://www.wixapis.com/ecom/v1'

// token format: "siteId:apiKey"
function parseToken(token: string): { siteId: string; apiKey: string } {
  const idx = token.indexOf(':')
  if (idx === -1) throw new Error('Wix token must be in format siteId:apiKey')
  return { siteId: token.slice(0, idx), apiKey: token.slice(idx + 1) }
}

export interface WixOrder {
  id: string
  number: string
  createdDate: string
  status: string
  paymentStatus: string
  priceSummary?: { total?: { amount: string } }
  buyerInfo?: { contactId?: string; email?: string }
  shippingInfo?: {
    logistics?: {
      shippingDestination?: {
        contactDetails?: { firstName?: string; lastName?: string; phone?: string }
        address?: { city?: string; addressLine?: string }
      }
    }
  }
  lineItems?: Array<{ productName?: { original?: string }; quantity?: number; price?: { amount?: string } }>
}

interface WixOrdersResponse {
  orders?: WixOrder[]
}

export async function fetchOrders(domain: string, token: string): Promise<WixOrder[]> {
  const { siteId, apiKey } = parseToken(token)
  const res = await fetch(`${BASE}/orders/query`, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'wix-site-id': siteId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: { sort: [{ fieldName: 'dateCreated', order: 'DESC' }], paging: { limit: 50 } } }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[wix] fetchOrders failed (${res.status}): ${body}`)
    return []
  }
  const data = await res.json() as WixOrdersResponse
  return data.orders ?? []
}

export async function cancelOrder(domain: string, token: string, externalId: string): Promise<void> {
  const { siteId, apiKey } = parseToken(token)
  const res = await fetch(`${BASE}/orders/${externalId}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'wix-site-id': siteId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Wix cancel failed (${res.status}): ${body}`)
  }
}

export async function fulfillOrder(
  domain: string,
  token: string,
  externalId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  const { siteId, apiKey } = parseToken(token)
  const res = await fetch(`${BASE}/orders/${externalId}/fulfill`, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'wix-site-id': siteId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fulfillments: [{
        lineItems: [],
        trackingInfo: trackingNumber
          ? { trackingNumber, shippingProvider: carrier || 'other' }
          : undefined,
      }],
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Wix fulfill failed (${res.status}): ${body}`)
  }
}
