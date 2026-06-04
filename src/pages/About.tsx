import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { Heart, Shield, Global, Eye, Flash } from 'iconsax-react'

const teamMembers = [
  {
    name: 'أحمد الشريف',
    role: 'المؤسس والرئيس التنفيذي',
    bio: 'مهندس برمجيات سابق في Careem. أسّس Deema بعد أن فقد ساعات يومياً في إدارة متجره بأدوات إنجليزية معقدة لا تفهم السوق العربي. قرّر أن يبني الحل بنفسه.',
    initials: 'أش',
    gradient: 'linear-gradient(135deg, #6a4cf5, #d44df0)',
  },
  {
    name: 'سارة حسن',
    role: 'مديرة المنتج',
    bio: 'خبرة ١٠ سنوات في تجربة المستخدم والمنتجات الرقمية. تؤمن بعمق أن التكنولوجيا يجب أن تتكلم لغة التاجر وتخدمه — لا العكس.',
    initials: 'سح',
    gradient: 'linear-gradient(135deg, #d44df0, #6a4cf5)',
  },
  {
    name: 'محمود إبراهيم',
    role: 'رئيس هندسة الذكاء الاصطناعي',
    bio: 'دكتوراه في معالجة اللغة العربية من جامعة القاهرة. بنى نماذج اللغة التي تجعل Deema يفهمك بأي لهجة — مصري، سعودي، أو إماراتي.',
    initials: 'مإ',
    gradient: 'linear-gradient(135deg, #ff7a3d, #d44df0)',
  },
]

const values = [
  {
    icon: Flash,
    label: 'سرعة',
    desc: 'كل ثانية تفرق في التجارة الإلكترونية. Deema يتصرف فورياً حتى لا تضيع وقتك في أي خطوة.',
  },
  {
    icon: Shield,
    label: 'أمان',
    desc: 'بياناتك محمية بأعلى معايير التشفير. لا إجراء جماعي بدون موافقتك الصريحة.',
  },
  {
    icon: Global,
    label: 'عربي أولاً',
    desc: 'كل ميزة نبنيها مصممة للتاجر العربي — لغةً وتجربةً وأدق التفاصيل.',
  },
  {
    icon: Eye,
    label: 'شفافية',
    desc: 'نخبرك بكل تحديث وتغيير. سياسة سعر واضحة تماماً بدون مفاجآت أو رسوم مخفية.',
  },
]

const stats = [
  { value: '+١٢٠٠', label: 'تاجر نشط' },
  { value: '+٢.٤م', label: 'طلب مُدار' },
  { value: '١٤', label: 'منصة مربوطة' },
  { value: '٣', label: 'دول' },
]

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: 12,
}

export default function About() {
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
            قصتنا
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 24, lineHeight: 1.15 }}>
            بنينا Deema لأننا<br />عشنا مشكلتك
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 32px' }}>
            كنا تجاراً قبل أن نكون مطورين. كنا نضيع ساعات يومياً في تتبع الطلبات، والرد على العملاء، وإنشاء بوالص الشحن يدوياً — بأدوات إنجليزية لا تفهم متجرنا ولا لغتنا.
            قررنا أن نبني المساعد الذي كنا نتمناه: يتكلم عربي، يفهم أي لهجة، ويتصرف بدلاً عنا.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 80 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', borderRadius: 20, padding: '56px 48px', marginBottom: 80, textAlign: 'center' }}>
          <div style={{ ...eyebrow, color: 'rgba(255,255,255,0.7)' }}>مهمتنا</div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.4, maxWidth: 640, margin: '0 auto' }}>
            نساعد التجار العرب على إدارة متاجرهم بالكامل — بالعربي، في ثوانٍ، بدون خبرة تقنية.
          </p>
        </div>

        {/* Team */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...eyebrow, color: 'var(--ink-muted)' }}>الفريق</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em' }}>الناس وراء Deema</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {teamMembers.map(m => (
              <div key={m.name} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', textAlign: 'center' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: m.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 22, fontWeight: 800, color: '#fff',
                }}>
                  {m.initials}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{m.name}</h3>
                <div style={{ fontSize: 13, background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 600, marginBottom: 12 }}>{m.role}</div>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...eyebrow, color: 'var(--ink-muted)' }}>قيمنا</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em' }}>ما الذي يحركنا</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {values.map(v => (
              <div key={v.label} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6a4cf522, #d44df022)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <v.icon size={22} color="#6a4cf5" variant="Outline" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{v.label}</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        <div style={{ background: 'var(--canvas-soft)', borderRadius: 20, padding: '56px 40px', border: '1px solid var(--hairline)', textAlign: 'center' }}>
          <div style={{ ...eyebrow, color: 'var(--ink-muted)' }}>انضم إلينا</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 16 }}>انضم للعائلة</h2>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
            أكثر من ١٢٠٠ تاجر يثقون في Deema كل يوم. انضم إليهم وادر متجرك بشكل أذكى وأسرع.
          </p>
          <Link
            to="/signup"
            style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', borderRadius: 9999, padding: '13px 28px', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            ابدأ مجاناً الآن ←
          </Link>
        </div>

      </main>
    </PageLayout>
  )
}
