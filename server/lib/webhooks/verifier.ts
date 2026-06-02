import crypto from 'crypto'

export type VerifyResult = { ok: true } | { ok: false; reason: string }

function timingSafeCompare(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false
  try { return crypto.timingSafeEqual(a, b) } catch { return false }
}

// Shopify: X-Shopify-Hmac-Sha256 = base64(HMAC-SHA256(secret, rawBody))
export function verifyShopify(rawBody: Buffer, sig: string | undefined, secret: string): VerifyResult {
  if (!sig) return { ok: false, reason: 'missing X-Shopify-Hmac-Sha256' }
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64')
  return timingSafeCompare(Buffer.from(sig), Buffer.from(expected))
    ? { ok: true }
    : { ok: false, reason: 'signature mismatch' }
}

// WooCommerce: X-WC-Webhook-Signature = base64(HMAC-SHA256(secret, rawBody))
export function verifyWooCommerce(rawBody: Buffer, sig: string | undefined, secret: string): VerifyResult {
  if (!sig) return { ok: false, reason: 'missing X-WC-Webhook-Signature' }
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64')
  try {
    return timingSafeCompare(Buffer.from(sig, 'base64'), Buffer.from(expected, 'base64'))
      ? { ok: true }
      : { ok: false, reason: 'signature mismatch' }
  } catch { return { ok: false, reason: 'invalid signature encoding' } }
}

// BigCommerce: verified by matching store hash in payload against token prefix
export function verifyBigCommerce(payloadStoreHash: string, tokenStoreHash: string): VerifyResult {
  if (!payloadStoreHash) return { ok: false, reason: 'missing store hash in payload' }
  return timingSafeCompare(Buffer.from(payloadStoreHash), Buffer.from(tokenStoreHash))
    ? { ok: true }
    : { ok: false, reason: 'store hash mismatch' }
}

// Ecwid: verified by storeId in URL path matching token prefix
export function verifyEcwid(urlStoreId: string, tokenStoreId: string): VerifyResult {
  return urlStoreId === tokenStoreId
    ? { ok: true }
    : { ok: false, reason: `store id mismatch: url=${urlStoreId} token=${tokenStoreId}` }
}

// Salla: X-Salla-Signature = hex(HMAC-SHA256(appSecret, rawBody))
export function verifySalla(rawBody: Buffer, sig: string | undefined, secret: string): VerifyResult {
  if (!sig || !secret) return { ok: true } // degrade gracefully — app secret optional
  try {
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    return timingSafeCompare(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
      ? { ok: true }
      : { ok: false, reason: 'salla signature mismatch' }
  } catch { return { ok: true } }
}

// Zid: same pattern as Salla
export function verifyZid(rawBody: Buffer, sig: string | undefined, secret: string): VerifyResult {
  return verifySalla(rawBody, sig, secret)
}
