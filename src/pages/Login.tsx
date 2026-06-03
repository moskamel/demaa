import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, Zap } from 'lucide-react'
import { auth as authApi, storesApi, setToken } from '../lib/api'

type Mode = 'login' | 'signup' | 'reset'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<Mode>(location.pathname === '/signup' ? 'signup' : 'login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [storeName, setStoreName] = useState('')
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
    if (mode === 'signup' && !storeName) { setError('يرجى إدخال اسم متجرك'); return }

    setLoading(true)
    try {
      const res = mode === 'login'
        ? await authApi.login(email, password)
        : await authApi.signup(name, email, password, storeName)
      setToken(res.token)
      localStorage.setItem('deema_user', JSON.stringify(res.user))
      localStorage.setItem('deema_org', JSON.stringify(res.org))

      if (mode === 'signup') {
        navigate('/onboarding')
      } else {
        // Check if user already has connected stores
        try {
          const { stores } = await storesApi.list()
          navigate(stores.length > 0 ? '/dashboard' : '/onboarding')
        } catch {
          navigate('/onboarding')
        }
      }
    } catch (err) {
      setError((err as Error).message || 'حدث خطأ، يرجى المحاولة مجدداً')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid var(--hairline)',
    background: 'var(--canvas-soft)', color: 'var(--ink)', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>

      {/* back to landing */}
      <Link to="/" style={{ position: 'absolute', top: 20, right: 24, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', fontSize: 13, textDecoration: 'none' }}>
        <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} /> الرئيسية
      </Link>

      {/* logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #007cf0 0%, #00dfd8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={18} color="#fff" />
        </div>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px' }}>ديما</span>
      </div>

      <div style={{ width: '100%', maxWidth: 400, background: 'var(--canvas-soft)', borderRadius: 20, border: '1px solid var(--hairline)', padding: '32px 28px' }}>

        {/* tabs */}
        {mode !== 'reset' && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--canvas)', borderRadius: 10, padding: 3 }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, background: mode === m ? 'var(--canvas-soft-2)' : 'transparent', color: mode === m ? 'var(--ink)' : 'var(--ink-muted)', transition: 'all 0.15s' }}>
                {m === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </button>
            ))}
          </div>
        )}

        {mode === 'reset' && (
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => { setMode('login'); setResetSent(false) }} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0, marginBottom: 16 }}>
              <ArrowLeft size={13} /> رجوع
            </button>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>استعادة كلمة المرور</div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>سنرسل لك رابط إعادة التعيين على بريدك الإلكتروني</div>
          </div>
        )}

        {resetSent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>تم الإرسال!</div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20 }}>تفقد بريدك الإلكتروني وافتح الرابط لإعادة تعيين كلمة المرور</div>
            <button onClick={() => { setMode('login'); setResetSent(false) }} style={{ fontSize: 13, color: '#6a4cf5', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>الاسم الكامل</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="محمد العمري" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>اسم المتجر</label>
                  <input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="متجر النور" style={inputStyle} />
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@store.com" style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} />
            </div>

            {mode !== 'reset' && (
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>كلمة المرور</label>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingLeft: 40, direction: 'ltr', textAlign: 'right' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', left: 12, bottom: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: 0 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            )}

            {mode === 'login' && (
              <button type="button" onClick={() => { setMode('reset'); setError('') }} style={{ fontSize: 12, color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', padding: 0, marginTop: -6 }}>
                نسيت كلمة المرور؟
              </button>
            )}

            {error && (
              <div style={{ fontSize: 12, color: '#ff5577', background: 'rgba(255,85,119,0.08)', borderRadius: 8, padding: '8px 12px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg, #007cf0 0%, #00dfd8 100%)', color: '#fff', marginTop: 4, opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s' }}>
              {loading ? '...' : mode === 'login' ? 'تسجيل الدخول' : mode === 'signup' ? 'إنشاء الحساب' : 'إرسال الرابط'}
            </button>

            {mode !== 'reset' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
                  <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>أو</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
                </div>
                <button type="button" style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid var(--hairline)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, background: '#fff', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
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

      <div style={{ marginTop: 20, fontSize: 12, color: 'var(--ink-muted)', textAlign: 'center' }}>
        بالمتابعة أنت توافق على <span style={{ color: '#6a4cf5', cursor: 'pointer' }}>شروط الاستخدام</span> و<span style={{ color: '#6a4cf5', cursor: 'pointer' }}>سياسة الخصوصية</span>
      </div>
    </div>
  )
}
