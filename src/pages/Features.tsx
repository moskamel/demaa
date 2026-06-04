import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { Box, Truck, ChartSquare, People, Tag, ShieldTick, Flash, Global, Notification, DocumentText, Setting2, MessageText1 } from 'iconsax-react'

const features = [
  {
    icon: Box,
    title: 'إدارة الطلبات',
    desc: 'اقبل وارفض وتابع طلباتك بجملة واحدة. Deema يتعامل مع الطلبات الجديدة والمعلقة والمكتملة فورياً.',
    example: 'اقبل كل الطلبات الجديدة',
  },
  {
    icon: Truck,
    title: 'الشحن الذكي',
    desc: 'ينشئ بوالص الشحن تلقائياً مع أرامكس وSMSA وJ&T. يتابع حالة الشحنات ويبلغك بأي تأخير.',
    example: 'أنشئ بوليصة شحن لطلب #١٢٣',
  },
  {
    icon: ChartSquare,
    title: 'تقارير متقدمة',
    desc: 'ملخص يومي وأسبوعي وشهري — مبيعات ومخزون وعملاء ومشاكل. كل شيء في مكان واحد بمخططات واضحة.',
    example: 'أعطني ملخص مبيعات الأسبوع',
  },
  {
    icon: People,
    title: 'إدارة الفريق',
    desc: 'أضف أعضاء الفريق وحدد صلاحياتهم. كل عضو يرى فقط ما يحتاجه — مدير أو محرر أو قارئ.',
    example: 'أضف سارة كمحررة للطلبات',
  },
  {
    icon: Tag,
    title: 'الكوبونات',
    desc: 'أنشئ وأدر كوبونات الخصم والعروض الخاصة. تتبع الاستخدام وقيّم أداء كل حملة ترويجية.',
    example: 'أنشئ كوبون خصم ١٠٪ لرمضان',
  },
  {
    icon: ShieldTick,
    title: 'الأمان',
    desc: 'كل إجراء جماعي يطلب تأكيداً صريحاً. لا تنفيذ مالي بدون موافقتك. بياناتك مشفرة بالكامل.',
    example: 'راجع قبل تأكيد أي إجراء جماعي',
  },
  {
    icon: Flash,
    title: 'تنفيذ فوري',
    desc: 'يتصرف Deema في ثوانٍ — لا انتظار، لا تعقيد. اكتب ما تريد واحصل على النتيجة فورياً.',
    example: 'تابع حالة الشحن لطلب #٤٥٦',
  },
  {
    icon: Global,
    title: '١٤ منصة',
    desc: 'Shopify وسلة وزد وأمازون ونون وجوميا والمزيد — ربط سريع بدون خبرة تقنية أو مطور.',
    example: 'ربط متجر Shopify في دقيقتين',
  },
  {
    icon: Notification,
    title: 'إشعارات ذكية',
    desc: 'يبلغك بالطلبات الجديدة والمشاكل والتحديثات المهمة على واتساب أو الإيميل في الوقت الصح.',
    example: 'أرسل إشعار لكل طلب جديد',
  },
  {
    icon: DocumentText,
    title: 'فواتير تلقائية',
    desc: 'يصدر الفواتير والإيصالات تلقائياً ويرسلها للعملاء بالبريد الإلكتروني بدون أي تدخل منك.',
    example: 'أرسل الفاتورة لعميل طلب #٧٨٩',
  },
  {
    icon: Setting2,
    title: 'إعدادات مرنة',
    desc: 'خصّص Deema حسب احتياجات متجرك — لغة، عملة، ساعات عمل، تنبيهات، وأكثر.',
    example: 'غيّر العملة للريال السعودي',
  },
  {
    icon: MessageText1,
    title: 'دعم عربي',
    desc: 'فريق دعم عربي متاح السبت–الخميس. نرد في أقل من ساعة. نتكلم لغتك ونفهم مشكلتك.',
    example: 'تواصل مع الدعم بالعربي فوراً',
  },
]

export default function Features() {
  return (
    <PageLayout>
      <main style={{ padding: '64px 200px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #6a4cf5, #d44df0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            المميزات
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 20, lineHeight: 1.15 }}>
            كل ما يحتاجه متجرك
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            اكتب جملة واحدة بالعربي — Deema يتفهم ويتصرف. لا أوامر معقدة، لا دورات تدريبية، لا وقت ضائع.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 80 }}>
          {features.map(({ icon: Icon, title, desc, example }) => (
            <div key={title} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6a4cf522, #d44df022)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, flexShrink: 0 }}>
                <Icon size={22} color="#6a4cf5" variant="Outline" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.3px' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{desc}</p>
              <div style={{ background: 'var(--canvas)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--hairline)' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-muted)', fontFamily: 'monospace' }}>مثال: </span>
                <span style={{ fontSize: 12, color: 'var(--ink)', fontFamily: 'monospace' }}>{example}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Closing CTA */}
        <div style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', borderRadius: 20, padding: '56px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>ابدأ الآن</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 16 }}>جرّب كل الميزات مجاناً</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
            لا بطاقة ائتمان. لا إعداد معقد. ابدأ في أقل من دقيقتين.
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
