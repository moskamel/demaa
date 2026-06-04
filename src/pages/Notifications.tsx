import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { InfoCircle, Warning2, Clock, TickCircle, ChartSquare, Electricity, Box, Truck, Notification as NotificationIcon } from 'iconsax-react'
import { notifications as notifApi, type Notification } from '../lib/api'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'

const typeConfig: Record<string, { icon: typeof NotificationIcon; color: string; bg: string }> = {
  low_stock: { icon: Box, color: '#ff7a3d', bg: 'rgba(255,122,61,0.12)' },
  suspicious_order: { icon: Warning2, color: '#ff5577', bg: 'rgba(255,85,119,0.12)' },
  payment_failed: { icon: InfoCircle, color: '#ff5577', bg: 'rgba(255,85,119,0.12)' },
  pending_too_long: { icon: Clock, color: '#ff7a3d', bg: 'rgba(255,122,61,0.12)' },
  weekly_report: { icon: ChartSquare, color: '#6a4cf5', bg: 'rgba(106,76,245,0.12)' },
  connector_expired: { icon: Electricity, color: '#ff7a3d', bg: 'rgba(255,122,61,0.12)' },
  orders_accepted: { icon: TickCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  shipment_created: { icon: Truck, color: '#0099ff', bg: 'rgba(0,153,255,0.12)' },
}

const priorityLabel: Record<string, string> = { urgent: 'عاجل', important: 'مهم', info: 'معلومة' }
const priorityColor: Record<string, string> = { urgent: '#ff5577', important: '#ff7a3d', info: 'var(--ink-muted)' }

export default function Notifications() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')

  useEffect(() => {
    notifApi.list().then(data => {
      setNotifs(data.notifications)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await notifApi.markAllRead().catch(() => {})
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
  }
  const markRead = async (id: string) => {
    await notifApi.markRead(id).catch(() => {})
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'urgent') return n.priority === 'urgent'
    return true
  })

  const unreadCount = notifs.filter(n => !n.isRead).length

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--canvas)' }}>
      <AppHeader />

      <div style={{ padding: '30px 30px 30px 20px' }}>
        {/* filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--canvas-soft)', borderRadius: 10, padding: 4 }}>
          {([['all', 'الكل'], ['unread', 'غير مقروء'], ['urgent', 'عاجل']] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              style={{ flex: 1, padding: '7px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', background: filter === v ? 'var(--canvas-soft-2)' : 'transparent', color: filter === v ? 'var(--ink)' : 'var(--ink-muted)', transition: 'all 0.15s' }}
            >
              {l}
              {v === 'unread' && unreadCount > 0 && <span style={{ marginRight: 5, background: 'var(--gradient-coral)', color: '#fff', borderRadius: 100, fontSize: 9, padding: '1px 5px' }}>{unreadCount}</span>}
            </button>
          ))}
        </div>

        {/* list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="animate-fade-in-scale" style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-muted)' }}>لا توجد إشعارات</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map((n, i) => {
              const cfg = typeConfig[n.type] || { icon: Notification, color: '#6a4cf5', bg: 'rgba(106,76,245,0.12)' }
              const Icon = cfg.icon
              const isRead = n.isRead
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="animate-fade-in-up"
                  style={{
                    background: isRead ? 'var(--canvas-soft)' : 'var(--canvas-soft)',
                    borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
                    border: '1px solid', borderColor: isRead ? 'var(--hairline)' : 'rgba(77,124,255,0.25)',
                    animationDelay: `${i * 50}ms`,
                    transition: 'transform 0.15s var(--ease-spring), box-shadow 0.15s ease, border-color 0.2s ease, background 0.2s ease',
                    opacity: isRead ? 0.75 : 1,
                    boxShadow: isRead ? 'none' : '0 2px 12px rgba(77,124,255,0.08)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isRead ? 'none' : '0 2px 12px rgba(77,124,255,0.08)'; e.currentTarget.style.opacity = isRead ? '0.75' : '1' }}
                >
                  {/* icon */}
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.2s var(--ease-spring)' }}>
                    <Icon size={16} color={cfg.color} variant="Outline" />
                  </div>

                  {/* text */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: isRead ? 500 : 700, color: 'var(--ink)' }}>{n.title}</span>
                      <span style={{ fontSize: 10, color: priorityColor[n.priority], background: priorityColor[n.priority] + '18', borderRadius: 4, padding: '2px 7px', marginRight: 'auto', fontWeight: 600 }}>{priorityLabel[n.priority]}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{n.body}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-disabled)', marginTop: 6 }}>
                      {new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* unread dot with pulse */}
                  {!isRead && (
                    <div style={{ position: 'relative', width: 8, height: 8, marginTop: 6, flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4d7cff' }} />
                      <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: '2px solid #4d7cff', animation: 'pulseRing 1.8s ease-out infinite' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

