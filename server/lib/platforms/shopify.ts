const API_VERSION = '2024-01'

function headers(token: string) {
  return { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
}

function base(domain: string) {
  return `https://${domain}/admin/api/${API_VERSION}`
}

// Push order cancellation to Shopify
export async function cancelOrder(domain: string, token: string, shopifyOrderId: string): Promise<void> {
  const res = await fetch(`${base(domain)}/orders/${shopifyOrderId}/cancel.json`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ reason: 'other', email: false }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Shopify cancel failed (${res.status}): ${body}`)
  }
}

// Push fulfillment to Shopify — used when shipping an order
export async function fulfillOrder(
  domain: string,
  token: string,
  shopifyOrderId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  // First get the fulfillment order ID (required by Shopify's newer API)
  const foRes = await fetch(`${base(domain)}/orders/${shopifyOrderId}/fulfillment_orders.json`, {
    headers: headers(token),
  })

  if (!foRes.ok) {
    // Fall back to legacy fulfillment endpoint
    await legacyFulfill(domain, token, shopifyOrderId, trackingNumber, carrier)
    return
  }

  const { fulfillment_orders } = await foRes.json() as { fulfillment_orders: Array<{ id: number; status: string }> }
  const open = fulfillment_orders.find(fo => fo.status === 'open')
  if (!open) {
    // Order already fulfilled or no open fulfillment orders
    return
  }

  const body = {
    fulfillment: {
      line_items_by_fulfillment_order: [{ fulfillment_order_id: open.id }],
      notify_customer: true,
      ...(trackingNumber && {
        tracking_info: {
          number: trackingNumber,
          company: carrier || 'Other',
        },
      }),
    },
  }

  const res = await fetch(`${base(domain)}/fulfillments.json`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shopify fulfill failed (${res.status}): ${err}`)
  }
}

// Legacy fulfillment endpoint (older Shopify stores)
async function legacyFulfill(
  domain: string,
  token: string,
  shopifyOrderId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  const body = {
    fulfillment: {
      notify_customer: true,
      ...(trackingNumber && { tracking_number: trackingNumber, tracking_company: carrier || 'Other' }),
    },
  }
  const res = await fetch(`${base(domain)}/orders/${shopifyOrderId}/fulfillments.json`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shopify legacy fulfill failed (${res.status}): ${err}`)
  }
}
