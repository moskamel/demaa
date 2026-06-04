// Central platform registry — all supported platforms live here.
// To add a new platform: implement PlatformIntegration + add entry here.

import type { PlatformMeta, PlatformIntegration, Platform } from './types.js'
import { SallaIntegration } from './salla/index.js'
import { ZidIntegration } from './zid/index.js'
import { ShopifyIntegration } from './shopify/index.js'
import { CustomIntegration } from './custom/index.js'

export const PLATFORM_REGISTRY: Record<Platform, PlatformMeta> = {
  salla: {
    key: 'salla',
    name: 'سلة',
    nameEn: 'Salla',
    logo: '/logos/salla.png',
    color: '#1DBF73',
    authType: 'oauth2',
    docsUrl: 'https://docs.salla.dev',
    webhookEvents: ['order.created', 'order.updated', 'product.updated', 'product.quantity.low', 'customer.created'],
    integration: SallaIntegration,
  },
  zid: {
    key: 'zid',
    name: 'زد',
    nameEn: 'Zid',
    logo: '/logos/zid.png',
    color: '#FF6B35',
    authType: 'oauth2',
    docsUrl: 'https://docs.zid.sa',
    webhookEvents: ['order.created', 'order.updated', 'product.updated'],
    integration: ZidIntegration,
  },
  shopify: {
    key: 'shopify',
    name: 'Shopify',
    nameEn: 'Shopify',
    logo: '/logos/shopify.png',
    color: '#96BF48',
    authType: 'oauth2',
    docsUrl: 'https://shopify.dev',
    webhookEvents: ['orders/create', 'orders/updated', 'products/update', 'inventory_levels/update', 'customers/create'],
    integration: ShopifyIntegration,
  },
  woocommerce: {
    key: 'woocommerce',
    name: 'WooCommerce',
    nameEn: 'WooCommerce',
    logo: '/logos/woocommerce.png',
    color: '#7F54B3',
    authType: 'apikey',
    docsUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs',
    webhookEvents: ['woocommerce_order_status_changed', 'woocommerce_product_updated'],
    integration: CustomIntegration, // WooCommerce uses API key like custom
  },
  custom: {
    key: 'custom',
    name: 'موقع خاص',
    nameEn: 'Custom',
    logo: '/logos/custom.png',
    color: '#6B7280',
    authType: 'apikey',
    docsUrl: null,
    webhookEvents: [],
    integration: CustomIntegration,
  },
}

// Singleton instances — one per platform type (stateless, safe to share)
const instances = new Map<Platform, PlatformIntegration>()

export function getPlatformIntegration(platform: Platform): PlatformIntegration {
  if (!instances.has(platform)) {
    const meta = PLATFORM_REGISTRY[platform]
    if (!meta) throw new Error(`Unsupported platform: ${platform}`)
    instances.set(platform, new meta.integration())
  }
  return instances.get(platform)!
}

export function isValidPlatform(p: string): p is Platform {
  return p in PLATFORM_REGISTRY
}

export function getPlatformMeta(platform: Platform): PlatformMeta {
  const meta = PLATFORM_REGISTRY[platform]
  if (!meta) throw new Error(`Unsupported platform: ${platform}`)
  return meta
}

export function allPlatforms(): PlatformMeta[] {
  return Object.values(PLATFORM_REGISTRY)
}
