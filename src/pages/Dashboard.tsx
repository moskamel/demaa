import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useConfirm } from '../hooks/useConfirm'
import {
  Notification as NotifIcon, Add, Send2, ArrowDown2, Setting2, Clock, Box, Warning2,
  Shop, Electricity, People, ChartSquare,
  Card, Lamp, MessageAdd1, CloseCircle, Cpu,
  Logout,
} from 'iconsax-react'
import { conversations as convApi, orders as ordersApi, notifications as notifApi, storesApi, clearToken, type Notification as ApiNotif, type StoreData } from '../lib/api'
import type { Message, OrderRow, ProductRow } from '../types/chat'
import OrderDetailDrawer from '../components/OrderDetailDrawer'
import SearchModal from '../components/SearchModal'
import AnimatedNumber from '../components/AnimatedNumber'
import AppHeader from '../components/AppHeader'
import AppSidebar from '../components/AppSidebar'

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
  { label: 'مبيعات اليوم', cmd: 'مبيعات اليوم' },
  { label: 'المخزون', cmd: 'كام باقي من المنتجات' },
  { label: 'الشحن', cmd: 'اشحن الطلبات المقبولة' },
  { label: 'المنتجات', cmd: 'وريني المنتجات' },
  { label: 'كوبون خصم', cmd: 'اعمل كوبون خصم 15%' },
  { label: 'الأنشطة', cmd: 'سجل الأنشطة' },
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
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: 4 }}><CloseCircle size={13} variant="Outline" /></button>
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

// ── Daily suggestion — generated dynamically from order stats ────────────────
function getDailySuggestion(stats: { pending: number; accepted: number }) {
  if (stats.accepted > 0) return `لديك ${stats.accepted} طلب مقبول جاهز للشحن. اشحنهم الآن!`
  if (stats.pending > 5) return `لديك ${stats.pending} طلب معلق. راجعهم وقبل الجاهزين.`
  if (stats.pending > 0) return `لديك ${stats.pending} طلب معلق يحتاج موافقتك.`
  return 'كل الطلبات مرتبة! راجع تقرير المبيعات لاكتشاف فرص النمو.'
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const handleLogout = () => { clearToken(); navigate('/login') }
  const { confirm: confirmAction, Dialog: ConfirmDialog } = useConfirm()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [counter, setCounter] = useState(2)
  const [isTyping, setIsTyping] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [activeConv, setActiveConv] = useState<string | null>(() => searchParams.get('conv'))
  const skipLoadRef = useRef(false)
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
    }).catch(() => {})
  }, [])

  // Load messages when switching conversations
  useEffect(() => {
    if (!activeConv) return
    if (skipLoadRef.current) { skipLoadRef.current = false; return }
    convApi.messages(activeConv).then(r => {
      if (r.messages.length === 0) { setMessages([]); return }
      setMessages(r.messages.map((m: { id: string; role: string; content: string; createdAt?: string }) => ({
        id: m.id,
        role: m.role === 'assistant' ? 'deema' : 'user',
        content: m.content,
        createdAt: m.createdAt,
      } as Message)))
    }).catch(() => {})
  }, [activeConv])

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
        skipLoadRef.current = true
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
    setMessages([])
    setCounter(2)
    setActiveConv(null)
  }

  const handleDeleteConv = async (id: string) => {
    const conv = convList.find(c => c.id === id)
    const ok = await confirmAction({
      title: 'حذف المحادثة',
      message: `هل تريد حذف المحادثة "${conv?.title || 'محادثة'}"؟`,
      confirmLabel: 'حذف',
      risk: 'high',
      danger: true,
      consequence: 'لا يمكن استعادة رسائل هذه المحادثة بعد الحذف.',
    })
    if (!ok) return
    await convApi.delete(id).catch(() => {})
    setConvList(prev => prev.filter(c => c.id !== id))
    if (activeConv === id) handleNewChat()
  }

  const handleRenameConv = async (id: string, title: string) => {
    await convApi.rename(id, title).catch(() => {})
    setConvList(prev => prev.map(c => c.id === id ? { ...c, title } : c))
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--canvas)', overflow: 'hidden' }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
      <AppSidebar convList={convList} activeConv={activeConv} onSelectConv={setActiveConv} onNewChat={handleNewChat} onDeleteConv={handleDeleteConv} onRenameConv={handleRenameConv} />
      {false && <aside style={{ display: 'none' }}>

        {/* ── Top: logo + collapse toggle */}
        <div style={{ padding: sidebarCollapsed ? '14px 10px' : '14px 12px', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#000', fontWeight: 700, fontSize: 12 }}>D</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.4px' }}>Deema</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#000', fontWeight: 700, fontSize: 12 }}>D</span>
            </div>
          )}
          {!sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4, display: 'flex', borderRadius: 6 }}
              title="طي الشريط الجانبي"
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              <ArrowDown2 size={14} variant="Outline" style={{ transform: 'rotate(90deg)' }} />
            </button>
          )}
        </div>

        {/* ── Nav actions */}
        <div style={{ padding: sidebarCollapsed ? '10px 8px' : '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>

          {/* Search */}
          <button onClick={() => setShowSearch(true)} style={navBtnStyle(sidebarCollapsed)}
            title="بحث"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <SearchNormal1 size={16} variant="Outline" color="rgba(255,255,255,0.7)" />
            {!sidebarCollapsed && <span style={navLabelStyle}>بحث</span>}
            {!sidebarCollapsed && <kbd style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 5px', marginRight: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>⌘K</kbd>}
          </button>

          {/* New chat */}
          <button onClick={handleNewChat} style={{ ...navBtnStyle(sidebarCollapsed), background: 'rgba(255,255,255,0.1)' }}
            title="محادثة جديدة"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)' }}
          >
            <MessageAdd1 size={16} variant="Outline" color="#fff" />
            {!sidebarCollapsed && <span style={{ ...navLabelStyle, color: '#fff', fontWeight: 500 }}>محادثة جديدة</span>}
          </button>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '6px 4px' }} />

          {/* Nav links */}
          {[
            { to: '/stores', icon: Shop, label: 'متاجري', badge: stores.length > 0 ? stores.length : undefined },
            { to: '/reports', icon: ChartSquare, label: 'التقارير' },
            { to: '/team', icon: People, label: 'الفريق' },
            { to: '/connectors', icon: Electricity, label: 'التطبيقات' },
            { to: '/notifications', icon: NotifIcon, label: 'الإشعارات', badge: unreadNotifs > 0 ? unreadNotifs : undefined, badgeColor: '#ff5577' },
          ].map(({ to, icon: Icon, label, badge, badgeColor }) => (
            <Link key={to} to={to} style={{ ...navBtnStyle(sidebarCollapsed), textDecoration: 'none', position: 'relative' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Icon size={16} variant="Outline" color="rgba(255,255,255,0.7)" />
                {badge !== undefined && sidebarCollapsed && (
                  <span style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: '50%', background: badgeColor || '#6a4cf5', fontSize: 8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{badge > 9 ? '9+' : badge}</span>
                )}
              </div>
              {!sidebarCollapsed && <span style={navLabelStyle}>{label}</span>}
              {!sidebarCollapsed && badge !== undefined && (
                <span style={{ marginRight: 'auto', fontSize: 10, fontWeight: 700, color: '#fff', background: badgeColor || '#6a4cf5', borderRadius: 100, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{badge}</span>
              )}
            </Link>
          ))}
        </div>

        {/* ── Conversations list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: sidebarCollapsed ? '6px 8px' : '6px 8px', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 4, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {!sidebarCollapsed && (
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 8px 4px' }}>المحادثات السابقة</div>
          )}
          {convList.length === 0 && !sidebarCollapsed && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', padding: '8px 10px', textAlign: 'center', marginTop: 8 }}>لا توجد محادثات بعد</div>
          )}
          {convList.map(c => (
            <button key={c.id} onClick={() => setActiveConv(c.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: sidebarCollapsed ? '8px 10px' : '7px 10px',
                borderRadius: 8, border: 'none',
                background: c.id === activeConv ? 'rgba(255,255,255,0.1)' : 'transparent',
                cursor: 'pointer', marginBottom: 1, textAlign: 'right', fontFamily: 'inherit',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
              title={sidebarCollapsed ? (c.title || 'محادثة') : undefined}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              {!sidebarCollapsed && (
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: c.id === activeConv ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                  {c.title || 'محادثة'}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── User + collapse/expand */}
        <div style={{ padding: sidebarCollapsed ? '10px 8px' : '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6a4cf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>م</div>
          {!sidebarCollapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {JSON.parse(localStorage.getItem('deema_user') || '{}').name || 'مستخدم'}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {JSON.parse(localStorage.getItem('deema_user') || '{}').email || ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                <button onClick={() => setSidebarCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6, display: 'flex' }} title="طي"
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  <ArrowDown2 size={13} variant="Outline" style={{ transform: 'rotate(90deg)' }} />
                </button>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6, display: 'flex' }} title="خروج"
                  onMouseEnter={e => (e.currentTarget.style.color = '#ff5577')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  <Logout size={13} variant="Outline" />
                </button>
              </div>
            </>
          )}
          {sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(false)} style={{ position: 'absolute', right: 56, top: '50%', transform: 'translateY(-50%)', display: 'none' }} />
          )}
        </div>

        {/* Expand button when collapsed */}
        {sidebarCollapsed && (
          <button onClick={() => setSidebarCollapsed(false)} style={{ position: 'absolute', bottom: 70, right: 12, width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="توسيع الشريط الجانبي"
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          >
            <ArrowDown2 size={12} variant="Outline" style={{ transform: 'rotate(-90deg)' }} />
          </button>
        )}
      </aside>}

      {/* ── CHAT MAIN ──────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* top bar */}
        <AppHeader title="لوحة التحكم">
          {/* notifications bell */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNotifs(v => !v)} style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: showNotifs ? 'var(--canvas-soft)' : 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)' }}>
              <NotifIcon size={15} variant="Outline" />
            </button>
            {unreadNotifs > 0 && <span style={{ position: 'absolute', top: 2, left: 2, width: 14, height: 14, background: 'var(--gradient-coral)', borderRadius: '50%', fontSize: 8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unreadNotifs}</span>}
            {showNotifs && <NotifFlyout onClose={() => setShowNotifs(false)} notifs={apiNotifs} unreadCount={unreadNotifs} />}
          </div>
        </AppHeader>

        {/* ── NEW CHAT (Grok-style) ── */}
        {!activeConv ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: 'var(--canvas)' }}>
            {/* Star dots */}
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: i % 5 === 0 ? 2.5 : 1.5,
                height: i % 5 === 0 ? 2.5 : 1.5,
                borderRadius: '50%',
                background: 'var(--ink-disabled)',
                top: `${Math.sin(i * 137.508) * 50 + 50}%`,
                left: `${Math.cos(i * 137.508) * 50 + 50}%`,
                animation: `pulse ${2 + (i % 3)}s ${i * 0.15}s ease-in-out infinite`,
              }} />
            ))}

            {/* Logo + subtitle */}
            <div className="animate-fade-in-scale" style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 22, letterSpacing: '-1px' }}>D</span>
                </div>
                <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-1.5px' }}>ديما</span>
              </div>
              <span style={{ fontSize: 14, color: 'var(--ink-muted)', letterSpacing: '-0.2px' }}>مساعدك الذكي لإدارة متجرك</span>
            </div>

            {/* Center input */}
            <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: 600, padding: '0 24px', boxSizing: 'border-box' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 16, padding: '14px 16px',
                boxShadow: '0 0 0 0 rgba(106,76,245,0)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
                onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(106,76,245,0.5)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(106,76,245,0.15)' }}
                onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                <Add size={18} color="rgba(255,255,255,0.4)" variant="Outline" style={{ flexShrink: 0 }} />
                <input
                  autoFocus
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !isTyping && handleSend(input)}
                  placeholder="اكتب أمرك أو سؤالك..."
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 16, fontFamily: 'inherit', direction: 'rtl', letterSpacing: '-0.2px' }}
                />
                <button onClick={() => !isTyping && handleSend(input)} disabled={!input.trim() || isTyping}
                  style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', flexShrink: 0, background: input.trim() ? 'linear-gradient(135deg,#6a4cf5,#d44df0)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', transition: 'background 0.2s' }}>
                  <Send2 size={14} color={input.trim() ? '#fff' : 'rgba(255,255,255,0.3)'} variant="Outline" style={{ transform: 'scaleX(-1)' }} />
                </button>
              </div>

              {/* Quick prompts */}
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                {QUICK.map((q, i) => (
                  <button key={q.label} onClick={() => handleSend(q.cmd)}
                    className="animate-fade-in btn-press"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', animationDelay: `${i * 50}ms`, transition: 'background 0.15s, color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  >{q.label}</button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 200px', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={() => showNotifs && setShowNotifs(false)}>
              {messages.length === 0 && !isTyping && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--ink-disabled)' }}>ابدأ المحادثة بكتابة رسالة...</span>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={msg.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 30, 120)}ms` }}>
                  {msg.role === 'deema' ? (
                    <DeemaMessage msg={msg} onAction={handleSend} onOrderClick={setSelectedOrderId} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                        <div className="chat-message-user" style={{ background: 'var(--canvas-soft-2)', borderRadius: '14px 4px 14px 14px', padding: '11px 15px', fontSize: 14, maxWidth: '55vw', color: 'var(--ink)', letterSpacing: '-0.14px', lineHeight: 1.55, boxShadow: '0px 1px 2px rgba(0,0,0,0.04)' }}>
                          {msg.content}
                        </div>
                        {msg.createdAt && <span style={{ fontSize: 10, color: 'var(--ink-muted)', paddingLeft: 4 }}>{new Date(msg.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {(JSON.parse(localStorage.getItem('deema_user') || '{}').name || 'م')[0]}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--canvas-soft-2)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>D</span>
                  </div>
                  <div style={{ background: 'var(--canvas-soft)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px', display: 'flex', gap: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ink-muted)', animation: `dotBounce 1.2s ${i * 0.18}s ease-in-out infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* input area */}
            <div style={{ borderTop: '1px solid var(--hairline)', padding: '10px 20px 14px', flexShrink: 0 }}>
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
                  {QUICK.map((q, i) => (
                    <button key={q.label} onClick={() => handleSend(q.cmd)}
                      className="animate-fade-in btn-press"
                      style={{ background: 'var(--canvas-soft)', color: 'var(--ink-muted)', border: '1px solid var(--hairline)', borderRadius: 100, padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '-0.12px', fontFamily: 'inherit', animationDelay: `${i * 40}ms`, transition: 'background 0.15s, color 0.15s, border-color 0.15s, transform 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--canvas-soft-2)'; e.currentTarget.style.borderColor = 'var(--hairline-strong)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-muted)'; e.currentTarget.style.background = 'var(--canvas-soft)'; e.currentTarget.style.borderColor = 'var(--hairline)' }}
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
                  <Send2 size={14} color={input.trim() && !isTyping ? '#000' : 'var(--ink-muted)'} variant="Outline" style={{ transform: 'scaleX(-1)' }} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      {/* Order detail drawer */}
      <OrderDetailDrawer orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />

      {/* Global search modal */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} onSelectOrder={id => { setSelectedOrderId(id); setShowSearch(false) }} />}
      {ConfirmDialog}
    </div>
  )
}
