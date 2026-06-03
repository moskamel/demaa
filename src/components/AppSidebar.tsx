import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Shop, ChartSquare, People, Electricity,
  Notification as NotifIcon, ArrowDown2, MessageAdd1, Logout,
  Profile2User, Setting2, Card, Activity,
} from 'iconsax-react'
import { clearToken } from '../lib/api'

const NAV = [
  { to: '/dashboard', icon: MessageAdd1, label: 'المساعد' },
  { to: '/stores', icon: Shop, label: 'متاجري' },
  { to: '/reports', icon: ChartSquare, label: 'التقارير' },
  { to: '/customers', icon: Profile2User, label: 'العملاء' },
  { to: '/team', icon: People, label: 'الفريق' },
  { to: '/connectors', icon: Electricity, label: 'التطبيقات' },
  { to: '/notifications', icon: NotifIcon, label: 'الإشعارات' },
]

const NAV_BOTTOM = [
  { to: '/activity', icon: Activity, label: 'السجل' },
  { to: '/billing', icon: Card, label: 'الاشتراك' },
  { to: '/settings', icon: Setting2, label: 'الإعدادات' },
]
  { to: '/notifications', icon: NotifIcon, label: 'الإشعارات' },
]

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('deema_user') || '{}') } catch { return {} }
  })()

  const handleLogout = () => { clearToken(); navigate('/login') }

  const btn = (c: boolean): React.CSSProperties => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: c ? '8px 10px' : '7px 10px',
    borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer',
    color: 'rgba(255,255,255,0.65)', fontSize: 13, fontFamily: 'inherit',
    justifyContent: c ? 'center' : 'flex-start', transition: 'background 0.15s',
  })

  const label: React.CSSProperties = {
    fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 400,
  }

  return (
    <aside style={{
      width: collapsed ? 56 : 240,
      background: '#111',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      transition: 'width 0.2s ease', overflow: 'hidden', position: 'relative',
    }}>
      {/* Logo + collapse */}
      <div style={{ padding: collapsed ? '14px 10px' : '14px 12px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#000', fontWeight: 700, fontSize: 12 }}>D</span>
          </div>
          {!collapsed && <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.4px' }}>Deema</span>}
        </div>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4, display: 'flex', borderRadius: 6 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
            <ArrowDown2 size={14} variant="Outline" style={{ transform: 'rotate(90deg)' }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        {NAV.map(({ to, icon: Icon, label: lbl }) => {
          const active = location.pathname === to || (to === '/dashboard' && location.pathname === '/dashboard')
          return (
            <Link key={to} to={to}
              style={{
                ...btn(collapsed),
                background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Icon size={16} variant="Outline" color={active ? '#fff' : 'rgba(255,255,255,0.7)'} />
              {!collapsed && <span style={{ ...label, color: active ? '#fff' : 'rgba(255,255,255,0.75)', fontWeight: active ? 600 : 400 }}>{lbl}</span>}
            </Link>
          )
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom nav: Activity, Billing, Settings */}
      <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 2, borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        {NAV_BOTTOM.map(({ to, icon: Icon, label: lbl }) => {
          const active = location.pathname === to
          return (
            <Link key={to} to={to}
              style={{ ...btn(collapsed), background: active ? 'rgba(255,255,255,0.12)' : 'transparent', textDecoration: 'none' }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Icon size={16} variant="Outline" color={active ? '#fff' : 'rgba(255,255,255,0.5)'} />
              {!collapsed && <span style={{ ...label, color: active ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: active ? 600 : 400 }}>{lbl}</span>}
            </Link>
          )
        })}
      </div>

      {/* User + logout */}
      <div style={{ padding: collapsed ? '10px 8px' : '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6a4cf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {(user.name || 'م')[0]}
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'مستخدم'}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email || ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6, display: 'flex' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                <ArrowDown2 size={13} variant="Outline" style={{ transform: 'rotate(90deg)' }} />
              </button>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6, display: 'flex' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ff5577')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                <Logout size={13} variant="Outline" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button onClick={() => setCollapsed(false)}
          style={{ position: 'absolute', bottom: 70, right: 14, width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
          <ArrowDown2 size={12} variant="Outline" style={{ transform: 'rotate(-90deg)' }} />
        </button>
      )}
    </aside>
  )
}
