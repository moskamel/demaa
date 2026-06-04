import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

const posts = [
  {
    slug: '1',
    title: '٥ طرق لتسريع إدارة طلبات متجرك الإلكتروني',
    date: '٢٠ مايو ٢٠٢٥',
    category: 'إدارة الطلبات',
    categoryColor: '#6a4cf5',
    excerpt: 'التجار الناجحون يعرفون أن سرعة معالجة الطلبات تعني رضا العملاء وتكرار الشراء. في هذا المقال، نشارك أفضل ٥ طرق لتسريع العمليات وتقليل الأخطاء — من الأتمتة الذكية إلى أنظمة التتبع.',
    readTime: '٥ دقائق',
  },
  {
    slug: '2',
    title: 'كيف تختار شركة الشحن المناسبة لمتجرك',
    date: '١٠ مايو ٢٠٢٥',
    category: 'الشحن',
    categoryColor: '#ff7a3d',
    excerpt: 'أرامكس أم SMSA أم J&T؟ سؤال يتكرر كثيراً بين التجار. الإجابة تعتمد على حجم شحناتك ومناطقك المستهدفة وميزانيتك. دليل شامل يساعدك على اتخاذ القرار الصح.',
    readTime: '٧ دقائق',
  },
  {
    slug: '3',
    title: 'الذكاء الاصطناعي في التجارة الإلكترونية العربية — أين نحن؟',
    date: '١ مايو ٢٠٢٥',
    category: 'الذكاء الاصطناعي',
    categoryColor: '#22c55e',
    excerpt: 'شهد ٢٠٢٥ تحولاً كبيراً في كيفية استخدام التجار العرب للذكاء الاصطناعي. من روبوتات الدردشة إلى تحليل البيانات التنبؤي، نستعرض أبرز التطورات وما يعنيه ذلك لمتجرك.',
    readTime: '٨ دقائق',
  },
  {
    slug: '4',
    title: '٣ استراتيجيات مجربة لزيادة مبيعاتك هذا الشهر',
    date: '١٥ مايو ٢٠٢٥',
    category: 'زيادة المبيعات',
    categoryColor: '#22c55e',
    excerpt: 'سواء كنت تبيع على سلة أو زد أو أمازون، هناك ٣ استراتيجيات تزيد مبيعاتك ٣٠٪ في أقل من شهر — بدون إنفاق إضافي على الإعلانات.',
    readTime: '٦ دقائق',
  },
  {
    slug: '5',
    title: 'مقارنة منصات التجارة الإلكترونية: سلة أم زد أم Shopify؟',
    date: '١٨ أبريل ٢٠٢٥',
    category: 'منصات التجارة',
    categoryColor: '#d44df0',
    excerpt: 'اخترت المنصة الخطأ؟ مشكلة شائعة تكلّف التجار وقتاً ومالاً. هذه المقارنة الشاملة تساعدك تختار الأنسب لحجمك وسوقك وأهدافك.',
    readTime: '١٠ دقائق',
  },
  {
    slug: '6',
    title: 'دليل الاحتفاظ بالعملاء: اجعلهم يعودون دائماً',
    date: '١ مايو ٢٠٢٥',
    category: 'العملاء',
    categoryColor: '#0099ff',
    excerpt: 'تكلفة الاحتفاظ بعميل أقل بـ٥ مرات من استقطاب عميل جديد. تعرّف على أفضل الطرق لبناء ولاء العملاء وزيادة معدل تكرار الشراء.',
    readTime: '٨ دقائق',
  },
]

export default function Blog() {
  const navigate = useNavigate()

  return (
    <PageLayout>

      <main style={{ padding: 'clamp(40px,6vw,80px) 200px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, letterSpacing: '-0.05em', marginBottom: 16 }}>المدونة</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.6 }}>محتوى عملي من خبرة مباشرة مع التجار العرب — لتنمي متجرك وتوفر وقتك.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
          {posts.map(post => (
            <article
              key={post.slug}
              onClick={() => navigate(`/blog/${post.slug}`)}
              style={{
                background: 'var(--canvas-soft)',
                borderRadius: 20,
                padding: '28px',
                border: '1px solid var(--hairline)',
                cursor: 'pointer',
                transition: 'border-color 0.2s, transform 0.15s',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = post.categoryColor; el.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--hairline)'; el.style.transform = '' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{
                  background: post.categoryColor + '22',
                  color: post.categoryColor,
                  borderRadius: 6, padding: '3px 10px',
                  fontSize: 12, fontWeight: 700,
                }}>{post.category}</span>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--ink-muted)' }}>
                  <span>{post.date}</span>
                  <span>{post.readTime} قراءة</span>
                </div>
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 12, lineHeight: 1.45, flex: 1 }}>{post.title}</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.7, marginBottom: 20 }}>{post.excerpt}</p>
              <div>
                <span style={{ fontSize: 13, color: post.categoryColor, fontWeight: 600 }}>اقرأ المقال ←</span>
              </div>
            </article>
          ))}
        </div>
      </main>

    </PageLayout>
  )
}
