// Tool executor — runs AI tool calls against the real database
import prisma from '../prisma.js'
import { trackShipment } from '../platforms/shipTracking.js'

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
          summary: `إنشاء كوبون ${coupon.code} — ${type === 'percentage' ? value + '%' : value + ' ر.س'} خصم`,
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

    case 'create_return': {
      const { orderId, reason, refundAmount, restockItems = true } = input as {
        orderId: string; reason: string; refundAmount?: number; restockItems?: boolean
      }
      const order = await prisma.order.findFirst({ where: { id: orderId }, include: { items: true } })
      if (!order) return { error: `الطلب ${orderId} غير موجود` }

      const ret = await (prisma as any).return.create({
        data: {
          orderId,
          organizationId: orgId,
          reason,
          refundAmount: refundAmount ? Math.round(refundAmount * 100) : order.total,
          restockItems,
          status: 'approved',
        },
      })

      if (restockItems) {
        for (const item of order.items) {
          if (item.productId) {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.qty } },
            })
          }
        }
      }

      await prisma.order.update({ where: { id: orderId }, data: { status: 'returned' } })

      await prisma.activityLog.create({
        data: {
          organizationId: orgId,
          userId: ctx.userId,
          action: 'create_return',
          entity: 'order',
          entityId: orderId,
          summary: `إرجاع الطلب #${order.externalRef || orderId} — ${reason}`,
        },
      })

      return { returnId: ret.id, refundAmount: ret.refundAmount / 100, restocked: restockItems }
    }

    case 'get_returns': {
      const { status, limit = 20 } = input as { status?: string; limit?: number }
      const where: Record<string, unknown> = { organizationId: orgId }
      if (status && status !== 'all') where.status = status
      const returns = await (prisma as any).return.findMany({
        where,
        include: { order: true },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      })
      return { returns, count: returns.length }
    }

    case 'get_profit_report': {
      const { period = '30d' } = input as { period?: string }
      const days = period === 'today' ? 0 : period === '7d' ? 7 : period === '30d' ? 30 : 90
      const since = new Date()
      if (days > 0) since.setDate(since.getDate() - days)
      else since.setHours(0, 0, 0, 0)

      const where: Record<string, unknown> = {
        placedAt: { gte: since },
        status: { in: ['accepted', 'shipped', 'delivered'] },
      }
      if (storeId) where.storeId = storeId

      const orders = await prisma.order.findMany({ where, include: { items: { include: { product: true } } } })

      let totalRevenue = 0, totalCost = 0, totalShipping = 0
      for (const order of orders) {
        totalRevenue += order.subtotal
        totalShipping += order.shippingFee
        for (const item of order.items) {
          const costPrice = (item.product as any)?.costPrice ?? 0
          totalCost += costPrice * item.qty
        }
      }

      const grossProfit = totalRevenue - totalCost
      const netProfit = grossProfit - totalShipping
      const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0

      return {
        period,
        totalRevenue: totalRevenue / 100,
        totalCost: totalCost / 100,
        totalShipping: totalShipping / 100,
        grossProfit: grossProfit / 100,
        netProfit: netProfit / 100,
        marginPercent: margin,
        ordersCount: orders.length,
        note: totalCost === 0 ? 'لم يتم إدخال تكلفة المنتجات بعد — أضف costPrice لكل منتج للحصول على أرباح دقيقة' : undefined,
      }
    }

    case 'analyze_customers': {
      const now = new Date()
      const d30 = new Date(now); d30.setDate(d30.getDate() - 30)
      const d60 = new Date(now); d60.setDate(d60.getDate() - 60)

      const all = await prisma.customer.findMany({ where: { organizationId: orgId } })

      const churnRisk = all.filter(c => c.lastOrderAt && c.lastOrderAt < d60 && c.totalOrders > 1)
      const newOneTime = all.filter(c => c.totalOrders === 1 && c.createdAt > d30)
      const vip = all.filter(c => c.totalOrders >= 5 || c.totalSpent >= 100000)
      const activeRecent = all.filter(c => c.lastOrderAt && c.lastOrderAt > d30)
      const topSpenders = [...all].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5)

      return {
        total: all.length,
        churnRisk: {
          count: churnRisk.length,
          customers: churnRisk.slice(0, 5).map(c => ({ id: c.id, name: c.name, lastOrderAt: c.lastOrderAt, totalSpent: c.totalSpent / 100 })),
        },
        newOneTime: { count: newOneTime.length, note: 'اشتروا مرة واحدة فقط — يحتاجون متابعة وعرض لإعادة الشراء' },
        vip: {
          count: vip.length,
          customers: vip.slice(0, 5).map(c => ({ id: c.id, name: c.name, totalOrders: c.totalOrders, totalSpent: c.totalSpent / 100 })),
        },
        activeRecent: activeRecent.length,
        topSpenders: topSpenders.map(c => ({ name: c.name, totalSpent: c.totalSpent / 100, totalOrders: c.totalOrders })),
      }
    }

    case 'inventory_report': {
      const where: Record<string, unknown> = { isActive: true }
      if (storeId) where.storeId = storeId
      const products = await prisma.product.findMany({ where })

      const outOfStock = products.filter(p => p.stock === 0)
      const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.lowStockAlert)
      const healthy = products.filter(p => p.stock > p.lowStockAlert)

      const since = new Date(); since.setDate(since.getDate() - 30)
      const recentItems = await prisma.orderItem.findMany({
        where: { order: { placedAt: { gte: since }, status: { in: ['accepted', 'shipped', 'delivered'] } } },
      })

      const salesRate: Record<string, number> = {}
      for (const item of recentItems) {
        if (item.productId) salesRate[item.productId] = (salesRate[item.productId] || 0) + item.qty
      }

      const restockAlerts = lowStock.map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        dailySales: Math.round((salesRate[p.id] || 0) / 30 * 10) / 10,
        daysLeft: salesRate[p.id] ? Math.floor(p.stock / (salesRate[p.id] / 30)) : 99,
      })).sort((a, b) => a.daysLeft - b.daysLeft)

      return {
        total: products.length,
        outOfStock: { count: outOfStock.length, products: outOfStock.map(p => ({ id: p.id, name: p.name, sku: p.sku })) },
        lowStock: { count: lowStock.length, alerts: restockAlerts },
        healthy: healthy.length,
        totalInventoryValue: products.reduce((s, p) => s + p.stock * p.price, 0) / 100,
      }
    }

    case 'sales_forecast': {
      const weeks: { week: string; revenue: number; orders: number }[] = []
      const now = new Date()

      for (let w = 11; w >= 0; w--) {
        const start = new Date(now); start.setDate(start.getDate() - (w + 1) * 7)
        const end = new Date(now); end.setDate(end.getDate() - w * 7)
        const where: Record<string, unknown> = {
          placedAt: { gte: start, lt: end },
          status: { in: ['accepted', 'shipped', 'delivered'] },
        }
        if (storeId) where.storeId = storeId
        const orders = await prisma.order.findMany({ where })
        weeks.push({
          week: `أسبوع ${12 - w}`,
          revenue: orders.reduce((s, o) => s + o.total, 0) / 100,
          orders: orders.length,
        })
      }

      const recent = weeks.slice(-4)
      const weights = [1, 2, 3, 4]
      const totalWeight = 10
      const forecastRevenue = recent.reduce((s, w, i) => s + w.revenue * weights[i], 0) / totalWeight
      const forecastOrders = recent.reduce((s, w, i) => s + w.orders * weights[i], 0) / totalWeight

      const first = weeks[0].revenue || 1
      const last = weeks[weeks.length - 1].revenue
      const trend = Math.round(((last - first) / first) * 100)

      return {
        weeklyHistory: weeks.slice(-6),
        nextWeekForecast: { revenue: Math.round(forecastRevenue), orders: Math.round(forecastOrders) },
        trend,
        trendLabel: trend > 10 ? 'صاعد 📈' : trend < -10 ? 'هابط 📉' : 'مستقر ➡️',
      }
    }

    case 'restock_product': {
      const { productId, addQty, newStock } = input as { productId: string; addQty?: number; newStock?: number }
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) return { error: `المنتج ${productId} غير موجود` }

      const oldStock = product.stock
      const updatedStock = newStock !== undefined ? newStock : oldStock + (addQty || 0)

      await prisma.product.update({ where: { id: productId }, data: { stock: updatedStock } })

      await prisma.activityLog.create({
        data: {
          organizationId: orgId,
          userId: ctx.userId,
          action: 'restock_product',
          entity: 'product',
          entityId: productId,
          summary: `تجديد مخزون "${product.name}": ${oldStock} → ${updatedStock}`,
        },
      })

      return { productId, name: product.name, oldStock, newStock: updatedStock, added: updatedStock - oldStock }
    }

    case 'track_shipment': {
      const { trackingNumber, carrier, orderId } = input as {
        trackingNumber?: string; carrier?: string; orderId?: string
      }

      // Resolve from orderId if no tracking number given
      let tn = trackingNumber
      let c = carrier || 'aramex'

      if (!tn && orderId) {
        const shipment = await prisma.shipment.findFirst({
          where: { orderId },
          orderBy: { createdAt: 'desc' },
        })
        if (!shipment) return { error: `لا توجد شحنة للطلب ${orderId}` }
        tn = shipment.trackingNumber || undefined
        c = shipment.carrier
      }

      if (!tn) return { error: 'رقم التتبع مطلوب' }

      const result = await trackShipment(tn, c)

      // Update shipment status in DB
      await prisma.shipment.updateMany({
        where: { trackingNumber: tn },
        data: {
          status: result.status,
          lastEvent: result.lastEvent || undefined,
          lastEventAt: result.lastEventAt ? new Date(result.lastEventAt) : undefined,
          updatedAt: new Date(),
        },
      })

      // If delivered, update order status
      if (result.status === 'delivered') {
        const shipment = await prisma.shipment.findFirst({ where: { trackingNumber: tn } })
        if (shipment) {
          await prisma.order.update({ where: { id: shipment.orderId }, data: { status: 'delivered' } })
        }
      }

      return result
    }

    case 'get_failed_deliveries': {
      const { limit = 20 } = input as { limit?: number }

      const failedShipments = await prisma.shipment.findMany({
        where: { status: { in: ['failed', 'returned'] } },
        include: { order: true },
        orderBy: { updatedAt: 'desc' },
        take: Number(limit),
      })

      // Also get orders shipped > 10 days ago still not delivered
      const tenDaysAgo = new Date(); tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
      const stuckOrders = await prisma.order.findMany({
        where: {
          status: 'shipped',
          updatedAt: { lt: tenDaysAgo },
          ...(storeId && { storeId }),
        },
        include: { shipments: true },
        take: 10,
      })

      return {
        failed: failedShipments.map(s => ({
          trackingNumber: s.trackingNumber,
          carrier: s.carrier,
          status: s.status,
          orderId: s.orderId,
          customerName: s.order.customerName,
          city: s.order.city,
        })),
        stuck: stuckOrders.map(o => ({
          orderId: o.id,
          customerName: o.customerName,
          city: o.city,
          trackingNumber: o.shipments[0]?.trackingNumber,
          carrier: o.shipments[0]?.carrier,
          daysSinceShipped: Math.floor((Date.now() - o.updatedAt.getTime()) / 86400000),
        })),
        totalIssues: failedShipments.length + stuckOrders.length,
      }
    }

    default:
      return { error: `أداة غير معروفة: ${name}` }
  }
}
