import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, AlertCircle, AlertTriangle, Clock, CheckCircle, BarChart2, Plug, Package, Truck, Bell } from 'lucide-react'
import { notifications as notifApi, type Notification } from '../lib/api'

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  low_stock: { icon: Package, color: '#ff7a3d', bg: 'rgba(255,122,61,0.12)' },
  suspicious_order: { icon: AlertTriangle, color: '#ff5577', bg: 'rgba(255,85,119,0.12)' },
  payment_failed: { icon: AlertCircle, color: '#ff5577', bg: 'rgba(255,85,119,0.12)' },
  pending_too_long: { icon: Clock, color: '#ff7a3d', bg: 'rgba(255,122,61,0.12)' },
  weekly_report: { icon: BarChart2, color: '#6a4cf5', bg: 'rgba(106,76,245,0.12)' },
  connector_expired: { icon: Plug, color: '#ff7a3d', bg: 'rgba(255,122,61,0.12)' },
  orders_accepted: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
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
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', paddingBottom: 60 }}>
      {/* top bar */}
      <div style={{ borderBottom: '1px solid var(--hairline)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13 }}>
          <ChevronLeft size={14} /> الرئيسية
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>الإشعارات</span>
        {unreadCount > 0 && (
          <span style={{ background: 'var(--gradient-coral)', color: '#fff', borderRadius: 100, fontSize: 10, fontWeight: 700, padding: '2px 7px' }}>{unreadCount}</span>
        )}
        <div style={{ flex: 1 }} />
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer' }}>
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 24px' }}>
        {/* filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--surface-1)', borderRadius: 10, padding: 4 }}>
          {([['all', 'الكل'], ['unread', 'غير مقروء'], ['urgent', 'عاجل']] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              style={{ flex: 1, padding: '7px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', background: filter === v ? 'var(--surface-2)' : 'transparent', color: filter === v ? 'var(--ink)' : 'var(--ink-muted)', transition: 'all 0.15s' }}
            >
              {l}
              {v === 'unread' && unreadCount > 0 && <span style={{ marginRight: 5, background: 'var(--gradient-coral)', color: '#fff', borderRadius: 100, fontSize: 9, padding: '1px 5px' }}>{unreadCount}</span>}
            </button>
          ))}
        </div>

        {/* list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)', fontSize: 14 }}>
            جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)', fontSize: 14 }}>
            لا توجد إشعارات
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map((n, i) => {
              const cfg = typeConfig[n.type] || { icon: Bell, color: '#6a4cf5', bg: 'rgba(106,76,245,0.12)' }
              const Icon = cfg.icon
              const isRead = n.isRead
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{ background: isRead ? 'transparent' : 'var(--surface-1)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', border: '1px solid', borderColor: isRead ? 'transparent' : 'var(--hairline)', marginBottom: i < filtered.length - 1 ? 2 : 0 }}
                >
                  {/* icon */}
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={cfg.color} />
                  </div>

                  {/* text */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: isRead ? 500 : 600, color: 'var(--ink)' }}>{n.title}</span>
                      <span style={{ fontSize: 10, color: priorityColor[n.priority], background: priorityColor[n.priority] + '18', borderRadius: 4, padding: '1px 6px', marginRight: 'auto' }}>{priorityLabel[n.priority]}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{n.body}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 5 }}>{n.createdAt}</div>
                  </div>

                  {/* unread dot */}
                  {!isRead && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-blue)', marginTop: 6, flexShrink: 0 }} />}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

