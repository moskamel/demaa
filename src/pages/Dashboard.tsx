import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Plus, Send, Mic, ChevronDown, Settings, MessageSquare, History } from 'lucide-react'

type Message = {
  id: number
  role: 'user' | 'deema'
  type?: 'summary' | 'confirmation' | 'text'
  content: string
  stats?: { n: string; l: string; c: string }[]
  actions?: { label: string; variant: 'primary' | 'secondary' | 'translucent' }[]
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'deema',
    type: 'summary',
    content: 'صباح الخير أحمد! 🌅 ملخص متجرك لهذا الصباح:',
    stats: [
      { n: '47', l: 'طلب جديد', c: 'var(--gradient-orange)' },
      { n: '12', l: 'معلق', c: 'var(--ink)' },
      { n: '32', l: 'مشحون', c: 'var(--semantic-success)' },
      { n: '3', l: 'مشاكل', c: 'var(--gradient-coral)' },
    ],
    actions: [
      { label: 'اقبل الجاهزة ٣٥ طلب', variant: 'primary' },
      { label: 'وريني المشاكل', variant: 'secondary' },
    ],
  },
]

const quickActions = ['الطلبات', 'الشحن', 'المنتجات', 'التقارير', 'العملاء']

const conversations = [
  { id: 1, title: 'طلبات اليوم', time: 'الآن', active: true },
  { id: 2, title: 'إضافة منتج جديد', time: 'أمس' },
  { id: 3, title: 'تقرير الأسبوع', time: '٣ أيام' },
  { id: 4, title: 'ربط أرامكس', time: '٥ أيام' },
]

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [counter, setCounter] = useState(10)

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: counter, role: 'user', type: 'text', content: text }
    const lower = text.toLowerCase()

    let reply: Message
    if (lower.includes('اقبل') || lower.includes('طلب') || lower.includes('جاهزة')) {
      reply = {
        id: counter + 1, role: 'deema', type: 'confirmation',
        content: 'هتقبل ٣٥ طلب بمجموع ١٤,٥٠٠ ر.س من متجر النور على سلة.\n\n✅ ٣٥ طلب سليم\n⏩ سيتم إنشاء بوالص الشحن تلقائياً',
        actions: [
          { label: 'نعم، نفّذ', variant: 'primary' },
          { label: 'لا، ألغِ', variant: 'secondary' },
          { label: 'وريني التفاصيل', variant: 'translucent' },
        ],
      }
    } else if (lower.includes('نعم') || lower.includes('نفّذ') || lower.includes('نفذ')) {
      reply = {
        id: counter + 1, role: 'deema', type: 'text',
        content: '✅ تم قبول ٣٥ طلب بنجاح!\n\n📦 تم إنشاء ٣٥ بوليصة شحن مع أرامكس.\n\nالمجموع: ١٤,٥٠٠ ر.س',
      }
    } else {
      reply = {
        id: counter + 1, role: 'deema', type: 'text',
        content: 'فهمت طلبك! هل تريد أن أكمل هذا الإجراء على متجر النور؟',
        actions: [{ label: 'نعم، اكمل', variant: 'primary' }, { label: 'لا شكراً', variant: 'secondary' }],
      }
    }

    setMessages(prev => [...prev, userMsg, reply])
    setCounter(c => c + 2)
    setInput('')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--canvas)', overflow: 'hidden' }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside style={{
        width: 240,
        background: 'var(--canvas)',
        borderLeft: '1px solid var(--hairline)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--hairline-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#000', fontWeight: 700, fontSize: 11 }}>D</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Deema</span>
          </div>
        </div>

        {/* new chat */}
        <div style={{ padding: '12px' }}>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 10, padding: '9px 14px' }}>
            <Plus size={13} /> محادثة جديدة
          </button>
        </div>

        {/* conversations */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', padding: '6px 8px', marginBottom: 2 }}>
            الأخيرة
          </div>
          {conversations.map(c => (
            <button key={c.id} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px', borderRadius: 8, border: 'none',
              background: c.active ? 'var(--surface-1)' : 'transparent',
              color: c.active ? 'var(--ink)' : 'var(--ink-muted)',
              cursor: 'pointer', fontSize: 13, letterSpacing: '-0.13px', marginBottom: 1,
              textAlign: 'right',
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-muted)', flexShrink: 0, marginRight: 6 }}>{c.time}</span>
            </button>
          ))}
        </div>

        {/* stores */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--hairline-soft)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
            متاجري
          </div>
          {[
            { name: 'متجر النور', platform: 'سلة', active: true },
            { name: 'متجر العود', platform: 'زد', active: false },
          ].map(s => (
            <div key={s.name} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 9px', borderRadius: 8,
              background: s.active ? 'var(--surface-1)' : 'transparent', marginBottom: 3,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--semantic-success)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: s.active ? 'var(--ink)' : 'var(--ink-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-muted)' }}>{s.platform}</span>
            </div>
          ))}
        </div>

        {/* apps */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--hairline-soft)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
            التطبيقات
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['أرامكس', 'SMSA', 'تابby'].map(app => (
              <span key={app} style={{ fontSize: 11, background: 'var(--surface-1)', color: 'var(--ink-muted)', borderRadius: 100, padding: '3px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--semantic-success)' }} />
                {app}
              </span>
            ))}
          </div>
        </div>

        {/* bottom links */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid var(--hairline-soft)', display: 'flex', gap: 2 }}>
          <Link to="/activity" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 12 }}>
            <History size={13} /> السجل
          </Link>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, color: 'var(--ink-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12 }}>
            <Settings size={13} /> إعدادات
          </button>
        </div>
      </aside>

      {/* ── CHAT MAIN ───────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* top bar */}
        <div style={{ height: 52, borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10, background: 'var(--canvas)', flexShrink: 0 }}>
          <MessageSquare size={16} color="var(--ink-muted)" />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>متجر النور</span>
            <span style={{ fontSize: 11, color: 'var(--ink-muted)', background: 'var(--surface-1)', borderRadius: 4, padding: '2px 8px' }}>سلة</span>
            <ChevronDown size={13} color="var(--ink-muted)" />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Bell size={16} color="var(--ink-muted)" />
              <span style={{ position: 'absolute', top: -4, left: -4, width: 14, height: 14, background: 'var(--gradient-coral)', borderRadius: '50%', fontSize: 8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>٣</span>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>أ</div>
          </div>
        </div>

        {/* messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              {msg.role === 'deema' && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>D</span>
                </div>
              )}

              <div style={{ maxWidth: msg.role === 'deema' ? '68%' : '55%' }}>
                {msg.role === 'deema' && (
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 5, letterSpacing: '-0.11px' }}>Deema</div>
                )}
                <div style={{
                  background: msg.role === 'user' ? 'var(--surface-2)' : 'var(--surface-1)',
                  borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                  padding: msg.type === 'summary' ? '18px 20px' : '12px 16px',
                  fontSize: 14, lineHeight: 1.6, letterSpacing: '-0.14px',
                  boxShadow: 'rgba(255,255,255,0.04) 0 0.5px 0 inset',
                }}>
                  <div style={{ marginBottom: msg.stats ? 14 : 0, whiteSpace: 'pre-line', color: 'var(--ink)' }}>{msg.content}</div>

                  {msg.stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                      {msg.stats.map(s => (
                        <div key={s.l} style={{ background: 'var(--canvas)', borderRadius: 10, padding: '10px 14px' }}>
                          <div style={{ fontSize: 22, fontWeight: 700, color: s.c, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.actions && (
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: msg.stats ? 0 : 10 }}>
                      {msg.actions.map(a => (
                        <button
                          key={a.label}
                          onClick={() => send(a.label)}
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
          ))}
        </div>

        {/* input area */}
        <div style={{ borderTop: '1px solid var(--hairline)', padding: '12px 20px 16px', background: 'var(--canvas)', flexShrink: 0 }}>
          {/* quick actions */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
            {quickActions.map(a => (
              <button key={a} onClick={() => send(`وريني ${a}`)} style={{
                background: 'var(--surface-1)', color: 'var(--ink-muted)', border: 'none',
                borderRadius: 100, padding: '5px 13px', fontSize: 12, fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '-0.12px',
              }}>{a}</button>
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
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="اكتب أمرك..."
              style={{
                flex: 1,
                background: 'var(--surface-1)',
                border: '1px solid var(--hairline)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 14,
                color: 'var(--ink)',
                outline: 'none',
                fontFamily: 'inherit',
                direction: 'rtl',
                letterSpacing: '-0.14px',
              }}
              onFocus={e => { e.target.style.boxShadow = 'rgba(0,153,255,0.15) 0 0 0 1px'; e.target.style.borderColor = '#0099ff' }}
              onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--hairline)' }}
            />
            <button
              onClick={() => send(input)}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', flexShrink: 0,
                background: input.trim() ? 'var(--primary)' : 'var(--surface-1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
              }}>
              <Send size={14} color={input.trim() ? '#000' : 'var(--ink-muted)'} style={{ transform: 'scaleX(-1)' }} />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
