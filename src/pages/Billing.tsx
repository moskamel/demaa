import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Check, Zap } from 'lucide-react'

interface Plan {
  id: 'starter' | 'growth' | 'pro' | 'enterprise'
  nameAr: string
  price: number | null
  priceNote?: string
  ordersLimit: string
  platforms: number | string
  team: string
  connectors: string
  reports: string
  api: boolean
  highlighted: boolean
  features: string[]
}

const PLANS: Plan[] = [
  {
    id: 'starter', nameAr: 'Starter', price: 99, ordersLimit: 'حتى 100 طلب/شهر',
    platforms: 1, team: '—', connectors: '2', reports: 'أساسي', api: false,
    highlighted: false,
    features: ['منصة واحدة', '100 طلب/شهر', 'تطبيقَين متصلَين', 'ملخص يومي', 'قبول ورفض الطلبات'],
  },
  {
    id: 'growth', nameAr: 'Growth', price: 299, ordersLimit: 'حتى 1000 طلب/شهر',
    platforms: 2, team: '2 أعضاء', connectors: '5', reports: 'متقدم', api: false,
    highlighted: true,
    features: ['منصتَين', '1000 طلب/شهر', '5 تطبيقات', 'فريق 2 أعضاء', 'تقارير متقدمة', 'كوبونات + إشعارات واتساب'],
  },
  {
    id: 'pro', nameAr: 'Pro', price: 699, ordersLimit: 'غير محدود',
    platforms: 3, team: '10 أعضاء', connectors: 'غير محدود', reports: 'كامل', api: true,
    highlighted: false,
    features: ['3 منصات', 'طلبات غير محدودة', 'تطبيقات غير محدودة', 'فريق 10 أعضاء', 'تقارير كاملة', 'API Access', 'أولوية الدعم'],
  },
  {
    id: 'enterprise', nameAr: 'Enterprise', price: null, priceNote: 'تفاوض', ordersLimit: 'غير محدود',
    platforms: 'غير محدود', team: 'غير محدود', connectors: 'غير محدود', reports: 'كامل + مخصص', api: true,
    highlighted: false,
    features: ['كل مميزات Pro', 'SLA مخصص', 'Dedicated Account Manager', 'تكاملات مخصصة', 'White-label'],
  },
]

const INVOICES = [
  { id: 'INV-2025-01', date: 'يناير 2025', plan: 'Growth', amount: 299, status: 'مدفوع' },
  { id: 'INV-2024-12', date: 'ديسمبر 2024', plan: 'Growth', amount: 299, status: 'مدفوع' },
  { id: 'INV-2024-11', date: 'نوفمبر 2024', plan: 'Growth', amount: 299, status: 'مدفوع' },
]

export default function Billing() {
  const [currentPlan] = useState<Plan['id']>('growth')
  const [tab, setTab] = useState<'plans' | 'invoices'>('plans')
  const [upgrading, setUpgrading] = useState<string | null>(null)

  const handleUpgrade = (planId: string) => {
    setUpgrading(planId)
    setTimeout(() => setUpgrading(null), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', paddingBottom: 60 }}>
      {/* top bar */}
      <div style={{ borderBottom: '1px solid var(--hairline)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13 }}>
          <ChevronLeft size={14} /> الرئيسية
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>الاشتراك</span>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* current status */}
        <div style={{ background: 'linear-gradient(135deg, #6a4cf5 0%, #4a3cb5 100%)', borderRadius: 16, padding: '24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 }}>باقة Growth — نشطة</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>يتجدد في 15 فبراير 2025 · 299 ر.س/شهر</div>
          </div>
          <div style={{ marginRight: 'auto', textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>استخدام هذا الشهر</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>543 / 1000 طلب</div>
          </div>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--surface-1)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {([['plans', 'الباقات'], ['invoices', 'الفواتير']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} style={{ padding: '7px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', background: tab === v ? 'var(--surface-2)' : 'transparent', color: tab === v ? 'var(--ink)' : 'var(--ink-muted)' }}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'plans' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {PLANS.map(plan => {
              const isCurrent = plan.id === currentPlan
              const isUpgrading = upgrading === plan.id
              return (
                <div key={plan.id} style={{ background: plan.highlighted ? 'var(--surface-2)' : 'var(--surface-1)', borderRadius: 16, padding: '20px', border: `1px solid ${isCurrent ? '#6a4cf5' : plan.highlighted ? 'rgba(106,76,245,0.3)' : 'var(--hairline)'}`, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  {isCurrent && <div style={{ position: 'absolute', top: -1, right: -1, left: -1, height: 3, background: '#6a4cf5', borderRadius: '16px 16px 0 0' }} />}
                  {plan.highlighted && !isCurrent && <div style={{ fontSize: 10, fontWeight: 700, color: '#6a4cf5', background: 'rgba(106,76,245,0.12)', borderRadius: 6, padding: '3px 8px', width: 'fit-content', marginBottom: 8 }}>الأكثر شيوعاً</div>}
                  {isCurrent && <div style={{ fontSize: 10, fontWeight: 700, color: '#6a4cf5', background: 'rgba(106,76,245,0.12)', borderRadius: 6, padding: '3px 8px', width: 'fit-content', marginBottom: 8 }}>باقتك الحالية</div>}

                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{plan.nameAr}</div>

                  <div style={{ marginBottom: 16 }}>
                    {plan.price !== null ? (
                      <>
                        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-1px' }}>{plan.price}</span>
                        <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}> ر.س/شهر</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>{plan.priceNote}</span>
                    )}
                  </div>

                  <div style={{ flex: 1, marginBottom: 16 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' }}>
                        <Check size={11} color="#22c55e" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isUpgrading}
                      style={{ width: '100%', padding: '9px', borderRadius: 10, cursor: isUpgrading ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: plan.id === 'enterprise' ? 'transparent' : plan.highlighted ? '#fff' : 'var(--surface-2)', color: plan.highlighted ? '#000' : 'var(--ink)', border: plan.id === 'enterprise' ? '1px solid var(--hairline)' : 'none', opacity: isUpgrading ? 0.6 : 1 }}
                    >
                      {isUpgrading ? '...' : plan.id === 'enterprise' ? 'تواصل معنا' : plan.price! > 299 ? 'ترقية' : 'تخفيض'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'invoices' && (
          <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
            {INVOICES.map((inv, i) => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: i < INVOICES.length - 1 ? '1px solid var(--hairline-soft)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>{inv.date}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>باقة {inv.plan} · {inv.id}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{inv.amount} ر.س</div>
                <div style={{ fontSize: 11, color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: 6, padding: '3px 8px' }}>{inv.status}</div>
                <button style={{ fontSize: 12, color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>تحميل</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
