import PageLayout from '../components/PageLayout'

const positions = [
  {
    title: 'مهندس واجهات أمامية',
    dept: 'هندسة',
    type: 'دوام كامل · Remote',
    location: 'مصر',
    color: '#6a4cf5',
    desc: 'نبحث عن مهندس React/TypeScript شغوف ببناء تجارب مستخدم سلسة. ستعمل على واجهة Deema الرئيسية وتجربة المحادثة الذكية.',
    requirements: ['خبرة ٣+ سنوات في React وTypeScript', 'إتقان CSS والتصميم Responsive', 'خبرة في مكتبات State Management', 'اهتمام بتفاصيل UX/UI'],
  },
  {
    title: 'مهندس ذكاء اصطناعي',
    dept: 'AI & ML',
    type: 'دوام كامل · Remote',
    location: 'مصر',
    color: '#d44df0',
    desc: 'انضم لفريق AI لبناء وتطوير نماذج معالجة اللغة العربية. ستعمل على تحسين دقة فهم اللهجات وتطوير قدرات Deema.',
    requirements: ['خلفية قوية في NLP و LLMs', 'خبرة مع Python وPyTorch/TensorFlow', 'معرفة باللغة العربية وتحدياتها', 'تجربة مع Fine-tuning النماذج'],
  },
  {
    title: 'مندوب مبيعات',
    dept: 'مبيعات',
    type: 'دوام كامل · Remote',
    location: 'مصر',
    color: '#ff7a3d',
    desc: 'ساعد التجار المصريين على اكتشاف Deema وتنمية أعمالهم. دور مباشر مع العملاء ومساهمة حقيقية في نمو الشركة.',
    requirements: ['خبرة ٢+ سنوات في مبيعات SaaS أو تكنولوجيا', 'شبكة علاقات في عالم التجارة الإلكترونية', 'مهارات تواصل ممتازة', 'دافعية ذاتية عالية'],
  },
]

export default function Careers() {
  return (
    <PageLayout>

      <main style={{ padding: '64px 200px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 16 }}>الوظائف المتاحة</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>ابنِ مستقبل التجارة الإلكترونية العربية معنا</p>
        </div>

        <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '20px 24px', marginBottom: 40, border: '1px solid var(--hairline)', display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 24 }}>🌍</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Remote-first من مصر</div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>كل وظائفنا remote — اعمل من أي مكان في مصر. نلتقي مرة شهرياً في القاهرة.</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {positions.map(pos => (
            <div key={pos.title} style={{ background: 'var(--canvas-soft)', borderRadius: 20, padding: '32px', border: '1px solid var(--hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px', marginBottom: 8 }}>{pos.title}</h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: pos.color + '22', color: pos.color, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{pos.dept}</span>
                    <span style={{ background: 'var(--canvas-soft-2)', color: 'var(--ink-muted)', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>{pos.type}</span>
                    <span style={{ background: 'var(--canvas-soft-2)', color: 'var(--ink-muted)', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>📍 {pos.location}</span>
                  </div>
                </div>
                <a
                  href={`mailto:careers@deema.ai?subject=تقديم لوظيفة: ${pos.title}`}
                  className="btn-primary"
                  style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  قدّم الآن
                </a>
              </div>
              <p style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 20 }}>{pos.desc}</p>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--ink)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>المتطلبات</h3>
                <ul style={{ paddingRight: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {pos.requirements.map((r, i) => (
                    <li key={i} style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', marginTop: 32, border: '1px solid var(--hairline)', textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', marginBottom: 12 }}>ما لقيتش وظيفتك؟ راسلنا على أي حال.</p>
          <a href="mailto:careers@deema.ai" className="btn-secondary" style={{ textDecoration: 'none' }}>careers@deema.ai</a>
        </div>
      </main>

    </PageLayout>
  )
}
