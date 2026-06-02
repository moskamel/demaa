import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell, Plus, Send, ChevronDown, Settings, History, Package, AlertTriangle,
  Store, Plug, Users, CreditCard, Lightbulb, MessageSquarePlus, X, Brain, Search,
  BarChart2,
} from 'lucide-react'
import { conversations as convApi, orders as ordersApi, notifications as notifApi, storesApi, type Notification as ApiNotif, type StoreData } from '../lib/api'
import type { Message, OrderRow, ProductRow } from '../types/chat'
import OrderDetailDrawer from '../components/OrderDetailDrawer'
import SearchModal from '../components/SearchModal'

// ── Status helpers ───────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  pending: 'var(--gradient-orange)', accepted: 'var(--semantic-success)',
  shipped: '#0099ff', delivered: 'var(--semantic-success)',
  rejected: 'var(--gradient-coral)', cancelled: 'var(--ink-muted)',
}
const statusLabels: Record<string, string> = {
  pending: 'معلق', accepted: 'مقبول', shipped: 'مشحون',
  delivered: 'مُسلَّم', rejected: 'مرفوض', cancelled: 'ملغي',
}
const paymentLabels: Record<string, string> = {
  card: 'بطاقة', cash: 'كاش ⚠️', tabby: 'تابby', tamara: 'تمارا',
}

// ── Quick actions ────────────────────────────────────────────────────────────
const QUICK = [
  { label: 'الطلبات', cmd: 'وريني الطلبات المعلقة' },
  { label: 'اقبل الكل', cmd: 'اقبل الطلبات السليمة' },
  { label: 'الشحن', cmd: 'اشحن الطلبات المقبولة' },
  { label: 'المنتجات', cmd: 'وريني المنتجات' },
  { label: 'المخزون', cmd: 'كام باقي من المنتجات' },
  { label: 'مبيعات اليوم', cmd: 'مبيعات اليوم' },
  { label: 'كوبون خصم', cmd: 'اعمل كوبون خصم 15%' },
  { label: 'الأنشطة', cmd: 'سجل الأنشطة' },
]

// ── Conversations ────────────────────────────────────────────────────────────
const CONVS = [
  { id: 1, title: 'طلبات اليوم', time: 'الآن', active: true },
  { id: 2, title: 'إضافة منتج', time: 'أمس' },
  { id: 3, title: 'تقرير الأسبوع', time: '٣ أيام' },
  { id: 4, title: 'كوبون الجمعة', time: '٥ أيام' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function OrderListView({ rows, onOrderClick }: { rows: OrderRow[]; onOrderClick?: (id: string) => void }) {
  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 12, overflow: 'hidden' }}>
      {rows.map((o, i) => (
        <div key={o.id} onClick={() => onOrderClick?.(o.id)} style={{ background: 'var(--canvas)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: i < rows.length - 1 ? '1px solid var(--hairline)' : 'none', cursor: onOrderClick ? 'pointer' : 'default', transition: 'background 0.1s' }} onMouseEnter={e => { if (onOrderClick) e.currentTarget.style.background = 'var(--canvas-soft)' }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--canvas)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.2px' }}>#{o.id}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>·</span>
              <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{o.customer}</span>
              {o.issue && <span style={{ fontSize: 10, color: 'var(--gradient-orange)', background: 'rgba(255,122,61,0.12)', borderRadius: 4, padding: '1px 6px' }}>⚠️ {o.issue}</span>}
              {o.riskScore && o.riskScore >= 60 && (
                <span title={o.suspiciousReason} style={{ fontSize: 10, fontWeight: 700, color: o.riskScore >= 80 ? '#ff5577' : '#ff7a3d', background: o.riskScore >= 80 ? 'rgba(255,85,119,0.12)' : 'rgba(255,122,61,0.12)', borderRadius: 4, padding: '1px 6px', cursor: 'default' }}>
                  خطر {o.riskScore}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--ink-muted)' }}>
              <span>📍 {o.city}</span><span>·</span>
              <span>{paymentLabels[o.payment] || o.payment}</span>
              {o.shipmentId && <><span>·</span><span style={{ color: '#0099ff', fontSize: 10 }}>{o.shipmentId}</span></>}
            </div>
          </div>
          <div style={{ textAlign: 'left', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{(o.total / 100).toLocaleString('ar-EG')} ج.م</div>
            <div style={{ fontSize: 10, color: statusColors[o.status], textAlign: 'center', marginTop: 2 }}>{statusLabels[o.status]}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductListView({ rows }: { rows: ProductRow[] }) {
  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 12, overflow: 'hidden' }}>
      {rows.map((p, i) => (
        <div key={p.id} style={{ background: 'var(--canvas)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: i < rows.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{p.category} · {p.id}</div>
          </div>
          <div style={{ textAlign: 'left', flexShrink: 0, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{p.price.toLocaleString('ar-EG')} ج.م</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: p.stock === 0 ? 'var(--gradient-coral)' : p.stock < 5 ? 'var(--gradient-orange)' : 'var(--semantic-success)', background: p.stock === 0 ? 'rgba(255,85,119,0.1)' : p.stock < 5 ? 'rgba(255,122,61,0.1)' : 'rgba(34,197,94,0.1)', borderRadius: 6, padding: '3px 8px', minWidth: 40, textAlign: 'center' }}>
              {p.stock === 0 ? 'نافد' : `${p.stock}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DeemaMessage({ msg, onAction, onOrderClick }: { msg: Message; onAction: (cmd: string) => void; onOrderClick?: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '80%' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--canvas-soft-2)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>D</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 5 }}>Deema</div>
        <div style={{ background: 'var(--canvas-soft)', borderRadius: '4px 14px 14px 14px', padding: '14px 16px', fontSize: 14, lineHeight: 1.65, letterSpacing: '-0.14px', boxShadow: '0px 1px 2px rgba(0,0,0,0.04)' }}>
          <p style={{ whiteSpace: 'pre-line', color: 'var(--ink)', marginBottom: msg.stats || msg.orderList || msg.productList || msg.actions ? 12 : 0 }}>{msg.content}</p>
          {msg.stats && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(msg.stats.length, 4)}, 1fr)`, gap: 8, marginBottom: msg.actions ? 12 : 0 }}>
              {msg.stats.map(s => (
                <div key={s.l} style={{ background: 'var(--canvas)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.c, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          )}
          {msg.orderList && <OrderListView rows={msg.orderList} onOrderClick={onOrderClick} />}
          {msg.productList && <ProductListView rows={msg.productList} />}
          {msg.actions && msg.actions.length > 0 && (
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
              {msg.actions.map(a => (
                <button key={a.label} onClick={() => onAction(a.cmd || a.label)}
                  className={a.variant === 'primary' ? 'btn-primary' : a.variant === 'translucent' ? 'btn-translucent' : 'btn-secondary'}
                  style={{ fontSize: 12, padding: '7px 13px' }}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Notification flyout ───────────────────────────────────────────────────────
function NotifFlyout({ onClose, notifs, unreadCount }: { onClose: () => void; notifs: { id: string; title: string; body?: string; priority: string; isRead: boolean; createdAt: string }[]; unreadCount: number }) {
  const priorityColor: Record<string, string> = { urgent: '#ff5577', important: '#ff7a3d', info: '#555' }
  return (
    <div style={{ position: 'absolute', top: 44, left: 0, width: 320, background: 'var(--canvas-soft)', border: '1px solid var(--hairline)', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--hairline)' }}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>الإشعارات</span>
        {unreadCount > 0 && <span style={{ fontSize: 10, color: '#ff5577', background: 'rgba(255,85,119,0.1)', borderRadius: 4, padding: '2px 6px', marginLeft: 8 }}>{unreadCount} جديد</span>}
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: 4 }}><X size={13} /></button>
      </div>
      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {notifs.slice(0, 5).map(n => (
          <div key={n.id} style={{ padding: '11px 16px', borderBottom: '1px solid var(--hairline)', background: n.isRead ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColor[n.priority] || '#555', marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: n.isRead ? 400 : 600, color: 'var(--ink)', marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.4 }}>{n.body}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 3 }}>{new Date(n.createdAt).toLocaleDateString('ar-SA')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--hairline)' }}>
        <Link to="/notifications" onClick={onClose} style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none' }}>عرض كل الإشعارات ←</Link>
      </div>
    </div>
  )
}

// ── Daily suggestion ──────────────────────────────────────────────────────────
const SUGGESTION = 'لديك 5 طلبات من القاهرة جاهزة للشحن. اشحنهم الآن قبل انتهاء وقت أرامكس!'

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const initialMessage: Message = {
    id: 1, role: 'deema', type: 'summary',
    content: 'صباح الخير! 🌅 أنا ديما — جاهز لمساعدتك في إدارة متجرك.',
    actions: [
      { label: 'وريني الطلبات المعلقة', variant: 'primary', cmd: 'وريني الطلبات المعلقة' },
      { label: 'مبيعات اليوم', variant: 'secondary', cmd: 'تقرير مبيعات اليوم' },
      { label: 'المنتجات المنخفضة', variant: 'translucent', cmd: 'وريني المنتجات المنخفضة' },
    ],
  }

  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [input, setInput] = useState('')
  const [counter, setCounter] = useState(2)
  const [isTyping, setIsTyping] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [activeConv, setActiveConv] = useState<string | null>(null)
  const [convList, setConvList] = useState<{ id: string; title?: string; updatedAt: string }[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [orderStats, setOrderStats] = useState({ pending: 0, accepted: 0, shipped: 0, delivered: 0, rejected: 0 })
  const [apiNotifs, setApiNotifs] = useState<ApiNotif[]>([])
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [stores, setStores] = useState<StoreData[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)


  // Init: load conversation + stats from API
  useEffect(() => {
    ordersApi.stats().then(s => setOrderStats(s)).catch(() => {})
    notifApi.list().then(r => { setApiNotifs(r.notifications); setUnreadNotifs(r.unreadCount) }).catch(() => {})
    storesApi.list().then(r => setStores(r.stores)).catch(() => {})
    // Load conversations
    convApi.list().then(r => {
      setConvList(r.conversations)
      if (r.conversations.length > 0) {
        setActiveConv(r.conversations[0].id)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSend = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return
    const userMsg: Message = { id: counter, role: 'user', content: trimmed, createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setCounter(c => c + 1)
    setInput('')
    setIsTyping(true)

    try {
      let convId = activeConv
      if (!convId) {
        const { conversation } = await convApi.create(trimmed.slice(0, 40))
        convId = conversation.id
        setActiveConv(convId)
        setConvList(prev => [conversation, ...prev])
      }

      const result = await convApi.send(convId, trimmed)
      const deemaMsg: Message = { id: counter + 1, role: 'deema', content: result.response }
      setMessages(prev => [...prev, deemaMsg])
      setCounter(c => c + 1)

      // Refresh stats after action
      ordersApi.stats().then(s => setOrderStats(s)).catch(() => {})
    } catch (err) {
      const errMsg = (err as Error).message || 'حدث خطأ في الاتصال'
      setMessages(prev => [...prev, { id: counter + 1, role: 'deema', content: `عذراً، حدث خطأ: ${errMsg}. حاول مجدداً.` }])
      setCounter(c => c + 1)
    } finally {
      setIsTyping(false)
    }
  }

  const handleNewChat = () => {
    setMessages([initialMessage])
    setCounter(2)
    setActiveConv(null)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--canvas)', overflow: 'hidden' }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
      <aside style={{ width: 240, background: 'var(--canvas)', borderLeft: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>

        {/* logo + new chat */}
        <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '0 4px' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#000', fontWeight: 700, fontSize: 11 }}>D</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.4px', flex: 1 }}>Deema</span>
            <button onClick={handleNewChat} style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--canvas-soft)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-muted)' }} title="محادثة جديدة">
              <MessageSquarePlus size={12} />
            </button>
          </div>
        </div>

        {/* conversations */}
        <div style={{ padding: '10px 8px 6px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 4 }}>المحادثات</div>
          {(convList.length > 0 ? convList : CONVS.map(c => ({ id: String(c.id), title: c.title, updatedAt: c.time }))).map(c => (
            <button key={c.id} onClick={() => setActiveConv(c.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 8, border: 'none', background: c.id === activeConv ? 'var(--canvas-soft)' : 'transparent', color: c.id === activeConv ? 'var(--ink)' : 'var(--ink-muted)', cursor: 'pointer', fontSize: 12, marginBottom: 1, textAlign: 'right', fontFamily: 'inherit' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || 'محادثة'}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-muted)', flexShrink: 0, marginRight: 6 }}>{c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('ar-SA') : ''}</span>
            </button>
          ))}
        </div>

        {/* stores */}
        <div style={{ padding: '10px 12px 6px', borderTop: '1px solid var(--hairline)', marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>متاجري</div>
            <Link to="/stores" style={{ color: 'var(--ink-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}><Plus size={11} /></Link>
          </div>
          {stores.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 8px', borderRadius: 7, background: i === 0 ? 'var(--canvas-soft)' : 'transparent', marginBottom: 2, cursor: 'pointer' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.isActive ? '#22c55e' : '#ff7a3d', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: i === 0 ? 'var(--ink)' : 'var(--ink-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-muted)', textTransform: 'capitalize' }}>{s.platform}</span>
            </div>
          ))}
        </div>

        {/* connectors */}
        <div style={{ padding: '10px 12px 6px', borderTop: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>التطبيقات</div>
            <Link to="/connectors" style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 10 }}>إدارة</Link>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {stores.map(s => (
              <span key={s.id} style={{ fontSize: 10, background: 'var(--canvas-soft)', color: 'var(--ink-muted)', borderRadius: 100, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.isActive ? '#22c55e' : '#999', flexShrink: 0 }} />{s.platform}
              </span>
            ))}
          </div>
        </div>

        {/* notifications */}
        <div style={{ padding: '10px 12px 6px', borderTop: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>الإشعارات</div>
            {unreadNotifs > 0 && <span style={{ fontSize: 9, color: '#ff5577', background: 'rgba(255,85,119,0.12)', borderRadius: 100, padding: '2px 6px', fontWeight: 700 }}>{unreadNotifs}</span>}
          </div>
          {apiNotifs.slice(0, 3).map(n => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '5px 6px', borderRadius: 7, marginBottom: 2, background: n.isRead ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: n.priority === 'urgent' ? '#ff5577' : n.priority === 'important' ? '#ff7a3d' : '#555', marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink)', lineHeight: 1.35, fontWeight: n.isRead ? 400 : 500 }}>{n.title}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 1 }}>{new Date(n.createdAt).toLocaleDateString('ar-SA')}</div>
              </div>
            </div>
          ))}
          <Link to="/notifications" style={{ display: 'block', fontSize: 11, color: 'var(--accent-blue)', textDecoration: 'none', padding: '4px 6px', marginTop: 2 }}>عرض الكل ←</Link>
        </div>

        {/* daily suggestion */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--hairline)' }}>
          <div style={{ background: 'rgba(0,112,243,0.06)', border: '1px solid rgba(0,112,243,0.15)', borderRadius: 10, padding: '10px 11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <Lightbulb size={11} color="#6a4cf5" />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#0070f3', letterSpacing: '0.04em' }}>اقتراح اليوم</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{SUGGESTION}</div>
            <button onClick={() => handleSend('اشحن الطلبات المقبولة')} style={{ marginTop: 7, fontSize: 11, color: '#0070f3', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}>
              اشحن الآن
            </button>
          </div>
        </div>

        {/* bottom nav */}
        <div style={{ padding: '8px', borderTop: '1px solid var(--hairline)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, marginTop: 'auto' }}>
          {[
            { to: '/activity', icon: History, label: 'السجل' },
            { to: '/insights', icon: Brain, label: 'الذاكرة' },
            { to: '/settings', icon: Settings, label: 'الإعدادات' },
            { to: '/billing', icon: CreditCard, label: 'الاشتراك' },
          ].map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '7px 4px', borderRadius: 8, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 10, transition: 'color 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </div>
      </aside>

      {/* ── CHAT MAIN ──────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* top bar */}
        <div style={{ height: 52, borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10, flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>{stores[0]?.name ?? '...'}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-muted)', background: 'var(--canvas-soft)', borderRadius: 4, padding: '2px 8px', textTransform: 'capitalize' }}>{stores[0]?.platform ?? ''}</span>
            <ChevronDown size={13} color="var(--ink-muted)" />
          </div>

          {/* live stats */}
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-muted)' }}>
              <Package size={12} />
              <span style={{ color: 'var(--gradient-orange)', fontWeight: 600 }}>{orderStats.pending}</span> معلق
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-muted)' }}>
              <AlertTriangle size={12} color="var(--gradient-coral)" />
              <span style={{ color: 'var(--gradient-coral)', fontWeight: 600 }}>—</span> نافد
            </div>
          </div>

          {/* top-right actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {false && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,122,61,0.12)', borderRadius: 100, padding: '4px 12px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gradient-orange)', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: 11, color: 'var(--gradient-orange)' }}>في انتظار تأكيدك</span>
              </div>
            )}

            {/* search */}
            <button onClick={() => setShowSearch(true)} title="بحث (Ctrl+K)" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--canvas-soft)', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: 12 }}>
              <Search size={12} />
              <span>بحث</span>
              <kbd style={{ fontSize: 9, background: 'var(--canvas-soft-2)', borderRadius: 4, padding: '1px 5px', border: '1px solid var(--hairline)' }}>⌘K</kbd>
            </button>

            {/* nav links */}
            {[
              { to: '/reports', icon: BarChart2, title: 'التقارير' },
              { to: '/stores', icon: Store, title: 'متاجري' },
              { to: '/connectors', icon: Plug, title: 'التطبيقات' },
              { to: '/team', icon: Users, title: 'الفريق' },
            ].map(({ to, icon: Icon, title }) => (
              <Link key={to} to={to} style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-muted)', textDecoration: 'none', background: 'transparent' }} title={title}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--canvas-soft)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Icon size={14} />
              </Link>
            ))}

            {/* notifications bell */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowNotifs(v => !v)} style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: showNotifs ? 'var(--canvas-soft)' : 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)' }}>
                <Bell size={15} />
              </button>
              {unreadNotifs > 0 && <span style={{ position: 'absolute', top: 2, left: 2, width: 14, height: 14, background: 'var(--gradient-coral)', borderRadius: '50%', fontSize: 8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unreadNotifs}</span>}
              {showNotifs && <NotifFlyout onClose={() => setShowNotifs(false)} notifs={apiNotifs} unreadCount={unreadNotifs} />}
            </div>

            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--canvas-soft-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--ink)' }}>م</div>
          </div>
        </div>

        {/* messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={() => showNotifs && setShowNotifs(false)}>
          {messages.map(msg => (
            <div key={msg.id}>
              {msg.role === 'deema' ? (
                <DeemaMessage msg={msg} onAction={handleSend} onOrderClick={setSelectedOrderId} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
                  <div style={{ background: 'var(--canvas-soft-2)', borderRadius: '14px 4px 14px 14px', padding: '11px 15px', fontSize: 14, maxWidth: '55%', color: 'var(--ink)', letterSpacing: '-0.14px', lineHeight: 1.55, boxShadow: '0px 1px 2px rgba(0,0,0,0.04)' }}>
                    {msg.content}
                  </div>
                  {msg.createdAt && <span style={{ fontSize: 10, color: 'var(--ink-muted)', paddingRight: 4 }}>{new Date(msg.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--canvas-soft-2)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>D</span>
              </div>
              <div style={{ background: 'var(--canvas-soft)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px', display: 'flex', gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-muted)', animation: `bounce 1s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* input area */}
        <div style={{ borderTop: '1px solid var(--hairline)', padding: '10px 20px 14px', flexShrink: 0 }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}
              // @ts-ignore
              onScroll={() => {}}>
              {QUICK.map(q => (
                <button key={q.label} onClick={() => handleSend(q.cmd)} style={{ background: 'var(--canvas-soft)', color: 'var(--ink-muted)', border: 'none', borderRadius: 100, padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '-0.12px', fontFamily: 'inherit' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
                >{q.label}</button>
              ))}
            </div>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 32, background: 'linear-gradient(to left, transparent, var(--canvas))', pointerEvents: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isTyping && handleSend(input)}
              placeholder='اكتب أمرك...'
              disabled={isTyping}
              style={{ flex: 1, background: 'var(--canvas-soft)', border: '1px solid var(--hairline)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit', direction: 'rtl', letterSpacing: '-0.14px', opacity: isTyping ? 0.7 : 1 }}
              onFocus={e => { e.target.style.boxShadow = 'rgba(0,153,255,0.15) 0 0 0 1px'; e.target.style.borderColor = '#0099ff' }}
              onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--hairline)' }}
            />
            <button onClick={() => !isTyping && handleSend(input)} disabled={!input.trim() || isTyping}
              style={{ width: 36, height: 36, borderRadius: 10, border: 'none', flexShrink: 0, background: input.trim() && !isTyping ? 'var(--primary)' : 'var(--canvas-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !isTyping ? 'pointer' : 'default' }}>
              <Send size={14} color={input.trim() && !isTyping ? '#000' : 'var(--ink-muted)'} style={{ transform: 'scaleX(-1)' }} />
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      {/* Order detail drawer */}
      <OrderDetailDrawer orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />

      {/* Global search modal */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} onSelectOrder={id => { setSelectedOrderId(id); setShowSearch(false) }} />}
    </div>
  )
}
