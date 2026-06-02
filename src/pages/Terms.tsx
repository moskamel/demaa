import { Link } from 'react-router-dom'

const sections = [
  {
    title: 'القبول بالشروط',
    content: 'باستخدامك لـ Deema، فأنت توافق على هذه الشروط وتلتزم بها. إذا كنت تستخدم Deema نيابةً عن شركة أو منظمة، فأنت تؤكد أن لديك الصلاحية لقبول هذه الشروط باسمها.',
  },
  {
    title: 'وصف الخدمة',
    content: 'Deema هو مساعد ذكاء اصطناعي متخصص في إدارة التجارة الإلكترونية. تتضمن الخدمة إدارة الطلبات والشحن والتقارير والتحليلات عبر محادثة طبيعية بالعربي. نحتفظ بحق تعديل أو إيقاف أي جزء من الخدمة في أي وقت.',
  },
  {
    title: 'الاستخدام المقبول',
    content: `يُسمح لك باستخدام Deema لأغراض تجارية مشروعة فقط. يحق لك:

• إدارة متاجرك الإلكترونية الخاصة
• دعوة أعضاء فريقك للعمل معك
• استخدام API الخاص بـ Deema ضمن حدود الخطة
• تصدير بياناتك الخاصة`,
  },
  {
    title: 'الأفعال المحظورة',
    content: `يُحظر عليك تمامًا:

• انتهاك أي قوانين أو لوائح سارية
• نشر محتوى مسيء أو مضلل أو غير قانوني
• محاولة الوصول غير المصرح به لأنظمتنا
• عكس هندسة البرامج أو تفكيكها
• استخدام Deema لتجاوز قيود منصات التجارة الإلكترونية
• بيع أو تأجير حسابك لأطراف أخرى
• إرسال رسائل مزعجة (Spam) عبر المنصة`,
  },
  {
    title: 'الملكية الفكرية',
    content: 'جميع حقوق الملكية الفكرية في Deema — بما فيها الكود المصدري والتصميم والعلامة التجارية — ملك حصري لشركة Deema. لا يُمنح لك أي حق في استخدام علاماتنا التجارية أو شعاراتنا بدون إذن كتابي مسبق.',
  },
  {
    title: 'بيانات المستخدم',
    content: 'تبقى ملكية بياناتك لك تماماً. نحن لا ندّعي أي ملكية على بيانات متجرك أو عملائك. بتحميلك لأي بيانات، تمنحنا رخصة محدودة لمعالجتها لأغراض تقديم الخدمة فقط.',
  },
  {
    title: 'إخلاء المسؤولية',
    content: 'تُقدَّم خدمة Deema "كما هي" دون ضمانات من أي نوع. لا نضمن أن الخدمة ستكون خالية من الأخطاء أو متاحة في جميع الأوقات. لن نكون مسؤولين عن أي خسائر غير مباشرة أو تبعية ناتجة عن استخدام الخدمة.',
  },
  {
    title: 'حد المسؤولية',
    content: 'في جميع الأحوال، لا تتجاوز مسؤوليتنا تجاهك المبلغ الذي دفعته لنا خلال الثلاثة أشهر السابقة لحادثة المطالبة.',
  },
  {
    title: 'إنهاء الخدمة',
    content: 'يحق لك إنهاء حسابك في أي وقت من إعدادات الحساب. يحق لنا تعليق أو إنهاء حسابك إذا انتهكت هذه الشروط، مع إشعار مسبق كلما أمكن ذلك.',
  },
  {
    title: 'القانون المطبق',
    content: 'تخضع هذه الشروط لقوانين جمهورية مصر العربية. تُحسم أي نزاعات أمام محاكم القاهرة المختصة.',
  },
  {
    title: 'التواصل',
    content: 'للأسئلة القانونية: legal@deema.ai\nالعنوان: القاهرة، مصر',
  },
]

export default function Terms() {
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
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 12 }}>شروط الاستخدام</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>آخر تحديث: ١ مارس ٢٠٢٥</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {sections.map((s, i) => (
            <div key={i}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, letterSpacing: '-0.3px' }}>{i + 1}. {s.title}</h2>
              <p style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.content}</p>
              {i < sections.length - 1 && <div style={{ height: 1, background: 'var(--hairline)', marginTop: 40 }} />}
            </div>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--hairline)', padding: '24px 30px', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>© Deema 2025</span>
      </footer>
    </div>
  )
}
