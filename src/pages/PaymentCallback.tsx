import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TickCircle, CloseCircle, Refresh2 } from 'iconsax-react'

export default function PaymentCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')

  useEffect(() => {
    const success = params.get('success')
    const isPending = params.get('is_voided') === 'false' && params.get('is_refunded') === 'false'

    if (success === 'true' && isPending) {
      setStatus('success')
      setTimeout(() => navigate('/dashboard'), 2500)
    } else if (success === 'false' || success === null) {
      setStatus('failed')
    } else {
      setStatus('success')
      setTimeout(() => navigate('/dashboard'), 2500)
    }
  }, [params, navigate])

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--canvas)', fontFamily: "'Zain','Inter',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 400 }}>
        {status === 'loading' && (
          <>
            <Refresh2 size={48} color="var(--ink-muted)" variant="Outline" style={{ animation: 'spin 1s linear infinite', marginBottom: 20 }} />
            <p style={{ color: 'var(--ink-muted)', fontSize: 15 }}>جارٍ التحقق من الدفع...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px rgba(34,197,94,0.25)' }}>
              <TickCircle size={34} color="#fff" variant="Bold" />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', margin: '0 0 10px', letterSpacing: '-0.5px' }}>تم الاشتراك بنجاح! 🎉</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-muted)', marginBottom: 6 }}>مرحباً بك في خطة برو</p>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>جارٍ الانتقال للوحة التحكم...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CloseCircle size={34} color="#f87171" variant="Bold" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', margin: '0 0 10px', letterSpacing: '-0.5px' }}>فشل الدفع</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 24 }}>لم تتم عملية الدفع. يمكنك المحاولة مجدداً أو التواصل مع الدعم.</p>
            <button
              onClick={() => navigate('/subscribe')}
              style={{ padding: '12px 28px', borderRadius: 9999, border: 'none', background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              حاول مجدداً
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
