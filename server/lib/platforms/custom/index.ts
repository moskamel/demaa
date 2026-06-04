import type {
  PlatformIntegration,
  Platform,
  TokenData,
  UnifiedOrder,
  UnifiedProduct,
  UnifiedCustomer,
  StoreInfo,
  WebhookEvent,
  OrderStatus,
  OrderFilters,
  ProductFilters,
  CustomerFilters,
} from '../types.js'

// ─── Errors ───────────────────────────────────────────────────────────────────

export class NotSupportedError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'NotSupportedError'
  }
}

export class NotImplementedError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'NotImplementedError'
  }
}

export class CustomApiError extends Error {
  constructor(msg: string, public status: number) {
    super(msg)
    this.name = 'CustomApiError'
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse the token string.
 *
 * Expected format: "baseUrl::apiKey"
 * The baseUrl is stored as platform metadata and encoded here so every method
 * has access to both the endpoint root and the credential.
 */
function parseToken(token: string): { baseUrl: string; apiKey: string } {
  const sep = token.indexOf('::')
  if (sep === -1) {
    // Fallback: treat entire string as apiKey, baseUrl unknown
    return { baseUrl: '', apiKey: token }
  }
  return { baseUrl: token.slice(0, sep), apiKey: token.slice(sep + 2) }
}

function buildAuthHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'X-API-Key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...options, signal: AbortSignal.timeout(10000) })
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class CustomIntegration implements PlatformIntegration {
  readonly platform: Platform = 'custom'

  // ── Auth ──────────────────────────────────────────────────────────────────

  getAuthUrl(_storeId: string, _redirectUri: string): string {
    throw new NotSupportedError(
      'Custom integrations use API key authentication — OAuth is not supported.',
    )
  }

  async exchangeCode(_code: string, _redirectUri: string): Promise<TokenData> {
    throw new NotSupportedError(
      'Custom integrations use API key authentication — OAuth code exchange is not supported.',
    )
  }

  async refreshToken(refreshToken: string): Promise<TokenData> {
    // API keys do not expire; return the key as-is
    return { accessToken: refreshToken }
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  async getOrders(_token: string, _filters: OrderFilters): Promise<UnifiedOrder[]> {
    throw new NotImplementedError('getOrders is not implemented for custom integrations.')
  }

  async getOrderById(_token: string, _orderId: string): Promise<UnifiedOrder> {
    throw new NotImplementedError('getOrderById is not implemented for custom integrations.')
  }

  async acceptOrder(_token: string, _orderId: string): Promise<void> {
    throw new NotImplementedError('acceptOrder is not implemented for custom integrations.')
  }

  async rejectOrder(_token: string, _orderId: string, _reason: string): Promise<void> {
    throw new NotImplementedError('rejectOrder is not implemented for custom integrations.')
  }

  async updateOrderStatus(
    _token: string,
    _orderId: string,
    _status: OrderStatus,
  ): Promise<void> {
    throw new NotImplementedError('updateOrderStatus is not implemented for custom integrations.')
  }

  // ── Products ──────────────────────────────────────────────────────────────

  async getProducts(_token: string, _filters: ProductFilters): Promise<UnifiedProduct[]> {
    throw new NotImplementedError('getProducts is not implemented for custom integrations.')
  }

  async getProductById(_token: string, _productId: string): Promise<UnifiedProduct> {
    throw new NotImplementedError('getProductById is not implemented for custom integrations.')
  }

  async updateProduct(
    _token: string,
    _productId: string,
    _data: Partial<UnifiedProduct>,
  ): Promise<UnifiedProduct> {
    throw new NotImplementedError('updateProduct is not implemented for custom integrations.')
  }

  async updateStock(_token: string, _productId: string, _quantity: number): Promise<void> {
    throw new NotImplementedError('updateStock is not implemented for custom integrations.')
  }

  // ── Customers ─────────────────────────────────────────────────────────────

  async getCustomers(_token: string, _filters: CustomerFilters): Promise<UnifiedCustomer[]> {
    throw new NotImplementedError('getCustomers is not implemented for custom integrations.')
  }

  async getCustomerById(_token: string, _customerId: string): Promise<UnifiedCustomer> {
    throw new NotImplementedError('getCustomerById is not implemented for custom integrations.')
  }

  // ── Webhooks ──────────────────────────────────────────────────────────────

  // Custom integrations are polling-based — webhook registration is a no-op.
  async registerWebhooks(
    _token: string,
    _storeId: string,
    _webhookBaseUrl: string,
  ): Promise<void> {
    // no-op: custom integrations use polling, not webhooks
  }

  async deregisterWebhooks(_token: string, _storeId: string): Promise<void> {
    // no-op
  }

  verifyWebhookSignature(_body: string, _signature: string, _secret: string): boolean {
    // Custom integrations do not receive webhooks — always return false
    return false
  }

  parseWebhookEvent(body: unknown, headers: Record<string, string>): WebhookEvent {
    throw new NotSupportedError(
      'Custom integrations are polling-based and do not receive webhook events.',
    )
  }

  // ── Store ─────────────────────────────────────────────────────────────────

  async getStoreInfo(token: string): Promise<StoreInfo> {
    const { baseUrl, apiKey } = parseToken(token)
    if (!baseUrl) {
      throw new CustomApiError(
        'baseUrl is required in the token (format: baseUrl::apiKey)',
        400,
      )
    }

    const res = await apiFetch(`${baseUrl}/info`, {
      headers: buildAuthHeaders(apiKey),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new CustomApiError(
        `Custom getStoreInfo failed (${res.status}): ${body}`,
        res.status,
      )
    }

    const data = (await res.json()) as Record<string, unknown>

    return {
      externalId: String(data.id ?? data.store_id ?? baseUrl),
      name: String(data.name ?? data.store_name ?? ''),
      domain: data.domain ? String(data.domain) : baseUrl,
      currency: String(data.currency ?? 'SAR'),
      timezone: data.timezone ? String(data.timezone) : undefined,
      email: data.email ? String(data.email) : undefined,
      phone: data.phone ? String(data.phone) : undefined,
      platformData: data,
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

export default CustomIntegration
