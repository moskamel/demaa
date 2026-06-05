import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { fadeUp, fadeIn, scaleIn, slideInRight, stagger, buttonTap, popIn } from '../lib/animations'
import LandingNav from '../components/LandingNav'
import { PLANS } from '../lib/plans'
import { useCurrency } from '../context/CurrencyContext'
import { CURRENCIES, getPlanAmount, formatPrice } from '../lib/currency'
import CurrencySelector from '../components/CurrencySelector'
import PlanCard from '../components/PlanCard'
import {
  ArrowLeft2, TickCircle, ArrowDown2, Flash, Box, ChartSquare,
  MessageText1, ShieldTick, Global, Star1, Clock, TrendUp,
  Refresh2, People, Send2, Warning2, Timer1, DocumentText, Tag,
} from 'iconsax-react'

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
  purple: '#6a4cf5',
  pink: '#d44df0',
} as const

// Live platforms only
const PLATFORMS = [
  { name: 'Shopify',     logo: '/logos/Shopify.png' },
  { name: 'Wuilt',       logo: '/logos/Wuilt.jpg' },
  { name: 'Shantaweb',   logo: '/logos/Shantaweb.png' },
  { name: 'WooCommerce', logo: '/logos/WooCommerce.png' },
  { name: 'BigCommerce', logo: '/logos/BigCommerce.webp' },
  { name: 'Wix',         logo: '/logos/Wix.png' },
  { name: 'Ecwid',       logo: '/logos/Ecwid.png' },
]

const DEMO_COMMANDS = [
  {
    cmd: 'وريني الطلبات المعلقة',
    response: 'عندك ٣٥ طلب معلق 📦\n١٤,٥٠٠ ج.م إجمالي — ٨ طلبات فيها مشاكل',
    stats: [{ n: '35', l: 'معلق', c: '#ff7a3d' }, { n: '14,500', l: 'ج.م', c: T.ink }, { n: '8', l: 'مشكلة ⚠️', c: '#ff5577' }],
    actions: ['اقبل الجاهزة', 'وريني المشاكل'],
  },
  {
    cmd: 'اقبل الطلبات السليمة',
    response: '✅ هقبل ٢٧ طلب — ١١,٢٠٠ ج.م\n⏩ بوالص الشحن هتتعمل تلقائياً',
    stats: [{ n: '27', l: 'هيتقبل', c: '#22c55e' }, { n: '8', l: 'مشكلة', c: '#ff5577' }, { n: '2', l: 'دقيقة', c: '#0099ff' }],
    actions: ['نعم، نفّذ', 'وريني المشاكل الأول'],
  },
  {
    cmd: 'مبيعات الأسبوع',
    response: 'أسبوع قوي 💪\nهذا الأسبوع: ٣٨,٤٠٠ ج.م\nنمو +٢٣٪ عن الأسبوع الماضي',
    stats: [{ n: '38,400', l: 'ج.م', c: T.ink }, { n: '+23%', l: 'نمو', c: '#22c55e' }, { n: '142', l: 'طلب', c: '#0099ff' }],
    actions: ['تقرير مفصل', 'قارن بالشهر'],
  },
  {
    cmd: 'كام منتج نافد؟',
    response: '⚠️ ٥ منتجات على وشك النفاد\nأهمهم: عطر الدهب — باقي ٣ قطع فقط',
    stats: [{ n: '5', l: 'نافد قريباً', c: '#ff7a3d' }, { n: '3', l: 'نافد فعلاً', c: '#ff5577' }, { n: '62', l: 'منتج آمن', c: '#22c55e' }],
    actions: ['وريني التفاصيل', 'اعمل تنبيه'],
  },
]

const TESTIMONIALS = [
  {
    name: 'أحمد السيد', role: 'صاحب متجر ملابس · Shopify', city: 'القاهرة',
    avatar: T.purple,
    quote: 'كنت باخد ساعتين كل صبح على الطلبات. دلوقتي ديما بتخلصها في ٥ دقايق وأنا بشرب قهوتي.',
    metric: 'وفّر ٢ ساعة يومياً',
  },
  {
    name: 'نورة الشمري', role: 'صاحبة متجر عطور · Wuilt', city: 'الرياض',
    avatar: '#ff0080',
    quote: 'المهم إنها تفهم السعودي. أكلمها بأي كلمة وتفهم المراد وتنفذ على الفور. الآن مبيعاتي زادت لأني صرت أركز على التسويق.',
    metric: 'زيادة مبيعات +٣١٪',
  },
  {
    name: 'محمد الفارسي', role: 'مدير متجر إلكتروني · WooCommerce', city: 'دبي',
    avatar: '#00dfd8',
    quote: 'ربطت ٣ متاجر بديما في يوم واحد. الآن كل الطلبات في مكان واحد وفريقي يعمل بكفاءة أكبر.',
    metric: '٣ متاجر · لوحة واحدة',
  },
]

const FAQS = [
  { q: 'هل أحتاج خبرة تقنية لاستخدام ديما؟', a: 'لا إطلاقاً. ديما تشتغل بالعربي الطبيعي. اكتب بأي طريقة وهي تفهمك — مصري، سعودي، خليجي. لا برمجة، لا تدريب.' },
  { q: 'هل ديما آمنة لبيانات متجري؟', a: 'كل إجراء يشمل فلوس أو شحن يطلب تأكيدك الصريح. لا تنفيذ بدون موافقتك. البيانات مشفرة بالكامل ومخزنة بأمان.' },
  { q: 'ما هي منصات التجارة المدعومة؟', a: 'Shopify، Wuilt، Shantaweb، WooCommerce، BigCommerce، Wix، Ecwid — وأكثر يضاف قريباً.' },
  { q: 'كم يستغرق ربط متجري؟', a: 'دقيقتين فقط. أدخل مفتاح API الخاص بمتجرك وديما تبدأ تشتغل على الفور. لا إعداد معقد.' },
  { q: 'هل يمكنني إدارة أكثر من متجر؟', a: 'نعم، في الخطة المدفوعة تستطيع ربط متاجر متعددة وإدارتها جميعاً من لوحة واحدة.' },
  { q: 'ماذا لو لم أكن راضياً عن الخدمة؟', a: 'لديك ٣٠ يوماً لاسترداد كامل المبلغ بدون أسئلة. نثق في منتجنا وأنت تجرب بدون مخاطرة.' },
]


// ── Sub-components ─────────────────────────────────────────────────────────────

function ScrollSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} variants={stagger(0.08)} initial="hidden" animate={isInView ? 'show' : 'hidden'}>
      {children}
    </motion.div>
  )
}

function GlowOrb({ top, left, right, color = T.purple, size = 400, opacity = 0.12 }: { top?: number | string; left?: number | string; right?: number | string; color?: string; size?: number; opacity?: number }) {
  return (
    <div style={{
      position: 'absolute', top, left, right,
      width: size, height: size, borderRadius: '50%',
      background: color, filter: `blur(${size * 0.35}px)`,
      opacity, pointerEvents: 'none', zIndex: 0,
    }} />
  )
}

function TestimonialsSlider() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCurrent(i => (i + 1) % TESTIMONIALS.length), 4500)
    return () => clearInterval(t)
  }, [])
  const t = TESTIMONIALS[current]
  return (
    <section style={{ padding: '96px 200px', position: 'relative', overflow: 'hidden' }}>
      <GlowOrb top={-100} left="50%" color={T.purple} size={500} opacity={0.07} />
      <div style={{ textAlign: 'center', marginBottom: 56, position: 'relative' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: T.purple, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>آراء التجار</p>
        <h2 style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800, letterSpacing: '-1px', color: T.ink }}>تجار حقيقيون، نتائج حقيقية</h2>
      </div>
      <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            style={{ background: 'linear-gradient(135deg,rgba(106,76,245,0.08),rgba(212,77,240,0.04))', borderRadius: 28, padding: '40px 40px', border: `1px solid rgba(106,76,245,0.2)`, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array(5).fill(0).map((_, i) => <Star1 key={i} size={16} color="#f59e0b" variant="Bold" />)}
            </div>
            <p style={{ fontSize: 19, color: T.ink, lineHeight: 1.75, letterSpacing: '-0.2px', fontStyle: 'italic' }}>"{t.quote}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: `1px solid ${T.hairline}`, paddingTop: 20 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: t.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{t.name}</div>
                <div style={{ fontSize: 12, color: T.slate, marginTop: 2 }}>{t.role} · {t.city}</div>
              </div>
              <div style={{ background: T.yellow, borderRadius: 9999, padding: '5px 14px', fontSize: 12, color: '#0e0e12', fontWeight: 700, whiteSpace: 'nowrap' }}>{t.metric}</div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 28 : 8, height: 8, borderRadius: 9999, border: 'none', cursor: 'pointer', background: i === current ? T.purple : 'rgba(255,255,255,0.15)', transition: 'all 0.3s ease', padding: 0 }} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Landing() {
  const isAuthed = !!localStorage.getItem('deema_token')
  const ctaTo = isAuthed ? '/dashboard' : '/signup'
  const { currency } = useCurrency()
  const [pricingBilling, setPricingBilling] = useState<'monthly' | 'yearly'>('monthly')

  const [demoIdx, setDemoIdx] = useState(0)
  const [demoInput, setDemoInput] = useState('')
  const [demoMessages, setDemoMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; stats?: typeof DEMO_COMMANDS[0]['stats']; actions?: string[] }>>([
    { role: 'ai', text: 'صباح الخير! 🌅 أنا ديما، مساعدك الذكي. عندك ٤٧ طلب جديد و٣ مشاكل تحتاج انتباهك. كيف أساعدك؟', stats: [{ n: '47', l: 'طلب جديد', c: '#ff7a3d' }, { n: '14k', l: 'ج.م اليوم', c: T.ink }, { n: '3', l: 'مشاكل', c: '#ff5577' }] },
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

  const btnPrimary: React.CSSProperties = {
    background: 'linear-gradient(135deg, #6a4cf5, #d44df0)',
    color: '#fff',
    borderRadius: 9999,
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 700,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '-0.1px',
    boxShadow: '0 4px 24px rgba(106,76,245,0.4)',
  }

  return (
    <div dir="rtl" style={{ background: T.canvas, color: T.ink, minHeight: '100vh', overflowX: 'hidden', fontFamily: 'Zain, sans-serif', paddingTop: 64 }}>
      <LandingNav />

      {/* ── HERO ── */}
      <section style={{ padding: '100px 200px 80px', position: 'relative', overflow: 'hidden' }}>
        <GlowOrb top={-80} right={80} color={T.purple} size={480} opacity={0.14} />
        <GlowOrb top={60} right={-60} color={T.pink} size={320} opacity={0.09} />

        <motion.div variants={stagger(0.1)} initial="hidden" animate="show"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', position: 'relative', zIndex: 1 }}>

          <div>
            <motion.div variants={popIn} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,208,47,0.12)', border: '1px solid rgba(255,208,47,0.25)', borderRadius: 9999, padding: '6px 16px', marginBottom: 28 }}>
              <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: T.yellow }}>+١٢٠٠ تاجر يستخدمون ديما الآن</span>
            </motion.div>

            <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(44px,5.5vw,76px)', fontWeight: 800, lineHeight: 1.07, letterSpacing: '-2.5px', color: T.ink, margin: '0 0 22px' }}>
              مساعدك الذكي<br />
              لإدارة متجرك<br />
              <span style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>بجملة عربية</span>
            </motion.h1>

            <motion.p variants={fadeUp} style={{ fontSize: 18, lineHeight: 1.65, color: T.slate, margin: '0 0 36px', maxWidth: 440 }}>
              اقبل طلباتك، أنشئ بوالص الشحن، وتابع مبيعاتك —<br />كل ذلك بكلمة واحدة بالعربي. بدون تدريب، بدون تعقيد.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={buttonTap}>
                <Link to={ctaTo} style={{ ...btnPrimary, padding: '15px 32px', fontSize: 16 }}>
                  ابدأ مجاناً — بدون بطاقة <ArrowLeft2 size={16} variant="Outline" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={buttonTap}>
                <a href="#demo" style={{ ...btnPrimary, background: 'transparent', boxShadow: 'none', border: `1px solid ${T.hairline}`, color: T.slate, padding: '15px 24px', fontSize: 15 }}>
                  جرب التجربة التفاعلية
                </a>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeIn} style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              {['✅ ربط في دقيقتين', '✅ ٧ منصات مدعومة', '✅ استرداد ٣٠ يوماً'].map(t => (
                <span key={t} style={{ fontSize: 13, color: T.slate }}>{t}</span>
              ))}
            </motion.div>
          </div>

          {/* Chat mockup */}
          <motion.div variants={slideInRight}
            whileHover={{ y: -8, boxShadow: '0 48px 96px rgba(0,0,0,0.7)' }}
            transition={{ duration: 0.3 }}
            style={{ background: T.surface, borderRadius: 24, border: `1px solid rgba(106,76,245,0.2)`, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
            {/* Window bar */}
            <div style={{ background: T.well, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: `1px solid ${T.hairline}` }}>
              {['#ff5f57', '#ffbd2e', '#28c940'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              <span style={{ color: T.slate, fontSize: 12, marginRight: 'auto' }}>Deema · متجر النور · Shopify</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: 11, color: '#22c55e' }}>متصل</span>
              </div>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, height: 320, overflowY: 'auto' }}>
              {[
                { text: 'صباح الخير! عندك ٤٧ طلب جديد — ١٤k ج.م 🌅', isAi: true },
                { text: 'اقبل الطلبات السليمة', isAi: false },
                { text: '✅ هقبل ٣٥ طلب — ١١,٢٠٠ ج.م\n⏩ بوالص الشحن جاهزة', isAi: true },
                { text: 'نعم نفذ', isAi: false },
                { text: '🚀 تم! ٣٥ بوليصة شحن اتبعتت للعملاء تلقائياً.', isAi: true },
              ].map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.35, ease: 'easeOut' }}
                  style={{ display: 'flex', justifyContent: m.isAi ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    background: m.isAi ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#6a4cf5,#8b5cf6)',
                    color: T.ink, borderRadius: m.isAi ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    padding: '10px 14px', fontSize: 13, maxWidth: '82%',
                    border: `1px solid ${m.isAi ? T.hairline : 'transparent'}`,
                    lineHeight: 1.55, whiteSpace: 'pre-line',
                  }}>{m.text}</div>
                </motion.div>
              ))}
            </div>
            <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.hairline}`, background: T.canvas }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.surface, borderRadius: 9999, padding: '9px 16px', border: `1px solid ${T.hairline}` }}>
                <span style={{ fontSize: 13, color: T.muted, flex: 1 }}>اكتب أمرك بالعربي...</span>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send2 size={12} color="#fff" variant="Outline" style={{ transform: 'scaleX(-1)' }} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '0 200px 80px' }}>
        <div ref={statsRef} style={{ background: 'linear-gradient(135deg,rgba(106,76,245,0.07),rgba(212,77,240,0.04))', border: `1px solid rgba(106,76,245,0.15)`, borderRadius: 28, padding: '52px 40px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
          {[
            { value: countOrders.toLocaleString('ar-EG') + '+', label: 'طلب تمت معالجته', sub: 'خلال الأشهر الماضية', icon: <Box size={22} color="#ff7a3d" variant="Outline" />, accent: '#ff7a3d' },
            { value: '$' + countRevenue + 'M+', label: 'حجم المبيعات', sub: 'عبر منصات متعددة', icon: <TrendUp size={22} color="#22c55e" variant="Outline" />, accent: '#22c55e' },
            { value: countMerchants.toLocaleString('ar-EG') + '+', label: 'تاجر يثق بديما', sub: 'في مصر والسعودية والخليج', icon: <People size={22} color={T.blue} variant="Outline" />, accent: T.blue },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0 48px', borderRight: i < 2 ? `1px solid ${T.hairline}` : 'none' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 14, background: `${s.accent}14`, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 'clamp(40px,4vw,58px)', fontWeight: 800, color: T.ink, letterSpacing: '-3px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginTop: 10 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: T.slate, marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <ScrollSection>
      <section style={{ background: T.well, borderTop: `1px solid ${T.hairline}`, borderBottom: `1px solid ${T.hairline}`, padding: '88px 200px', position: 'relative', overflow: 'hidden' }}>
        <GlowOrb top={-100} left={-100} color="#ff5577" size={400} opacity={0.05} />
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56, position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#ff7a3d', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>مشاكل يومية</p>
          <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 800, letterSpacing: '-1px', color: T.ink, marginBottom: 14 }}>هل تعاني من هذه المشاكل كل يوم؟</h2>
          <p style={{ fontSize: 16, color: T.slate, maxWidth: 500, margin: '0 auto', lineHeight: 1.65 }}>معظم أصحاب المتاجر يضيعون ساعات في مهام يمكن لديما إنجازها في ثوانٍ</p>
        </motion.div>

        <motion.div variants={stagger(0.07)} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, position: 'relative', zIndex: 1 }}>
          {[
            { icon: <Timer1 size={22} variant="Outline" />, color: '#ff7a3d', title: 'ساعات ضايعة كل يوم', desc: 'إدارة الطلبات يدوياً تأخذ ساعتين أو أكثر كل صباح — وقت كان يمكن استثماره في تنمية متجرك.' },
            { icon: <Warning2 size={22} variant="Outline" />, color: '#ff5577', title: 'طلبات مشبوهة تضيع فلوسك', desc: 'بدون فلترة ذكية، الطلبات الوهمية والكاش المشبوه تكلفك خسائر حقيقية كل شهر.' },
            { icon: <DocumentText size={22} variant="Outline" />, color: '#0099ff', title: 'تقارير منقطعة وبيانات متفرقة', desc: 'بياناتك موزعة على منصات مختلفة ولا توجد لوحة واحدة تجمع كل شيء.' },
            { icon: <Tag size={22} variant="Outline" />, color: '#22c55e', title: 'مخزون ينفد بدون تنبيه', desc: 'تكتشف نفاد المخزون بعد خسارة طلبات — لا إشعارات مسبقة، لا متابعة تلقائية.' },
            { icon: <People size={22} variant="Outline" />, color: '#d44df0', title: 'فريق بدون تنسيق', desc: 'كل عضو في الفريق يعمل بطريقة مختلفة وصلاحيات غير واضحة تسبب أخطاء متكررة.' },
            { icon: <Flash size={22} variant="Outline" />, color: T.yellow, title: 'شحن بطيء يغضب العملاء', desc: 'تأخير إنشاء بوالص الشحن يرفع معدل إلغاء الطلبات ويضر بتقييم متجرك.' },
          ].map(p => (
            <motion.div key={p.title} variants={scaleIn}
              whileHover={{ y: -6, borderColor: p.color + '44', boxShadow: `0 20px 48px rgba(0,0,0,0.35)` }}
              transition={{ duration: 0.2 }}
              style={{ background: T.surface, borderRadius: 20, padding: '28px 24px', border: `1px solid ${T.hairline}`, cursor: 'default' }}>
              <motion.div whileHover={{ scale: 1.12, rotate: -5 }} transition={{ duration: 0.2 }}
                style={{ width: 46, height: 46, borderRadius: 13, background: `${p.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: p.color }}>{p.icon}</motion.div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 8, letterSpacing: '-0.3px' }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: T.slate, lineHeight: 1.65 }}>{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: 52, position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 22 }}>ديما تحل كل هذا — بجملة عربية واحدة</p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
            <Link to={ctaTo} style={{ ...btnPrimary, padding: '14px 32px', fontSize: 15 }}>
              جرب ديما مجاناً <ArrowLeft2 size={15} variant="Outline" />
            </Link>
          </motion.div>
        </div>
      </section>
      </ScrollSection>

      {/* ── PLATFORMS TICKER ── */}
      <section style={{ borderBottom: `1px solid ${T.hairline}`, padding: '28px 0', overflow: 'hidden', background: T.canvas }}>
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: T.slate, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>يتصل بمنصات التجارة الكبرى</p>
        <div style={{ display: 'flex', gap: 0, animation: 'ticker 20s linear infinite', width: 'max-content' }}>
          {[...PLATFORMS, ...PLATFORMS, ...PLATFORMS].map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 32px', borderRight: `1px solid ${T.hairline}`, whiteSpace: 'nowrap' }}>
              <img src={p.logo} alt={p.name} style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: 4 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.slate }}>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <ScrollSection>
      <section style={{ padding: '96px 200px' }}>
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.purple, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>المميزات</p>
          <h2 style={{ fontSize: 'clamp(32px,4vw,50px)', fontWeight: 800, letterSpacing: '-1.5px', color: T.ink, marginBottom: 14 }}>كل ما يحتاجه متجرك في مكان واحد</h2>
          <p style={{ fontSize: 16, color: T.slate, maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>ديما مش مجرد أداة — هي العضو الأذكى في فريقك</p>
        </motion.div>

        <motion.div variants={stagger(0.1)} style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {[
            { icon: <Box size={26} variant="Outline" />, title: 'إدارة الطلبات بذكاء', desc: 'اقبل، ارفض، وتابع طلباتك بجملة واحدة. ديما تكشف الطلبات المشبوهة وتنبهك قبل الشحن.', demo: '"اقبل الطلبات السليمة وحاسبني على المشبوهة"', bg: 'rgba(200,150,10,0.06)', accent: '#c8960a', border: 'rgba(200,150,10,0.15)' },
            { icon: <Flash size={26} variant="Outline" />, title: 'شحن فوري تلقائي', desc: 'ينشئ بوالص الشحن ويرسل رقم التتبع للعميل تلقائياً — كل هذا بثوانٍ بدون أي جهد.', demo: '"اشحن الطلبات المقبولة"', bg: 'rgba(224,85,85,0.06)', accent: '#e05555', border: 'rgba(224,85,85,0.15)' },
            { icon: <ChartSquare size={26} variant="Outline" />, title: 'تقارير ذكية وتنبيهات فورية', desc: 'ملخص يومي كل صباح، تنبيهات عند نفاد المخزون، وتحليل مبيعاتك مقارنة بالفترات السابقة.', demo: '"وريني مبيعات هذا الأسبوع مقارنة بالأسبوع الفائت"', bg: 'rgba(26,184,174,0.06)', accent: '#1ab8ae', border: 'rgba(26,184,174,0.15)' },
            { icon: <Global size={26} variant="Outline" />, title: 'كل متاجرك في لوحة واحدة', desc: 'Shopify، Wuilt، WooCommerce وأكثر — متاجر متعددة، طلباتها جميعاً عندك في مكان واحد.', demo: '"وريني طلبات كل المتاجر مع بعض"', bg: 'rgba(176,96,224,0.06)', accent: '#b060e0', border: 'rgba(176,96,224,0.15)' },
          ].map((f) => (
            <motion.div key={f.title} variants={fadeUp}
              whileHover={{ y: -6, boxShadow: '0 28px 60px rgba(0,0,0,0.5)' }}
              transition={{ duration: 0.2 }}
              style={{ background: f.bg, borderRadius: 28, padding: 36, border: `1px solid ${f.border}` }}>
              <motion.div whileHover={{ scale: 1.1, rotate: -8 }} transition={{ duration: 0.2 }}
                style={{ width: 52, height: 52, borderRadius: 16, background: `${f.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, color: f.accent }}>{f.icon}</motion.div>
              <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: T.ink, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: T.slate, lineHeight: 1.65, marginBottom: 20 }}>{f.desc}</p>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: T.muted, fontFamily: 'monospace', border: `1px solid ${T.hairline}` }}>{f.demo}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={stagger(0.12)} style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginTop: 16 }}>
          {[
            { icon: <MessageText1 size={22} variant="Outline" />, title: 'يفهم كل اللهجات العربية', desc: 'مصري، سعودي، خليجي — كلهم يشتغلون. اكتب بأي طريقة وديما تفهمك على الفور.', accent: T.purple },
            { icon: <ShieldTick size={22} variant="Outline" />, title: 'أمان كامل لبياناتك', desc: 'كل إجراء جماعي يطلب تأكيدك. لا تنفيذ مالي بدون موافقتك الصريحة. بيانات مشفرة.', accent: '#22c55e' },
          ].map(f => (
            <motion.div key={f.title} variants={fadeUp}
              whileHover={{ y: -3, borderColor: `${f.accent}33` }}
              style={{ background: T.surface, borderRadius: 18, padding: '24px 28px', border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `${f.accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: f.accent }}>{f.icon}</div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px', color: T.ink, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: T.slate, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
      </ScrollSection>

      {/* ── INTERACTIVE DEMO ── */}
      <section id="demo" style={{ padding: '0 200px 96px', position: 'relative', overflow: 'hidden' }}>
        <GlowOrb top={0} left="50%" color={T.purple} size={400} opacity={0.07} />
        <div style={{ textAlign: 'center', marginBottom: 52, position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.purple, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>جرب بنفسك</p>
          <h2 style={{ fontSize: 'clamp(32px,4vw,50px)', fontWeight: 800, letterSpacing: '-1.5px', color: T.ink }}>كلّم ديما الآن</h2>
          <p style={{ fontSize: 16, color: T.slate, marginTop: 12, lineHeight: 1.5 }}>اضغط على أي أمر أو اكتب بحرية — ديما تفهمك</p>
        </div>

        <div style={{ background: T.surface, borderRadius: 28, border: `1px solid rgba(106,76,245,0.2)`, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', maxWidth: 820, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ background: T.well, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${T.hairline}` }}>
            {['#ff5f57', '#ffbd2e', '#28c940'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            <span style={{ fontSize: 12, color: T.slate, marginRight: 'auto' }}>Deema · متجرك · Shopify</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 11, color: '#22c55e' }}>مباشر</span>
            </div>
          </div>

          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.hairline}`, display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {DEMO_COMMANDS.map(d => (
              <button key={d.cmd} onClick={() => sendDemoCommand(d.cmd)} disabled={typing}
                style={{ background: T.canvas, border: `1px solid ${T.hairline}`, borderRadius: 9999, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: typing ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0, color: T.slate, fontFamily: 'inherit', opacity: typing ? 0.5 : 1, transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!typing) { e.currentTarget.style.background = 'rgba(106,76,245,0.15)'; e.currentTarget.style.color = '#c4b5fd'; e.currentTarget.style.borderColor = 'rgba(106,76,245,0.3)' } }}
                onMouseLeave={e => { e.currentTarget.style.background = T.canvas; e.currentTarget.style.color = T.slate; e.currentTarget.style.borderColor = T.hairline }}
              >{d.cmd}</button>
            ))}
          </div>

          <div style={{ padding: '20px 20px 12px', minHeight: 240, maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {demoMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end', gap: 10 }}>
                {m.role === 'ai' && (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-start', marginTop: 2 }}>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>D</span>
                  </div>
                )}
                <div style={{ maxWidth: '78%' }}>
                  <div style={{
                    background: m.role === 'user' ? 'linear-gradient(135deg,#6a4cf5,#8b5cf6)' : 'rgba(255,255,255,0.05)',
                    border: m.role === 'user' ? 'none' : `1px solid ${T.hairline}`,
                    borderRadius: m.role === 'user' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                    padding: '11px 15px', fontSize: 14, lineHeight: 1.6,
                    whiteSpace: 'pre-line', color: T.ink,
                  }}>{m.text}</div>
                  {m.stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${m.stats.length},1fr)`, gap: 6, marginTop: 8 }}>
                      {m.stats.map(s => (
                        <div key={s.l} style={{ background: T.canvas, borderRadius: 12, padding: '10px 12px', border: `1px solid ${T.hairline}` }}>
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
                          style={{ background: ai === 0 ? 'linear-gradient(135deg,#6a4cf5,#8b5cf6)' : 'transparent', color: ai === 0 ? '#fff' : T.slate, border: `1px solid ${ai === 0 ? 'transparent' : T.hairline}`, borderRadius: 9999, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: typing ? 'default' : 'pointer', fontFamily: 'inherit' }}>{a}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>D</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', display: 'flex', gap: 5, border: `1px solid ${T.hairline}` }}>
                  {[0, 1, 2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: T.purple, animation: `bounce 1s ${j * 0.16}s ease-in-out infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={demoBottomRef} />
          </div>

          <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.hairline}`, background: T.well }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={demoInput} onChange={e => setDemoInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && demoInput.trim() && !typing && sendDemoCommand(demoInput.trim())}
                disabled={typing}
                placeholder="اكتب أمرك بالعربي..."
                style={{ flex: 1, background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: 9999, padding: '11px 18px', fontSize: 14, color: T.ink, outline: 'none', fontFamily: 'inherit', direction: 'rtl', opacity: typing ? 0.6 : 1, transition: 'border-color 0.15s' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(106,76,245,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = T.hairline)}
              />
              <button onClick={() => demoInput.trim() && !typing && sendDemoCommand(demoInput.trim())} disabled={!demoInput.trim() || typing}
                style={{ width: 40, height: 40, borderRadius: '50%', background: demoInput.trim() && !typing ? 'linear-gradient(135deg,#6a4cf5,#d44df0)' : T.surface, border: 'none', cursor: demoInput.trim() && !typing ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', boxShadow: demoInput.trim() && !typing ? '0 4px 16px rgba(106,76,245,0.4)' : 'none' }}>
                <Send2 size={15} color={demoInput.trim() && !typing ? '#fff' : T.muted} variant="Outline" style={{ transform: 'scaleX(-1)' }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: T.well, borderTop: `1px solid ${T.hairline}`, borderBottom: `1px solid ${T.hairline}`, padding: '96px 200px', position: 'relative', overflow: 'hidden' }}>
        <GlowOrb top={-60} right={-80} color={T.purple} size={380} opacity={0.07} />
        <div style={{ textAlign: 'center', marginBottom: 60, position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.purple, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>كيف تبدأ</p>
          <h2 style={{ fontSize: 'clamp(32px,4vw,50px)', fontWeight: 800, letterSpacing: '-1.5px', color: T.ink }}>متجرك جاهز في ٣ دقائق</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, position: 'relative', zIndex: 1 }}>
          {[
            { n: 1, emoji: '🔗', title: 'اربط متجرك', desc: 'أدخل مفتاح API من Shopify أو Wuilt أو أي منصة أخرى. دقيقتين ويتم الربط.' },
            { n: 2, emoji: '💬', title: 'كلّم ديما بالعربي', desc: 'اكتب بأي لهجة عربية — هي تفهمك وتعرض الخيارات المناسبة لك.' },
            { n: 3, emoji: '⚡', title: 'ديما تنفذ فوراً', desc: 'تطلب تأكيدك للإجراءات الكبيرة وتنفذ الباقي في ثوانٍ — بدون تعقيد.' },
          ].map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -6 }}
              style={{ background: T.surface, borderRadius: 22, padding: '36px 28px', border: `1px solid ${T.hairline}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(106,76,245,0.05)' }} />
              <div style={{ display: 'inline-flex', width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, marginBottom: 18 }}>{s.n}</div>
              <div style={{ fontSize: 38, marginBottom: 14 }}>{s.emoji}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 10, color: T.ink }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: T.slate, lineHeight: 1.7 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 52, position: 'relative', zIndex: 1 }}>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
            <Link to={ctaTo} style={{ ...btnPrimary, padding: '14px 36px', fontSize: 15 }}>
              ابدأ الآن — مجاناً <ArrowLeft2 size={15} variant="Outline" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <TestimonialsSlider />

      {/* ── PRICING ── */}
      <section style={{ background: T.well, padding: '96px 200px', borderTop: `1px solid ${T.hairline}`, position: 'relative', overflow: 'hidden' }}>
        <GlowOrb top={-80} left="50%" color={T.pink} size={450} opacity={0.06} />
        <div style={{ textAlign: 'center', marginBottom: 60, position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.purple, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>الأسعار</p>
          <h2 style={{ fontSize: 'clamp(32px,4vw,50px)', fontWeight: 800, letterSpacing: '-1.5px', color: T.ink, marginBottom: 12 }}>ابدأ مجاناً — طوّر متى تريد</h2>
          <p style={{ fontSize: 15, color: T.slate }}>لا توجد عقود · إلغاء وقتما تريد · استرداد ٣٠ يوماً</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 9999, padding: 4, border: `1px solid ${T.hairline}`, gap: 4 }}>
              {(['monthly', 'yearly'] as const).map(b => (
                <button key={b} onClick={() => setPricingBilling(b)} style={{
                  padding: '6px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                  background: pricingBilling === b ? 'linear-gradient(135deg,#6a4cf5,#d44df0)' : 'transparent',
                  color: pricingBilling === b ? '#fff' : T.slate,
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {b === 'monthly' ? 'شهري' : 'سنوي'}
                  {b === 'yearly' && (
                    <span style={{ fontSize: 9, fontWeight: 700, borderRadius: 9999, padding: '1px 5px', background: pricingBilling === 'yearly' ? 'rgba(255,255,255,0.2)' : 'rgba(34,197,94,0.15)', color: pricingBilling === 'yearly' ? '#fff' : '#22c55e' }}>
                      وفّر ١٦٪
                    </span>
                  )}
                </button>
              ))}
            </div>
            <CurrencySelector />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, position: 'relative', zIndex: 1, paddingTop: 18 }}>
          {PLANS.map((tier, i) => (
            <PlanCard
              key={tier.id}
              plan={tier}
              currency={currency}
              billing={pricingBilling}
              index={i}
              cta={
                <Link to={ctaTo} style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  textDecoration: 'none', borderRadius: 9999, padding: '12px 16px',
                  fontSize: 13, fontWeight: 700,
                  ...(tier.featured
                    ? { background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', boxShadow: '0 4px 20px rgba(106,76,245,0.4)' }
                    : { background: 'rgba(255,255,255,0.06)', color: T.ink, border: `1px solid ${T.hairline}` }
                  ),
                }}>ابدأ الآن</Link>
              }
            />
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: T.muted, position: 'relative', zIndex: 1 }}>
          تحتاج حجم أكبر؟ <Link to="/billing" style={{ color: T.purple, textDecoration: 'none', fontWeight: 600 }}>شاهد جميع الباقات →</Link>
        </p>
      </section>

      {/* ── FAQ ── */}
      <ScrollSection>
      <section style={{ padding: '96px 200px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.purple, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>الأسئلة الشائعة</p>
            <h2 style={{ fontSize: 'clamp(32px,4vw,50px)', fontWeight: 800, letterSpacing: '-1.5px', color: T.ink }}>عندك سؤال؟ عندنا الجواب</h2>
          </motion.div>
          <motion.div variants={stagger(0.06)} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {FAQS.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ background: openFaq === i ? 'rgba(106,76,245,0.05)' : 'transparent', borderRadius: 16, border: `1px solid ${openFaq === i ? 'rgba(106,76,245,0.2)' : T.hairline}`, overflow: 'hidden', transition: 'all 0.2s' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', gap: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: openFaq === i ? T.ink : T.ink, letterSpacing: '-0.3px' }}>{f.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
                    <ArrowDown2 size={17} color={openFaq === i ? T.purple : T.slate} variant="Outline" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}>
                      <p style={{ fontSize: 15, color: T.slate, lineHeight: 1.7, padding: '0 24px 20px' }}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      </ScrollSection>

      {/* ── FINAL CTA ── */}
      <ScrollSection>
      <section style={{ padding: '0 200px 100px' }}>
        <motion.div variants={scaleIn}
          style={{ background: 'linear-gradient(135deg,rgba(106,76,245,0.18),rgba(212,77,240,0.12))', borderRadius: 36, padding: '88px 48px', border: '1px solid rgba(106,76,245,0.3)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <GlowOrb top={-120} left={-100} color={T.purple} size={400} opacity={0.2} />
          <GlowOrb top={-60} right={-100} color={T.pink} size={350} opacity={0.15} />

          <motion.div variants={fadeIn} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, padding: '7px 18px', marginBottom: 32, position: 'relative', zIndex: 1 }}>
            <Clock size={13} color="rgba(255,255,255,0.6)" variant="Outline" />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>ابدأ في أقل من دقيقتين</span>
          </motion.div>

          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(36px,5vw,68px)', fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1.05, color: '#fff', margin: '0 0 18px', position: 'relative', zIndex: 1 }}>
            متجرك يستحق مساعداً ذكياً
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 44, maxWidth: 480, margin: '0 auto 44px', lineHeight: 1.65, position: 'relative', zIndex: 1 }}>
            انضم لـ +١٢٠٠ تاجر عربي يوفرون ساعات كل يوم<br />
            ويركزون على تنمية أعمالهم بدلاً من إدارة الطلبات.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32, position: 'relative', zIndex: 1 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to={ctaTo} style={{ ...btnPrimary, padding: '17px 40px', fontSize: 17, boxShadow: '0 8px 40px rgba(106,76,245,0.5)' }}>
                ابدأ مجاناً الآن <ArrowLeft2 size={17} variant="Outline" />
              </Link>
            </motion.div>
          </motion.div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            {['✅ بدون بطاقة ائتمان', '✅ ربط في دقيقتين', '✅ استرداد ٣٠ يوماً', '✅ إلغاء وقتما تريد'].map(t => (
              <span key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{t}</span>
            ))}
          </div>
        </motion.div>
      </section>
      </ScrollSection>

      {/* ── FOOTER ── */}
      <footer style={{ background: T.well, padding: '64px 200px 40px', borderTop: `1px solid ${T.hairline}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(106,76,245,0.4)' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>D</span>
              </div>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Deema</span>
            </div>
            <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.75, maxWidth: 220, marginBottom: 20 }}>
              مساعد ذكاء اصطناعي متخصص في التجارة الإلكترونية العربية. يفهم لهجتك، يتصرف بسرعة.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['🇪🇬 مصر', '🇸🇦 السعودية', '🇦🇪 الإمارات', '🇰🇼 الكويت'].map(f => (
                <span key={f} style={{ fontSize: 11, color: T.muted, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.hairline}`, borderRadius: 6, padding: '3px 8px' }}>{f}</span>
              ))}
            </div>
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
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: T.muted }}>© ٢٠٢٦ Deema. جميع الحقوق محفوظة.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {['تويتر', 'لينكدإن', 'إنستغرام'].map(s => (
              <a key={s} href="#" style={{ fontSize: 12, color: T.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
              >{s}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
