import { Link } from 'react-router-dom'

const posts = [
  {
    slug: '1',
    title: '٥ طرق لتسريع إدارة طلبات متجرك الإلكتروني',
    date: '٢٠ مايو ٢٠٢٥',
    category: 'نصائح عملية',
    categoryColor: '#6a4cf5',
    excerpt: 'التجار الناجحون يعرفون أن سرعة معالجة الطلبات تعني رضا العملاء وتكرار الشراء. في هذا المقال، نشارك أفضل ٥ طرق لتسريع العمليات وتقليل الأخطاء — من الأتمتة الذكية إلى أنظمة التتبع.',
    readTime: '٥ دقائق',
  },
  {
    slug: '2',
    title: 'كيف تختار شركة الشحن المناسبة لمتجرك في مصر',
    date: '١٠ مايو ٢٠٢٥',
    category: 'لوجستيات',
    categoryColor: '#ff7a3d',
    excerpt: 'أرامكس أم SMSA أم J&T؟ سؤال يتكرر كثيراً بين التجار المصريين. الإجابة تعتمد على حجم شحناتك ومناطقك المستهدفة وميزانيتك. دليل شامل يساعدك على اتخاذ القرار الصح.',
    readTime: '٧ دقائق',
  },
  {
    slug: '3',
    title: 'الذكاء الاصطناعي في التجارة الإلكترونية العربية — أين نحن؟',
    date: '١ مايو ٢٠٢٥',
    category: 'تكنولوجيا',
    categoryColor: '#22c55e',
    excerpt: 'شهد ٢٠٢٥ تحولاً كبيراً في كيفية استخدام التجار العرب للذكاء الاصطناعي. من روبوتات الدردشة إلى تحليل البيانات التنبؤي، نستعرض أبرز التطورات وما يعنيه ذلك لمتجرك.',
    readTime: '٨ دقائق',
  },
]

export default function Blog() {
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
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 16 }}>المدونة</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>نصائح وأفكار لتنمية متجرك الإلكتروني</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {posts.map(post => (
            <article key={post.slug} style={{
              background: 'var(--surface-1)',
              borderRadius: 20,
              padding: '32px',
              border: '1px solid var(--hairline-soft)',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{
                  background: post.categoryColor + '22',
                  color: post.categoryColor,
                  borderRadius: 6, padding: '3px 10px',
                  fontSize: 12, fontWeight: 600,
                }}>{post.category}</span>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-muted)' }}>
                  <span>{post.date}</span>
                  <span>{post.readTime} قراءة</span>
                </div>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.4px', marginBottom: 12, lineHeight: 1.4 }}>{post.title}</h2>
              <p style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.7 }}>{post.excerpt}</p>
              <div style={{ marginTop: 20 }}>
                <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, borderBottom: '1px solid var(--hairline)', paddingBottom: 2 }}>اقرأ المزيد ←</span>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--hairline-soft)', padding: '24px 30px', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>© Deema 2025</span>
      </footer>
    </div>
  )
}
