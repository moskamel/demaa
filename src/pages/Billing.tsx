import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flash, TickCircle, CloseCircle, Warning2, Clock, Refresh2,
  Box, Shop, People, ArrowUp, InfoCircle,
} from 'iconsax-react'
import { storesApi, teamApi } from '../lib/api'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { PageEnter, FadeUp, StaggerList, StaggerItem, AnimCard, AnimBtn, PopNumber } from '../components/Anim'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubStatus {
  id: string
  planId: string
  planLabel: string
  planPrice: number
  status: string
  ordersUsed: number
  ordersLimit: number
  usagePercent: number
  currentPeriodEnd: string
  daysRemaining: number
  isExpiringSoon: boolean
  isExpired: boolean
  isCancelled: boolean
  canReactivate: boolean
}

// ── Plans ─────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'free',
    label: 'مجاني',
    price: 0,
    currency: '$',
    period: 'للأبد',
    color: '#6b7280',
    features: ['100 طلب / شهر', '1 متجر', 'دعم أساسي', 'ذكاء اصطناعي محدود'],
    highlight: false,
  },
  {
    id: 'starter',
    label: 'المبتدئ',
    price: 99,
    currency: '$',
    period: '/ شهر',
    color: '#3b82f6',
    features: ['500 طلب / شهر', '1 متجر', 'جميع المنصات', 'تقارير أساسية', 'دعم بالبريد'],
    highlight: false,
  },
  {
    id: 'growth',
    label: 'النمو',
    price: 249,
    currency: '$',
    period: '/ شهر',
    color: '#6a4cf5',
    features: ['2,000 طلب / شهر', '2 متجر', 'جميع المنصات', 'تقارير متقدمة', 'ذكاء اصطناعي كامل', 'دعم أولوية'],
    highlight: true,
    badge: 'الأكثر شيوعاً',
  },
  {
    id: 'pro',
    label: 'الاحترافي',
    price: 499,
    currency: '$',
    period: '/ شهر',
    color: '#d44df0',
    features: ['10,000 طلب / شهر', '3 متاجر', 'جميع المنصات', 'API Access', 'تصدير التقارير', 'دعم مباشر 24/7'],
    highlight: false,
  },
  {
    id: 'enterprise',
    label: 'المؤسسات',
    price: 999,
    currency: '$',
    period: '/ شهر',
    color: '#f59e0b',
    features: ['طلبات غير محدودة', 'متاجر غير محدودة', 'API Access كامل', 'مدير حساب مخصص', 'SLA 99.9%'],
    highlight: false,
  },
]

const BASE = '/api'

async function apiFetch(path: string, method = 'GET', body?: Record<string, unknown>) {
  const token = localStorage.getItem('deema_token')
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message ?? 'Request failed')
  return data
}

// ── Alert banner ──────────────────────────────────────────────────────────────

function AlertBanner({ sub }: { sub: SubStatus }) {
  if (!sub.isExpiringSoon && !sub.isExpired && !sub.isCancelled) return null

  if (sub.isExpired) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, marginBottom: 20 }}>
        <Warning2 size={20} color="#ef4444" variant="Outline" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 2 }}>انتهى اشتراكك</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>قم بالتجديد للاستمرار في استخدام Deema بدون انقطاع</div>
        </div>
        <button
          onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          تجديد الآن
        </button>
      </div>
    )
  }

  if (sub.isCancelled) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, marginBottom: 20 }}>
        <InfoCircle size={20} color="#f59e0b" variant="Outline" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginBottom: 2 }}>الاشتراك ملغى</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            وصولك سينتهي بعد {sub.daysRemaining} يوم ({new Date(sub.currentPeriodEnd).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })})
          </div>
        </div>
      </div>
    )
  }

  if (sub.isExpiringSoon) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, marginBottom: 20 }}>
        <Clock size={20} color="#f59e0b" variant="Outline" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginBottom: 2 }}>اشتراكك ينتهي قريباً</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            متبقي {sub.daysRemaining} {sub.daysRemaining === 1 ? 'يوم' : 'أيام'} فقط — قم بالتجديد لتجنب انقطاع الخدمة
          </div>
        </div>
        <button
          onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          تجديد
        </button>
      </div>
    )
  }

  return null
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Billing() {
  const navigate = useNavigate()
  const [sub, setSub] = useState<SubStatus | null>(null)
  const [storeCount, setStoreCount] = useState(0)
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [reactivating, setReactivating] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [statusData, storesData, teamData] = await Promise.all([
        apiFetch('/billing/status'),
        storesApi.list(),
        teamApi.list(),
      ])
      setSub(statusData.subscription)
      setStoreCount(storesData.stores.length)
      setMemberCount(teamData.members.length)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg && !msg.includes('غير موجود') && !msg.includes('404')) {
        showToast(msg, 'error')
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleUpgrade = async (planId: string) => {
    if (planId === sub?.planId) return
    setUpgrading(planId)
    try {
      const data = await apiFetch('/billing/upgrade', 'POST', { planId })
      showToast(data.message ?? 'تم الترقية بنجاح')
      await loadData()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'فشل الترقية', 'error')
    } finally { setUpgrading(null) }
  }

  const handleCancel = async () => {
    setCancelling(true)
    setShowCancelConfirm(false)
    try {
      const data = await apiFetch('/billing/cancel', 'POST')
      showToast(data.message ?? 'تم إلغاء الاشتراك')
      await loadData()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'فشل الإلغاء', 'error')
    } finally { setCancelling(false) }
  }

  const handleReactivate = async () => {
    setReactivating(true)
    try {
      const data = await apiFetch('/billing/reactivate', 'POST')
      showToast(data.message ?? 'تم تفعيل الاشتراك')
      await loadData()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'فشل التفعيل', 'error')
    } finally { setReactivating(false) }
  }

  const currentPlan = PLANS.find(p => p.id === sub?.planId) ?? PLANS[0]
  const renewDate = sub ? new Date(sub.currentPeriodEnd).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
  const daysColor = !sub ? '#6b7280' : sub.daysRemaining <= 3 ? '#ef4444' : sub.daysRemaining <= 7 ? '#f59e0b' : '#22c55e'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Zain','Inter',sans-serif", direction: 'rtl' }}>
      <AppSidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--canvas)' }}>
        <AppHeader title="الاشتراك" />

        <div style={{ padding: '24px 200px', boxSizing: 'border-box' }}>
        <PageEnter>

          {/* Alert banner */}
          {sub && <AlertBanner sub={sub} />}

          {/* Current plan overview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

            {/* Plan card */}
            <div className="card-hover" style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: `1px solid ${currentPlan.color}40`, padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, background: `linear-gradient(90deg, ${currentPlan.color}, ${currentPlan.color}88)` }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 4 }}>باقتك الحالية</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px' }}>
                    <PopNumber>{loading ? '...' : `باقة ${sub?.planLabel ?? 'مجاني'}`}</PopNumber>
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: currentPlan.color, letterSpacing: '-1px', lineHeight: 1 }}>
                    {currentPlan.price === 0 ? 'مجاناً' : `$${currentPlan.price}`}
                  </div>
                  {currentPlan.price > 0 && <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>شهرياً</div>}
                </div>
              </div>

              {/* Status row */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '3px 9px',
                  background: sub?.isCancelled ? 'rgba(245,158,11,0.12)' : sub?.isExpired ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                  color: sub?.isCancelled ? '#f59e0b' : sub?.isExpired ? '#ef4444' : '#22c55e',
                }}>
                  {loading ? '...' : sub?.isCancelled ? 'ملغى' : sub?.isExpired ? 'منتهي' : 'نشط ✓'}
                </span>
                {sub && !sub.isExpired && (
                  <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '3px 9px', background: `${daysColor}15`, color: daysColor }}>
                    {sub.daysRemaining} يوم متبقي
                  </span>
                )}
              </div>

              {/* Renewal date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--canvas)', borderRadius: 10, marginBottom: 14 }}>
                <Clock size={14} color="var(--ink-muted)" variant="Outline" />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{sub?.isCancelled ? 'ينتهي الوصول في' : 'تاريخ التجديد'}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{loading ? '...' : renewDate}</div>
                </div>
              </div>

              {/* Days remaining progress bar */}
              {sub && !sub.isExpired && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>أيام الاشتراك</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: daysColor }}>{sub.daysRemaining}/30</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--canvas)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (sub.daysRemaining / 30) * 100)}%`, background: daysColor, borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                {sub?.canReactivate && (
                  <AnimBtn onClick={handleReactivate} disabled={reactivating} style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Refresh2 size={14} />
                    {reactivating ? 'جارٍ التفعيل...' : 'إعادة تفعيل'}
                  </AnimBtn>
                )}
                {sub && !sub.isCancelled && !sub.isExpired && sub.planId !== 'free' && (
                  <button onClick={() => setShowCancelConfirm(true)} disabled={cancelling} style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {cancelling ? 'جارٍ الإلغاء...' : 'إلغاء الاشتراك'}
                  </button>
                )}
              </div>
            </div>

            {/* Usage card */}
            <div className="card-hover" style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '22px 24px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 18 }}>استخدامك هذا الشهر</div>

              {/* Orders usage */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Box size={14} color="var(--ink-muted)" variant="Outline" />
                    <span style={{ fontSize: 13, color: 'var(--ink)' }}>الطلبات</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: (sub?.usagePercent ?? 0) >= 90 ? '#ef4444' : (sub?.usagePercent ?? 0) >= 70 ? '#f59e0b' : 'var(--ink-muted)' }}>
                    {loading ? '...' : `${sub?.ordersUsed ?? 0} / ${sub?.ordersLimit === 999999 ? '∞' : (sub?.ordersLimit ?? 0)}`}
                  </span>
                </div>
                <div style={{ height: 7, background: 'var(--canvas)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, sub?.usagePercent ?? 0)}%`,
                    background: (sub?.usagePercent ?? 0) >= 90 ? '#ef4444' : (sub?.usagePercent ?? 0) >= 70 ? '#f59e0b' : 'linear-gradient(90deg,#6a4cf5,#d44df0)',
                    borderRadius: 4, transition: 'width 0.6s ease',
                  }} />
                </div>
                {(sub?.usagePercent ?? 0) >= 80 && (
                  <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Warning2 size={11} />
                    {(sub?.usagePercent ?? 0) >= 90 ? 'اقتربت من الحد الأقصى!' : 'اقتربت من %80 من حدك الشهري'}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                <div style={{ background: 'var(--canvas)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Shop size={16} color="var(--ink-muted)" variant="Outline" />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{loading ? '...' : storeCount}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>متاجر</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plans comparison */}
          <div id="plans-section">
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>اختر الباقة المناسبة لك</div>

            <StaggerList style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, alignItems: 'stretch' }}>
              {PLANS.map(plan => {
                const isCurrent = plan.id === sub?.planId
                const isUpgrade = PLANS.findIndex(p => p.id === plan.id) > PLANS.findIndex(p => p.id === sub?.planId)
                const isProcessing = upgrading === plan.id

                return (
                  <StaggerItem key={plan.id} style={{ height: '100%' }}><div style={{
                    background: plan.highlight ? 'rgba(106,76,245,0.06)' : 'var(--canvas-soft)',
                    borderRadius: 14,
                    border: isCurrent ? `2px solid ${plan.color}` : plan.highlight ? '1px solid rgba(106,76,245,0.3)' : '1px solid var(--hairline)',
                    padding: '18px 16px',
                    position: 'relative',
                    display: 'flex', flexDirection: 'column',
                    height: '100%', boxSizing: 'border-box',
                  }}>
                    {plan.badge && (
                      <div style={{ position: 'absolute', top: -10, right: 16, fontSize: 10, fontWeight: 700, background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', borderRadius: 20, padding: '3px 8px' }}>
                        {plan.badge}
                      </div>
                    )}

                    <div style={{ fontSize: 14, fontWeight: 700, color: plan.color, marginBottom: 6 }}>{plan.label}</div>
                    <div style={{ marginBottom: 14 }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px' }}>
                        {plan.price === 0 ? 'مجاناً' : `$${plan.price}`}
                      </span>
                      {plan.price > 0 && <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{plan.period}</span>}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <TickCircle size={12} color={plan.color} variant="Outline" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.4 }}>{f}</span>
                        </div>
                      ))}
                    </div>

                    {isCurrent ? (
                      <div style={{ padding: '8px', borderRadius: 8, background: `${plan.color}15`, color: plan.color, fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                        ✓ باقتك الحالية
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={!!upgrading}
                        style={{
                          padding: '8px', borderRadius: 8, border: 'none', cursor: upgrading ? 'not-allowed' : 'pointer',
                          background: isUpgrade ? `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)` : 'var(--canvas)',
                          color: isUpgrade ? '#fff' : 'var(--ink-muted)',
                          fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          opacity: upgrading && !isProcessing ? 0.5 : 1,
                          transition: 'opacity 0.15s',
                        }}
                      >
                        {isProcessing ? (
                          <span>جارٍ التغيير...</span>
                        ) : isUpgrade ? (
                          <><ArrowUp size={12} /> ترقية</>
                        ) : (
                          'تخفيض'
                        )}
                      </button>
                    )}
                  </div></StaggerItem>
                )
              })}
            </StaggerList>
          </div>

        </PageEnter>
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowCancelConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', borderRadius: 18, padding: '28px', width: 340, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', direction: 'rtl', fontFamily: 'inherit' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <CloseCircle size={22} color="#ef4444" variant="Outline" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>تأكيد إلغاء الاشتراك</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 20 }}>
              ستظل تتمتع بجميع مميزات باقتك الحالية حتى {renewDate}.
              بعد ذلك سيتم تخفيضك إلى الباقة المجانية.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCancel} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                نعم، إلغاء الاشتراك
              </button>
              <button onClick={() => setShowCancelConfirm(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', padding: '12px 20px', borderRadius: 12, background: toast.type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 600, animation: 'fadeIn 0.2s ease', fontFamily: 'inherit' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
