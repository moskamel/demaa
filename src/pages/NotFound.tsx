import { Link } from 'react-router-dom'
import { ArrowRight2 } from 'iconsax-react'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--canvas)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 24,
    }}>
      <div style={{
        fontSize: 'clamp(80px, 15vw, 140px)',
        fontWeight: 500,
        letterSpacing: '-0.07em',
        lineHeight: 0.85,
        color: 'var(--canvas-soft-2)',
        marginBottom: 32,
        userSelect: 'none',
      }}>
        404
      </div>

      <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 500, letterSpacing: '-0.04em', margin: '0 0 12px', color: 'var(--ink)' }}>
        الصفحة دي مش موجودة
      </h1>

      <p style={{ fontSize: 15, color: 'var(--ink-muted)', marginBottom: 36, letterSpacing: '-0.15px' }}>
        ربما تم نقل الصفحة أو حذفها
      </p>

      <Link to="/" className="btn-primary" style={{ padding: '12px 24px', fontSize: 15 }}>
        <ArrowRight2 size={15} variant="Outline" />
        ارجع للرئيسية
      </Link>
    </div>
  )
}
