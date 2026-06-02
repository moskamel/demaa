const BASE = 'https://api.zid.sa/v1'

export interface ZidOrder {
  id: string | number
  code?: string
  status: string
  customer_name?: string
  customer_mobile?: string
  city_name?: string
  payment_method?: string
  total_amount?: number
}

interface ZidOrdersResponse {
  orders: ZidOrder[]
}

// Fetch orders from Zid
export async function fetchOrders(storeId: string, token: string): Promise<ZidOrder[]> {
  const res = await fetch(`${BASE}/managers/store/orders/?page=1&per_page=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Manager-Token': token,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[zid] fetchOrders failed (${res.status}): ${body}`)
    return []
  }
  const data = await res.json() as ZidOrdersResponse
  return data.orders ?? []
}

// Cancel order on Zid
export async function cancelOrder(storeId: string, token: string, externalId: string): Promise<void> {
  const res = await fetch(`${BASE}/managers/store/orders/${externalId}/change-order-status`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Manager-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'cancelled' }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Zid cancel failed (${res.status}): ${body}`)
  }
}

// Fulfill order on Zid — mark as in delivery with tracking
export async function fulfillOrder(
  storeId: string,
  token: string,
  externalId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  const res = await fetch(`${BASE}/managers/store/orders/${externalId}/change-order-status`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Manager-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'indelivery',
      tracking_number: trackingNumber,
      shipping_company: carrier || 'other',
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Zid fulfill failed (${res.status}): ${body}`)
  }
}
