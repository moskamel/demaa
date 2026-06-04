// Active store Zustand store — single source of truth for which store is selected

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface StoreItem {
  id: string
  name: string
  platform: string
  domain?: string
  connectionStatus: string
  pendingOrders?: number
  isActive: boolean
}

interface ActiveStoreState {
  activeStoreId: string | null
  stores: StoreItem[]
  isLoading: boolean
  isSwitching: boolean

  setActiveStore: (storeId: string) => Promise<void>
  setStores: (stores: StoreItem[]) => void
  refreshStores: () => Promise<void>
  reset: () => void
}

const BASE = '/api'

async function apiPost(path: string, body: Record<string, unknown>) {
  const token = localStorage.getItem('deema_token')
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${path} failed`)
  return res.json()
}

async function apiGet(path: string) {
  const token = localStorage.getItem('deema_token')
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  if (!res.ok) throw new Error(`API ${path} failed`)
  return res.json()
}

export const useActiveStore = create<ActiveStoreState>()(
  persist(
    (set, get) => ({
      activeStoreId: null,
      stores: [],
      isLoading: false,
      isSwitching: false,

      setActiveStore: async (storeId: string) => {
        if (get().activeStoreId === storeId) return
        set({ isSwitching: true })
        try {
          await apiPost('/stores/switch', { storeId })
          set({ activeStoreId: storeId, isSwitching: false })
        } catch {
          set({ isSwitching: false })
          throw new Error('فشل تبديل المتجر')
        }
      },

      setStores: (stores: StoreItem[]) => {
        set({ stores })
        // Auto-set active store if none selected
        const { activeStoreId } = get()
        if (!activeStoreId && stores.length > 0) {
          const connected = stores.find(s => s.connectionStatus === 'connected')
          if (connected) set({ activeStoreId: connected.id })
        }
        // Validate that activeStoreId still exists in the list
        if (activeStoreId && !stores.find(s => s.id === activeStoreId)) {
          const first = stores.find(s => s.connectionStatus === 'connected')
          set({ activeStoreId: first?.id ?? null })
        }
      },

      refreshStores: async () => {
        set({ isLoading: true })
        try {
          const data = await apiGet('/stores')
          const stores: StoreItem[] = (data.stores ?? []).map((s: Record<string, unknown>) => ({
            id: s.id as string,
            name: s.name as string,
            platform: s.platform as string,
            domain: s.domain as string | undefined,
            connectionStatus: (s.connectionStatus as string) ?? 'disconnected',
            pendingOrders: ((s._count as Record<string, unknown>)?.orders as number) ?? 0,
            isActive: s.isActive as boolean,
          }))
          get().setStores(stores)
        } finally {
          set({ isLoading: false })
        }
      },

      reset: () => set({ activeStoreId: null, stores: [], isLoading: false, isSwitching: false }),
    }),
    {
      name: 'deema-active-store',
      partialize: (state) => ({ activeStoreId: state.activeStoreId }),
    },
  ),
)

export function getActiveStoreItem(state: ActiveStoreState): StoreItem | null {
  return state.stores.find(s => s.id === state.activeStoreId) ?? null
}
