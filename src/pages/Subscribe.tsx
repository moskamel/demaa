import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TickCircle, Card, Lock, ArrowLeft2, Refresh2, Edit } from 'iconsax-react'

type Plan = 'free' | 'pro'
type PayMethod = 'card' | 'fawry' | 'vodafone' | 'instapay'

const PLANS = [
  {
    id: 'free' as Plan,
    name: 'مجاني',
    price: '٠',
    period: 'دائماً',
    desc: 'ابدأ واكتشف ديما بدون أي تكلفة',
    features: ['متجر واحد', 'حتى ١٠٠ طلب شهرياً', 'تقارير أساسية', 'دعم عبر البريد'],
    featured: false,
  },
  {
    id: 'pro' as Plan,
    name: 'برو',
    price: '٩٩',
    period: 'شهرياً',
    desc: 'للتجار الجادين في تنمية متاجرهم',
    features: ['متاجر غير محدودة', 'طلبات غير محدودة', 'تقارير متقدمة', 'شحن تلقائي', 'دعم أولوية ٢٤/٧', 'تصدير Excel و PDF'],
    featured: true,
    tag: 'الأكثر طلباً',
  },
]

const PAY_METHODS: { id: PayMethod; label: string; icon: string }[] = [
  { id: 'card',      label: 'فيزا / كارت',    icon: '💳' },
  { id: 'fawry',     label: 'فوري',            icon: '🟡' },
  { id: 'vodafone',  label: 'فودافون كاش',     icon: '🔴' },
  { id: 'instapay',  label: 'إنستا باي',       icon: '🟣' },
]

function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d
}

export default function Subscribe() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<Plan>('pro')
  const [step, setStep] = useState<'plan' | 'payment' | 'success'>('plan')
  const [payMethod, setPayMethod] = useState<PayMethod>('card')
  const [loading, setLoading] = useState(false)

  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (payMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'رقم البطاقة غير صحيح'
      if (expiry.replace(/\s\/\s/, '').length < 4) e.expiry = 'تاريخ انتهاء غير صحيح'
      if (cvv.length < 3) e.cvv = 'CVV غير صحيح'
      if (!cardName.trim()) e.cardName = 'أدخل الاسم على البطاقة'
    } else {
      if (phone.replace(/\D/g, '').length < 10) e.phone = 'أدخل رقم الهاتف'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = () => {
    if (selectedPlan === 'free') { navigate('/dashboard'); return }
    setStep('payment')
  }

  const handlePay = async () => {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setStep('success')
    setTimeout(() => navigate('/dashboard'), 2200)
  }

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%', padding: '11px 14px', borderRadius: 10, boxSizing: 'border-box',
    border: `1.5px solid ${hasError ? '#e3505a' : 'var(--hairline)'}`,
    background: 'var(--canvas-soft-2)', color: 'var(--ink)', fontSize: 15, fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.15s',
  })

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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {PLANS.map(plan => {
                const isPro = plan.id === 'pro'
                const isSelected = selectedPlan === plan.id
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    style={{
                      borderRadius: 20, padding: '28px 24px', cursor: 'pointer', position: 'relative',
                      background: isPro ? 'linear-gradient(135deg, #1a1040 0%, #2a1060 100%)' : 'var(--canvas-soft)',
                      border: `2px solid ${isSelected ? (isPro ? '#6a4cf5' : 'var(--ink)') : (isPro ? 'rgba(106,76,245,0.3)' : 'var(--hairline)')}`,
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      boxShadow: isSelected ? (isPro ? '0 0 0 4px rgba(106,76,245,0.2)' : '0 0 0 4px rgba(255,255,255,0.06)') : 'none',
                    }}
                  >
                    {plan.tag && (
                      <div style={{ position: 'absolute', top: -14, right: 20 }}>
                        <span style={{ background: '#ffd02f', color: '#1c1c1e', borderRadius: 9999, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>{plan.tag}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: `2px solid ${isSelected ? (isPro ? '#6a4cf5' : 'var(--ink)') : 'var(--hairline)'}`,
                        background: isSelected ? (isPro ? '#6a4cf5' : 'var(--ink)') : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <TickCircle size={12} color="#fff" variant="Bold" />}
                      </div>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 600, color: isPro ? 'rgba(200,180,255,0.7)' : 'var(--ink-muted)', marginBottom: 6 }}>{plan.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-1.5px', color: isPro ? '#fff' : 'var(--ink)' }}>{plan.price}</span>
                      {plan.id === 'pro' && <span style={{ fontSize: 14, color: 'rgba(200,180,255,0.5)' }}>ج.م / {plan.period}</span>}
                      {plan.id === 'free' && <span style={{ fontSize: 14, color: 'var(--ink-muted)' }}>ج.م</span>}
                    </div>
                    <p style={{ fontSize: 13, color: isPro ? 'rgba(200,180,255,0.65)' : 'var(--ink-muted)', marginBottom: 20, lineHeight: 1.5 }}>{plan.desc}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: isPro ? 'rgba(220,210,255,0.9)' : 'var(--ink)' }}>
                          <TickCircle size={13} color={isPro ? '#a78bfa' : '#22c55e'} variant="Outline" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <button onClick={handleContinue} style={{
              width: '100%', padding: '14px', borderRadius: 9999, border: 'none',
              background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', fontSize: 16, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {selectedPlan === 'free' ? 'ابدأ مجاناً' : 'التالي — إدخال بيانات الدفع'} <ArrowLeft2 size={16} variant="Outline" />
            </button>

            {selectedPlan === 'free' && (
              <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--ink-muted)' }}>يمكنك الترقية لبرو في أي وقت من لوحة التحكم</p>
            )}
          </>
        )}

        {/* ── PAYMENT FORM ── */}
        {step === 'payment' && (
          <div style={{ maxWidth: 520, margin: '0 auto' }}>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: 'var(--ink)' }}>بيانات الدفع</h2>
            </div>

            {/* Order summary */}
            <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '16px 20px', marginBottom: 24 }}>
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
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 8 }}>ثم ٩٩ ج.م شهرياً · إلغاء في أي وقت</p>
              <div style={{ borderTop: '1px solid var(--hairline)', marginTop: 14, paddingTop: 14 }}>
                <button onClick={() => setStep('plan')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '9px 16px', borderRadius: 10, background: 'var(--canvas-soft-2)', border: '1px solid var(--hairline)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: 'var(--ink)', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas-soft)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--canvas-soft-2)' }}
                >
                  <Edit size={13} variant="Outline" />
                  تغيير الخطة
                </button>
              </div>
            </div>

            {/* Payment method tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
              {PAY_METHODS.map(m => (
                <button key={m.id} onClick={() => { setPayMethod(m.id); setErrors({}) }} style={{
                  padding: '10px 6px', borderRadius: 12, border: `2px solid ${payMethod === m.id ? '#6a4cf5' : 'var(--hairline)'}`,
                  background: payMethod === m.id ? 'rgba(106,76,245,0.15)' : 'var(--canvas-soft)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  transition: 'border-color 0.15s, background 0.15s',
                }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: payMethod === m.id ? '#a78bfa' : 'var(--ink-muted)', whiteSpace: 'nowrap' }}>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Card form */}
            {payMethod === 'card' && (
              <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '24px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <Card size={16} color="var(--ink-muted)" variant="Outline" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>بطاقة الدفع</span>
                  <div style={{ marginRight: 'auto', display: 'flex', gap: 6 }}>
                    {['Visa', 'MC', 'Amex'].map(b => (
                      <div key={b} style={{ background: 'var(--canvas-soft-2)', border: '1px solid var(--hairline)', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700, color: 'var(--ink-muted)' }}>{b}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', display: 'block', marginBottom: 6 }}>رقم البطاقة</label>
                    <input value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} placeholder="0000 0000 0000 0000" inputMode="numeric"
                      style={{ ...inputStyle(!!errors.cardNumber), direction: 'ltr', letterSpacing: '0.08em' }}
                      onFocus={e => { e.target.style.borderColor = '#6a4cf5' }}
                      onBlur={e => { e.target.style.borderColor = errors.cardNumber ? '#e3505a' : 'var(--hairline)' }} />
                    {errors.cardNumber && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.cardNumber}</p>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', display: 'block', marginBottom: 6 }}>تاريخ الانتهاء</label>
                      <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM / YY" inputMode="numeric"
                        style={{ ...inputStyle(!!errors.expiry), direction: 'ltr' }}
                        onFocus={e => { e.target.style.borderColor = '#6a4cf5' }}
                        onBlur={e => { e.target.style.borderColor = errors.expiry ? '#e3505a' : 'var(--hairline)' }} />
                      {errors.expiry && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.expiry}</p>}
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', display: 'block', marginBottom: 6 }}>CVV</label>
                      <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" inputMode="numeric" type="password"
                        style={{ ...inputStyle(!!errors.cvv), direction: 'ltr' }}
                        onFocus={e => { e.target.style.borderColor = '#6a4cf5' }}
                        onBlur={e => { e.target.style.borderColor = errors.cvv ? '#e3505a' : 'var(--hairline)' }} />
                      {errors.cvv && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.cvv}</p>}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', display: 'block', marginBottom: 6 }}>الاسم على البطاقة</label>
                    <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="AHMED ALI"
                      style={{ ...inputStyle(!!errors.cardName), direction: 'ltr', textTransform: 'uppercase' }}
                      onFocus={e => { e.target.style.borderColor = '#6a4cf5' }}
                      onBlur={e => { e.target.style.borderColor = errors.cardName ? '#e3505a' : 'var(--hairline)' }} />
                    {errors.cardName && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.cardName}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Fawry / Vodafone / InstaPay — phone input */}
            {(payMethod === 'fawry' || payMethod === 'vodafone' || payMethod === 'instapay') && (
              <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '24px 20px', marginBottom: 20 }}>
                <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
                  {payMethod === 'fawry' && 'أدخل رقم هاتفك المسجّل في فوري. ستصلك رسالة برمز الدفع على أقرب فرع أو من تطبيق فوري.'}
                  {payMethod === 'vodafone' && 'أدخل رقم محفظة فودافون كاش. ستصلك رسالة لإتمام الدفع من التطبيق.'}
                  {payMethod === 'instapay' && 'أدخل رقم الهاتف المرتبط بحساب إنستا باي. ستصلك إشعار للموافقة على الدفع.'}
                </div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', display: 'block', marginBottom: 6 }}>رقم الهاتف</label>
                <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="01XXXXXXXXX" inputMode="numeric"
                  style={{ ...inputStyle(!!errors.phone), direction: 'ltr', letterSpacing: '0.05em' }}
                  onFocus={e => { e.target.style.borderColor = '#6a4cf5' }}
                  onBlur={e => { e.target.style.borderColor = errors.phone ? '#e3505a' : 'var(--hairline)' }} />
                {errors.phone && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.phone}</p>}
              </div>
            )}

            <button onClick={handlePay} disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 9999, border: 'none',
              background: loading ? 'var(--hairline)' : 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff',
              fontSize: 16, fontWeight: 600, fontFamily: 'inherit',
              cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'opacity 0.15s',
            }}>
              {loading
                ? <><Refresh2 size={18} variant="Outline" style={{ animation: 'spin 1s linear infinite' }} /> جارٍ المعالجة...</>
                : <><Lock size={15} variant="Outline" /> ادفع ٤٩.٥ ج.م الآن</>
              }
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              <Lock size={12} color="var(--ink-disabled)" variant="Outline" />
              <span style={{ fontSize: 12, color: 'var(--ink-disabled)' }}>مشفرة بـ SSL 256-bit</span>
            </div>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(34,197,94,0.25)' }}>
              <TickCircle size={34} color="#fff" variant="Bold" />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 10px', color: 'var(--ink)' }}>تم الاشتراك بنجاح! 🎉</h2>
            <p style={{ fontSize: 16, color: 'var(--ink-muted)', marginBottom: 8 }}>مرحباً بك في خطة برو</p>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>جارٍ الانتقال للوحة التحكم...</p>
            <div style={{ marginTop: 24 }}>
              <Refresh2 size={20} color="var(--ink-muted)" variant="Outline" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
