import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Shop, ChartSquare, People, Electricity,
  Notification as NotifIcon, ArrowDown2, MessageAdd1, Logout,
  SearchNormal1, Activity, Profile2User, PercentageSquare,
  Setting2, Receipt21, Edit2, Trash,
} from 'iconsax-react'
import { clearToken, notifications as notifApi } from '../lib/api'
import SearchModal from './SearchModal'

const NAV_PRIMARY = [
  { to: '/stores', icon: Shop, label: 'متاجري' },
  { to: '/reports', icon: ChartSquare, label: 'التقارير' },
  { to: '/customers', icon: Profile2User, label: 'العملاء' },
  { to: '/team', icon: People, label: 'الفريق' },
  { to: '/connectors', icon: Electricity, label: 'التطبيقات' },
]

interface Conversation { id: string; title?: string }

interface AppSidebarProps {
  convList?: Conversation[]
  activeConv?: string | null
  onSelectConv?: (id: string) => void
  onNewChat?: () => void
  onDeleteConv?: (id: string) => void
  onRenameConv?: (id: string, title: string) => void
}

export default function AppSidebar({ convList, activeConv, onSelectConv, onNewChat, onDeleteConv, onRenameConv }: AppSidebarProps = {}) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === '1' } catch { return false }
  })
  const [unreadCount, setUnreadCount] = useState(0)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [hoveredConv, setHoveredConv] = useState<string | null>(null)
  const [editingConv, setEditingConv] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const profileRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
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
      <Link to={to}
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

  const profileMenuItem = (label: string, onClick: () => void, danger = false) => (
    <button onClick={onClick} style={{
      width: '100%', padding: '10px 14px', background: 'none', border: 'none',
      textAlign: 'right', fontSize: 13, color: danger ? '#ff5577' : 'rgba(255,255,255,0.85)',
      cursor: 'pointer', fontFamily: 'inherit', display: 'block', transition: 'background 0.12s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(255,85,119,0.12)' : 'rgba(255,255,255,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.background = '' }}
    >
      {label}
    </button>
  )

  return (
    <>
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

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
          <button onClick={() => setShowSearch(true)} style={btn(collapsed)} title="بحث (Ctrl+K)"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
            <SearchNormal1 size={16} variant="Outline" color="rgba(255,255,255,0.7)" />
            {!collapsed && <span style={lbl}>بحث</span>}
            {!collapsed && <kbd style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 5px', marginRight: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>⌘K</kbd>}
          </button>

          {/* New chat */}
          {onNewChat ? (
            <button onClick={onNewChat} style={{ ...btn(collapsed), background: 'rgba(255,255,255,0.1)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)' }}>
              <MessageAdd1 size={16} variant="Outline" color="#fff" />
              {!collapsed && <span style={{ ...lbl, color: '#fff', fontWeight: 500 }}>محادثة جديدة</span>}
            </button>
          ) : (
            <Link to="/dashboard" style={{ ...btn(collapsed), background: 'rgba(255,255,255,0.1)', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)' }}>
              <MessageAdd1 size={16} variant="Outline" color="#fff" />
              {!collapsed && <span style={{ ...lbl, color: '#fff', fontWeight: 500 }}>محادثة جديدة</span>}
            </Link>
          )}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '6px 4px' }} />

          {/* Primary nav */}
          {NAV_PRIMARY.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} icon={icon} label={label} />
          ))}
        </div>

        {/* Conversations list (Dashboard only) */}
        {convList !== undefined && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 4, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {!collapsed && <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 8px 4px' }}>المحادثات السابقة</div>}
            {convList.length === 0 && !collapsed && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', padding: '8px 10px', textAlign: 'center', marginTop: 8 }}>لا توجد محادثات بعد</div>}
            {convList.map(c => (
              <div key={c.id}
                style={{ position: 'relative', marginBottom: 1 }}
                onMouseEnter={() => setHoveredConv(c.id)}
                onMouseLeave={() => setHoveredConv(null)}
              >
                {editingConv === c.id ? (
                  <form onSubmit={e => { e.preventDefault(); onRenameConv?.(c.id, editTitle); setEditingConv(null) }}
                    style={{ padding: '4px 8px' }}>
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={() => { onRenameConv?.(c.id, editTitle); setEditingConv(null) }}
                      onKeyDown={e => { if (e.key === 'Escape') setEditingConv(null) }}
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '5px 8px',
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 6, color: '#fff', fontSize: 12, fontFamily: 'inherit', outline: 'none',
                      }}
                    />
                  </form>
                ) : (
                  <button onClick={() => onSelectConv?.(c.id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: collapsed ? '8px 10px' : '7px 10px',
                    borderRadius: 8, border: 'none',
                    background: c.id === activeConv ? 'rgba(255,255,255,0.1)' : hoveredConv === c.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                    cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    transition: 'background 0.12s',
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                    {!collapsed && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: c.id === activeConv ? '#fff' : 'rgba(255,255,255,0.6)' }}>{c.title || 'محادثة'}</span>}
                    {!collapsed && hoveredConv === c.id && (
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                        <button
                          onClick={e => { e.stopPropagation(); setEditTitle(c.title || ''); setEditingConv(c.id) }}
                          title="تعديل الاسم"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, borderRadius: 4, color: 'rgba(255,255,255,0.4)', display: 'flex', transition: 'color 0.12s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                        >
                          <Edit2 size={12} variant="Outline" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); onDeleteConv?.(c.id) }}
                          title="حذف المحادثة"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, borderRadius: 4, color: 'rgba(255,255,255,0.4)', display: 'flex', transition: 'color 0.12s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#ff5577')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                        >
                          <Trash size={12} variant="Outline" />
                        </button>
                      </div>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {convList === undefined && <div style={{ flex: 1 }} />}

        {/* Profile section with popup menu */}
        <div ref={profileRef} style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>

          {/* Profile menu popup */}
          {showProfileMenu && (
            <div style={{
              position: 'absolute', bottom: '100%', right: 0, left: 0,
              background: '#1a1a1a', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
              marginBottom: 4, overflow: 'hidden', zIndex: 300,
              fontFamily: "'Zain','Inter',sans-serif", direction: 'rtl',
            }}>
              {/* User info */}
              {!collapsed && (
                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{user.name || 'مستخدم'}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', direction: 'ltr', textAlign: 'right' }}>{user.email || ''}</div>
                </div>
              )}
              {profileMenuItem('الإشعارات', () => { navigate('/notifications'); setShowProfileMenu(false) })}
              {profileMenuItem('سجل الأنشطة', () => { navigate('/activity'); setShowProfileMenu(false) })}
              {profileMenuItem('الكوبونات', () => { navigate('/coupons'); setShowProfileMenu(false) })}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
              {profileMenuItem('الإعدادات', () => { navigate('/settings'); setShowProfileMenu(false) })}
              {profileMenuItem('الاشتراك', () => { navigate('/billing'); setShowProfileMenu(false) })}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
              {profileMenuItem('تسجيل الخروج', () => { handleLogout() }, true)}
            </div>
          )}

          {/* Profile trigger */}
          <button
            onClick={() => setShowProfileMenu(v => !v)}
            style={{
              width: '100%', padding: collapsed ? '10px 8px' : '10px 12px',
              background: showProfileMenu ? 'rgba(255,255,255,0.06)' : 'none',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { if (!showProfileMenu) e.currentTarget.style.background = '' }}
          >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6a4cf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {(user.name || 'م')[0]}
            </div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'مستخدم'}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email || ''}</div>
                </div>
                <ArrowDown2 size={12} variant="Outline" color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, transform: showProfileMenu ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
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
    </>
  )
}
