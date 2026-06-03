import PageLayout from '../components/PageLayout'

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
    <PageLayout>

      <main style={{ padding: '64px 200px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 16 }}>المدونة</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>نصائح وأفكار لتنمية متجرك الإلكتروني</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {posts.map(post => (
            <article key={post.slug} style={{
              background: 'var(--canvas-soft)',
              borderRadius: 20,
              padding: '32px',
              border: '1px solid var(--hairline)',
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

    </PageLayout>
  )
}
