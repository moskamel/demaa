import { Link } from 'react-router-dom'

interface Props {
  children: React.ReactNode
}

const NAV_LINKS = [
  { label: 'المميزات', to: '/features' },
  { label: 'الأسعار', to: '/pricing' },
  { label: 'المنصات', to: '/platforms' },
  { label: 'المدونة', to: '/blog' },
]

const FOOTER_COLS = [
  { title: 'المنتج', links: [{ label: 'المميزات', to: '/features' }, { label: 'الأسعار', to: '/pricing' }, { label: 'المنصات', to: '/platforms' }, { label: 'التحديثات', to: '/changelog' }] },
  { title: 'الشركة', links: [{ label: 'من نحن', to: '/about' }, { label: 'تواصل معنا', to: '/contact' }, { label: 'المدونة', to: '/blog' }, { label: 'الوظائف', to: '/careers' }] },
  { title: 'القانوني', links: [{ label: 'الخصوصية', to: '/privacy' }, { label: 'الشروط', to: '/terms' }, { label: 'الأمان', to: '/security' }, { label: 'الكوكيز', to: '/cookies' }] },
]

export default function PageLayout({ children }: Props) {
  const isAuthed = !!localStorage.getItem('deema_token')
  const ctaTo = isAuthed ? '/dashboard' : '/signup'
  const loginTo = isAuthed ? '/dashboard' : '/login'

  return (
    <div dir="rtl" style={{ background: '#0e0e12', color: '#f0f0f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Zain', 'Inter', sans-serif" }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(14,14,18,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        height: 64,
        display: 'flex', alignItems: 'center',
        padding: '0 200px', gap: 24,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>D</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.4px', color: '#f0f0f5' }}>Deema</span>
        </Link>

        <div style={{ display: 'flex', gap: 32, flex: 1, justifyContent: 'center' }}>
          {NAV_LINKS.map(l => (
            <Link key={l.label} to={l.to}
              style={{ color: '#9090a2', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f5')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9090a2')}
            >{l.label}</Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <Link to={loginTo} style={{
            padding: '9px 20px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.18)',
            background: 'transparent', color: '#f0f0f5', fontSize: 14, fontWeight: 500,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
          }}>{isAuthed ? 'لوحة التحكم' : 'دخول'}</Link>
          <Link to={ctaTo} style={{
            padding: '9px 20px', borderRadius: 9999, border: 'none',
            background: '#fff', color: '#0e0e12', fontSize: 14, fontWeight: 500,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
          }}>{isAuthed ? 'الذهاب للمساعد' : 'ابدأ مجاناً'}</Link>
        </div>
      </nav>

      {/* CONTENT */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* FOOTER */}
      <footer style={{ background: '#1c1c1e', color: '#fff', padding: '64px 200px 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>
            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ffd02f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#1c1c1e', fontWeight: 700, fontSize: 13 }}>D</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.4px' }}>Deema</span>
              </div>
              <p style={{ fontSize: 14, color: '#a5a8b5', lineHeight: 1.7, maxWidth: 240, marginBottom: 20 }}>
                مساعد ذكاء اصطناعي متخصص في التجارة الإلكترونية العربية.
              </p>
              <div style={{ fontSize: 12, color: '#6b6f7e' }}>مصر · السعودية · الإمارات · الكويت</div>
            </div>

            {/* Link columns */}
            {FOOTER_COLS.map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 16, letterSpacing: '0.3px' }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l.label} style={{ marginBottom: 10 }}>
                    <Link to={l.to}
                      style={{ fontSize: 14, color: '#a5a8b5', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#a5a8b5')}
                    >{l.label}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #2c2c34', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#6b6f7e' }}>© ٢٠٢٥ Deema. جميع الحقوق محفوظة.</span>
            <div style={{ display: 'flex', gap: 20 }}>
              {['تويتر', 'لينكدإن', 'إنستغرام'].map(s => (
                <a key={s} href="#"
                  style={{ fontSize: 13, color: '#6b6f7e', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b6f7e')}
                >{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
