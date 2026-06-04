import PageLayout from '../components/PageLayout'
import { Wifi, Money, Star1, People } from 'iconsax-react'

const perks = [
  {
    icon: Wifi,
    title: 'عمل عن بُعد',
    desc: 'اعمل من أي مكان في العالم. نحن remote-first بالكامل — نتواصل بشكل أذكى لا أطول.',
  },
  {
    icon: Money,
    title: 'راتب تنافسي',
    desc: 'نقدم رواتب تنافسية مع خيارات أسهم شركة. نؤمن أن الفريق يستحق حصة حقيقية في النجاح.',
  },
  {
    icon: Star1,
    title: 'تأثير حقيقي',
    desc: 'الفريق صغير — كل شخص يؤثر مباشرة. قرارك يُنفَّذ، كودك يُشحَن، فكرتك تصنع فرقاً.',
  },
  {
    icon: People,
    title: 'فريق صغير ومتحمس',
    desc: 'لا بيروقراطية ولا اجتماعات لا نهاية لها. فريق متمرس يحب ما يبنيه ويتعلم باستمرار.',
  },
]

const positions = [
  {
    title: 'مطور Full Stack',
    team: 'هندسة',
    type: 'دوام كامل',
    color: '#6a4cf5',
    desc: 'نبحث عن مطور React/TypeScript وNode.js شغوف ببناء تجارب مستخدم سلسة وخدمات قابلة للتوسع. ستعمل على Deema الأساسي وتتأثر بكل قرار تقني.',
  },
  {
    title: 'مصمم UX',
    team: 'تصميم',
    type: 'دوام كامل',
    color: '#d44df0',
    desc: 'نحتاج مصمم يعشق تبسيط التعقيد. ستصمم تجربة محادثة ذكية لتجار عرب — كل شاشة تصممها تستخدمها ١٢٠٠+ تاجر يومياً.',
  },
  {
    title: 'متخصص دعم تقني',
    team: 'نجاح العملاء',
    type: 'دوام كامل',
    color: '#ff7a3d',
    desc: 'الوجه الأول لـ Deema أمام التجار. ستساعد التجار على البدء، حل المشاكل، والاستفادة القصوى من كل ميزة — بالعربي وبأسرع وقت.',
  },
]

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: 16,
}

export default function Careers() {
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
            الوظائف
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 24, lineHeight: 1.15 }}>
            انضم لفريق يبني مستقبل<br />التجارة العربية
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto' }}>
            نحن فريق صغير ومتحمس يبني أدوات تغير كيف يعمل التجار العرب كل يوم. إذا كنت شغوفاً بالتأثير الحقيقي — مكانك هنا.
          </p>
        </div>

        {/* Why Join */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...eyebrow, color: 'var(--ink-muted)' }}>لماذا Deema</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em' }}>لماذا تنضم إلينا</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {perks.map(p => (
              <div key={p.title} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6a4cf522, #d44df022)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <p.icon size={22} color="#6a4cf5" variant="Outline" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{p.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...eyebrow, color: 'var(--ink-muted)' }}>الوظائف المتاحة</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em' }}>الفرص المفتوحة الآن</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {positions.map(pos => (
              <div key={pos.title} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 8 }}>{pos.title}</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ background: pos.color + '22', color: pos.color, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{pos.team}</span>
                      <span style={{ background: 'var(--canvas-soft-2)', color: 'var(--ink-muted)', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>{pos.type}</span>
                      <span style={{ background: 'var(--canvas-soft-2)', color: 'var(--ink-muted)', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>🌍 Remote</span>
                    </div>
                  </div>
                  <a
                    href={`mailto:careers@deema.ai?subject=تقديم لوظيفة: ${pos.title}`}
                    style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', borderRadius: 9999, padding: '13px 28px', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
                  >
                    تقدم الآن ←
                  </a>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{pos.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Culture */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...eyebrow, color: 'var(--ink-muted)' }}>ثقافتنا</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em' }}>كيف نعمل</h2>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #6a4cf511, #d44df011)', borderRadius: 20, border: '1px solid var(--hairline)', padding: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
              <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
                نبني بسرعة، نتعلم أسرع، ونضع التجار أولاً في كل قرار. كل شخص في الفريق يؤثر مباشرة على ما يستخدمه ١٢٠٠+ تاجر يومياً.
              </p>
            </div>
          </div>
        </div>

        {/* CTA bottom */}
        <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '32px', border: '1px solid var(--hairline)', textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', marginBottom: 8, fontWeight: 600 }}>لا تجد وظيفتك؟</p>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 16 }}>أرسل CV على البريد التالي وسنتواصل معك عند توفر فرصة مناسبة.</p>
          <a
            href="mailto:careers@deema.ai"
            style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', borderRadius: 9999, padding: '13px 28px', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            careers@deema.ai ←
          </a>
        </div>

      </main>
    </PageLayout>
  )
}
