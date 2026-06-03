import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

const releases = [
  {
    version: 'v1.2.0',
    date: '١٥ مايو ٢٠٢٥',
    tag: 'جديد',
    tagColor: '#22c55e',
    title: 'تقارير متقدمة وتصدير Excel',
    changes: [
      'إضافة تصدير التقارير بصيغة Excel وPDF',
      'لوحة تحليلات جديدة بمخططات بيانية',
      'ملخص أسبوعي يُرسل تلقائياً بالإيميل',
      'تحسين أداء الاستعلامات الكبيرة بنسبة ٦٠٪',
      'دعم التواريخ الهجرية في التقارير',
    ],
  },
  {
    version: 'v1.1.0',
    date: '٢ أبريل ٢٠٢٥',
    tag: 'تحسينات',
    tagColor: '#6a4cf5',
    title: 'إدارة الفريق والصلاحيات',
    changes: [
      'نظام صلاحيات كامل — مدير، محرر، قارئ',
      'دعوة أعضاء الفريق عبر البريد الإلكتروني',
      'سجل نشاط لكل عضو في الفريق',
      'إشعارات واتساب للطلبات الجديدة',
      'تحسين واجهة الدردشة على الجوال',
    ],
  },
  {
    version: 'v1.0.1',
    date: '١٨ مارس ٢٠٢٥',
    tag: 'إصلاح',
    tagColor: '#f59e0b',
    title: 'إصلاحات وتحسينات الأداء',
    changes: [
      'إصلاح مشكلة تزامن الطلبات مع Shopify',
      'تحسين دقة فهم اللهجة المصرية',
      'إصلاح خطأ في حساب الكوبونات المتعددة',
      'تسريع وقت الاستجابة بمعدل ٤٠٪',
    ],
  },
  {
    version: 'v1.0.0',
    date: '١ مارس ٢٠٢٥',
    tag: 'إطلاق',
    tagColor: '#d44df0',
    title: 'الإطلاق الرسمي لـ Deema 🎉',
    changes: [
      'محادثة ذكية بالعربي — أي لهجة',
      'إدارة الطلبات والشحن الكامل',
      'ربط Shopify وWuilt وShantaweb',
      'تقارير يومية وأسبوعية',
      'نظام الكوبونات والعروض الخاصة',
    ],
  },
]

export default function Changelog() {
  return (
    <PageLayout>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '64px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 16 }}>سجل التحديثات</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>كل جديد في Deema — شفافية كاملة مع مستخدمينا</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {releases.map(r => (
            <div key={r.version} style={{ display: 'flex', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 2 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: r.tagColor, flexShrink: 0, marginTop: 6 }} />
                <div style={{ width: 2, flex: 1, background: 'var(--hairline)', marginTop: 8 }} />
              </div>
              <div style={{ flex: 1, paddingBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--ink)' }}>{r.version}</span>
                  <span style={{ background: r.tagColor + '22', color: r.tagColor, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{r.tag}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{r.date}</span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px', marginBottom: 16 }}>{r.title}</h2>
                <ul style={{ paddingRight: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {r.changes.map((c, i) => (
                    <li key={i} style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>

    </PageLayout>
  )
}
