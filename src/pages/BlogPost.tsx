import { useParams, useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { ArrowLeft2 } from 'iconsax-react'

const POSTS: Record<string, {
  slug: string
  title: string
  date: string
  category: string
  categoryColor: string
  readTime: string
  author: string
  authorRole: string
  excerpt: string
  content: Section[]
}> = {
  '1': {
    slug: '1',
    title: '٥ طرق لتسريع إدارة طلبات متجرك الإلكتروني',
    date: '٢٠ مايو ٢٠٢٥',
    category: 'إدارة الطلبات',
    categoryColor: '#6a4cf5',
    readTime: '٥ دقائق',
    author: 'فريق ديما',
    authorRole: 'خبراء التجارة الإلكترونية',
    excerpt: 'التجار الناجحون يعرفون أن سرعة معالجة الطلبات تعني رضا العملاء وتكرار الشراء.',
    content: [
      { type: 'intro', text: 'في عالم التجارة الإلكترونية، الوقت يساوي مال. كل تأخير في معالجة الطلب يعني عميلاً قد لا يعود. الدراسات تُثبت أن ٨٠٪ من المتسوقين يتوقعون تأكيد طلبهم خلال ساعة، و٦٠٪ يغيّرون رأيهم إذا تأخر الشحن.' },
      { type: 'heading', text: '١. اعتمد نظام قبول تلقائي للطلبات الآمنة' },
      { type: 'text', text: 'الطلبات منخفضة المخاطر — مثل العملاء المتكررين والدفع بالبطاقة — يمكن قبولها تلقائياً دون مراجعة يدوية. ديما تحسب درجة المخاطرة لكل طلب وتُبيّن لك أيها يحتاج مراجعة وأيها آمن للقبول الفوري.' },
      { type: 'tip', text: 'نصيحة: الطلبات التي تأتي من عملاء سبق أن اشتروا أكثر من مرتين ودفعوا بالبطاقة — قبّلها تلقائياً. خطرها شبه معدوم.' },
      { type: 'heading', text: '٢. جمّع الطلبات في دُفعات ووزّع المهام' },
      { type: 'text', text: 'بدل ما تعالج كل طلب على حدة، جمّع الطلبات القادمة في فترات محددة (كل ٢ساعة مثلاً) ووزّع العمل على الفريق. الجدولة تُقلل الإجهاد وترفع الكفاءة بنسبة ٤٠٪ مقارنة بالمعالجة الفردية.' },
      { type: 'heading', text: '٣. ضع قوالب جاهزة للردود الشائعة' },
      { type: 'text', text: '"طلبك قيد التوصيل" — "تأخرنا معاك، إليك كوبون خصم" — "طلبك وصل، كيف تقيّم تجربتك؟". هذه الرسائل تُرسَل يدوياً بضغطة واحدة بدل كتابتها في كل مرة.' },
      { type: 'heading', text: '٤. تتبع الشحنات في مكان واحد' },
      { type: 'text', text: 'ربط حسابك مع شركة الشحن مباشرةً يعني أنك تعرف أين كل طلب في لحظته — دون دخول للوحات متعددة. وعند تأخر شحنة، تعرف فوراً لتتواصل مع العميل قبل أن يتواصل هو.' },
      { type: 'heading', text: '٥. راجع الأرقام أسبوعياً' },
      { type: 'text', text: 'كم طلب استغرق أكثر من ٢٤ ساعة للقبول؟ كم طلب COD لم يُسلَّم؟ كم عميل طلب بضاعة نافدة؟ هذه الأرقام تكشف أين الاختناقات وتُساعدك تُصلحها قبل أن تتراكم.' },
      { type: 'cta', text: 'جرّب ديما مجاناً وابدأ بأتمتة طلباتك اليوم' },
    ],
  },
  '2': {
    slug: '2',
    title: 'كيف تختار شركة الشحن المناسبة لمتجرك',
    date: '١٠ مايو ٢٠٢٥',
    category: 'الشحن',
    categoryColor: '#ff7a3d',
    readTime: '٧ دقائق',
    author: 'فريق ديما',
    authorRole: 'خبراء التجارة الإلكترونية',
    excerpt: 'أرامكس أم SMSA أم J&T؟ الإجابة تعتمد على حجم شحناتك ومناطقك المستهدفة وميزانيتك.',
    content: [
      { type: 'intro', text: 'اختيار شركة الشحن الخطأ يكلّفك عملاء، أموال، وسمعة. شركة ممتازة لمتجر في الرياض قد تكون سيئة لمتجر يُشحن للمناطق النائية. هذا الدليل يُساعدك تأخذ القرار الصح بناءً على طبيعة متجرك.' },
      { type: 'heading', text: 'أولاً: حدّد احتياجاتك قبل المقارنة' },
      { type: 'text', text: 'قبل ما تقارن أسعار، اسأل نفسك:\n• هل شحنك محلي داخل المدينة أم بين المدن؟\n• ما متوسط وزن منتجاتك؟\n• هل تحتاج خيار الدفع عند الاستلام (COD)؟\n• كم طلب تشحن شهرياً؟' },
      { type: 'heading', text: 'أرامكس — للتجار المتوسطين والكبار' },
      { type: 'text', text: 'أرامكس تُغطي كل المملكة وتدعم COD بكفاءة. مناسبة إذا كنت تشحن ٢٠٠+ طلب شهرياً لأن أسعارها تنافسية عند الحجم. نظام التتبع ممتاز وخدمة العملاء متاحة ٢٤/٧.' },
      { type: 'heading', text: 'SMSA — موثوقية وانتشار واسع' },
      { type: 'text', text: 'SMSA لها أكبر شبكة توصيل في السعودية وتُغطي المناطق النائية التي لا تصلها شركات أخرى. أسعارها معقولة للشحن الصغير، ومواعيد التسليم دقيقة.' },
      { type: 'heading', text: 'J&T — الأسرع للشحن الداخلي' },
      { type: 'text', text: 'J&T تتخصص في السرعة — كثير من الطلبات تُسلَّم في نفس اليوم داخل المدن الكبرى. مناسبة للمنتجات التي يحتاجها العميل بسرعة.' },
      { type: 'tip', text: 'نصيحة: لا تعتمد على شركة واحدة. ارتبط بشركتين وحوّل الطلبات المتأخرة تلقائياً للبديل.' },
      { type: 'heading', text: 'كيف تتابع أداء شركة الشحن؟' },
      { type: 'text', text: 'راقب هذه المؤشرات شهرياً:\n• نسبة الطلبات المُسلَّمة في الموعد\n• نسبة الطلبات المُعادة\n• متوسط وقت التوصيل\n• نسبة شكاوى العملاء عن الشحن\n\nديما تُجمع هذه البيانات تلقائياً وتعرضها في لوحة التحكم.' },
      { type: 'cta', text: 'اربط شركة الشحن بديما وتابع كل الطلبات في مكان واحد' },
    ],
  },
  '3': {
    slug: '3',
    title: 'الذكاء الاصطناعي في التجارة الإلكترونية العربية — أين نحن؟',
    date: '١ مايو ٢٠٢٥',
    category: 'الذكاء الاصطناعي',
    categoryColor: '#22c55e',
    readTime: '٨ دقائق',
    author: 'فريق ديما',
    authorRole: 'خبراء التجارة الإلكترونية',
    excerpt: 'شهد ٢٠٢٥ تحولاً كبيراً في كيفية استخدام التجار العرب للذكاء الاصطناعي.',
    content: [
      { type: 'intro', text: '٢٠٢٥ كان عام التحول الحقيقي للذكاء الاصطناعي في التجارة الإلكترونية العربية. ما كان حكراً على الشركات الكبرى أصبح في متناول أي تاجر بميزانية صغيرة.' },
      { type: 'heading', text: 'من أين نحن اليوم؟' },
      { type: 'text', text: 'وفق دراسة حديثة، ٣٥٪ فقط من التجار العرب يستخدمون أي شكل من أشكال الذكاء الاصطناعي في أعمالهم. المقارنة مع أسواق آسيا الشرقية (٧٢٪) تكشف الفجوة الكبيرة — لكنها أيضاً تكشف الفرصة الهائلة.' },
      { type: 'heading', text: 'ما الذي يستخدمه التجار فعلاً؟' },
      { type: 'text', text: '• روبوتات المحادثة: لرد أسئلة العملاء الشائعة ٢٤/٧\n• تحليل المخزون: التنبؤ بالطلب وتجنب النفاد\n• اكتشاف الاحتيال: فحص الطلبات المشبوهة تلقائياً\n• التسعير الديناميكي: تعديل الأسعار بناءً على المنافسة والطلب' },
      { type: 'heading', text: 'التحديات الخاصة بالسوق العربي' },
      { type: 'text', text: 'اللغة العربية لا تزال تُشكّل تحدياً — كثير من نماذج الذكاء الاصطناعي أُدرِّبت على بيانات إنجليزية أو صينية، وأداؤها بالعربية أضعف. هذا يجعل الحلول المبنية أصلاً للسوق العربي — كديما — أكثر قيمة.' },
      { type: 'tip', text: 'ديما مبنية على نماذج مُدرَّبة على البيانات العربية وتفهم اللهجات الخليجية والمصرية.' },
      { type: 'heading', text: 'ما المتوقع في ٢٠٢٦؟' },
      { type: 'text', text: 'التوجه العالمي يُشير إلى:\n• AI وكلاء (Agents) تُنفذ مهام كاملة دون تدخل بشري\n• تخصيص تجربة التسوق لكل عميل بشكل فردي\n• تحليل المشاعر لفهم رضا العملاء من المحادثات\n• ربط المخازن بالمنصات تلقائياً وتحديث المخزون لحظياً' },
      { type: 'cta', text: 'جرّب ديما — المساعد الذكي المبني خصيصاً للتاجر العربي' },
    ],
  },
  '4': {
    slug: '4',
    title: '٣ استراتيجيات مجربة لزيادة مبيعاتك هذا الشهر',
    date: '١٥ مايو ٢٠٢٥',
    category: 'زيادة المبيعات',
    categoryColor: '#22c55e',
    readTime: '٦ دقائق',
    author: 'فريق ديما',
    authorRole: 'خبراء التجارة الإلكترونية',
    excerpt: 'سواء كنت تبيع على سلة أو زد أو أمازون، هناك ٣ استراتيجيات تزيد مبيعاتك ٣٠٪ في أقل من شهر.',
    content: [
      { type: 'intro', text: 'زيادة المبيعات لا تعني دائماً إنفاق أكثر على الإعلانات. كثير من التجار الناجحين يُحققون نمواً بتحسين ما لديهم بدل شراء حركة زيارات جديدة.' },
      { type: 'heading', text: 'الاستراتيجية الأولى: استعد العميل الغائب' },
      { type: 'text', text: 'العميل الذي اشترى منذ ٩٠ يوم ولم يعد — هذا هو أسهل هدف. تكلفة استعادته أقل بـ٥ مرات من اكتساب عميل جديد. أرسل له رسالة شخصية مع خصم صغير (١٠٪ تكفي) وستُفاجأ بالنتيجة.' },
      { type: 'tip', text: 'ديما تُحدد تلقائياً العملاء "في خطر" و"الغائبين" ويمكنك التواصل معهم بضغطة واحدة.' },
      { type: 'heading', text: 'الاستراتيجية الثانية: الترقية عند الدفع (Upsell)' },
      { type: 'text', text: 'حين يضع العميل المنتج في السلة، اقترح عليه منتجاً مكملاً. "عملاء اشتروا هذا المنتج اشتروا أيضاً..." — هذه الجملة تزيد متوسط قيمة الطلب بنسبة ١٥-٢٥٪.' },
      { type: 'heading', text: 'الاستراتيجية الثالثة: الكوبونات الذكية' },
      { type: 'text', text: 'بدل خصومات عامة، أنشئ كوبونات مستهدفة:\n• كوبون للعميل الأول فقط\n• كوبون للطلبات فوق ٣٠٠ ريال\n• كوبون لفئة محددة من المنتجات\n\nالكوبونات المستهدفة تُحوّل أكثر بكثير من الخصومات العامة.' },
      { type: 'cta', text: 'أنشئ كوبوناتك الذكية الآن في لوحة ديما' },
    ],
  },
  '5': {
    slug: '5',
    title: 'مقارنة منصات التجارة الإلكترونية: سلة أم زد أم Shopify؟',
    date: '١٨ أبريل ٢٠٢٥',
    category: 'منصات التجارة',
    categoryColor: '#d44df0',
    readTime: '١٠ دقائق',
    author: 'فريق ديما',
    authorRole: 'خبراء التجارة الإلكترونية',
    excerpt: 'اخترت المنصة الخطأ؟ مشكلة شائعة تكلّف التجار وقتاً ومالاً. هذه المقارنة الشاملة تساعدك تختار بثقة.',
    content: [
      { type: 'intro', text: 'اختيار المنصة قرار مصيري — تغييره لاحقاً يعني نقل المنتجات، العملاء، والإعدادات. خذ وقتك في القرار الأول.' },
      { type: 'heading', text: 'سلة — الأفضل للتجار السعوديين المبتدئين' },
      { type: 'text', text: 'سلة صُممت للسوق السعودي بالكامل: دعم كامل لسداد ومدى، تكاملات مع شركات الشحن المحلية، واجهة عربية سلسة. إذا بدأت من الصفر وسوقك المملكة العربية السعودية — سلة هي الاختيار الطبيعي.' },
      { type: 'heading', text: 'زد — للتجار الخليجيين الطموحين' },
      { type: 'text', text: 'زد قوية في التكاملات والتخصيص. تدعم عملات متعددة وأسواق عدة. مناسبة إذا كنت تُخطط للتوسع في الخليج أو تحتاج تحكماً أكبر في تجربة المستخدم.' },
      { type: 'heading', text: 'Shopify — للتوسع العالمي' },
      { type: 'text', text: 'Shopify هي الأقوى تقنياً والأوسع في التكاملات — آلاف التطبيقات والإضافات. لكنها الأغلى وتحتاج خبرة تقنية أكبر. مناسبة إذا كنت تبيع للسوق الدولي أو تحتاج تخصيصاً عميقاً.' },
      { type: 'tip', text: 'ديما تدعم سلة وزد وShopify — يمكنك إدارة متاجر من منصات مختلفة في لوحة تحكم واحدة.' },
      { type: 'cta', text: 'اربط متجرك بديما بغض النظر عن المنصة' },
    ],
  },
  '6': {
    slug: '6',
    title: 'دليل الاحتفاظ بالعملاء: اجعلهم يعودون دائماً',
    date: '١ مايو ٢٠٢٥',
    category: 'العملاء',
    categoryColor: '#0099ff',
    readTime: '٨ دقائق',
    author: 'فريق ديما',
    authorRole: 'خبراء التجارة الإلكترونية',
    excerpt: 'تكلفة الاحتفاظ بعميل أقل بـ٥ مرات من استقطاب عميل جديد. تعرّف على أفضل الطرق.',
    content: [
      { type: 'intro', text: 'الاحتفاظ بالعملاء هو السر الذي لا يتحدث عنه كثير من التجار. المتاجر الناجحة لا تعتمد فقط على الإعلانات — بل تبني قاعدة عملاء مخلصين يشترون مراراً.' },
      { type: 'heading', text: 'لماذا الاحتفاظ بالعملاء أهم من الاستقطاب؟' },
      { type: 'text', text: 'عميل موجود لديك بالفعل:\n• يُنفق ٦٧٪ أكثر من العميل الجديد\n• لا يحتاج إقناعاً (يثق بك)\n• يُحوّل أصدقاءه إليك مجاناً\n• تكلفة الوصول له أقل بكثير' },
      { type: 'heading', text: 'تقسيم العملاء — الخطوة الأولى' },
      { type: 'text', text: 'ليس كل العملاء سواء. قسّمهم:\n• VIP: أنفقوا أكثر من ٥٠٠٠ ريال — عاملهم بامتياز\n• متكررون: اشتروا أكثر من مرتين — شجّعهم باستمرار\n• جدد: اشتروا مرة — المرحلة الحرجة، اجعلها لا تُنسى\n• في خطر: لم يشتروا منذ ٩٠ يوم — تصرف الآن' },
      { type: 'heading', text: 'أدوات الاحتفاظ الفعّالة' },
      { type: 'text', text: '• برنامج نقاط: كل شراء يُجمع نقاط تُستبدل بخصومات\n• رسائل ما بعد الشراء: تحقق أن العميل راضٍ وأجب على أسئلته\n• هدايا المفاجأة: كوبون عيد ميلاد أو هدية مع الطلب الخامس\n• قناة تواصل خاصة: VIPs يحصلون على رقم واتساب مباشر' },
      { type: 'tip', text: 'ديما تُتيح لك رؤية شريحة كل عميل وتاريخ شرائه وقيمته الإجمالية — كل ما تحتاجه لبناء استراتيجية احتفاظ ذكية.' },
      { type: 'cta', text: 'ابدأ بتحليل قاعدة عملائك الآن مجاناً' },
    ],
  },
}

type Section =
  | { type: 'intro' | 'text' | 'heading' | 'tip' | 'cta'; text: string }

const RELATED = [
  { slug: '1', title: '٥ طرق لتسريع إدارة طلبات متجرك', category: 'إدارة الطلبات', categoryColor: '#6a4cf5' },
  { slug: '3', title: 'الذكاء الاصطناعي في التجارة العربية', category: 'الذكاء الاصطناعي', categoryColor: '#22c55e' },
  { slug: '4', title: '٣ استراتيجيات لزيادة المبيعات', category: 'زيادة المبيعات', categoryColor: '#22c55e' },
]

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const post = slug ? POSTS[slug] : null

  if (!post) {
    return (
      <PageLayout>
        <main style={{ maxWidth: 700, margin: '0 auto', padding: '120px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>📭</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}>المقال غير موجود</h1>
          <p style={{ color: 'var(--ink-muted)', marginBottom: 32 }}>عذراً، هذا المقال غير متاح أو تم حذفه.</p>
          <button onClick={() => navigate('/blog')} style={{ background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            العودة للمدونة
          </button>
        </main>
      </PageLayout>
    )
  }

  const related = RELATED.filter(r => r.slug !== slug).slice(0, 2)

  return (
    <PageLayout>
      <main style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(32px,5vw,72px) 24px 80px' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/blog')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: 14, marginBottom: 36, padding: 0, fontFamily: 'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-muted)' }}
        >
          <ArrowLeft2 size={16} variant="Outline" />
          العودة للمدونة
        </button>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{ background: post.categoryColor + '22', color: post.categoryColor, borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
              {post.category}
            </span>
            <span style={{ color: 'var(--ink-muted)', fontSize: 13 }}>{post.date}</span>
            <span style={{ color: 'var(--ink-disabled)', fontSize: 13 }}>·</span>
            <span style={{ color: 'var(--ink-muted)', fontSize: 13 }}>{post.readTime} قراءة</span>
          </div>

          <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.04em', marginBottom: 20 }}>
            {post.title}
          </h1>

          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.65, borderRight: `3px solid ${post.categoryColor}`, paddingRight: 16 }}>
            {post.excerpt}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--hairline)', marginBottom: 40 }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {post.content.map((section, i) => {
            if (section.type === 'intro') {
              return (
                <p key={i} style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--ink)', fontWeight: 500 }}>
                  {section.text}
                </p>
              )
            }
            if (section.type === 'heading') {
              return (
                <h2 key={i} style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)', marginTop: 8 }}>
                  {section.text}
                </h2>
              )
            }
            if (section.type === 'text') {
              return (
                <p key={i} style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--ink-muted)', whiteSpace: 'pre-line' }}>
                  {section.text}
                </p>
              )
            }
            if (section.type === 'tip') {
              return (
                <div key={i} style={{ background: `${post.categoryColor}10`, border: `1px solid ${post.categoryColor}30`, borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>💡</span>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink)', margin: 0, fontStyle: 'italic' }}>{section.text}</p>
                </div>
              )
            }
            if (section.type === 'cta') {
              return (
                <div key={i} style={{ marginTop: 16, background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', borderRadius: 16, padding: '28px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 18 }}>{section.text}</p>
                  <button
                    onClick={() => navigate('/signup')}
                    style={{ background: '#fff', color: '#6a4cf5', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
                  >
                    ابدأ مجاناً
                  </button>
                </div>
              )
            }
            return null
          })}
        </div>

        {/* Author */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 18, color: '#fff' }}>د</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{post.author}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{post.authorRole}</div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 20 }}>مقالات ذات صلة</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 16 }}>
              {related.map(r => (
                <button
                  key={r.slug}
                  onClick={() => navigate(`/blog/${r.slug}`)}
                  style={{ background: 'var(--canvas-soft)', border: '1px solid var(--hairline)', borderRadius: 14, padding: '20px', textAlign: 'right', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = r.categoryColor }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hairline)' }}
                >
                  <span style={{ background: r.categoryColor + '22', color: r.categoryColor, borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{r.category}</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.5, marginTop: 10, marginBottom: 0 }}>{r.title}</p>
                </button>
              ))}
            </div>
          </div>
        )}

      </main>
    </PageLayout>
  )
}
