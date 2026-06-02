const BASE = 'https://api.salla.dev/admin/v2'

export interface SallaOrder {
  id: string | number
  reference_id?: string
  status: { name: string }
  total: { amount: number }
  customer: { name?: string; mobile?: string }
  shipping?: { address?: { city?: string } }
}

interface SallaOrdersResponse {
  data: SallaOrder[]
  pagination?: { total?: number }
}

// Fetch orders from Salla
export async function fetchOrders(storeId: string, token: string): Promise<SallaOrder[]> {
  const res = await fetch(`${BASE}/orders?per_page=50`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[salla] fetchOrders failed (${res.status}): ${body}`)
    return []
  }
  const data = await res.json() as SallaOrdersResponse
  return data.data ?? []
}

// Cancel order on Salla
export async function cancelOrder(storeId: string, token: string, externalId: string): Promise<void> {
  const res = await fetch(`${BASE}/orders/${externalId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'canceled' }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Salla cancel failed (${res.status}): ${body}`)
  }
}

// Fulfill order on Salla — mark as shipped with tracking
export async function fulfillOrder(
  storeId: string,
  token: string,
  externalId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  const res = await fetch(`${BASE}/orders/${externalId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'shipping',
      shipment: {
        tracking_number: trackingNumber,
        shipping_company: carrier || 'other',
      },
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Salla fulfill failed (${res.status}): ${body}`)
  }
}
