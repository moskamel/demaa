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
} from '../types'

// ─── Error ───────────────────────────────────────────────────────────────────

export class SallaApiError extends Error {
  constructor(msg: string, public status: number) {
    super(msg)
    this.name = 'SallaApiError'
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = 'https://api.salla.dev/admin/v2'
const OAUTH_BASE = 'https://accounts.salla.sa/oauth2'
const WEBHOOK_EVENTS = [
  'order.created',
  'order.updated',
  'product.updated',
  'product.quantity.low',
  'customer.created',
]

// ─── Status/method maps ───────────────────────────────────────────────────────

const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  under_review: 'pending',
  in_progress: 'accepted',
  delivering: 'shipped',
  delivered: 'delivered',
  canceled: 'cancelled',
  refunded: 'returned',
}

const PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = {
  cod: 'cod',
  credit_card: 'card',
  stcpay: 'stcpay',
  tabby: 'tabby',
  tamara: 'tamara',
}

const UNIFIED_TO_SALLA_STATUS: Record<string, string> = {
  delivered: 'completed',
  cancelled: 'canceled',
}

// ─── Salla raw types ──────────────────────────────────────────────────────────

interface SallaMoneyField {
  amount: number
  currency: string
}

interface SallaAddress {
  city?: string
  street?: string
  block?: string
  country?: string
}

interface SallaCustomer {
  id?: string | number
  name?: string
  mobile?: string
  email?: string
  city?: string
  orders_count?: number
  total_spent?: SallaMoneyField
}

interface SallaProduct {
  id: string | number
  name: string
  description?: string
  sku?: string
  price?: SallaMoneyField
  sale_price?: SallaMoneyField
  cost_price?: SallaMoneyField
  quantity?: number
  category?: { name?: string }
  thumbnail?: { url?: string }
  status?: string
  [key: string]: unknown
}

interface SallaOrderItem {
  id?: string | number
  name: string
  sku?: string
  quantity: number
  price?: SallaMoneyField
  total?: SallaMoneyField
  product?: { id?: string | number }
}

interface SallaOrder {
  id: string | number
  reference_id?: string
  status?: { name?: string; slug?: string }
  customer?: SallaCustomer
  shipping?: { address?: SallaAddress }
  amounts?: {
    total?: SallaMoneyField
    subtotal?: SallaMoneyField
    shipping?: SallaMoneyField
    discount?: SallaMoneyField
  }
  currency?: string
  payment_method?: string
  payment_status?: string
  items?: SallaOrderItem[]
  notes?: string
  created_at?: string
  [key: string]: unknown
}

interface SallaStore {
  id?: string | number
  name?: string
  domain?: string
  currency?: string
  timezone?: string
  email?: string
  phone?: string
  [key: string]: unknown
}

interface SallaTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  scope?: string
}

interface SallaListResponse<T> {
  data: T[]
  pagination?: { currentPage?: number; total?: number }
}

interface SallaItemResponse<T> {
  data: T
}

interface SallaWebhookSubscription {
  id?: string | number
  event?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toHalalas(sar: number): number {
  return Math.round(sar * 100)
}

function mapOrderStatus(slug: string | undefined): OrderStatus {
  if (!slug) return 'pending'
  return ORDER_STATUS_MAP[slug] ?? 'pending'
}

function mapPaymentMethod(method: string | undefined): PaymentMethod {
  if (!method) return 'other'
  return PAYMENT_METHOD_MAP[method] ?? 'other'
}

function mapPaymentStatus(status: string | undefined): PaymentStatus {
  if (!status) return 'pending'
  if (status === 'paid') return 'paid'
  if (status === 'refunded') return 'refunded'
  if (status === 'failed') return 'failed'
  return 'pending'
}

function buildAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

async function assertOk(res: Response, context: string): Promise<void> {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new SallaApiError(`Salla ${context} failed (${res.status}): ${body}`, res.status)
  }
}

function transformOrder(raw: SallaOrder, storeId: string): UnifiedOrder {
  const currency = raw.currency ?? raw.amounts?.total?.currency ?? 'SAR'
  const total = toHalalas(raw.amounts?.total?.amount ?? 0)
  const subtotal = toHalalas(raw.amounts?.subtotal?.amount ?? 0)
  const shippingFee = toHalalas(raw.amounts?.shipping?.amount ?? 0)
  const discount = toHalalas(raw.amounts?.discount?.amount ?? 0)

  const address = raw.shipping?.address
  const city = address?.city ?? raw.customer?.city ?? ''
  const addressStr = [address?.block, address?.street].filter(Boolean).join(', ') || undefined

  const items: UnifiedOrderItem[] = (raw.items ?? []).map((item) => ({
    externalId: item.id != null ? String(item.id) : undefined,
    name: item.name,
    sku: item.sku,
    qty: item.quantity,
    unitPrice: toHalalas(item.price?.amount ?? 0),
    totalPrice: toHalalas(item.total?.amount ?? 0),
    productExternalId: item.product?.id != null ? String(item.product.id) : undefined,
  }))

  return {
    externalId: String(raw.id),
    storeId,
    platform: 'salla',
    customerName: raw.customer?.name ?? '',
    customerPhone: raw.customer?.mobile,
    customerEmail: raw.customer?.email,
    city,
    address: addressStr,
    total,
    subtotal,
    shippingFee,
    discount,
    currency,
    status: mapOrderStatus(raw.status?.slug),
    paymentMethod: mapPaymentMethod(raw.payment_method),
    paymentStatus: mapPaymentStatus(raw.payment_status),
    items,
    notes: raw.notes,
    externalCreatedAt: raw.created_at ? new Date(raw.created_at) : new Date(),
    platformData: raw as Record<string, unknown>,
  }
}

function transformProduct(raw: SallaProduct): UnifiedProduct {
  return {
    externalId: String(raw.id),
    name: raw.name,
    description: raw.description,
    sku: raw.sku,
    price: toHalalas(raw.price?.amount ?? 0),
    costPrice: toHalalas(raw.cost_price?.amount ?? 0),
    comparePrice: raw.sale_price ? toHalalas(raw.sale_price.amount) : undefined,
    stock: raw.quantity ?? 0,
    category: raw.category?.name,
    imageUrl: raw.thumbnail?.url,
    isActive: raw.status === 'sale' || raw.status === 'active',
    platformData: raw as Record<string, unknown>,
  }
}

function transformCustomer(raw: SallaCustomer): UnifiedCustomer {
  return {
    externalId: String(raw.id ?? ''),
    name: raw.name ?? '',
    phone: raw.mobile,
    email: raw.email,
    city: raw.city,
    totalOrders: raw.orders_count ?? 0,
    totalSpent: toHalalas(raw.total_spent?.amount ?? 0),
    platformData: raw as Record<string, unknown>,
  }
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class SallaIntegration implements PlatformIntegration {
  readonly platform: Platform = 'salla'

  private get clientId(): string {
    const id = process.env.SALLA_CLIENT_ID
    if (!id) throw new Error('SALLA_CLIENT_ID env var is not set')
    return id
  }

  private get clientSecret(): string {
    const secret = process.env.SALLA_CLIENT_SECRET
    if (!secret) throw new Error('SALLA_CLIENT_SECRET env var is not set')
    return secret
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  getAuthUrl(storeId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'offline_access',
      state: storeId,
    })
    return `${OAUTH_BASE}/auth?${params.toString()}`
  }

  async exchangeCode(code: string, redirectUri: string): Promise<TokenData> {
    const res = await fetch(`${OAUTH_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'exchangeCode')
    const data = (await res.json()) as SallaTokenResponse
    return this.parseTokenResponse(data)
  }

  async refreshToken(refreshToken: string): Promise<TokenData> {
    const res = await fetch(`${OAUTH_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'refreshToken')
    const data = (await res.json()) as SallaTokenResponse
    return this.parseTokenResponse(data)
  }

  private parseTokenResponse(data: SallaTokenResponse): TokenData {
    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
      scope: data.scope,
    }
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  async getOrders(token: string, filters: OrderFilters): Promise<UnifiedOrder[]> {
    const params = new URLSearchParams()
    if (filters.limit) params.set('per_page', String(filters.limit))
    if (filters.page) params.set('page', String(filters.page))
    if (filters.status) params.set('status', filters.status)
    if (filters.since) params.set('from_date', filters.since.toISOString().split('T')[0])

    const url = `${BASE}/orders?${params.toString()}`
    const res = await fetch(url, {
      headers: buildAuthHeaders(token),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getOrders')
    const body = (await res.json()) as SallaListResponse<SallaOrder>
    return (body.data ?? []).map((o) => transformOrder(o, ''))
  }

  async getOrderById(token: string, orderId: string): Promise<UnifiedOrder> {
    const res = await fetch(`${BASE}/orders/${orderId}`, {
      headers: buildAuthHeaders(token),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getOrderById')
    const body = (await res.json()) as SallaItemResponse<SallaOrder>
    return transformOrder(body.data, '')
  }

  async acceptOrder(token: string, orderId: string): Promise<void> {
    const res = await fetch(`${BASE}/orders/${orderId}`, {
      method: 'PUT',
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ status: 'in_progress' }),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'acceptOrder')
  }

  async rejectOrder(token: string, orderId: string, reason: string): Promise<void> {
    const res = await fetch(`${BASE}/orders/${orderId}`, {
      method: 'PUT',
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ status: 'canceled', cancel_reason: reason }),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'rejectOrder')
  }

  async updateOrderStatus(token: string, orderId: string, status: OrderStatus): Promise<void> {
    const sallaStatus = UNIFIED_TO_SALLA_STATUS[status]
    if (!sallaStatus) {
      throw new SallaApiError(
        `Cannot map unified status "${status}" to a Salla order status`,
        400,
      )
    }
    const res = await fetch(`${BASE}/orders/${orderId}`, {
      method: 'PUT',
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ status: sallaStatus }),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'updateOrderStatus')
  }

  // ── Products ──────────────────────────────────────────────────────────────

  async getProducts(token: string, filters: ProductFilters): Promise<UnifiedProduct[]> {
    const params = new URLSearchParams()
    if (filters.limit) params.set('per_page', String(filters.limit))
    if (filters.page) params.set('page', String(filters.page))
    if (filters.category) params.set('category_id', filters.category)
    if (filters.lowStock) params.set('low_stock', '1')

    const url = `${BASE}/products?${params.toString()}`
    const res = await fetch(url, {
      headers: buildAuthHeaders(token),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getProducts')
    const body = (await res.json()) as SallaListResponse<SallaProduct>
    return (body.data ?? []).map(transformProduct)
  }

  async getProductById(token: string, productId: string): Promise<UnifiedProduct> {
    const res = await fetch(`${BASE}/products/${productId}`, {
      headers: buildAuthHeaders(token),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getProductById')
    const body = (await res.json()) as SallaItemResponse<SallaProduct>
    return transformProduct(body.data)
  }

  async updateProduct(
    token: string,
    productId: string,
    data: Partial<UnifiedProduct>,
  ): Promise<UnifiedProduct> {
    const sallaPayload: Record<string, unknown> = {}
    if (data.name !== undefined) sallaPayload.name = data.name
    if (data.description !== undefined) sallaPayload.description = data.description
    if (data.sku !== undefined) sallaPayload.sku = data.sku
    if (data.price !== undefined) sallaPayload.price = data.price / 100
    if (data.costPrice !== undefined) sallaPayload.cost_price = data.costPrice / 100
    if (data.comparePrice !== undefined) sallaPayload.sale_price = data.comparePrice / 100
    if (data.isActive !== undefined) sallaPayload.status = data.isActive ? 'sale' : 'hidden'

    const res = await fetch(`${BASE}/products/${productId}`, {
      method: 'PUT',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(sallaPayload),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'updateProduct')
    const body = (await res.json()) as SallaItemResponse<SallaProduct>
    return transformProduct(body.data)
  }

  async updateStock(token: string, productId: string, quantity: number): Promise<void> {
    const res = await fetch(`${BASE}/products/${productId}/quantities`, {
      method: 'PUT',
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ quantity }),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'updateStock')
  }

  // ── Customers ─────────────────────────────────────────────────────────────

  async getCustomers(token: string, filters: CustomerFilters): Promise<UnifiedCustomer[]> {
    const params = new URLSearchParams()
    if (filters.limit) params.set('per_page', String(filters.limit))
    if (filters.page) params.set('page', String(filters.page))
    if (filters.search) params.set('q', filters.search)

    const url = `${BASE}/customers?${params.toString()}`
    const res = await fetch(url, {
      headers: buildAuthHeaders(token),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getCustomers')
    const body = (await res.json()) as SallaListResponse<SallaCustomer>
    return (body.data ?? []).map(transformCustomer)
  }

  async getCustomerById(token: string, customerId: string): Promise<UnifiedCustomer> {
    const res = await fetch(`${BASE}/customers/${customerId}`, {
      headers: buildAuthHeaders(token),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getCustomerById')
    const body = (await res.json()) as SallaItemResponse<SallaCustomer>
    return transformCustomer(body.data)
  }

  // ── Webhooks ──────────────────────────────────────────────────────────────

  async registerWebhooks(token: string, storeId: string, webhookBaseUrl: string): Promise<void> {
    const url = `${BASE}/webhooks/subscribe`
    const callbackUrl = `${webhookBaseUrl}/webhooks/salla`

    await Promise.all(
      WEBHOOK_EVENTS.map(async (event) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: buildAuthHeaders(token),
          body: JSON.stringify({ event, url: callbackUrl }),
          signal: AbortSignal.timeout(10000),
        })
        // 409 Conflict means already subscribed — treat as success
        if (!res.ok && res.status !== 409) {
          const body = await res.text().catch(() => '')
          throw new SallaApiError(
            `Salla registerWebhooks (${event}) failed (${res.status}): ${body}`,
            res.status,
          )
        }
      }),
    )
  }

  async deregisterWebhooks(token: string, storeId: string): Promise<void> {
    // List all registered webhooks for this store then delete each
    const res = await fetch(`${BASE}/webhooks`, {
      headers: buildAuthHeaders(token),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      // If we can't list, there's nothing to deregister
      return
    }
    const body = (await res.json()) as SallaListResponse<SallaWebhookSubscription>
    const subscriptions = body.data ?? []

    await Promise.all(
      subscriptions
        .filter((s) => s.id != null)
        .map(async (s) => {
          const delRes = await fetch(`${BASE}/webhooks/${s.id}`, {
            method: 'DELETE',
            headers: buildAuthHeaders(token),
            signal: AbortSignal.timeout(10000),
          })
          // Ignore 404 — already gone
          if (!delRes.ok && delRes.status !== 404) {
            const errBody = await delRes.text().catch(() => '')
            throw new SallaApiError(
              `Salla deregisterWebhooks (id=${s.id}) failed (${delRes.status}): ${errBody}`,
              delRes.status,
            )
          }
        }),
    )
  }

  verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    // Salla sends: x-salla-signature: sha256=<hex>
    const prefix = 'sha256='
    const provided = signature.startsWith(prefix) ? signature.slice(prefix.length) : signature
    const expected = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('hex')
    return crypto.timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'))
  }

  parseWebhookEvent(body: unknown, headers: Record<string, string>): WebhookEvent {
    const payload = body as Record<string, unknown>
    const event = (payload.event as string | undefined) ?? ''
    const data = (payload.data ?? {}) as Record<string, unknown>
    const merchantId = (payload.merchant as string | number | undefined)?.toString()

    // Derive a stable external ID for idempotency:
    // use event-level id if present, else the nested data id
    const externalId =
      (payload.id as string | number | undefined)?.toString() ??
      (data.id as string | number | undefined)?.toString() ??
      `${event}-${Date.now()}`

    return {
      platform: 'salla',
      topic: event,
      externalId,
      storeExternalId: merchantId,
      payload: data,
      rawBody: typeof body === 'string' ? body : JSON.stringify(body),
    }
  }

  // ── Store ─────────────────────────────────────────────────────────────────

  async getStoreInfo(token: string): Promise<StoreInfo> {
    const res = await fetch(`${BASE}/store`, {
      headers: buildAuthHeaders(token),
      signal: AbortSignal.timeout(10000),
    })
    await assertOk(res, 'getStoreInfo')
    const body = (await res.json()) as SallaItemResponse<SallaStore>
    const store = body.data
    return {
      externalId: String(store.id ?? ''),
      name: store.name ?? '',
      domain: store.domain,
      currency: store.currency ?? 'SAR',
      timezone: store.timezone,
      email: store.email,
      phone: store.phone,
      platformData: store as Record<string, unknown>,
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

export default SallaIntegration
