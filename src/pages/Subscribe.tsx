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
    border: `1.5px solid ${hasError ? '#e3505a' : '#c7cad5'}`,
    background: '#fff', color: '#1c1c1e', fontSize: 15, fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.15s',
  })

  const selectedPlanObj = PLANS.find(p => p.id === selectedPlan)!

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: "'Zain', 'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e2e8', height: 60, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#ffd02f', fontWeight: 700, fontSize: 12 }}>D</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1c1c1e' }}>Deema</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

        {/* ── PLAN SELECTION ── */}
        {step === 'plan' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 500, letterSpacing: '-1px', margin: '0 0 10px', color: '#1c1c1e' }}>اختر خطتك</h1>
              <p style={{ fontSize: 16, color: '#555a6a' }}>ابدأ مجاناً أو اشترك في برو للحصول على كل المميزات</p>
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
                      background: isPro ? '#1c1c1e' : '#fff',
                      border: `2px solid ${isSelected ? (isPro ? '#1c1c1e' : '#1c1c1e') : (isPro ? '#1c1c1e' : '#e0e2e8')}`,
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      boxShadow: isSelected ? '0 0 0 4px rgba(28,28,30,0.1)' : 'none',
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
                        border: `2px solid ${isSelected ? (isPro ? '#fff' : '#1c1c1e') : (isPro ? 'rgba(255,255,255,0.3)' : '#c7cad5')}`,
                        background: isSelected ? (isPro ? '#fff' : '#1c1c1e') : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <TickCircle size={12} color={isPro ? '#1c1c1e' : '#fff'} variant="Bold" />}
                      </div>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 600, color: isPro ? 'rgba(255,255,255,0.55)' : '#8e91a0', marginBottom: 6 }}>{plan.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-1.5px', color: isPro ? '#fff' : '#1c1c1e' }}>{plan.price}</span>
                      {plan.id === 'pro' && <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>ج.م / {plan.period}</span>}
                      {plan.id === 'free' && <span style={{ fontSize: 14, color: '#8e91a0' }}>ج.م</span>}
                    </div>
                    <p style={{ fontSize: 13, color: isPro ? 'rgba(255,255,255,0.6)' : '#555a6a', marginBottom: 20, lineHeight: 1.5 }}>{plan.desc}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: isPro ? 'rgba(255,255,255,0.85)' : '#2c2c34' }}>
                          <TickCircle size={13} color={isPro ? '#4ade80' : '#00b473'} variant="Outline" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <button onClick={handleContinue} style={{
              width: '100%', padding: '14px', borderRadius: 9999, border: 'none',
              background: '#1c1c1e', color: '#fff', fontSize: 16, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {selectedPlan === 'free' ? 'ابدأ مجاناً' : 'التالي — إدخال بيانات الدفع'} <ArrowLeft2 size={16} variant="Outline" />
            </button>

            {selectedPlan === 'free' && (
              <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#8e91a0' }}>يمكنك الترقية لبرو في أي وقت من لوحة التحكم</p>
            )}
          </>
        )}

        {/* ── PAYMENT FORM ── */}
        {step === 'payment' && (
          <div style={{ maxWidth: 520, margin: '0 auto' }}>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.5px', margin: 0, color: '#1c1c1e' }}>بيانات الدفع</h2>
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
              <div style={{ borderTop: '1px solid #e0e2e8', marginTop: 14, paddingTop: 14 }}>
                <button onClick={() => setStep('plan')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '9px 16px', borderRadius: 10, background: '#f7f8fa', border: '1px solid #e0e2e8', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#1c1c1e', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#eef0f5' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f7f8fa' }}
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
                  padding: '10px 6px', borderRadius: 12, border: `2px solid ${payMethod === m.id ? '#1c1c1e' : '#e0e2e8'}`,
                  background: payMethod === m.id ? '#1c1c1e' : '#fff',
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  transition: 'border-color 0.15s, background 0.15s',
                }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: payMethod === m.id ? '#fff' : '#555a6a', whiteSpace: 'nowrap' }}>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Card form */}
            {payMethod === 'card' && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e0e2e8', padding: '24px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <Card size={16} color="#555a6a" variant="Outline" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1e' }}>بطاقة الدفع</span>
                  <div style={{ marginRight: 'auto', display: 'flex', gap: 6 }}>
                    {['Visa', 'MC', 'Amex'].map(b => (
                      <div key={b} style={{ background: '#f7f8fa', border: '1px solid #e0e2e8', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700, color: '#555a6a' }}>{b}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#555a6a', display: 'block', marginBottom: 6 }}>رقم البطاقة</label>
                    <input value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} placeholder="0000 0000 0000 0000" inputMode="numeric"
                      style={{ ...inputStyle(!!errors.cardNumber), direction: 'ltr', letterSpacing: '0.08em' }}
                      onFocus={e => { e.target.style.borderColor = '#1c1c1e' }}
                      onBlur={e => { e.target.style.borderColor = errors.cardNumber ? '#e3505a' : '#c7cad5' }} />
                    {errors.cardNumber && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.cardNumber}</p>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: '#555a6a', display: 'block', marginBottom: 6 }}>تاريخ الانتهاء</label>
                      <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM / YY" inputMode="numeric"
                        style={{ ...inputStyle(!!errors.expiry), direction: 'ltr' }}
                        onFocus={e => { e.target.style.borderColor = '#1c1c1e' }}
                        onBlur={e => { e.target.style.borderColor = errors.expiry ? '#e3505a' : '#c7cad5' }} />
                      {errors.expiry && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.expiry}</p>}
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: '#555a6a', display: 'block', marginBottom: 6 }}>CVV</label>
                      <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" inputMode="numeric" type="password"
                        style={{ ...inputStyle(!!errors.cvv), direction: 'ltr' }}
                        onFocus={e => { e.target.style.borderColor = '#1c1c1e' }}
                        onBlur={e => { e.target.style.borderColor = errors.cvv ? '#e3505a' : '#c7cad5' }} />
                      {errors.cvv && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.cvv}</p>}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#555a6a', display: 'block', marginBottom: 6 }}>الاسم على البطاقة</label>
                    <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="AHMED ALI"
                      style={{ ...inputStyle(!!errors.cardName), direction: 'ltr', textTransform: 'uppercase' }}
                      onFocus={e => { e.target.style.borderColor = '#1c1c1e' }}
                      onBlur={e => { e.target.style.borderColor = errors.cardName ? '#e3505a' : '#c7cad5' }} />
                    {errors.cardName && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.cardName}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Fawry / Vodafone / InstaPay — phone input */}
            {(payMethod === 'fawry' || payMethod === 'vodafone' || payMethod === 'instapay') && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e0e2e8', padding: '24px 20px', marginBottom: 20 }}>
                <div style={{ marginBottom: 16, fontSize: 13, color: '#555a6a', lineHeight: 1.6 }}>
                  {payMethod === 'fawry' && 'أدخل رقم هاتفك المسجّل في فوري. ستصلك رسالة برمز الدفع على أقرب فرع أو من تطبيق فوري.'}
                  {payMethod === 'vodafone' && 'أدخل رقم محفظة فودافون كاش. ستصلك رسالة لإتمام الدفع من التطبيق.'}
                  {payMethod === 'instapay' && 'أدخل رقم الهاتف المرتبط بحساب إنستا باي. ستصلك إشعار للموافقة على الدفع.'}
                </div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#555a6a', display: 'block', marginBottom: 6 }}>رقم الهاتف</label>
                <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="01XXXXXXXXX" inputMode="numeric"
                  style={{ ...inputStyle(!!errors.phone), direction: 'ltr', letterSpacing: '0.05em' }}
                  onFocus={e => { e.target.style.borderColor = '#1c1c1e' }}
                  onBlur={e => { e.target.style.borderColor = errors.phone ? '#e3505a' : '#c7cad5' }} />
                {errors.phone && <p style={{ fontSize: 12, color: '#e3505a', marginTop: 4 }}>{errors.phone}</p>}
              </div>
            )}

            <button onClick={handlePay} disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 9999, border: 'none',
              background: loading ? '#c7cad5' : '#1c1c1e', color: '#fff',
              fontSize: 16, fontWeight: 600, fontFamily: 'inherit',
              cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 0.15s',
            }}>
              {loading
                ? <><Refresh2 size={18} variant="Outline" style={{ animation: 'spin 1s linear infinite' }} /> جارٍ المعالجة...</>
                : <><Lock size={15} variant="Outline" /> ادفع ٤٩.٥ ج.م الآن</>
              }
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              <Lock size={12} color="#c7cad5" variant="Outline" />
              <span style={{ fontSize: 12, color: '#c7cad5' }}>مشفرة بـ SSL 256-bit</span>
            </div>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#00b473', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(0,180,115,0.25)' }}>
              <TickCircle size={34} color="#fff" variant="Bold" />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.5px', margin: '0 0 10px', color: '#1c1c1e' }}>تم الاشتراك بنجاح! 🎉</h2>
            <p style={{ fontSize: 16, color: '#555a6a', marginBottom: 8 }}>مرحباً بك في خطة برو</p>
            <p style={{ fontSize: 14, color: '#8e91a0' }}>جارٍ الانتقال للوحة التحكم...</p>
            <div style={{ marginTop: 24 }}>
              <Refresh2 size={20} color="#8e91a0" variant="Outline" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
