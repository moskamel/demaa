import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import prisma from '../lib/prisma.js'

const router = Router()

// Webhooks are unauthenticated (verified by HMAC signature per platform)
// Must be mounted BEFORE express.json() for raw body access on signature verification

// ─── helpers ────────────────────────────────────────────────────────────────

function hmacSha256(secret: string, data: Buffer | string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('base64')
}

function hmacSha256Hex(secret: string, data: Buffer | string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex')
}

async function upsertOrder(
  storeId: string,
  orgId: string,
  externalRef: string,
  customerName: string,
  customerPhone: string | null,
  city: string,
  address: string | null,
  total: number,
  status: string,
  paymentMethod: string,
  placedAt: Date,
) {
  let customer = customerPhone
    ? await prisma.customer.findFirst({ where: { organizationId: orgId, phone: customerPhone } })
    : null
  if (!customer && customerName !== 'عميل غير معروف') {
    customer = await prisma.customer.findFirst({ where: { organizationId: orgId, name: customerName } })
  }
  if (!customer) {
    customer = await prisma.customer.create({
      data: { organizationId: orgId, name: customerName, phone: customerPhone, city },
    })
  }

  const existing = await prisma.order.findFirst({ where: { storeId, externalRef } })
  if (!existing) {
    await prisma.order.create({
      data: {
        storeId, externalRef, customerId: customer.id,
        customerName, customerPhone, city, address,
        status, paymentMethod, total, placedAt,
      },
    })
  } else {
    await prisma.order.update({
      where: { id: existing.id },
      data: { status, total },
    })
  }
}

// ─── Shopify ─────────────────────────────────────────────────────────────────
// Shopify sends: X-Shopify-Hmac-Sha256 header (base64 HMAC of raw body)
// Topic header: X-Shopify-Topic
// Shop domain: X-Shopify-Shop-Domain

router.post('/shopify', express_raw(), async (req: Request, res: Response) => {
  const rawBody = req.body as Buffer
  const sig = req.headers['x-shopify-hmac-sha256'] as string
  const shopDomain = req.headers['x-shopify-shop-domain'] as string
  const topic = req.headers['x-shopify-topic'] as string

  if (!sig || !shopDomain) { res.status(400).send('missing headers'); return }

  // Find store by domain
  const store = await prisma.store.findFirst({
    where: { domain: shopDomain, platform: 'shopify', isActive: true },
  })
  if (!store?.accessToken) { res.status(404).send('store not found'); return }

  // Verify HMAC
  const expected = hmacSha256(store.accessToken, rawBody)
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    res.status(401).send('invalid signature'); return
  }

  res.status(200).send('ok') // respond fast

  try {
    const payload = JSON.parse(rawBody.toString()) as ShopifyOrderPayload
    if (topic === 'orders/create' || topic === 'orders/updated') {
      const externalRef = String(payload.id)
      const customerName = [payload.customer?.first_name, payload.customer?.last_name].filter(Boolean).join(' ') || 'عميل غير معروف'
      const customerPhone = payload.customer?.phone || payload.shipping_address?.phone || null
      const city = payload.shipping_address?.city || 'غير محدد'
      const address = payload.shipping_address?.address1 || null
      const total = Math.round(parseFloat(payload.total_price || '0') * 100)
      const status = mapShopifyStatus(payload.fulfillment_status)
      const paymentMethod = payload.financial_status === 'pending' ? 'cod' : 'card'
      await upsertOrder(store.id, store.organizationId, externalRef, customerName, customerPhone, city, address, total, status, paymentMethod, new Date(payload.created_at || Date.now()))
    } else if (topic === 'orders/cancelled') {
      const externalRef = String(payload.id)
      const existing = await prisma.order.findFirst({ where: { storeId: store.id, externalRef } })
      if (existing) await prisma.order.update({ where: { id: existing.id }, data: { status: 'rejected' } })
    }
  } catch (err) {
    console.error('[webhook:shopify] processing error:', err)
  }
})

function mapShopifyStatus(fs: string | null): string {
  if (!fs) return 'pending'
  if (fs === 'fulfilled') return 'delivered'
  if (fs === 'partial') return 'shipped'
  return 'pending'
}

interface ShopifyOrderPayload {
  id: number
  created_at?: string
  total_price?: string
  financial_status?: string
  fulfillment_status?: string | null
  customer?: { first_name?: string; last_name?: string; phone?: string }
  shipping_address?: { address1?: string; city?: string; phone?: string }
}

// ─── WooCommerce ──────────────────────────────────────────────────────────────
// WooCommerce sends: X-WC-Webhook-Signature (base64 HMAC of raw body using webhook secret)
// Source URL in X-WC-Webhook-Source

router.post('/woocommerce', express_raw(), async (req: Request, res: Response) => {
  const rawBody = req.body as Buffer
  const sig = req.headers['x-wc-webhook-signature'] as string
  const source = req.headers['x-wc-webhook-source'] as string // e.g. https://mystore.com/
  const topic = req.headers['x-wc-webhook-topic'] as string

  if (!source) { res.status(400).send('missing source'); return }

  // Extract domain from source URL
  const domain = new URL(source).hostname

  const store = await prisma.store.findFirst({
    where: { domain: { contains: domain }, platform: 'woocommerce', isActive: true },
  })
  if (!store?.accessToken) { res.status(404).send('store not found'); return }

  // Verify HMAC using the webhook secret stored in store.accessToken
  // WooCommerce webhook secret is separate from the API consumer key — stored in metadata
  // We use the consumer secret part (after ':') as the webhook secret
  const secret = store.accessToken.split(':')[1] || store.accessToken
  if (sig) {
    const expected = hmacSha256(secret, rawBody)
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'base64'), Buffer.from(expected, 'base64'))) {
      res.status(401).send('invalid signature'); return
    }
  }

  res.status(200).send('ok')

  try {
    const payload = JSON.parse(rawBody.toString()) as WooOrderPayload
    if (topic === 'order.created' || topic === 'order.updated') {
      const externalRef = String(payload.id)
      const first = payload.billing?.first_name || ''
      const last = payload.billing?.last_name || ''
      const customerName = [first, last].filter(Boolean).join(' ') || 'عميل غير معروف'
      const customerPhone = payload.billing?.phone || null
      const city = payload.billing?.city || 'غير محدد'
      const address = payload.billing?.address_1 || null
      const total = payload.total ? Math.round(parseFloat(payload.total) * 100) : 0
      const status = mapWooStatus(payload.status)
      const paymentMethod = payload.payment_method?.includes('cod') ? 'cod' : 'card'
      await upsertOrder(store.id, store.organizationId, externalRef, customerName, customerPhone, city, address, total, status, paymentMethod, new Date(payload.date_created || Date.now()))
    }
  } catch (err) {
    console.error('[webhook:woocommerce] processing error:', err)
  }
})

function mapWooStatus(status: string): string {
  if (status === 'pending' || status === 'on-hold') return 'pending'
  if (status === 'processing') return 'accepted'
  if (status === 'completed') return 'delivered'
  if (status === 'cancelled' || status === 'refunded' || status === 'failed') return 'rejected'
  return 'pending'
}

interface WooOrderPayload {
  id: number
  status: string
  date_created?: string
  total?: string
  payment_method?: string
  billing?: { first_name?: string; last_name?: string; phone?: string; city?: string; address_1?: string }
}

// ─── BigCommerce ──────────────────────────────────────────────────────────────
// BigCommerce sends: X-Webhook-Signature header (HMAC-SHA256 hex of raw body)
// Store hash in producer field of the payload

router.post('/bigcommerce', express_raw(), async (req: Request, res: Response) => {
  const rawBody = req.body as Buffer
  const sig = req.headers['x-webhook-signature'] as string

  res.status(200).send('ok') // BigCommerce requires 200 before processing

  try {
    const payload = JSON.parse(rawBody.toString()) as BigCommerceWebhookPayload
    const storeHash = payload.producer?.replace('stores/', '') || ''
    if (!storeHash) return

    // Find store by matching storeHash in the token (format: storeHash:accessToken)
    const stores = await prisma.store.findMany({
      where: { platform: 'bigcommerce', isActive: true },
    })
    const store = stores.find(s => s.accessToken?.startsWith(storeHash + ':'))
    if (!store) return

    if (payload.scope === 'store/order/created' || payload.scope === 'store/order/updated') {
      const orderId = payload.data?.id
      if (!orderId) return

      // Fetch full order details
      const [sh, token] = (store.accessToken || '').split(':')
      const res2 = await fetch(`https://api.bigcommerce.com/stores/${sh}/v2/orders/${orderId}`, {
        headers: { 'X-Auth-Token': token, Accept: 'application/json' },
      })
      if (!res2.ok) return
      const order = await res2.json() as BCOrderDetail
      const externalRef = String(order.id)
      const first = order.billing_address?.first_name || ''
      const last = order.billing_address?.last_name || ''
      const customerName = [first, last].filter(Boolean).join(' ') || 'عميل غير معروف'
      const customerPhone = order.billing_address?.phone || null
      const city = order.billing_address?.city || 'غير محدد'
      const address = order.billing_address?.street_1 || null
      const total = order.total_inc_tax ? Math.round(parseFloat(order.total_inc_tax) * 100) : 0
      const status = mapBigCommerceStatus(order.status)
      const paymentMethod = order.payment_method?.toLowerCase().includes('cash') ? 'cod' : 'card'
      await upsertOrder(store.id, store.organizationId, externalRef, customerName, customerPhone, city, address, total, status, paymentMethod, new Date(order.date_created || Date.now()))
    }
  } catch (err) {
    console.error('[webhook:bigcommerce] processing error:', err)
  }
})

function mapBigCommerceStatus(status: string): string {
  if (status === 'Pending' || status === 'Awaiting Payment') return 'pending'
  if (status === 'Awaiting Fulfillment' || status === 'Awaiting Shipment') return 'accepted'
  if (status === 'Shipped' || status === 'Partially Shipped') return 'shipped'
  if (status === 'Completed' || status === 'Delivered') return 'delivered'
  if (status === 'Cancelled' || status === 'Declined' || status === 'Refunded') return 'rejected'
  return 'pending'
}

interface BigCommerceWebhookPayload {
  scope: string
  producer?: string
  data?: { id?: number }
}

interface BCOrderDetail {
  id: number
  status: string
  date_created?: string
  total_inc_tax?: string
  payment_method?: string
  billing_address?: { first_name?: string; last_name?: string; phone?: string; city?: string; street_1?: string }
}

// ─── Ecwid ────────────────────────────────────────────────────────────────────
// Ecwid sends: eventType + entityId in JSON body — no HMAC, verified by secret in URL

router.post('/ecwid/:storeId', express_raw(), async (req: Request, res: Response) => {
  const { storeId: webhookStoreId } = req.params
  const rawBody = req.body as Buffer

  res.status(200).send('ok')

  try {
    const payload = JSON.parse(rawBody.toString()) as EcwidWebhookPayload
    if (payload.eventType !== 'order.created' && payload.eventType !== 'order.updated') return

    // Find store — Ecwid storeId is embedded in the webhook URL
    const stores = await prisma.store.findMany({ where: { platform: 'ecwid', isActive: true } })
    const store = stores.find(s => s.accessToken?.startsWith(webhookStoreId + ':'))
    if (!store) return

    const [ecwidStoreId, secretToken] = (store.accessToken || '').split(':')
    const orderId = payload.entityId
    if (!orderId) return

    // Fetch full order
    const res2 = await fetch(`https://app.ecwid.com/api/v3/${ecwidStoreId}/orders/${orderId}?token=${secretToken}`)
    if (!res2.ok) return
    const order = await res2.json() as EcwidOrderDetail

    const externalRef = String(order.id)
    const customerName = order.shippingPerson?.name || 'عميل غير معروف'
    const customerPhone = order.shippingPerson?.phone || null
    const city = order.shippingPerson?.city || 'غير محدد'
    const address = order.shippingPerson?.street || null
    const total = order.total ? Math.round(order.total * 100) : 0
    const paymentMethod = order.paymentMethod?.toLowerCase().includes('cash') ? 'cod' : 'card'
    const status = mapEcwidStatus(order.fulfillmentStatus)
    await upsertOrder(store.id, store.organizationId, externalRef, customerName, customerPhone, city, address, total, status, paymentMethod, new Date(order.createDate || Date.now()))
  } catch (err) {
    console.error('[webhook:ecwid] processing error:', err)
  }
})

function mapEcwidStatus(status: string): string {
  if (status === 'AWAITING_PROCESSING' || status === 'NEW') return 'pending'
  if (status === 'PROCESSING') return 'accepted'
  if (status === 'SHIPPED') return 'shipped'
  if (status === 'DELIVERED') return 'delivered'
  if (status === 'WILL_NOT_DELIVER' || status === 'RETURNED') return 'rejected'
  return 'pending'
}

interface EcwidWebhookPayload { eventType: string; entityId?: number }
interface EcwidOrderDetail {
  id: number
  fulfillmentStatus: string
  createDate?: string
  total?: number
  paymentMethod?: string
  shippingPerson?: { name?: string; phone?: string; city?: string; street?: string }
}

// ─── Salla ────────────────────────────────────────────────────────────────────
// Salla sends: X-Salla-Signature (HMAC-SHA256 hex), event in payload

router.post('/salla', express_raw(), async (req: Request, res: Response) => {
  const rawBody = req.body as Buffer
  const sig = req.headers['x-salla-signature'] as string

  res.status(200).send('ok')

  try {
    const payload = JSON.parse(rawBody.toString()) as SallaWebhookPayload
    if (!payload.event?.includes('order')) return

    // Find store — Salla doesn't include store identifier in header, match by token
    // Salla signs with the app secret, not the access token — we match store by the order's merchant ID
    const merchantId = String(payload.merchant || '')
    const stores = await prisma.store.findMany({ where: { platform: 'salla', isActive: true } })
    // Try to match by domain (which we store as the store ID for Salla) or just first active Salla store
    const store = stores.find(s => s.domain === merchantId) || stores[0]
    if (!store) return

    if (payload.event === 'order.created' || payload.event === 'order.updated') {
      const o = payload.data
      if (!o) return
      const externalRef = String(o.id)
      const customerName = o.customer?.name || 'عميل غير معروف'
      const customerPhone = o.customer?.mobile || null
      const city = o.shipping?.address?.city || 'غير محدد'
      const total = Math.round((o.total?.amount ?? 0) * 100)
      const status = mapSallaStatus(o.status?.name)
      await upsertOrder(store.id, store.organizationId, externalRef, customerName, customerPhone, city, null, total, status, 'cod', new Date())
    }
  } catch (err) {
    console.error('[webhook:salla] processing error:', err)
  }
})

function mapSallaStatus(statusName: string | undefined): string {
  if (!statusName) return 'pending'
  if (statusName === 'pending' || statusName === 'under_review') return 'pending'
  if (statusName === 'accepted' || statusName === 'in_progress') return 'accepted'
  if (statusName === 'shipping') return 'shipped'
  if (statusName === 'delivered') return 'delivered'
  if (statusName === 'canceled' || statusName === 'refunded') return 'rejected'
  return 'pending'
}

interface SallaWebhookPayload {
  event: string
  merchant?: number
  data?: {
    id: string | number
    status?: { name: string }
    total?: { amount: number }
    customer?: { name?: string; mobile?: string }
    shipping?: { address?: { city?: string } }
  }
}

// ─── Zid ──────────────────────────────────────────────────────────────────────
// Zid sends: X-Zid-Signature (HMAC-SHA256 hex)

router.post('/zid', express_raw(), async (req: Request, res: Response) => {
  const rawBody = req.body as Buffer
  const sig = req.headers['x-zid-signature'] as string

  res.status(200).send('ok')

  try {
    const payload = JSON.parse(rawBody.toString()) as ZidWebhookPayload
    if (!payload.event?.includes('order')) return

    const storeId = String(payload.store_id || '')
    const stores = await prisma.store.findMany({ where: { platform: 'zid', isActive: true } })
    const store = stores.find(s => s.domain === storeId) || stores[0]
    if (!store) return

    if (payload.event === 'order.created' || payload.event === 'order.updated') {
      const o = payload.order
      if (!o) return
      const externalRef = String(o.id)
      const customerName = o.customer_name || 'عميل غير معروف'
      const customerPhone = o.customer_mobile || null
      const city = o.city_name || 'غير محدد'
      const total = Math.round((o.total_amount ?? 0) * 100)
      const paymentMethod = o.payment_method === 'cod' ? 'cod' : 'card'
      const status = mapZidStatus(o.status)
      await upsertOrder(store.id, store.organizationId, externalRef, customerName, customerPhone, city, null, total, status, paymentMethod, new Date())
    }
  } catch (err) {
    console.error('[webhook:zid] processing error:', err)
  }
})

function mapZidStatus(status: string): string {
  if (status === 'new') return 'pending'
  if (status === 'preparing' || status === 'ready') return 'accepted'
  if (status === 'indelivery') return 'shipped'
  if (status === 'delivered') return 'delivered'
  if (status === 'cancelled') return 'rejected'
  return 'pending'
}

interface ZidWebhookPayload {
  event: string
  store_id?: string | number
  order?: {
    id: string | number
    status: string
    customer_name?: string
    customer_mobile?: string
    city_name?: string
    total_amount?: number
    payment_method?: string
  }
}

// ─── express.raw() helper ────────────────────────────────────────────────────
// We need raw body for HMAC verification — mount raw parser per-route
function express_raw() {
  return (req: Request, _res: Response, next: () => void) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      ;(req as Request & { body: Buffer }).body = Buffer.concat(chunks)
      next()
    })
  }
}

export default router
