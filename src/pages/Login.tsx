import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeSlash, ArrowLeft2 } from 'iconsax-react'
import { auth as authApi, storesApi, setToken } from '../lib/api'

type Mode = 'login' | 'signup' | 'reset'

const INPUT: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 8,
  border: '1px solid #c7cad5', background: '#ffffff',
  color: '#1c1c1e', fontSize: 14, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  height: 44,
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<Mode>(location.pathname === '/signup' ? 'signup' : 'login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'reset') {
      setLoading(true)
      setTimeout(() => { setLoading(false); setResetSent(true) }, 1400)
      return
    }

    if (!email || !password) { setError('يرجى إدخال البريد الإلكتروني وكلمة المرور'); return }
    if (mode === 'signup' && !name) { setError('يرجى إدخال اسمك'); return }

    setLoading(true)
    try {
      const res = mode === 'login'
        ? await authApi.login(email, password)
        : await authApi.signup(name, email, password, '')
      setToken(res.token)
      localStorage.setItem('deema_user', JSON.stringify(res.user))
      localStorage.setItem('deema_org', JSON.stringify(res.org))

      if (mode === 'signup') {
        navigate('/onboarding')
      } else {
        try {
          const { stores } = await storesApi.list()
          navigate(stores.length > 0 ? '/dashboard' : '/onboarding')
        } catch {
          navigate('/onboarding')
        }
      }
    } catch (err) {
      const msg = (err as Error).message || ''
      if (msg.includes('502') || msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
        setError('تعذّر الاتصال بالخادم — تأكد من تشغيل السيرفر ثم أعد المحاولة')
      } else {
        setError(msg || 'حدث خطأ، يرجى المحاولة مجدداً')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#f7f8fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Zain', 'Inter', sans-serif" }}>

      {/* back */}
      <Link to="/" style={{ position: 'absolute', top: 24, right: 32, display: 'flex', alignItems: 'center', gap: 6, color: '#555a6a', fontSize: 13, textDecoration: 'none' }}>
        <ArrowLeft2 size={14} variant="Outline" style={{ transform: 'rotate(180deg)' }} /> الرئيسية
      </Link>

      {/* logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#ffd02f', fontWeight: 700, fontSize: 16 }}>D</span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 600, color: '#1c1c1e', letterSpacing: '-0.5px' }}>Deema</span>
      </div>

      <div style={{ width: '100%', maxWidth: 420, background: '#ffffff', borderRadius: 20, border: '1px solid #e0e2e8', padding: '32px 28px', boxShadow: '0 4px 12px rgba(5,0,56,0.06)' }}>

        {/* tabs */}
        {mode !== 'reset' && (
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: '#f7f8fa', borderRadius: 9999, padding: 4 }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '9px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                background: mode === m ? '#1c1c1e' : 'transparent',
                color: mode === m ? '#fff' : '#555a6a',
                transition: 'all 0.15s',
              }}>
                {m === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </button>
            ))}
          </div>
        )}

        {mode === 'reset' && (
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => { setMode('login'); setResetSent(false) }} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555a6a', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0, marginBottom: 20 }}>
              <ArrowLeft2 size={13} variant="Outline" /> رجوع
            </button>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1c1c1e', marginBottom: 6 }}>استعادة كلمة المرور</div>
            <div style={{ fontSize: 14, color: '#555a6a' }}>سنرسل لك رابط إعادة التعيين على بريدك الإلكتروني</div>
          </div>
        )}

        {resetSent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>📬</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1c1c1e', marginBottom: 8 }}>تم الإرسال!</div>
            <div style={{ fontSize: 14, color: '#555a6a', marginBottom: 24, lineHeight: 1.6 }}>تفقد بريدك الإلكتروني وافتح الرابط لإعادة تعيين كلمة المرور</div>
            <button onClick={() => { setMode('login'); setResetSent(false) }} style={{ fontSize: 14, color: '#4262ff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && (
              <>
                <div>
                  <label style={{ fontSize: 13, color: '#555a6a', marginBottom: 6, display: 'block', fontWeight: 500 }}>الاسم الكامل</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="محمد العمري" style={INPUT} />
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: 13, color: '#555a6a', marginBottom: 6, display: 'block', fontWeight: 500 }}>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@store.com" style={{ ...INPUT, direction: 'ltr', textAlign: 'right' }} />
            </div>

            {mode !== 'reset' && (
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: 13, color: '#555a6a', marginBottom: 6, display: 'block', fontWeight: 500 }}>كلمة المرور</label>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...INPUT, paddingRight: 42, direction: 'ltr', textAlign: 'right' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, bottom: 11, background: 'none', border: 'none', cursor: 'pointer', color: '#8e91a0', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showPass ? <EyeSlash size={16} variant="Outline" /> : <Eye size={16} variant="Outline" />}
                </button>
              </div>
            )}

            {mode === 'login' && (
              <button type="button" onClick={() => { setMode('reset'); setError('') }} style={{ fontSize: 13, color: '#4262ff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', padding: 0, marginTop: -8 }}>
                نسيت كلمة المرور؟
              </button>
            )}

            {error && (
              <div style={{ fontSize: 13, color: '#600000', background: '#ffc6c6', borderRadius: 8, padding: '10px 14px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 9999, border: 'none',
              cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit',
              fontSize: 15, fontWeight: 600, background: '#1c1c1e', color: '#fff',
              marginTop: 4, opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s',
            }}>
              {loading ? '...' : mode === 'login' ? 'تسجيل الدخول' : mode === 'signup' ? 'إنشاء الحساب' : 'إرسال الرابط'}
            </button>

            {mode !== 'reset' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#e0e2e8' }} />
                  <span style={{ fontSize: 12, color: '#8e91a0' }}>أو</span>
                  <div style={{ flex: 1, height: 1, background: '#e0e2e8' }} />
                </div>
                <button type="button" style={{
                  width: '100%', padding: '12px', borderRadius: 9999,
                  border: '1px solid #c7cad5', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 14, fontWeight: 500, background: '#fff', color: '#1c1c1e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                  </svg>
                  {mode === 'login' ? 'تسجيل الدخول بـ Google' : 'إنشاء حساب بـ Google'}
                </button>
              </>
            )}
          </form>
        )}
      </div>

      <div style={{ marginTop: 20, fontSize: 13, color: '#8e91a0', textAlign: 'center' }}>
        بالمتابعة أنت توافق على{' '}
        <Link to="/terms" style={{ color: '#4262ff', textDecoration: 'none' }}>شروط الاستخدام</Link>
        {' '}و{' '}
        <Link to="/privacy" style={{ color: '#4262ff', textDecoration: 'none' }}>سياسة الخصوصية</Link>
      </div>
    </div>
  )
}
