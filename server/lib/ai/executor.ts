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
          summary: `إنشاء كوبون ${coupon.code} — ${type === 'percentage' ? value + '%' : value + ' $'} خصم`,
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

    case 'create_product': {
      const { name, price, stock = 0, category, description, sku, costPrice } = input as {
        name: string; price: number; stock?: number; category?: string
        description?: string; sku?: string; costPrice?: number
      }
      if (!name || !price) return { error: 'اسم المنتج والسعر مطلوبان' }
      if (!storeId) return { error: 'لا يوجد متجر مرتبط' }

      const product = await prisma.product.create({
        data: {
          storeId,
          name,
          price: Math.round(price * 100),
          stock,
          category,
          description,
          sku,
          ...(costPrice && { costPrice: Math.round(costPrice * 100) }),
          isActive: true,
        },
      })

      await prisma.activityLog.create({
        data: {
          organizationId: orgId, userId: ctx.userId,
          action: 'create_product', entity: 'product', entityId: product.id,
          summary: `إضافة منتج جديد: ${name} — ${price} ريال`,
        },
      })

      return { product: { id: product.id, name: product.name, price: product.price / 100, stock: product.stock } }
    }

    case 'send_customer_message': {
      const { customerId, customerName, message, channel = 'whatsapp' } = input as {
        customerId?: string; customerName?: string; message: string; channel?: string
      }

      await prisma.activityLog.create({
        data: {
          organizationId: orgId, userId: ctx.userId,
          action: 'send_message', entity: 'customer', entityId: customerId ?? 'unknown',
          summary: `رسالة ${channel} لـ ${customerName ?? customerId}: ${message.slice(0, 80)}`,
        },
      })

      return {
        drafted: true,
        channel,
        customerName: customerName ?? customerId,
        message,
        note: 'لإرسال حقيقي اربط WhatsApp Business API من الإعدادات',
      }
    }

    case 'create_order': {
      const { customerName, customerPhone, city, items, paymentMethod = 'cash', notes } = input as {
        customerName: string; customerPhone?: string; city: string
        items: Array<{ productId?: string; name: string; qty: number; unitPrice: number }>
        paymentMethod?: string; notes?: string
      }
      if (!storeId) return { error: 'لا يوجد متجر مرتبط' }

      let customer = customerPhone
        ? await prisma.customer.findFirst({ where: { organizationId: orgId, phone: customerPhone } })
        : null

      if (!customer) {
        customer = await prisma.customer.create({
          data: { organizationId: orgId, name: customerName, phone: customerPhone, city, segment: 'new' },
        })
      }

      const subtotal = (items as any[]).reduce((s: number, i: any) => s + i.qty * Math.round(i.unitPrice * 100), 0)
      const shippingFee = 1500
      const total = subtotal + shippingFee
      const externalRef = String(Date.now()).slice(-6)

      const order = await prisma.order.create({
        data: {
          storeId,
          customerId: customer.id,
          externalRef,
          customerName,
          customerPhone: customerPhone ?? '',
          city,
          status: 'pending',
          paymentMethod,
          paymentStatus: 'pending',
          subtotal,
          shippingFee,
          total,
          notes,
          isNewCustomer: true,
          items: {
            create: (items as any[]).map((i: any) => ({
              productId: i.productId ?? null,
              name: i.name,
              qty: i.qty,
              unitPrice: Math.round(i.unitPrice * 100),
              totalPrice: i.qty * Math.round(i.unitPrice * 100),
            })),
          },
        },
      })

      await prisma.activityLog.create({
        data: {
          organizationId: orgId, userId: ctx.userId,
          action: 'create_order', entity: 'order', entityId: order.id,
          summary: `طلب يدوي جديد #${externalRef} للعميل ${customerName} — ${total / 100} ريال`,
        },
      })

      return { order: { id: order.id, externalRef, customerName, city, total: total / 100, status: 'pending' } }
    }

    case 'get_team': {
      const memberships = await prisma.teamMembership.findMany({
        where: { organizationId: orgId },
        include: { user: { select: { id: true, name: true, email: true, lastLoginAt: true } } },
        orderBy: { createdAt: 'asc' },
      })
      return {
        members: memberships.map(m => ({
          id: m.id,
          name: m.user.name,
          email: m.user.email,
          role: m.role,
          lastActive: m.user.lastLoginAt,
          joinedAt: m.createdAt,
        })),
        count: memberships.length,
      }
    }

    case 'invite_team_member': {
      const { email, role = 'ORDER_MANAGER' } = input as { email: string; role?: string }
      const VALID_ROLES = ['ADMIN', 'ORDER_MANAGER', 'CUSTOMER_SERVICE']
      if (!VALID_ROLES.includes(role)) return { error: 'دور غير صالح' }

      let user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        const bcrypt = await import('bcryptjs')
        const tempPassword = Math.random().toString(36).slice(2, 10)
        const passwordHash = await bcrypt.hash(tempPassword, 12)
        user = await prisma.user.create({ data: { name: email.split('@')[0], email, passwordHash } })
      }

      const existing = await prisma.teamMembership.findUnique({
        where: { organizationId_userId: { organizationId: orgId, userId: user.id } },
      })
      if (existing) return { error: 'هذا المستخدم عضو بالفعل في الفريق' }

      const membership = await prisma.teamMembership.create({
        data: { organizationId: orgId, userId: user.id, role },
      })

      await prisma.activityLog.create({
        data: {
          organizationId: orgId, userId: ctx.userId,
          action: 'invite_member', entity: 'team', entityId: membership.id,
          summary: `دعوة عضو جديد: ${email} بدور ${role}`,
        },
      })

      return { member: { id: membership.id, email, role, isNew: !existing } }
    }

    case 'remove_team_member': {
      const { memberId, memberEmail } = input as { memberId?: string; memberEmail?: string }
      let membership: any = null
      if (memberId) {
        membership = await prisma.teamMembership.findFirst({ where: { id: memberId, organizationId: orgId } })
      } else if (memberEmail) {
        const user = await prisma.user.findUnique({ where: { email: memberEmail } })
        if (user) membership = await prisma.teamMembership.findUnique({
          where: { organizationId_userId: { organizationId: orgId, userId: user.id } },
        })
      }
      if (!membership) return { error: 'العضو غير موجود' }

      const adminCount = await prisma.teamMembership.count({ where: { organizationId: orgId, role: 'ADMIN' } })
      if (membership.role === 'ADMIN' && adminCount <= 1) return { error: 'لا يمكن حذف المسؤول الوحيد' }

      await prisma.teamMembership.delete({ where: { id: membership.id } })
      return { deleted: true, memberId: membership.id }
    }

    case 'get_cash_orders': {
      const { limit = 30 } = input as { limit?: number }
      const where: Record<string, unknown> = { paymentMethod: 'cash', status: { in: ['delivered'] }, paymentStatus: 'pending' }
      if (storeId) where.storeId = storeId

      const orders = await prisma.order.findMany({ where, orderBy: { placedAt: 'desc' }, take: Number(limit) })
      const totalUnpaid = orders.reduce((s, o) => s + o.total, 0)
      return { orders, count: orders.length, totalUnpaid: totalUnpaid / 100 }
    }

    case 'mark_payment_collected': {
      const { orderIds } = input as { orderIds: string[] }
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { paymentStatus: 'paid' },
      })
      await prisma.activityLog.create({
        data: {
          organizationId: orgId, userId: ctx.userId,
          action: 'mark_paid', entity: 'order',
          summary: `تحصيل دفع ${orderIds.length} طلب نقدي`,
          after: JSON.stringify(orderIds),
        },
      })
      return { updated: orderIds.length }
    }

    case 'deactivate_product': {
      const { productId, productName } = input as { productId?: string; productName?: string }
      let product: any = null
      if (productId) {
        product = await prisma.product.findUnique({ where: { id: productId } })
      } else if (productName && storeId) {
        product = await prisma.product.findFirst({
          where: { storeId, name: { contains: productName } },
        })
      }
      if (!product) return { error: 'المنتج غير موجود' }

      await prisma.product.update({ where: { id: product.id }, data: { isActive: false } })

      await prisma.activityLog.create({
        data: {
          organizationId: orgId, userId: ctx.userId,
          action: 'deactivate_product', entity: 'product', entityId: product.id,
          summary: `إيقاف منتج "${product.name}"`,
        },
      })
      return { deactivated: product.id, name: product.name }
    }

    case 'delete_product': {
      const { productId, productName } = input as { productId?: string; productName?: string }
      let product: any = null
      if (productId) {
        product = await prisma.product.findUnique({ where: { id: productId } })
      } else if (productName && storeId) {
        product = await prisma.product.findFirst({ where: { storeId, name: { contains: productName } } })
      }
      if (!product) return { error: 'المنتج غير موجود' }

      await prisma.product.update({ where: { id: product.id }, data: { isActive: false } })

      await prisma.activityLog.create({
        data: {
          organizationId: orgId, userId: ctx.userId,
          action: 'delete_product', entity: 'product', entityId: product.id,
          summary: `حذف منتج "${product.name}"`,
        },
      })
      return { deleted: product.id, name: product.name }
    }

    case 'search_order': {
      const { query } = input as { query: string }
      const where: Record<string, unknown> = {}
      if (storeId) where.storeId = storeId

      const orders = await prisma.order.findMany({
        where: {
          ...where,
          OR: [
            { externalRef: { contains: query } },
            { customerName: { contains: query } },
            { customerPhone: { contains: query } },
            { city: { contains: query } },
          ],
        },
        include: { items: true },
        orderBy: { placedAt: 'desc' },
        take: 10,
      })
      return { orders, count: orders.length }
    }

    case 'search_customer': {
      const { query } = input as { query: string }
      const customers = await prisma.customer.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { name: { contains: query } },
            { phone: { contains: query } },
            { city: { contains: query } },
          ],
        },
        orderBy: { totalSpent: 'desc' },
        take: 10,
      })
      return { customers, count: customers.length }
    }

    case 'block_customer': {
      const { customerId } = input as { customerId: string }
      const customer = await prisma.customer.findFirst({ where: { id: customerId, organizationId: orgId } })
      if (!customer) return { error: 'العميل غير موجود' }

      await prisma.customer.update({ where: { id: customerId }, data: { isBlocked: true } })

      await prisma.activityLog.create({
        data: {
          organizationId: orgId, userId: ctx.userId,
          action: 'block_customer', entity: 'customer', entityId: customerId,
          summary: `حظر العميل "${customer.name}"`,
        },
      })
      return { blocked: customerId, name: customer.name }
    }

    case 'add_customer': {
      const { name, phone, email, city } = input as { name: string; phone?: string; email?: string; city?: string }

      const existing = phone
        ? await prisma.customer.findFirst({ where: { organizationId: orgId, phone } })
        : null
      if (existing) return { error: `يوجد عميل بهذا الرقم بالفعل: ${existing.name}` }

      const customer = await prisma.customer.create({
        data: { organizationId: orgId, name, phone, email, city, segment: 'new' },
      })

      await prisma.activityLog.create({
        data: {
          organizationId: orgId, userId: ctx.userId,
          action: 'add_customer', entity: 'customer', entityId: customer.id,
          summary: `إضافة عميل جديد: ${name}${phone ? ' — ' + phone : ''}`,
        },
      })
      return { customer: { id: customer.id, name, phone, city } }
    }

    case 'delete_coupon': {
      const { code } = input as { code: string }
      const coupon = await prisma.coupon.findFirst({ where: { organizationId: orgId, code: code.toUpperCase() } })
      if (!coupon) return { error: `كوبون ${code} غير موجود` }

      await prisma.coupon.update({ where: { id: coupon.id }, data: { isActive: false } })
      return { deleted: coupon.code }
    }

    case 'get_risk_orders': {
      const { minRisk = 60, limit = 20 } = input as { minRisk?: number; limit?: number }
      const where: Record<string, unknown> = { riskScore: { gte: minRisk }, status: 'pending' }
      if (storeId) where.storeId = storeId

      const orders = await prisma.order.findMany({
        where,
        orderBy: { riskScore: 'desc' },
        take: Number(limit),
      })
      return { orders, count: orders.length }
    }

    case 'get_stores': {
      const stores = await prisma.store.findMany({
        where: { organizationId: orgId, isDeleted: false },
        orderBy: { createdAt: 'asc' },
      })
      return {
        stores: stores.map(s => ({
          id: s.id, name: s.name, platform: s.platform,
          isActive: s.isActive, connectionStatus: s.connectionStatus,
          lastSyncAt: s.lastSyncAt,
        })),
        count: stores.length,
      }
    }

    case 'get_churn_customers': {
      const days = 45
      const since = new Date(); since.setDate(since.getDate() - days)
      const customers = await prisma.customer.findMany({
        where: {
          organizationId: orgId,
          lastOrderAt: { lt: since },
          totalOrders: { gte: 2 },
          isBlocked: false,
        },
        orderBy: { totalSpent: 'desc' },
        take: 20,
      })
      return { customers, count: customers.length, daysInactive: days }
    }

    case 'get_new_customers': {
      const { days = 30, limit = 20 } = input as { days?: number; limit?: number }
      const since = new Date(); since.setDate(since.getDate() - days)
      const customers = await prisma.customer.findMany({
        where: { organizationId: orgId, createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      })
      return { customers, count: customers.length }
    }

    default:
      return { error: `أداة غير معروفة: ${name}` }
  }
}
