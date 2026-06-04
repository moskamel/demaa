// Maps platform id → public logo path
export const PLATFORM_LOGOS: Record<string, string> = {
  shopify:      '/logos/Shopify.png',
  salla:        '/logos/Salla.png',
  zid:          '/logos/Zid.png',
  wuilt:        '/logos/Wuilt.jpg',
  shantaweb:    '/logos/Shantaweb.png',
  woocommerce:  '/logos/WooCommerce.png',
  amazon:       '/logos/Amazon.png',
  noon:         '/logos/Noon.png',
  jumia:        '/logos/Jumia.png',
  bigcommerce:  '/logos/BigCommerce.webp',
  wix:          '/logos/Wix.png',
  ecwid:        '/logos/Ecwid.png',
  tiktok:       '/logos/TikTok_Shop.png',
  facebook:     '/logos/Facebook_Shop.png',
  instagram:    '/logos/Facebook_Shop.png',
}

export function getPlatformLogo(platform: string): string | undefined {
  return PLATFORM_LOGOS[platform.toLowerCase()]
}
