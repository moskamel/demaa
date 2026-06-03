import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

const teamMembers = [
  {
    name: 'أحمد الشريف',
    role: 'المؤسس والرئيس التنفيذي',
    bio: 'مهندس برمجيات سابق في Careem. أسّس Deema بعد معاناته الشخصية في إدارة متجره الإلكتروني.',
    initials: 'أش',
    color: '#6a4cf5',
  },
  {
    name: 'سارة حسن',
    role: 'مديرة المنتج',
    bio: 'خبرة ١٠ سنوات في تجربة المستخدم والمنتجات الرقمية. شغوفة بجعل التكنولوجيا في متناول الجميع.',
    initials: 'سح',
    color: '#d44df0',
  },
  {
    name: 'محمود إبراهيم',
    role: 'رئيس هندسة الذكاء الاصطناعي',
    bio: 'دكتوراه في معالجة اللغة العربية من جامعة القاهرة. بنى نماذج اللغة العربية الأساسية في Deema.',
    initials: 'مإ',
    color: '#ff7a3d',
  },
]

export default function About() {
  return (
    <PageLayout>

      <main style={{ padding: '64px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 16 }}>من نحن</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>فريق من القاهرة يبني مستقبل التجارة الإلكترونية العربية</p>
        </div>

        <div style={{ background: 'var(--canvas-soft)', borderRadius: 20, padding: '40px', marginBottom: 48, border: '1px solid var(--hairline)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, letterSpacing: '-0.4px' }}>مهمتنا</h2>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.8, marginBottom: 16 }}>
            Deema وُلد من إحباط حقيقي — مئات التجار المصريين يضيعون ساعات يومياً في تتبع الطلبات، إدارة الشحنات، والرد على العملاء. كان الحل دائماً برامج معقدة بالإنجليزية تحتاج خبرة تقنية.
          </p>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.8, marginBottom: 16 }}>
            قررنا أن نبني مساعداً يتكلم عربيتك — يفهم اللهجة المصرية، ويتصرف كموظف ذكي يعرف متجرك من الداخل.
          </p>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.8 }}>
            اليوم، Deema يساعد أكثر من ١٠٠ تاجر مصري على إدارة متاجرهم بكفاءة أعلى وبوقت أقل بكثير.
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>📍</span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>القاهرة، مصر</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>مسجلون في مصر · نعمل remote بالكامل</p>
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 32, letterSpacing: '-0.4px' }}>الفريق</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {teamMembers.map(m => (
              <div key={m.name} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: m.color + '33',
                  border: `2px solid ${m.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 20, fontWeight: 700, color: m.color,
                }}>
                  {m.initials}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{m.name}</h3>
                <div style={{ fontSize: 13, color: m.color, fontWeight: 500, marginBottom: 12 }}>{m.role}</div>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--canvas-soft)', borderRadius: 20, padding: '32px', marginTop: 48, border: '1px solid var(--hairline)', textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>انضم إلينا</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', marginBottom: 20 }}>نبحث عن أشخاص موهوبين يؤمنون بمستقبل التجارة الإلكترونية العربية</p>
          <Link to="/careers" className="btn-primary">شاهد الوظائف المتاحة</Link>
        </div>
      </main>

    </PageLayout>
  )
}
