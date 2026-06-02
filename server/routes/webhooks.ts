import { Router, type Request, type Response } from 'express'
import prisma from '../lib/prisma.js'
import { verifyShopify, verifyWooCommerce, verifyBigCommerce, verifyEcwid, verifySalla, verifyZid } from '../lib/webhooks/verifier.js'
import { processWebhookEvent, upsertOrderFromWebhook, type OrderPayload } from '../lib/webhooks/processor.js'

const router = Router()

// Per-route raw body collector (needed for HMAC verification)
function rawBody() {
  return (req: Request, _res: Response, next: () => void) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => { ;(req as Request & { body: Buffer }).body = Buffer.concat(chunks); next() })
  }
}

// ─── Shopify ─────────────────────────────────────────────────────────────────

router.post('/shopify', rawBody(), async (req: Request, res: Response) => {
  const raw = req.body as Buffer
  const sig        = req.headers['x-shopify-hmac-sha256'] as string
  const shopDomain = req.headers['x-shopify-shop-domain'] as string
  const topic      = req.headers['x-shopify-topic'] as string
  const eventId    = (req.headers['x-shopify-webhook-id'] as string | undefined) ?? String(Date.now())

  if (!shopDomain) { res.status(400).send('missing shop domain'); return }

  const store = await prisma.store.findFirst({
    where: { domain: shopDomain, platform: 'shopify', isActive: true },
  })
  if (!store?.accessToken) { res.status(404).send('store not found'); return }

  const v = verifyShopify(raw, sig, store.accessToken)
  if (!v.ok) { res.status(401).send(v.reason); return }

  res.status(200).send('ok')

  const key = `shopify:${shopDomain}:${topic}:${eventId}`
  await processWebhookEvent('shopify', topic, key, store.id, raw.toString(), async () => {
    await handleShopifyPayload(store.id, store.organizationId, topic, JSON.parse(raw.toString()) as ShopifyOrderPayload)
  }).catch(err => console.error('[webhook:shopify]', err))
})

async function handleShopifyPayload(storeId: string, orgId: string, topic: string, p: ShopifyOrderPayload) {
  const externalRef = String(p.id)
  if (topic === 'orders/cancelled') {
    const existing = await prisma.order.findFirst({ where: { storeId, externalRef } })
    if (existing) await prisma.order.update({ where: { id: existing.id }, data: { status: 'rejected' } })
    return
  }
  const name = [p.customer?.first_name, p.customer?.last_name].filter(Boolean).join(' ') || 'عميل غير معروف'
  await upsertOrderFromWebhook(storeId, orgId, {
    externalRef, customerName: name,
    customerPhone: p.customer?.phone || p.shipping_address?.phone || null,
    city: p.shipping_address?.city || 'غير محدد',
    address: p.shipping_address?.address1 || null,
    total: Math.round(parseFloat(p.total_price || '0') * 100),
    status: mapShopify(p.fulfillment_status),
    paymentMethod: p.financial_status === 'pending' ? 'cod' : 'card',
    placedAt: p.created_at ? new Date(p.created_at) : new Date(),
    items: p.line_items?.map(i => ({ name: i.name, qty: i.quantity, unitPrice: Math.round(parseFloat(i.price) * 100) })),
  })
}

// ─── WooCommerce ──────────────────────────────────────────────────────────────

router.post('/woocommerce', rawBody(), async (req: Request, res: Response) => {
  const raw        = req.body as Buffer
  const sig        = req.headers['x-wc-webhook-signature'] as string
  const source     = req.headers['x-wc-webhook-source'] as string
  const topic      = req.headers['x-wc-webhook-topic'] as string
  const deliveryId = (req.headers['x-wc-delivery-id'] as string | undefined) ?? String(Date.now())

  if (!source) { res.status(400).send('missing source'); return }
  let domain: string
  try { domain = new URL(source).hostname } catch { res.status(400).send('invalid source url'); return }

  const store = await prisma.store.findFirst({
    where: { domain: { contains: domain }, platform: 'woocommerce', isActive: true },
  })
  if (!store?.accessToken) { res.status(404).send('store not found'); return }

  const secret = store.accessToken.split(':')[1] || store.accessToken
  const v = verifyWooCommerce(raw, sig, secret)
  if (!v.ok) { res.status(401).send(v.reason); return }

  res.status(200).send('ok')

  const key = `woocommerce:${domain}:${topic}:${deliveryId}`
  const p = JSON.parse(raw.toString()) as WooOrderPayload
  await processWebhookEvent('woocommerce', topic, key, store.id, raw.toString(), async () => {
    await upsertOrderFromWebhook(store.id, store.organizationId, {
      externalRef: String(p.id),
      customerName: [p.billing?.first_name, p.billing?.last_name].filter(Boolean).join(' ') || 'عميل غير معروف',
      customerPhone: p.billing?.phone || null,
      city: p.billing?.city || 'غير محدد',
      address: p.billing?.address_1 || null,
      total: p.total ? Math.round(parseFloat(p.total) * 100) : 0,
      status: mapWoo(p.status),
      paymentMethod: p.payment_method?.includes('cod') ? 'cod' : 'card',
      placedAt: p.date_created ? new Date(p.date_created) : new Date(),
      items: p.line_items?.map(i => ({
        name: i.name, qty: i.quantity,
        unitPrice: Math.round(parseFloat(i.total ?? '0') / Math.max(i.quantity, 1) * 100),
      })),
    })
  }).catch(err => console.error('[webhook:woocommerce]', err))
})

// ─── BigCommerce ──────────────────────────────────────────────────────────────

router.post('/bigcommerce', rawBody(), async (req: Request, res: Response) => {
  const raw = req.body as Buffer
  res.status(200).send('ok') // BigCommerce needs 200 immediately

  try {
    const p = JSON.parse(raw.toString()) as BCWebhookPayload
    const storeHash = p.producer?.replace('stores/', '') ?? ''
    if (!storeHash) return

    const stores = await prisma.store.findMany({ where: { platform: 'bigcommerce', isActive: true } })
    const store = stores.find(s => s.accessToken?.startsWith(storeHash + ':'))
    if (!store) return

    const v = verifyBigCommerce(storeHash, store.accessToken!.split(':')[0])
    if (!v.ok) { console.warn('[webhook:bigcommerce] verify:', v.reason); return }

    const orderId = p.data?.id
    if (!orderId) return

    const key = `bigcommerce:${storeHash}:${p.scope}:${orderId}:${p.created_at ?? Date.now()}`
    await processWebhookEvent('bigcommerce', p.scope, key, store.id, raw.toString(), async () => {
      const [sh, token] = store.accessToken!.split(':')
      const oRes = await fetch(`https://api.bigcommerce.com/stores/${sh}/v2/orders/${orderId}`, {
        headers: { 'X-Auth-Token': token, Accept: 'application/json' },
      })
      if (!oRes.ok) throw new Error(`BC order fetch ${oRes.status}`)
      const o = await oRes.json() as BCOrderDetail
      await upsertOrderFromWebhook(store.id, store.organizationId, {
        externalRef: String(o.id),
        customerName: [o.billing_address?.first_name, o.billing_address?.last_name].filter(Boolean).join(' ') || 'عميل غير معروف',
        customerPhone: o.billing_address?.phone || null,
        city: o.billing_address?.city || 'غير محدد',
        address: o.billing_address?.street_1 || null,
        total: o.total_inc_tax ? Math.round(parseFloat(o.total_inc_tax) * 100) : 0,
        status: mapBigCommerce(o.status),
        paymentMethod: o.payment_method?.toLowerCase().includes('cash') ? 'cod' : 'card',
        placedAt: o.date_created ? new Date(o.date_created) : new Date(),
      })
    }).catch(err => console.error('[webhook:bigcommerce]', err))
  } catch (err) { console.error('[webhook:bigcommerce] parse error:', err) }
})

// ─── Ecwid ────────────────────────────────────────────────────────────────────

router.post('/ecwid/:ecwidStoreId', rawBody(), async (req: Request, res: Response) => {
  const raw = req.body as Buffer
  const { ecwidStoreId } = req.params
  res.status(200).send('ok')

  try {
    const p = JSON.parse(raw.toString()) as EcwidWebhookPayload
    if (p.eventType !== 'order.created' && p.eventType !== 'order.updated') return

    const stores = await prisma.store.findMany({ where: { platform: 'ecwid', isActive: true } })
    const store = stores.find(s => s.accessToken?.startsWith(ecwidStoreId + ':'))
    if (!store) return

    const [tokenStoreId, secretToken] = store.accessToken!.split(':')
    const v = verifyEcwid(ecwidStoreId, tokenStoreId)
    if (!v.ok) { console.warn('[webhook:ecwid] verify:', v.reason); return }

    const orderId = p.entityId
    if (!orderId) return

    const key = `ecwid:${ecwidStoreId}:${p.eventType}:${orderId}`
    await processWebhookEvent('ecwid', p.eventType, key, store.id, raw.toString(), async () => {
      const oRes = await fetch(`https://app.ecwid.com/api/v3/${tokenStoreId}/orders/${orderId}?token=${secretToken}`)
      if (!oRes.ok) throw new Error(`Ecwid order fetch ${oRes.status}`)
      const o = await oRes.json() as EcwidOrderDetail
      await upsertOrderFromWebhook(store.id, store.organizationId, {
        externalRef: String(o.id),
        customerName: o.shippingPerson?.name || 'عميل غير معروف',
        customerPhone: o.shippingPerson?.phone || null,
        city: o.shippingPerson?.city || 'غير محدد',
        address: o.shippingPerson?.street || null,
        total: o.total ? Math.round(o.total * 100) : 0,
        status: mapEcwid(o.fulfillmentStatus),
        paymentMethod: o.paymentMethod?.toLowerCase().includes('cash') ? 'cod' : 'card',
        placedAt: o.createDate ? new Date(o.createDate) : new Date(),
      })
    }).catch(err => console.error('[webhook:ecwid]', err))
  } catch (err) { console.error('[webhook:ecwid] parse error:', err) }
})

// ─── Salla ────────────────────────────────────────────────────────────────────

router.post('/salla', rawBody(), async (req: Request, res: Response) => {
  const raw = req.body as Buffer
  const sig = req.headers['x-salla-signature'] as string | undefined
  res.status(200).send('ok')

  try {
    const appSecret = process.env.SALLA_APP_SECRET ?? ''
    if (appSecret) {
      const v = verifySalla(raw, sig, appSecret)
      if (!v.ok) { console.warn('[webhook:salla] verify:', v.reason); return }
    }

    const p = JSON.parse(raw.toString()) as SallaWebhookPayload
    if (!p.event?.includes('order') || !p.data) return

    const merchantId = String(p.merchant ?? '')
    const stores = await prisma.store.findMany({ where: { platform: 'salla', isActive: true } })
    const store = stores.find(s => s.domain === merchantId) ?? stores[0]
    if (!store) return

    const o = p.data
    const key = `salla:${merchantId}:${p.event}:${o.id}:${p.created_at ?? Date.now()}`
    await processWebhookEvent('salla', p.event, key, store.id, raw.toString(), async () => {
      await upsertOrderFromWebhook(store.id, store.organizationId, {
        externalRef: String(o.id),
        customerName: o.customer?.name || 'عميل غير معروف',
        customerPhone: o.customer?.mobile || null,
        city: o.shipping?.address?.city || 'غير محدد',
        address: null,
        total: Math.round((o.total?.amount ?? 0) * 100),
        status: mapSalla(o.status?.name),
        paymentMethod: 'cod',
        placedAt: new Date(),
      })
    }).catch(err => console.error('[webhook:salla]', err))
  } catch (err) { console.error('[webhook:salla] parse error:', err) }
})

// ─── Zid ──────────────────────────────────────────────────────────────────────

router.post('/zid', rawBody(), async (req: Request, res: Response) => {
  const raw = req.body as Buffer
  const sig = req.headers['x-zid-signature'] as string | undefined
  res.status(200).send('ok')

  try {
    const appSecret = process.env.ZID_APP_SECRET ?? ''
    if (appSecret) {
      const v = verifyZid(raw, sig, appSecret)
      if (!v.ok) { console.warn('[webhook:zid] verify:', v.reason); return }
    }

    const p = JSON.parse(raw.toString()) as ZidWebhookPayload
    if (!p.event?.includes('order') || !p.order) return

    const zidStoreId = String(p.store_id ?? '')
    const stores = await prisma.store.findMany({ where: { platform: 'zid', isActive: true } })
    const store = stores.find(s => s.domain === zidStoreId) ?? stores[0]
    if (!store) return

    const o = p.order
    const key = `zid:${zidStoreId}:${p.event}:${o.id}`
    await processWebhookEvent('zid', p.event, key, store.id, raw.toString(), async () => {
      await upsertOrderFromWebhook(store.id, store.organizationId, {
        externalRef: String(o.id),
        customerName: o.customer_name || 'عميل غير معروف',
        customerPhone: o.customer_mobile || null,
        city: o.city_name || 'غير محدد',
        address: null,
        total: Math.round((o.total_amount ?? 0) * 100),
        status: mapZid(o.status),
        paymentMethod: o.payment_method === 'cod' ? 'cod' : 'card',
        placedAt: new Date(),
      })
    }).catch(err => console.error('[webhook:zid]', err))
  } catch (err) { console.error('[webhook:zid] parse error:', err) }
})

// ─── dispatchRetry — called by retry worker ───────────────────────────────────

export async function dispatchRetry(platform: string, topic: string, storeId: string | null, payload: string): Promise<void> {
  const store = storeId ? await prisma.store.findUnique({ where: { id: storeId } }) : null
  if (!store) throw new Error(`store not found: ${storeId}`)

  switch (platform) {
    case 'shopify':
      await handleShopifyPayload(store.id, store.organizationId, topic, JSON.parse(payload) as ShopifyOrderPayload)
      break
    case 'woocommerce': {
      const p = JSON.parse(payload) as WooOrderPayload
      await upsertOrderFromWebhook(store.id, store.organizationId, {
        externalRef: String(p.id),
        customerName: [p.billing?.first_name, p.billing?.last_name].filter(Boolean).join(' ') || 'عميل غير معروف',
        customerPhone: p.billing?.phone || null,
        city: p.billing?.city || 'غير محدد',
        address: p.billing?.address_1 || null,
        total: p.total ? Math.round(parseFloat(p.total) * 100) : 0,
        status: mapWoo(p.status),
        paymentMethod: p.payment_method?.includes('cod') ? 'cod' : 'card',
        placedAt: p.date_created ? new Date(p.date_created) : new Date(),
      })
      break
    }
    case 'salla': {
      const p = JSON.parse(payload) as SallaWebhookPayload
      if (p.data) {
        const o = p.data
        await upsertOrderFromWebhook(store.id, store.organizationId, {
          externalRef: String(o.id),
          customerName: o.customer?.name || 'عميل غير معروف',
          customerPhone: o.customer?.mobile || null,
          city: o.shipping?.address?.city || 'غير محدد',
          address: null,
          total: Math.round((o.total?.amount ?? 0) * 100),
          status: mapSalla(o.status?.name),
          paymentMethod: 'cod',
          placedAt: new Date(),
        })
      }
      break
    }
    case 'zid': {
      const p = JSON.parse(payload) as ZidWebhookPayload
      if (p.order) {
        const o = p.order
        await upsertOrderFromWebhook(store.id, store.organizationId, {
          externalRef: String(o.id),
          customerName: o.customer_name || 'عميل غير معروف',
          customerPhone: o.customer_mobile || null,
          city: o.city_name || 'غير محدد',
          address: null,
          total: Math.round((o.total_amount ?? 0) * 100),
          status: mapZid(o.status),
          paymentMethod: o.payment_method === 'cod' ? 'cod' : 'card',
          placedAt: new Date(),
        })
      }
      break
    }
    default:
      throw new Error(`retry not implemented for platform: ${platform}`)
  }
}

// ─── Status mappers ───────────────────────────────────────────────────────────

function mapShopify(fs: string | null | undefined): string {
  if (!fs) return 'pending'
  if (fs === 'fulfilled') return 'delivered'
  if (fs === 'partial') return 'shipped'
  return 'pending'
}

function mapWoo(s: string): string {
  if (s === 'pending' || s === 'on-hold') return 'pending'
  if (s === 'processing') return 'accepted'
  if (s === 'completed') return 'delivered'
  if (s === 'cancelled' || s === 'refunded' || s === 'failed') return 'rejected'
  return 'pending'
}

function mapBigCommerce(s: string): string {
  if (s === 'Pending' || s === 'Awaiting Payment') return 'pending'
  if (s === 'Awaiting Fulfillment' || s === 'Awaiting Shipment') return 'accepted'
  if (s === 'Shipped' || s === 'Partially Shipped') return 'shipped'
  if (s === 'Completed' || s === 'Delivered') return 'delivered'
  if (s === 'Cancelled' || s === 'Declined' || s === 'Refunded') return 'rejected'
  return 'pending'
}

function mapEcwid(s: string): string {
  if (s === 'AWAITING_PROCESSING' || s === 'NEW') return 'pending'
  if (s === 'PROCESSING') return 'accepted'
  if (s === 'SHIPPED') return 'shipped'
  if (s === 'DELIVERED') return 'delivered'
  if (s === 'WILL_NOT_DELIVER' || s === 'RETURNED') return 'rejected'
  return 'pending'
}

function mapSalla(s: string | undefined): string {
  if (!s) return 'pending'
  if (s === 'pending' || s === 'under_review') return 'pending'
  if (s === 'accepted' || s === 'in_progress') return 'accepted'
  if (s === 'shipping') return 'shipped'
  if (s === 'delivered') return 'delivered'
  if (s === 'canceled' || s === 'refunded') return 'rejected'
  return 'pending'
}

function mapZid(s: string): string {
  if (s === 'new') return 'pending'
  if (s === 'preparing' || s === 'ready') return 'accepted'
  if (s === 'indelivery') return 'shipped'
  if (s === 'delivered') return 'delivered'
  if (s === 'cancelled') return 'rejected'
  return 'pending'
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShopifyOrderPayload {
  id: number; created_at?: string; total_price?: string
  financial_status?: string; fulfillment_status?: string | null
  customer?: { first_name?: string; last_name?: string; phone?: string }
  shipping_address?: { address1?: string; city?: string; phone?: string }
  line_items?: Array<{ name: string; quantity: number; price: string }>
}

interface WooOrderPayload {
  id: number; status: string; date_created?: string; total?: string; payment_method?: string
  billing?: { first_name?: string; last_name?: string; phone?: string; city?: string; address_1?: string }
  line_items?: Array<{ name: string; quantity: number; total?: string }>
}

interface BCWebhookPayload { scope: string; producer?: string; created_at?: number; data?: { id?: number } }
interface BCOrderDetail {
  id: number; status: string; date_created?: string; total_inc_tax?: string; payment_method?: string
  billing_address?: { first_name?: string; last_name?: string; phone?: string; city?: string; street_1?: string }
}

interface EcwidWebhookPayload { eventType: string; entityId?: number }
interface EcwidOrderDetail {
  id: number; fulfillmentStatus: string; createDate?: string; total?: number; paymentMethod?: string
  shippingPerson?: { name?: string; phone?: string; city?: string; street?: string }
}

interface SallaWebhookPayload {
  event: string; merchant?: number; created_at?: number
  data?: {
    id: string | number; status?: { name: string }; total?: { amount: number }
    customer?: { name?: string; mobile?: string }; shipping?: { address?: { city?: string } }
  }
}

interface ZidWebhookPayload {
  event: string; store_id?: string | number
  order?: { id: string | number; status: string; customer_name?: string; customer_mobile?: string; city_name?: string; total_amount?: number; payment_method?: string }
}

export default router
