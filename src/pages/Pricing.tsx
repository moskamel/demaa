import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { TickCircle } from 'iconsax-react'

const allFeatures = [
  'متاجر غير محدودة',
  'طلبات غير محدودة',
  'محادثة ذكية بالعربي',
  'إدارة الطلبات الكاملة',
  'الشحن مع أرامكس وSMSA وJ&T',
  'تقارير وتحليلات متقدمة',
  'إدارة الفريق والصلاحيات',
  'الكوبونات والعروض',
  'ربط Shopify وWuilt وShantaweb',
  'إشعارات فورية',
  'فواتير وإيصالات تلقائية',
  'دعم أولوية على مدار الساعة',
  'إعدادات مخصصة لمتجرك',
  'تصدير التقارير PDF وExcel',
]

export default function Pricing() {
  return (
    <PageLayout>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '64px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--canvas-soft)', borderRadius: 100, padding: '6px 16px', marginBottom: 24, border: '1px solid var(--hairline)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>مجاني بالكامل خلال مرحلة البيتا</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 16 }}>الأسعار</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>خطة واحدة، كل المميزات، بدون تعقيد</p>
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{
            background: 'var(--canvas-soft)',
            borderRadius: 24,
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: 'rgba(255,255,255,0.06) 0 0.5px 0 inset',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pro</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-3px' }}>٠</span>
              <span style={{ fontSize: 16, color: 'var(--ink-muted)' }}>ر.س / شهر</span>
            </div>
            <div style={{ fontSize: 14, color: '#22c55e', fontWeight: 500, marginBottom: 32 }}>مجاناً خلال فترة البيتا</div>

            <Link to="/onboarding" className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '14px', fontSize: 16, marginBottom: 32, textDecoration: 'none', borderRadius: 12 }}>
              ابدأ مجاناً الآن
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'right' }}>
              {allFeatures.map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <TickCircle size={16} color="#22c55e" variant="Outline" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-muted)', marginTop: 24 }}>
            لا يحتاج بطاقة ائتمان · ابدأ في دقيقتين · ألغِ في أي وقت
          </p>
        </div>
      </main>

    </PageLayout>
  )
}
