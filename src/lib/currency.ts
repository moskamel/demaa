export type CurrencyCode = 'SAR' | 'EGP' | 'AED' | 'QAR' | 'KWD' | 'BHD' | 'USD'

export interface CurrencyInfo {
  code: CurrencyCode
  label: string
  flag: string
  symbol: string
  decimals: 0 | 2 | 3
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'SAR', label: 'ريال سعودي',   flag: '🇸🇦', symbol: 'ر.س', decimals: 0 },
  { code: 'EGP', label: 'جنيه مصري',    flag: '🇪🇬', symbol: 'ج.م', decimals: 0 },
  { code: 'AED', label: 'درهم إماراتي', flag: '🇦🇪', symbol: 'د.إ', decimals: 0 },
  { code: 'QAR', label: 'ريال قطري',    flag: '🇶🇦', symbol: 'ر.ق', decimals: 0 },
  { code: 'KWD', label: 'دينار كويتي',  flag: '🇰🇼', symbol: 'د.ك', decimals: 3 },
  { code: 'BHD', label: 'دينار بحريني', flag: '🇧🇭', symbol: 'د.ب', decimals: 3 },
  { code: 'USD', label: 'دولار',         flag: '🌍',  symbol: '$',   decimals: 2 },
]

// [monthly, yearly]
export const PLAN_PRICES: Record<string, Partial<Record<CurrencyCode, [number, number]>>> = {
  free:       { SAR:[0,0], EGP:[0,0], AED:[0,0], QAR:[0,0], KWD:[0,0], BHD:[0,0], USD:[0,0] },
  starter:    { SAR:[79,790], EGP:[249,2490], AED:[79,790], QAR:[79,790], KWD:[7,70], BHD:[9,90], USD:[22,220] },
  growth:     { SAR:[199,1990], EGP:[599,5990], AED:[199,1990], QAR:[199,1990], KWD:[17,170], BHD:[21,210], USD:[55,550] },
  pro:        { SAR:[399,3990], EGP:[1199,11990], AED:[399,3990], QAR:[399,3990], KWD:[33,330], BHD:[41,410], USD:[109,1090] },
  enterprise: { SAR:[799,7990], EGP:[2499,24990], AED:[799,7990], QAR:[799,7990], KWD:[65,650], BHD:[81,810], USD:[219,2190] },
}

export const COUNTRY_CURRENCY: Record<string, CurrencyCode> = {
  SA:'SAR', EG:'EGP', AE:'AED', QA:'QAR', KW:'KWD', BH:'BHD',
  US:'USD', GB:'USD', CA:'USD', AU:'USD', DE:'USD', FR:'USD',
}

export function formatPrice(amount: number, currency: CurrencyInfo): string {
  if (amount === 0) return ''
  const num = amount.toFixed(currency.decimals)
  return currency.code === 'USD' ? `${currency.symbol}${num}` : `${currency.symbol} ${num}`
}

export function getPlanAmount(planId: string, currency: CurrencyCode, billing: 'monthly' | 'yearly'): number {
  return (PLAN_PRICES[planId]?.[currency] ?? [0,0])[billing === 'monthly' ? 0 : 1]
}
