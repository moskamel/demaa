// Central API client — all calls go through here

const BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('deema_token')
}

export function setToken(token: string) {
  localStorage.setItem('deema_token', token)
}

export function clearToken() {
  localStorage.removeItem('deema_token')
  localStorage.removeItem('deema_user')
  localStorage.removeItem('deema_org')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Request failed')
  return data as T
}

// ── Auth ────────────────────────────────────────────────────

export const auth = {
  async login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  },
  async signup(name: string, email: string, password: string, orgName: string) {
    return request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password, orgName }) })
  },
  async demo() {
    return request<AuthResponse>('/auth/demo', { method: 'POST' })
  },
  async me() {
    return request<MeResponse>('/auth/me')
  },
}

// ── Orders ──────────────────────────────────────────────────

export const orders = {
  async list(params?: OrderFilters) {
    const q = new URLSearchParams(params as Record<string, string>).toString()
    return request<{ orders: Order[]; meta: { count: number; hasMore: boolean } }>(`/orders${q ? '?' + q : ''}`)
  },
  async stats() {
    return request<OrderStats>('/orders/stats')
  },
  async get(id: string) {
    return request<{ order: Order }>(`/orders/${id}`)
  },
  async accept(id: string) {
    return request(`/orders/${id}/accept`, { method: 'POST' })
  },
  async reject(id: string, reason?: string) {
    return request(`/orders/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
  },
  async bulkAccept(orderIds: string[]) {
    return request<{ accepted: number }>('/orders/bulk-accept', { method: 'POST', body: JSON.stringify({ orderIds }) })
  },
}

// ── Products ────────────────────────────────────────────────

export const products = {
  async list(params?: { category?: string; lowStock?: boolean; search?: string }) {
    const q = new URLSearchParams(params as Record<string, string>).toString()
    return request<{ products: Product[] }>(`/products${q ? '?' + q : ''}`)
  },
  async lowStock() {
    return request<{ products: Product[] }>('/products/low-stock')
  },
  async update(id: string, data: Partial<Product>) {
    return request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  },
}

// ── Analytics ───────────────────────────────────────────────

export const analytics = {
  async overview(period = '30d') {
    return request<AnalyticsOverview>(`/analytics/overview?period=${period}`)
  },
  async activity() {
    return request<{ logs: ActivityLog[] }>('/analytics/activity')
  },
}

// ── Conversations / AI ───────────────────────────────────────

export const conversations = {
  async list() {
    return request<{ conversations: Conversation[] }>('/conversations')
  },
  async create(title?: string) {
    return request<{ conversation: Conversation }>('/conversations', { method: 'POST', body: JSON.stringify({ title }) })
  },
  async messages(id: string) {
    return request<{ messages: Message[] }>(`/conversations/${id}/messages`)
  },
  async send(id: string, message: string) {
    return request<{ response: string; toolsUsed: string[]; fallback?: boolean }>(
      `/conversations/${id}/messages`,
      { method: 'POST', body: JSON.stringify({ message }) }
    )
  },
  async delete(id: string) {
    return request(`/conversations/${id}`, { method: 'DELETE' })
  },
}

// ── Notifications ────────────────────────────────────────────

export const notifications = {
  async list(unreadOnly = false) {
    return request<{ notifications: Notification[]; unreadCount: number }>(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`)
  },
  async markRead(id: string) {
    return request(`/notifications/${id}/read`, { method: 'POST' })
  },
  async markAllRead() {
    return request('/notifications/read-all', { method: 'POST' })
  },
}

// ── Customers ────────────────────────────────────────────────

export const customers = {
  async list(params?: { segment?: string; city?: string; search?: string }) {
    const q = new URLSearchParams(params as Record<string, string>).toString()
    return request<{ customers: Customer[] }>(`/customers${q ? '?' + q : ''}`)
  },
  async get(id: string) {
    return request<{ customer: Customer }>(`/customers/${id}`)
  },
}

// ── AI Memory ────────────────────────────────────────────────

export const aiApi = {
  async memory() {
    return request<{ memory: AiMemory[] }>('/ai/memory')
  },
  async usage() {
    return request<{ records: UsageRecord[]; subscription: Subscription | null }>('/ai/usage')
  },
}

// ── Stores ───────────────────────────────────────────────────

export const storesApi = {
  async list() {
    return request<{ stores: StoreData[] }>('/stores')
  },
  async connect(platform: string, apiKey: string, storeDomain?: string) {
    return request<{ store: StoreData }>('/stores/connect', {
      method: 'POST',
      body: JSON.stringify({ platform, apiKey, storeDomain }),
    })
  },
  async sync(id: string) {
    return request<{ syncing: boolean }>(`/stores/${id}/sync`, { method: 'POST' })
  },
}

// ── Types ────────────────────────────────────────────────────

export interface AuthResponse {
  token: string
  user: { id: string; name: string; email: string }
  org: { id: string; name: string }
}

export interface MeResponse {
  user: { id: string; name: string; email: string; phone?: string; avatarUrl?: string }
  org: { id: string; name: string } | null
  role: string
}

export interface Order {
  id: string
  externalRef?: string
  customerName: string
  customerPhone?: string
  city: string
  address?: string
  status: string
  paymentMethod: string
  total: number
  riskScore: number
  riskFactors?: string
  isNewCustomer: boolean
  shipmentId?: string
  rejectionReason?: string
  placedAt: string
  acceptedAt?: string
  items: OrderItem[]
}

export interface OrderItem { id: string; name: string; qty: number; unitPrice: number; totalPrice: number }
export interface OrderFilters { status?: string; city?: string; payment?: string; riskMin?: string; search?: string; limit?: string }
export interface OrderStats { pending: number; accepted: number; shipped: number; delivered: number; rejected: number }

export interface Product {
  id: string; name: string; price: number; stock: number
  lowStockAlert: number; category?: string; imageUrl?: string; sku?: string
}

export interface Customer {
  id: string; name: string; phone?: string; email?: string; city?: string
  segment: string; totalOrders: number; totalSpent: number; lastOrderAt?: string
}

export interface AnalyticsOverview {
  period: string; totalOrders: number; completedOrders: number; pendingOrders: number
  rejectedOrders: number; totalRevenue: number; avgOrderValue: number
  topCities: [string, { orders: number; revenue: number }][]
  paymentBreakdown: Record<string, number>
}

export interface ActivityLog {
  id: string; action: string; entity?: string; entityId?: string; summary: string; createdAt: string
}

export interface Notification {
  id: string; type: string; priority: string; title: string; body?: string; isRead: boolean; createdAt: string
}

export interface Conversation { id: string; title?: string; updatedAt: string }
export interface Message { id: string; role: string; content: string; createdAt: string }
export interface AiMemory { id: string; key: string; value: string; confidence: number; label?: string }
export interface UsageRecord { id: string; month: string; ordersProcessed: number; messagesUsed: number }
export interface Subscription { planId: string; ordersLimit: number; ordersUsed: number; status: string }
export interface StoreData { id: string; name: string; platform: string; isActive: boolean; syncStatus: string; lastSyncAt?: string; _count: { orders: number; products: number } }
