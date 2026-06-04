// Unified platform types — all integrations transform their data to these types

export type Platform = 'salla' | 'zid' | 'shopify' | 'woocommerce' | 'custom'

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'rejected'
  | 'cancelled'
  | 'returned'

export type PaymentMethod = 'card' | 'cash' | 'cod' | 'tabby' | 'tamara' | 'stcpay' | 'bank_transfer' | 'other'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export interface TokenData {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  scope?: string
}

export interface UnifiedOrder {
  externalId: string
  storeId: string
  platform: Platform
  customerName: string
  customerPhone?: string
  customerEmail?: string
  city: string
  address?: string
  total: number           // in smallest currency unit (halalas/cents)
  subtotal: number
  shippingFee: number
  discount: number
  currency: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  items: UnifiedOrderItem[]
  notes?: string
  externalCreatedAt: Date
  platformData: Record<string, unknown>
}

export interface UnifiedOrderItem {
  externalId?: string
  name: string
  sku?: string
  qty: number
  unitPrice: number
  totalPrice: number
  productExternalId?: string
}

export interface UnifiedProduct {
  externalId: string
  name: string
  description?: string
  sku?: string
  price: number
  costPrice: number
  comparePrice?: number
  stock: number
  category?: string
  imageUrl?: string
  isActive: boolean
  platformData: Record<string, unknown>
}

export interface UnifiedCustomer {
  externalId: string
  name: string
  phone?: string
  email?: string
  city?: string
  totalOrders: number
  totalSpent: number
  platformData: Record<string, unknown>
}

export interface StoreInfo {
  externalId: string
  name: string
  domain?: string
  currency: string
  timezone?: string
  email?: string
  phone?: string
  platformData: Record<string, unknown>
}

export interface WebhookEvent {
  platform: Platform
  topic: string           // normalized: order.created, product.updated, etc.
  externalId: string      // platform's event ID for idempotency
  storeExternalId?: string
  payload: Record<string, unknown>
  rawBody: string
}

export interface OrderFilters {
  status?: string
  limit?: number
  page?: number
  since?: Date
}

export interface ProductFilters {
  category?: string
  limit?: number
  page?: number
  lowStock?: boolean
}

export interface CustomerFilters {
  limit?: number
  page?: number
  search?: string
}

// The contract every platform integration must fulfill
export interface PlatformIntegration {
  readonly platform: Platform

  // OAuth / auth
  getAuthUrl(storeId: string, redirectUri: string): string
  exchangeCode(code: string, redirectUri: string): Promise<TokenData>
  refreshToken(refreshToken: string): Promise<TokenData>

  // Orders
  getOrders(token: string, filters: OrderFilters): Promise<UnifiedOrder[]>
  getOrderById(token: string, orderId: string): Promise<UnifiedOrder>
  acceptOrder(token: string, orderId: string): Promise<void>
  rejectOrder(token: string, orderId: string, reason: string): Promise<void>
  updateOrderStatus(token: string, orderId: string, status: OrderStatus): Promise<void>

  // Products
  getProducts(token: string, filters: ProductFilters): Promise<UnifiedProduct[]>
  getProductById(token: string, productId: string): Promise<UnifiedProduct>
  updateProduct(token: string, productId: string, data: Partial<UnifiedProduct>): Promise<UnifiedProduct>
  updateStock(token: string, productId: string, quantity: number): Promise<void>

  // Customers
  getCustomers(token: string, filters: CustomerFilters): Promise<UnifiedCustomer[]>
  getCustomerById(token: string, customerId: string): Promise<UnifiedCustomer>

  // Webhooks
  registerWebhooks(token: string, storeId: string, webhookBaseUrl: string): Promise<void>
  deregisterWebhooks(token: string, storeId: string): Promise<void>
  verifyWebhookSignature(body: string, signature: string, secret: string): boolean
  parseWebhookEvent(body: unknown, headers: Record<string, string>): WebhookEvent

  // Store
  getStoreInfo(token: string): Promise<StoreInfo>
  testConnection(token: string): Promise<boolean>
}

// Platform metadata shown in UI
export interface PlatformMeta {
  key: Platform
  name: string
  nameEn: string
  logo: string
  color: string
  authType: 'oauth2' | 'apikey'
  docsUrl: string | null
  webhookEvents: string[]
  integration: new () => PlatformIntegration
}
