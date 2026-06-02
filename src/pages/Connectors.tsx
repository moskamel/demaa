import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, CheckCircle, AlertCircle, Clock, Plus, ExternalLink } from 'lucide-react'
import { connectorsApi, type ConnectorData as Connector } from '../lib/api'

const categoryLabels = {
  shipping: 'شركات الشحن',
  payment: 'بوابات الدفع',
  messaging: 'التواصل',
  ads: 'الإعلانات',
  accounting: 'المحاسبة',
}

const categoryOrder: (keyof typeof categoryLabels)[] = ['shipping', 'payment', 'messaging', 'ads', 'accounting']

const statusConfig = {
  connected: { label: 'متصل', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle },
  expired: { label: 'منتهي', color: '#ff7a3d', bg: 'rgba(255,122,61,0.1)', icon: Clock },
  error: { label: 'خطأ', color: '#ff5577', bg: 'rgba(255,85,119,0.1)', icon: AlertCircle },
  disconnected: { label: 'غير متصل', color: '#555', bg: 'var(--surface-2)', icon: Plus },
}

const connectorColors: Record<string, string> = {
  aramex: '#e60026', smsa: '#003087', jt: '#e60000',
  tabby: '#3bff5e', tamara: '#f0c000', whatsapp: '#25d366',
  meta_ads: '#1877f2', snapchat: '#fffc00', qoyod: '#6a4cf5',
}

function ConnectorCard({ c, onToggle }: { c: Connector; onToggle: (type: string) => void }) {
  const st = statusConfig[c.status as keyof typeof statusConfig] || statusConfig.disconnected
  const StatusIcon = st.icon
  const color = connectorColors[c.type] || '#666'

  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 14, padding: '16px', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* logo */}
      <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: c.logo.length > 1 ? 11 : 15, fontWeight: 700, color, direction: 'ltr' }}>{c.logo}</span>
      </div>

      {/* info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{c.nameAr}</div>
        {c.lastUsed ? (
          <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>آخر استخدام: {c.lastUsed}</div>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>غير مربوط</div>
        )}
      </div>

      {/* status + action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: st.bg, borderRadius: 100, padding: '4px 9px' }}>
          <StatusIcon size={10} color={st.color} />
          <span style={{ fontSize: 11, color: st.color }}>{st.label}</span>
        </div>

        {c.status === 'connected' ? (
          <button
            onClick={() => onToggle(c.type)}
            style={{ fontSize: 11, color: 'var(--ink-muted)', background: 'var(--surface-2)', border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer' }}
          >
            فصل
          </button>
        ) : c.status === 'expired' ? (
          <button
            onClick={() => onToggle(c.type)}
            style={{ fontSize: 11, color: 'var(--gradient-orange)', background: 'rgba(255,122,61,0.1)', border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer' }}
          >
            تجديد
          </button>
        ) : (
          <button
            onClick={() => onToggle(c.type)}
            style={{ fontSize: 11, color: 'var(--ink)', background: 'var(--surface-2)', border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={9} /> ربط
          </button>
        )}
      </div>
    </div>
  )
}

export default function Connectors() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    connectorsApi.list().then(data => {
      setConnectors(data.connectors)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleToggle = async (type: string) => {
    const c = connectors.find(x => x.type === type)!
    if (c.status === 'connected') {
      await connectorsApi.disconnect(type).catch(() => {})
      setConnectors(prev => prev.map(x => x.type === type ? { ...x, status: 'disconnected', lastUsed: undefined } : x))
    } else {
      setConnecting(type)
      try {
        await connectorsApi.connect(type)
        setConnectors(prev => prev.map(x => x.type === type ? { ...x, status: 'connected', lastUsed: 'الآن' } : x))
      } catch {
        // ignore
      } finally {
        setConnecting(null)
      }
    }
  }

  const connected = connectors.filter(c => c.status === 'connected').length
  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-muted)', fontSize: 14 }}>جاري التحميل...</div>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', paddingBottom: 60 }}>
      {/* top bar */}
      <div style={{ borderBottom: '1px solid var(--hairline)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13 }}>
          <ChevronLeft size={14} /> الرئيسية
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>التطبيقات المتصلة</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{connected} من {connectors.length} متصل</span>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--ink)', marginBottom: 6 }}>التطبيقات المتصلة</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>اربط شركات الشحن والدفع والتواصل لتعمل Deema بالكامل</p>
        </div>

        {/* stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {(['shipping', 'payment', 'messaging'] as const).map(cat => {
            const catItems = connectors.filter(c => c.category === cat)
            const catConnected = catItems.filter(c => c.status === 'connected').length
            return (
              <div key={cat} style={{ flex: 1, background: 'var(--surface-1)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px' }}>{catConnected}/{catItems.length}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{categoryLabels[cat]}</div>
              </div>
            )
          })}
        </div>

        {/* categories */}
        {categoryOrder.map(cat => {
          const items = connectors.filter(c => c.category === cat)
          return (
            <div key={cat} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                {categoryLabels[cat]}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(c => (
                  connecting === c.type ? (
                    <div key={c.type} style={{ background: 'var(--surface-1)', borderRadius: 14, padding: '16px', border: '1px solid rgba(0,153,255,0.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--accent-blue)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>جاري ربط {c.nameAr}...</span>
                    </div>
                  ) : (
                    <ConnectorCard key={c.type} c={c} onToggle={handleToggle} />
                  )
                ))}
              </div>
            </div>
          )
        })}

        {/* footer note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12 }}>
          <ExternalLink size={13} color="var(--ink-muted)" />
          <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>جميع مفاتيح API مشفرة بـ AES-256 ولا تُشارك مع أي طرف ثالث</span>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
