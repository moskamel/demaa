// Jumia Vendor API integration
// OAuth 2.0: client_credentials flow — access_token + refresh_token
// Docs: https://developer.jumia.com — Base: varies by country

// Country codes supported: eg, ke, ma, ng, tz, ug, gh, sn, ci, cm, et, tn
function getBase(countryCode: string): string {
  return `https://sellercenter-api.jumia.${countryCode}/api/v1`
}

// token format: "countryCode:accessToken" — e.g. "eg:eyJ..."
function parseToken(token: string): { countryCode: string; accessToken: string } {
  const idx = token.indexOf(':')
  if (idx === -1) return { countryCode: 'eg', accessToken: token }
  return { countryCode: token.slice(0, idx), accessToken: token.slice(idx + 1) }
}

export interface JumiaOrder {
  OrderId: string
  Status: string
  CreatedAt: string
  CustomerFirstName?: string
  CustomerLastName?: string
  Phone?: string
  AddressCity?: string
  Address?: string
  Price?: string
  PaymentMethod?: string
  OrderItems?: Array<{ OrderItemId: string; Price: string; Status: string }>
}

interface JumiaOrdersResponse {
  data?: { orders?: JumiaOrder[] }
  totalCount?: number
}

// Fetch orders from Jumia Seller Center API
export async function fetchOrders(sellerId: string, token: string): Promise<JumiaOrder[]> {
  const { countryCode, accessToken } = parseToken(token)
  const base = getBase(countryCode)

  const res = await fetch(`${base}/orders?limit=50&offset=0`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[jumia] fetchOrders failed (${res.status}): ${body}`)
    return []
  }
  const data = await res.json() as JumiaOrdersResponse
  return data.data?.orders ?? []
}

// Cancel order on Jumia — sets all items to "canceled"
export async function cancelOrder(sellerId: string, token: string, externalId: string): Promise<void> {
  const { countryCode, accessToken } = parseToken(token)
  const base = getBase(countryCode)

  const res = await fetch(`${base}/orders/${externalId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'canceled', reason: 'Seller canceled' }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Jumia cancel failed (${res.status}): ${body}`)
  }
}

// Mark as shipped on Jumia
export async function fulfillOrder(
  sellerId: string,
  token: string,
  externalId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  const { countryCode, accessToken } = parseToken(token)
  const base = getBase(countryCode)

  const res = await fetch(`${base}/orders/${externalId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'shipped',
      trackingNumber: trackingNumber || '',
      shippingProvider: carrier || 'Other',
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Jumia fulfill failed (${res.status}): ${body}`)
  }
}
