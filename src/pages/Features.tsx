import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageLayout from '../components/PageLayout'
import { Box, Truck, ChartSquare, People, Tag, ShieldTick, Flash, Global, Notification, DocumentText, Setting2, MessageText1, ArrowLeft2 } from 'iconsax-react'

const T = {
  ink: '#f0f0f5',
  slate: '#9090a2',
  hairline: 'rgba(255,255,255,0.08)',
  muted: '#5e5e72',
  surface: '#18181e',
  purple: '#6a4cf5',
  pink: '#d44df0',
}

const FEATURES = [
  {
    icon: Box,
    title: 'إدارة الطلبات',
    desc: 'اقبل وارفض وتابع طلباتك بجملة واحدة. ديما تتعامل مع الطلبات الجديدة والمعلقة والمكتملة فورياً.',
    example: '"اقبل كل الطلبات الجديدة"',
    color: '#ff7a3d',
  },
  {
    icon: Flash,
    title: 'شحن ذكي وتلقائي',
    desc: 'تنشئ بوالص الشحن تلقائياً وتتابع حالة الشحنات وتبلغك بأي تأخير — كل هذا بثوانٍ.',
    example: '"اشحن الطلبات المقبولة"',
    color: '#e05555',
  },
  {
    icon: ChartSquare,
    title: 'تقارير متقدمة',
    desc: 'ملخص يومي وأسبوعي وشهري — مبيعات ومخزون وعملاء ومشاكل. كل شيء في مكان واحد.',
    example: '"أعطني ملخص مبيعات الأسبوع"',
    color: '#1ab8ae',
  },
  {
    icon: People,
    title: 'إدارة الفريق',
    desc: 'أضف أعضاء الفريق وحدد صلاحياتهم بدقة. كل عضو يرى فقط ما يحتاجه — مدير أو محرر أو قارئ.',
    example: '"أضف سارة كمحررة للطلبات"',
    color: '#d44df0',
  },
  {
    icon: Tag,
    title: 'الكوبونات والعروض',
    desc: 'أنشئ وأدر كوبونات الخصم والعروض الخاصة. تتبع الاستخدام وقيّم أداء كل حملة ترويجية.',
    example: '"أنشئ كوبون خصم ١٠٪ لرمضان"',
    color: '#22c55e',
  },
  {
    icon: ShieldTick,
    title: 'أمان كامل',
    desc: 'كل إجراء جماعي يطلب تأكيداً صريحاً منك. لا تنفيذ مالي بدون موافقتك. بياناتك مشفرة بالكامل.',
    example: '"راجع قبل تأكيد أي إجراء جماعي"',
    color: '#22c55e',
  },
  {
    icon: Global,
    title: '٧ منصات مدعومة',
    desc: 'Shopify، Wuilt، Shantaweb، WooCommerce، BigCommerce، Wix، Ecwid — ربط سريع بدون خبرة تقنية.',
    example: '"ربط متجر Shopify في دقيقتين"',
    color: T.purple,
  },
  {
    icon: Notification,
    title: 'إشعارات فورية',
    desc: 'تبلغك بالطلبات الجديدة والمشاكل والتحديثات المهمة فور حدوثها — لا شيء يفوتك.',
    example: '"أرسل إشعار لكل طلب جديد"',
    color: '#f59e0b',
  },
  {
    icon: DocumentText,
    title: 'فواتير تلقائية',
    desc: 'تصدر الفواتير والإيصالات تلقائياً وترسلها للعملاء بالبريد الإلكتروني بدون أي تدخل منك.',
    example: '"أرسل الفاتورة لعميل طلب #٧٨٩"',
    color: '#0099ff',
  },
  {
    icon: MessageText1,
    title: 'يفهم كل اللهجات',
    desc: 'مصري، سعودي، خليجي — كلهم يشتغلون. اكتب بأي طريقة وديما تفهمك على الفور.',
    example: '"وريني الطلبات المعلقة"',
    color: '#ff0080',
  },
  {
    icon: Setting2,
    title: 'إعدادات مرنة',
    desc: 'خصّص ديما حسب احتياجات متجرك — لغة، عملة، ساعات عمل، تنبيهات، وأكثر.',
    example: '"غيّر العملة للريال السعودي"',
    color: T.slate,
  },
  {
    icon: Truck,
    title: 'تتبع الشحنات',
    desc: 'تتابع حالة كل شحنة في الوقت الفعلي وترسل رقم التتبع للعميل تلقائياً فور إنشاء البوليصة.',
    example: '"تابع حالة شحنة طلب #٤٥٦"',
    color: '#ff7a3d',
  },
]

export default function Features() {
  return (
    <PageLayout>
      <main style={{ padding: '72px 200px 96px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.purple, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>المميزات</p>
          <h1 style={{ fontSize: 'clamp(38px,5vw,60px)', fontWeight: 800, letterSpacing: '-2px', marginBottom: 20, lineHeight: 1.1, color: T.ink }}>
            كل ما يحتاجه متجرك<br />
            <span style={{ background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>في مكان واحد</span>
          </h1>
          <p style={{ fontSize: 17, color: T.slate, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            اكتب جملة واحدة بالعربي — ديما تفهم وتتصرف. لا أوامر معقدة، لا وقت ضائع.
          </p>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 72 }}>
          {[
            { value: '١٢', label: 'ميزة رئيسية', color: T.purple },
            { value: '٧', label: 'منصة مدعومة', color: '#22c55e' },
            { value: '٢+', label: 'مليون طلب معالج', color: '#ff7a3d' },
            { value: '< ٢ث', label: 'وقت الاستجابة', color: '#0099ff' },
          ].map(s => (
            <div key={s.label} style={{ background: T.surface, borderRadius: 16, padding: '22px 20px', border: `1px solid ${T.hairline}`, textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, letterSpacing: '-1px', marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: T.slate }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 80 }}>
          {FEATURES.map(({ icon: Icon, title, desc, example, color }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.4 }}
              whileHover={{ y: -5, borderColor: `${color}33`, boxShadow: '0 20px 48px rgba(0,0,0,0.35)' }}
              style={{ background: T.surface, borderRadius: 18, padding: '26px 24px', border: `1px solid ${T.hairline}`, display: 'flex', flexDirection: 'column', cursor: 'default', transition: 'border-color 0.2s' }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <Icon size={22} color={color} variant="Outline" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.3px', color: T.ink }}>{title}</h3>
              <p style={{ fontSize: 14, color: T.slate, lineHeight: 1.65, marginBottom: 18, flex: 1 }}>{desc}</p>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 9, padding: '9px 12px', border: `1px solid ${T.hairline}` }}>
                <span style={{ fontSize: 11, color: T.muted, fontFamily: 'monospace' }}>مثال: </span>
                <span style={{ fontSize: 12, color: T.slate, fontFamily: 'monospace' }}>{example}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg,rgba(106,76,245,0.15),rgba(212,77,240,0.08))', borderRadius: 28, padding: '64px 48px', border: '1px solid rgba(106,76,245,0.25)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(106,76,245,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: T.ink, letterSpacing: '-1.5px', marginBottom: 14, position: 'relative' }}>جرّب كل الميزات مجاناً</h2>
          <p style={{ fontSize: 16, color: T.slate, maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.6, position: 'relative' }}>
            لا بطاقة ائتمان. لا إعداد معقد. ابدأ في أقل من دقيقتين.
          </p>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', borderRadius: 9999, padding: '15px 36px', fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 32px rgba(106,76,245,0.4)', position: 'relative' }}>
            ابدأ مجاناً الآن <ArrowLeft2 size={16} variant="Outline" />
          </Link>
        </div>

      </main>
    </PageLayout>
  )
}
