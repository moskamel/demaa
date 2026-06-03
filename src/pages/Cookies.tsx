import PageLayout from '../components/PageLayout'

const cookieTypes = [
  {
    name: 'ملفات تعريف الارتباط الضرورية',
    required: true,
    desc: 'ضرورية لعمل الموقع الأساسي. لا يمكن تعطيلها.',
    examples: ['جلسة تسجيل الدخول', 'تفضيلات الأمان', 'رمز CSRF'],
    color: '#22c55e',
  },
  {
    name: 'ملفات الأداء والتحليل',
    required: false,
    desc: 'تساعدنا على فهم كيفية استخدام الموقع لتحسينه.',
    examples: ['تتبع الصفحات المزارة', 'وقت تحميل الصفحات', 'معدلات الخطأ'],
    color: '#6a4cf5',
  },
  {
    name: 'ملفات الوظائف',
    required: false,
    desc: 'تحفظ تفضيلاتك لتحسين تجربتك.',
    examples: ['تفضيلات اللغة', 'إعدادات العرض', 'آخر متجر اخترته'],
    color: '#ff7a3d',
  },
]

const sections = [
  {
    title: 'ما هي ملفات تعريف الارتباط؟',
    content: 'ملفات تعريف الارتباط (Cookies) هي ملفات نصية صغيرة تُخزَّن على جهازك عند زيارة موقعنا. تُستخدم لتذكّر تفضيلاتك، الحفاظ على جلستك، وتحسين تجربتك.',
  },
  {
    title: 'كيف نستخدم ملفات تعريف الارتباط؟',
    content: 'نستخدم ملفات تعريف الارتباط للأغراض التالية:\n• الحفاظ على حالة تسجيل الدخول\n• تذكر تفضيلاتك\n• قياس أداء الموقع\n• تحسين تجربة المستخدم',
  },
  {
    title: 'ملفات تعريف الارتباط التابعة لأطراف ثالثة',
    content: 'قد نستخدم خدمات تحليلات من أطراف ثالثة. هذه الخدمات تُنشئ ملفات تعريف ارتباط خاصة بها. لا نتحكم في هذه الملفات وننصحك بمراجعة سياسات الخصوصية الخاصة بها.',
  },
  {
    title: 'التحكم في ملفات تعريف الارتباط',
    content: 'يمكنك التحكم في ملفات تعريف الارتباط من خلال:\n• إعدادات متصفحك\n• لوحة تفضيلات ملفات تعريف الارتباط في موقعنا\n\nتنبيه: تعطيل بعض الملفات قد يؤثر على عمل الموقع.',
  },
  {
    title: 'مدة الاحتفاظ',
    content: 'تنتهي صلاحية ملفات الجلسة بإغلاق المتصفح. ملفات التفضيلات تُحفظ لمدة ٣٠ يوماً. ملفات التحليل تُحفظ لمدة ٩٠ يوماً كحد أقصى.',
  },
]

export default function Cookies() {
  return (
    <PageLayout>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '64px 30px' }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 12 }}>سياسة ملفات تعريف الارتباط</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>آخر تحديث: ١ مارس ٢٠٢٥</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 48 }}>
          {sections.map((s, i) => (
            <div key={i}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, letterSpacing: '-0.3px' }}>{s.title}</h2>
              <p style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.content}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24, letterSpacing: '-0.4px' }}>أنواع ملفات تعريف الارتباط</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cookieTypes.map(ct => (
            <div key={ct.name} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{ct.name}</h3>
                <span style={{
                  background: ct.required ? '#22c55e22' : 'var(--canvas-soft-2)',
                  color: ct.required ? '#22c55e' : 'var(--ink-muted)',
                  borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                }}>{ct.required ? 'ضروري' : 'اختياري'}</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 12 }}>{ct.desc}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ct.examples.map(ex => (
                  <span key={ex} style={{ background: 'var(--canvas-soft-2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'var(--ink-muted)' }}>{ex}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', marginTop: 32, border: '1px solid var(--hairline)' }}>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.7 }}>
            لأي استفسار حول ملفات تعريف الارتباط: <a href="mailto:privacy@deema.ai" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>privacy@deema.ai</a>
          </p>
        </div>
      </main>

    </PageLayout>
  )
}
