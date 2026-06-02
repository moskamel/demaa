// BigCommerce REST API v2 integration
// Auth: X-Auth-Token header — generated from Store API Settings
// Docs: https://developer.bigcommerce.com/docs/rest-management/orders
// Base: https://api.bigcommerce.com/stores/{storeHash}/v2

// token format: "storeHash:accessToken"
function parseToken(token: string): { storeHash: string; accessToken: string } {
  const idx = token.indexOf(':')
  if (idx === -1) throw new Error('BigCommerce token must be in format storeHash:accessToken')
  return { storeHash: token.slice(0, idx), accessToken: token.slice(idx + 1) }
}

function base(storeHash: string) {
  return `https://api.bigcommerce.com/stores/${storeHash}/v2`
}

export interface BigCommerceOrder {
  id: number
  status: string
  date_created: string
  total_inc_tax: string
  payment_method: string
  billing_address: {
    first_name?: string
    last_name?: string
    phone?: string
    city?: string
    street_1?: string
  }
}

export async function fetchOrders(domain: string, token: string): Promise<BigCommerceOrder[]> {
  const { storeHash, accessToken } = parseToken(token)
  const res = await fetch(`${base(storeHash)}/orders?limit=50&sort=date_created:desc`, {
    headers: {
      'X-Auth-Token': accessToken,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[bigcommerce] fetchOrders failed (${res.status}): ${body}`)
    return []
  }
  const data = await res.json() as BigCommerceOrder[]
  return Array.isArray(data) ? data : []
}

export async function cancelOrder(domain: string, token: string, externalId: string): Promise<void> {
  const { storeHash, accessToken } = parseToken(token)
  // Status ID 5 = Cancelled in BigCommerce
  const res = await fetch(`${base(storeHash)}/orders/${externalId}`, {
    method: 'PUT',
    headers: {
      'X-Auth-Token': accessToken,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ status_id: 5 }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`BigCommerce cancel failed (${res.status}): ${body}`)
  }
}

export async function fulfillOrder(
  domain: string,
  token: string,
  externalId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  const { storeHash, accessToken } = parseToken(token)
  // Status ID 2 = Shipped
  await fetch(`${base(storeHash)}/orders/${externalId}`, {
    method: 'PUT',
    headers: {
      'X-Auth-Token': accessToken,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ status_id: 2 }),
  })

  // Create shipment record with tracking
  if (trackingNumber) {
    await fetch(`${base(storeHash)}/orders/${externalId}/shipments`, {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        tracking_number: trackingNumber,
        shipping_provider: carrier || 'other',
        order_address_id: 1,
        items: [],
      }),
    }).catch(() => {})
  }
}
