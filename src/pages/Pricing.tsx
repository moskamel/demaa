import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageLayout from '../components/PageLayout'
import { TickCircle, ArrowLeft2 } from 'iconsax-react'
import { PLANS } from '../lib/plans'
import { CURRENCIES, PLAN_PRICES, formatPrice } from '../lib/currency'
import { useCurrency } from '../context/CurrencyContext'
import CurrencySelector from '../components/CurrencySelector'

const T = {
  ink: '#f0f0f5',
  slate: '#9090a2',
  hairline: 'rgba(255,255,255,0.08)',
  muted: '#5e5e72',
  purple: '#6a4cf5',
  pink: '#d44df0',
  well: '#080810',
  surface: '#18181e',
}

const COMPARE_ROWS = [
  { label: 'الطلبات الشهرية', values: ['١٠٠', '٥٠٠', '٢,٠٠٠', '١٠,٠٠٠', 'غير محدود'] },
  { label: 'عدد المتاجر',     values: ['١', '١', '٢', '٣', 'غير محدود'] },
  { label: 'جميع المنصات',    values: [true, true, true, true, true] },
  { label: 'تقارير متقدمة',   values: [false, false, true, true, true] },
  { label: 'ذكاء اصطناعي كامل', values: [false, false, true, true, true] },
  { label: 'API Access',      values: [false, false, false, true, true] },
  { label: 'تصدير التقارير',  values: [false, false, false, true, true] },
  { label: 'مدير حساب مخصص', values: [false, false, false, false, true] },
  { label: 'SLA 99.9%',       values: [false, false, false, false, true] },
]

function AnimatedPrice({ text }: { text: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={text}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        style={{ display: 'inline-block' }}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  )
}

export default function Pricing() {
  const { currency } = useCurrency()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const currencyInfo = CURRENCIES.find(c => c.code === currency)!
  const billingIdx = billing === 'monthly' ? 0 : 1

  const getPlanPrice = (planId: string) => (PLAN_PRICES[planId]?.[currency] ?? [0, 0])[billingIdx]

  const getDisplayPrice = (planId: string) => {
    const amount = getPlanPrice(planId)
    if (amount === 0) return null
    return formatPrice(amount, currencyInfo)
  }

  const getComparePrice = (planId: string) => {
    const amount = getPlanPrice(planId)
    return amount === 0 ? 'مجاناً' : formatPrice(amount, currencyInfo)
  }

  const getSavings = (planId: string) => {
    if (billing !== 'yearly') return null
    const monthly = (PLAN_PRICES[planId]?.[currency] ?? [0, 0])[0]
    const yearly  = (PLAN_PRICES[planId]?.[currency] ?? [0, 0])[1]
    if (!monthly || !yearly) return null
    const saved = monthly * 12 - yearly
    return saved > 0 ? formatPrice(saved, currencyInfo) : null
  }

  return (
    <PageLayout>
      <main style={{ padding: '72px 200px 96px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(106,76,245,0.1)', border: '1px solid rgba(106,76,245,0.2)', borderRadius: 9999, padding: '6px 18px', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: T.slate }}>استرداد كامل خلال ٣٠ يوماً</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,58px)', fontWeight: 800, letterSpacing: '-2px', marginBottom: 16, color: T.ink }}>
            ابدأ مجاناً،<br />طوّر متى تريد
          </h1>
          <p style={{ fontSize: 17, color: T.slate, lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
            لا توجد عقود · إلغاء وقتما تريد · جميع الخطط تشمل جميع المنصات
          </p>
        </div>

        {/* Controls: billing toggle + currency selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
          {/* Billing toggle */}
          <div style={{ display: 'flex', background: T.surface, borderRadius: 9999, padding: 4, border: `1px solid ${T.hairline}`, gap: 4 }}>
            {(['monthly', 'yearly'] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{
                padding: '7px 18px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                background: billing === b ? 'linear-gradient(135deg,#6a4cf5,#d44df0)' : 'transparent',
                color: billing === b ? '#fff' : T.slate,
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {b === 'monthly' ? 'شهري' : 'سنوي'}
                {b === 'yearly' && (
                  <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 9999, padding: '1px 6px', background: billing === 'yearly' ? 'rgba(255,255,255,0.2)' : 'rgba(34,197,94,0.15)', color: billing === 'yearly' ? '#fff' : '#22c55e' }}>
                    وفّر ١٦٪
                  </span>
                )}
              </button>
            ))}
          </div>
          <CurrencySelector />
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, alignItems: 'stretch', marginBottom: 80, paddingTop: 18 }}>
          {PLANS.map((plan, i) => {
            const displayPrice = getDisplayPrice(plan.id)
            const savings = getSavings(plan.id)
            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                whileHover={{ y: -8, boxShadow: plan.featured ? '0 32px 80px rgba(106,76,245,0.3)' : '0 24px 56px rgba(0,0,0,0.4)' }}
                style={{
                  background: plan.featured ? 'linear-gradient(135deg,rgba(106,76,245,0.14),rgba(212,77,240,0.07))' : T.surface,
                  borderRadius: 24, padding: '28px 22px',
                  border: plan.featured ? '1px solid rgba(106,76,245,0.4)' : `1px solid ${T.hairline}`,
                  position: 'relative', display: 'flex', flexDirection: 'column',
                  boxShadow: plan.featured ? '0 16px 48px rgba(106,76,245,0.15)' : 'none',
                }}>

                {plan.tag && (
                  <div style={{ position: 'absolute', top: -13, right: 16 }}>
                    <span style={{ background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', borderRadius: 9999, padding: '4px 12px', fontSize: 10, fontWeight: 700 }}>{plan.tag}</span>
                  </div>
                )}
                {plan.featured && (
                  <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, borderRadius: '24px 24px 0 0', background: 'linear-gradient(90deg,#6a4cf5,#d44df0)' }} />
                )}

                <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, marginBottom: 8, letterSpacing: '0.02em' }}>{plan.name}</div>

                <div style={{ marginBottom: 2, minHeight: 52, display: 'flex', alignItems: 'baseline' }}>
                  {displayPrice === null
                    ? <span style={{ fontSize: 36, fontWeight: 800, color: T.ink, letterSpacing: '-1.5px', lineHeight: 1 }}>مجاناً</span>
                    : <span style={{ fontSize: currencyInfo.decimals > 0 ? 28 : 36, fontWeight: 800, color: T.ink, letterSpacing: '-1.5px', lineHeight: 1, direction: 'ltr' }}>
                        <AnimatedPrice text={displayPrice} />
                      </span>
                  }
                </div>

                <div style={{ marginBottom: 20, minHeight: 34 }}>
                  <div style={{ fontSize: 12, color: T.muted }}>
                    {plan.price === 0 ? 'للأبد' : billing === 'monthly' ? '/ شهر' : '/ سنة'}
                  </div>
                  {savings && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', marginTop: 3 }}>
                      وفّر <AnimatedPrice text={savings} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24, flex: 1 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                      <TickCircle size={13} color={plan.featured ? '#22c55e' : plan.color} variant="Outline" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 12, color: plan.featured ? T.slate : T.muted, lineHeight: 1.45 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link to="/signup" style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
                  textDecoration: 'none', borderRadius: 9999, padding: '11px 16px',
                  fontSize: 13, fontWeight: 700,
                  ...(plan.featured
                    ? { background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', boxShadow: '0 4px 16px rgba(106,76,245,0.35)' }
                    : { background: 'rgba(255,255,255,0.06)', color: T.ink, border: `1px solid ${T.hairline}` }
                  ),
                }}>ابدأ الآن</Link>
              </motion.div>
            )
          })}
        </div>

        {/* Comparison table */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.8px', color: T.ink, textAlign: 'center', marginBottom: 36 }}>مقارنة تفصيلية</h2>
          <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.hairline}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(5,1fr)', background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${T.hairline}` }}>
              <div style={{ padding: '16px 20px' }} />
              {PLANS.map(p => (
                <div key={p.id} style={{ padding: '16px 12px', textAlign: 'center', borderRight: `1px solid ${T.hairline}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2, direction: 'ltr' }}>
                    <AnimatedPrice text={getComparePrice(p.id)} />
                  </div>
                </div>
              ))}
            </div>
            {COMPARE_ROWS.map((row, ri) => (
              <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '2fr repeat(5,1fr)', borderBottom: ri < COMPARE_ROWS.length - 1 ? `1px solid ${T.hairline}` : 'none', background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                <div style={{ padding: '14px 20px', fontSize: 13, color: T.slate, display: 'flex', alignItems: 'center' }}>{row.label}</div>
                {row.values.map((v, vi) => (
                  <div key={vi} style={{ padding: '14px 12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${T.hairline}` }}>
                    {typeof v === 'boolean'
                      ? v ? <span style={{ color: '#22c55e', fontSize: 15 }}>✓</span> : <span style={{ color: T.muted, fontSize: 13 }}>—</span>
                      : <span style={{ fontSize: 12, fontWeight: 600, color: T.ink }}>{v}</span>
                    }
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 80 }}>
          {[
            { q: 'هل هناك عقد ملزم؟', a: 'لا — إلغاء وقتما تريد بدون رسوم أو شروط.' },
            { q: 'ماذا يحدث عند تجاوز الحد الشهري؟', a: 'سنبلغك مسبقاً. يمكنك الترقية أو الانتظار للشهر القادم.' },
            { q: 'هل يمكن تغيير الخطة في أي وقت؟', a: 'نعم، الترقية فورية والتخفيض يسري من الدورة القادمة.' },
            { q: 'كيف يعمل استرداد الـ ٣٠ يوماً؟', a: 'أرسل لنا بريداً إلكترونياً خلال ٣٠ يوماً ونعيد المبلغ كاملاً — بدون أسئلة.' },
          ].map(item => (
            <div key={item.q} style={{ background: T.surface, borderRadius: 16, padding: '22px 24px', border: `1px solid ${T.hairline}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{item.q}</div>
              <div style={{ fontSize: 14, color: T.slate, lineHeight: 1.6 }}>{item.a}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg,rgba(106,76,245,0.15),rgba(212,77,240,0.1))', borderRadius: 28, padding: '64px 48px', border: '1px solid rgba(106,76,245,0.25)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(106,76,245,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: '-1.5px', color: T.ink, marginBottom: 14, position: 'relative' }}>هل أنت مستعد؟</h2>
          <p style={{ fontSize: 16, color: T.slate, marginBottom: 36, position: 'relative' }}>ابدأ بالخطة المجانية اليوم — لا تحتاج بطاقة ائتمان.</p>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', borderRadius: 9999, padding: '15px 36px', fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 32px rgba(106,76,245,0.4)', position: 'relative' }}>
            ابدأ مجاناً الآن <ArrowLeft2 size={16} variant="Outline" />
          </Link>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginTop: 20 }}>
            {['✅ بدون بطاقة ائتمان', '✅ ربط في دقيقتين', '✅ استرداد ٣٠ يوماً'].map(t => (
              <span key={t} style={{ fontSize: 13, color: T.muted }}>{t}</span>
            ))}
          </div>
        </div>

      </main>
    </PageLayout>
  )
}
