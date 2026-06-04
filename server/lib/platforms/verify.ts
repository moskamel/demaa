// Real API credential verification for each supported platform.
// Called BEFORE saving credentials to DB — throws on invalid credentials.

const SHOPIFY_VERSION = '2024-01'

// ── Shopify ──────────────────────────────────────────────────────────────────
export async function verifyShopify(domain: string, token: string): Promise<{ storeName: string }> {
  const res = await fetch(`https://${domain}/admin/api/${SHOPIFY_VERSION}/shop.json`, {
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
  })
  if (res.status === 401 || res.status === 403) throw new Error('API key غير صحيح أو لا يملك صلاحيات كافية')
  if (res.status === 404) throw new Error('نطاق المتجر غير صحيح — تأكد من كتابة mystore.myshopify.com')
  if (!res.ok) throw new Error(`فشل الاتصال بـ Shopify (${res.status})`)
  const data = await res.json() as { shop?: { name?: string } }
  const name = data.shop?.name
  if (!name) throw new Error('لم نتمكن من قراءة اسم المتجر من Shopify')
  return { storeName: name }
}

// ── WooCommerce ──────────────────────────────────────────────────────────────
function wooAuth(token: string): string {
  const idx = token.indexOf(':')
  if (idx === -1) throw new Error('يجب أن يكون الـ token بصيغة consumerKey:consumerSecret')
  const key = token.slice(0, idx)
  const secret = token.slice(idx + 1)
  return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64')
}

export async function verifyWooCommerce(domain: string, token: string): Promise<{ storeName: string }> {
  let auth: string
  try { auth = wooAuth(token) } catch (e) { throw e }

  const res = await fetch(`https://${domain}/wp-json/wc/v3/system_status`, {
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
  })
  if (res.status === 401 || res.status === 403) throw new Error('Consumer Key أو Consumer Secret غير صحيح')
  if (res.status === 404) throw new Error('النطاق غير صحيح أو WooCommerce غير مفعّل على هذا الموقع')
  if (!res.ok) throw new Error(`فشل الاتصال بـ WooCommerce (${res.status})`)

  const data = await res.json() as { settings?: { store_name?: string } }
  const storeName = data.settings?.store_name || domain
  return { storeName }
}

// ── BigCommerce ───────────────────────────────────────────────────────────────
function bcParse(token: string): { storeHash: string; accessToken: string } {
  const idx = token.indexOf(':')
  if (idx === -1) throw new Error('يجب أن يكون الـ token بصيغة storeHash:accessToken')
  return { storeHash: token.slice(0, idx), accessToken: token.slice(idx + 1) }
}

export async function verifyBigCommerce(token: string): Promise<{ storeName: string }> {
  const { storeHash, accessToken } = bcParse(token)
  const res = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v2/store`, {
    headers: {
      'X-Auth-Token': accessToken,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
  if (res.status === 401 || res.status === 403) throw new Error('Access Token غير صحيح أو لا يملك صلاحيات')
  if (res.status === 404) throw new Error('Store Hash غير صحيح')
  if (!res.ok) throw new Error(`فشل الاتصال بـ BigCommerce (${res.status})`)
  const data = await res.json() as { name?: string }
  return { storeName: data.name || storeHash }
}

// ── Wix ───────────────────────────────────────────────────────────────────────
function wixParse(token: string): { siteId: string; apiKey: string } {
  const idx = token.indexOf(':')
  if (idx === -1) throw new Error('يجب أن يكون الـ token بصيغة siteId:apiKey')
  return { siteId: token.slice(0, idx), apiKey: token.slice(idx + 1) }
}

export async function verifyWix(token: string): Promise<{ storeName: string }> {
  const { siteId, apiKey } = wixParse(token)

  // Use Site Properties API to get the site name
  const res = await fetch('https://www.wixapis.com/site-properties/v4/properties', {
    headers: {
      Authorization: apiKey,
      'wix-site-id': siteId,
      'Content-Type': 'application/json',
    },
  })
  if (res.status === 401 || res.status === 403) throw new Error('API Key غير صحيح أو لا يملك صلاحيات')
  if (res.status === 404) throw new Error('Site ID غير صحيح')
  if (!res.ok) {
    // Fall back: try eCommerce orders endpoint as a probe
    const probe = await fetch('https://www.wixapis.com/ecom/v1/orders/query', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'wix-site-id': siteId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: { paging: { limit: 1 } } }),
    })
    if (probe.status === 401 || probe.status === 403) throw new Error('API Key غير صحيح أو لا يملك صلاحيات')
    if (!probe.ok) throw new Error(`فشل الاتصال بـ Wix (${probe.status})`)
    return { storeName: siteId }
  }

  const data = await res.json() as { properties?: { siteDisplayName?: string } }
  return { storeName: data.properties?.siteDisplayName || siteId }
}

// ── Ecwid ─────────────────────────────────────────────────────────────────────
function ecwidParse(token: string): { storeId: string; secretToken: string } {
  const idx = token.indexOf(':')
  if (idx === -1) throw new Error('يجب أن يكون الـ token بصيغة storeId:secretToken')
  return { storeId: token.slice(0, idx), secretToken: token.slice(idx + 1) }
}

export async function verifyEcwid(token: string): Promise<{ storeName: string }> {
  const { storeId, secretToken } = ecwidParse(token)
  const res = await fetch(
    `https://app.ecwid.com/api/v3/${storeId}/profile?token=${secretToken}`,
    { headers: { 'Content-Type': 'application/json' } },
  )
  if (res.status === 401 || res.status === 403) throw new Error('Secret Token غير صحيح أو منتهي الصلاحية')
  if (res.status === 404) throw new Error('Store ID غير صحيح')
  if (!res.ok) throw new Error(`فشل الاتصال بـ Ecwid (${res.status})`)
  const data = await res.json() as { generalInfo?: { storeId?: number }; account?: { accountName?: string } }
  return { storeName: data.account?.accountName || `Ecwid #${storeId}` }
}

// ── Main entry ────────────────────────────────────────────────────────────────
export async function verifyPlatformCredentials(
  platform: string,
  domain: string | undefined,
  token: string,
): Promise<{ storeName: string }> {
  switch (platform) {
    case 'shopify': {
      if (!domain) throw new Error('نطاق المتجر مطلوب لـ Shopify (مثال: mystore.myshopify.com)')
      return verifyShopify(domain, token)
    }
    case 'woocommerce': {
      if (!domain) throw new Error('نطاق المتجر مطلوب لـ WooCommerce (مثال: mystore.com)')
      return verifyWooCommerce(domain, token)
    }
    case 'bigcommerce':
      return verifyBigCommerce(token)
    case 'wix':
      return verifyWix(token)
    case 'ecwid':
      return verifyEcwid(token)
    default:
      // For platforms without verification (wuilt, shantaweb, etc.), skip
      return { storeName: domain || platform }
  }
}
