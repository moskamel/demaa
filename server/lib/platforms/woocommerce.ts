// WooCommerce REST API v3 integration
// Auth: HTTP Basic (consumerKey:consumerSecret) — encoded as composite token
// Docs: https://woocommerce.github.io/woocommerce-rest-api-docs/

// token format: "consumerKey:consumerSecret"
function parseToken(token: string): { key: string; secret: string } {
  const idx = token.indexOf(':')
  if (idx === -1) throw new Error('WooCommerce token must be in format consumerKey:consumerSecret')
  return { key: token.slice(0, idx), secret: token.slice(idx + 1) }
}

function authHeader(token: string): string {
  const { key, secret } = parseToken(token)
  return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64')
}

export interface WooOrder {
  id: number
  status: string
  date_created: string
  total: string
  payment_method: string
  billing: {
    first_name?: string
    last_name?: string
    phone?: string
    city?: string
    address_1?: string
  }
  line_items: Array<{ name: string; quantity: number; total: string }>
}

interface WooOrdersResponse {
  orders?: WooOrder[]
}

export async function fetchOrders(domain: string, token: string): Promise<WooOrder[]> {
  const base = `https://${domain}/wp-json/wc/v3`
  const res = await fetch(`${base}/orders?per_page=50&orderby=date&order=desc`, {
    headers: { Authorization: authHeader(token), 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[woocommerce] fetchOrders failed (${res.status}): ${body}`)
    return []
  }
  const data = await res.json() as WooOrder[]
  return Array.isArray(data) ? data : (data as WooOrdersResponse).orders ?? []
}

export async function cancelOrder(domain: string, token: string, externalId: string): Promise<void> {
  const base = `https://${domain}/wp-json/wc/v3`
  const res = await fetch(`${base}/orders/${externalId}`, {
    method: 'PUT',
    headers: { Authorization: authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled' }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`WooCommerce cancel failed (${res.status}): ${body}`)
  }
}

export async function fulfillOrder(
  domain: string,
  token: string,
  externalId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  const base = `https://${domain}/wp-json/wc/v3`
  // Mark order as completed; add tracking note if provided
  const note = trackingNumber ? `شحنة: ${carrier || ''} — رقم التتبع: ${trackingNumber}` : undefined
  const body: Record<string, unknown> = { status: 'completed' }
  if (note) body.customer_note = true

  const res = await fetch(`${base}/orders/${externalId}`, {
    method: 'PUT',
    headers: { Authorization: authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const body2 = await res.text()
    throw new Error(`WooCommerce fulfill failed (${res.status}): ${body2}`)
  }

  // Add order note with tracking number
  if (note) {
    await fetch(`${base}/orders/${externalId}/notes`, {
      method: 'POST',
      headers: { Authorization: authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ note, customer_note: true }),
    }).catch(() => {})
  }
}
