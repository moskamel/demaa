import PageLayout from '../components/PageLayout'
import { ShieldTick, Lock, Eye, Data, Warning2, Refresh2 } from 'iconsax-react'

const practices = [
  {
    icon: Lock,
    title: 'تشفير البيانات',
    color: '#6a4cf5',
    items: [
      'تشفير كامل أثناء النقل باستخدام TLS 1.3',
      'تشفير البيانات المخزنة باستخدام AES-256',
      'مفاتيح تشفير مُدارة بأمان عبر HSM',
      'تشفير نسخ الاحتياطي',
    ],
  },
  {
    icon: Data,
    title: 'تخزين البيانات',
    color: '#d44df0',
    items: [
      'بيانات مخزنة في مراكز بيانات ISO 27001',
      'نسخ احتياطي يومي مشفر',
      'نسخ احتياطي جغرافي في موقعين مختلفين',
      'وقت استرداد البيانات أقل من ٤ ساعات',
    ],
  },
  {
    icon: Eye,
    title: 'التحكم في الوصول',
    color: '#ff7a3d',
    items: [
      'مبدأ الصلاحية الأدنى — كل عضو يرى فقط ما يحتاجه',
      'مصادقة ثنائية العامل (2FA) مطلوبة',
      'سجل نشاط كامل لكل إجراء',
      'جلسات تنتهي تلقائياً بعد فترة خمول',
    ],
  },
  {
    icon: ShieldTick,
    title: 'حماية التطبيق',
    color: '#22c55e',
    items: [
      'اختبارات اختراق ربع سنوية',
      'مراجعات أمنية منتظمة للكود',
      'حماية من هجمات OWASP Top 10',
      'Rate Limiting لمنع إساءة الاستخدام',
    ],
  },
  {
    icon: Warning2,
    title: 'الاستجابة للحوادث',
    color: '#f59e0b',
    items: [
      'فريق استجابة للطوارئ متاح ٢٤/٧',
      'إشعار المتأثرين خلال ٧٢ ساعة من اكتشاف الاختراق',
      'خطة استمرارية الأعمال موثقة ومختبرة',
      'تقارير ما بعد الحادث شفافة للمستخدمين',
    ],
  },
  {
    icon: Refresh2,
    title: 'الامتثال والمراجعات',
    color: '#06b6d4',
    items: [
      'مراجعة سنوية من طرف ثالث مستقل',
      'الامتثال للوائح حماية البيانات المصرية',
      'سياسة الإفصاح المسؤول عن الثغرات',
      'برنامج Bug Bounty للباحثين الأمنيين',
    ],
  },
]

export default function Security() {
  return (
    <PageLayout>

      <main style={{ padding: '64px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(106,76,245,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <ShieldTick size={32} color="#6a4cf5" variant="Outline" />
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 16 }}>الأمان</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>بياناتك أمانة عندنا — إليك كيف نحميها</p>
        </div>

        <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '20px 24px', marginBottom: 48, border: '1px solid rgba(34,197,94,0.3)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
            لم نتعرض لأي اختراق أمني منذ إطلاق Deema. نفخر بسجلنا الأمني النظيف ونلتزم بالشفافية الكاملة.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20, marginBottom: 48 }}>
          {practices.map(({ icon: Icon, title, color, items }) => (
            <div key={title} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={color} variant="Outline" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px' }}>{title}</h3>
              </div>
              <ul style={{ paddingRight: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '28px', border: '1px solid var(--hairline)', textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>اكتشفت ثغرة أمنية؟</h2>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            نقدّر الباحثين الأمنيين الذين يساعدوننا. أبلغنا بطريقة مسؤولة وسنستجيب خلال ٤٨ ساعة.
          </p>
          <a href="mailto:security@deema.ai" className="btn-primary" style={{ textDecoration: 'none' }}>security@deema.ai</a>
        </div>
      </main>

    </PageLayout>
  )
}
