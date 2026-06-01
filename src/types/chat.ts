export interface ActionButton {
  label: string
  variant: 'primary' | 'secondary' | 'translucent'
  cmd?: string
}

export interface OrderRow {
  id: string
  customer: string
  city: string
  total: number
  payment: string
  status: string
  shipmentId?: string
  issue?: string
  riskScore?: number
  suspiciousReason?: string
}

export interface ProductRow {
  id: string
  name: string
  price: number
  stock: number
  category: string
}

export interface Message {
  id?: number
  role: 'user' | 'deema'
  content: string
  type?: 'summary' | 'text'
  stats?: { n: string; l: string; c: string }[]
  actions?: ActionButton[]
  orderList?: OrderRow[]
  productList?: ProductRow[]
}
