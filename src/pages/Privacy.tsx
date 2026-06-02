import { Link } from 'react-router-dom'

const sections = [
  {
    title: 'مقدمة',
    content: 'تلتزم Deema بحماية خصوصيتك وبياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع بياناتك واستخدامها وحمايتها عند استخدامك لخدماتنا. باستخدامك لـ Deema، فأنت توافق على الشروط الواردة في هذه السياسة.',
  },
  {
    title: 'البيانات التي نجمعها',
    content: `نجمع البيانات التالية لتقديم خدماتنا:

• **بيانات الحساب**: الاسم، البريد الإلكتروني، رقم الهاتف
• **بيانات المتجر**: معلومات المتجر الإلكتروني والمنتجات والطلبات
• **بيانات الاستخدام**: كيفية تفاعلك مع Deema ومحادثاتك
• **البيانات التقنية**: عنوان IP، نوع المتصفح، نظام التشغيل
• **بيانات الدفع**: معلومات الاشتراك (لا نحتفظ ببيانات البطاقات)`,
  },
  {
    title: 'كيف نستخدم بياناتك',
    content: `نستخدم بياناتك للأغراض التالية:

• تقديم خدمات Deema وتحسينها
• معالجة وإدارة طلبات متجرك
• إرسال إشعارات وتحديثات الخدمة
• تحليل أنماط الاستخدام لتحسين التجربة
• الاستجابة لطلبات الدعم الفني
• الامتثال للمتطلبات القانونية`,
  },
  {
    title: 'مشاركة البيانات مع أطراف ثالثة',
    content: `لا نبيع بياناتك لأي طرف ثالث. قد نشارك بياناتك في الحالات التالية:

• **مزودو الخدمات**: شركاء تقنيون (مثل خدمات الشحن) لتقديم الخدمة
• **المتطلبات القانونية**: إذا طُلب منا قانونياً الكشف عن البيانات
• **حماية الحقوق**: لحماية حقوق ومصالح Deema أو مستخدميها
• **الاندماج**: في حالة الاستحواذ، تنتقل البيانات للكيان الجديد مع إشعارك`,
  },
  {
    title: 'حماية البيانات',
    content: `نتخذ إجراءات أمنية صارمة لحماية بياناتك:

• تشفير البيانات أثناء النقل باستخدام TLS 1.3
• تشفير البيانات المخزنة باستخدام AES-256
• تحكم صارم في الوصول للبيانات داخل الفريق
• مراجعات أمنية منتظمة واختبارات الاختراق
• النسخ الاحتياطي اليومي للبيانات`,
  },
  {
    title: 'حقوقك',
    content: `لديك الحقوق التالية بخصوص بياناتك:

• **حق الوصول**: طلب نسخة من بياناتك الشخصية
• **حق التصحيح**: تصحيح أي بيانات غير دقيقة
• **حق الحذف**: طلب حذف بياناتك ("الحق في النسيان")
• **حق النقل**: استلام بياناتك بصيغة قابلة للنقل
• **حق الاعتراض**: الاعتراض على معالجة بياناتك

لممارسة أي من هذه الحقوق، تواصل معنا على: privacy@deema.ai`,
  },
  {
    title: 'الاحتفاظ بالبيانات',
    content: 'نحتفظ بياناتك طوال مدة اشتراكك النشط. بعد إلغاء الاشتراك، نحتفظ بالبيانات لمدة ٩٠ يوماً ثم نحذفها نهائياً، إلا إذا طلبت الحذف الفوري أو اشترطت ذلك متطلبات قانونية.',
  },
  {
    title: 'التغييرات على هذه السياسة',
    content: 'قد نحدّث سياسة الخصوصية من وقت لآخر. سنبلغك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار داخل التطبيق. استمرارك في استخدام Deema بعد التحديث يعني موافقتك على السياسة الجديدة.',
  },
  {
    title: 'التواصل معنا',
    content: 'لأي أسئلة أو مخاوف بخصوص خصوصيتك، تواصل معنا:\n\nالبريد الإلكتروني: privacy@deema.ai\nالعنوان: القاهرة، مصر',
  },
]

export default function Privacy() {
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
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 12 }}>سياسة الخصوصية</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>آخر تحديث: ١ مارس ٢٠٢٥</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {sections.map((s, i) => (
            <div key={i}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, letterSpacing: '-0.3px' }}>{s.title}</h2>
              <p style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.content}</p>
              {i < sections.length - 1 && <div style={{ height: 1, background: 'var(--hairline-soft)', marginTop: 40 }} />}
            </div>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--hairline-soft)', padding: '24px 30px', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>© Deema 2025</span>
      </footer>
    </div>
  )
}
