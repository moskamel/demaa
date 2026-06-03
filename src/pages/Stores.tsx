import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Add, Refresh2, Link as LinkIcon, TickCircle, Clock, Pause, Play, Trash } from 'iconsax-react'
import { storesApi, type StoreData } from '../lib/api'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../components/Toast'

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
  const [pausing, setPausing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { confirm, Dialog } = useConfirm()
  const toast = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    storesApi.list().then(r => setStores(r.stores)).catch(() => setStores([])).finally(() => setLoading(false))
  }, [])

  const handleDisconnect = async (id: string, name: string) => {
    const ok = await confirm({ title: 'فصل المتجر', message: `هل تريد فصل متجر "${name}"؟`, confirmLabel: 'فصل المتجر', danger: true, risk: 'critical', consequence: 'لن تتمكن من استقبال طلبات جديدة من هذا المتجر. يمكنك إعادة الربط لاحقاً.', confirmPhrase: 'DISCONNECT' })
    if (!ok) return
    setDisconnecting(id)
    try {
      await storesApi.disconnect(id)
      setStores(prev => prev.map(s => s.id === id ? { ...s, isActive: false, syncStatus: 'idle' } : s))
      toast.success('تم فصل المتجر')
    } catch {
      toast.error('فشل فصل المتجر')
    } finally {
      setDisconnecting(null)
    }
  }

  const handlePauseResume = async (id: string, isActive: boolean) => {
    const action = isActive ? 'إيقاف' : 'تشغيل'
    const ok = await confirm({
      title: `${action} المتجر`,
      message: `هل تريد ${action} هذا المتجر؟`,
      confirmLabel: action,
      risk: 'medium',
      consequence: isActive
        ? 'لن يتم استقبال طلبات جديدة مؤقتاً. يمكنك إعادة التشغيل في أي وقت.'
        : 'سيبدأ استقبال الطلبات من هذا المتجر مجدداً.',
    })
    if (!ok) return
    setPausing(id)
    try {
      if (isActive) await storesApi.pause(id)
      else await storesApi.resume(id)
      setStores(prev => prev.map(s => s.id === id ? { ...s, isActive: !isActive } : s))
      toast.success(isActive ? 'تم إيقاف المتجر مؤقتاً' : 'تم تشغيل المتجر')
    } catch {
      toast.error('فشلت العملية')
    } finally {
      setPausing(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'حذف المتجر نهائياً',
      message: `هل تريد حذف متجر "${name}" نهائياً؟`,
      confirmLabel: 'حذف نهائي',
      danger: true,
      risk: 'critical',
      consequence: 'سيتم حذف المتجر وجميع بياناته بشكل دائم ولا يمكن التراجع.',
      confirmPhrase: 'DELETE',
    })
    if (!ok) return
    setDeleting(id)
    try {
      await storesApi.delete(id)
      setStores(prev => prev.filter(s => s.id !== id))
      toast.success('تم حذف المتجر')
    } catch {
      toast.error('فشل حذف المتجر')
    } finally {
      setDeleting(null)
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

  return (<>
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppSidebar />
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--canvas)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <div style={{ padding: '50px 200px', width: '100%' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--ink)', marginBottom: 6 }}>متاجري</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{stores.length} متجر مربوط بـ Deema</p>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />)}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stores.map((s, idx) => {
            const pColor = platformColors[s.platform] ?? '#666'
            const pLabel = platformLabel[s.platform] ?? s.platform
            const st = statusMap(s.isActive, s.syncStatus)
            const StatusIcon = st.icon
            const isSyncing = syncing === s.id
            return (
              <div key={s.id} className="animate-fade-in-up card-interactive" style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '20px 22px', border: '1px solid var(--hairline)', position: 'relative', overflow: 'hidden', animationDelay: `${idx * 60}ms` }}>
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

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleSync(s.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--canvas-soft-2)', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--ink-muted)', cursor: 'pointer' }}
                      >
                        <Refresh2 size={11} variant="Outline" style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
                        {isSyncing ? 'جاري التزامن...' : 'مزامنة'}
                      </button>

                      {/* Pause / Resume */}
                      <button
                        onClick={() => handlePauseResume(s.id, s.isActive)}
                        disabled={pausing === s.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: s.isActive ? 'rgba(255,122,61,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${s.isActive ? 'rgba(255,122,61,0.2)' : 'rgba(34,197,94,0.2)'}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, color: s.isActive ? '#ff7a3d' : '#22c55e', cursor: 'pointer', opacity: pausing === s.id ? 0.5 : 1 }}
                      >
                        {s.isActive
                          ? <><Pause size={11} variant="Outline" /> {pausing === s.id ? '...' : 'إيقاف مؤقت'}</>
                          : <><Play size={11} variant="Outline" /> {pausing === s.id ? '...' : 'تشغيل'}</>}
                      </button>

                      {!s.isActive && (
                        <Link to="/onboarding" state={{ fromDashboard: true }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,122,61,0.1)', border: '1px solid rgba(255,122,61,0.25)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--gradient-orange)', cursor: 'pointer', textDecoration: 'none' }}>
                          إعادة الربط
                        </Link>
                      )}

                      <button
                        onClick={() => handleDisconnect(s.id, s.name)}
                        disabled={disconnecting === s.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--ink-muted)', cursor: 'pointer', opacity: disconnecting === s.id ? 0.5 : 1 }}>
                        <LinkIcon size={11} variant="Outline" />
                        {disconnecting === s.id ? 'جاري الفصل...' : 'فصل'}
                      </button>

                      {/* Delete — far left */}
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        disabled={deleting === s.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,85,119,0.06)', border: '1px solid rgba(255,85,119,0.15)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#ff5577', cursor: 'pointer', marginRight: 'auto', opacity: deleting === s.id ? 0.5 : 1 }}>
                        <Trash size={11} variant="Outline" />
                        {deleting === s.id ? 'جاري الحذف...' : 'حذف'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {!loading && stores.length === 0 && (
          <div className="animate-fade-in-scale" style={{ textAlign: 'center', padding: 60, color: 'var(--ink-muted)', fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
            <p style={{ marginBottom: 16 }}>لا يوجد متاجر مربوطة بعد</p>
            <Link to="/onboarding" state={{ fromDashboard: true }} className="btn-primary" style={{ fontSize: 13 }}>ربط متجرك الأول</Link>
          </div>
        )}

        <Link to="/onboarding" state={{ fromDashboard: true }} style={{ textDecoration: 'none' }}>
          <div className="hover-lift" style={{ marginTop: 12, background: 'transparent', border: '2px dashed var(--hairline)', borderRadius: 16, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', color: 'var(--ink-muted)', transition: 'border-color 0.2s, color 0.2s' }}>
            <Add size={16} variant="Outline" />
            <span style={{ fontSize: 14 }}>ربط متجر جديد</span>
          </div>
        </Link>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
    {Dialog}
  </>
  )
}
