import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { registerStoreWebhooks, deregisterStoreWebhooks } from '../lib/webhooks/registry.js'
import { verifyPlatformCredentials } from '../lib/platforms/verify.js'
import { fetchOrders as fetchFacebookOrders } from '../lib/platforms/facebook.js'
import { fetchOrders as fetchTikTokOrders } from '../lib/platforms/tiktok.js'
import { fetchOrders as fetchSallaOrders } from '../lib/platforms/salla.js'
import { fetchOrders as fetchZidOrders } from '../lib/platforms/zid.js'
import { fetchOrders as fetchAmazonOrders } from '../lib/platforms/amazon.js'
import { fetchOrders as fetchNoonOrders } from '../lib/platforms/noon.js'
import { fetchOrders as fetchJumiaOrders } from '../lib/platforms/jumia.js'
import { fetchOrders as fetchWooOrders } from '../lib/platforms/woocommerce.js'
import { fetchOrders as fetchWixOrders } from '../lib/platforms/wix.js'
import { fetchOrders as fetchBigCommerceOrders } from '../lib/platforms/bigcommerce.js'
import { fetchOrders as fetchEcwidOrders } from '../lib/platforms/ecwid.js'

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

// POST /stores/connect — verify credentials against platform API, then save
router.post('/connect', async (req: AuthRequest, res) => {
  try {
    const { platform, apiKey, storeDomain } = req.body
    if (!platform || !apiKey) {
      res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'platform و apiKey مطلوبان' } })
      return
    }

    // Verify credentials against the real platform API before saving anything
    let storeName: string
    try {
      const result = await verifyPlatformCredentials(platform, storeDomain, apiKey)
      storeName = result.storeName
    } catch (verifyErr) {
      const msg = verifyErr instanceof Error ? verifyErr.message : 'بيانات الاتصال غير صحيحة'
      res.status(422).json({ error: { code: 'INVALID_CREDENTIALS', message: msg } })
      return
    }

    // Credentials verified — now upsert the store record
    let store = await prisma.store.findFirst({
      where: { organizationId: req.orgId, isActive: true },
    })

    if (store) {
      store = await prisma.store.update({
        where: { id: store.id },
        data: {
          platform,
          name: storeName,
          domain: storeDomain || store.domain,
          accessToken: apiKey,
          updatedAt: new Date(),
        },
      })
    } else {
      store = await prisma.store.create({
        data: {
          organizationId: req.orgId!,
          name: storeName,
          platform,
          domain: storeDomain,
          accessToken: apiKey,
          isActive: true,
        },
      })
    }

    res.json({ store })

    // Kick off background sync for supported platforms
    if (['shopify', 'facebook', 'instagram', 'tiktok', 'salla', 'zid'].includes(platform) && store.accessToken) {
      const domain = store.domain ?? ''
      const token = store.accessToken
      const orgId = req.orgId!
      if (platform === 'shopify' && domain) {
        syncShopify(store.id, domain, token, orgId).catch(err => console.error('connect sync error (shopify):', err))
      } else if ((platform === 'facebook' || platform === 'instagram') && domain) {
        syncFacebook(store.id, domain, token, orgId).catch(err => console.error('connect sync error (facebook):', err))
      } else if (platform === 'tiktok' && domain) {
        syncTikTok(store.id, domain, token, orgId).catch(err => console.error('connect sync error (tiktok):', err))
      } else if (platform === 'salla') {
        syncSalla(store.id, domain || store.id, token, orgId).catch(err => console.error('connect sync error (salla):', err))
      } else if (platform === 'zid') {
        syncZid(store.id, domain || store.id, token, orgId).catch(err => console.error('connect sync error (zid):', err))
      } else if (platform === 'amazon' && domain) {
        syncAmazon(store.id, domain, token, orgId).catch(err => console.error('connect sync error (amazon):', err))
      } else if (platform === 'noon') {
        syncNoon(store.id, domain || store.id, token, orgId).catch(err => console.error('connect sync error (noon):', err))
      } else if (platform === 'jumia') {
        syncJumia(store.id, domain || store.id, token, orgId).catch(err => console.error('connect sync error (jumia):', err))
      } else if (platform === 'woocommerce' && domain) {
        syncWoo(store.id, domain, token, orgId).catch(err => console.error('connect sync error (woocommerce):', err))
      } else if (platform === 'wix') {
        syncWix(store.id, domain || '', token, orgId).catch(err => console.error('connect sync error (wix):', err))
      } else if (platform === 'bigcommerce') {
        syncBigCommerce(store.id, domain || '', token, orgId).catch(err => console.error('connect sync error (bigcommerce):', err))
      } else if (platform === 'ecwid') {
        syncEcwid(store.id, domain || '', token, orgId).catch(err => console.error('connect sync error (ecwid):', err))
      }

      // Register webhooks for real-time order sync
      registerStoreWebhooks(store.id, platform, domain || '', token).catch(err =>
        console.warn(`[webhooks] registration failed for ${platform}:`, err instanceof Error ? err.message : err)
      )
    }
  } catch (err) {
    console.error('connect error', err)
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'خطأ في الخادم' } })
  }
})

// POST /stores/switch — set active store for this org's session
router.post('/switch', async (req: AuthRequest, res) => {
  const { storeId } = req.body
  if (!storeId) { res.status(400).json({ error: { code: 'MISSING_STORE_ID', message: 'storeId مطلوب' } }); return }
  const store = await prisma.store.findFirst({
    where: { id: storeId, organizationId: req.orgId, isActive: true },
  })
  if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'المتجر غير موجود' } }); return }
  await prisma.organization.update({ where: { id: req.orgId! }, data: { activeStoreId: storeId } })
  res.json({ switched: true, storeId })
})

// GET /stores/usage — plan limit info
router.get('/usage', async (req: AuthRequest, res) => {
  const { getStoreUsage } = await import('../middleware/subscriptionLimits.js')
  const usage = await getStoreUsage(req.orgId!)
  res.json(usage)
})

// POST /stores/:id/disconnect
router.post('/:id/disconnect', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
  })
  if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  // Deregister webhooks before clearing the token
  if (store.accessToken && store.domain) {
    deregisterStoreWebhooks(store.id, store.platform, store.domain, store.accessToken).catch(() => {})
  }
  await prisma.store.update({
    where: { id: store.id },
    data: { isActive: false, accessToken: null, syncStatus: 'idle' },
  })
  res.json({ disconnected: true })
})

// POST /stores/:id/pause
router.post('/:id/pause', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({ where: { id: req.params.id, organizationId: req.orgId } })
  if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  await prisma.store.update({ where: { id: store.id }, data: { isActive: false } })
  res.json({ paused: true })
})

// POST /stores/:id/resume
router.post('/:id/resume', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({ where: { id: req.params.id, organizationId: req.orgId } })
  if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  await prisma.store.update({ where: { id: store.id }, data: { isActive: true } })
  res.json({ resumed: true })
})

// DELETE /stores/:id — soft delete, preserves all history
router.delete('/:id', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({ where: { id: req.params.id, organizationId: req.orgId } })
  if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  await prisma.store.update({
    where: { id: store.id },
    data: { isActive: false, isDeleted: true, accessToken: null, refreshToken: null },
  })
  // Clear as active store if it was the active one
  const org = await prisma.organization.findUnique({ where: { id: req.orgId! }, select: { activeStoreId: true } })
  if (org?.activeStoreId === store.id) {
    const next = await prisma.store.findFirst({ where: { organizationId: req.orgId!, isActive: true, isDeleted: false } })
    await prisma.organization.update({ where: { id: req.orgId! }, data: { activeStoreId: next?.id ?? null } })
  }
  res.json({ deleted: true })
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

    if (store.platform === 'shopify') {
      if (!store.accessToken || !store.domain) {
        await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
        res.json({ syncing: false, message: 'لا توجد بيانات Shopify كافية للمزامنة' })
        return
      }
      res.json({ syncing: true })
      syncShopify(store.id, store.domain, store.accessToken, req.orgId!).catch(err => {
        console.error('Shopify sync error:', err)
        prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
      })
      return
    }

    if (store.platform === 'facebook' || store.platform === 'instagram') {
      if (!store.accessToken || !store.domain) {
        await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
        res.json({ syncing: false, message: 'لا توجد بيانات Facebook كافية للمزامنة' })
        return
      }
      res.json({ syncing: true })
      syncFacebook(store.id, store.domain, store.accessToken, req.orgId!).catch(err => {
        console.error('Facebook sync error:', err)
        prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
      })
      return
    }

    if (store.platform === 'tiktok') {
      if (!store.accessToken || !store.domain) {
        await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
        res.json({ syncing: false, message: 'لا توجد بيانات TikTok كافية للمزامنة' })
        return
      }
      res.json({ syncing: true })
      syncTikTok(store.id, store.domain, store.accessToken, req.orgId!).catch(err => {
        console.error('TikTok sync error:', err)
        prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
      })
      return
    }

    if (store.platform === 'salla') {
      if (!store.accessToken) {
        await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
        res.json({ syncing: false, message: 'لا توجد بيانات Salla كافية للمزامنة' })
        return
      }
      res.json({ syncing: true })
      syncSalla(store.id, store.domain || store.id, store.accessToken, req.orgId!).catch(err => {
        console.error('Salla sync error:', err)
        prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
      })
      return
    }

    if (store.platform === 'zid') {
      if (!store.accessToken) {
        await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
        res.json({ syncing: false, message: 'لا توجد بيانات Zid كافية للمزامنة' })
        return
      }
      res.json({ syncing: true })
      syncZid(store.id, store.domain || store.id, store.accessToken, req.orgId!).catch(err => {
        console.error('Zid sync error:', err)
        prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
      })
      return
    }

    if (store.platform === 'amazon') {
      if (!store.accessToken || !store.domain) {
        await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
        res.json({ syncing: false, message: 'لا توجد بيانات Amazon كافية للمزامنة' })
        return
      }
      res.json({ syncing: true })
      syncAmazon(store.id, store.domain, store.accessToken, req.orgId!).catch(err => {
        console.error('Amazon sync error:', err)
        prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
      })
      return
    }

    if (store.platform === 'noon') {
      if (!store.accessToken) {
        await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
        res.json({ syncing: false, message: 'لا توجد بيانات Noon كافية للمزامنة' })
        return
      }
      res.json({ syncing: true })
      syncNoon(store.id, store.domain || store.id, store.accessToken, req.orgId!).catch(err => {
        console.error('Noon sync error:', err)
        prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
      })
      return
    }

    if (store.platform === 'jumia') {
      if (!store.accessToken) {
        await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
        res.json({ syncing: false, message: 'لا توجد بيانات Jumia كافية للمزامنة' })
        return
      }
      res.json({ syncing: true })
      syncJumia(store.id, store.domain || store.id, store.accessToken, req.orgId!).catch(err => {
        console.error('Jumia sync error:', err)
        prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
      })
      return
    }

    if (store.platform === 'woocommerce') {
      if (!store.accessToken || !store.domain) {
        await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
        res.json({ syncing: false, message: 'لا توجد بيانات WooCommerce كافية للمزامنة' })
        return
      }
      res.json({ syncing: true })
      syncWoo(store.id, store.domain, store.accessToken, req.orgId!).catch(err => {
        console.error('WooCommerce sync error:', err)
        prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
      })
      return
    }

    if (store.platform === 'wix') {
      if (!store.accessToken) {
        await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
        res.json({ syncing: false, message: 'لا توجد بيانات Wix كافية للمزامنة' })
        return
      }
      res.json({ syncing: true })
      syncWix(store.id, store.domain || '', store.accessToken, req.orgId!).catch(err => {
        console.error('Wix sync error:', err)
        prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
      })
      return
    }

    if (store.platform === 'bigcommerce') {
      if (!store.accessToken) {
        await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
        res.json({ syncing: false, message: 'لا توجد بيانات BigCommerce كافية للمزامنة' })
        return
      }
      res.json({ syncing: true })
      syncBigCommerce(store.id, store.domain || '', store.accessToken, req.orgId!).catch(err => {
        console.error('BigCommerce sync error:', err)
        prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
      })
      return
    }

    if (store.platform === 'ecwid') {
      if (!store.accessToken) {
        await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
        res.json({ syncing: false, message: 'لا توجد بيانات Ecwid كافية للمزامنة' })
        return
      }
      res.json({ syncing: true })
      syncEcwid(store.id, store.domain || '', store.accessToken, req.orgId!).catch(err => {
        console.error('Ecwid sync error:', err)
        prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'error' } }).catch(() => {})
      })
      return
    }

    // For other platforms, just mark idle
    await prisma.store.update({ where: { id: store.id }, data: { syncStatus: 'idle' } })
    res.json({ syncing: false, message: 'المزامنة غير متوفرة لهذه المنصة' })
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

async function syncFacebook(storeId: string, pageId: string, token: string, orgId: string) {
  const orders = await fetchFacebookOrders(pageId, token)

  for (const o of orders) {
    const externalRef = o.id
    const customerName = o.buyer_details?.name || o.shipping_address?.name || 'عميل غير معروف'
    const customerPhone = o.buyer_details?.phone || null
    const city = o.shipping_address?.city || 'غير محدد'
    const address = o.shipping_address
      ? [o.shipping_address.street1].filter(Boolean).join(', ')
      : null
    const firstItem = o.items?.data?.[0]
    const total = firstItem
      ? Math.round(parseFloat(firstItem.price_per_unit.amount) * firstItem.quantity * 100)
      : 0
    const status = mapFacebookStatus(o.order_status?.state)

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
          status, paymentMethod: 'card', total, placedAt: new Date(),
        },
      })
    } else {
      await prisma.order.update({ where: { id: existing.id }, data: { status, total } })
    }
  }

  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: 'idle' } })
}

function mapFacebookStatus(state: string | undefined): string {
  if (!state) return 'pending'
  if (state === 'CREATED') return 'pending'
  if (state === 'IN_PROGRESS') return 'accepted'
  if (state === 'FULFILLED') return 'delivered'
  if (state === 'CANCELLED') return 'rejected'
  return 'pending'
}

async function syncTikTok(storeId: string, shopId: string, token: string, orgId: string) {
  const orders = await fetchTikTokOrders(shopId, token)

  for (const o of orders) {
    const externalRef = o.order_id
    const customerName = o.recipient_address?.name || 'عميل غير معروف'
    const customerPhone = o.recipient_address?.phone_number || null
    const city = o.recipient_address?.district_info?.[0]?.address_level_name || 'غير محدد'
    const address = o.recipient_address?.full_address || null
    const total = o.payment_info?.total_amount ? Math.round(parseFloat(o.payment_info.total_amount) * 100) : 0
    const paymentMethod = o.payment_info?.payment_method === 'COD' ? 'cod' : 'card'
    const status = mapTikTokStatus(o.order_status)
    const placedAt = o.create_time ? new Date(o.create_time * 1000) : new Date()

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
      await prisma.order.update({ where: { id: existing.id }, data: { status, total } })
    }
  }

  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: 'idle' } })
}

function mapTikTokStatus(status: string): string {
  if (status === 'AWAITING_SHIPMENT') return 'accepted'
  if (status === 'SHIPPED') return 'shipped'
  if (status === 'DELIVERED') return 'delivered'
  if (status === 'CANCELLED') return 'rejected'
  return 'pending'
}

async function syncSalla(storeId: string, sallaStoreId: string, token: string, orgId: string) {
  const orders = await fetchSallaOrders(sallaStoreId, token)

  for (const o of orders) {
    const externalRef = String(o.id)
    const customerName = o.customer?.name || 'عميل غير معروف'
    const customerPhone = o.customer?.mobile || null
    const city = o.shipping?.address?.city || 'غير محدد'
    const total = Math.round((o.total?.amount ?? 0) * 100)
    const status = mapSallaStatus(o.status?.name)

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
          customerName, customerPhone, city, address: null,
          status, paymentMethod: 'cod', total, placedAt: new Date(),
        },
      })
    } else {
      await prisma.order.update({ where: { id: existing.id }, data: { status, total } })
    }
  }

  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: 'idle' } })
}

function mapSallaStatus(statusName: string | undefined): string {
  if (!statusName) return 'pending'
  if (statusName === 'pending' || statusName === 'under_review') return 'pending'
  if (statusName === 'accepted' || statusName === 'in_progress') return 'accepted'
  if (statusName === 'shipping') return 'shipped'
  if (statusName === 'delivered') return 'delivered'
  if (statusName === 'canceled' || statusName === 'refunded') return 'rejected'
  return 'pending'
}

async function syncZid(storeId: string, zidStoreId: string, token: string, orgId: string) {
  const orders = await fetchZidOrders(zidStoreId, token)

  for (const o of orders) {
    const externalRef = String(o.id)
    const customerName = o.customer_name || 'عميل غير معروف'
    const customerPhone = o.customer_mobile || null
    const city = o.city_name || 'غير محدد'
    const total = Math.round((o.total_amount ?? 0) * 100)
    const paymentMethod = o.payment_method === 'cod' ? 'cod' : 'card'
    const status = mapZidStatus(o.status)

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
          customerName, customerPhone, city, address: null,
          status, paymentMethod, total, placedAt: new Date(),
        },
      })
    } else {
      await prisma.order.update({ where: { id: existing.id }, data: { status, total } })
    }
  }

  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: 'idle' } })
}

function mapZidStatus(status: string): string {
  if (status === 'new') return 'pending'
  if (status === 'preparing' || status === 'ready') return 'accepted'
  if (status === 'indelivery') return 'shipped'
  if (status === 'delivered') return 'delivered'
  if (status === 'cancelled') return 'rejected'
  return 'pending'
}

async function syncAmazon(storeId: string, marketplaceId: string, token: string, orgId: string) {
  const orders = await fetchAmazonOrders(marketplaceId, token)

  for (const o of orders) {
    const externalRef = o.AmazonOrderId
    const customerName = o.BuyerInfo?.BuyerName || o.ShippingAddress?.Name || 'عميل غير معروف'
    const customerPhone = o.ShippingAddress?.Phone || null
    const city = o.ShippingAddress?.City || 'غير محدد'
    const address = o.ShippingAddress?.AddressLine1 || null
    const total = o.OrderTotal?.Amount ? Math.round(parseFloat(o.OrderTotal.Amount) * 100) : 0
    const paymentMethod = o.PaymentMethod === 'COD' ? 'cod' : 'card'
    const status = mapAmazonStatus(o.OrderStatus)

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
          status, paymentMethod, total,
          placedAt: o.PurchaseDate ? new Date(o.PurchaseDate) : new Date(),
        },
      })
    } else {
      await prisma.order.update({ where: { id: existing.id }, data: { status, total } })
    }
  }

  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: 'idle' } })
}

function mapAmazonStatus(status: string): string {
  if (status === 'Pending' || status === 'PendingAvailability') return 'pending'
  if (status === 'Unshipped' || status === 'PartiallyShipped') return 'accepted'
  if (status === 'Shipped') return 'shipped'
  if (status === 'InvoiceUnconfirmed') return 'accepted'
  if (status === 'Canceled') return 'rejected'
  if (status === 'Unfulfillable') return 'rejected'
  return 'pending'
}

async function syncNoon(storeId: string, sellerId: string, token: string, orgId: string) {
  const orders = await fetchNoonOrders(sellerId, token)

  for (const o of orders) {
    const externalRef = o.orderNumber
    const customerName = o.customer?.name || o.shippingAddress?.address || 'عميل غير معروف'
    const customerPhone = o.customer?.phone || null
    const city = o.shippingAddress?.city || 'غير محدد'
    const address = o.shippingAddress?.address || null
    const total = o.grandTotal ? Math.round(o.grandTotal * 100) : 0
    const paymentMethod = o.paymentMethod === 'COD' ? 'cod' : 'card'
    const status = mapNoonStatus(o.status)

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
          status, paymentMethod, total,
          placedAt: o.createdAt ? new Date(o.createdAt) : new Date(),
        },
      })
    } else {
      await prisma.order.update({ where: { id: existing.id }, data: { status, total } })
    }
  }

  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: 'idle' } })
}

function mapNoonStatus(status: string): string {
  if (status === 'created' || status === 'CREATED') return 'pending'
  if (status === 'processing' || status === 'PROCESSING') return 'accepted'
  if (status === 'shipped' || status === 'SHIPPED' || status === 'dispatched') return 'shipped'
  if (status === 'delivered' || status === 'DELIVERED') return 'delivered'
  if (status === 'cancelled' || status === 'CANCELLED' || status === 'canceled') return 'rejected'
  return 'pending'
}

async function syncJumia(storeId: string, sellerId: string, token: string, orgId: string) {
  const orders = await fetchJumiaOrders(sellerId, token)

  for (const o of orders) {
    const externalRef = o.OrderId
    const firstName = o.CustomerFirstName || ''
    const lastName = o.CustomerLastName || ''
    const customerName = [firstName, lastName].filter(Boolean).join(' ') || 'عميل غير معروف'
    const customerPhone = o.Phone || null
    const city = o.AddressCity || 'غير محدد'
    const address = o.Address || null
    const total = o.Price ? Math.round(parseFloat(o.Price) * 100) : 0
    const paymentMethod = o.PaymentMethod === 'CashOnDelivery' ? 'cod' : 'card'
    const status = mapJumiaStatus(o.Status)

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
          status, paymentMethod, total,
          placedAt: o.CreatedAt ? new Date(o.CreatedAt) : new Date(),
        },
      })
    } else {
      await prisma.order.update({ where: { id: existing.id }, data: { status, total } })
    }
  }

  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: 'idle' } })
}

function mapJumiaStatus(status: string): string {
  if (status === 'pending' || status === 'processing') return 'pending'
  if (status === 'ready_to_ship' || status === 'handover') return 'accepted'
  if (status === 'shipped' || status === 'in_transit') return 'shipped'
  if (status === 'delivered') return 'delivered'
  if (status === 'canceled' || status === 'returned' || status === 'failed_delivery') return 'rejected'
  return 'pending'
}



async function syncWoo(storeId: string, domain: string, token: string, orgId: string) {
  const orders = await fetchWooOrders(domain, token)
  for (const o of orders) {
    const externalRef = String(o.id)
    const first = o.billing?.first_name || ''
    const last = o.billing?.last_name || ''
    const customerName = [first, last].filter(Boolean).join(' ') || 'عميل غير معروف'
    const customerPhone = o.billing?.phone || null
    const city = o.billing?.city || 'غير محدد'
    const address = o.billing?.address_1 || null
    const total = o.total ? Math.round(parseFloat(o.total) * 100) : 0
    const paymentMethod = o.payment_method?.includes('cod') ? 'cod' : 'card'
    const status = mapWooStatus(o.status)

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
          status, paymentMethod, total,
          placedAt: o.date_created ? new Date(o.date_created) : new Date(),
        },
      })
    } else {
      await prisma.order.update({ where: { id: existing.id }, data: { status, total } })
    }
  }
  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: 'idle' } })
}

function mapWooStatus(status: string): string {
  if (status === 'pending' || status === 'on-hold') return 'pending'
  if (status === 'processing') return 'accepted'
  if (status === 'completed') return 'delivered'
  if (status === 'cancelled' || status === 'refunded' || status === 'failed') return 'rejected'
  return 'pending'
}

async function syncWix(storeId: string, domain: string, token: string, orgId: string) {
  const orders = await fetchWixOrders(domain, token)
  for (const o of orders) {
    const externalRef = o.id
    const contact = o.shippingInfo?.logistics?.shippingDestination?.contactDetails
    const addrObj = o.shippingInfo?.logistics?.shippingDestination?.address
    const first = contact?.firstName || ''
    const last = '' // Wix only gives firstName in contactDetails typically
    const customerName = first || 'عميل غير معروف'
    const customerPhone = contact?.phone || null
    const city = addrObj?.city || 'غير محدد'
    const address = addrObj?.addressLine || null
    const total = o.priceSummary?.total?.amount ? Math.round(parseFloat(o.priceSummary.total.amount) * 100) : 0
    const paymentMethod = o.paymentStatus === 'NOT_PAID' ? 'cod' : 'card'
    const status = mapWixStatus(o.status)

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
          status, paymentMethod, total,
          placedAt: o.createdDate ? new Date(o.createdDate) : new Date(),
        },
      })
    } else {
      await prisma.order.update({ where: { id: existing.id }, data: { status, total } })
    }
  }
  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: 'idle' } })
}

function mapWixStatus(status: string): string {
  if (status === 'PENDING' || status === 'INITIALIZED') return 'pending'
  if (status === 'APPROVED') return 'accepted'
  if (status === 'FULFILLED') return 'delivered'
  if (status === 'CANCELED') return 'rejected'
  return 'pending'
}

async function syncBigCommerce(storeId: string, domain: string, token: string, orgId: string) {
  const orders = await fetchBigCommerceOrders(domain, token)
  for (const o of orders) {
    const externalRef = String(o.id)
    const first = o.billing_address?.first_name || ''
    const last = o.billing_address?.last_name || ''
    const customerName = [first, last].filter(Boolean).join(' ') || 'عميل غير معروف'
    const customerPhone = o.billing_address?.phone || null
    const city = o.billing_address?.city || 'غير محدد'
    const address = o.billing_address?.street_1 || null
    const total = o.total_inc_tax ? Math.round(parseFloat(o.total_inc_tax) * 100) : 0
    const paymentMethod = o.payment_method?.toLowerCase().includes('cash') ? 'cod' : 'card'
    const status = mapBigCommerceStatus(o.status)

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
          status, paymentMethod, total,
          placedAt: o.date_created ? new Date(o.date_created) : new Date(),
        },
      })
    } else {
      await prisma.order.update({ where: { id: existing.id }, data: { status, total } })
    }
  }
  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: 'idle' } })
}

function mapBigCommerceStatus(status: string): string {
  if (status === 'Pending' || status === 'Awaiting Payment') return 'pending'
  if (status === 'Awaiting Fulfillment' || status === 'Awaiting Shipment' || status === 'Awaiting Pickup') return 'accepted'
  if (status === 'Shipped' || status === 'Partially Shipped') return 'shipped'
  if (status === 'Completed' || status === 'Delivered') return 'delivered'
  if (status === 'Cancelled' || status === 'Declined' || status === 'Refunded') return 'rejected'
  return 'pending'
}

async function syncEcwid(storeId: string, domain: string, token: string, orgId: string) {
  const orders = await fetchEcwidOrders(domain, token)
  for (const o of orders) {
    const externalRef = String(o.id)
    const customerName = o.shippingPerson?.name || 'عميل غير معروف'
    const customerPhone = o.shippingPerson?.phone || null
    const city = o.shippingPerson?.city || 'غير محدد'
    const address = o.shippingPerson?.street || null
    const total = o.total ? Math.round(o.total * 100) : 0
    const paymentMethod = o.paymentMethod?.toLowerCase().includes('cash') ? 'cod' : 'card'
    const status = mapEcwidStatus(o.fulfillmentStatus)

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
          status, paymentMethod, total,
          placedAt: o.createDate ? new Date(o.createDate) : new Date(),
        },
      })
    } else {
      await prisma.order.update({ where: { id: existing.id }, data: { status, total } })
    }
  }
  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: 'idle' } })
}

function mapEcwidStatus(status: string): string {
  if (status === 'AWAITING_PROCESSING' || status === 'NEW') return 'pending'
  if (status === 'PROCESSING') return 'accepted'
  if (status === 'SHIPPED') return 'shipped'
  if (status === 'DELIVERED') return 'delivered'
  if (status === 'WILL_NOT_DELIVER' || status === 'RETURNED') return 'rejected'
  return 'pending'
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
