const GRAPH = 'https://graph.facebook.com/v18.0'

export interface FacebookOrderItem {
  retailer_id: string
  quantity: number
  price_per_unit: { amount: string; currency: string }
}

export interface FacebookOrder {
  id: string
  order_status: { state: string }
  items: { data: FacebookOrderItem[] }
  ship_by_date?: string
  shipping_address?: {
    name?: string
    street1?: string
    city?: string
    state?: string
    country?: string
    postal_code?: string
  }
  buyer_details?: {
    name?: string
    email?: string
    phone?: string
  }
}

interface FacebookOrdersResponse {
  data: FacebookOrder[]
}

// Fetch orders from Facebook Commerce
export async function fetchOrders(pageId: string, token: string): Promise<FacebookOrder[]> {
  const fields = 'id,order_status,items{retailer_id,quantity,price_per_unit},ship_by_date,shipping_address,buyer_details'
  const res = await fetch(
    `${GRAPH}/${pageId}/commerce_orders?fields=${fields}&access_token=${token}`,
  )
  if (!res.ok) {
    const body = await res.text()
    console.error(`[facebook] fetchOrders failed (${res.status}): ${body}`)
    return []
  }
  const data = await res.json() as FacebookOrdersResponse
  return data.data ?? []
}

// Cancel an order on Facebook/Instagram Commerce
export async function cancelOrder(domain: string, token: string, externalId: string): Promise<void> {
  const res = await fetch(`${GRAPH}/${externalId}/cancellations?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cancel_reason: { reason_code: 'CUSTOMER_REQUESTED' } }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Facebook cancel failed (${res.status}): ${body}`)
  }
}

// Fulfill an order — push tracking back to Facebook/Instagram
export async function fulfillOrder(
  domain: string,
  token: string,
  externalId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  if (!trackingNumber) {
    // Acknowledge without tracking
    const res = await fetch(`${GRAPH}/${externalId}?acknowledge=true&access_token=${token}`, {
      method: 'POST',
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Facebook acknowledge failed (${res.status}): ${body}`)
    }
    return
  }

  const res = await fetch(`${GRAPH}/${externalId}/shipments?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tracking_info: {
        tracking_number: trackingNumber,
        shipping_provider_id: carrier || 'OTHER',
      },
      fulfillment_location_id: domain,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Facebook fulfill failed (${res.status}): ${body}`)
  }
}
