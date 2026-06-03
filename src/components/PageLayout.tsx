import { Link } from 'react-router-dom'

interface Props {
  children: React.ReactNode
}

export default function PageLayout({ children }: Props) {
  return (
    <div dir="rtl" style={{ background: 'var(--canvas)', color: 'var(--ink)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Zain', 'Inter', sans-serif" }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--hairline)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 20 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>D</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--ink)' }}>Deema</span>
        </Link>
        <div style={{ display: 'flex', gap: 28, flex: 1, justifyContent: 'center' }}>
          {[
            { label: 'المميزات', to: '/features' },
            { label: 'الأسعار', to: '/pricing' },
            { label: 'المنصات', to: '/platforms' },
            { label: 'المدونة', to: '/blog' },
          ].map(l => (
            <Link key={l.label} to={l.to}
              style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500, letterSpacing: '-0.14px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
            >{l.label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/login" className="btn-secondary" style={{ fontSize: 13 }}>دخول</Link>
          <Link to="/signup" className="btn-primary" style={{ fontSize: 13 }}>ابدأ مجاناً ←</Link>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--hairline)', padding: '64px 32px 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>D</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Deema</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.7, maxWidth: 220, letterSpacing: '-0.13px', marginBottom: 20 }}>
                مساعد ذكاء اصطناعي متخصص في التجارة الإلكترونية العربية. يفهم لهجتك، يتصرف بسرعة.
              </p>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>مصر · السعودية · الإمارات · الكويت</div>
            </div>
            {[
              { title: 'المنتج', links: [{ label: 'المميزات', to: '/features' }, { label: 'الأسعار', to: '/pricing' }, { label: 'المنصات', to: '/platforms' }, { label: 'التحديثات', to: '/changelog' }] },
              { title: 'الشركة', links: [{ label: 'من نحن', to: '/about' }, { label: 'تواصل معنا', to: '/contact' }, { label: 'المدونة', to: '/blog' }, { label: 'الوظائف', to: '/careers' }] },
              { title: 'القانوني', links: [{ label: 'الخصوصية', to: '/privacy' }, { label: 'الشروط', to: '/terms' }, { label: 'الأمان', to: '/security' }, { label: 'الكوكيز', to: '/cookies' }] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l.label} style={{ marginBottom: 10 }}>
                    <Link to={l.to}
                      style={{ fontSize: 13, color: 'var(--ink-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
                    >{l.label}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>© ٢٠٢٥ Deema. جميع الحقوق محفوظة.</span>
            <div style={{ display: 'flex', gap: 16 }}>
              {['تويتر', 'لينكدإن', 'إنستغرام'].map(s => (
                <a key={s} href="#"
                  style={{ fontSize: 12, color: 'var(--ink-muted)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
                >{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
