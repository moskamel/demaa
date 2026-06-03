import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { TickCircle, CloseCircle } from 'iconsax-react'

const freeFeatures = [
  { label: 'متجر واحد', ok: true },
  { label: '٥٠ طلب / شهر', ok: true },
  { label: 'محادثة ذكية بالعربي', ok: true },
  { label: 'منصة واحدة (Shopify أو Wuilt)', ok: true },
  { label: 'تقارير أساسية', ok: true },
  { label: 'متاجر غير محدودة', ok: false },
  { label: 'طلبات غير محدودة', ok: false },
  { label: 'شحن ذكي (أرامكس، SMSA، J&T)', ok: false },
  { label: 'إدارة الفريق', ok: false },
]

const proFeatures = [
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

      <main style={{ padding: '64px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--canvas-soft)', borderRadius: 9999, padding: '6px 16px', marginBottom: 24, border: '1px solid var(--hairline)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>مجاني بالكامل خلال مرحلة البيتا</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.05em', marginBottom: 16 }}>الأسعار</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>خطة واحدة، كل المميزات، بدون تعقيد</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'stretch' }}>

          {/* Free Plan */}
          <div style={{
            background: 'var(--canvas-soft)',
            borderRadius: 24,
            padding: '36px 32px',
            border: '1px solid var(--hairline)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Free</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-3px' }}>٠</span>
              <span style={{ fontSize: 16, color: 'var(--ink-muted)' }}>ج.م / شهر</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 28 }}>للبداية واستكشاف المنصة</div>

            <Link to="/onboarding" style={{
              display: 'block', textAlign: 'center', padding: '13px', fontSize: 15, fontWeight: 600,
              marginBottom: 28, textDecoration: 'none', borderRadius: 9999,
              border: '1px solid var(--hairline)', color: 'var(--ink)', background: 'transparent',
            }}>
              ابدأ مجاناً
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {freeFeatures.map(f => (
                <div key={f.label} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {f.ok
                    ? <TickCircle size={16} color="#22c55e" variant="Outline" style={{ flexShrink: 0 }} />
                    : <CloseCircle size={16} color="var(--ink-disabled)" variant="Outline" style={{ flexShrink: 0 }} />
                  }
                  <span style={{ fontSize: 14, color: f.ok ? 'var(--ink-muted)' : 'var(--ink-disabled)' }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan */}
          <div style={{
            background: 'var(--canvas-soft)',
            borderRadius: 24,
            padding: '36px 32px',
            border: '2px solid #6a4cf5',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, background: 'linear-gradient(90deg, #6a4cf5, #d44df0)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pro</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#d44df0', background: 'rgba(212,77,240,0.12)', borderRadius: 9999, padding: '3px 10px' }}>الأكثر شعبية</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-3px' }}>٠</span>
              <span style={{ fontSize: 16, color: 'var(--ink-muted)' }}>ج.م / شهر</span>
            </div>
            <div style={{ fontSize: 14, color: '#22c55e', fontWeight: 500, marginBottom: 28 }}>مجاناً خلال فترة البيتا</div>

            <Link to="/onboarding" style={{
              display: 'block', textAlign: 'center', padding: '13px', fontSize: 15, fontWeight: 600,
              marginBottom: 28, textDecoration: 'none', borderRadius: 9999, border: 'none',
              background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff',
            }}>
              ابدأ مجاناً الآن
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {proFeatures.map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <TickCircle size={16} color="#22c55e" variant="Outline" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-muted)', marginTop: 28 }}>
          لا يحتاج بطاقة ائتمان · ابدأ في دقيقتين · ألغِ في أي وقت
        </p>
      </main>

    </PageLayout>
  )
}
