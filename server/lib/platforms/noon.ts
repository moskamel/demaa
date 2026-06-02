// Noon MENA marketplace integration
// Noon FBPI (Fulfillment by Partner) Seller API
// Docs: https://sell.noon.com/api-docs — Auth: Bearer token (generated from Noon Seller Lab)

const NOON_BASE = 'https://api.noon.com/seller/v1'

export interface NoonOrder {
  orderNumber: string
  status: string
  createdAt: string
  customer?: { name?: string; phone?: string }
  shippingAddress?: { city?: string; address?: string }
  grandTotal?: number
  paymentMethod?: string
  lines?: Array<{ lineNumber: string; quantity: number; unitPrice: number }>
}

interface NoonOrdersResponse {
  records?: NoonOrder[]
  totalRecords?: number
}

// Fetch orders from Noon Seller API
export async function fetchOrders(sellerId: string, token: string): Promise<NoonOrder[]> {
  const res = await fetch(`${NOON_BASE}/orders?pageSize=50&pageNumber=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[noon] fetchOrders failed (${res.status}): ${body}`)
    return []
  }
  const data = await res.json() as NoonOrdersResponse
  return data.records ?? []
}

// Cancel order on Noon
export async function cancelOrder(sellerId: string, token: string, externalId: string): Promise<void> {
  const res = await fetch(`${NOON_BASE}/orders/${externalId}/cancel`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason: 'SELLER_CANCELLED' }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Noon cancel failed (${res.status}): ${body}`)
  }
}

// Confirm shipment / fulfill order on Noon
export async function fulfillOrder(
  sellerId: string,
  token: string,
  externalId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  const res = await fetch(`${NOON_BASE}/orders/${externalId}/ship`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      trackingNumber: trackingNumber || '',
      carrier: carrier || 'Other',
      shippedAt: new Date().toISOString(),
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Noon fulfill failed (${res.status}): ${body}`)
  }
}
