import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { ArrowDown2, TickCircle, Add } from 'iconsax-react'
import { orders as ordersApi, storesApi, type StoreData } from '../lib/api'
// clearToken handled in AppSidebar

const PAGE_TITLES: Record<string, string> = {
  '/stores':        'متاجري',
  '/reports':       'التقارير',
  '/team':          'الفريق',
  '/connectors':    'التطبيقات',
  '/notifications': 'الإشعارات',
  '/customers':     'العملاء',
  '/activity':      'سجل الأنشطة',
  '/settings':      'الإعدادات',
  '/billing':       'الاشتراك',
  '/coupons':       'الكوبونات',
  '/dashboard':     'لوحة التحكم',
}

const platformColors: Record<string, string> = {
  shopify: '#6a4cf5', wuilt: '#d44df0', shantaweb: '#22c55e',
}

const ACTIVE_STORE_KEY = 'deema_active_store'

interface AppHeaderProps {
  title?: string
  children?: React.ReactNode
}

export default function AppHeader({ title, children }: AppHeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = title ?? PAGE_TITLES[location.pathname] ?? ''

  const [pending, setPending] = useState<number | null>(null)
  const [stores, setStores] = useState<StoreData[]>([])
  const [activeStore, setActiveStore] = useState<StoreData | null>(null)
  const [showStores, setShowStores] = useState(false)
  const storeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ordersApi.stats().then(s => setPending(s.pending)).catch(() => {})
    storesApi.list().then(r => {
      setStores(r.stores)
      const savedId = localStorage.getItem(ACTIVE_STORE_KEY)
      const found = r.stores.find(s => s.id === savedId) ?? r.stores[0] ?? null
      setActiveStore(found)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (storeRef.current && !storeRef.current.contains(e.target as Node)) setShowStores(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectStore = (s: StoreData) => {
    setActiveStore(s)
    localStorage.setItem(ACTIVE_STORE_KEY, s.id)
    setShowStores(false)
  }


  const pColor = activeStore ? (platformColors[activeStore.platform] ?? '#6a4cf5') : '#6a4cf5'

  return (
    <div style={{
      height: 56, borderBottom: '1px solid var(--hairline)',
      display: 'flex', alignItems: 'center', padding: '0 28px',
      gap: 16, flexShrink: 0, background: 'var(--canvas)',
    }}>
      {/* Page title */}
      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px', flex: 1 }}>
        {pageTitle}
      </span>

      {children}

      {/* Stats badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,122,61,0.1)', borderRadius: 20,
          padding: '5px 12px', border: '1px solid rgba(255,122,61,0.2)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff7a3d', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#ff7a3d', whiteSpace: 'nowrap' }}>
            {pending ?? '—'} معلق
          </span>
        </div>

        <div
          onClick={() => navigate('/reports')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,85,119,0.08)', borderRadius: 20,
            padding: '5px 12px', border: '1px solid rgba(255,85,119,0.18)',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,85,119,0.14)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,85,119,0.08)' }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff5577', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#ff5577', whiteSpace: 'nowrap' }}>نافد</span>
        </div>
      </div>

      {/* Store switcher */}
      <div ref={storeRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setShowStores(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--canvas-soft)', border: 'none',
            borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas-soft-2)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--canvas-soft)' }}
        >
          {activeStore ? (
            <>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: activeStore.isActive ? '#22c55e' : '#ff7a3d', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeStore.name}
              </span>
              <span style={{ fontSize: 10, color: pColor, background: pColor + '18', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>
                {activeStore.platform}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>اختر متجر</span>
          )}
          <ArrowDown2 size={12} color="var(--ink-muted)" variant="Outline" style={{ transition: 'transform 0.2s', transform: showStores ? 'rotate(180deg)' : '' }} />
        </button>

        {showStores && (
          <div className="animate-fade-in-scale" style={{
            position: 'absolute', top: 44, left: 0,
            background: 'var(--canvas-soft)', borderRadius: 14,
            border: '1px solid var(--hairline)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            minWidth: 220, zIndex: 200, overflow: 'hidden',
            fontFamily: "'Zain','Inter',sans-serif", direction: 'rtl',
          }}>
            <div style={{ padding: '8px 12px 6px', fontSize: 10, fontWeight: 700, color: 'var(--ink-disabled)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              متاجرك
            </div>

            {stores.length === 0 && (
              <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink-muted)' }}>لا يوجد متاجر</div>
            )}

            {stores.map(s => {
              const c = platformColors[s.platform] ?? '#6a4cf5'
              const isActive = activeStore?.id === s.id
              return (
                <button key={s.id} onClick={() => selectStore(s)} style={{
                  width: '100%', padding: '10px 14px', background: isActive ? 'var(--canvas-soft-2)' : 'none',
                  border: 'none', textAlign: 'right', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.12s',
                }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--canvas-soft-2)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '' }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: c + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: c }}>{s.name[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>{s.platform} · {s.isActive ? 'متصل' : 'غير متصل'}</div>
                  </div>
                  {isActive && <TickCircle size={14} color="#22c55e" variant="Outline" />}
                </button>
              )
            })}

            <div style={{ height: 1, background: 'var(--hairline)', margin: '4px 0' }} />

            <button onClick={() => { navigate('/onboarding', { state: { fromDashboard: true } }); setShowStores(false) }} style={{
              width: '100%', padding: '10px 14px', background: 'none', border: 'none',
              textAlign: 'right', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-muted)',
              fontSize: 13, transition: 'background 0.12s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas-soft-2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '' }}
            >
              <Add size={14} variant="Outline" />
              ربط متجر جديد
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
