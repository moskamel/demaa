import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Plus, Send, Mic, ChevronDown, Settings, History, Package, AlertTriangle } from 'lucide-react'
import { detectIntent } from '../engine/intentDetector'
import { generateResponse } from '../engine/responseEngine'
import type { PendingConfirm } from '../engine/responseEngine'
import { store } from '../store/mockData'
import type { Message, OrderRow, ProductRow } from '../types/chat'

// ── Status badge ─────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  pending: 'var(--gradient-orange)',
  accepted: 'var(--semantic-success)',
  shipped: '#0099ff',
  delivered: 'var(--semantic-success)',
  rejected: 'var(--gradient-coral)',
  cancelled: 'var(--ink-muted)',
}
const statusLabels: Record<string, string> = {
  pending: 'معلق', accepted: 'مقبول', shipped: 'مشحون',
  delivered: 'مُسلَّم', rejected: 'مرفوض', cancelled: 'ملغي',
}
const paymentLabels: Record<string, string> = {
  card: 'بطاقة', cash: 'كاش ⚠️', tabby: 'تابby', tamara: 'تمارا',
}

// ── Quick actions list ───────────────────────────────────────────────────────
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
]

// ── Message sub-components ───────────────────────────────────────────────────

function OrderListView({ rows }: { rows: OrderRow[] }) {
  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 12, overflow: 'hidden' }}>
      {rows.map((o, i) => (
        <div key={o.id} style={{
          background: 'var(--canvas)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: i < rows.length - 1 ? '1px solid var(--hairline-soft)' : 'none',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.2px' }}>#{o.id}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>·</span>
              <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{o.customer}</span>
              {o.issue && <span style={{ fontSize: 10, color: 'var(--gradient-orange)', background: 'rgba(255,122,61,0.12)', borderRadius: 4, padding: '1px 6px' }}>⚠️ {o.issue}</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--ink-muted)' }}>
              <span>📍 {o.city}</span>
              <span>·</span>
              <span>{paymentLabels[o.payment] || o.payment}</span>
              {o.shipmentId && <><span>·</span><span style={{ color: '#0099ff', fontSize: 10 }}>{o.shipmentId}</span></>}
            </div>
          </div>
          <div style={{ textAlign: 'left', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{o.total.toLocaleString('ar-SA')} ر.س</div>
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
        <div key={p.id} style={{
          background: 'var(--canvas)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: i < rows.length - 1 ? '1px solid var(--hairline-soft)' : 'none',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{p.category} · {p.id}</div>
          </div>
          <div style={{ textAlign: 'left', flexShrink: 0, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{p.price.toLocaleString('ar-SA')} ر.س</div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: p.stock === 0 ? 'var(--gradient-coral)' : p.stock < 5 ? 'var(--gradient-orange)' : 'var(--semantic-success)',
              background: p.stock === 0 ? 'rgba(255,85,119,0.1)' : p.stock < 5 ? 'rgba(255,122,61,0.1)' : 'rgba(34,197,94,0.1)',
              borderRadius: 6, padding: '3px 8px', minWidth: 40, textAlign: 'center',
            }}>
              {p.stock === 0 ? 'نافد' : `${p.stock}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DeemaMessage({ msg, onAction }: { msg: Message; onAction: (cmd: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '80%' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>D</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 5, letterSpacing: '-0.11px' }}>Deema</div>
        <div style={{
          background: 'var(--surface-1)',
          borderRadius: '4px 14px 14px 14px',
          padding: '14px 16px',
          fontSize: 14, lineHeight: 1.65, letterSpacing: '-0.14px',
          boxShadow: 'rgba(255,255,255,0.04) 0 0.5px 0 inset',
        }}>
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

          {msg.orderList && <OrderListView rows={msg.orderList} />}
          {msg.productList && <ProductListView rows={msg.productList} />}

          {msg.actions && msg.actions.length > 0 && (
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
              {msg.actions.map(a => (
                <button
                  key={a.label}
                  onClick={() => onAction(a.cmd || a.label)}
                  className={a.variant === 'primary' ? 'btn-primary' : a.variant === 'translucent' ? 'btn-translucent' : 'btn-secondary'}
                  style={{ fontSize: 12, padding: '7px 13px' }}
                >
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

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const pending = store.getPendingOrders()
  const lowStock = store.products.filter(p => p.stock === 0)

  const initialMessage: Message = {
    id: 1, role: 'deema', type: 'summary',
    content: 'صباح الخير! 🌅 ملخص متجرك لهذا الصباح:',
    stats: [
      { n: String(pending.length), l: 'طلب معلق', c: 'var(--gradient-orange)' },
      { n: String(store.getAcceptedOrders().length), l: 'مقبول', c: 'var(--ink)' },
      { n: String(store.getShippedOrders().length), l: 'مشحون', c: 'var(--semantic-success)' },
      { n: String(lowStock.length), l: 'مخزون نافد', c: 'var(--gradient-coral)' },
    ],
    actions: [
      { label: `اقبل الجاهزة (${pending.filter(o => o.payment !== 'cash').length})`, variant: 'primary', cmd: 'اقبل الطلبات السليمة' },
      { label: 'وريني المشاكل', variant: 'secondary', cmd: 'وريني الطلبات المعلقة' },
      { label: 'مبيعات اليوم', variant: 'translucent', cmd: 'مبيعات اليوم' },
    ],
  }

  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [input, setInput] = useState('')
  const [counter, setCounter] = useState(2)
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg: Message = { id: counter, role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setCounter(c => c + 1)
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const parsed = detectIntent(trimmed)
      const response = generateResponse(parsed, pendingConfirm, setPendingConfirm)
      setMessages(prev => [...prev, { ...response, id: counter + 1 }])
      setCounter(c => c + 1)
      setIsTyping(false)
    }, 600)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--canvas)', overflow: 'hidden' }}>

      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside style={{ width: 240, background: 'var(--canvas)', borderLeft: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* logo */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--hairline-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontWeight: 700, fontSize: 11 }}>D</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Deema</span>
        </div>

        {/* new chat */}
        <div style={{ padding: '12px' }}>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 10, padding: '9px 14px', fontSize: 13 }} onClick={() => setMessages([initialMessage])}>
            <Plus size={13} /> محادثة جديدة
          </button>
        </div>

        {/* conversations */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', padding: '4px 8px 6px', marginBottom: 2 }}>
            الأخيرة
          </div>
          {CONVS.map(c => (
            <button key={c.id} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px', borderRadius: 8, border: 'none',
              background: c.active ? 'var(--surface-1)' : 'transparent',
              color: c.active ? 'var(--ink)' : 'var(--ink-muted)',
              cursor: 'pointer', fontSize: 12, letterSpacing: '-0.12px', marginBottom: 1, textAlign: 'right',
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-muted)', flexShrink: 0, marginRight: 6 }}>{c.time}</span>
            </button>
          ))}
        </div>

        {/* stores */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--hairline-soft)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>متاجري</div>
          {[
            { name: 'متجر النور', platform: 'سلة', active: true },
            { name: 'متجر العود', platform: 'زد', active: false },
          ].map(s => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 8, background: s.active ? 'var(--surface-1)' : 'transparent', marginBottom: 3, cursor: 'pointer' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--semantic-success)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: s.active ? 'var(--ink)' : 'var(--ink-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-muted)' }}>{s.platform}</span>
            </div>
          ))}
        </div>

        {/* apps */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--hairline-soft)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>التطبيقات</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['أرامكس', 'SMSA', 'تابby'].map(app => (
              <span key={app} style={{ fontSize: 11, background: 'var(--surface-1)', color: 'var(--ink-muted)', borderRadius: 100, padding: '3px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--semantic-success)' }} />
                {app}
              </span>
            ))}
          </div>
        </div>

        {/* bottom */}
        <div style={{ padding: '8px', borderTop: '1px solid var(--hairline-soft)', display: 'flex', gap: 2 }}>
          <Link to="/activity" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 12 }}>
            <History size={12} /> السجل
          </Link>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, color: 'var(--ink-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12 }}>
            <Settings size={12} /> إعدادات
          </button>
        </div>
      </aside>

      {/* ── CHAT MAIN ──────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* top bar */}
        <div style={{ height: 52, borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10, background: 'var(--canvas)', flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>متجر النور</span>
            <span style={{ fontSize: 11, color: 'var(--ink-muted)', background: 'var(--surface-1)', borderRadius: 4, padding: '2px 8px' }}>سلة</span>
            <ChevronDown size={13} color="var(--ink-muted)" />
          </div>

          {/* live stats */}
          <div style={{ display: 'flex', gap: 16, marginLeft: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-muted)' }}>
              <Package size={12} />
              <span style={{ color: 'var(--gradient-orange)', fontWeight: 600 }}>{store.getPendingOrders().length}</span> معلق
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-muted)' }}>
              <AlertTriangle size={12} color="var(--gradient-coral)" />
              <span style={{ color: 'var(--gradient-coral)', fontWeight: 600 }}>{store.products.filter(p => p.stock === 0).length}</span> نافد
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {pendingConfirm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,122,61,0.12)', borderRadius: 100, padding: '4px 12px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gradient-orange)', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: 11, color: 'var(--gradient-orange)' }}>في انتظار تأكيدك</span>
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <Bell size={16} color="var(--ink-muted)" />
              <span style={{ position: 'absolute', top: -3, left: -3, width: 14, height: 14, background: 'var(--gradient-coral)', borderRadius: '50%', fontSize: 8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>٣</span>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--ink)' }}>أ</div>
          </div>
        </div>

        {/* messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(msg => (
            <div key={msg.id}>
              {msg.role === 'deema' ? (
                <DeemaMessage msg={msg} onAction={handleSend} />
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    background: 'var(--surface-2)',
                    borderRadius: '14px 4px 14px 14px',
                    padding: '11px 15px',
                    fontSize: 14,
                    maxWidth: '55%',
                    color: 'var(--ink)',
                    letterSpacing: '-0.14px',
                    lineHeight: 1.55,
                    boxShadow: 'rgba(255,255,255,0.04) 0 0.5px 0 inset',
                  }}>
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>D</span>
              </div>
              <div style={{ background: 'var(--surface-1)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px', display: 'flex', gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-muted)', animation: `bounce 1s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* input area */}
        <div style={{ borderTop: '1px solid var(--hairline)', padding: '10px 20px 14px', background: 'var(--canvas)', flexShrink: 0 }}>
          {/* quick actions */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
            {QUICK.map(q => (
              <button key={q.label} onClick={() => handleSend(q.cmd)} style={{
                background: 'var(--surface-1)', color: 'var(--ink-muted)', border: 'none',
                borderRadius: 100, padding: '5px 12px', fontSize: 12, fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '-0.12px',
                transition: 'color 0.1s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
              >{q.label}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Mic size={14} color="var(--ink-muted)" />
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isTyping && handleSend(input)}
              placeholder={pendingConfirm ? 'اكتب "نعم" للتأكيد أو "لا" للإلغاء...' : 'اكتب أمرك... مثال: "اقبل الطلبات" أو "مبيعات الأسبوع"'}
              disabled={isTyping}
              style={{
                flex: 1, background: 'var(--surface-1)',
                border: `1px solid ${pendingConfirm ? 'rgba(255,122,61,0.4)' : 'var(--hairline)'}`,
                borderRadius: 10, padding: '10px 14px',
                fontSize: 14, color: 'var(--ink)', outline: 'none',
                fontFamily: 'inherit', direction: 'rtl', letterSpacing: '-0.14px',
                opacity: isTyping ? 0.7 : 1,
              }}
              onFocus={e => { e.target.style.boxShadow = 'rgba(0,153,255,0.15) 0 0 0 1px'; e.target.style.borderColor = '#0099ff' }}
              onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = pendingConfirm ? 'rgba(255,122,61,0.4)' : 'var(--hairline)' }}
            />
            <button
              onClick={() => !isTyping && handleSend(input)}
              disabled={!input.trim() || isTyping}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', flexShrink: 0,
                background: input.trim() && !isTyping ? 'var(--primary)' : 'var(--surface-1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !isTyping ? 'pointer' : 'default',
              }}>
              <Send size={14} color={input.trim() && !isTyping ? '#000' : 'var(--ink-muted)'} style={{ transform: 'scaleX(-1)' }} />
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
