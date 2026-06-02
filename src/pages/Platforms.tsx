import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

const platforms = [
  {
    emoji: '🛍️',
    name: 'Shopify',
    tagline: 'أكبر منصة تجارة إلكترونية في العالم',
    desc: 'ربط Deema بمتجر Shopify الخاص بك في خطوات بسيطة. بعد الربط، يمكن لـ Deema إدارة طلباتك ومخزونك وشحناتك مباشرة من المحادثة.',
    steps: ['افتح إعدادات التطبيق في Deema', 'اختر "إضافة متجر Shopify"', 'أدخل رابط متجرك وأذونات API', 'وافق على الصلاحيات في لوحة Shopify', 'ابدأ الإدارة فوراً'],
    features: ['مزامنة الطلبات الفورية', 'إدارة المخزون', 'بيانات العملاء', 'تقارير المبيعات'],
  },
  {
    emoji: '🌐',
    name: 'Wuilt',
    tagline: 'منصة التجارة الإلكترونية العربية',
    desc: 'Wuilt منصة عربية متخصصة للتجارة الإلكترونية. الربط مع Deema يعطيك قوة الذكاء الاصطناعي فوق تجربة Wuilt الرائعة.',
    steps: ['اذهب إلى إعدادات Deema', 'اختر "إضافة متجر Wuilt"', 'سجّل دخولك على Wuilt وأنشئ API Key', 'الصق الـ API Key في Deema', 'اكتمل الربط — ابدأ فوراً'],
    features: ['تزامن الطلبات تلقائياً', 'إدارة المنتجات', 'متابعة الشحنات', 'إشعارات فورية'],
  },
  {
    emoji: '🏪',
    name: 'Shantaweb',
    tagline: 'منصة التجارة الإلكترونية المصرية',
    desc: 'Shantaweb منصة مصرية متخصصة تفهم السوق المحلي. اربطها بـ Deema وادر متجرك المصري بالكامل بالعربي.',
    steps: ['افتح إعدادات المتاجر في Deema', 'اختر "إضافة متجر Shantaweb"', 'أدخل بيانات حسابك في Shantaweb', 'فعّل الربط من لوحة Shantaweb', 'استمتع بإدارة Deema الذكية'],
    features: ['إدارة الطلبات المصرية', 'تكامل شحن محلي', 'بوابات الدفع المصرية', 'دعم العملة المصرية'],
  },
  {
    emoji: '📘',
    name: 'Facebook & Instagram',
    tagline: 'البيع عبر Meta Commerce Platform',
    desc: 'فيسبوك وإنستغرام يستخدمان نفس منصة Meta Commerce. اربط صفحتك بـ Deema لإدارة طلبات الفيسبوك والإنستغرام من مكان واحد بالكامل.',
    steps: [
      'افتح Meta Business Suite على business.facebook.com',
      'اذهب إلى: الإعدادات ← حسابات ← الصفحات',
      'اختر صفحتك وافتح إعدادات Commerce',
      'اذهب إلى: الإعدادات المتقدمة ← رموز الوصول',
      'أنشئ System User Token بصلاحية manage_pages وانسخه في Deema',
    ],
    features: ['إدارة طلبات فيسبوك وإنستغرام', 'تحديث حالة الشحن تلقائياً', 'إلغاء الطلبات من Deema', 'مزامنة بيانات العملاء'],
  },
  {
    emoji: '🎵',
    name: 'TikTok Shop',
    tagline: 'البيع عبر متجر تيك توك',
    desc: 'TikTok Shop منصة تجارة إلكترونية سريعة النمو. اربط متجرك بـ Deema وادر طلبات TikTok مع باقي متاجرك من لوحة واحدة.',
    steps: [
      'افتح TikTok Seller Center على seller.tiktok.com',
      'اذهب إلى: My Account ← Developer',
      'اضغط "Apply for API Access"',
      'بعد الموافقة اذهب إلى: API Management ← Access Token',
      'انسخ الـ Access Token والـ Shop ID والصقهما في Deema',
    ],
    features: ['إدارة طلبات TikTok Shop', 'إنشاء شحنات تلقائياً', 'إلغاء الطلبات من Deema', 'مزامنة حالة الطلبات'],
  },
  {
    emoji: '🛒',
    name: 'Salla — سلة',
    tagline: 'منصة التجارة الإلكترونية السعودية الرائدة',
    desc: 'سلة منصة التجارة الإلكترونية الأكثر انتشاراً في المملكة العربية السعودية. اربط متجرك على سلة بـ Deema وادر طلباتك السعودية بالكامل بالعربية.',
    steps: [
      'افتح لوحة تحكم سلة على salla.com',
      'اذهب إلى: التطبيقات ← مطوري سلة',
      'اضغط "إنشاء تطبيق جديد" واختر Private App',
      'فعّل الصلاحيات: الطلبات، المنتجات، الشحن',
      'انسخ Access Token والصقه في Deema',
    ],
    features: ['مزامنة طلبات سلة تلقائياً', 'تحديث حالة الشحن', 'إلغاء الطلبات من Deema', 'دعم العملة السعودية'],
  },
  {
    emoji: '🏬',
    name: 'Zid — زد',
    tagline: 'منصة التجارة الإلكترونية السعودية المتكاملة',
    desc: 'زد منصة سعودية متكاملة للتجارة الإلكترونية تخدم آلاف التجار. اربط متجرك على زد بـ Deema واستمتع بإدارة ذكية بالكامل.',
    steps: [
      'افتح لوحة تحكم زد على zid.sa',
      'اذهب إلى: الإعدادات ← واجهة برمجة التطبيقات',
      'اضغط "إنشاء رمز وصول جديد"',
      'فعّل الصلاحيات: إدارة الطلبات، المنتجات',
      'انسخ Manager Token والصقه في Deema',
    ],
    features: ['مزامنة طلبات زد تلقائياً', 'تتبع الشحنات', 'إلغاء الطلبات من Deema', 'دعم متجر زد الكامل'],
  },
]

export default function Platforms() {
  return (
    <div dir="rtl" style={{ background: 'var(--canvas)', color: 'var(--ink)', minHeight: '100vh' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--hairline)',
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
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 16 }}>المنصات المدعومة</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>اربط متجرك في دقائق — بدون خبرة تقنية</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {platforms.map(p => (
            <div key={p.name} style={{ background: 'var(--canvas-soft)', borderRadius: 20, padding: '32px', border: '1px solid var(--hairline)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 40 }}>{p.emoji}</div>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 4 }}>{p.name}</h2>
                  <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{p.tagline}</p>
                </div>
              </div>

              <p style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 24 }}>{p.desc}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>خطوات الربط</h3>
                  <ol style={{ paddingRight: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {p.steps.map((s, i) => (
                      <li key={i} style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{s}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>ما تحصل عليه</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {p.features.map(f => (
                      <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Check size={14} color="#22c55e" strokeWidth={2.5} />
                        <span style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link to="/onboarding" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>ابدأ الربط الآن</Link>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--hairline)', padding: '24px 30px', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>© Deema 2025</span>
      </footer>
    </div>
  )
}
