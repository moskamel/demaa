import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--canvas)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'Noto Serif Arabic, serif',
        fontSize: 96,
        fontWeight: 400,
        color: 'var(--primary)',
        lineHeight: 1,
        marginBottom: 8,
        letterSpacing: '-0.05em',
      }}>
        404
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 10px', color: 'var(--ink)' }}>
        الصفحة دي مش موجودة
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 32 }}>
        ربما تم نقل الصفحة أو حذفها
      </p>
      <Link to="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--primary)',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: 8,
        padding: '12px 24px',
        fontSize: 14,
        fontWeight: 600,
      }}>
        <ArrowRight size={15} />
        ارجع للرئيسية
      </Link>
    </div>
  )
}
