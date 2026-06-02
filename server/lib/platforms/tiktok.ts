const BASE = 'https://open-api.tiktokglobalshop.com'

export interface TikTokOrderItem {
  sku_id: string
  product_name?: string
  quantity: number
  sale_price?: string
}

export interface TikTokOrder {
  order_id: string
  order_status: string
  recipient_address?: {
    name?: string
    full_address?: string
    district_info?: Array<{ address_level_name?: string }>
    phone_number?: string
  }
  payment_info?: { total_amount?: string; payment_method?: string }
  item_list?: TikTokOrderItem[]
  create_time?: number
}

interface TikTokOrdersResponse {
  data?: {
    order_list?: TikTokOrder[]
  }
  code?: number
  message?: string
}

// Fetch orders from TikTok Shop
export async function fetchOrders(shopId: string, token: string): Promise<TikTokOrder[]> {
  const res = await fetch(`${BASE}/order/202309/orders/search`, {
    method: 'POST',
    headers: {
      'x-tts-access-token': token,
      'shop-id': shopId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order_status: 'AWAITING_SHIPMENT', page_size: 50 }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[tiktok] fetchOrders failed (${res.status}): ${body}`)
    return []
  }
  const data = await res.json() as TikTokOrdersResponse
  return data.data?.order_list ?? []
}

// Cancel order on TikTok Shop
export async function cancelOrder(domain: string, token: string, externalId: string): Promise<void> {
  const res = await fetch(`${BASE}/order/202309/orders/cancel`, {
    method: 'POST',
    headers: {
      'x-tts-access-token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order_id_list: [externalId], cancel_reason: 'OUT_OF_STOCK' }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`TikTok cancel failed (${res.status}): ${body}`)
  }
}

// Fulfill order — create shipment package on TikTok Shop
export async function fulfillOrder(
  domain: string,
  token: string,
  externalId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  const res = await fetch(`${BASE}/fulfillment/202309/packages`, {
    method: 'POST',
    headers: {
      'x-tts-access-token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_id: externalId,
      tracking_number: trackingNumber,
      shipping_provider_id: carrier || 'OTHER',
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`TikTok fulfill failed (${res.status}): ${body}`)
  }
}
