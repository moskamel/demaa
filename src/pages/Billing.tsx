import { Link } from 'react-router-dom'
import { ChevronLeft, Zap, Check, Infinity } from 'lucide-react'

const FREE_FEATURES = [
  'منصات غير محدودة',
  'طلبات غير محدودة',
  'تطبيقات وتكاملات غير محدودة',
  'فريق عمل غير محدود',
  'تقارير كاملة ومتقدمة',
  'ذكاء اصطناعي مدعوم بـ Claude AI',
  'إدارة المخزون التلقائية',
  'كوبونات وإشعارات واتساب',
  'API Access كامل',
  'أولوية الدعم الفني',
  'تحليلات متقدمة وبيانات حية',
  'تصدير التقارير PDF / Excel',
]

export default function Billing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', paddingBottom: 60 }}>
      {/* top bar */}
      <div style={{ borderBottom: '1px solid var(--hairline)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13 }}>
          <ChevronLeft size={14} /> الرئيسية
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>الاشتراك</span>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>

        {/* hero banner */}
        <div style={{ background: 'linear-gradient(135deg, #6a4cf5 0%, #d44df0 100%)', borderRadius: 20, padding: '32px 28px', marginBottom: 32, textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Zap size={24} color="#fff" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>
            الوصول الكامل — مجاناً
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 20 }}>
            جميع المميزات متاحة لك بدون قيود ولا رسوم
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 20px' }}>
            <Infinity size={18} color="#fff" />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>غير محدود · مجاناً دائماً</span>
          </div>
        </div>

        {/* plan card */}
        <div style={{ background: 'var(--surface-1)', borderRadius: 20, border: '2px solid #6a4cf5', padding: '28px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, background: 'linear-gradient(90deg, #6a4cf5, #d44df0)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>باقة Pro</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6a4cf5', background: 'rgba(106,76,245,0.12)', borderRadius: 6, padding: '3px 8px' }}>باقتك الحالية</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>جميع المميزات مفعّلة · بدون انتهاء</div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#22c55e', letterSpacing: '-1px', lineHeight: 1 }}>مجاناً</div>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>بدون رسوم</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {FREE_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Check size={10} color="#22c55e" />
                </div>
                <span style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.4 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* usage stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'الطلبات', value: 'غير محدود', icon: '📦' },
            { label: 'المنصات', value: 'غير محدود', icon: '🛍️' },
            { label: 'أعضاء الفريق', value: 'غير محدود', icon: '👥' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
