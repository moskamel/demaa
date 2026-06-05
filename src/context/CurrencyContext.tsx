import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { CurrencyCode } from '../lib/currency'
import { CURRENCIES, COUNTRY_CURRENCY } from '../lib/currency'

interface CurrencyContextValue {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
}

const CurrencyContext = createContext<CurrencyContextValue>({ currency: 'SAR', setCurrency: () => {} })

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('SAR')

  useEffect(() => {
    const saved = localStorage.getItem('deema_currency') as CurrencyCode | null
    if (saved && CURRENCIES.find(c => c.code === saved)) {
      setCurrencyState(saved)
      return
    }
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const mapped = COUNTRY_CURRENCY[data.country_code as string]
        if (mapped) setCurrencyState(mapped)
      })
      .catch(() => {})
  }, [])

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c)
    localStorage.setItem('deema_currency', c)
  }

  return <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
