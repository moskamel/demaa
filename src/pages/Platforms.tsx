import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageLayout from '../components/PageLayout'

type Status = 'live' | 'soon' | 'partner'

const platforms: {
  logo: string
  name: string
  desc: string
  status: Status
  tokenLabel?: string
  tokenHint?: string
}[] = [
  // ── Live: Public API, no partner needed ─────────────────────────────────────
  {
    logo: '/logos/Shopify.png',
    name: 'Shopify',
    status: 'live',
    desc: 'أكبر منصة تجارة إلكترونية في العالم. API عام وموثق. اربط متجرك بـ Deema في دقيقتين عبر Admin API Key.',
    tokenLabel: 'Admin API Access Token',
    tokenHint: 'من لوحة Shopify ← Apps ← API credentials',
  },
  {
    logo: '/logos/WooCommerce.png',
    name: 'WooCommerce',
    status: 'live',
    desc: 'أشهر إضافة تجارة على WordPress. REST API مدمج ومفتوح بالكامل. Consumer Key + Secret يكفيان للربط الكامل.',
    tokenLabel: 'Consumer Key:Consumer Secret',
    tokenHint: 'من WooCommerce ← Settings ← Advanced ← REST API',
  },
  {
    logo: '/logos/BigCommerce.webp',
    name: 'BigCommerce',
    status: 'live',
    desc: 'منصة احترافية للمتاجر الكبيرة. API v2 عام وموثق بالكامل. Store Hash + Access Token من لوحة التحكم مباشرة.',
    tokenLabel: 'Store Hash:Access Token',
    tokenHint: 'من BigCommerce ← Settings ← API Accounts',
  },
  {
    logo: '/logos/Wix.png',
    name: 'Wix',
    status: 'live',
    desc: 'منصة المواقع الأشهر مع متجر متكامل. Wix eCommerce REST API عام وموثق. Site ID + API Key للربط الفوري.',
    tokenLabel: 'Site ID:API Key',
    tokenHint: 'من Wix ← Business Manager ← API Keys',
  },
  {
    logo: '/logos/Ecwid.png',
    name: 'Ecwid',
    status: 'live',
    desc: 'متجر مدمج مع أي موقع. API عام وموثق من Lightspeed. Store ID + Secret Token للوصول الكامل للطلبات.',
    tokenLabel: 'Store ID:Secret Token',
    tokenHint: 'من Ecwid ← Settings ← Apps ← Legacy API Keys',
  },

  // ── Live: Arabic platforms (implemented) ────────────────────────────────────
  {
    logo: '/logos/Wuilt.jpg',
    name: 'Wuilt',
    status: 'live',
    desc: 'منصة التجارة الإلكترونية العربية. Deema يتكامل مع Wuilt لإدارة الطلبات والشحن والتقارير من مكان واحد.',
    tokenLabel: 'API Key',
    tokenHint: 'من لوحة Wuilt ← الإعدادات ← المطورين',
  },
  {
    logo: '/logos/Shantaweb.png',
    name: 'Shantaweb',
    status: 'live',
    desc: 'منصة مصرية متخصصة تفهم السوق المحلي. اربطها بـ Deema وادر متجرك بالكامل بالعربي والجنيه المصري.',
    tokenLabel: 'API Key',
    tokenHint: 'من لوحة Shantaweb ← الإعدادات ← API',
  },

  // ── Coming Soon: require partner/developer approval ──────────────────────────
  {
    logo: '/logos/Salla.png',
    name: 'سلة',
    status: 'soon',
    desc: 'منصة التجارة الرائدة في السعودية. يتطلب تسجيل تطبيق كشريك في Salla Partners — قريباً.',
  },
  {
    logo: '/logos/Zid.png',
    name: 'زد',
    status: 'soon',
    desc: 'منصة سعودية متكاملة تخدم آلاف التجار. يتطلب الانضمام لبرنامج شركاء زد — قريباً.',
  },
  {
    logo: '/logos/Amazon.png',
    name: 'Amazon',
    status: 'partner',
    desc: 'SP-API يتطلب موافقة Amazon وتسجيل تطبيق رسمي. نعمل على الحصول على الموافقة.',
  },
  {
    logo: '/logos/Noon.png',
    name: 'Noon',
    status: 'partner',
    desc: 'Seller API يتطلب شراكة رسمية مع Noon. نعمل على الحصول على API للبائعين.',
  },
  {
    logo: '/logos/Jumia.png',
    name: 'Jumia',
    status: 'partner',
    desc: 'يتطلب اتفاقية شراكة مع Jumia للوصول لـ Seller API. نعمل على الموافقة.',
  },
  {
    logo: '/logos/TikTok_Shop.png',
    name: 'TikTok Shop',
    status: 'partner',
    desc: 'يتطلب قبول في برنامج TikTok Developer Partner. طلبنا قيد المراجعة.',
  },
  {
    logo: '/logos/Facebook_Shop.png',
    name: 'Facebook Shop',
    status: 'partner',
    desc: 'Meta Commerce API يتطلب مراجعة تطبيق Meta وموافقة خاصة. طلبنا قيد المراجعة.',
  },
]

const T = {
  ink: '#f0f0f5',
  slate: '#9090a2',
  hairline: 'rgba(255,255,255,0.08)',
  muted: '#5e5e72',
  surface: '#18181e',
  purple: '#6a4cf5',
  pink: '#d44df0',
}

const statusConfig: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  live:    { label: 'متصل الآن',     color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   dot: '#22c55e' },
  soon:    { label: 'قريباً',        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  dot: '#f59e0b' },
  partner: { label: 'يتطلب شراكة',  color: '#9090a2', bg: 'rgba(144,144,162,0.1)', dot: '#9090a2' },
}

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: 16,
}

const livePlatforms    = platforms.filter(p => p.status === 'live')
const soonPlatforms    = platforms.filter(p => p.status === 'soon')
const partnerPlatforms = platforms.filter(p => p.status === 'partner')

function PlatformCard({ p, i = 0 }: { p: typeof platforms[0]; i?: number }) {
  const sc = statusConfig[p.status]
  const isLive = p.status === 'live'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: (i % 2) * 0.08, duration: 0.4 }}
      whileHover={isLive ? { y: -4, borderColor: 'rgba(34,197,94,0.25)', boxShadow: '0 16px 40px rgba(0,0,0,0.35)' } : {}}
      style={{
        background: T.surface,
        borderRadius: 18,
        padding: '22px 20px',
        border: `1px solid ${T.hairline}`,
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        opacity: p.status === 'partner' ? 0.65 : 1,
        transition: 'border-color 0.2s',
      }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 8, boxSizing: 'border-box' }}>
        <img src={p.logo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px', color: T.ink }}>{p.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: sc.bg, color: sc.color, borderRadius: 9999, padding: '4px 12px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
              {sc.label}
            </span>
            {isLive && (
              <Link to="/signup" style={{ background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', borderRadius: 9999, padding: '5px 14px', fontSize: 11, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(106,76,245,0.3)' }}>
                ربط الآن ←
              </Link>
            )}
          </div>
        </div>
        <p style={{ fontSize: 13, color: T.slate, lineHeight: 1.65, marginBottom: p.tokenHint ? 10 : 0 }}>{p.desc}</p>
        {p.tokenHint && (
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: T.muted, fontFamily: 'monospace', border: `1px solid ${T.hairline}`, marginTop: 8 }}>
            🔑 {p.tokenLabel} — {p.tokenHint}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function SectionTitle({ eyebrowText, title, color = T.slate }: { eyebrowText: string; title: string; color?: string }) {
  return (
    <div style={{ marginBottom: 24, marginTop: 64 }}>
      <div style={{ ...eyebrow, color }}>{eyebrowText}</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.8px', color: T.ink }}>{title}</h2>
    </div>
  )
}

export default function Platforms() {
  return (
    <PageLayout>
      <main style={{ padding: '64px 200px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.purple, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>المنصات</p>
          <h1 style={{ fontSize: 'clamp(38px,5vw,60px)', fontWeight: 800, letterSpacing: '-2px', marginBottom: 20, lineHeight: 1.1, color: T.ink }}>
            اربط متجرك<br />
            <span style={{ background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>في دقيقتين</span>
          </h1>
          <p style={{ fontSize: 17, color: T.slate, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 32px' }}>
            ٧ منصات متصلة الآن بـ API حقيقي وموثق. إدارة كاملة للطلبات والشحن والتقارير من مكان واحد.
          </p>
          <div style={{ display: 'inline-flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {(Object.entries(statusConfig) as [Status, typeof statusConfig[Status]][]).map(([, sc]) => (
              <div key={sc.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.slate }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                {sc.label}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          {[
            { value: '٧', label: 'منصات متصلة الآن', color: '#22c55e' },
            { value: 'دقيقتان', label: 'متوسط وقت الربط', color: T.purple },
            { value: '١٣+', label: 'منصة في الخارطة', color: T.slate },
          ].map(s => (
            <div key={s.label} style={{ background: T.surface, borderRadius: 16, padding: '24px', border: `1px solid ${T.hairline}`, textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: T.slate }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── LIVE ── */}
        <SectionTitle eyebrowText="متصلة الآن" title={`${livePlatforms.length} منصات جاهزة للربط — بدون موافقة مسبقة`} color="#22c55e" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {livePlatforms.map((p, i) => <PlatformCard key={p.name} p={p} i={i} />)}
        </div>

        {/* ── COMING SOON ── */}
        <SectionTitle eyebrowText="قريباً" title="منصات عربية قيد التطوير" color="#f59e0b" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {soonPlatforms.map((p, i) => <PlatformCard key={p.name} p={p} i={i} />)}
        </div>

        {/* ── PARTNER REQUIRED ── */}
        <SectionTitle eyebrowText="يتطلب شراكة" title="منصات نعمل على الوصول إليها" color={T.slate} />
        <p style={{ fontSize: 14, color: T.muted, marginBottom: 20, marginTop: -8 }}>
          هذه المنصات تتطلب موافقة رسمية منها قبل بناء التكامل. نعمل على الحصول عليها.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {partnerPlatforms.map((p, i) => <PlatformCard key={p.name} p={p} i={i} />)}
        </div>

        {/* Request platform */}
        <div style={{ marginTop: 64, background: T.surface, borderRadius: 18, padding: '28px 32px', border: `1px solid ${T.hairline}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, color: T.ink }}>منصتك مش في القائمة؟</h3>
            <p style={{ fontSize: 14, color: T.slate }}>أخبرنا وسنضيفها لخارطة التطوير. كل طلب يُحسب.</p>
          </div>
          <a href="mailto:hello@deema.ai?subject=طلب دعم منصة جديدة"
            style={{ background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', borderRadius: 9999, padding: '12px 26px', fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(106,76,245,0.35)' }}>
            اقترح منصة ←
          </a>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 24, background: 'linear-gradient(135deg,rgba(106,76,245,0.15),rgba(212,77,240,0.08))', borderRadius: 24, padding: '60px 40px', textAlign: 'center', border: '1px solid rgba(106,76,245,0.25)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(106,76,245,0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 36, fontWeight: 800, color: T.ink, letterSpacing: '-1.5px', marginBottom: 14, position: 'relative' }}>اربط متجرك مجاناً</h2>
          <p style={{ fontSize: 16, color: T.slate, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.6, position: 'relative' }}>
            ٧ منصات جاهزة الآن. ربط في دقيقتين، بدون بطاقة ائتمان.
          </p>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', borderRadius: 9999, padding: '14px 32px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 28px rgba(106,76,245,0.4)', position: 'relative' }}>
            ابدأ مجاناً ←
          </Link>
        </div>

      </main>
    </PageLayout>
  )
}
