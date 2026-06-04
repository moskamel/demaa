// Store Switcher — lets merchant switch between connected stores
// Renders as a dropdown trigger in the AppHeader

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown2, Shop, AddCircle, Warning2, Refresh, Wifi, WifiSquare } from 'iconsax-react'
import { useActiveStore, getActiveStoreItem, type StoreItem } from '../store/activeStore'

const PLATFORM_COLORS: Record<string, string> = {
  salla:       '#1DBF73',
  zid:         '#FF6B35',
  shopify:     '#96BF48',
  woocommerce: '#7F54B3',
  custom:      '#6B7280',
}

const PLATFORM_NAMES: Record<string, string> = {
  salla: 'سلة', zid: 'زد', shopify: 'Shopify', woocommerce: 'WooCommerce', custom: 'مخصص',
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    connected:     '#22c55e',
    disconnected:  '#6b7280',
    token_expired: '#f59e0b',
    error:         '#ef4444',
  }
  return (
    <div style={{
      width: 7, height: 7, borderRadius: '50%',
      background: colors[status] ?? '#6b7280',
      boxShadow: status === 'connected' ? `0 0 0 2px rgba(34,197,94,0.2)` : 'none',
      flexShrink: 0,
    }} />
  )
}

function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      color: PLATFORM_COLORS[platform] ?? '#6b7280',
      background: (PLATFORM_COLORS[platform] ?? '#6b7280') + '20',
      borderRadius: 4, padding: '1px 5px', flexShrink: 0,
    }}>
      {PLATFORM_NAMES[platform] ?? platform}
    </span>
  )
}

function StoreRow({ store, isActive, onSelect, isSwitching }: {
  store: StoreItem
  isActive: boolean
  onSelect: () => void
  isSwitching: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
        background: isActive ? 'rgba(106,76,245,0.1)' : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        borderRadius: 8, cursor: 'pointer', transition: 'background 0.12s',
      }}
    >
      {/* Platform color dot */}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: `${PLATFORM_COLORS[store.platform] ?? '#6b7280'}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Shop size={14} color={PLATFORM_COLORS[store.platform] ?? '#6b7280'} variant="Outline" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#c4b5fd' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {store.name}
          </span>
          {isActive && !isSwitching && (
            <span style={{ fontSize: 9, color: '#a78bfa', background: 'rgba(167,139,250,0.15)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>فعّال</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <PlatformBadge platform={store.platform} />
          {store.pendingOrders != null && store.pendingOrders > 0 && (
            <span style={{ fontSize: 9, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', borderRadius: 4, padding: '1px 5px' }}>
              {store.pendingOrders} معلق
            </span>
          )}
        </div>
      </div>

      <StatusDot status={store.connectionStatus} />
    </div>
  )
}

export default function StoreSwitcher() {
  const navigate = useNavigate()
  const { stores, activeStoreId, isSwitching, isLoading, setActiveStore, refreshStores } = useActiveStore()
  const activeStore = useActiveStore(getActiveStoreItem)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    refreshStores()
  }, [refreshStores])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (stores.length === 0 && !isLoading) {
    return (
      <button onClick={() => navigate('/stores')} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
        background: 'rgba(106,76,245,0.12)', border: '1px dashed rgba(106,76,245,0.4)',
        borderRadius: 8, cursor: 'pointer', color: '#a78bfa', fontSize: 12, fontFamily: 'inherit',
      }}>
        <AddCircle size={14} />
        ربط متجر
      </button>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 8px',
          background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(106,76,245,0.5)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
        }}
      >
        {isSwitching ? (
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', animation: 'pulse 1s infinite' }} />
        ) : (
          <StatusDot status={activeStore?.connectionStatus ?? 'disconnected'} />
        )}
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isLoading ? 'جارٍ التحميل...' : activeStore?.name ?? 'اختر متجراً'}
        </span>
        {activeStore && <PlatformBadge platform={activeStore.platform} />}
        <ArrowDown2 size={12} color="rgba(255,255,255,0.4)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          minWidth: 280, background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 300,
          overflow: 'hidden', direction: 'rtl',
        }}>
          {/* Header */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>المتاجر</span>
            <button onClick={() => refreshStores()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 2, display: 'flex' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
              <Refresh size={13} />
            </button>
          </div>

          {/* Store list */}
          <div style={{ padding: '6px', maxHeight: 320, overflowY: 'auto' }}>
            {stores.map(store => (
              <StoreRow
                key={store.id}
                store={store}
                isActive={store.id === activeStoreId}
                isSwitching={isSwitching}
                onSelect={async () => {
                  if (store.id === activeStoreId || isSwitching) return
                  await setActiveStore(store.id).catch(() => {})
                  setOpen(false)
                }}
              />
            ))}
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '8px' }}>
            <button
              onClick={() => { setOpen(false); navigate('/stores') }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.15)',
                background: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(106,76,245,0.5)'; e.currentTarget.style.background = 'rgba(106,76,245,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'none' }}
            >
              <AddCircle size={14} />
              ربط متجر جديد
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
