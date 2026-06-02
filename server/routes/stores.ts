import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res) => {
  const stores = await prisma.store.findMany({
    where: { organizationId: req.orgId },
    include: { _count: { select: { orders: true, products: true } } },
  })
  res.json({ stores })
})

router.post('/', async (req: AuthRequest, res) => {
  const { name, platform, domain } = req.body
  const store = await prisma.store.create({
    data: { organizationId: req.orgId!, name, platform, domain, isActive: true },
  })
  res.json({ store })
})

// POST /stores/connect — save platform + accessToken for the org's store
router.post('/connect', async (req: AuthRequest, res) => {
  try {
    const { platform, apiKey, storeDomain } = req.body
    if (!platform || !apiKey) {
      res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'platform و apiKey مطلوبان' } })
      return
    }

    // Upsert: find existing active store or create one
    let store = await prisma.store.findFirst({
      where: { organizationId: req.orgId, isActive: true },
    })

    if (store) {
      store = await prisma.store.update({
        where: { id: store.id },
        data: {
          platform,
          domain: storeDomain || store.domain,
          accessToken: apiKey,
          updatedAt: new Date(),
        },
      })
    } else {
      store = await prisma.store.create({
        data: {
          organizationId: req.orgId!,
          name: storeDomain || platform,
          platform,
          domain: storeDomain,
          accessToken: apiKey,
          isActive: true,
        },
      })
    }

    res.json({ store })
  } catch (err) {
    console.error('connect error', err)
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'خطأ في الخادم' } })
  }
})

// POST /stores/:id/disconnect
router.post('/:id/disconnect', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
  })
  if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  await prisma.store.update({
    where: { id: store.id },
    data: { isActive: false, accessToken: null, syncStatus: 'idle' },
  })
  res.json({ disconnected: true })
})

router.get('/:id', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
    include: { _count: { select: { orders: true, products: true } } },
  })
  if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  res.json({ store })
})

// POST /stores/:id/sync — fetch real Shopify data and upsert into DB
router.post('/:id/sync', async (req: AuthRequest, res) => {
  try {
    const store = await prisma.store.findFirst({
      where: { id: req.params.id, organizationId: req.orgId },
    })
    if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }

    await prisma.store.update({
      where: { id: store.id },
      data: { syncStatus: 'syncing', lastSyncAt: new Date() },
    })

    // For non-Shopify or missing credentials, just mark idle
    if (store.platform !== 'shopify' || !store.accessToken || !store.domain) {
      await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
      res.json({ syncing: false, message: 'لا توجد بيانات Shopify كافية للمزامنة' })
      return
    }

    // Run sync asynchronously
    res.json({ syncing: true })

    syncShopify(store.id, store.domain, store.accessToken, req.orgId!).catch(err => {
      console.error('Shopify sync error:', err)
      prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
    })
  } catch (err) {
    console.error('sync error', err)
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'خطأ في المزامنة' } })
  }
})

async function syncShopify(storeId: string, domain: string, token: string, orgId: string) {
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
  const base = `https://${domain}/admin/api/2024-01`

  // ── Sync products ──────────────────────────────────────────
  const prodRes = await fetch(`${base}/products.json?limit=50`, { headers })
  if (prodRes.ok) {
    const { products } = await prodRes.json() as { products: ShopifyProduct[] }
    for (const p of products) {
      const variant = p.variants?.[0]
      const price = variant ? Math.round(parseFloat(variant.price) * 100) : 0
      const stock = variant?.inventory_quantity ?? 0
      await prisma.product.upsert({
        where: { storeId_name: { storeId, name: p.title } },
        create: {
          storeId,
          name: p.title,
          description: p.body_html?.replace(/<[^>]*>/g, '') || null,
          price,
          stock,
          imageUrl: p.image?.src || null,
          isActive: p.status === 'active',
        },
        update: { price, stock, isActive: p.status === 'active' },
      })
    }
  }

  // ── Sync orders ────────────────────────────────────────────
  const ordRes = await fetch(`${base}/orders.json?limit=50&status=any`, { headers })
  if (ordRes.ok) {
    const { orders } = await ordRes.json() as { orders: ShopifyOrder[] }
    for (const o of orders) {
      const externalRef = String(o.id)
      const customerName = [o.customer?.first_name, o.customer?.last_name].filter(Boolean).join(' ') || 'عميل غير معروف'
      const customerPhone = o.customer?.phone || o.shipping_address?.phone || null
      const city = o.shipping_address?.city || 'غير محدد'
      const total = Math.round(parseFloat(o.total_price) * 100)
      const status = mapOrderStatus(o.fulfillment_status)
      const paymentMethod = mapPaymentMethod(o.financial_status)

      // Find or create customer
      let customer = customerPhone
        ? await prisma.customer.findFirst({ where: { organizationId: orgId, phone: customerPhone } })
        : null

      if (!customer && customerName !== 'عميل غير معروف') {
        customer = await prisma.customer.findFirst({ where: { organizationId: orgId, name: customerName } })
      }

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            organizationId: orgId,
            name: customerName,
            phone: customerPhone,
            city,
          },
        })
      }

      const existing = await prisma.order.findFirst({ where: { storeId, externalRef } })
      if (!existing) {
        await prisma.order.create({
          data: {
            storeId,
            externalRef,
            customerId: customer.id,
            customerName,
            customerPhone,
            city,
            address: o.shipping_address ? [o.shipping_address.address1, o.shipping_address.address2].filter(Boolean).join(', ') : null,
            status,
            paymentMethod,
            total,
            placedAt: o.created_at ? new Date(o.created_at) : new Date(),
          },
        })
      } else {
        await prisma.order.update({
          where: { id: existing.id },
          data: { status, total, paymentMethod },
        })
      }
    }
  }

  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: 'idle' } })
}

function mapOrderStatus(fulfillmentStatus: string | null): string {
  if (!fulfillmentStatus) return 'pending'
  if (fulfillmentStatus === 'fulfilled') return 'delivered'
  if (fulfillmentStatus === 'partial') return 'shipped'
  return 'pending'
}

function mapPaymentMethod(financialStatus: string): string {
  if (financialStatus === 'paid') return 'card'
  if (financialStatus === 'pending') return 'cod'
  return 'card'
}

// ── Shopify API types ────────────────────────────────────────

interface ShopifyProduct {
  id: number
  title: string
  body_html?: string
  status: string
  image?: { src: string }
  variants: Array<{ price: string; inventory_quantity: number }>
}

interface ShopifyOrder {
  id: number
  created_at: string
  total_price: string
  financial_status: string
  fulfillment_status: string | null
  customer?: { first_name?: string; last_name?: string; phone?: string }
  shipping_address?: { address1?: string; address2?: string; city?: string; phone?: string }
}

export default router
