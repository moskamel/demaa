import { Link } from 'react-router-dom'

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
    <div dir="rtl" style={{ background: 'var(--canvas)', color: 'var(--ink)', minHeight: '100vh' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(9,9,9,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--hairline-soft)',
        height: 56,
        display: 'flex', alignItems: 'center',
        padding: '0 30px',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 14 }}>→ الرئيسية</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontWeight: 700, fontSize: 12 }}>D</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.5px' }}>Deema</span>
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '64px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 16 }}>من نحن</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>فريق من القاهرة يبني مستقبل التجارة الإلكترونية العربية</p>
        </div>

        <div style={{ background: 'var(--surface-1)', borderRadius: 20, padding: '40px', marginBottom: 48, border: '1px solid var(--hairline-soft)' }}>
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
              <div key={m.name} style={{ background: 'var(--surface-1)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline-soft)', textAlign: 'center' }}>
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

        <div style={{ background: 'var(--surface-1)', borderRadius: 20, padding: '32px', marginTop: 48, border: '1px solid var(--hairline-soft)', textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>انضم إلينا</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', marginBottom: 20 }}>نبحث عن أشخاص موهوبين يؤمنون بمستقبل التجارة الإلكترونية العربية</p>
          <Link to="/careers" className="btn-primary">شاهد الوظائف المتاحة</Link>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--hairline-soft)', padding: '24px 30px', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>© Deema 2025</span>
      </footer>
    </div>
  )
}
