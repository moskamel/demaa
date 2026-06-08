// Store sync job — full initial sync of orders, products, and customers
// for any OAuth-connected platform (Salla, Zid, Shopify, …).
//
// Usage:
//   import { syncStore } from '../jobs/storeSync.js'
//   syncStore(storeId, 'salla').catch(console.error)
//
// The job runs in the background (fire-and-forget from the caller).
// It uses PlatformIntegration so every platform is handled identically.

import prisma from '../lib/prisma.js'
import { withTokenRefresh } from '../middleware/tokenRefresh.js'
import { getPlatformIntegration, isValidPlatform } from '../lib/platforms/registry.js'
import type { Platform, UnifiedOrder, UnifiedProduct, UnifiedCustomer } from '../lib/platforms/types.js'

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Full store sync: orders → products → customers.
 * Safe to call multiple times — uses upsert throughout.
 */
export async function syncStore(storeId: string, platform: Platform): Promise<void> {
  if (!isValidPlatform(platform)) throw new Error(`Unknown platform: ${platform}`)

  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) throw new Error(`Store not found: ${storeId}`)

  console.log(`[syncStore] starting ${platform} sync for store ${storeId}`)

  await prisma.store.update({
    where: { id: storeId },
    data: { syncStatus: 'syncing' },
  })

  try {
    await syncOrders(storeId, platform, store.organizationId)
    await syncProducts(storeId, platform)
    await syncCustomers(storeId, platform, store.organizationId)

    await prisma.store.update({
      where: { id: storeId },
      data: { syncStatus: 'idle', lastSyncAt: new Date() },
    })

    const platformLabel = platformName(platform)
    await createNotification(store.organizationId, 'sync_complete', 'info',
      `تم مزامنة متجر ${platformLabel} بنجاح ✅`,
      `تمت مزامنة الطلبات والمنتجات والعملاء`,
    )

    console.log(`[syncStore] ${platform} sync complete for store ${storeId}`)
  } catch (err) {
    console.error(`[syncStore] ${platform} sync failed for store ${storeId}:`, err)
    await prisma.store.update({
      where: { id: storeId },
      data: { syncStatus: 'error' },
    }).catch(() => {})
    // Schedule retry in 5 minutes (fire-and-forget)
    setTimeout(() => retrySync(storeId, platform), 5 * 60 * 1000)
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────

async function syncOrders(storeId: string, platform: Platform, orgId: string): Promise<void> {
  const integration = getPlatformIntegration(platform)
  let page = 1
  let total = 0

  while (true) {
    const orders = await withTokenRefresh(storeId, (token) =>
      integration.getOrders(token, { page, limit: 50 }),
    )
    if (!orders.length) break

    for (const order of orders) {
      await upsertOrder(storeId, orgId, order)
      total++
    }

    if (orders.length < 50) break
    page++
  }

  console.log(`[syncStore:orders] upserted ${total} orders for store ${storeId}`)
}

async function upsertOrder(storeId: string, orgId: string, order: UnifiedOrder): Promise<void> {
  // Resolve or create customer
  let customerId: string | null = null
  if (order.customerPhone || order.customerName) {
    const customer = await resolveCustomer(orgId, {
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail,
      city: order.city,
    })
    customerId = customer.id
  }

  const existing = await prisma.order.findFirst({
    where: { storeId, externalRef: order.externalId },
  })

  const data = {
    customerName: order.customerName,
    customerPhone: order.customerPhone ?? null,
    city: order.city,
    address: order.address ?? null,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: order.total,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    discount: order.discount,
    currency: order.currency,
    notes: order.notes ?? null,
    placedAt: order.externalCreatedAt,
    customerId,
  }

  if (!existing) {
    await prisma.order.create({
      data: {
        ...data,
        storeId,
        externalRef: order.externalId,
        // Risk scoring: COD + new customer + high value
        riskScore: computeRiskScore(order),
      },
    })
  } else {
    await prisma.order.update({
      where: { id: existing.id },
      data: { status: data.status, total: data.total, paymentStatus: data.paymentStatus },
    })
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────

async function syncProducts(storeId: string, platform: Platform): Promise<void> {
  const integration = getPlatformIntegration(platform)
  let page = 1
  let total = 0

  while (true) {
    const products = await withTokenRefresh(storeId, (token) =>
      integration.getProducts(token, { page, limit: 50 }),
    )
    if (!products.length) break

    for (const product of products) {
      await upsertProduct(storeId, product)
      total++
    }

    if (products.length < 50) break
    page++
  }

  console.log(`[syncStore:products] upserted ${total} products for store ${storeId}`)
}

async function upsertProduct(storeId: string, product: UnifiedProduct): Promise<void> {
  const data = {
    name: product.name,
    description: product.description ?? null,
    sku: product.sku ?? null,
    price: product.price,
    comparePrice: product.comparePrice ?? null,
    stock: product.stock,
    category: product.category ?? null,
    imageUrl: product.imageUrl ?? null,
    isActive: product.isActive,
  }

  await prisma.product.upsert({
    where: { storeId_name: { storeId, name: product.name } },
    create: { ...data, storeId },
    update: data,
  })
}

// ─── Customers ────────────────────────────────────────────────────────────────

async function syncCustomers(storeId: string, platform: Platform, orgId: string): Promise<void> {
  const integration = getPlatformIntegration(platform)
  let page = 1
  let total = 0

  while (true) {
    const customers = await withTokenRefresh(storeId, (token) =>
      integration.getCustomers(token, { page, limit: 50 }),
    )
    if (!customers.length) break

    for (const customer of customers) {
      await upsertPlatformCustomer(orgId, customer)
      total++
    }

    if (customers.length < 50) break
    page++
  }

  console.log(`[syncStore:customers] upserted ${total} customers for store ${storeId}`)
}

async function upsertPlatformCustomer(orgId: string, customer: UnifiedCustomer): Promise<void> {
  const existing = customer.phone
    ? await prisma.customer.findFirst({ where: { organizationId: orgId, phone: customer.phone } })
    : await prisma.customer.findFirst({ where: { organizationId: orgId, name: customer.name } })

  const segment = customer.totalOrders > 5
    ? 'vip'
    : customer.totalOrders > 1
      ? 'returning'
      : 'new'

  if (!existing) {
    await prisma.customer.create({
      data: {
        organizationId: orgId,
        name: customer.name,
        phone: customer.phone ?? null,
        email: customer.email ?? null,
        city: customer.city ?? null,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        segment,
      },
    })
  } else {
    await prisma.customer.update({
      where: { id: existing.id },
      data: {
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        segment,
      },
    })
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function resolveCustomer(
  orgId: string,
  data: { name: string; phone?: string | null; email?: string | null; city?: string },
): Promise<{ id: string }> {
  let customer = data.phone
    ? await prisma.customer.findFirst({ where: { organizationId: orgId, phone: data.phone } })
    : null

  if (!customer && data.name) {
    customer = await prisma.customer.findFirst({ where: { organizationId: orgId, name: data.name } })
  }

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        organizationId: orgId,
        name: data.name || 'عميل غير معروف',
        phone: data.phone ?? null,
        email: data.email ?? null,
        city: data.city ?? null,
      },
    })
  }

  return { id: customer.id }
}

function computeRiskScore(order: UnifiedOrder): number {
  let score = 0
  if (order.paymentMethod === 'cod') score += 30
  if (order.total > 50000) score += 30  // > 500 SAR
  if (!order.customerPhone) score += 20
  return Math.min(score, 100)
}

async function createNotification(
  orgId: string,
  type: string,
  priority: string,
  title: string,
  body: string,
): Promise<void> {
  await prisma.notification.create({
    data: { organizationId: orgId, type, priority, title, body },
  }).catch(() => {})
}

function platformName(platform: Platform): string {
  const names: Partial<Record<Platform, string>> = {
    salla: 'سلة',
    zid: 'زد',
    shopify: 'Shopify',
    woocommerce: 'WooCommerce',
  }
  return names[platform] ?? platform
}

async function retrySync(storeId: string, platform: Platform): Promise<void> {
  const store = await prisma.store.findUnique({ where: { id: storeId } }).catch(() => null)
  if (!store || store.syncStatus === 'syncing') return
  console.log(`[syncStore] retrying sync for store ${storeId}`)
  await syncStore(storeId, platform).catch((err) =>
    console.error(`[syncStore] retry failed for store ${storeId}:`, err),
  )
}
