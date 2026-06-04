import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { TickCircle } from 'iconsax-react'

const platforms = [
  {
    emoji: '🛍️',
    name: 'Shopify',
    desc: 'أكبر منصة تجارة إلكترونية في العالم. اربط متجر Shopify بـ Deema في دقيقتين واستمتع بإدارة ذكية كاملة بالعربي.',
  },
  {
    emoji: '🟢',
    name: 'سلة',
    desc: 'منصة التجارة الإلكترونية الرائدة في السعودية. اربط متجرك على سلة وادر طلباتك السعودية بالكامل بالعربية.',
  },
  {
    emoji: '🔵',
    name: 'زد',
    desc: 'منصة سعودية متكاملة تخدم آلاف التجار. Deema يتكامل مع زد لإدارة الطلبات والشحن والتقارير من مكان واحد.',
  },
  {
    emoji: '🌐',
    name: 'Wuilt',
    desc: 'منصة التجارة الإلكترونية العربية. الربط مع Deema يمنحك قوة الذكاء الاصطناعي فوق تجربة Wuilt الرائعة.',
  },
  {
    emoji: '🏪',
    name: 'Shantaweb',
    desc: 'منصة مصرية متخصصة تفهم السوق المحلي. اربطها بـ Deema وادر متجرك المصري بالكامل بالعربي والجنيه المصري.',
  },
  {
    emoji: '🛒',
    name: 'WooCommerce',
    desc: 'أشهر إضافة تجارة إلكترونية على WordPress. إذا كان موقعك على WooCommerce، يمكنك ربطه بـ Deema في دقيقة واحدة.',
  },
  {
    emoji: '📦',
    name: 'Amazon',
    desc: 'أكبر سوق إلكتروني في العالم. ادر طلباتك على أمازون مصر والسعودية والإمارات من لوحة Deema الواحدة.',
  },
  {
    emoji: '🌙',
    name: 'Noon',
    desc: 'أكبر سوق إلكتروني في الشرق الأوسط. اربط حساب البائع بـ Deema وادر كل طلبات نون من مكان واحد.',
  },
  {
    emoji: '🛵',
    name: 'Jumia',
    desc: 'أكبر سوق إلكتروني في أفريقيا ومصر. اربط متجرك بـ Deema وادر طلبات Jumia مع باقي متاجرك بسهولة تامة.',
  },
  {
    emoji: '🔷',
    name: 'BigCommerce',
    desc: 'منصة تجارة إلكترونية عالمية للمتاجر الكبيرة. API واضح وسريع يتيح ربط كامل مع Deema في دقائق.',
  },
  {
    emoji: '🎨',
    name: 'Wix',
    desc: 'منصة بناء المواقع الأشهر مع متجر متكامل. اربط متجر Wix بـ Deema عبر Wix Headless API وادر طلباتك بسهولة.',
  },
  {
    emoji: '🎵',
    name: 'TikTok Shop',
    desc: 'منصة تجارة إلكترونية سريعة النمو. اربط متجرك بـ Deema وادر طلبات TikTok مع باقي متاجرك من لوحة واحدة.',
  },
  {
    emoji: '💙',
    name: 'Facebook Shop',
    desc: 'البيع عبر Meta Commerce Platform. ادر طلبات فيسبوك وإنستغرام من مكان واحد في Deema بدون أي تعقيد.',
  },
  {
    emoji: '🧩',
    name: 'Ecwid',
    desc: 'منصة متجر مدمجة مع أي موقع. ربطها بـ Deema يعطيك إدارة مركزية لكل طلباتك من أي متجر Ecwid.',
  },
]

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: 16,
}

export default function Platforms() {
  return (
    <PageLayout>
      <main style={{ padding: '64px 200px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            ...eyebrow,
            display: 'inline-block',
            background: 'linear-gradient(135deg, #6a4cf5, #d44df0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            المنصات
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 20, lineHeight: 1.15 }}>
            ربط متجرك في دقيقتين
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            Deema يدعم ١٤ منصة تجارة إلكترونية عربية وعالمية. بغض النظر عن أين تبيع — سلة أو أمازون أو TikTok Shop — ادر كل شيء من مكان واحد بالعربي.
          </p>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 64 }}>
          {[
            { value: '١٤', label: 'منصة مدعومة' },
            { value: 'دقيقتان', label: 'متوسط وقت الربط' },
            { value: '٠', label: 'خبرة تقنية مطلوبة' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Platforms Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 64 }}>
          {platforms.map(p => (
            <div key={p.name} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 40, flexShrink: 0, lineHeight: 1 }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>{p.name}</h2>
                  <Link
                    to="/signup"
                    style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', borderRadius: 9999, padding: '6px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
                  >
                    ربط الآن
                  </Link>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{p.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                  <TickCircle size={14} color="#22c55e" variant="Outline" />
                  <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>ربط فوري · بدون خبرة تقنية</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Closing CTA */}
        <div style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', borderRadius: 20, padding: '56px 40px', textAlign: 'center' }}>
          <div style={{ ...eyebrow, color: 'rgba(255,255,255,0.7)' }}>ابدأ الربط</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 16 }}>اربط متجرك الآن مجاناً</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', maxWidth: 480, margin: '0 auto 32px' }}>
            سجّل حساباً وابدأ ربط متجرك في أقل من دقيقتين. لا بطاقة ائتمان مطلوبة.
          </p>
          <Link
            to="/signup"
            style={{ background: '#fff', color: '#6a4cf5', borderRadius: 9999, padding: '13px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            ابدأ مجاناً ←
          </Link>
        </div>

      </main>
    </PageLayout>
  )
}
