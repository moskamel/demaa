import { useState } from 'react'
import PageLayout from '../components/PageLayout'

type Badge = 'NEW' | 'FIX' | 'IMPROVE'

const badgeStyles: Record<Badge, { bg: string; color: string; label: string }> = {
  NEW: { bg: '#22c55e22', color: '#22c55e', label: 'جديد' },
  FIX: { bg: '#f59e0b22', color: '#f59e0b', label: 'إصلاح' },
  IMPROVE: { bg: '#6a4cf522', color: '#6a4cf5', label: 'تحسين' },
}

const releases: {
  version: string
  date: string
  dotColor: string
  title: string
  changes: { badge: Badge; text: string }[]
}[] = [
  {
    version: 'v1.4',
    date: '١ يونيو ٢٠٢٥',
    dotColor: '#22c55e',
    title: 'ربط TikTok Shop + تقارير متقدمة',
    changes: [
      { badge: 'NEW', text: 'إضافة دعم TikTok Shop — إدارة الطلبات والشحن من Deema مباشرة' },
      { badge: 'NEW', text: 'لوحة تقارير متقدمة بمخططات بيانية تفاعلية' },
      { badge: 'NEW', text: 'تصدير التقارير بصيغة Excel وPDF' },
      { badge: 'IMPROVE', text: 'تحسين أداء الاستعلامات الكبيرة بنسبة ٦٠٪' },
      { badge: 'FIX', text: 'إصلاح مشكلة تزامن الطلبات في ساعات الذروة' },
    ],
  },
  {
    version: 'v1.3',
    date: '١٥ أبريل ٢٠٢٥',
    dotColor: '#6a4cf5',
    title: 'شحن مع J&T + كوبونات',
    changes: [
      { badge: 'NEW', text: 'ربط شركة الشحن J&T Express — إنشاء بوالص تلقائي' },
      { badge: 'NEW', text: 'نظام كوبونات كامل — إنشاء وتتبع وتقييم الأداء' },
      { badge: 'NEW', text: 'إشعارات واتساب للطلبات الجديدة والمشاكل' },
      { badge: 'IMPROVE', text: 'تسريع وقت استجابة المحادثة بمعدل ٤٠٪' },
      { badge: 'FIX', text: 'إصلاح خطأ في حساب الكوبونات المتعددة' },
    ],
  },
  {
    version: 'v1.2',
    date: '٢ مارس ٢٠٢٥',
    dotColor: '#d44df0',
    title: 'لوحة الفريق + إدارة الصلاحيات',
    changes: [
      { badge: 'NEW', text: 'نظام صلاحيات كامل — مدير، محرر، قارئ' },
      { badge: 'NEW', text: 'دعوة أعضاء الفريق عبر البريد الإلكتروني' },
      { badge: 'NEW', text: 'سجل نشاط لكل عضو في الفريق' },
      { badge: 'IMPROVE', text: 'تحسين واجهة الدردشة على الجوال' },
      { badge: 'FIX', text: 'إصلاح مشكلة عرض الأرقام العربية في التقارير' },
    ],
  },
  {
    version: 'v1.1',
    date: '١ فبراير ٢٠٢٥',
    dotColor: '#ff7a3d',
    title: 'إطلاق دعم سلة + زد',
    changes: [
      { badge: 'NEW', text: 'دعم منصة سلة — أكبر منصة تجارة سعودية' },
      { badge: 'NEW', text: 'دعم منصة زد — ربط وإدارة كاملة' },
      { badge: 'NEW', text: 'دعم اللهجة السعودية بشكل كامل' },
      { badge: 'IMPROVE', text: 'تحسين دقة فهم الأوامر بالعربية بنسبة ٣٥٪' },
      { badge: 'FIX', text: 'إصلاح مشكلة الاتصال مع Shopify في بعض الحسابات' },
    ],
  },
]

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: 16,
}

export default function Changelog() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <PageLayout>
      <main style={{ padding: '64px 200px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{
            ...eyebrow,
            display: 'inline-block',
            background: 'linear-gradient(135deg, #6a4cf5, #d44df0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            التحديثات
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 20, lineHeight: 1.15 }}>
            آخر تحديثات Deema
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            نُطلق تحديثات مستمرة بناءً على ملاحظات تجارنا. شفافية كاملة — كل تغيير موثّق هنا.
          </p>
        </div>

        {/* Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 80 }}>
          {releases.map((r, idx) => (
            <div key={r.version} style={{ display: 'flex', gap: 24 }}>
              {/* Timeline spine */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: r.dotColor, flexShrink: 0, marginTop: 8, boxShadow: `0 0 0 4px ${r.dotColor}22` }} />
                {idx < releases.length - 1 && (
                  <div style={{ width: 2, flex: 1, background: 'var(--hairline)', marginTop: 8, minHeight: 40 }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingBottom: 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'monospace', background: 'var(--canvas-soft)', border: '1px solid var(--hairline)', borderRadius: 6, padding: '2px 10px' }}>{r.version}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{r.date}</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 20 }}>{r.title}</h2>
                <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {r.changes.map((c, i) => {
                    const bs = badgeStyles[c.badge]
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ background: bs.bg, color: bs.color, borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{bs.label}</span>
                        <span style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{c.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subscribe to updates */}
        <div style={{ background: 'var(--canvas-soft)', borderRadius: 20, padding: '56px 40px', border: '1px solid var(--hairline)', textAlign: 'center' }}>
          <div style={{ ...eyebrow, color: 'var(--ink-muted)' }}>ابق على اطلاع</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 12 }}>اشترك في تحديثات Deema</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', maxWidth: 440, margin: '0 auto 32px' }}>
            نُرسل إشعاراً فوراً عند كل إصدار جديد — ميزات، إصلاحات، وتحسينات مباشرة في بريدك.
          </p>
          {subscribed ? (
            <div style={{ fontSize: 16, color: '#22c55e', fontWeight: 600 }}>✅ تم الاشتراك! ستصلك التحديثات مباشرة.</div>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'stretch' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                style={{
                  background: 'var(--canvas)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 9999,
                  padding: '0 20px',
                  fontSize: 14,
                  color: 'var(--ink)',
                  minWidth: 280,
                  outline: 'none',
                  height: 'auto',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={() => email && setSubscribed(true)}
                style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', borderRadius: 9999, padding: '13px 28px', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
              >
                اشترك ←
              </button>
            </div>
          )}
        </div>

      </main>
    </PageLayout>
  )
}
