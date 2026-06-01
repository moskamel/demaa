import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Plus, Send, Mic, ChevronDown, Settings, MessageSquare, History } from 'lucide-react'

type Message = {
  id: number
  role: 'user' | 'deema'
  content: string
  type?: 'summary' | 'confirmation' | 'result' | 'text'
  stats?: { n: string; l: string; c: string }[]
  actions?: { label: string; style: 'primary' | 'secondary' }[]
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'deema',
    type: 'summary',
    content: 'صباح الخير أحمد! 🌅 ملخص متجرك لهذا الصباح:',
    stats: [
      { n: '47', l: 'طلب جديد', c: 'var(--accent-amber)' },
      { n: '12', l: 'معلق', c: 'var(--primary)' },
      { n: '32', l: 'مشحون', c: 'var(--success)' },
      { n: '3', l: 'مشاكل', c: 'var(--error)' },
    ],
    actions: [
      { label: 'اقبل الجاهزة ٣٥ طلب', style: 'primary' },
      { label: 'وريني المشاكل', style: 'secondary' },
    ],
  },
]

const conversations = [
  { id: 1, title: 'طلبات اليوم', time: 'الآن', active: true },
  { id: 2, title: 'إضافة منتج جديد', time: 'أمس' },
  { id: 3, title: 'تقرير الأسبوع', time: '٣ أيام' },
  { id: 4, title: 'ربط أرامكس', time: '٥ أيام' },
]

const quickActions = ['الطلبات', 'الشحن', 'المنتجات', 'التقارير', 'العملاء']

const botReplies: Record<string, Message> = {
  default: { id: 0, role: 'deema', type: 'text', content: 'فهمت طلبك! هل تريد أن أكمل هذا الإجراء؟' },
  orders: {
    id: 0,
    role: 'deema',
    type: 'confirmation',
    content: 'هتقبل ٣٥ طلب بمجموع ١٤,٥٠٠ ر.س من متجر النور على سلة.\n\n✅ ٣٥ طلب سليم\n⏩ سيتم إنشاء بوالص الشحن تلقائياً',
    actions: [
      { label: 'نعم، نفّذ', style: 'primary' },
      { label: 'لا، ألغِ', style: 'secondary' },
      { label: 'وريني التفاصيل', style: 'secondary' },
    ],
  },
}

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [msgCounter, setMsgCounter] = useState(10)

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: msgCounter, role: 'user', type: 'text', content: text }
    const lower = text.toLowerCase()
    const reply = lower.includes('اقبل') || lower.includes('طلب')
      ? { ...botReplies.orders, id: msgCounter + 1 }
      : { ...botReplies.default, id: msgCounter + 1 }

    setMessages(prev => [...prev, userMsg, reply])
    setMsgCounter(c => c + 2)
    setInput('')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--canvas)', overflow: 'hidden' }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={{
          width: 260,
          background: 'var(--surface-dark)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderLeft: '1px solid #2a2825',
        }}>
          {/* Logo */}
          <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #2a2825' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>D</span>
              </div>
              <span style={{ color: 'var(--on-dark)', fontFamily: 'Noto Serif Arabic, serif', fontSize: 16 }}>Deema</span>
            </div>
          </div>

          {/* New chat */}
          <div style={{ padding: '12px 12px 8px' }}>
            <button style={{
              width: '100%',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <Plus size={14} />
              محادثة جديدة
            </button>
          </div>

          {/* Conversations */}
          <div style={{ padding: '8px 12px', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--on-dark-soft)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, padding: '0 4px' }}>
              المحادثات الأخيرة
            </div>
            {conversations.map(c => (
              <button key={c.id} style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 6,
                border: 'none',
                background: c.active ? 'var(--surface-dark-elevated)' : 'transparent',
                color: c.active ? 'var(--on-dark)' : 'var(--on-dark-soft)',
                cursor: 'pointer',
                fontSize: 13,
                textAlign: 'right',
                marginBottom: 2,
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                <span style={{ fontSize: 11, color: 'var(--on-dark-soft)', flexShrink: 0, marginRight: 8 }}>{c.time}</span>
              </button>
            ))}
          </div>

          {/* Stores */}
          <div style={{ padding: '12px', borderTop: '1px solid #2a2825' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--on-dark-soft)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              متاجري
            </div>
            {[
              { name: 'متجر النور', platform: 'سلة', active: true },
              { name: 'متجر العود', platform: 'زد', active: false },
            ].map(s => (
              <div key={s.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 8px',
                borderRadius: 6,
                background: s.active ? 'var(--surface-dark-elevated)' : 'transparent',
                marginBottom: 4,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--on-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--on-dark-soft)' }}>{s.platform}</div>
                </div>
                {s.active && <span style={{ fontSize: 10, color: 'var(--success)' }}>✓</span>}
              </div>
            ))}
          </div>

          {/* Apps */}
          <div style={{ padding: '12px', borderTop: '1px solid #2a2825' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--on-dark-soft)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              التطبيقات
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['أرامكس', 'SMSA', 'تابby'].map(app => (
                <span key={app} style={{
                  fontSize: 11,
                  background: 'var(--surface-dark-elevated)',
                  color: 'var(--on-dark-soft)',
                  borderRadius: 999,
                  padding: '3px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)' }} />
                  {app}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom nav */}
          <div style={{ padding: '12px', borderTop: '1px solid #2a2825', display: 'flex', gap: 4 }}>
            <Link to="/activity" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 6, color: 'var(--on-dark-soft)', textDecoration: 'none', fontSize: 12, background: 'transparent' }}>
              <History size={13} />
              السجل
            </Link>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 6, color: 'var(--on-dark-soft)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12 }}>
              <Settings size={13} />
              الإعدادات
            </button>
          </div>
        </aside>
      )}

      {/* Main chat area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          height: 56,
          borderBottom: '1px solid var(--hairline)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 12,
          background: 'var(--canvas)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--muted)', display: 'flex' }}
          >
            <MessageSquare size={18} />
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>متجر النور</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--surface-card)', borderRadius: 999, padding: '2px 10px' }}>سلة</span>
            <ChevronDown size={14} color="var(--muted)" />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Bell size={18} color="var(--muted)" />
              <span style={{ position: 'absolute', top: -4, left: -4, width: 16, height: 16, background: 'var(--error)', borderRadius: '50%', fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>٣</span>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>أ</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              {msg.role === 'deema' && (
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8 }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 11 }}>D</span>
                </div>
              )}
              <div style={{ maxWidth: msg.role === 'deema' ? '65%' : '55%' }}>
                {msg.role === 'deema' && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}>Deema</div>
                )}
                <div style={{
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-card)',
                  color: msg.role === 'user' ? '#fff' : 'var(--ink)',
                  borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                  padding: msg.type === 'summary' ? 20 : '12px 16px',
                  fontSize: 14,
                  lineHeight: 1.65,
                }}>
                  <div style={{ marginBottom: msg.stats ? 16 : 0, whiteSpace: 'pre-line' }}>{msg.content}</div>

                  {msg.stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                      {msg.stats.map(s => (
                        <div key={s.l} style={{ background: 'var(--canvas)', borderRadius: 8, padding: '10px 14px' }}>
                          <div style={{ fontSize: 22, fontWeight: 700, color: s.c, fontFamily: 'monospace' }}>{s.n}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.actions && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {msg.actions.map(a => (
                        <button key={a.label} style={{
                          background: a.style === 'primary' ? 'var(--primary)' : 'var(--canvas)',
                          color: a.style === 'primary' ? '#fff' : 'var(--ink)',
                          border: a.style === 'secondary' ? '1px solid var(--hairline)' : 'none',
                          borderRadius: 8,
                          padding: '8px 14px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }} onClick={() => sendMessage(a.label)}>
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

        {/* Input area */}
        <div style={{
          borderTop: '1px solid var(--hairline)',
          padding: '12px 24px 16px',
          background: 'var(--canvas)',
          flexShrink: 0,
        }}>
          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
            {quickActions.map(a => (
              <button key={a} onClick={() => sendMessage(`وريني ${a}`)} style={{
                background: 'var(--surface-card)',
                color: 'var(--body)',
                border: 'none',
                borderRadius: 999,
                padding: '5px 14px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>{a}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button style={{ background: 'none', border: '1px solid var(--hairline)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Mic size={15} color="var(--muted)" />
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="اكتب أمرك..."
              style={{
                flex: 1,
                background: 'var(--surface-soft)',
                border: '1px solid var(--hairline)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 14,
                color: 'var(--ink)',
                outline: 'none',
                fontFamily: 'Noto Sans Arabic, sans-serif',
                direction: 'rtl',
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              style={{
                background: input.trim() ? 'var(--primary)' : 'var(--primary-disabled)',
                border: 'none',
                borderRadius: 8,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                flexShrink: 0,
              }}>
              <Send size={15} color={input.trim() ? '#fff' : 'var(--muted)'} style={{ transform: 'scaleX(-1)' }} />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
