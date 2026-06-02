import prisma from '../prisma.js'

const WEBHOOK_BASE = process.env.DEEMA_BASE_URL
  ? `${process.env.DEEMA_BASE_URL.replace(/\/$/, '')}/webhooks`
  : null

async function saveRegistration(
  storeId: string, platform: string, topic: string,
  url: string, externalId: string | null,
  status = 'active', secret?: string,
) {
  await prisma.webhookRegistration.upsert({
    where: { storeId_platform_topic: { storeId, platform, topic } },
    create: { storeId, platform, topic, url, externalId, status, secret },
    update: { externalId, status, url, ...(secret ? { secret } : {}), updatedAt: new Date() },
  })
}

export async function registerStoreWebhooks(storeId: string, platform: string, domain: string, token: string): Promise<void> {
  if (!WEBHOOK_BASE) {
    console.warn(`[webhook:registry] DEEMA_BASE_URL not set — skipping auto-registration for ${platform}`)
    return
  }
  try {
    switch (platform) {
      case 'shopify':      await registerShopify(storeId, domain, token); break
      case 'woocommerce':  await registerWooCommerce(storeId, domain, token); break
      case 'bigcommerce':  await registerBigCommerce(storeId, token); break
      case 'ecwid':        await registerEcwid(storeId, token); break
      case 'salla':
        await saveRegistration(storeId, 'salla', 'order.*', `${WEBHOOK_BASE}/salla`, null, 'manual')
        console.log(`[webhook:registry] Salla: register in Salla Partner Dashboard → ${WEBHOOK_BASE}/salla`)
        break
      case 'zid':
        await saveRegistration(storeId, 'zid', 'order.*', `${WEBHOOK_BASE}/zid`, null, 'manual')
        console.log(`[webhook:registry] Zid: register in Zid Developer Dashboard → ${WEBHOOK_BASE}/zid`)
        break
      default:
        console.log(`[webhook:registry] ${platform}: no webhook support`)
    }
  } catch (err) {
    console.error(`[webhook:registry] ${platform} registration error:`, err instanceof Error ? err.message : err)
  }
}

export async function deregisterStoreWebhooks(storeId: string, platform: string, domain: string, token: string): Promise<void> {
  const regs = await prisma.webhookRegistration.findMany({ where: { storeId, platform, status: 'active' } })
  for (const reg of regs) {
    try {
      if (reg.externalId) await deregisterOnPlatform(platform, domain, token, reg.externalId)
      await prisma.webhookRegistration.update({ where: { id: reg.id }, data: { status: 'disabled' } })
    } catch (err) {
      console.warn(`[webhook:registry] deregister ${reg.id} failed:`, err instanceof Error ? err.message : err)
    }
  }
}

async function deregisterOnPlatform(platform: string, domain: string, token: string, externalId: string) {
  if (platform === 'shopify') {
    await fetch(`https://${domain}/admin/api/2024-01/webhooks/${externalId}.json`, {
      method: 'DELETE', headers: { 'X-Shopify-Access-Token': token },
    })
  } else if (platform === 'woocommerce') {
    const [key, secret] = token.split(':')
    await fetch(`https://${domain}/wp-json/wc/v3/webhooks/${externalId}`, {
      method: 'DELETE',
      headers: { Authorization: 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64') },
    })
  } else if (platform === 'bigcommerce') {
    const [storeHash, accessToken] = token.split(':')
    await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v3/hooks/${externalId}`, {
      method: 'DELETE', headers: { 'X-Auth-Token': accessToken },
    })
  } else if (platform === 'ecwid') {
    const [storeId, secretToken] = token.split(':')
    await fetch(`https://app.ecwid.com/api/v3/${storeId}/webhooks/${externalId}?token=${secretToken}`, { method: 'DELETE' })
  }
}

async function registerShopify(storeId: string, domain: string, token: string) {
  const base = `https://${domain}/admin/api/2024-01`
  const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
  const url = `${WEBHOOK_BASE}/shopify`

  for (const topic of ['orders/create', 'orders/updated', 'orders/cancelled']) {
    const res = await fetch(`${base}/webhooks.json`, {
      method: 'POST', headers,
      body: JSON.stringify({ webhook: { topic, address: url, format: 'json' } }),
    })
    if (res.ok) {
      const data = await res.json() as { webhook?: { id: number } }
      await saveRegistration(storeId, 'shopify', topic, url, String(data.webhook?.id ?? ''))
    } else {
      const body = await res.text()
      // 422 = already exists — treat as success
      await saveRegistration(storeId, 'shopify', topic, url, null, res.status === 422 ? 'active' : 'failed')
      if (res.status !== 422) console.warn(`[webhook:registry] Shopify ${topic} (${res.status}): ${body}`)
    }
  }
}

async function registerWooCommerce(storeId: string, domain: string, token: string) {
  const [key, secret] = token.split(':')
  const auth = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64')
  const base = `https://${domain}/wp-json/wc/v3`
  const headers = { Authorization: auth, 'Content-Type': 'application/json' }
  const url = `${WEBHOOK_BASE}/woocommerce`

  // Fetch existing to avoid duplicates
  const existingRes = await fetch(`${base}/webhooks?per_page=100`, { headers })
  const existing: Array<{ id: number; topic: string; delivery_url: string }> = existingRes.ok ? await existingRes.json() : []
  const existingMap = new Map(existing.map(w => [w.topic, w]))

  for (const topic of ['order.created', 'order.updated']) {
    const already = existingMap.get(topic)
    if (already?.delivery_url?.includes('/webhooks/woocommerce')) {
      await saveRegistration(storeId, 'woocommerce', topic, url, String(already.id), 'active', secret)
      continue
    }
    const res = await fetch(`${base}/webhooks`, {
      method: 'POST', headers,
      body: JSON.stringify({ name: `Deema — ${topic}`, topic, delivery_url: url, secret }),
    })
    if (res.ok) {
      const data = await res.json() as { id: number }
      await saveRegistration(storeId, 'woocommerce', topic, url, String(data.id), 'active', secret)
    } else {
      const body = await res.text()
      await saveRegistration(storeId, 'woocommerce', topic, url, null, 'failed')
      console.warn(`[webhook:registry] WooCommerce ${topic} (${res.status}): ${body}`)
    }
  }
}

async function registerBigCommerce(storeId: string, token: string) {
  const [storeHash, accessToken] = token.split(':')
  const base = `https://api.bigcommerce.com/stores/${storeHash}/v3`
  const headers = { 'X-Auth-Token': accessToken, 'Content-Type': 'application/json', Accept: 'application/json' }
  const url = `${WEBHOOK_BASE}/bigcommerce`

  const existingRes = await fetch(`${base}/hooks`, { headers })
  const existingData: { data?: Array<{ id: number; scope: string; destination: string }> } = existingRes.ok ? await existingRes.json() : {}
  const existingMap = new Map((existingData.data ?? []).map(h => [h.scope, h]))

  for (const scope of ['store/order/created', 'store/order/updated', 'store/order/statusUpdated']) {
    const already = existingMap.get(scope)
    if (already?.destination?.includes('/webhooks/bigcommerce')) {
      await saveRegistration(storeId, 'bigcommerce', scope, url, String(already.id))
      continue
    }
    const res = await fetch(`${base}/hooks`, {
      method: 'POST', headers,
      body: JSON.stringify({ scope, destination: url, is_active: true }),
    })
    if (res.ok) {
      const data = await res.json() as { data?: { id: number } }
      await saveRegistration(storeId, 'bigcommerce', scope, url, String(data.data?.id ?? ''))
    } else {
      const body = await res.text()
      await saveRegistration(storeId, 'bigcommerce', scope, url, null, 'failed')
      console.warn(`[webhook:registry] BigCommerce ${scope} (${res.status}): ${body}`)
    }
  }
}

async function registerEcwid(storeId: string, token: string) {
  const [ecwidStoreId, secretToken] = token.split(':')

  for (const eventType of ['order.created', 'order.updated']) {
    const url = `${WEBHOOK_BASE}/ecwid/${ecwidStoreId}`
    const res = await fetch(`https://app.ecwid.com/api/v3/${ecwidStoreId}/webhooks?token=${secretToken}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, eventTypes: [eventType] }),
    })
    if (res.ok) {
      const data = await res.json() as { id?: number }
      await saveRegistration(storeId, 'ecwid', eventType, url, String(data.id ?? ''))
    } else {
      const body = await res.text()
      const alreadyExists = body.toLowerCase().includes('already')
      await saveRegistration(storeId, 'ecwid', eventType, url, null, alreadyExists ? 'active' : 'failed')
      if (!alreadyExists) console.warn(`[webhook:registry] Ecwid ${eventType} (${res.status}): ${body}`)
    }
  }
}
