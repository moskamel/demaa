import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Check, ChevronDown, Zap, Package, BarChart3,
  MessageSquare, Shield, Globe, Star, Clock, TrendingUp,
  RefreshCw, Users, Send,
} from 'lucide-react'

// ── Interactive demo data ────────────────────────────────────────────────────
const DEMO_COMMANDS = [
  {
    cmd: 'وريني الطلبات المعلقة',
    response: 'عندك ٣٥ طلب معلق 📦\n١٤,٥٠٠ ج.م إجمالي',
    stats: [{ n: '35', l: 'معلق', c: '#ff7a3d' }, { n: '14,500', l: 'ج.م', c: 'var(--ink)' }, { n: '8', l: 'كاش ⚠️', c: '#ff5577' }],
    actions: ['اقبل الجاهزة', 'وريني المشاكل'],
  },
  {
    cmd: 'اقبل الطلبات السليمة',
    response: '✅ هقبل ٢٧ طلب — ١١,٢٠٠ ج.م\n⏩ وهنشئ بوالص الشحن تلقائياً',
    stats: [{ n: '27', l: 'هيتقبل', c: '#22c55e' }, { n: '8', l: 'مشكلة', c: '#ff5577' }, { n: '2', l: 'دقيقة', c: '#0099ff' }],
    actions: ['نعم، نفّذ', 'وريني المشاكل الأول'],
  },
  {
    cmd: 'مبيعات الأسبوع',
    response: 'أسبوع قوي 💪\nالأسبوع ده: ٣٨,٤٠٠ ج.م\nنمو +٢٣٪ عن الأسبوع اللي فات',
    stats: [{ n: '38,400', l: 'ج.م', c: 'var(--ink)' }, { n: '+23%', l: 'نمو', c: '#22c55e' }, { n: '142', l: 'طلب', c: '#0099ff' }],
    actions: ['تقرير مفصل', 'قارن بالشهر'],
  },
  {
    cmd: 'كام منتج نافد؟',
    response: '⚠️ ٥ منتجات على وشك النفاد\nأهمهم: عطر الدهب — باقي ٣ قطع فقط',
    stats: [{ n: '5', l: 'نافد قريباً', c: '#ff7a3d' }, { n: '3', l: 'نافد فعلاً', c: '#ff5577' }, { n: '62', l: 'منتج آمن', c: '#22c55e' }],
    actions: ['وريني التفاصيل', 'اعمل تنبيه'],
  },
]

const PLATFORMS = [
  { name: 'Shopify', emoji: '🛍️' }, { name: 'Salla', emoji: '🟢' },
  { name: 'Zid', emoji: '🔵' }, { name: 'Wuilt', emoji: '🌐' },
  { name: 'Shantaweb', emoji: '🏪' }, { name: 'WooCommerce', emoji: '🛒' },
  { name: 'Amazon', emoji: '📦' }, { name: 'Noon', emoji: '🌙' },
  { name: 'Jumia', emoji: '🛵' }, { name: 'BigCommerce', emoji: '🔷' },
  { name: 'Wix', emoji: '🎨' }, { name: 'Ecwid', emoji: '🧩' },
  { name: 'TikTok Shop', emoji: '🎵' }, { name: 'Facebook Shop', emoji: '💙' },
]

const TESTIMONIALS = [
  {
    name: 'أحمد السيد', role: 'صاحب متجر ملابس · Shopify', city: 'القاهرة',
    avatar: '#6a4cf5',
    quote: 'كنت باخد ساعتين كل صبح على الطلبات. دلوقتي ديما بتخلصها في ٥ دقايق وأنا بشرب قهوتي.',
    metric: 'وفّر ٢ ساعة يومياً',
  },
  {
    name: 'نورة الشمري', role: 'صاحبة متجر عطور · Salla', city: 'الرياض',
    avatar: '#ff0080',
    quote: 'أهم شيء إنها تفهم السعودي. مكتبتها بتحكيها بأي كلمة وهي تفهم المراد.',
    metric: 'زيادة مبيعات +٣١٪',
  },
  {
    name: 'محمد الفارسي', role: 'مدير متجر إلكتروني · WooCommerce', city: 'دبي',
    avatar: '#00dfd8',
    quote: 'ربطت ٣ متاجر بديما في يوم واحد. والآن كل الطلبات في مكان واحد.',
    metric: '٣ متاجر · لوحة واحدة',
  },
]

const FAQS = [
  { q: 'هل أحتاج خبرة تقنية؟', a: 'لا. ديما تشتغل بالعربي الطبيعي. اكتب بأي طريقة وهي تفهمك — مصري، سعودي، خليجي.' },
  { q: 'هل ديما آمنة لمتجري؟', a: 'كل إجراء يشمل فلوس أو شحن يطلب تأكيدك. لا تنفيذ بدون موافقتك. البيانات مشفرة بالكامل.' },
  { q: 'ما هي المنصات المدعومة؟', a: 'Shopify، Salla، Zid، Wuilt، WooCommerce، Amazon، Noon، Jumia، BigCommerce، Wix، TikTok Shop، Facebook Shop، وأكثر.' },
  { q: 'كم يستغرق الربط؟', a: 'دقيقتين. أدخل مفتاح API الخاص بمتجرك وديما تبدأ تشتغل على الفور.' },
  { q: 'ماذا يحدث إذا لم أكن راضياً؟', a: 'لديك ٣٠ يوماً لاسترداد كامل المبلغ. بدون أسئلة.' },
]

// ── Component ────────────────────────────────────────────────────────────────
export default function Landing() {
  const [demoIdx, setDemoIdx] = useState(0)
  const [demoInput, setDemoInput] = useState('')
  const [demoMessages, setDemoMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; stats?: typeof DEMO_COMMANDS[0]['stats']; actions?: string[] }>>([
    { role: 'ai', text: 'صباح الخير! 🌅 أنا ديما، مساعدك الذكي. كيف أساعدك اليوم؟', stats: [{ n: '47', l: 'طلب جديد', c: '#ff7a3d' }, { n: '14k', l: 'ج.م اليوم', c: 'var(--ink)' }, { n: '3', l: 'مشاكل', c: '#ff5577' }] },
  ])
  const [typing, setTyping] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [countOrders, setCountOrders] = useState(0)
  const [countRevenue, setCountRevenue] = useState(0)
  const [countMerchants, setCountMerchants] = useState(0)
  const demoBottomRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const statsAnimated = useRef(false)

  // Counter animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !statsAnimated.current) {
        statsAnimated.current = true
        animateCount(setCountOrders, 0, 2400000, 1600)
        animateCount(setCountRevenue, 0, 180, 1400)
        animateCount(setCountMerchants, 0, 1200, 1200)
      }
    }, { threshold: 0.3 })
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  function animateCount(setter: (n: number) => void, from: number, to: number, duration: number) {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setter(Math.floor(from + (to - from) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  useEffect(() => { demoBottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [demoMessages])

  function sendDemoCommand(cmd: string) {
    const match = DEMO_COMMANDS.find(d => d.cmd === cmd) || DEMO_COMMANDS[demoIdx % DEMO_COMMANDS.length]
    setDemoMessages(prev => [...prev, { role: 'user', text: cmd }])
    setDemoInput('')
    setTyping(true)
    setTimeout(() => {
      setDemoMessages(prev => [...prev, { role: 'ai', text: match.response, stats: match.stats, actions: match.actions }])
      setTyping(false)
      setDemoIdx(i => i + 1)
    }, 900)
  }

  return (
    <div dir="rtl" style={{ background: 'var(--canvas)', color: 'var(--ink)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ───────────────────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--hairline)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>D</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--ink)' }}>Deema</span>
        </div>
        <div style={{ display: 'flex', gap: 28, flex: 1, justifyContent: 'center' }}>
          {[{ label: 'المميزات', to: '/features' }, { label: 'الأسعار', to: '/pricing' }, { label: 'المنصات', to: '/platforms' }, { label: 'المدونة', to: '/blog' }].map(l => (
            <Link key={l.label} to={l.to} style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500, letterSpacing: '-0.14px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
            >{l.label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/login" className="btn-secondary" style={{ fontSize: 13 }}>دخول</Link>
          <Link to="/signup" className="btn-primary" style={{ fontSize: 13 }}>ابدأ مجاناً ←</Link>
        </div>
      </nav>

      {/* ── EYEBROW STRIP ─────────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--primary)', color: '#fff', textAlign: 'center', padding: '10px 20px', fontSize: 13, letterSpacing: '-0.13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
        🎉 عرض الإطلاق — أول ٣ أشهر بخصم ٥٠٪ · <strong>سارع قبل انتهاء العرض</strong>
        <Link to="/signup" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline', marginRight: 6 }}>اشترك الآن</Link>
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 32px 64px', maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Left: copy */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 100, padding: '5px 14px', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e', letterSpacing: '-0.12px' }}>+١٢٠٠ تاجر نشط · مجاني للبداية</span>
            </div>

            <h1 style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.04em', color: 'var(--ink)', margin: '0 0 20px' }}>
              وفّر ساعتين<br />
              <span style={{ background: 'linear-gradient(135deg, #007cf0, #00dfd8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>كل يوم</span>
              <br />على طلباتك
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--ink-muted)', margin: '0 0 32px', maxWidth: 420, letterSpacing: '-0.18px' }}>
              ديما تقبل طلباتك، تشحن، وترسل التقارير — بجملة واحدة بالعربي.
              بدون تدريب، بدون تقنيات معقدة.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
              <Link to="/signup" className="btn-primary" style={{ padding: '12px 24px', fontSize: 15, borderRadius: 10 }}>
                ابدأ مجاناً — بدون بطاقة <ArrowLeft size={14} />
              </Link>
              <a href="#demo" className="btn-secondary" style={{ padding: '12px 24px', fontSize: 15, borderRadius: 10, textDecoration: 'none' }}>
                شاهد الديمو
              </a>
            </div>

            {/* Micro-trust */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['✅ لا يحتاج بطاقة ائتمانية', '✅ ربط في دقيقتين', '✅ استرداد ٣٠ يوماً'].map(t => (
                <span key={t} style={{ fontSize: 12, color: 'var(--ink-muted)', letterSpacing: '-0.12px' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Right: chat mockup */}
          <div style={{ background: 'var(--canvas-soft)', borderRadius: 20, border: '1px solid var(--hairline)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
            <div style={{ background: 'var(--canvas-soft-2)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: '1px solid var(--hairline)' }}>
              {['#ff5f57', '#ffbd2e', '#28c940'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
              <span style={{ color: 'var(--ink-muted)', fontSize: 11, marginRight: 'auto' }}>Deema · متجر النور</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: 10, color: '#22c55e' }}>متصل</span>
              </div>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, height: 320, overflowY: 'auto' }}>
              {[
                { role: 'ai', text: 'صباح الخير! ٤٧ طلب جديد، ١٤k ج.م 🌅', isAi: true },
                { role: 'user', text: 'اقبل الطلبات السليمة' },
                { role: 'ai', text: '✅ هقبل ٣٥ طلب — ١١,٢٠٠ ج.م\n⏩ بوالص الشحن جاهزة', isAi: true, done: true },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.isAi ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    background: m.isAi ? 'var(--canvas)' : 'var(--canvas-soft-2)',
                    borderRadius: m.isAi ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    padding: '10px 13px', fontSize: 12.5, maxWidth: '82%',
                    boxShadow: m.isAi ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    lineHeight: 1.55, color: 'var(--ink)', whiteSpace: 'pre-line',
                  }}>{m.text}</div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                {['نعم، نفّذ ✓', 'التفاصيل'].map(a => (
                  <div key={a} style={{ background: a.includes('✓') ? 'var(--primary)' : 'var(--canvas)', color: a.includes('✓') ? '#fff' : 'var(--ink-muted)', borderRadius: 100, padding: '5px 12px', fontSize: 11, fontWeight: 500, cursor: 'default', border: '1px solid var(--hairline)' }}>{a}</div>
                ))}
              </div>
            </div>
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--hairline)', background: 'var(--canvas)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--canvas-soft)', borderRadius: 9, padding: '8px 12px', border: '1px solid var(--hairline)' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-muted)', flex: 1 }}>اكتب أمرك...</span>
                <Send size={13} color="var(--ink-muted)" style={{ transform: 'scaleX(-1)' }} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── ANIMATED STATS ────────────────────────────────────────────────────── */}
      <section ref={statsRef} style={{ background: 'var(--canvas-soft)', borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', padding: '48px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {[
            { value: countOrders.toLocaleString('ar-EG') + '+', label: 'طلب تمت معالجته', sub: 'خلال الأشهر الماضية', icon: <Package size={18} color="#ff7a3d" /> },
            { value: countRevenue + 'M+', label: 'ج.م حجم المبيعات', sub: 'عبر منصات متعددة', icon: <TrendingUp size={18} color="#22c55e" /> },
            { value: countMerchants.toLocaleString('ar-EG') + '+', label: 'تاجر يثق بديما', sub: 'في مصر والسعودية والخليج', icon: <Users size={18} color="#0099ff" /> },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0 32px', borderRight: i < 2 ? '1px solid var(--hairline)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAIN vs DEEMA ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 32px', maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>قبل وبعد</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--ink)' }}>
            قضيت الصبح كله على الطلبات؟
          </h2>
          <p style={{ fontSize: 17, color: 'var(--ink-muted)', maxWidth: 520, margin: '16px auto 0', lineHeight: 1.55 }}>نحن نعرف الوجع. كل تاجر عربي مر بنفس المشكلة.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Before */}
          <div style={{ background: 'rgba(255,85,119,0.04)', border: '1px solid rgba(255,85,119,0.2)', borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ff5577', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>😩</span> بدون ديما
            </div>
            {[
              { t: 'ساعتين يومياً على الطلبات', d: 'فتح لوحة التحكم، فلترة، قبول واحد واحد' },
              { t: 'ضياع الطلبات الكاش المشبوهة', d: 'لا توجد أداة للكشف — تخسر بصمت' },
              { t: 'فاتحلك ١٠ تابات مختلفة', d: 'منصة الشحن، المتجر، المحاسبة، واتساب...' },
              { t: 'لا تعرف حالة مخزونك إلا بعد فوات', d: 'منتج نافد وعندك طلبات عليه' },
              { t: 'تقارير تعملها بالإكسل يدوياً', d: 'ساعة كل أسبوع وأنت تجمع أرقام' },
            ].map(p => (
              <div key={p.t} style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff5577', flexShrink: 0, marginTop: 7 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{p.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{p.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* After */}
          <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#22c55e', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🚀</span> مع ديما
            </div>
            {[
              { t: '٥ دقائق وخلصت الطلبات', d: '"اقبل السليمة" — ديما تعمل الباقي' },
              { t: 'تنبيه فوري للطلبات المشبوهة', d: 'كشف تلقائي للكاش عالي المخاطر' },
              { t: 'لوحة واحدة لكل متاجرك', d: '١٤ منصة في مكان واحد' },
              { t: 'تنبيه المخزون قبل ما ينفد', d: '"عندك ٣ قطع باقيين من المنتج X"' },
              { t: 'تقرير يومي أوتوماتيك الصبح', d: 'يجيلك ملخص شامل قبل ما تبدأ يومك' },
            ].map(p => (
              <div key={p.t} style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0, marginTop: 7 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{p.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{p.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ──────────────────────────────────────────────────── */}
      <section id="demo" style={{ padding: '0 32px 96px', maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>جربها الآن</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)' }}>كلّم ديما بنفسك</h2>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', marginTop: 12 }}>اضغط على أي أمر أو اكتب بحرية</p>
        </div>

        <div style={{ background: 'var(--canvas-soft)', borderRadius: 24, border: '1px solid var(--hairline)', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.07)', maxWidth: 780, margin: '0 auto' }}>
          {/* chrome */}
          <div style={{ background: 'var(--canvas-soft-2)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--hairline)' }}>
            {['#ff5f57', '#ffbd2e', '#28c940'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            <span style={{ fontSize: 12, color: 'var(--ink-muted)', marginRight: 'auto' }}>Deema · متجرك · Shopify</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <RefreshCw size={11} color="var(--ink-muted)" />
              <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>مباشر</span>
            </div>
          </div>

          {/* quick command chips */}
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--hairline)', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {DEMO_COMMANDS.map(d => (
              <button key={d.cmd} onClick={() => sendDemoCommand(d.cmd)} disabled={typing}
                style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: typing ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0, color: 'var(--ink-muted)', fontFamily: 'inherit', opacity: typing ? 0.5 : 1, transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!typing) { e.currentTarget.style.background = 'var(--canvas-soft-2)'; e.currentTarget.style.color = 'var(--ink)' } }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--canvas)'; e.currentTarget.style.color = 'var(--ink-muted)' }}
              >{d.cmd}</button>
            ))}
          </div>

          {/* messages */}
          <div style={{ padding: '20px 20px 12px', minHeight: 240, maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {demoMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end', gap: 10 }}>
                {m.role === 'ai' && (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-start', marginTop: 2 }}>
                    <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>D</span>
                  </div>
                )}
                <div style={{ maxWidth: '78%' }}>
                  <div style={{
                    background: m.role === 'user' ? 'var(--canvas-soft-2)' : 'var(--canvas)',
                    borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    padding: '11px 14px', fontSize: 13.5, lineHeight: 1.6,
                    boxShadow: m.role === 'ai' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    whiteSpace: 'pre-line', color: 'var(--ink)',
                  }}>{m.text}</div>
                  {m.stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${m.stats.length}, 1fr)`, gap: 6, marginTop: 8 }}>
                      {m.stats.map(s => (
                        <div key={s.l} style={{ background: 'var(--canvas)', borderRadius: 10, padding: '8px 10px', border: '1px solid var(--hairline)' }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: s.c, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
                          <div style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 2 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.actions && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {m.actions.map((a, ai) => (
                        <button key={a} onClick={() => sendDemoCommand(a)} disabled={typing}
                          style={{ background: ai === 0 ? 'var(--primary)' : 'var(--canvas)', color: ai === 0 ? '#fff' : 'var(--ink-muted)', border: '1px solid var(--hairline)', borderRadius: 100, padding: '5px 13px', fontSize: 11.5, fontWeight: 500, cursor: typing ? 'default' : 'pointer', fontFamily: 'inherit' }}>{a}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>D</span>
                </div>
                <div style={{ background: 'var(--canvas)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px', display: 'flex', gap: 4, border: '1px solid var(--hairline)' }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-muted)', animation: `bounce 1s ${i * 0.16}s ease-in-out infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={demoBottomRef} />
          </div>

          {/* input */}
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--hairline)', background: 'var(--canvas)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={demoInput} onChange={e => setDemoInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && demoInput.trim() && !typing && sendDemoCommand(demoInput.trim())}
                disabled={typing}
                placeholder='اكتب أمرك بالعربي...'
                style={{ flex: 1, background: 'var(--canvas-soft)', border: '1px solid var(--hairline)', borderRadius: 10, padding: '9px 13px', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit', direction: 'rtl', opacity: typing ? 0.6 : 1 }}
              />
              <button onClick={() => demoInput.trim() && !typing && sendDemoCommand(demoInput.trim())} disabled={!demoInput.trim() || typing}
                style={{ width: 36, height: 36, borderRadius: 10, background: demoInput.trim() && !typing ? 'var(--primary)' : 'var(--canvas-soft)', border: 'none', cursor: demoInput.trim() && !typing ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={14} color={demoInput.trim() && !typing ? '#fff' : 'var(--ink-muted)'} style={{ transform: 'scaleX(-1)' }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORMS TICKER ──────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', padding: '32px 0', overflow: 'hidden', background: 'var(--canvas-soft)' }}>
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>يتصل بـ ١٤ منصة</p>
        <div style={{ display: 'flex', gap: 0, animation: 'ticker 20s linear infinite', width: 'max-content' }}>
          {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 24px', borderRight: '1px solid var(--hairline)', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 16 }}>{p.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)' }}>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 32px', maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>المميزات</p>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)' }}>كل ما يحتاجه متجرك</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            {
              icon: <Package size={22} />, color: '#6a4cf5', title: 'إدارة الطلبات بالذكاء',
              desc: 'اقبل، ارفض، وتابع طلباتك بجملة واحدة. ديما تكشف الطلبات المشبوهة تلقائياً.',
              demo: '"اقبل الطلبات السليمة وحاسبني على المشبوهة"',
            },
            {
              icon: <Zap size={22} />, color: '#ff7a3d', title: 'شحن لحظي',
              desc: 'ينشئ بوالص الشحن مع أرامكس وSMSA وJ&T ويرسل رقم التتبع للعميل تلقائياً.',
              demo: '"اشحن الطلبات المقبولة مع أرامكس"',
            },
            {
              icon: <BarChart3 size={22} />, color: '#22c55e', title: 'تقارير وذاكرة ذكية',
              desc: 'ملخص يومي شامل كل صباح. ديما تتذكر عملاءك المميزين وتنبهك بالمخزون الناقص.',
              demo: '"وريني مبيعات هذا الأسبوع مقارنة بالأسبوع الفائت"',
            },
            {
              icon: <MessageSquare size={22} />, color: '#0099ff', title: 'يفهم كل اللهجات',
              desc: 'مصري، سعودي، خليجي، مغربي — كلهم يشتغلون. اكتب بأي طريقة.',
              demo: '"عايز أشوف الأوردرات المعلقة دلوقتي"',
            },
            {
              icon: <Shield size={22} />, color: '#ff5577', title: 'أمان تام',
              desc: 'كل إجراء جماعي يطلب تأكيدك. لا تنفيذ مالي بدون موافقتك. بيانات مشفرة.',
              demo: '"اقبل الكل" → ديما تسألك: "متأكد؟"',
            },
            {
              icon: <Globe size={22} />, color: '#00dfd8', title: 'ربط ١٤ منصة',
              desc: 'Shopify، Salla، Zid، WooCommerce، Amazon، Noon، Jumia والمزيد — في لوحة واحدة.',
              demo: '"وريني طلبات Salla وShopify مع بعض"',
            },
          ].map(f => (
            <div key={f.title} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', transition: 'box-shadow 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: f.color }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--ink)', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 16 }}>{f.desc}</p>
              <div style={{ background: 'var(--canvas)', borderRadius: 8, padding: '8px 12px', fontSize: 11.5, color: 'var(--ink-muted)', fontFamily: 'monospace', borderLeft: `3px solid ${f.color}` }}>{f.demo}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--canvas-soft)', borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', padding: '96px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>كيف تعمل</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)' }}>تبدأ في ٤ خطوات</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[
              { n: '١', icon: '🔗', title: 'اربط متجرك', desc: 'أدخل مفتاح API من أي منصة. يستغرق دقيقتين.' },
              { n: '٢', icon: '🤝', title: 'ديما تتعلم', desc: 'تقرأ طلباتك ومخزونك وتاريخ عملاءك تلقائياً.' },
              { n: '٣', icon: '💬', title: 'تكلمها بالعربي', desc: 'اكتب بأي لهجة — هي تفهمك وتقترح الخطوات.' },
              { n: '٤', icon: '⚡', title: 'تنفذ فوراً', desc: 'تطلب تأكيدك للكبيرة وتنفذ الباقي لحالها.' },
            ].map((s, i) => (
              <div key={s.n} style={{ background: 'var(--canvas)', padding: '32px 28px', borderRadius: i === 0 ? '20px 0 0 20px' : i === 3 ? '0 20px 20px 0' : 0, borderRight: i < 3 ? '1px solid var(--hairline)' : 'none', position: 'relative' }}>
                {i < 3 && <div style={{ position: 'absolute', top: '50%', left: -14, transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, zIndex: 1 }}>←</div>}
                <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.06em', marginBottom: 8 }}>الخطوة {s.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.4px', marginBottom: 8, color: 'var(--ink)' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 32px', maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>آراء التجار</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)' }}>تجار حقيقيون، نتائج حقيقية</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: 28, border: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array(5).fill(0).map((_, i) => <Star key={i} size={13} color="#f59e0b" fill="#f59e0b" />)}
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.7, flex: 1, letterSpacing: '-0.14px' }}>"{t.quote}"</p>
              <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: t.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{t.role}</div>
                </div>
                <div style={{ marginRight: 'auto', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 100, padding: '3px 10px', fontSize: 11, color: '#22c55e', fontWeight: 600 }}>{t.metric}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--canvas-soft)', borderTop: '1px solid var(--hairline)', padding: '96px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>الأسعار</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 12 }}>ادفع على قد استخدامك</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-muted)' }}>ابدأ مجاناً — سعّد في أي وقت · إلغاء وقتما تريد</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, maxWidth: 980, margin: '0 auto' }}>
            {[
              {
                name: 'مجاني', price: '٠', period: 'دايماً مجاني', tag: null, featured: false,
                color: 'var(--ink)',
                features: ['متجر واحد', '٥٠ طلب/شهر', 'المنصات الأساسية', 'دعم إيميل', 'تقارير أساسية'],
                note: null,
              },
              {
                name: 'احترافي', price: '٩٩', period: 'ج.م/شهر', tag: '🔥 الأكثر شعبية', featured: true,
                color: '#fff',
                features: ['٣ متاجر', 'طلبات غير محدودة', 'جميع شركات الشحن', 'كشف الطلبات المشبوهة', 'تقارير متقدمة', 'دعم أولوية'],
                note: 'وفّر ٢٠٠ ج.م مع الدفع السنوي',
              },
              {
                name: 'شركات', price: '٢٩٩', period: 'ج.م/شهر', tag: null, featured: false,
                color: 'var(--ink)',
                features: ['متاجر غير محدودة', 'API مخصص', 'فريق متعدد الأعضاء', 'مدير حساب مخصص', 'SLA ٩٩.٩٪', 'تكاملات مخصصة'],
                note: null,
              },
            ].map(tier => (
              <div key={tier.name} style={{
                background: tier.featured ? 'var(--primary)' : 'var(--canvas)',
                borderRadius: 20, padding: 28, position: 'relative',
                border: tier.featured ? 'none' : '1px solid var(--hairline)',
                boxShadow: tier.featured ? '0 20px 60px rgba(0,0,0,0.2)' : 'none',
                transform: tier.featured ? 'scale(1.03)' : 'none',
              }}>
                {tier.tag && (
                  <div style={{ position: 'absolute', top: -14, right: 24 }}>
                    <span style={{ background: '#f59e0b', color: '#000', borderRadius: 100, padding: '4px 14px', fontSize: 11, fontWeight: 700 }}>{tier.tag}</span>
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 600, color: tier.featured ? 'rgba(255,255,255,0.7)' : 'var(--ink-muted)', marginBottom: 8 }}>{tier.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 46, fontWeight: 700, color: tier.featured ? '#fff' : 'var(--ink)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px' }}>{tier.price}</span>
                  <span style={{ fontSize: 13, color: tier.featured ? 'rgba(255,255,255,0.6)' : 'var(--ink-muted)' }}>{tier.period}</span>
                </div>
                {tier.note && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>{tier.note}</div>}
                <div style={{ height: tier.note ? 0 : 20 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {tier.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Check size={13} color={tier.featured ? '#22c55e' : 'var(--semantic-success)'} strokeWidth={2.5} />
                      <span style={{ fontSize: 13, color: tier.featured ? 'rgba(255,255,255,0.85)' : 'var(--ink-muted)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link to="/signup" style={{
                  display: 'flex', justifyContent: 'center', textDecoration: 'none', borderRadius: 100,
                  padding: '11px 18px', fontSize: 14, fontWeight: 600,
                  ...(tier.featured
                    ? { background: '#fff', color: '#000' }
                    : { background: 'var(--canvas-soft-2)', color: 'var(--ink)', border: '1px solid var(--hairline)' }
                  ),
                }}>ابدأ الآن</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 32px', maxWidth: 780, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>الأسئلة الشائعة</p>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)' }}>عندك سؤال؟</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--hairline)' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: openFaq === i ? 'var(--canvas-soft)' : 'var(--canvas)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>{f.q}</span>
                <ChevronDown size={16} color="var(--ink-muted)" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 18px', background: 'var(--canvas-soft)', animation: 'fadeIn 0.15s ease-out' }}>
                  <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.7, letterSpacing: '-0.14px' }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 96px', maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ background: 'var(--primary)', borderRadius: 28, padding: '80px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* bg decoration */}
          <div style={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -100, right: -60, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 100, padding: '5px 16px', marginBottom: 24 }}>
            <Clock size={12} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>ابدأ في دقيقتين</span>
          </div>

          <h2 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#fff', margin: '0 0 16px' }}>
            وقفت تضيع وقتك؟
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 40, maxWidth: 440, margin: '0 auto 40px', lineHeight: 1.5 }}>
            كل يوم بدون ديما = ساعتين ضايعتين.<br />
            +١٢٠٠ تاجر عربي بدأوا يوفروا وقتهم.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <Link to="/signup" style={{ background: '#fff', color: '#000', borderRadius: 12, padding: '14px 32px', fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: '-0.3px' }}>
              ابدأ مجاناً الآن <ArrowLeft size={15} />
            </Link>
            <Link to="/dashboard" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
              شاهد الديمو
            </Link>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {['✅ بدون بطاقة ائتمان', '✅ ربط في دقيقتين', '✅ استرداد ٣٠ يوماً', '✅ إلغاء وقتما تريد'].map(t => (
              <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--hairline)', padding: '64px 32px 40px', maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>D</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Deema</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.7, maxWidth: 220, letterSpacing: '-0.13px', marginBottom: 20 }}>
              مساعد ذكاء اصطناعي متخصص في التجارة الإلكترونية العربية. يفهم لهجتك، يتصرف بسرعة.
            </p>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>مصر · السعودية · الإمارات · الكويت</div>
          </div>
          {[
            { title: 'المنتج', links: [{ label: 'المميزات', to: '/features' }, { label: 'الأسعار', to: '/pricing' }, { label: 'المنصات', to: '/platforms' }, { label: 'التحديثات', to: '/changelog' }] },
            { title: 'الشركة', links: [{ label: 'من نحن', to: '/about' }, { label: 'تواصل معنا', to: '/contact' }, { label: 'المدونة', to: '/blog' }, { label: 'الوظائف', to: '/careers' }] },
            { title: 'القانوني', links: [{ label: 'الخصوصية', to: '/privacy' }, { label: 'الشروط', to: '/terms' }, { label: 'الأمان', to: '/security' }, { label: 'الكوكيز', to: '/cookies' }] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l.label} style={{ marginBottom: 10 }}>
                  <Link to={l.to} style={{ fontSize: 13, color: 'var(--ink-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
                  >{l.label}</Link>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>© ٢٠٢٥ Deema. جميع الحقوق محفوظة.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {['تويتر', 'لينكدإن', 'إنستغرام'].map(s => (
              <a key={s} href="#" style={{ fontSize: 12, color: 'var(--ink-muted)', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
              >{s}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
