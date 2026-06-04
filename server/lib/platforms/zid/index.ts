import { createHmac } from 'crypto'
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
  OrderFilters,
  ProductFilters,
  CustomerFilters,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../types.js'

const BASE = 'https://api.zid.sa/v1'
const OAUTH_AUTHORIZE = 'https://oauth.zid.sa/oauth/authorize'
const TOKEN_ENDPOINT = 'https://oauth.zid.sa/oauth/token'

function mapOrderStatus(zidStatus: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    new: 'pending',
    confirmed: 'accepted',
    shipped: 'shipped',
    completed: 'delivered',
    cancelled: 'cancelled',
    returned: 'returned',
  }
  return map[zidStatus] ?? 'pending'
}

function mapPaymentMethod(method: string | undefined): PaymentMethod {
  if (!method) return 'other'
  const m = method.toLowerCase()
  if (m.includes('card') || m.includes('credit') || m.includes('debit')) return 'card'
  if (m.includes('cash')) return 'cash'
  if (m.includes('cod')) return 'cod'
  if (m.includes('tabby')) return 'tabby'
  if (m.includes('tamara')) return 'tamara'
  if (m.includes('stc')) return 'stcpay'
  if (m.includes('bank') || m.includes('transfer')) return 'bank_transfer'
  return 'other'
}

function mapPaymentStatus(order: Record<string, unknown>): PaymentStatus {
  const status = (order.payment_status as string | undefined)?.toLowerCase()
  if (!status) return 'pending'
  if (status === 'paid' || status === 'captured') return 'paid'
  if (status === 'refunded') return 'refunded'
  if (status === 'failed') return 'failed'
  return 'pending'
}

// Tokens stored as storeId::accessToken::refreshToken
function parseToken(token: string): { storeId: string; accessToken: string; refreshToken?: string } {
  const parts = token.split('::')
  return {
    storeId: parts[0] ?? '',
    accessToken: parts[1] ?? token,
    refreshToken: parts[2],
  }
}

function authHeaders(accessToken: string, storeId: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    'store-id': storeId,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...options, signal: AbortSignal.timeout(10000) })
}

function toHalalas(amount: number | string | undefined): number {
  const n = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0)
  return Math.round(n * 100)
}

function mapOrderItem(item: Record<string, unknown>): UnifiedOrderItem {
  return {
    externalId: String(item.id ?? ''),
    name: String(item.name ?? item.product_name ?? ''),
    sku: item.sku ? String(item.sku) : undefined,
    qty: Number(item.quantity ?? item.qty ?? 1),
    unitPrice: toHalalas(item.price as number | string | undefined),
    totalPrice: toHalalas(item.total as number | string | undefined ?? (Number(item.price ?? 0) * Number(item.quantity ?? 1))),
    productExternalId: item.product_id ? String(item.product_id) : undefined,
  }
}

function mapOrder(raw: Record<string, unknown>, storeId: string): UnifiedOrder {
  const items = ((raw.products ?? raw.items ?? []) as Record<string, unknown>[]).map(mapOrderItem)
  const address = raw.shipping_address as Record<string, unknown> | undefined
  const customer = raw.customer as Record<string, unknown> | undefined

  return {
    externalId: String(raw.id ?? raw.code ?? ''),
    storeId,
    platform: 'zid',
    customerName: String(raw.customer_name ?? customer?.name ?? ''),
    customerPhone: raw.customer_mobile
      ? String(raw.customer_mobile)
      : customer?.mobile
        ? String(customer.mobile)
        : undefined,
    customerEmail: raw.customer_email
      ? String(raw.customer_email)
      : customer?.email
        ? String(customer.email)
        : undefined,
    city: String(address?.city ?? raw.city_name ?? raw.city ?? ''),
    address: address
      ? [address.street, address.district, address.city].filter(Boolean).join(', ')
      : undefined,
    total: toHalalas(raw.amount as number | string | undefined ?? raw.total_amount as number | string | undefined),
    subtotal: toHalalas(raw.subtotal as number | string | undefined ?? raw.products_amount as number | string | undefined),
    shippingFee: toHalalas(raw.shipping_amount as number | string | undefined ?? raw.shipping_cost as number | string | undefined),
    discount: toHalalas(raw.discount_amount as number | string | undefined ?? raw.coupon_amount as number | string | undefined),
    currency: String(raw.currency ?? 'SAR'),
    status: mapOrderStatus(String(raw.status ?? 'new')),
    paymentMethod: mapPaymentMethod(raw.payment_method as string | undefined),
    paymentStatus: mapPaymentStatus(raw),
    items,
    notes: raw.notes ? String(raw.notes) : undefined,
    externalCreatedAt: new Date(String(raw.created_at ?? raw.date ?? Date.now())),
    platformData: raw,
  }
}

export class ZidIntegration implements PlatformIntegration {
  readonly platform: Platform = 'zid'

  getAuthUrl(storeId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: process.env.ZID_CLIENT_ID ?? '',
      redirect_uri: redirectUri,
      response_type: 'code',
      state: storeId,
    })
    return `${OAUTH_AUTHORIZE}?${params.toString()}`
  }

  async exchangeCode(code: string, redirectUri: string): Promise<TokenData> {
    const res = await apiFetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.ZID_CLIENT_ID,
        client_secret: process.env.ZID_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })
    if (!res.ok) throw new Error(`Zid exchangeCode failed (${res.status}): ${await res.text()}`)
    const data = await res.json() as Record<string, unknown>
    return {
      accessToken: String(data.access_token ?? ''),
      refreshToken: data.refresh_token ? String(data.refresh_token) : undefined,
      expiresAt: data.expires_in
        ? new Date(Date.now() + Number(data.expires_in) * 1000)
        : undefined,
      scope: data.scope ? String(data.scope) : undefined,
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenData> {
    const res = await apiFetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.ZID_CLIENT_ID,
        client_secret: process.env.ZID_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })
    if (!res.ok) throw new Error(`Zid refreshToken failed (${res.status}): ${await res.text()}`)
    const data = await res.json() as Record<string, unknown>
    return {
      accessToken: String(data.access_token ?? ''),
      refreshToken: data.refresh_token ? String(data.refresh_token) : undefined,
      expiresAt: data.expires_in
        ? new Date(Date.now() + Number(data.expires_in) * 1000)
        : undefined,
      scope: data.scope ? String(data.scope) : undefined,
    }
  }

  async getOrders(token: string, filters: OrderFilters): Promise<UnifiedOrder[]> {
    const { storeId, accessToken } = parseToken(token)
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('per_page', String(filters.limit))
    if (filters.status) params.set('status', filters.status)
    if (filters.since) params.set('from_date', filters.since.toISOString().split('T')[0])

    const res = await apiFetch(`${BASE}/managers/orders?${params.toString()}`, {
      headers: authHeaders(accessToken, storeId),
    })
    if (!res.ok) throw new Error(`Zid getOrders failed (${res.status}): ${await res.text()}`)
    const data = await res.json() as Record<string, unknown>
    const orders = (data.orders ?? data.data ?? []) as Record<string, unknown>[]
    return orders.map(o => mapOrder(o, storeId))
  }

  async getOrderById(token: string, orderId: string): Promise<UnifiedOrder> {
    const { storeId, accessToken } = parseToken(token)
    const res = await apiFetch(`${BASE}/managers/orders/${orderId}`, {
      headers: authHeaders(accessToken, storeId),
    })
    if (!res.ok) throw new Error(`Zid getOrderById failed (${res.status}): ${await res.text()}`)
    const data = await res.json() as Record<string, unknown>
    const order = (data.order ?? data) as Record<string, unknown>
    return mapOrder(order, storeId)
  }

  async acceptOrder(token: string, orderId: string): Promise<void> {
    await this.updateOrderStatus(token, orderId, 'accepted')
  }

  async rejectOrder(token: string, orderId: string, reason: string): Promise<void> {
    const { storeId, accessToken } = parseToken(token)
    const res = await apiFetch(`${BASE}/managers/orders/${orderId}/update-status`, {
      method: 'PUT',
      headers: authHeaders(accessToken, storeId),
      body: JSON.stringify({ status: 'cancelled', reason }),
    })
    if (!res.ok) throw new Error(`Zid rejectOrder failed (${res.status}): ${await res.text()}`)
  }

  async updateOrderStatus(token: string, orderId: string, status: OrderStatus): Promise<void> {
    const reverseMap: Record<OrderStatus, string> = {
      pending: 'new',
      accepted: 'confirmed',
      processing: 'confirmed',
      shipped: 'shipped',
      delivered: 'completed',
      rejected: 'cancelled',
      cancelled: 'cancelled',
      returned: 'returned',
    }
    const { storeId, accessToken } = parseToken(token)
    const zidStatus = reverseMap[status] ?? 'new'
    const res = await apiFetch(`${BASE}/managers/orders/${orderId}/update-status`, {
      method: 'PUT',
      headers: authHeaders(accessToken, storeId),
      body: JSON.stringify({ status: zidStatus }),
    })
    if (!res.ok) throw new Error(`Zid updateOrderStatus failed (${res.status}): ${await res.text()}`)
  }

  async getProducts(token: string, filters: ProductFilters): Promise<UnifiedProduct[]> {
    const { storeId, accessToken } = parseToken(token)
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('per_page', String(filters.limit))
    if (filters.category) params.set('category_id', filters.category)

    const res = await apiFetch(`${BASE}/managers/products?${params.toString()}`, {
      headers: authHeaders(accessToken, storeId),
    })
    if (!res.ok) throw new Error(`Zid getProducts failed (${res.status}): ${await res.text()}`)
    const data = await res.json() as Record<string, unknown>
    const products = (data.products ?? data.data ?? []) as Record<string, unknown>[]
    return products.map(p => this.mapProduct(p))
  }

  async getProductById(token: string, productId: string): Promise<UnifiedProduct> {
    const { storeId, accessToken } = parseToken(token)
    const res = await apiFetch(`${BASE}/managers/products/${productId}`, {
      headers: authHeaders(accessToken, storeId),
    })
    if (!res.ok) throw new Error(`Zid getProductById failed (${res.status}): ${await res.text()}`)
    const data = await res.json() as Record<string, unknown>
    const product = (data.product ?? data) as Record<string, unknown>
    return this.mapProduct(product)
  }

  private mapProduct(p: Record<string, unknown>): UnifiedProduct {
    return {
      externalId: String(p.id ?? ''),
      name: String(p.name ?? ''),
      description: p.description ? String(p.description) : undefined,
      sku: p.sku ? String(p.sku) : undefined,
      price: toHalalas(p.price as number | string | undefined),
      costPrice: toHalalas(p.cost_price as number | string | undefined),
      comparePrice: p.compare_price ? toHalalas(p.compare_price as number | string | undefined) : undefined,
      stock: Number(p.quantity ?? p.stock ?? 0),
      category: p.category_name ? String(p.category_name) : undefined,
      imageUrl: p.image ? String(p.image) : undefined,
      isActive: Boolean(p.active ?? p.is_active ?? true),
      platformData: p,
    }
  }

  async updateProduct(token: string, productId: string, data: Partial<UnifiedProduct>): Promise<UnifiedProduct> {
    const { storeId, accessToken } = parseToken(token)
    const payload: Record<string, unknown> = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.description !== undefined) payload.description = data.description
    if (data.price !== undefined) payload.price = data.price / 100
    if (data.stock !== undefined) payload.quantity = data.stock
    if (data.isActive !== undefined) payload.active = data.isActive

    const res = await apiFetch(`${BASE}/managers/products/${productId}`, {
      method: 'PUT',
      headers: authHeaders(accessToken, storeId),
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Zid updateProduct failed (${res.status}): ${await res.text()}`)
    const result = await res.json() as Record<string, unknown>
    return this.mapProduct((result.product ?? result) as Record<string, unknown>)
  }

  async updateStock(token: string, productId: string, quantity: number): Promise<void> {
    const { storeId, accessToken } = parseToken(token)
    const res = await apiFetch(`${BASE}/managers/products/${productId}`, {
      method: 'PUT',
      headers: authHeaders(accessToken, storeId),
      body: JSON.stringify({ quantity }),
    })
    if (!res.ok) throw new Error(`Zid updateStock failed (${res.status}): ${await res.text()}`)
  }

  async getCustomers(token: string, filters: CustomerFilters): Promise<UnifiedCustomer[]> {
    const { storeId, accessToken } = parseToken(token)
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('per_page', String(filters.limit))
    if (filters.search) params.set('search', filters.search)

    const res = await apiFetch(`${BASE}/managers/customers?${params.toString()}`, {
      headers: authHeaders(accessToken, storeId),
    })
    if (!res.ok) throw new Error(`Zid getCustomers failed (${res.status}): ${await res.text()}`)
    const data = await res.json() as Record<string, unknown>
    const customers = (data.customers ?? data.data ?? []) as Record<string, unknown>[]
    return customers.map(c => this.mapCustomer(c))
  }

  async getCustomerById(token: string, customerId: string): Promise<UnifiedCustomer> {
    const { storeId, accessToken } = parseToken(token)
    const res = await apiFetch(`${BASE}/managers/customers/${customerId}`, {
      headers: authHeaders(accessToken, storeId),
    })
    if (!res.ok) throw new Error(`Zid getCustomerById failed (${res.status}): ${await res.text()}`)
    const data = await res.json() as Record<string, unknown>
    return this.mapCustomer((data.customer ?? data) as Record<string, unknown>)
  }

  private mapCustomer(c: Record<string, unknown>): UnifiedCustomer {
    return {
      externalId: String(c.id ?? ''),
      name: String(c.name ?? ''),
      phone: c.mobile ? String(c.mobile) : c.phone ? String(c.phone) : undefined,
      email: c.email ? String(c.email) : undefined,
      city: c.city ? String(c.city) : undefined,
      totalOrders: Number(c.orders_count ?? c.total_orders ?? 0),
      totalSpent: toHalalas(c.total_spent as number | string | undefined),
      platformData: c,
    }
  }

  async registerWebhooks(token: string, storeId: string, webhookBaseUrl: string): Promise<void> {
    // Zid webhooks are configured in the partner dashboard per app, not via API
    // No programmatic registration endpoint available
  }

  async deregisterWebhooks(token: string, storeId: string): Promise<void> {
    // Zid webhooks are managed in the partner dashboard
  }

  verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    const expected = createHmac('sha256', secret).update(body).digest('hex')
    return expected === signature
  }

  parseWebhookEvent(body: unknown, headers: Record<string, string>): WebhookEvent {
    const raw = body as Record<string, unknown>
    const signature = headers['x-zid-signature'] ?? ''
    const eventType = String(raw.event ?? raw.type ?? 'unknown')

    let topic = eventType
    if (eventType.includes('order')) topic = 'order.' + (eventType.split('.')[1] ?? 'updated')
    else if (eventType.includes('product')) topic = 'product.' + (eventType.split('.')[1] ?? 'updated')

    return {
      platform: 'zid',
      topic,
      externalId: String(raw.id ?? raw.event_id ?? signature),
      storeExternalId: raw.store_id ? String(raw.store_id) : undefined,
      payload: raw,
      rawBody: JSON.stringify(body),
    }
  }

  async getStoreInfo(token: string): Promise<StoreInfo> {
    const { storeId, accessToken } = parseToken(token)
    const res = await apiFetch(`${BASE}/managers/store/profile`, {
      headers: authHeaders(accessToken, storeId),
    })
    if (!res.ok) throw new Error(`Zid getStoreInfo failed (${res.status}): ${await res.text()}`)
    const data = await res.json() as Record<string, unknown>
    const store = (data.store ?? data) as Record<string, unknown>
    return {
      externalId: String(store.id ?? storeId),
      name: String(store.name ?? ''),
      domain: store.domain ? String(store.domain) : undefined,
      currency: String(store.currency ?? 'SAR'),
      timezone: store.timezone ? String(store.timezone) : undefined,
      email: store.email ? String(store.email) : undefined,
      phone: store.phone ? String(store.phone) : undefined,
      platformData: store,
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
