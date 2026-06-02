import * as shopify from './shopify.js'
import * as wuilt from './wuilt.js'
import * as shantaweb from './shantaweb.js'

type PlatformClient = {
  cancelOrder(domain: string, token: string, externalId: string): Promise<void>
  fulfillOrder(domain: string, token: string, externalId: string, trackingNumber?: string, carrier?: string): Promise<void>
}

const platforms: Record<string, PlatformClient> = {
  shopify,
  wuilt,
  shantaweb,
}

export interface Store {
  platform: string
  domain: string | null
  accessToken: string | null
}

// Push order cancellation to the platform — non-blocking, logs errors
export async function pushCancel(store: Store, externalRef: string | null): Promise<{ pushed: boolean; error?: string }> {
  if (!externalRef || !store.domain || !store.accessToken) return { pushed: false }
  const client = platforms[store.platform]
  if (!client) return { pushed: false, error: `Platform ${store.platform} not supported` }
  try {
    await client.cancelOrder(store.domain, store.accessToken, externalRef)
    return { pushed: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[platform:${store.platform}] cancel failed:`, msg)
    return { pushed: false, error: msg }
  }
}

// Push fulfillment (ship) to the platform — non-blocking, logs errors
export async function pushFulfill(
  store: Store,
  externalRef: string | null,
  trackingNumber?: string,
  carrier?: string,
): Promise<{ pushed: boolean; error?: string }> {
  if (!externalRef || !store.domain || !store.accessToken) return { pushed: false }
  const client = platforms[store.platform]
  if (!client) return { pushed: false, error: `Platform ${store.platform} not supported` }
  try {
    await client.fulfillOrder(store.domain, store.accessToken, externalRef, trackingNumber, carrier)
    return { pushed: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[platform:${store.platform}] fulfill failed:`, msg)
    return { pushed: false, error: msg }
  }
}
