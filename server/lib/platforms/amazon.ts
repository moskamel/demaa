// Amazon SP-API (Selling Partner API) integration
// Auth: LWA (Login with Amazon) OAuth — access token obtained via client_credentials
// Docs: https://developer-docs.amazon.com/sp-api/docs

const SP_BASE = 'https://sellingpartnerapi-na.amazon.com'

// token format: "clientId:clientSecret:refreshToken" — encoded as a composite secret
function parseToken(token: string): { clientId: string; clientSecret: string; refreshToken: string } {
  const parts = token.split(':')
  if (parts.length < 3) throw new Error('Amazon token must be in format clientId:clientSecret:refreshToken')
  return { clientId: parts[0], clientSecret: parts[1], refreshToken: parts.slice(2).join(':') }
}

async function getLwaAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Amazon LWA token failed (${res.status}): ${body}`)
  }
  const data = await res.json() as { access_token: string }
  return data.access_token
}

export interface AmazonOrder {
  AmazonOrderId: string
  OrderStatus: string
  PurchaseDate: string
  OrderTotal?: { Amount: string; CurrencyCode: string }
  BuyerInfo?: { BuyerEmail?: string; BuyerName?: string }
  ShippingAddress?: { Name?: string; City?: string; AddressLine1?: string; Phone?: string }
  FulfillmentChannel?: string
  PaymentMethod?: string
}

// Fetch orders from Amazon SP-API
export async function fetchOrders(marketplaceId: string, token: string): Promise<AmazonOrder[]> {
  const { clientId, clientSecret, refreshToken } = parseToken(token)
  const accessToken = await getLwaAccessToken(clientId, clientSecret, refreshToken)

  const url = `${SP_BASE}/orders/v0/orders?MarketplaceIds=${marketplaceId}&OrderStatuses=Unshipped,PartiallyShipped,Shipped,Canceled&MaxResultsPerPage=50`
  const res = await fetch(url, {
    headers: {
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[amazon] fetchOrders failed (${res.status}): ${body}`)
    return []
  }
  const data = await res.json() as { payload?: { Orders?: AmazonOrder[] } }
  return data.payload?.Orders ?? []
}

// Cancel order on Amazon SP-API
export async function cancelOrder(marketplaceId: string, token: string, externalId: string): Promise<void> {
  const { clientId, clientSecret, refreshToken } = parseToken(token)
  const accessToken = await getLwaAccessToken(clientId, clientSecret, refreshToken)

  const res = await fetch(`${SP_BASE}/orders/v0/orders/${externalId}/cancelorder`, {
    method: 'POST',
    headers: {
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Amazon cancel failed (${res.status}): ${body}`)
  }
}

// Confirm shipment on Amazon SP-API
export async function fulfillOrder(
  marketplaceId: string,
  token: string,
  externalId: string,
  trackingNumber?: string,
  carrier?: string,
): Promise<void> {
  const { clientId, clientSecret, refreshToken } = parseToken(token)
  const accessToken = await getLwaAccessToken(clientId, clientSecret, refreshToken)

  const res = await fetch(`${SP_BASE}/orders/v0/orders/${externalId}/shipment`, {
    method: 'POST',
    headers: {
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      marketplaceId,
      shippingDate: new Date().toISOString(),
      packageReferenceId: externalId,
      carrierCode: carrier || 'Other',
      carrierName: carrier || 'Carrier',
      trackingNumber: trackingNumber || '',
      shipFromSupplySourceId: null,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Amazon fulfill failed (${res.status}): ${body}`)
  }
}
