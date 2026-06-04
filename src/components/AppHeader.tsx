import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { ArrowDown2, TickCircle, Add, ArrowRight, Pause, Play, Trash } from 'iconsax-react'
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

const SECONDARY_PAGES = ['/notifications', '/activity', '/coupons', '/settings', '/billing']

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
  const isMobile = window.innerWidth < 768
  const pageTitle = title ?? PAGE_TITLES[location.pathname] ?? ''
  const isSecondary = SECONDARY_PAGES.includes(location.pathname)
  const user = (() => { try { return JSON.parse(localStorage.getItem('deema_user') || '{}') } catch { return {} } })()

  const [pending, setPending] = useState<number | null>(null)
  const [stores, setStores] = useState<StoreData[]>([])
  const [activeStore, setActiveStore] = useState<StoreData | null>(null)
  const [showStores, setShowStores] = useState(false)
  const [hoveredStore, setHoveredStore] = useState<string | null>(null)
  const [actingStore, setActingStore] = useState<string | null>(null)
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

  const refreshStores = () => {
    storesApi.list().then(r => {
      setStores(r.stores)
      if (activeStore) {
        const updated = r.stores.find(s => s.id === activeStore.id)
        setActiveStore(updated ?? r.stores[0] ?? null)
      }
    }).catch(() => {})
  }

  const handlePauseResume = async (e: React.MouseEvent, s: StoreData) => {
    e.stopPropagation()
    setActingStore(s.id)
    try {
      if (s.isActive) await storesApi.pause(s.id)
      else await storesApi.resume(s.id)
      refreshStores()
    } catch {}
    setActingStore(null)
  }

  const handleDelete = async (e: React.MouseEvent, s: StoreData) => {
    e.stopPropagation()
    if (!confirm(`هل تريد حذف متجر "${s.name}" نهائياً؟`)) return
    setActingStore(s.id)
    try {
      await storesApi.delete(s.id)
      refreshStores()
      if (activeStore?.id === s.id) setActiveStore(null)
      setShowStores(false)
    } catch {}
    setActingStore(null)
  }

  const pColor = activeStore ? (platformColors[activeStore.platform] ?? '#6a4cf5') : '#6a4cf5'

  return (
    <div style={{
      minHeight: isMobile ? 48 : 56, borderRadius: 15,
      margin: isMobile ? '10px 10px 0 10px' : '20px 20px 0 20px',
      display: 'flex', alignItems: 'center', padding: isMobile ? '0 12px' : '0 20px',
      gap: isMobile ? 8 : 12, flexShrink: 0, background: 'var(--canvas-soft)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)',
    }}>

      {/* Page title + optional back arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        {isSecondary && (
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-muted)' }}
          >
            <ArrowRight size={18} variant="Outline" />
          </button>
        )}
        <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
          {pageTitle}
        </span>
      </div>

      {children}

      {/* Stats badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(255,122,61,0.1)', borderRadius: 20,
          padding: '4px 10px', border: '1px solid rgba(255,122,61,0.2)',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff7a3d', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#ff7a3d', whiteSpace: 'nowrap' }}>
            {pending ?? '—'} معلق
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(255,85,119,0.08)', borderRadius: 20,
          padding: '4px 10px', border: '1px solid rgba(255,85,119,0.18)',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff5577', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#ff5577', whiteSpace: 'nowrap' }}>نافد</span>
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
              const isSelected = activeStore?.id === s.id
              const isHovered = hoveredStore === s.id
              const isActing = actingStore === s.id
              return (
                <div key={s.id}
                  onMouseEnter={() => setHoveredStore(s.id)}
                  onMouseLeave={() => setHoveredStore(null)}
                  style={{ position: 'relative' }}
                >
                  <button onClick={() => selectStore(s)} style={{
                    width: '100%', padding: '10px 14px', background: isSelected ? 'var(--canvas-soft-2)' : 'none',
                    border: 'none', textAlign: 'right', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.12s',
                  }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--canvas-soft-2)' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '' }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: c + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: c }}>{s.name[0]}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>{s.platform} · {s.isActive ? 'متصل' : 'متوقف'}</div>
                    </div>
                    {isSelected && !isHovered && <TickCircle size={14} color="#22c55e" variant="Outline" />}
                    {isHovered && !isActing && (
                      <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => handlePauseResume(e, s)}
                          title={s.isActive ? 'إيقاف مؤقت' : 'تشغيل'}
                          style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'var(--canvas-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.isActive ? '#ff7a3d' : '#22c55e' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas-soft-2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--canvas-soft)' }}
                        >
                          {s.isActive
                            ? <Pause size={12} variant="Outline" color="#ff7a3d" />
                            : <Play size={12} variant="Outline" color="#22c55e" />}
                        </button>
                        <button
                          onClick={e => handleDelete(e, s)}
                          title="حذف المتجر"
                          style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'var(--canvas-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,85,119,0.12)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--canvas-soft)' }}
                        >
                          <Trash size={12} variant="Outline" color="#ff5577" />
                        </button>
                      </div>
                    )}
                    {isActing && <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--ink-muted)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />}
                  </button>
                </div>
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
