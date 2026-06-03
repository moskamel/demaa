import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Shop, ChartSquare, People, Electricity,
  Notification as NotifIcon, ArrowDown2, MessageAdd1, Logout,
  SearchNormal1, Activity, Profile2User, PercentageSquare,
  Setting2, Receipt21,
} from 'iconsax-react'
import { clearToken, notifications as notifApi } from '../lib/api'

const NAV_PRIMARY = [
  { to: '/stores', icon: Shop, label: 'متاجري' },
  { to: '/reports', icon: ChartSquare, label: 'التقارير' },
  { to: '/customers', icon: Profile2User, label: 'العملاء' },
  { to: '/team', icon: People, label: 'الفريق' },
  { to: '/connectors', icon: Electricity, label: 'التطبيقات' },
]

const NAV_SECONDARY = [
  { to: '/notifications', icon: NotifIcon, label: 'الإشعارات' },
  { to: '/activity', icon: Activity, label: 'سجل الأنشطة' },
  { to: '/coupons', icon: PercentageSquare, label: 'الكوبونات' },
]

const NAV_BOTTOM = [
  { to: '/settings', icon: Setting2, label: 'الإعدادات' },
  { to: '/billing', icon: Receipt21, label: 'الاشتراك' },
]

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === '1' } catch { return false }
  })
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('deema_user') || '{}') } catch { return {} }
  })()

  useEffect(() => {
    notifApi.list().then(d => setUnreadCount(d.unreadCount)).catch(() => {})
    const id = setInterval(() => {
      notifApi.list().then(d => setUnreadCount(d.unreadCount)).catch(() => {})
    }, 30000)
    return () => clearInterval(id)
  }, [])

  const toggle = (v: boolean) => {
    setCollapsed(v)
    try { localStorage.setItem('sidebar_collapsed', v ? '1' : '0') } catch {}
  }

  const handleLogout = () => { clearToken(); navigate('/login') }

  const btn = (c: boolean): React.CSSProperties => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: c ? '8px 10px' : '7px 10px',
    borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer',
    color: 'rgba(255,255,255,0.65)', fontSize: 13, fontFamily: 'inherit',
    justifyContent: c ? 'center' : 'flex-start', transition: 'background 0.15s',
  })

  const lbl: React.CSSProperties = {
    fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 400,
  }

  const NavLink = ({ to, icon: Icon, label, badge }: { to: string; icon: typeof Shop; label: string; badge?: number }) => {
    const active = location.pathname === to
    return (
      <Link key={to} to={to}
        style={{ ...btn(collapsed), background: active ? 'rgba(255,255,255,0.12)' : 'transparent', textDecoration: 'none', position: 'relative' }}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Icon size={16} variant="Outline" color={active ? '#fff' : 'rgba(255,255,255,0.7)'} />
          {badge && badge > 0 ? (
            <div style={{ position: 'absolute', top: -4, left: -4, minWidth: 14, height: 14, borderRadius: 7, background: '#ff5577', fontSize: 9, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
              {badge > 99 ? '99+' : badge}
            </div>
          ) : null}
        </div>
        {!collapsed && <span style={{ ...lbl, color: active ? '#fff' : 'rgba(255,255,255,0.75)', fontWeight: active ? 600 : 400 }}>{label}</span>}
      </Link>
    )
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
          <button onClick={() => toggle(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4, display: 'flex', borderRadius: 6 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
            <ArrowDown2 size={14} variant="Outline" style={{ transform: 'rotate(90deg)' }} />
          </button>
        )}
      </div>

      {/* Nav actions + links */}
      <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>

        {/* Search */}
        <button style={btn(collapsed)} title="بحث"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
          <SearchNormal1 size={16} variant="Outline" color="rgba(255,255,255,0.7)" />
          {!collapsed && <span style={lbl}>بحث</span>}
          {!collapsed && <kbd style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 5px', marginRight: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>⌘K</kbd>}
        </button>

        {/* New chat */}
        <Link to="/dashboard" style={{ ...btn(collapsed), background: 'rgba(255,255,255,0.1)', textDecoration: 'none' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)' }}>
          <MessageAdd1 size={16} variant="Outline" color="#fff" />
          {!collapsed && <span style={{ ...lbl, color: '#fff', fontWeight: 500 }}>محادثة جديدة</span>}
        </Link>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '6px 4px' }} />

        {/* Primary nav */}
        {NAV_PRIMARY.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} icon={icon} label={label} />
        ))}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '6px 4px' }} />

        {/* Secondary nav */}
        {NAV_SECONDARY.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} icon={icon} label={label} badge={to === '/notifications' ? unreadCount : undefined} />
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom nav */}
      <div style={{ padding: '6px 8px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        {NAV_BOTTOM.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} icon={icon} label={label} />
        ))}
      </div>

      {/* User + logout */}
      <div style={{ padding: collapsed ? '10px 8px' : '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6a4cf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {(user.name || 'م')[0]}
        </div>
        {!collapsed ? (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'مستخدم'}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email || ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button onClick={() => toggle(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6, display: 'flex' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                <ArrowDown2 size={13} variant="Outline" style={{ transform: 'rotate(90deg)' }} />
              </button>
              <button onClick={handleLogout} title="تسجيل الخروج" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6, display: 'flex' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ff5577')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                <Logout size={13} variant="Outline" />
              </button>
            </div>
          </>
        ) : (
          <button onClick={handleLogout} title="تسجيل الخروج" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6, display: 'flex' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ff5577')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
            <Logout size={14} variant="Outline" />
          </button>
        )}
      </div>

      {/* Expand when collapsed */}
      {collapsed && (
        <button onClick={() => toggle(false)}
          style={{ position: 'absolute', bottom: 80, right: 14, width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
          <ArrowDown2 size={12} variant="Outline" style={{ transform: 'rotate(-90deg)' }} />
        </button>
      )}
    </aside>
  )
}
