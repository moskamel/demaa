import crypto from 'crypto'
import type {
  PlatformIntegration,
  Platform,
  TokenData,
  UnifiedOrder,
  UnifiedOrderItem,
  UnifiedProduct,
  UnifiedCustomer,
  StoreInfo,
  WebhookEvent,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderFilters,
  ProductFilters,
  CustomerFilters,
} from '../types.js'

// ─── Errors ───────────────────────────────────────────────────────────────────

export class ShopifyApiError extends Error {
  constructor(msg: string, public status: number) {
    super(msg)
    this.name = 'ShopifyApiError'
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_VERSION = '2024-01'

const WEBHOOK_TOPICS = [
  'orders/create',
  'orders/updated',
  'products/update',
  'inventory_levels/update',
  'customers/create',
]

// ─── Status maps ──────────────────────────────────────────────────────────────

const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  pending: 'pending',
  open: 'accepted',
  in_progress: 'shipped',
  fulfilled: 'delivered',
  cancelled: 'cancelled',
  refunded: 'returned',
}

const UNIFIED_TO_SHOPIFY_STATUS: Record<string, string> = {
  pending: 'pending',
  accepted: 'open',
  shipped: 'in_progress',
  delivered: 'fulfilled',
  cancelled: 'cancelled',
  returned: 'refunded',
}

const PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = {
  credit_card: 'card',
  debit: 'card',
  cash: 'cash',
  cod: 'cod',
  tabby: 'tabby',
  tamara: 'tamara',
  stcpay: 'stcpay',
  bank_transfer: 'bank_transfer',
  bank_deposit: 'bank_transfer',
}

// ─── Shopify raw types ────────────────────────────────────────────────────────

interface ShopifyTokenResponse {
  access_token: string
  scope?: string
}

interface ShopifyAddress {
  city?: string
  address1?: string
  address2?: string
  province?: string
  country?: string
  phone?: string
}

interface ShopifyCustomerRaw {
  id?: number
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
  default_address?: ShopifyAddress
  orders_count?: number
  total_spent?: string
  [key: string]: unknown
}

interface ShopifyProductVariant {
  id?: number
  sku?: string
  price?: string
  compare_at_price?: string
  inventory_quantity?: number
}

interface ShopifyProductRaw {
  id: number
  title: string
  body_html?: string
  vendor?: string
  product_type?: string
  status?: string
  variants?: ShopifyProductVariant[]
  images?: Array<{ src?: string }>
  [key: string]: unknown
}

interface ShopifyLineItem {
  id?: number
  title: string
  sku?: string
  quantity: number
  price?: string
  total_discount?: string
  product_id?: number
  variant_id?: number
}

interface ShopifyOrderRaw {
  id: number
  name?: string
  financial_status?: string
  fulfillment_status?: string | null
  cancel_reason?: string
  customer?: ShopifyCustomerRaw
  billing_address?: ShopifyAddress
  shipping_address?: ShopifyAddress
  current_total_price?: string
  subtotal_price?: string
  total_shipping_price_set?: { shop_money?: { amount?: string } }
  total_discounts?: string
  currency?: string
  gateway?: string
  payment_gateway_names?: string[]
  line_items?: ShopifyLineItem[]
  note?: string
  created_at?: string
  [key: string]: unknown
}

interface ShopifyStoreRaw {
  id?: number
  name?: string
  domain?: string
  myshopify_domain?: string
  currency?: string
  iana_timezone?: string
  email?: string
  phone?: string
  [key: string]: unknown
}

interface ShopifyWebhookRaw {
  id?: number
  topic?: string
  address?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toCents(amount: string | number | undefined): number {
  const n = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0)
  return Math.round(n * 100)
}

// Token stored as "domain::accessToken"
function parseToken(token: string): { domain: string; accessToken: string } {
  const sep = token.indexOf('::')
  if (sep === -1) return { domain: '', accessToken: token }
  return { domain: token.slice(0, sep), accessToken: token.slice(sep + 2) }
}

function shopApiBase(domain: string): string {
  return `https://${domain}/admin/api/${API_VERSION}`
}

function buildAuthHeaders(accessToken: string): Record<string, string> {
  return {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

async function assertOk(res: Response, context: string): Promise<void> {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ShopifyApiError(`Shopify ${context} failed (${res.status}): ${body}`, res.status)
  }
}

function mapOrderStatus(financial: string | undefined, fulfillment: string | null | undefined): OrderStatus {
  if (financial === 'refunded') return 'returned'
  if (financial === 'voided' || financial === 'cancelled') return 'cancelled'
  if (fulfillment === 'fulfilled') return 'delivered'
  if (fulfillment === 'in_progress') return 'shipped'
  if (financial === 'paid' || financial === 'partially_paid') return 'accepted'
  return ORDER_STATUS_MAP[financial ?? ''] ?? 'pending'
}

function mapPaymentMethod(gateway: string | undefined, names: string[] | undefined): PaymentMethod {
  const method = (gateway ?? names?.[0] ?? '').toLowerCase()
  if (!method) return 'other'
  for (const [key, val] of Object.entries(PAYMENT_METHOD_MAP)) {
    if (method.includes(key)) return val
  }
  if (method.includes('card') || method.includes('credit') || method.includes('debit')) return 'card'
  if (method.includes('cash')) return 'cash'
  if (method.includes('bank')) return 'bank_transfer'
  return 'other'
}

function mapPaymentStatus(financial: string | undefined): PaymentStatus {
  if (!financial) return 'pending'
  if (financial === 'paid' || financial === 'partially_paid') return 'paid'
  if (financial === 'refunded' || financial === 'partially_refunded') return 'refunded'
  if (financial === 'voided') return 'failed'
  return 'pending'
}

function transformOrder(raw: ShopifyOrderRaw, storeId: string): UnifiedOrder {
  const shippingAddr = raw.shipping_address ?? raw.billing_address
  const city = shippingAddr?.city ?? ''
  const addressParts = [shippingAddr?.address1, shippingAddr?.address2].filter(Boolean)

  const items: UnifiedOrderItem[] = (raw.line_items ?? []).map((item) => ({
    externalId: item.id != null ? String(item.id) : undefined,
    name: item.title,
    sku: item.sku,
    qty: item.quantity,
    unitPrice: toCents(item.price),
    totalPrice: toCents(
      (parseFloat(item.price ?? '0') - parseFloat(item.total_discount ?? '0') / item.quantity) *
        item.quantity,
    ),
    productExternalId: item.product_id != null ? String(item.product_id) : undefined,
  }))

  const shippingFee = toCents(
    raw.total_shipping_price_set?.shop_money?.amount ?? 0,
  )

  const customerName = raw.customer
    ? [raw.customer.first_name, raw.customer.last_name].filter(Boolean).join(' ')
    : ''

  return {
    externalId: String(raw.id),
    storeId,
    platform: 'shopify',
    customerName,
    customerPhone: raw.customer?.phone ?? shippingAddr?.phone,
    customerEmail: raw.customer?.email,
    city,
    address: addressParts.length > 0 ? addressParts.join(', ') : undefined,
    total: toCents(raw.current_total_price),
    subtotal: toCents(raw.subtotal_price),
    shippingFee,
    discount: toCents(raw.total_discounts),
    currency: raw.currency ?? 'USD',
    status: mapOrderStatus(raw.financial_status, raw.fulfillment_status),
    paymentMethod: mapPaymentMethod(raw.gateway, raw.payment_gateway_names),
    paymentStatus: mapPaymentStatus(raw.financial_status),
    items,
    notes: raw.note,
    externalCreatedAt: raw.created_at ? new Date(raw.created_at) : new Date(),
    platformData: raw as Record<string, unknown>,
  }
}

function transformProduct(raw: ShopifyProductRaw): UnifiedProduct {
  const variant = raw.variants?.[0]
  const firstImage = raw.images?.[0]?.src

  return {
    externalId: String(raw.id),
    name: raw.title,
    description: raw.body_html,
    sku: variant?.sku,
    price: toCents(variant?.price),
    costPrice: 0,
    comparePrice: variant?.compare_at_price ? toCents(variant.compare_at_price) : undefined,
    stock: variant?.inventory_quantity ?? 0,
    category: raw.product_type,
    imageUrl: firstImage,
    isActive: raw.status === 'active',
    platformData: raw as Record<string, unknown>,
  }
}

function transformCustomer(raw: ShopifyCustomerRaw): UnifiedCustomer {
  const name = [raw.first_name, raw.last_name].filter(Boolean).join(' ')
  return {
    externalId: String(raw.id ?? ''),
    name,
    phone: raw.phone,
    email: raw.email,
    city: raw.default_address?.city,
    totalOrders: raw.orders_count ?? 0,
    totalSpent: toCents(raw.total_spent),
    platformData: raw as Record<string, unknown>,
  }
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class ShopifyIntegration implements PlatformIntegration {
  readonly platform: Platform = 'shopify'

  private get clientId(): string {
    const id = process.env.SHOPIFY_CLIENT_ID
    if (!id) throw new Error('SHOPIFY_CLIENT_ID env var is not set')
    return id
  }

  private get clientSecret(): string {
    const secret = process.env.SHOPIFY_CLIENT_SECRET
    if (!secret) throw new Error('SHOPIFY_CLIENT_SECRET env var is not set')
    return secret
  }

  private get webhookSecret(): string {
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET
    if (!secret) throw new Error('SHOPIFY_WEBHOOK_SECRET env var is not set')
    return secret
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  // storeId format: "internalStoreId:shopDomain"
  getAuthUrl(storeId: string, redirectUri: string): string {
    const colonIdx = storeId.lastIndexOf(':')
    const shopDomain =
      colonIdx !== -1 ? storeId.slice(colonIdx + 1) : storeId
    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: [
        'read_orders',
        'write_orders',
        'read_products',
        'write_products',
        'read_customers',
        'read_inventory',
        'write_inventory',
      ].join(','),
      redirect_uri: redirectUri,
      state: storeId,
    })
    return `https://${shopDomain}/admin/oauth/authorize?${params.toString()}`
  }

  // state encodes the storeId which contains the shopDomain
  async exchangeCode(code: string, redirectUri: string, state?: string): Promise<TokenData> {
    const colonIdx = (state ?? '').lastIndexOf(':')
    const shopDomain = colonIdx !== -1 ? (state ?? '').slice(colonIdx + 1) : ''
    if (!shopDomain) throw new ShopifyApiError('shopDomain is required to exchange code', 400)

    const res = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      }),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'exchangeCode')
    const data = (await res.json()) as ShopifyTokenResponse

    // Store domain alongside access token so subsequent calls know the shop URL
    return {
      accessToken: `${shopDomain}::${data.access_token}`,
      scope: data.scope,
    }
  }

  // Shopify uses offline access tokens that do not expire — refresh is a no-op
  async refreshToken(refreshToken: string): Promise<TokenData> {
    return { accessToken: refreshToken }
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  async getOrders(token: string, filters: OrderFilters): Promise<UnifiedOrder[]> {
    const { domain, accessToken } = parseToken(token)
    const params = new URLSearchParams({ status: 'any' })
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.page) params.set('page', String(filters.page))
    if (filters.status) params.set('financial_status', filters.status)
    if (filters.since) params.set('created_at_min', filters.since.toISOString())

    const res = await fetch(`${shopApiBase(domain)}/orders.json?${params.toString()}`, {
      headers: buildAuthHeaders(accessToken),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getOrders')
    const body = (await res.json()) as { orders: ShopifyOrderRaw[] }
    return (body.orders ?? []).map((o) => transformOrder(o, domain))
  }

  async getOrderById(token: string, orderId: string): Promise<UnifiedOrder> {
    const { domain, accessToken } = parseToken(token)
    const res = await fetch(`${shopApiBase(domain)}/orders/${orderId}.json`, {
      headers: buildAuthHeaders(accessToken),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getOrderById')
    const body = (await res.json()) as { order: ShopifyOrderRaw }
    return transformOrder(body.order, domain)
  }

  async acceptOrder(token: string, orderId: string): Promise<void> {
    // Shopify doesn't have an explicit accept; opening the order signals acceptance
    await this.updateOrderStatus(token, orderId, 'accepted')
  }

  async rejectOrder(token: string, orderId: string, reason: string): Promise<void> {
    const { domain, accessToken } = parseToken(token)
    const res = await fetch(`${shopApiBase(domain)}/orders/${orderId}/cancel.json`, {
      method: 'POST',
      headers: buildAuthHeaders(accessToken),
      body: JSON.stringify({ reason: 'other', note: reason }),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'rejectOrder')
  }

  async updateOrderStatus(token: string, orderId: string, status: OrderStatus): Promise<void> {
    const { domain, accessToken } = parseToken(token)

    if (status === 'cancelled' || status === 'rejected') {
      const res = await fetch(`${shopApiBase(domain)}/orders/${orderId}/cancel.json`, {
        method: 'POST',
        headers: buildAuthHeaders(accessToken),
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(10000),
      })
      await assertOk(res, 'updateOrderStatus (cancel)')
      return
    }

    if (status === 'delivered') {
      // Create a fulfillment to mark as delivered
      const res = await fetch(`${shopApiBase(domain)}/orders/${orderId}/fulfillments.json`, {
        method: 'POST',
        headers: buildAuthHeaders(accessToken),
        body: JSON.stringify({ fulfillment: { notify_customer: false } }),
        signal: AbortSignal.timeout(10000),
      })
      // 422 may mean already fulfilled — treat as success
      if (!res.ok && res.status !== 422) {
        const body = await res.text().catch(() => '')
        throw new ShopifyApiError(`Shopify updateOrderStatus (fulfill) failed (${res.status}): ${body}`, res.status)
      }
      return
    }

    // For other statuses update the order note/tags to reflect state
    const shopifyStatus = UNIFIED_TO_SHOPIFY_STATUS[status]
    if (shopifyStatus) {
      const res = await fetch(`${shopApiBase(domain)}/orders/${orderId}.json`, {
        method: 'PUT',
        headers: buildAuthHeaders(accessToken),
        body: JSON.stringify({ order: { tags: shopifyStatus } }),
        signal: AbortSignal.timeout(10000),
      })
      await assertOk(res, 'updateOrderStatus')
    }
  }

  // ── Products ──────────────────────────────────────────────────────────────

  async getProducts(token: string, filters: ProductFilters): Promise<UnifiedProduct[]> {
    const { domain, accessToken } = parseToken(token)
    const params = new URLSearchParams()
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.page) params.set('page', String(filters.page))
    if (filters.category) params.set('product_type', filters.category)

    const res = await fetch(`${shopApiBase(domain)}/products.json?${params.toString()}`, {
      headers: buildAuthHeaders(accessToken),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getProducts')
    const body = (await res.json()) as { products: ShopifyProductRaw[] }
    return (body.products ?? []).map(transformProduct)
  }

  async getProductById(token: string, productId: string): Promise<UnifiedProduct> {
    const { domain, accessToken } = parseToken(token)
    const res = await fetch(`${shopApiBase(domain)}/products/${productId}.json`, {
      headers: buildAuthHeaders(accessToken),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getProductById')
    const body = (await res.json()) as { product: ShopifyProductRaw }
    return transformProduct(body.product)
  }

  async updateProduct(
    token: string,
    productId: string,
    data: Partial<UnifiedProduct>,
  ): Promise<UnifiedProduct> {
    const { domain, accessToken } = parseToken(token)
    const productPayload: Record<string, unknown> = {}
    if (data.name !== undefined) productPayload.title = data.name
    if (data.description !== undefined) productPayload.body_html = data.description
    if (data.isActive !== undefined) productPayload.status = data.isActive ? 'active' : 'draft'

    const variantPayload: Record<string, unknown> = {}
    if (data.price !== undefined) variantPayload.price = (data.price / 100).toFixed(2)
    if (data.comparePrice !== undefined)
      variantPayload.compare_at_price = (data.comparePrice / 100).toFixed(2)

    if (Object.keys(variantPayload).length > 0) {
      productPayload.variants = [variantPayload]
    }

    const res = await fetch(`${shopApiBase(domain)}/products/${productId}.json`, {
      method: 'PUT',
      headers: buildAuthHeaders(accessToken),
      body: JSON.stringify({ product: productPayload }),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'updateProduct')
    const body = (await res.json()) as { product: ShopifyProductRaw }
    return transformProduct(body.product)
  }

  async updateStock(token: string, productId: string, quantity: number): Promise<void> {
    const { domain, accessToken } = parseToken(token)
    // Fetch the product to find its variant and inventory item ID
    const prodRes = await fetch(`${shopApiBase(domain)}/products/${productId}.json`, {
      headers: buildAuthHeaders(accessToken),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(prodRes, 'updateStock (getProduct)')
    const prodBody = (await prodRes.json()) as { product: ShopifyProductRaw & { variants?: Array<{ inventory_item_id?: number }> } }
    const inventoryItemId = prodBody.product.variants?.[0]?.inventory_item_id
    if (!inventoryItemId) throw new ShopifyApiError('No inventory item found for product', 404)

    // Get location
    const locRes = await fetch(`${shopApiBase(domain)}/locations.json`, {
      headers: buildAuthHeaders(accessToken),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(locRes, 'updateStock (getLocations)')
    const locBody = (await locRes.json()) as { locations: Array<{ id: number }> }
    const locationId = locBody.locations[0]?.id
    if (!locationId) throw new ShopifyApiError('No location found for inventory update', 404)

    const res = await fetch(`${shopApiBase(domain)}/inventory_levels/set.json`, {
      method: 'POST',
      headers: buildAuthHeaders(accessToken),
      body: JSON.stringify({ inventory_item_id: inventoryItemId, location_id: locationId, available: quantity }),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'updateStock')
  }

  // ── Customers ─────────────────────────────────────────────────────────────

  async getCustomers(token: string, filters: CustomerFilters): Promise<UnifiedCustomer[]> {
    const { domain, accessToken } = parseToken(token)
    const params = new URLSearchParams()
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.page) params.set('page', String(filters.page))
    if (filters.search) params.set('query', filters.search)

    const res = await fetch(`${shopApiBase(domain)}/customers.json?${params.toString()}`, {
      headers: buildAuthHeaders(accessToken),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getCustomers')
    const body = (await res.json()) as { customers: ShopifyCustomerRaw[] }
    return (body.customers ?? []).map(transformCustomer)
  }

  async getCustomerById(token: string, customerId: string): Promise<UnifiedCustomer> {
    const { domain, accessToken } = parseToken(token)
    const res = await fetch(`${shopApiBase(domain)}/customers/${customerId}.json`, {
      headers: buildAuthHeaders(accessToken),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getCustomerById')
    const body = (await res.json()) as { customer: ShopifyCustomerRaw }
    return transformCustomer(body.customer)
  }

  // ── Webhooks ──────────────────────────────────────────────────────────────

  async registerWebhooks(token: string, storeId: string, webhookBaseUrl: string): Promise<void> {
    const { domain, accessToken } = parseToken(token)
    const callbackBase = `${webhookBaseUrl}/webhooks/shopify`

    await Promise.all(
      WEBHOOK_TOPICS.map(async (topic) => {
        const res = await fetch(`${shopApiBase(domain)}/webhooks.json`, {
          method: 'POST',
          headers: buildAuthHeaders(accessToken),
          body: JSON.stringify({
            webhook: {
              topic,
              address: callbackBase,
              format: 'json',
            },
          }),
          signal: AbortSignal.timeout(10000),
        })
        // 422 typically means webhook already registered — treat as success
        if (!res.ok && res.status !== 422) {
          const body = await res.text().catch(() => '')
          throw new ShopifyApiError(
            `Shopify registerWebhooks (${topic}) failed (${res.status}): ${body}`,
            res.status,
          )
        }
      }),
    )
  }

  async deregisterWebhooks(token: string, storeId: string): Promise<void> {
    const { domain, accessToken } = parseToken(token)
    const res = await fetch(`${shopApiBase(domain)}/webhooks.json`, {
      headers: buildAuthHeaders(accessToken),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return

    const body = (await res.json()) as { webhooks: ShopifyWebhookRaw[] }
    const webhooks = body.webhooks ?? []

    await Promise.all(
      webhooks
        .filter((w) => w.id != null)
        .map(async (w) => {
          const delRes = await fetch(`${shopApiBase(domain)}/webhooks/${w.id}.json`, {
            method: 'DELETE',
            headers: buildAuthHeaders(accessToken),
            signal: AbortSignal.timeout(10000),
          })
          if (!delRes.ok && delRes.status !== 404) {
            const errBody = await delRes.text().catch(() => '')
            throw new ShopifyApiError(
              `Shopify deregisterWebhooks (id=${w.id}) failed (${delRes.status}): ${errBody}`,
              delRes.status,
            )
          }
        }),
    )
  }

  verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64')
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(expected, 'base64'),
      )
    } catch {
      return false
    }
  }

  parseWebhookEvent(body: unknown, headers: Record<string, string>): WebhookEvent {
    const payload = body as Record<string, unknown>
    const topic = headers['x-shopify-topic'] ?? ''
    const shopDomain = headers['x-shopify-shop-domain']
    const webhookId = headers['x-shopify-webhook-id']

    const externalId =
      webhookId ??
      (payload.id as string | number | undefined)?.toString() ??
      `${topic}-${Date.now()}`

    // Normalize topic: orders/create → order.created, products/update → product.updated
    const normalizedTopic = topic
      .replace('orders/', 'order.')
      .replace('products/', 'product.')
      .replace('customers/', 'customer.')
      .replace('inventory_levels/', 'inventory.')
      .replace('/create', '.created')
      .replace('/update', '.updated')
      .replace('/updated', '.updated')
      .replace('/delete', '.deleted')

    return {
      platform: 'shopify',
      topic: normalizedTopic,
      externalId,
      storeExternalId: shopDomain,
      payload: payload,
      rawBody: typeof body === 'string' ? body : JSON.stringify(body),
    }
  }

  // ── Store ─────────────────────────────────────────────────────────────────

  async getStoreInfo(token: string): Promise<StoreInfo> {
    const { domain, accessToken } = parseToken(token)
    const res = await fetch(`${shopApiBase(domain)}/shop.json`, {
      headers: buildAuthHeaders(accessToken),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getStoreInfo')
    const body = (await res.json()) as { shop: ShopifyStoreRaw }
    const shop = body.shop
    return {
      externalId: String(shop.id ?? ''),
      name: shop.name ?? '',
      domain: shop.domain ?? shop.myshopify_domain,
      currency: shop.currency ?? 'USD',
      timezone: shop.iana_timezone,
      email: shop.email,
      phone: shop.phone,
      platformData: shop as Record<string, unknown>,
    }
  }

  async testConnection(token: string): Promise<boolean> {
    try {
      await this.getStoreInfo(token)
      return true
    } catch {
      return false
    }
  }
}

export default ShopifyIntegration
