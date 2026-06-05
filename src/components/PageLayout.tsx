import React from 'react'
import { Link } from 'react-router-dom'
import LandingNav from './LandingNav'

interface Props {
  children: React.ReactNode
}

const T = {
  canvas: '#0e0e12',
  well: '#080810',
  hairline: 'rgba(255,255,255,0.08)',
  muted: '#5e5e72',
  slate: '#9090a2',
  purple: '#6a4cf5',
}

const FOOTER_COLS = [
  { title: 'المنتج', links: [{ label: 'المميزات', to: '/features' }, { label: 'الأسعار', to: '/pricing' }, { label: 'المنصات', to: '/platforms' }, { label: 'التحديثات', to: '/changelog' }] },
  { title: 'الشركة', links: [{ label: 'من نحن', to: '/about' }, { label: 'تواصل معنا', to: '/contact' }, { label: 'المدونة', to: '/blog' }, { label: 'الوظائف', to: '/careers' }] },
  { title: 'القانوني', links: [{ label: 'الخصوصية', to: '/privacy' }, { label: 'الشروط', to: '/terms' }, { label: 'الأمان', to: '/security' }, { label: 'الكوكيز', to: '/cookies' }] },
]

export default function PageLayout({ children }: Props) {
  return (
    <div dir="rtl" style={{ background: T.canvas, color: '#f0f0f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Zain', 'Inter', sans-serif" }}>

      <LandingNav />

      {/* CONTENT — paddingTop matches fixed nav height */}
      <div style={{ flex: 1, paddingTop: 64 }}>
        {children}
      </div>

      {/* FOOTER */}
      <footer style={{ background: T.well, padding: '64px 200px 40px', borderTop: `1px solid ${T.hairline}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(106,76,245,0.4)' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>D</span>
              </div>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Deema</span>
            </div>
            <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.75, maxWidth: 220, marginBottom: 20 }}>
              مساعد ذكاء اصطناعي متخصص في التجارة الإلكترونية العربية. يفهم لهجتك، يتصرف بسرعة.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['🇪🇬 مصر', '🇸🇦 السعودية', '🇦🇪 الإمارات', '🇰🇼 الكويت'].map(f => (
                <span key={f} style={{ fontSize: 11, color: T.muted, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.hairline}`, borderRadius: 6, padding: '3px 8px' }}>{f}</span>
              ))}
            </div>
          </div>

          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l.label} style={{ marginBottom: 10 }}>
                  <Link to={l.to}
                    style={{ fontSize: 13, color: T.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
                  >{l.label}</Link>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: T.muted }}>© ٢٠٢٦ Deema. جميع الحقوق محفوظة.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {['تويتر', 'لينكدإن', 'إنستغرام'].map(s => (
              <a key={s} href="#"
                style={{ fontSize: 12, color: T.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
              >{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
