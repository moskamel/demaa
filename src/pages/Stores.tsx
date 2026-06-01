import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw, Unlink, AlertCircle, CheckCircle, Clock, ChevronLeft } from 'lucide-react'

interface StoreItem {
  id: string
  name: string
  platform: 'سلة' | 'زد' | 'Shopify'
  domain: string
  status: 'connected' | 'error' | 'expired' | 'pending'
  ordersMonth: number
  revenueMonth: number
  lastSync: string
  color: string
}

const STORES: StoreItem[] = [
  { id: 'S1', name: 'متجر النور', platform: 'سلة', domain: 'noor.salla.sa', status: 'connected', ordersMonth: 234, revenueMonth: 89_420, lastSync: 'منذ 5 دقائق', color: '#6a4cf5' },
  { id: 'S2', name: 'متجر العود', platform: 'زد', domain: 'aloud.zid.sa', status: 'connected', ordersMonth: 87, revenueMonth: 34_650, lastSync: 'منذ 12 دقيقة', color: '#d44df0' },
  { id: 'S3', name: 'متجر الأناقة', platform: 'Shopify', domain: 'elegance.myshopify.com', status: 'expired', ordersMonth: 43, revenueMonth: 18_200, lastSync: 'منذ 3 ساعات', color: '#ff7a3d' },
]

const statusMap = {
  connected: { label: 'متصل', color: '#22c55e', icon: CheckCircle },
  error: { label: 'خطأ في الاتصال', color: '#ff5577', icon: AlertCircle },
  expired: { label: 'يحتاج تجديد', color: '#ff7a3d', icon: Clock },
  pending: { label: 'جاري الربط', color: '#999', icon: Clock },
}

const platformColors = { 'سلة': '#6a4cf5', 'زد': '#d44df0', 'Shopify': '#22c55e' }

export default function Stores() {
  const [syncing, setSyncing] = useState<string | null>(null)

  const handleSync = (id: string) => {
    setSyncing(id)
    setTimeout(() => setSyncing(null), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', padding: '0 0 60px' }}>
      {/* top bar */}
      <div style={{ borderBottom: '1px solid var(--hairline)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13 }}>
          <ChevronLeft size={14} />
          الرئيسية
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>متاجري</span>
        <div style={{ flex: 1 }} />
        <Link to="/onboarding" className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
          <Plus size={13} /> ربط متجر جديد
        </Link>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        {/* heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--ink)', marginBottom: 6 }}>متاجري</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{STORES.length} متاجر مربوطة بـ Deema</p>
        </div>

        {/* stores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STORES.map(s => {
            const st = statusMap[s.status]
            const StatusIcon = st.icon
            const isSyncing = syncing === s.id
            return (
              <div key={s.id} style={{ background: 'var(--surface-1)', borderRadius: 16, padding: '20px 22px', border: '1px solid var(--hairline)', position: 'relative', overflow: 'hidden' }}>
                {/* left accent bar */}
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 3, background: s.color, borderRadius: '0 16px 16px 0' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* logo */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.name[0]}</span>
                  </div>

                  {/* info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: platformColors[s.platform], background: platformColors[s.platform] + '18', borderRadius: 4, padding: '2px 7px', fontWeight: 500 }}>{s.platform}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 'auto' }}>
                        <StatusIcon size={12} color={st.color} />
                        <span style={{ fontSize: 12, color: st.color }}>{st.label}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 14 }}>
                      {s.domain} · آخر تزامن: {s.lastSync}
                    </div>

                    {/* stats row */}
                    <div style={{ display: 'flex', gap: 24, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px' }}>{s.ordersMonth.toLocaleString('ar-SA')}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>طلب هذا الشهر</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px' }}>{s.revenueMonth.toLocaleString('ar-SA')}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>ر.س إيراد</div>
                      </div>
                    </div>

                    {/* actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleSync(s.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface-2)', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--ink-muted)', cursor: 'pointer' }}
                      >
                        <RefreshCw size={11} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
                        {isSyncing ? 'جاري التزامن...' : 'مزامنة'}
                      </button>
                      {s.status === 'expired' && (
                        <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,122,61,0.1)', border: '1px solid rgba(255,122,61,0.25)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--gradient-orange)', cursor: 'pointer' }}>
                          إعادة الربط
                        </button>
                      )}
                      <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--ink-muted)', cursor: 'pointer', marginRight: 'auto' }}>
                        <Unlink size={11} />
                        فصل
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* add store card */}
        <Link to="/onboarding" style={{ textDecoration: 'none' }}>
          <div style={{ marginTop: 12, background: 'transparent', border: '2px dashed var(--hairline)', borderRadius: 16, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', color: 'var(--ink-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
          >
            <Plus size={16} />
            <span style={{ fontSize: 14 }}>ربط متجر جديد</span>
          </div>
        </Link>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
