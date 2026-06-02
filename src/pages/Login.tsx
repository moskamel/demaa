import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, Zap } from 'lucide-react'
import { auth as authApi, setToken } from '../lib/api'

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
        : await authApi.signup(name, email, password, name)
      setToken(res.token)
      localStorage.setItem('deema_user', JSON.stringify(res.user))
      localStorage.setItem('deema_org', JSON.stringify(res.org))
      navigate(mode === 'signup' ? '/onboarding' : '/dashboard')
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
              <div>
                <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>الاسم الكامل</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="محمد العمري" style={inputStyle} />
              </div>
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

            {mode === 'login' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
                  <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>أو</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
                </div>
                <button type="button" onClick={async () => { setLoading(true); try { const r = await authApi.demo(); setToken(r.token); localStorage.setItem('deema_user', JSON.stringify(r.user)); localStorage.setItem('deema_org', JSON.stringify(r.org)); navigate('/dashboard') } catch { navigate('/dashboard') } finally { setLoading(false) } }} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid var(--hairline)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, background: 'var(--canvas-soft-2)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🚀</span> دخول تجريبي (Demo)
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
