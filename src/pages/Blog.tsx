import { useState } from 'react'
import PageLayout from '../components/PageLayout'

const posts = [
  {
    slug: '1',
    title: '٥ طرق لتسريع إدارة طلبات متجرك الإلكتروني',
    date: '٢٠ مايو ٢٠٢٥',
    category: 'إدارة الطلبات',
    categoryColor: '#6a4cf5',
    excerpt: 'التجار الناجحون يعرفون أن سرعة معالجة الطلبات تعني رضا العملاء وتكرار الشراء. في هذا المقال، نشارك أفضل ٥ طرق لتسريع العمليات وتقليل الأخطاء — من الأتمتة الذكية إلى أنظمة التتبع.',
    readTime: '٥',
  },
  {
    slug: '2',
    title: '٣ استراتيجيات مجربة لزيادة مبيعاتك هذا الشهر',
    date: '١٥ مايو ٢٠٢٥',
    category: 'زيادة المبيعات',
    categoryColor: '#22c55e',
    excerpt: 'سواء كنت تبيع على سلة أو Shopify أو أمازون، هناك ٣ استراتيجيات بسيطة تزيد مبيعاتك ٣٠٪ في أقل من شهر — بدون إنفاق إضافي على الإعلانات.',
    readTime: '٦',
  },
  {
    slug: '3',
    title: 'كيف تختار شركة الشحن المناسبة لمتجرك',
    date: '١٠ مايو ٢٠٢٥',
    category: 'الشحن',
    categoryColor: '#ff7a3d',
    excerpt: 'أرامكس أم SMSA أم J&T؟ الإجابة تعتمد على حجم شحناتك ومناطقك المستهدفة وميزانيتك. دليل شامل يساعدك على اتخاذ القرار الصحيح.',
    readTime: '٧',
  },
  {
    slug: '4',
    title: 'دليل الاحتفاظ بالعملاء: اجعلهم يعودون دائماً',
    date: '١ مايو ٢٠٢٥',
    category: 'العملاء',
    categoryColor: '#d44df0',
    excerpt: 'تكلفة الاحتفاظ بعميل قائم أقل بـ٥ مرات من استقطاب عميل جديد. تعرّف على أفضل الطرق لبناء ولاء العملاء وزيادة معدل تكرار الشراء في متجرك.',
    readTime: '٨',
  },
  {
    slug: '5',
    title: 'الذكاء الاصطناعي في التجارة الإلكترونية العربية — أين نحن؟',
    date: '٢٥ أبريل ٢٠٢٥',
    category: 'الذكاء الاصطناعي',
    categoryColor: '#0ea5e9',
    excerpt: 'شهد ٢٠٢٥ تحولاً كبيراً في كيفية استخدام التجار العرب للذكاء الاصطناعي. من روبوتات الدردشة إلى تحليل البيانات التنبؤي، نستعرض أبرز التطورات.',
    readTime: '٨',
  },
  {
    slug: '6',
    title: 'مقارنة منصات التجارة الإلكترونية: سلة أم زد أم Shopify؟',
    date: '١٨ أبريل ٢٠٢٥',
    category: 'منصات التجارة',
    categoryColor: '#f59e0b',
    excerpt: 'اخترت خطأ المنصة؟ مشكلة شائعة تكلّف التجار وقتاً ومالاً. هذه المقارنة الشاملة تساعدك على اختيار المنصة المناسبة لحجم متجرك وأهدافك.',
    readTime: '١٠',
  },
]

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: 16,
}

export default function Blog() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <PageLayout>
      <main style={{ padding: '64px 200px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{
            ...eyebrow,
            display: 'inline-block',
            background: 'linear-gradient(135deg, #6a4cf5, #d44df0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            المدونة
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 20, lineHeight: 1.15 }}>
            نصائح ومقالات لتجار الإنترنت
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            محتوى عملي من خبرة مباشرة مع التجار العرب — لتنمي متجرك وتوفر وقتك.
          </p>
        </div>

        {/* Posts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 80 }}>
          {posts.map(post => (
            <article key={post.slug} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  background: post.categoryColor + '22',
                  color: post.categoryColor,
                  borderRadius: 6, padding: '3px 10px',
                  fontSize: 12, fontWeight: 600,
                }}>{post.category}</span>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 10, lineHeight: 1.5, flex: 1 }}>{post.title}</h2>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 16 }}>{post.excerpt}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--hairline)', paddingTop: 14, marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--ink-muted)' }}>
                  <span>{post.date}</span>
                  <span>{post.readTime} دقائق</span>
                </div>
                <span style={{ fontSize: 13, color: '#6a4cf5', fontWeight: 600, cursor: 'pointer' }}>اقرأ المقال ←</span>
              </div>
            </article>
          ))}
        </div>

        {/* Subscribe Section */}
        <div style={{ background: 'var(--canvas-soft)', borderRadius: 20, padding: '56px 40px', border: '1px solid var(--hairline)', textAlign: 'center' }}>
          <div style={{ ...eyebrow, color: 'var(--ink-muted)' }}>النشرة الأسبوعية</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 12 }}>اشترك في نشرتنا الأسبوعية</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
            نصائح عملية وأخبار التجارة الإلكترونية مباشرة في بريدك — كل أسبوع، بدون إزعاج.
          </p>
          {subscribed ? (
            <div style={{ fontSize: 16, color: '#22c55e', fontWeight: 600 }}>✅ تم الاشتراك! شكراً لك.</div>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                style={{
                  background: 'var(--canvas)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 9999,
                  padding: '13px 20px',
                  fontSize: 14,
                  color: 'var(--ink)',
                  minWidth: 280,
                  outline: 'none',
                }}
              />
              <button
                onClick={() => email && setSubscribed(true)}
                style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', borderRadius: 9999, padding: '13px 28px', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                اشترك مجاناً ←
              </button>
            </div>
          )}
        </div>

      </main>
    </PageLayout>
  )
}
