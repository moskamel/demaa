import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft2, Refresh2, Edit } from 'iconsax-react'
import { PLANS } from '../lib/plans'
import { useCurrency } from '../context/CurrencyContext'
import { CURRENCIES, getPlanAmount, formatPrice } from '../lib/currency'
import CurrencySelector from '../components/CurrencySelector'
import PlanCard from '../components/PlanCard'

export default function Subscribe() {
  const navigate = useNavigate()
  const { currency } = useCurrency()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState('growth')
  const [step, setStep] = useState<'plan' | 'payment'>('plan')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleContinue = () => {
    if (selectedPlan === 'free') { navigate('/dashboard'); return }
    setStep('payment')
  }

  const handlePay = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('deema_token')
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: selectedPlan }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error?.message || 'فشل الاتصال ببوابة الدفع')
        setLoading(false)
        return
      }
      // Redirect to Paymob hosted payment page
      window.location.href = data.paymentUrl
    } catch {
      setError('فشل الاتصال بالخادم، يرجى المحاولة مجدداً')
      setLoading(false)
    }
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--canvas)', fontFamily: "'Zain', 'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: 'var(--canvas-soft)', borderBottom: '1px solid var(--hairline)', height: 60, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#ffd02f', fontWeight: 700, fontSize: 12 }}>D</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Deema</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

        {/* ── PLAN SELECTION ── */}
        {step === 'plan' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 10px', color: 'var(--ink)' }}>اختر خطتك</h1>
              <p style={{ fontSize: 16, color: 'var(--ink-muted)' }}>ابدأ مجاناً أو اشترك في برو للحصول على كل المميزات</p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: 'var(--canvas-soft)', borderRadius: 9999, padding: 3, border: '1px solid var(--hairline)', gap: 3 }}>
                  {(['monthly', 'yearly'] as const).map(b => (
                    <button key={b} onClick={() => setBilling(b)} style={{
                      padding: '6px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                      background: billing === b ? 'linear-gradient(135deg,#6a4cf5,#d44df0)' : 'transparent',
                      color: billing === b ? '#fff' : 'var(--ink-muted)',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      {b === 'monthly' ? 'شهري' : 'سنوي'}
                      {b === 'yearly' && <span style={{ fontSize: 9, fontWeight: 700, borderRadius: 9999, padding: '1px 5px', background: billing === 'yearly' ? 'rgba(255,255,255,0.2)' : 'rgba(34,197,94,0.15)', color: billing === 'yearly' ? '#fff' : '#22c55e' }}>وفّر ١٦٪</span>}
                    </button>
                  ))}
                </div>
                <CurrencySelector />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 32, paddingTop: 14 }}>
              {PLANS.map((plan, i) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  currency={currency}
                  billing={billing}
                  index={i}
                  selected={selectedPlan === plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  cta={
                    <div style={{
                      borderRadius: 9999, padding: '10px 16px', textAlign: 'center',
                      fontSize: 12, fontWeight: 700,
                      ...(plan.featured
                        ? { background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff' }
                        : { background: 'rgba(255,255,255,0.06)', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.08)' }
                      ),
                    }}>
                      {selectedPlan === plan.id ? '✓ محدد' : 'اختر'}
                    </div>
                  }
                />
              ))}
            </div>

            <button onClick={handleContinue} style={{
              width: '100%', padding: '14px', borderRadius: 9999, border: 'none',
              background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', fontSize: 16, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {selectedPlan === 'free' ? 'ابدأ مجاناً' : 'التالي — إتمام الدفع'} <ArrowLeft2 size={16} variant="Outline" />
            </button>

            {selectedPlan === 'free' && (
              <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--ink-muted)' }}>يمكنك الترقية لبرو في أي وقت من لوحة التحكم</p>
            )}
          </>
        )}

        {/* ── PAYMENT ── */}
        {step === 'payment' && (
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 8px', color: 'var(--ink)' }}>إتمام الدفع</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>ستنتقل إلى بوابة Paymob الآمنة لإتمام الدفع</p>
            </div>

            {/* Order summary */}
            <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: 'var(--ink-muted)' }}>خطة برو — شهري</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>٩٩ ج.م</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: 'var(--ink-muted)' }}>خصم الإطلاق (٥٠٪)</span>
                <span style={{ fontWeight: 600, color: '#22c55e' }}>−٤٩.٥ ج.م</span>
              </div>
              <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, fontWeight: 700 }}>
                <span style={{ color: 'var(--ink)' }}>الإجمالي اليوم</span>
                <span style={{ color: 'var(--ink)' }}>٤٩.٥ ج.م</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 8, marginBottom: 0 }}>ثم ٩٩ ج.م شهرياً · إلغاء في أي وقت</p>
            </div>

            {/* Paymob card badge */}
            <div style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #1a56db, #0e9f6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18 }}>💳</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>فيزا / ماستركارد / ميزة</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>مدعوم بواسطة <strong style={{ color: 'var(--ink)' }}>Paymob</strong> — الدفع مشفر وآمن</div>
              </div>
              <div style={{ marginRight: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                {['Visa', 'MC', 'Meeza'].map(b => (
                  <div key={b} style={{ background: 'var(--canvas-soft-2)', border: '1px solid var(--hairline)', borderRadius: 5, padding: '3px 7px', fontSize: 10, fontWeight: 700, color: 'var(--ink-muted)' }}>{b}</div>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#f87171' }}>
                {error}
              </div>
            )}

            <button onClick={handlePay} disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 9999, border: 'none',
              background: loading ? 'var(--hairline)' : 'linear-gradient(135deg, #6a4cf5, #d44df0)',
              color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: 'inherit',
              cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'opacity 0.15s',
            }}>
              {loading
                ? <><Refresh2 size={18} variant="Outline" style={{ animation: 'spin 1s linear infinite' }} /> جارٍ التحويل...</>
                : <><Lock size={15} variant="Outline" /> ادفع ٤٩.٥ ج.م عبر Paymob</>
              }
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              <Lock size={12} color="var(--ink-disabled)" variant="Outline" />
              <span style={{ fontSize: 12, color: 'var(--ink-disabled)' }}>مشفرة بـ SSL 256-bit عبر Paymob</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button onClick={() => setStep('plan')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-muted)', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Edit size={12} variant="Outline" /> تغيير الخطة
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
