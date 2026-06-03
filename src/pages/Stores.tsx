import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Add, Refresh2, Link as LinkIcon, TickCircle, Clock, ArrowLeft2 } from 'iconsax-react'
import { storesApi, type StoreData } from '../lib/api'

const statusMap = (isActive: boolean, syncStatus: string) => {
  if (syncStatus === 'syncing') return { label: 'جاري التزامن', color: '#0099ff', icon: Clock }
  if (!isActive) return { label: 'يحتاج تجديد', color: '#ff7a3d', icon: Clock }
  return { label: 'متصل', color: '#22c55e', icon: TickCircle }
}

const platformColors: Record<string, string> = {
  shopify: '#6a4cf5', wuilt: '#d44df0', shantaweb: '#22c55e',
}

const platformLabel: Record<string, string> = {
  shopify: 'Shopify', wuilt: 'Wuilt', shantaweb: 'Shantaweb',
}

export default function Stores() {
  const [stores, setStores] = useState<StoreData[]>([])
  const [syncing, setSyncing] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    storesApi.list().then(r => setStores(r.stores)).catch(() => setStores([])).finally(() => setLoading(false))
  }, [])

  const handleDisconnect = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من فصل هذا المتجر؟')) return
    setDisconnecting(id)
    try {
      await storesApi.disconnect(id)
      setStores(prev => prev.map(s => s.id === id ? { ...s, isActive: false, syncStatus: 'idle' } : s))
    } catch {
      // ignore
    } finally {
      setDisconnecting(null)
    }
  }

  const handleSync = async (id: string) => {
    setSyncing(id)
    try {
      await storesApi.sync(id)
      setTimeout(async () => {
        const r = await storesApi.list()
        setStores(r.stores)
        setSyncing(null)
      }, 2000)
    } catch {
      setSyncing(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', padding: '0 0 60px' }}>
      <div style={{ borderBottom: '1px solid var(--hairline)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft2 size={14} variant="Outline" />
          الرئيسية
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>متاجري</span>
        <div style={{ flex: 1 }} />
        <Link to="/onboarding" className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
          <Add size={13} variant="Outline" /> ربط متجر جديد
        </Link>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--ink)', marginBottom: 6 }}>متاجري</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{stores.length} متجر مربوط بـ Deema</p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-muted)', fontSize: 14 }}>جاري التحميل...</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stores.map(s => {
            const pColor = platformColors[s.platform] ?? '#666'
            const pLabel = platformLabel[s.platform] ?? s.platform
            const st = statusMap(s.isActive, s.syncStatus)
            const StatusIcon = st.icon
            const isSyncing = syncing === s.id
            return (
              <div key={s.id} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '20px 22px', border: '1px solid var(--hairline)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 3, background: pColor, borderRadius: '0 16px 16px 0' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: pColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: pColor }}>{s.name[0]}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: pColor, background: pColor + '18', borderRadius: 4, padding: '2px 7px', fontWeight: 500 }}>{pLabel}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 'auto' }}>
                        <StatusIcon size={12} color={st.color} variant="Outline" />
                        <span style={{ fontSize: 12, color: st.color }}>{st.label}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 14 }}>
                      {s.lastSyncAt ? `آخر تزامن: ${new Date(s.lastSyncAt).toLocaleString('ar-SA')}` : 'لم يتم التزامن بعد'}
                    </div>

                    <div style={{ display: 'flex', gap: 24, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px' }}>{s._count.orders.toLocaleString('ar-SA')}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>إجمالي الطلبات</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px' }}>{s._count.products.toLocaleString('ar-SA')}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>إجمالي المنتجات</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleSync(s.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--canvas-soft-2)', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--ink-muted)', cursor: 'pointer' }}
                      >
                        <Refresh2 size={11} variant="Outline" style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
                        {isSyncing ? 'جاري التزامن...' : 'مزامنة'}
                      </button>
                      {!s.isActive && (
                        <Link to="/onboarding" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,122,61,0.1)', border: '1px solid rgba(255,122,61,0.25)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--gradient-orange)', cursor: 'pointer', textDecoration: 'none' }}>
                          إعادة الربط
                        </Link>
                      )}
                      <button
                        onClick={() => handleDisconnect(s.id)}
                        disabled={disconnecting === s.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--ink-muted)', cursor: 'pointer', marginRight: 'auto', opacity: disconnecting === s.id ? 0.5 : 1 }}>
                        <LinkIcon size={11} variant="Outline" />
                        {disconnecting === s.id ? 'جاري الفصل...' : 'فصل'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {!loading && stores.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-muted)', fontSize: 14 }}>
            <p style={{ marginBottom: 16 }}>لا يوجد متاجر مربوطة بعد</p>
            <Link to="/onboarding" className="btn-primary" style={{ fontSize: 13 }}>ربط متجرك الأول</Link>
          </div>
        )}

        <Link to="/onboarding" style={{ textDecoration: 'none' }}>
          <div style={{ marginTop: 12, background: 'transparent', border: '2px dashed var(--hairline)', borderRadius: 16, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', color: 'var(--ink-muted)' }}>
            <Add size={16} variant="Outline" />
            <span style={{ fontSize: 14 }}>ربط متجر جديد</span>
          </div>
        </Link>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
