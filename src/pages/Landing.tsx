import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft2, TickCircle, ArrowDown2, Flash, Box, ChartSquare,
  MessageText1, ShieldTick, Global, Star1, Clock, TrendUp,
  Refresh2, People, Send2,
} from 'iconsax-react'

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  ink: '#f0f0f5',
  slate: '#9090a2',
  canvas: '#0e0e12',
  surface: '#18181e',
  hairline: 'rgba(255,255,255,0.08)',
  yellow: '#ffd02f',
  blue: '#5a7af5',
  muted: '#5e5e72',
  well: '#080810',
} as const

// ── Interactive demo data ────────────────────────────────────────────────────
const DEMO_COMMANDS = [
  {
    cmd: 'وريني الطلبات المعلقة',
    response: 'عندك ٣٥ طلب معلق 📦\n١٤,٥٠٠ $ إجمالي',
    stats: [{ n: '35', l: 'معلق', c: '#ff7a3d' }, { n: '14,500', l: '$', c: T.ink }, { n: '8', l: 'كاش ⚠️', c: '#ff5577' }],
    actions: ['اقبل الجاهزة', 'وريني المشاكل'],
  },
  {
    cmd: 'اقبل الطلبات السليمة',
    response: '✅ هقبل ٢٧ طلب — ١١,٢٠٠ $\n⏩ وهنشئ بوالص الشحن تلقائياً',
    stats: [{ n: '27', l: 'هيتقبل', c: '#22c55e' }, { n: '8', l: 'مشكلة', c: '#ff5577' }, { n: '2', l: 'دقيقة', c: '#0099ff' }],
    actions: ['نعم، نفّذ', 'وريني المشاكل الأول'],
  },
  {
    cmd: 'مبيعات الأسبوع',
    response: 'أسبوع قوي 💪\nالأسبوع ده: ٣٨,٤٠٠ $\nنمو +٢٣٪ عن الأسبوع اللي فات',
    stats: [{ n: '38,400', l: '$', c: T.ink }, { n: '+23%', l: 'نمو', c: '#22c55e' }, { n: '142', l: 'طلب', c: '#0099ff' }],
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

// ── Testimonials Slider ───────────────────────────────────────────────────────
function TestimonialsSlider() {
  const [current, setCurrent] = useState(0)
  const total = TESTIMONIALS.length

  useEffect(() => {
    const timer = setInterval(() => setCurrent(i => (i + 1) % total), 4000)
    return () => clearInterval(timer)
  }, [total])

  const t = TESTIMONIALS[current]
  return (
    <section style={{ padding: '96px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#9090a2', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>آراء التجار</p>
        <h2 style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-1px', color: '#f0f0f5' }}>تجار حقيقيون، نتائج حقيقية</h2>
      </div>

      <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
        {/* Card */}
        <div key={current} style={{ background: '#18181e', borderRadius: 28, padding: '40px 36px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.35s ease-out' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array(5).fill(0).map((_, i) => <Star1 key={i} size={16} color="#f59e0b" variant="Bold" />)}
          </div>
          <p style={{ fontSize: 18, color: '#f0f0f5', lineHeight: 1.75, flex: 1, letterSpacing: '-0.2px' }}>"{t.quote}"</p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.name[0]}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f5' }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#9090a2', marginTop: 3 }}>{t.role}</div>
            </div>
            <div style={{ marginRight: 'auto', background: '#ffd02f', borderRadius: 9999, padding: '5px 14px', fontSize: 12, color: '#0e0e12', fontWeight: 700 }}>{t.metric}</div>
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 9999, border: 'none', cursor: 'pointer', background: i === current ? '#f0f0f5' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s ease', padding: 0 }} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Component ────────────────────────────────────────────────────────────────
export default function Landing() {
  const isAuthed = !!localStorage.getItem('deema_token')
  const ctaTo = isAuthed ? '/dashboard' : '/signup'
  const loginTo = isAuthed ? '/dashboard' : '/login'

  const [demoIdx, setDemoIdx] = useState(0)
  const [demoInput, setDemoInput] = useState('')
  const [demoMessages, setDemoMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; stats?: typeof DEMO_COMMANDS[0]['stats']; actions?: string[] }>>([
    { role: 'ai', text: 'صباح الخير! 🌅 أنا ديما، مساعدك الذكي. كيف أساعدك اليوم؟', stats: [{ n: '47', l: 'طلب جديد', c: '#ff7a3d' }, { n: '14k', l: '$ اليوم', c: T.ink }, { n: '3', l: 'مشاكل', c: '#ff5577' }] },
  ])
  const [typing, setTyping] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [countOrders, setCountOrders] = useState(0)
  const [countRevenue, setCountRevenue] = useState(0)
  const [countMerchants, setCountMerchants] = useState(0)
  const demoBottomRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const statsAnimated = useRef(false)

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

  // Shared button styles
  const btnPrimary: React.CSSProperties = {
    background: '#fff',
    color: '#0e0e12',
    borderRadius: 9999,
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '-0.14px',
  }

  const btnOutline: React.CSSProperties = {
    background: 'transparent',
    color: T.ink,
    borderRadius: 9999,
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: `1.5px solid rgba(255,255,255,0.18)`,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '-0.14px',
  }

  return (
    <div dir="rtl" style={{ background: T.canvas, color: T.ink, minHeight: '100vh', overflowX: 'hidden', fontFamily: 'Zain, sans-serif' }}>

      {/* ── PROMO BANNER ─────────────────────────────────────────────────────── */}
      <div style={{ background: T.well, color: '#fff', textAlign: 'center', padding: '10px 20px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderBottom: `1px solid ${T.hairline}` }}>
        <span style={{ background: T.yellow, color: T.ink, borderRadius: 9999, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>🎉 عرض الإطلاق</span>
        <span>أول ٣ أشهر بخصم ٥٠٪ ·</span>
        <strong>سارع قبل انتهاء العرض</strong>
        <Link to={ctaTo} style={{ color: T.yellow, fontWeight: 600, textDecoration: 'underline', marginRight: 4 }}>اشترك الآن</Link>
      </div>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(14,14,18,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${T.hairline}`, height: 64, display: 'flex', alignItems: 'center', padding: '0 40px', gap: 24 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>D</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.5px', color: T.ink }}>Deema</span>
        </div>

        {/* Center links */}
        <div style={{ display: 'flex', gap: 32, flex: 1, justifyContent: 'center' }}>
          {[{ label: 'المميزات', to: '/features' }, { label: 'الأسعار', to: '/pricing' }, { label: 'المنصات', to: '/platforms' }, { label: 'المدونة', to: '/blog' }].map(l => (
            <Link key={l.label} to={l.to} style={{ color: T.slate, textDecoration: 'none', fontSize: 14, fontWeight: 500, letterSpacing: '-0.14px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = T.ink)}
              onMouseLeave={e => (e.currentTarget.style.color = T.slate)}
            >{l.label}</Link>
          ))}
        </div>

        {/* Right CTAs */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to={loginTo} style={{ ...btnOutline, padding: '8px 20px', fontSize: 13 }}>دخول</Link>
          <Link to={ctaTo} style={{ ...btnPrimary, padding: '8px 20px', fontSize: 13 }}>ابدأ مجاناً</Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 40px 60px' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '-120px', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(106,76,245,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '0', left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,77,240,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top badge — centered */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div className="animate-pop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,208,47,0.12)', border: '1px solid rgba(255,208,47,0.3)', borderRadius: 9999, padding: '6px 18px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.yellow }}>+١٢٠٠ تاجر نشط الآن</span>
            </div>
          </div>

          {/* Headline — centered, large */}
          <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 'clamp(52px, 7vw, 96px)', fontWeight: 700, lineHeight: 1.0, letterSpacing: '-3px', color: T.ink, margin: 0 }}>
              وفّر ساعتين
              <span style={{ display: 'block', background: 'linear-gradient(90deg, #6a4cf5, #d44df0, #ff7a3d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                كل يوم
              </span>
              على طلباتك
            </h1>
          </div>

          <p className="animate-fade-in-up" style={{ fontSize: 'clamp(16px,2vw,20px)', lineHeight: 1.6, color: T.slate, textAlign: 'center', maxWidth: 560, margin: '0 auto 40px', animationDelay: '80ms' }}>
            ديما تقبل طلباتك، تشحن، وترسل التقارير — بجملة واحدة بالعربي.
            بدون تدريب، بدون تقنيات معقدة.
          </p>

          <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20, animationDelay: '140ms' }}>
            <Link to={ctaTo} style={{ background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', borderRadius: 9999, padding: '14px 32px', fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(106,76,245,0.4)' }}>
              ابدأ مجاناً ←
            </Link>
            <Link to={loginTo} style={{ ...btnOutline, padding: '14px 28px', fontSize: 15 }}>دخول</Link>
          </div>

          <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 60, animationDelay: '180ms' }}>
            {['✅ لا يحتاج بطاقة ائتمانية', '✅ ربط في دقيقتين', '✅ استرداد ٣٠ يوماً'].map(t => (
              <span key={t} style={{ fontSize: 13, color: T.slate }}>{t}</span>
            ))}
          </div>

          {/* Chat demo — centered card */}
          <div style={{ maxWidth: 740, margin: '0 auto', borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(106,76,245,0.2)', background: T.surface }}>
            {/* Window chrome */}
            <div style={{ background: T.well, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: `1px solid ${T.hairline}` }}>
              {['#ff5f57', '#ffbd2e', '#28c940'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              <span style={{ color: T.slate, fontSize: 12, marginRight: 'auto' }}>Deema · متجر النور</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: 11, color: '#22c55e' }}>متصل</span>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, height: 320, overflowY: 'auto' }}>
              {demoMessages.map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-start' : 'flex-end', gap: 8 }}>
                  <div style={{
                    background: m.role === 'user' ? 'rgba(255,255,255,0.06)' : '#6a4cf5',
                    color: '#f0f0f5',
                    borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    padding: '10px 14px', fontSize: 13, maxWidth: '82%',
                    border: `1px solid ${T.hairline}`,
                    lineHeight: 1.55, whiteSpace: 'pre-line',
                  }}>{m.text}</div>
                  {m.stats && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {m.stats.map(s => (
                        <div key={s.l} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.hairline}`, borderRadius: 8, padding: '5px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: s.c, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
                          <div style={{ fontSize: 10, color: T.slate }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.actions && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {m.actions.map((a, ai) => (
                        <button key={a} onClick={() => sendDemoCommand(a)} style={{
                          background: ai === 0 ? '#6a4cf5' : 'transparent',
                          color: ai === 0 ? '#fff' : T.slate,
                          borderRadius: 9999, padding: '5px 14px', fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', border: `1px solid ${ai === 0 ? '#6a4cf5' : T.hairline}`,
                          fontFamily: 'inherit',
                        }}>{a}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.hairline}`, borderRadius: '16px 4px 16px 16px', padding: '10px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: T.slate, animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={demoBottomRef} />
            </div>

            {/* Quick commands */}
            <div style={{ padding: '8px 12px', borderTop: `1px solid ${T.hairline}`, display: 'flex', gap: 6, flexWrap: 'wrap', background: T.well }}>
              {DEMO_COMMANDS.map(d => (
                <button key={d.cmd} onClick={() => sendDemoCommand(d.cmd)} disabled={typing} style={{
                  background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.hairline}`,
                  borderRadius: 9999, padding: '4px 12px', fontSize: 11, color: T.slate,
                  cursor: typing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  transition: 'background 0.15s, color 0.15s',
                }}
                  onMouseEnter={e => { if (!typing) { e.currentTarget.style.background = 'rgba(106,76,245,0.15)'; e.currentTarget.style.color = '#a78bfa' } }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = T.slate }}
                >{d.cmd}</button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.hairline}`, background: T.canvas }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.surface, borderRadius: 9999, padding: '8px 16px', border: `1px solid ${T.hairline}` }}>
                <input
                  value={demoInput}
                  onChange={e => setDemoInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && demoInput.trim() && !typing) sendDemoCommand(demoInput.trim()) }}
                  placeholder="اكتب أمرك..."
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: T.ink, fontSize: 12, fontFamily: 'inherit', direction: 'rtl' }}
                />
                <button onClick={() => { if (demoInput.trim() && !typing) sendDemoCommand(demoInput.trim()) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <Send2 size={13} color={demoInput.trim() ? '#6a4cf5' : T.slate} variant="Outline" style={{ transform: 'scaleX(-1)' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 40px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div ref={statsRef} style={{ background: 'linear-gradient(135deg, rgba(106,76,245,0.08), rgba(212,77,240,0.06))', border: `1px solid rgba(106,76,245,0.2)`, borderRadius: 28, padding: '48px 32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {[
            { value: countOrders.toLocaleString('en-US') + '+', label: 'طلب تمت معالجته', sub: 'خلال الأشهر الماضية', icon: <Box size={20} color="#ff7a3d" variant="Outline" /> },
            { value: countRevenue + 'M+', label: '$ حجم المبيعات', sub: 'عبر منصات متعددة', icon: <TrendUp size={20} color="#22c55e" variant="Outline" /> },
            { value: countMerchants.toLocaleString('en-US') + '+', label: 'تاجر يثق بديما', sub: 'في مصر والسعودية والخليج', icon: <People size={20} color={T.blue} variant="Outline" /> },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0 40px', borderRight: i < 2 ? `1px solid ${T.hairline}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 'clamp(40px, 4vw, 56px)', fontWeight: 500, color: T.ink, letterSpacing: '-3px', fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: T.ink, marginTop: 6 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: T.slate, marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORMS TICKER ─────────────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${T.hairline}`, borderBottom: `1px solid ${T.hairline}`, padding: '28px 0', overflow: 'hidden', background: T.well }}>
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: T.slate, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>يتصل بـ ١٤ منصة</p>
        <div style={{ display: 'flex', gap: 0, animation: 'ticker 22s linear infinite', width: 'max-content' }}>
          {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 28px', borderRight: `1px solid ${T.hairline}`, whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 17 }}>{p.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: T.slate }}>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.slate, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>المميزات</p>
          <h2 style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-1px', color: T.ink, margin: 0 }}>كل ما يحتاجه متجرك</h2>
        </div>

        {/* 4-card grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            {
              icon: <Box size={26} variant="Outline" />, title: 'إدارة الطلبات بالذكاء',
              desc: 'اقبل، ارفض، وتابع طلباتك بجملة واحدة. ديما تكشف الطلبات المشبوهة تلقائياً.',
              demo: '"اقبل الطلبات السليمة وحاسبني على المشبوهة"',
              bg: '#1a1400', accent: '#c8960a', iconBg: 'rgba(200,150,10,0.15)',
            },
            {
              icon: <Flash size={26} variant="Outline" />, title: 'شحن لحظي',
              desc: 'ينشئ بوالص الشحن مع أرامكس وSMSA وJ&T ويرسل رقم التتبع للعميل تلقائياً.',
              demo: '"اشحن الطلبات المقبولة مع أرامكس"',
              bg: '#1a0a0a', accent: '#e05555', iconBg: 'rgba(224,85,85,0.15)',
            },
            {
              icon: <ChartSquare size={26} variant="Outline" />, title: 'تقارير وذاكرة ذكية',
              desc: 'ملخص يومي شامل كل صباح. ديما تتذكر عملاءك المميزين وتنبهك بالمخزون الناقص.',
              demo: '"وريني مبيعات هذا الأسبوع مقارنة بالأسبوع الفائت"',
              bg: '#001a18', accent: '#1ab8ae', iconBg: 'rgba(26,184,174,0.15)',
            },
            {
              icon: <Global size={26} variant="Outline" />, title: 'ربط ١٤ منصة',
              desc: 'Shopify، Salla، Zid، WooCommerce، Amazon، Noon، Jumia والمزيد — في لوحة واحدة.',
              demo: '"وريني طلبات Salla وShopify مع بعض"',
              bg: '#12001a', accent: '#b060e0', iconBg: 'rgba(176,96,224,0.15)',
            },
          ].map((f, i) => (
            <div key={f.title} className="animate-fade-in-up" style={{ background: f.bg, borderRadius: 28, padding: 32, border: `1px solid ${f.accent}22`, transition: 'transform 0.2s var(--ease-spring), box-shadow 0.2s ease', animationDelay: `${i * 80}ms` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 48px rgba(0,0,0,0.4)` }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: f.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: f.accent }}>{f.icon}</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', color: T.ink, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: T.slate, lineHeight: 1.6, marginBottom: 20 }}>{f.desc}</p>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 14px', fontSize: 12.5, color: T.slate, fontFamily: 'monospace', border: `1px solid ${T.hairline}` }}>{f.demo}</div>
            </div>
          ))}
        </div>

        {/* Extra 2 features in a row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
          {[
            {
              icon: <MessageText1 size={22} variant="Outline" />, title: 'يفهم كل اللهجات',
              desc: 'مصري، سعودي، خليجي، مغربي — كلهم يشتغلون. اكتب بأي طريقة.',
            },
            {
              icon: <ShieldTick size={22} variant="Outline" />, title: 'أمان تام',
              desc: 'كل إجراء جماعي يطلب تأكيدك. لا تنفيذ مالي بدون موافقتك. بيانات مشفرة.',
            },
          ].map(f => (
            <div key={f.title} style={{ background: T.surface, borderRadius: 16, padding: '24px 28px', border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: T.canvas, border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: T.ink }}>{f.icon}</div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px', color: T.ink, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: T.slate, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ─────────────────────────────────────────────────── */}
      <section id="demo" style={{ padding: '0 40px 96px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.slate, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>جربها الآن</p>
          <h2 style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-1px', color: T.ink }}>كلّم ديما بنفسك</h2>
          <p style={{ fontSize: 16, color: T.slate, marginTop: 12, lineHeight: 1.5 }}>اضغط على أي أمر أو اكتب بحرية</p>
        </div>

        <div style={{ background: T.canvas, borderRadius: 28, border: `1px solid ${T.hairline}`, overflow: 'hidden', boxShadow: '0 12px 32px -4px rgba(5,0,56,0.08)', maxWidth: 800, margin: '0 auto' }}>
          {/* Chrome bar */}
          <div style={{ background: T.surface, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${T.hairline}` }}>
            {['#ff5f57', '#ffbd2e', '#28c940'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            <span style={{ fontSize: 12, color: T.slate, marginRight: 'auto' }}>Deema · متجرك · Shopify</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Refresh2 size={11} color={T.slate} variant="Outline" />
              <span style={{ fontSize: 11, color: T.slate }}>مباشر</span>
            </div>
          </div>

          {/* Quick command chips */}
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.hairline}`, display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {DEMO_COMMANDS.map(d => (
              <button key={d.cmd} onClick={() => sendDemoCommand(d.cmd)} disabled={typing}
                style={{ background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: 9999, padding: '7px 16px', fontSize: 12, fontWeight: 500, cursor: typing ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0, color: T.slate, fontFamily: 'inherit', opacity: typing ? 0.5 : 1, transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!typing) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = T.ink } }}
                onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.slate }}
              >{d.cmd}</button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ padding: '20px 20px 12px', minHeight: 240, maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {demoMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end', gap: 10 }}>
                {m.role === 'ai' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-start', marginTop: 2 }}>
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>D</span>
                  </div>
                )}
                <div style={{ maxWidth: '78%' }}>
                  <div style={{
                    background: m.role === 'user' ? T.surface : T.canvas,
                    border: `1px solid ${T.hairline}`,
                    borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    padding: '11px 15px', fontSize: 13.5, lineHeight: 1.6,
                    whiteSpace: 'pre-line', color: T.ink,
                  }}>{m.text}</div>
                  {m.stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${m.stats.length}, 1fr)`, gap: 6, marginTop: 8 }}>
                      {m.stats.map(s => (
                        <div key={s.l} style={{ background: T.surface, borderRadius: 12, padding: '9px 11px', border: `1px solid ${T.hairline}` }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: s.c, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
                          <div style={{ fontSize: 10, color: T.slate, marginTop: 2 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.actions && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {m.actions.map((a, ai) => (
                        <button key={a} onClick={() => sendDemoCommand(a)} disabled={typing}
                          style={{ background: ai === 0 ? '#6a4cf5' : 'transparent', color: ai === 0 ? '#fff' : T.slate, border: `1px solid ${ai === 0 ? '#6a4cf5' : T.hairline}`, borderRadius: 9999, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: typing ? 'default' : 'pointer', fontFamily: 'inherit' }}>{a}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>D</span>
                </div>
                <div style={{ background: T.canvas, borderRadius: '4px 16px 16px 16px', padding: '12px 16px', display: 'flex', gap: 4, border: `1px solid ${T.hairline}` }}>
                  {[0, 1, 2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: T.slate, animation: `bounce 1s ${j * 0.16}s ease-in-out infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={demoBottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.hairline}`, background: T.canvas }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={demoInput} onChange={e => setDemoInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && demoInput.trim() && !typing && sendDemoCommand(demoInput.trim())}
                disabled={typing}
                placeholder='اكتب أمرك بالعربي...'
                style={{ flex: 1, background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: 9999, padding: '10px 18px', fontSize: 14, color: T.ink, outline: 'none', fontFamily: 'inherit', direction: 'rtl', opacity: typing ? 0.6 : 1 }}
              />
              <button onClick={() => demoInput.trim() && !typing && sendDemoCommand(demoInput.trim())} disabled={!demoInput.trim() || typing}
                style={{ width: 38, height: 38, borderRadius: 9999, background: demoInput.trim() && !typing ? '#6a4cf5' : T.surface, border: 'none', cursor: demoInput.trim() && !typing ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send2 size={14} color={demoInput.trim() && !typing ? '#fff' : T.slate} variant="Outline" style={{ transform: 'scaleX(-1)' }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section style={{ background: T.well, borderTop: `1px solid ${T.hairline}`, borderBottom: `1px solid ${T.hairline}`, padding: '96px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.slate, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>كيف تعمل</p>
            <h2 style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-1px', color: T.ink }}>تبدأ في ٣ خطوات</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { n: '١', icon: '🔗', title: 'اربط متجرك', desc: 'أدخل مفتاح API من أي منصة. يستغرق دقيقتين.' },
              { n: '٢', icon: '💬', title: 'تكلمها بالعربي', desc: 'اكتب بأي لهجة — هي تفهمك وتقترح الخطوات.' },
              { n: '٣', icon: '⚡', title: 'تنفذ فوراً', desc: 'تطلب تأكيدك للكبيرة وتنفذ الباقي لحالها.' },
            ].map((s, i) => (
              <div key={s.n} style={{ background: T.surface, borderRadius: 16, padding: '32px 28px', border: `1px solid ${T.hairline}` }}>
                <div style={{ width: 40, height: 40, borderRadius: 9999, background: '#6a4cf5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>{i + 1}</div>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 8, color: T.ink }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: T.slate, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SLIDER ──────────────────────────────────────────────── */}
      <TestimonialsSlider />

      {/* ── PRICING ──────────────────────────────────────────────────────────── */}
      <section style={{ background: T.well, padding: '96px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>الأسعار</p>
            <h2 style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-1px', color: '#fff', marginBottom: 12 }}>ادفع على قد استخدامك</h2>
            <p style={{ fontSize: 15, color: T.muted }}>ابدأ مجاناً — سعّد في أي وقت · إلغاء وقتما تريد</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 720, margin: '0 auto' }}>
            {[
              {
                name: 'مجاني', price: '٠', period: 'دايماً مجاني', tag: null, featured: false,
                features: ['متجر واحد', '٥٠ طلب/شهر', 'المنصات الأساسية', 'دعم إيميل', 'تقارير أساسية'],
              },
              {
                name: 'برو', price: '٩٩', period: '$/شهر', tag: '🔥 الأكثر شعبية', featured: true,
                features: ['٣ متاجر', 'طلبات غير محدودة', 'جميع شركات الشحن', 'كشف الطلبات المشبوهة', 'تقارير متقدمة', 'دعم أولوية'],
              },
            ].map(tier => (
              <div key={tier.name} style={{
                background: tier.featured ? 'linear-gradient(135deg,rgba(106,76,245,0.2),rgba(212,77,240,0.12))' : 'rgba(255,255,255,0.04)',
                borderRadius: 28, padding: 32, position: 'relative',
                border: tier.featured ? '1px solid rgba(106,76,245,0.4)' : `1px solid ${T.hairline}`,
                boxShadow: tier.featured ? '0 20px 60px rgba(106,76,245,0.2)' : 'none',
              }}>
                {tier.tag && (
                  <div style={{ position: 'absolute', top: -14, right: 24 }}>
                    <span style={{ background: T.yellow, color: '#0e0e12', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 700 }}>{tier.tag}</span>
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 600, color: T.slate, marginBottom: 10 }}>{tier.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
                  <span style={{ fontSize: 52, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-3px' }}>{tier.price}</span>
                  <span style={{ fontSize: 13, color: T.slate }}>{tier.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  {tier.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <TickCircle size={14} color={tier.featured ? '#22c55e' : T.muted} variant="Outline" />
                      <span style={{ fontSize: 14, color: tier.featured ? T.ink : T.slate }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link to={ctaTo} style={{
                  display: 'flex', justifyContent: 'center', textDecoration: 'none',
                  borderRadius: 9999, padding: '12px 24px', fontSize: 14, fontWeight: 500,
                  ...(tier.featured
                    ? { background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }
                  ),
                }}>ابدأ الآن</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 40px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.slate, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>الأسئلة الشائعة</p>
          <h2 style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-1px', color: T.ink }}>عندك سؤال؟</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${T.hairline}` }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 4px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', gap: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: T.ink, letterSpacing: '-0.3px' }}>{f.q}</span>
                <ArrowDown2 size={17} color={T.slate} variant="Outline" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 4px 20px', animation: 'fadeIn 0.15s ease-out' }}>
                  <p style={{ fontSize: 15, color: T.slate, lineHeight: 1.7 }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA BANNER ─────────────────────────────────────────────────── */}
      <section style={{ padding: '0 40px 96px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ background: T.well, borderRadius: 32, padding: '80px 48px', border: `1px solid ${T.hairline}`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -100, right: -60, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, padding: '6px 18px', marginBottom: 28 }}>
            <Clock size={13} color="rgba(255,255,255,0.6)" variant="Outline" />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>ابدأ في دقيقتين</span>
          </div>

          <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1.05, color: '#fff', margin: '0 0 16px' }}>
            وقفت تضيع وقتك؟
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 40, maxWidth: 440, margin: '0 auto 40px', lineHeight: 1.5 }}>
            كل يوم بدون ديما = ساعتين ضايعتين.<br />
            +١٢٠٠ تاجر عربي بدأوا يوفروا وقتهم.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <Link to={ctaTo} style={{ background: '#fff', color: '#0e0e12', borderRadius: 9999, padding: '14px 32px', fontSize: 16, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: '-0.3px' }}>
              ابدأ مجاناً الآن <ArrowLeft2 size={15} variant="Outline" />
            </Link>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {['✅ بدون بطاقة ائتمان', '✅ ربط في دقيقتين', '✅ استرداد ٣٠ يوماً', '✅ إلغاء وقتما تريد'].map(t => (
              <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ background: T.well, padding: '64px 40px 40px', borderTop: `1px solid ${T.hairline}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: T.ink, fontWeight: 700, fontSize: 13 }}>D</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>Deema</span>
              </div>
              <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, maxWidth: 220, marginBottom: 20 }}>
                مساعد ذكاء اصطناعي متخصص في التجارة الإلكترونية العربية. يفهم لهجتك، يتصرف بسرعة.
              </p>
              <div style={{ fontSize: 12, color: T.muted }}>مصر · السعودية · الإمارات · الكويت</div>
            </div>
            {[
              { title: 'المنتج', links: [{ label: 'المميزات', to: '/features' }, { label: 'الأسعار', to: '/pricing' }, { label: 'المنصات', to: '/platforms' }, { label: 'التحديثات', to: '/changelog' }] },
              { title: 'الشركة', links: [{ label: 'من نحن', to: '/about' }, { label: 'تواصل معنا', to: '/contact' }, { label: 'المدونة', to: '/blog' }, { label: 'الوظائف', to: '/careers' }] },
              { title: 'القانوني', links: [{ label: 'الخصوصية', to: '/privacy' }, { label: 'الشروط', to: '/terms' }, { label: 'الأمان', to: '/security' }, { label: 'الكوكيز', to: '/cookies' }] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l.label} style={{ marginBottom: 10 }}>
                    <Link to={l.to} style={{ fontSize: 13, color: T.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
                    >{l.label}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: T.muted }}>© ٢٠٢٥ Deema. جميع الحقوق محفوظة.</span>
            <div style={{ display: 'flex', gap: 16 }}>
              {['تويتر', 'لينكدإن', 'إنستغرام'].map(s => (
                <a key={s} href="#" style={{ fontSize: 12, color: T.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
                >{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>
    </div>
  )
}
