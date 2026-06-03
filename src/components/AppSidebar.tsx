import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Notification as NotifIcon, ArrowDown2, MessageAdd1, Logout,
  SearchNormal1, Activity, Setting2, Receipt21, Edit2, Trash,
} from 'iconsax-react'
import { clearToken, notifications as notifApi, conversations as convApi } from '../lib/api'
import SearchModal from './SearchModal'

interface Conversation { id: string; title?: string }

interface AppSidebarProps {
  convList?: Conversation[]
  activeConv?: string | null
  onSelectConv?: (id: string) => void
  onNewChat?: () => void
  onDeleteConv?: (id: string) => void
  onRenameConv?: (id: string, title: string) => void
}

const BOTTOM_NAV = [
  { label: 'الإشعارات',   path: '/notifications', icon: NotifIcon },
  { label: 'سجل الأنشطة', path: '/activity',       icon: Activity },
  { label: 'الإعدادات',   path: '/settings',       icon: Setting2 },
  { label: 'الاشتراك',    path: '/billing',         icon: Receipt21 },
]

export default function AppSidebar({ convList, activeConv, onSelectConv, onNewChat, onDeleteConv, onRenameConv }: AppSidebarProps = {}) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === '1' } catch { return false }
  })
  const [unreadCount, setUnreadCount] = useState(0)
  const [internalConvList, setInternalConvList] = useState<Conversation[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [hoveredConv, setHoveredConv] = useState<string | null>(null)
  const [editingConv, setEditingConv] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('deema_user') || '{}') } catch { return {} }
  })()

  useEffect(() => {
    convApi.list().then(d => setInternalConvList(d.conversations.slice(0, 20))).catch(() => {})
    notifApi.list().then(d => setUnreadCount(d.unreadCount)).catch(() => {})
    const id = setInterval(() => {
      notifApi.list().then(d => setUnreadCount(d.unreadCount)).catch(() => {})
    }, 30000)
    return () => clearInterval(id)
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

  const list = convList ?? internalConvList
  const isDashboard = convList !== undefined

  const iconBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.4)', padding: 4, display: 'flex', borderRadius: 6,
  }

  return (
    <>
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

      <aside style={{
        width: collapsed ? 52 : 240,
        background: '#111',
        borderRadius: 30,
        margin: '20px 20px 20px 0',
        boxShadow: '0 8px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        transition: 'width 0.2s ease', overflow: 'hidden',
      }}>

        {/* ── Header: logo + search + collapse ── */}
        <div style={{
          padding: collapsed ? '12px 8px' : '12px 14px',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
        }}>
          {collapsed ? (
            <button onClick={() => toggle(false)} style={{ ...iconBtn, color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
              <ArrowDown2 size={14} variant="Outline" style={{ transform: 'rotate(-90deg)' }} />
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 11 }}>D</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.3px' }}>Deema</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <button onClick={() => setShowSearch(true)} title="بحث (Ctrl+K)" style={iconBtn}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                  <SearchNormal1 size={14} variant="Outline" />
                </button>
                <button onClick={() => toggle(true)} style={iconBtn}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                  <ArrowDown2 size={14} variant="Outline" style={{ transform: 'rotate(90deg)' }} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── New Chat button ── */}
        <div style={{ padding: collapsed ? '10px 6px' : '10px 10px', flexShrink: 0 }}>
          {onNewChat ? (
            <button onClick={onNewChat} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: collapsed ? '9px' : '9px 12px',
              borderRadius: 10, border: '1px solid rgba(106,76,245,0.4)',
              background: 'rgba(106,76,245,0.12)', cursor: 'pointer',
              color: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: 'inherit',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'background 0.15s, border-color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(106,76,245,0.22)'; e.currentTarget.style.borderColor = 'rgba(106,76,245,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(106,76,245,0.12)'; e.currentTarget.style.borderColor = 'rgba(106,76,245,0.4)' }}
            >
              <MessageAdd1 size={15} variant="Outline" color="#a78bfa" />
              {!collapsed && <span style={{ fontWeight: 500, color: '#c4b5fd' }}>محادثة جديدة</span>}
            </button>
          ) : (
            <button onClick={() => navigate('/dashboard')} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: collapsed ? '9px' : '9px 12px',
              borderRadius: 10, border: '1px solid rgba(106,76,245,0.4)',
              background: 'rgba(106,76,245,0.12)', cursor: 'pointer',
              color: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: 'inherit',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'background 0.15s, border-color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(106,76,245,0.22)'; e.currentTarget.style.borderColor = 'rgba(106,76,245,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(106,76,245,0.12)'; e.currentTarget.style.borderColor = 'rgba(106,76,245,0.4)' }}
            >
              <MessageAdd1 size={15} variant="Outline" color="#a78bfa" />
              {!collapsed && <span style={{ fontWeight: 500, color: '#c4b5fd' }}>محادثة جديدة</span>}
            </button>
          )}
        </div>

        {/* ── Conversation list ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '4px 6px' : '4px 8px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          {!collapsed && list.length > 0 && (
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 6px 6px' }}>
              المحادثات السابقة
            </div>
          )}
          {list.length === 0 && !collapsed && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', padding: '16px 8px', textAlign: 'center' }}>
              لا توجد محادثات بعد
            </div>
          )}
          {list.map(c => (
            <div key={c.id}
              style={{ position: 'relative', marginBottom: 1 }}
              onMouseEnter={() => setHoveredConv(c.id)}
              onMouseLeave={() => setHoveredConv(null)}
            >
              {isDashboard && editingConv === c.id ? (
                <form onSubmit={e => { e.preventDefault(); onRenameConv?.(c.id, editTitle); setEditingConv(null) }}
                  style={{ padding: '3px 6px' }}>
                  <input autoFocus value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onBlur={() => { onRenameConv?.(c.id, editTitle); setEditingConv(null) }}
                    onKeyDown={e => { if (e.key === 'Escape') setEditingConv(null) }}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '5px 8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, color: '#fff', fontSize: 12, fontFamily: 'inherit', outline: 'none' }}
                  />
                </form>
              ) : (
                <button
                  onClick={() => isDashboard ? onSelectConv?.(c.id) : navigate(`/dashboard?conv=${c.id}`)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 7,
                    padding: collapsed ? '8px' : '6px 8px',
                    borderRadius: 8, border: 'none',
                    background: c.id === activeConv ? 'rgba(106,76,245,0.15)' : hoveredConv === c.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    transition: 'background 0.12s',
                  }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.id === activeConv ? '#a78bfa' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                  {!collapsed && (
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: c.id === activeConv ? '#c4b5fd' : 'rgba(255,255,255,0.55)' }}>
                      {c.title || 'محادثة'}
                    </span>
                  )}
                  {!collapsed && isDashboard && hoveredConv === c.id && (
                    <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                      <button onClick={e => { e.stopPropagation(); setEditTitle(c.title || ''); setEditingConv(c.id) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, borderRadius: 4, color: 'rgba(255,255,255,0.35)', display: 'flex' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                        <Edit2 size={11} variant="Outline" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); onDeleteConv?.(c.id) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, borderRadius: 4, color: 'rgba(255,255,255,0.35)', display: 'flex' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ff5577')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                        <Trash size={11} variant="Outline" />
                      </button>
                    </div>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ── Bottom pinned section ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ padding: collapsed ? '8px 6px' : '8px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {BOTTOM_NAV.map(({ label, path, icon: Icon }) => {
              const active = location.pathname === path
              const isNotif = path === '/notifications'
              return (
                <button key={path} onClick={() => navigate(path)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: collapsed ? '8px' : '7px 10px',
                  borderRadius: 8, border: 'none',
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  transition: 'background 0.12s',
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Icon size={15} variant="Outline" color={active ? '#fff' : 'rgba(255,255,255,0.55)'} />
                    {isNotif && unreadCount > 0 && (
                      <div style={{ position: 'absolute', top: -3, left: -3, minWidth: 13, height: 13, borderRadius: 7, background: '#ff5577', fontSize: 8, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                  {!collapsed && (
                    <span style={{ fontSize: 13, color: active ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: active ? 600 : 400 }}>{label}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Divider + profile row */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 8px' }} />

          {/* Logout confirm modal */}
          {showLogoutConfirm && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setShowLogoutConfirm(false)}>
              <div style={{ background: '#1a1a1a', borderRadius: 16, padding: '24px', width: 300, border: '1px solid rgba(255,255,255,0.1)', fontFamily: "'Zain','Inter',sans-serif", direction: 'rtl', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
                onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>تسجيل الخروج</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>هل أنت متأكد أنك تريد تسجيل الخروج؟</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleLogout} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#ff5577', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    تسجيل الخروج
                  </button>
                  <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{
            padding: collapsed ? '10px 8px' : '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            {/* Avatar — click goes to settings */}
            <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                {(user.name || 'م')[0]}
              </div>
            </button>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'مستخدم'}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email || ''}</div>
                </div>
                {/* Logout icon — only this triggers confirm */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  title="تسجيل الخروج"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', flexShrink: 0, color: 'rgba(255,255,255,0.3)', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ff5577')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  <Logout size={14} variant="Outline" />
                </button>
              </>
            )}
            {/* Collapsed: logout icon only */}
            {collapsed && (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                title="تسجيل الخروج"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', color: 'rgba(255,255,255,0.3)', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ff5577')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
              >
                <Logout size={14} variant="Outline" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
