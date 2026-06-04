import prisma from '../prisma.js'

export interface OrderPayload {
  externalRef: string
  customerName: string
  customerPhone: string | null
  city: string
  address: string | null
  total: number
  status: string
  paymentMethod: string
  placedAt: Date
  items?: Array<{ name: string; qty: number; unitPrice: number }>
}

// Exponential backoff delays: 1m, 5m, 15m, 30m, 60m
function retryDelay(attempt: number): number {
  const delays = [60_000, 300_000, 900_000, 1_800_000, 3_600_000]
  return delays[Math.min(attempt - 1, delays.length - 1)]
}

/**
 * Idempotent webhook event processor.
 * - Creates a WebhookEvent record on first call.
 * - Returns { duplicate: true } if already processed.
 * - On failure: marks as "failed", schedules retry with exponential backoff.
 * - After 5 attempts: moves to "dead" (dead-letter).
 */
export async function processWebhookEvent(
  platform: string,
  topic: string,
  idempotencyKey: string,
  storeId: string | null,
  payload: string,
  handler: () => Promise<void>,
): Promise<{ duplicate: boolean; eventId: string }> {
  // 1. Check idempotency
  const existing = await prisma.webhookEvent.findUnique({ where: { idempotencyKey } })

  if (existing) {
    if (existing.status === 'processed') return { duplicate: true, eventId: existing.id }

    // Re-attempt a previously failed event
    await prisma.webhookEvent.update({
      where: { id: existing.id },
      data: { attempts: { increment: 1 }, lastAttemptAt: new Date(), status: 'pending', error: null, nextRetryAt: null },
    })
    try {
      await handler()
      await prisma.webhookEvent.update({
        where: { id: existing.id },
        data: { status: 'processed', processedAt: new Date() },
      })
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      const newAttempts = existing.attempts + 1
      await prisma.webhookEvent.update({
        where: { id: existing.id },
        data: {
          status: newAttempts >= 5 ? 'dead' : 'failed',
          error,
          nextRetryAt: newAttempts >= 5 ? null : new Date(Date.now() + retryDelay(newAttempts)),
        },
      })
      if (newAttempts >= 5) {
        console.error(`[webhook:dlq] ${platform}/${topic} ${idempotencyKey} dead after ${newAttempts} attempts: ${error}`)
      }
    }
    return { duplicate: false, eventId: existing.id }
  }

  // 2. Create new event record
  const event = await prisma.webhookEvent.create({
    data: { storeId, platform, topic, idempotencyKey, status: 'pending', attempts: 1, lastAttemptAt: new Date(), payload },
  })

  // 3. Process
  try {
    await handler()
    await prisma.webhookEvent.update({ where: { id: event.id }, data: { status: 'processed', processedAt: new Date() } })
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: { status: 'failed', error, nextRetryAt: new Date(Date.now() + retryDelay(1)) },
    })
    console.warn(`[webhook:fail] ${platform}/${topic} ${idempotencyKey}: ${error}`)
  }

  return { duplicate: false, eventId: event.id }
}

/**
 * Retry worker — runs every 30s, picks up failed events past their nextRetryAt.
 * Call once on server startup.
 */
export function startRetryWorker(): void {
  const run = async () => {
    try {
      const due = await prisma.webhookEvent.findMany({
        where: { status: 'failed', nextRetryAt: { lte: new Date() } },
        orderBy: { nextRetryAt: 'asc' },
        take: 20,
      })
      if (due.length > 0) console.log(`[webhook:retry] processing ${due.length} due events`)
      for (const ev of due) {
        try {
          const { dispatchRetry } = await import('../../routes/webhooks.js')
          await prisma.webhookEvent.update({
            where: { id: ev.id },
            data: { attempts: { increment: 1 }, lastAttemptAt: new Date(), status: 'pending', error: null, nextRetryAt: null },
          })
          await dispatchRetry(ev.platform, ev.topic, ev.storeId, ev.payload)
          await prisma.webhookEvent.update({ where: { id: ev.id }, data: { status: 'processed', processedAt: new Date() } })
        } catch (err) {
          const error = err instanceof Error ? err.message : String(err)
          const attempts = ev.attempts + 1
          const dead = attempts >= 5
          await prisma.webhookEvent.update({
            where: { id: ev.id },
            data: {
              status: dead ? 'dead' : 'failed',
              error,
              nextRetryAt: dead ? null : new Date(Date.now() + retryDelay(attempts)),
            },
          })
          if (dead) console.error(`[webhook:dlq] event ${ev.id} (${ev.platform}/${ev.topic}) dead after ${attempts} attempts`)
        }
      }
    } catch (err) {
      console.error('[webhook:retry-worker] error:', err)
    }
  }

  setTimeout(() => {
    run()
    setInterval(run, 30_000)
  }, 10_000)

  console.log('[webhook:retry-worker] started (30s interval)')
}

/**
 * Upsert an order from a webhook payload. Creates customer if needed.
 */
export async function upsertOrderFromWebhook(storeId: string, orgId: string, data: OrderPayload): Promise<void> {
  let customer = data.customerPhone
    ? await prisma.customer.findFirst({ where: { organizationId: orgId, phone: data.customerPhone } })
    : null
  if (!customer && data.customerName && data.customerName !== 'عميل غير معروف') {
    customer = await prisma.customer.findFirst({ where: { organizationId: orgId, name: data.customerName } })
  }
  if (!customer) {
    customer = await prisma.customer.create({
      data: { organizationId: orgId, name: data.customerName, phone: data.customerPhone, city: data.city },
    })
  }

  const existing = await prisma.order.findFirst({ where: { storeId, externalRef: data.externalRef } })
  if (!existing) {
    // Compute risk score based on order signals
    let riskScore = 0
    const isCOD = data.paymentMethod === 'cash' || data.paymentMethod === 'cod'
    if (isCOD) riskScore += 30
    const priorOrders = await prisma.order.count({ where: { storeId, customerId: customer.id } })
    const isNewCustomer = priorOrders === 0
    if (isNewCustomer) riskScore += 20
    if (data.total > 50000) riskScore += 20 // > 500 SAR

    const order = await prisma.order.create({
      data: {
        storeId, externalRef: data.externalRef, customerId: customer.id,
        customerName: data.customerName, customerPhone: data.customerPhone,
        city: data.city, address: data.address,
        status: data.status, paymentMethod: data.paymentMethod,
        total: data.total, placedAt: data.placedAt,
        riskScore, isNewCustomer,
      },
    })
    if (data.items?.length) {
      await prisma.orderItem.createMany({
        data: data.items.map(i => ({
          orderId: order.id, name: i.name, qty: i.qty,
          unitPrice: i.unitPrice, totalPrice: i.unitPrice * i.qty,
        })),
      })
    }
  } else {
    await prisma.order.update({ where: { id: existing.id }, data: { status: data.status, total: data.total } })
  }
}
