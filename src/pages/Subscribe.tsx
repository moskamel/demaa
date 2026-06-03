import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CreditCard, Lock, ArrowLeft, Loader } from 'lucide-react'

type Plan = 'free' | 'pro'

const PLANS = [
  {
    id: 'free' as Plan,
    name: 'مجاني',
    price: '٠',
    period: 'دائماً',
    desc: 'ابدأ واكتشف ديما بدون أي تكلفة',
    features: ['متجر واحد', 'حتى ١٠٠ طلب شهرياً', 'تقارير أساسية', 'دعم عبر البريد'],
    cta: 'ابدأ مجاناً',
    featured: false,
  },
  {
    id: 'pro' as Plan,
    name: 'برو',
    price: '٩٩',
    period: 'شهرياً',
    desc: 'للتجار الجادين في تنمية متاجرهم',
    features: ['متاجر غير محدودة', 'طلبات غير محدودة', 'تقارير متقدمة', 'شحن تلقائي', 'دعم أولوية ٢٤/٧', 'تصدير Excel و PDF'],
    cta: 'اشترك الآن',
    featured: true,
    tag: 'الأكثر طلباً',
  },
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
  const [loading, setLoading] = useState(false)

  // Payment form
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'رقم البطاقة غير صحيح'
    if (expiry.replace(/\s\/\s/, '').length < 4) e.expiry = 'تاريخ انتهاء غير صحيح'
    if (cvv.length < 3) e.cvv = 'CVV غير صحيح'
    if (!cardName.trim()) e.cardName = 'أدخل الاسم على البطاقة'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = () => {
    if (selectedPlan === 'free') {
      navigate('/dashboard')
      return
    }
    setStep('payment')
  }

  const handlePay = async () => {
    if (!validate()) return
    setLoading(true)
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000))
    setLoading(false)
    setStep('success')
    setTimeout(() => navigate('/dashboard'), 2200)
  }

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%', padding: '11px 14px', borderRadius: 10, boxSizing: 'border-box',
    border: `1.5px solid ${hasError ? '#e3505a' : '#c7cad5'}`,
    background: '#fff', color: '#1c1c1e', fontSize: 15, fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.15s',
  })

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: "'Zain', 'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e2e8', height: 60, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#ffd02f', fontWeight: 700, fontSize: 12 }}>D</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1c1c1e' }}>Deema</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8e91a0' }}>
          <Lock size={12} />
          دفع آمن ومشفر
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

        {/* ── PLAN SELECTION ─────────────────────────────────────────────────── */}
        {step === 'plan' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 500, letterSpacing: '-1px', margin: '0 0 10px', color: '#1c1c1e' }}>اختر خطتك</h1>
              <p style={{ fontSize: 16, color: '#555a6a' }}>ابدأ مجاناً أو اشترك في برو للحصول على كل المميزات</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  style={{
                    borderRadius: 20, padding: '28px 24px', cursor: 'pointer', position: 'relative',
                    background: '#fff',
                    border: `2px solid ${selectedPlan === plan.id ? '#1c1c1e' : '#e0e2e8'}`,
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxShadow: selectedPlan === plan.id ? '0 0 0 4px rgba(28,28,30,0.06)' : 'none',
                  }}
                >
                  {plan.tag && (
                    <div style={{ position: 'absolute', top: -14, right: 20 }}>
                      <span style={{ background: '#ffd02f', color: '#1c1c1e', borderRadius: 9999, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>{plan.tag}</span>
                    </div>
                  )}

                  {/* Selection indicator */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: `2px solid ${selectedPlan === plan.id ? '#1c1c1e' : '#c7cad5'}`,
                      background: selectedPlan === plan.id ? '#1c1c1e' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {selectedPlan === plan.id && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 600, color: '#8e91a0', marginBottom: 6 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-1.5px', color: '#1c1c1e' }}>{plan.price}</span>
                    {plan.id === 'pro' && <span style={{ fontSize: 14, color: '#8e91a0' }}>ج.م / {plan.period}</span>}
                    {plan.id === 'free' && <span style={{ fontSize: 14, color: '#8e91a0' }}>ج.م</span>}
                  </div>
                  <p style={{ fontSize: 13, color: '#555a6a', marginBottom: 20, lineHeight: 1.5 }}>{plan.desc}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#2c2c34' }}>
                        <Check size={13} color="#00b473" strokeWidth={2.5} /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleContinue} style={{
              width: '100%', padding: '14px', borderRadius: 9999, border: 'none',
              background: '#1c1c1e', color: '#fff', fontSize: 16, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {selectedPlan === 'free' ? 'ابدأ مجاناً' : 'التالي — إدخال بيانات الدفع'} <ArrowLeft size={16} />
            </button>

            {selectedPlan === 'free' && (
              <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#8e91a0' }}>يمكنك الترقية لبرو في أي وقت من لوحة التحكم</p>
            )}
          </>
        )}

        {/* ── PAYMENT FORM ───────────────────────────────────────────────────── */}
        {step === 'payment' && (
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <button onClick={() => setStep('plan')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#555a6a', fontSize: 14, fontFamily: 'inherit', marginBottom: 32, padding: 0 }}>
              <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} /> تغيير الخطة
            </button>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.5px', margin: '0 0 8px', color: '#1c1c1e' }}>بيانات الدفع</h2>
              <p style={{ fontSize: 14, color: '#555a6a' }}>اشتراك برو · ٩٩ ج.م شهرياً</p>
            </div>

            {/* Order summary */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e0e2e8', padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: '#555a6a' }}>خطة برو — شهري</span>
                <span style={{ fontWeight: 600, color: '#1c1c1e' }}>٩٩ ج.م</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: '#555a6a' }}>خصم الإطلاق (٥٠٪)</span>
                <span style={{ fontWeight: 600, color: '#00b473' }}>−٤٩.٥ ج.م</span>
              </div>
              <div style={{ borderTop: '1px solid #e0e2e8', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, fontWeight: 700 }}>
                <span>الإجمالي اليوم</span>
                <span style={{ color: '#1c1c1e' }}>٤٩.٥ ج.م</span>
              </div>
              <p style={{ fontSize: 12, color: '#8e91a0', marginTop: 8 }}>ثم ٩٩ ج.م شهرياً · إلغاء في أي وقت</p>
            </div>

            {/* Card form */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e0e2e8', padding: '24px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <CreditCard size={16} color="#555a6a" />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1e' }}>بطاقة الدفع</span>
                <div style={{ marginRight: 'auto', display: 'flex', gap: 6 }}>
                  {['Visa', 'MC', 'Amex'].map(b => (
                    <div key={b} style={{ background: '#f7f8fa', border: '1px solid #e0e2e8', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700, color: '#555a6a' }}>{b}</div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Card number */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#555a6a', display: 'block', marginBottom: 6 }}>رقم البطاقة</label>
                  <input
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    inputMode="numeric"
                    style={{ ...inputStyle(!!errors.cardNumber), direction: 'ltr', letterSpacing: '0.08em' }}
                    onFocus={e => { e.target.style.borderColor = '#1c1c1e' }}
                    onBlur={e => { e.target.style.borderColor = errors.cardNumber ? '#e3505a' : '#c7cad5' }}
                  />
                  {errors.cardNumber && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.cardNumber}</p>}
                </div>

                {/* Expiry + CVV */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#555a6a', display: 'block', marginBottom: 6 }}>تاريخ الانتهاء</label>
                    <input
                      value={expiry}
                      onChange={e => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM / YY"
                      inputMode="numeric"
                      style={{ ...inputStyle(!!errors.expiry), direction: 'ltr' }}
                      onFocus={e => { e.target.style.borderColor = '#1c1c1e' }}
                      onBlur={e => { e.target.style.borderColor = errors.expiry ? '#e3505a' : '#c7cad5' }}
                    />
                    {errors.expiry && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.expiry}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#555a6a', display: 'block', marginBottom: 6 }}>CVV</label>
                    <input
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                      inputMode="numeric"
                      type="password"
                      style={{ ...inputStyle(!!errors.cvv), direction: 'ltr' }}
                      onFocus={e => { e.target.style.borderColor = '#1c1c1e' }}
                      onBlur={e => { e.target.style.borderColor = errors.cvv ? '#e3505a' : '#c7cad5' }}
                    />
                    {errors.cvv && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.cvv}</p>}
                  </div>
                </div>

                {/* Name on card */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#555a6a', display: 'block', marginBottom: 6 }}>الاسم على البطاقة</label>
                  <input
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    placeholder="AHMED ALI"
                    style={{ ...inputStyle(!!errors.cardName), direction: 'ltr', textTransform: 'uppercase' }}
                    onFocus={e => { e.target.style.borderColor = '#1c1c1e' }}
                    onBlur={e => { e.target.style.borderColor = errors.cardName ? '#e3505a' : '#c7cad5' }}
                  />
                  {errors.cardName && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.cardName}</p>}
                </div>
              </div>
            </div>

            <button onClick={handlePay} disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 9999, border: 'none',
              background: loading ? '#c7cad5' : '#1c1c1e', color: '#fff',
              fontSize: 16, fontWeight: 600, fontFamily: 'inherit',
              cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 0.15s',
            }}>
              {loading ? (
                <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> جارٍ المعالجة...</>
              ) : (
                <><Lock size={15} /> ادفع ٤٩.٥ ج.م الآن</>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <Lock size={12} color="#8e91a0" />
              <span style={{ fontSize: 12, color: '#8e91a0' }}>مدفوعاتك مشفرة بـ SSL 256-bit</span>
            </div>
          </div>
        )}

        {/* ── SUCCESS ────────────────────────────────────────────────────────── */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#00b473', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(0,180,115,0.25)' }}>
              <Check size={34} color="#fff" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.5px', margin: '0 0 10px', color: '#1c1c1e' }}>تم الاشتراك بنجاح! 🎉</h2>
            <p style={{ fontSize: 16, color: '#555a6a', marginBottom: 8 }}>مرحباً بك في خطة برو</p>
            <p style={{ fontSize: 14, color: '#8e91a0' }}>جارٍ الانتقال للوحة التحكم...</p>
            <div style={{ marginTop: 24 }}>
              <Loader size={20} color="#8e91a0" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
