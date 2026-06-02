// Tool executor — runs AI tool calls against the real database
import prisma from '../prisma.js'

interface ToolContext {
  orgId: string
  storeId?: string
  userId?: string
}

export async function executeTool(name: string, input: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const { orgId } = ctx

  // Get first active store for org
  const store = await prisma.store.findFirst({ where: { organizationId: orgId, isActive: true } })
  const storeId = ctx.storeId || store?.id

  switch (name) {

    case 'get_orders': {
      const { status, city, payment, limit = 20, riskMin } = input as {
        status?: string; city?: string; payment?: string; limit?: number; riskMin?: number
      }
      const where: Record<string, unknown> = {}
      if (storeId) where.storeId = storeId
      if (status && status !== 'all') where.status = status
      if (city) where.city = { contains: city }
      if (payment) where.paymentMethod = payment
      if (riskMin) where.riskScore = { gte: riskMin }

      const orders = await prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { placedAt: 'desc' },
        take: Number(limit),
      })
      return { orders, count: orders.length }
    }

    case 'accept_orders': {
      const { orderIds } = input as { orderIds: string[] }
      const where: Record<string, unknown> = { id: { in: orderIds }, status: 'pending' }
      if (storeId) where.storeId = storeId

      await prisma.order.updateMany({
        where,
        data: { status: 'accepted', acceptedAt: new Date() },
      })

      // Log activity
      await prisma.activityLog.create({
        data: {
          organizationId: orgId,
          userId: ctx.userId,
          action: 'accept_orders',
          entity: 'order',
          summary: `قبول ${orderIds.length} طلب`,
          after: JSON.stringify(orderIds),
        },
      })

      // Create notifications
      await prisma.notification.create({
        data: {
          organizationId: orgId,
          type: 'ORDER_UPDATE',
          priority: 'info',
          title: `تم قبول ${orderIds.length} طلب`,
          body: `معرّفات: ${orderIds.join(', ')}`,
        },
      })

      return { accepted: orderIds.length, orderIds }
    }

    case 'reject_order': {
      const { orderId, reason } = input as { orderId: string; reason?: string }
      const order = await prisma.order.findFirst({
        where: { id: orderId, ...(storeId && { storeId }) },
      })
      if (!order) return { error: `الطلب ${orderId} غير موجود` }

      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'rejected', rejectionReason: reason || 'رفض من المتجر', rejectedAt: new Date() },
      })

      await prisma.activityLog.create({
        data: {
          organizationId: orgId,
          action: 'reject_order',
          entity: 'order',
          entityId: orderId,
          summary: `رفض الطلب #${order.externalRef || orderId}${reason ? ` — ${reason}` : ''}`,
        },
      })

      return { rejected: orderId }
    }

    case 'create_shipments': {
      const { orderIds, carrier = 'smsa' } = input as { orderIds: string[]; carrier?: string }
      const trackingBase = Math.floor(Math.random() * 9000000000) + 1000000000
      const created: string[] = []

      for (let i = 0; i < orderIds.length; i++) {
        const order = await prisma.order.findFirst({
          where: { id: orderIds[i], status: 'accepted' },
        })
        if (!order) continue

        const trackingNumber = `${carrier.toUpperCase()}${trackingBase + i}`
        const shipment = await prisma.shipment.create({
          data: { orderId: order.id, carrier, trackingNumber, status: 'created' },
        })

        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'shipped', shipmentId: trackingNumber },
        })

        created.push(trackingNumber)
      }

      await prisma.activityLog.create({
        data: {
          organizationId: orgId,
          action: 'create_shipments',
          entity: 'shipment',
          summary: `إنشاء ${created.length} شحنة عبر ${carrier}`,
          after: JSON.stringify(created),
        },
      })

      return { created: created.length, trackingNumbers: created, carrier }
    }

    case 'get_products': {
      const { lowStock, category, limit = 30 } = input as { lowStock?: boolean; category?: string; limit?: number }
      const where: Record<string, unknown> = { isActive: true }
      if (storeId) where.storeId = storeId
      if (category) where.category = category
      let products
      if (lowStock) {
        products = await prisma.product.findMany({
          where: { ...(storeId && { storeId }), isActive: true, stock: { lt: 5 } },
          orderBy: { stock: 'asc' },
          take: Number(limit),
        })
        // refine: stock < lowStockAlert per product
        const all = await prisma.product.findMany({ where: { ...(storeId && { storeId }), isActive: true }, take: 200 })
        products = all.filter((p: any) => p.stock < p.lowStockAlert).slice(0, Number(limit))
      } else {
        products = await prisma.product.findMany({
          where,
          orderBy: { name: 'asc' },
          take: Number(limit),
        })
      }
      return { products, count: (products as unknown[]).length }
    }

    case 'update_product': {
      const { productId, price, stock, percentChange } = input as {
        productId: string; price?: number; stock?: number; percentChange?: number
      }

      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) return { error: `المنتج ${productId} غير موجود` }

      const updateData: Record<string, unknown> = {}
      if (price !== undefined) updateData.price = Math.round(price * 100)
      if (stock !== undefined) updateData.stock = stock
      if (percentChange !== undefined) {
        updateData.price = Math.round(product.price * (1 + percentChange / 100))
      }

      const updated = await prisma.product.update({ where: { id: productId }, data: updateData })

      await prisma.activityLog.create({
        data: {
          organizationId: orgId,
          action: 'update_product',
          entity: 'product',
          entityId: productId,
          summary: `تحديث منتج "${product.name}"`,
          before: JSON.stringify({ price: product.price, stock: product.stock }),
          after: JSON.stringify(updateData),
        },
      })

      return { updated: productId, product: updated }
    }

    case 'bulk_update_prices': {
      const { percentChange, category, productIds } = input as {
        percentChange: number; category?: string; productIds?: string[]
      }

      const where: Record<string, unknown> = { isActive: true }
      if (storeId) where.storeId = storeId
      if (category) where.category = category
      if (productIds?.length) where.id = { in: productIds }

      const products = await prisma.product.findMany({ where })
      let updated = 0
      for (const p of products) {
        await prisma.product.update({
          where: { id: p.id },
          data: { price: Math.round(p.price * (1 + percentChange / 100)) },
        })
        updated++
      }

      await prisma.activityLog.create({
        data: {
          organizationId: orgId,
          action: 'bulk_update_prices',
          entity: 'product',
          summary: `تحديث أسعار ${updated} منتج بنسبة ${percentChange}%`,
        },
      })

      return { updated, percentChange }
    }

    case 'get_analytics': {
      const { period = '30d' } = input as { period?: string }
      const days = period === 'today' ? 0 : period === 'week' ? 7 : period === 'month' ? 30 : period === '7d' ? 7 : period === '30d' ? 30 : 90
      const since = new Date()
      if (days > 0) since.setDate(since.getDate() - days)
      else since.setHours(0, 0, 0, 0)

      const where: Record<string, unknown> = { placedAt: { gte: since } }
      if (storeId) where.storeId = storeId

      const orders = await prisma.order.findMany({ where })
      const completedOrders = orders.filter(o => ['accepted', 'shipped', 'delivered'].includes(o.status))
      const totalRevenue = completedOrders.reduce((s, o) => s + o.total, 0)
      const pendingCount = orders.filter(o => o.status === 'pending').length
      const rejectedCount = orders.filter(o => o.status === 'rejected').length

      // City breakdown
      const cityMap: Record<string, { orders: number; revenue: number }> = {}
      orders.forEach(o => {
        if (!cityMap[o.city]) cityMap[o.city] = { orders: 0, revenue: 0 }
        cityMap[o.city].orders++
        if (['accepted', 'shipped', 'delivered'].includes(o.status)) cityMap[o.city].revenue += o.total
      })
      const topCities = Object.entries(cityMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5)

      return {
        period,
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        pendingOrders: pendingCount,
        rejectedOrders: rejectedCount,
        totalRevenue: totalRevenue / 100,
        avgOrderValue: completedOrders.length ? Math.round(totalRevenue / completedOrders.length) / 100 : 0,
        rejectionRate: orders.length ? Math.round((rejectedCount / orders.length) * 100) : 0,
        topCities,
      }
    }

    case 'create_coupon': {
      const { code, type, value, minOrder, maxUsage, expiresInDays } = input as {
        code: string; type: string; value: number; minOrder?: number; maxUsage?: number; expiresInDays?: number
      }

      const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : undefined

      const coupon = await prisma.coupon.create({
        data: {
          organizationId: orgId,
          code: code.toUpperCase(),
          type,
          value: Math.round(value * 100),
          minOrder: minOrder ? Math.round(minOrder * 100) : undefined,
          maxUsage,
          expiresAt,
        },
      })

      await prisma.activityLog.create({
        data: {
          organizationId: orgId,
          action: 'create_coupon',
          entity: 'coupon',
          entityId: coupon.id,
          summary: `إنشاء كوبون ${coupon.code} — ${type === 'percentage' ? value + '%' : value + ' ج.م'} خصم`,
        },
      })

      return { coupon: { ...coupon, code: coupon.code } }
    }

    case 'get_customers': {
      const { segment, city, limit = 20 } = input as { segment?: string; city?: string; limit?: number }
      const where: Record<string, unknown> = { organizationId: orgId }
      if (segment && segment !== 'all') where.segment = segment
      if (city) where.city = { contains: city }

      const customers = await prisma.customer.findMany({
        where,
        orderBy: { totalSpent: 'desc' },
        take: Number(limit),
      })
      return { customers, count: customers.length }
    }

    case 'get_notifications': {
      const { unreadOnly = false, limit = 10 } = input as { unreadOnly?: boolean; limit?: number }
      const notifications = await prisma.notification.findMany({
        where: { organizationId: orgId, ...(unreadOnly && { isRead: false }) },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      })
      return { notifications, count: notifications.length }
    }

    case 'get_ai_memory': {
      const memory = await prisma.aiMemory.findMany({
        where: { organizationId: orgId },
        orderBy: { confidence: 'desc' },
      })
      return { memory }
    }

    default:
      return { error: `أداة غير معروفة: ${name}` }
  }
}
