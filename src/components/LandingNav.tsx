import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'المميزات', to: '/features' },
  { label: 'الأسعار', to: '/pricing' },
  { label: 'المنصات', to: '/platforms' },
  { label: 'المدونة', to: '/blog' },
]

export default function LandingNav() {
  const isAuthed = !!localStorage.getItem('deema_token')
  const ctaTo = isAuthed ? '/dashboard' : '/signup'
  const loginTo = isAuthed ? '/dashboard' : '/login'

  return (
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
          background: isAuthed ? 'linear-gradient(135deg,#6a4cf5,#d44df0)' : '#fff',
          color: isAuthed ? '#fff' : '#0e0e12', fontSize: 14, fontWeight: 500,
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
        }}>{isAuthed ? 'الذهاب للمساعد' : 'ابدأ مجاناً'}</Link>
      </div>
    </nav>
  )
}
