import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { orders as ordersApi, clearToken } from '../lib/api'

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

interface AppHeaderProps {
  title?: string
  children?: React.ReactNode
}

export default function AppHeader({ title, children }: AppHeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = title ?? PAGE_TITLES[location.pathname] ?? ''

  const [pending, setPending] = useState<number | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const rawUser = localStorage.getItem('deema_user')
  const user = rawUser ? JSON.parse(rawUser) as { name: string; email: string } : null
  const initials = user?.name?.slice(0, 1).toUpperCase() ?? 'U'

  useEffect(() => {
    ordersApi.stats().then(s => setPending(s.pending)).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

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
        {/* Pending orders */}
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

        {/* Low stock placeholder — links to reports */}
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

      {/* Avatar + dropdown */}
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setShowMenu(v => !v)}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6a4cf5, #d44df0)',
            border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
            transition: 'transform 0.15s var(--ease-spring), box-shadow 0.15s',
            boxShadow: showMenu ? '0 0 0 3px rgba(106,76,245,0.25)' : 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = '' }}
        >
          {initials}
        </button>

        {showMenu && (
          <div className="animate-fade-in-scale" style={{
            position: 'absolute', top: 42, left: 0,
            background: 'var(--canvas-soft)', borderRadius: 14,
            border: '1px solid var(--hairline)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            minWidth: 200, zIndex: 200, overflow: 'hidden',
            fontFamily: "'Zain','Inter',sans-serif", direction: 'rtl',
          }}>
            {/* User info */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{user?.name ?? 'المستخدم'}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)', direction: 'ltr', textAlign: 'right' }}>{user?.email ?? ''}</div>
            </div>

            {/* Menu items */}
            {[
              { label: 'الملف الشخصي', path: '/settings' },
              { label: 'الاشتراك والفواتير', path: '/billing' },
            ].map(item => (
              <button key={item.path} onClick={() => { navigate(item.path); setShowMenu(false) }} style={{
                width: '100%', padding: '11px 16px', background: 'none', border: 'none',
                textAlign: 'right', fontSize: 13, color: 'var(--ink)', cursor: 'pointer',
                fontFamily: 'inherit', display: 'block', transition: 'background 0.12s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas-soft-2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '' }}
              >
                {item.label}
              </button>
            ))}

            <div style={{ height: 1, background: 'var(--hairline)', margin: '4px 0' }} />

            <button onClick={handleLogout} style={{
              width: '100%', padding: '11px 16px', background: 'none', border: 'none',
              textAlign: 'right', fontSize: 13, color: '#ff5577', cursor: 'pointer',
              fontFamily: 'inherit', display: 'block', transition: 'background 0.12s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,85,119,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '' }}
            >
              تسجيل الخروج
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
