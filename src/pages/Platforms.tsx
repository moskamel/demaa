import { Link } from 'react-router-dom'
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

const statusConfig: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  live:    { label: 'متصل الآن',     color: '#22c55e', bg: '#22c55e18', dot: '#22c55e' },
  soon:    { label: 'قريباً',        color: '#f59e0b', bg: '#f59e0b18', dot: '#f59e0b' },
  partner: { label: 'يتطلب شراكة',  color: '#9090a2', bg: '#9090a218', dot: '#9090a2' },
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

function PlatformCard({ p }: { p: typeof platforms[0] }) {
  const sc = statusConfig[p.status]
  const isLive = p.status === 'live'
  return (
    <div style={{
      background: 'var(--canvas-soft)',
      borderRadius: 16,
      padding: '24px',
      border: isLive ? '1px solid var(--hairline)' : '1px solid var(--hairline)',
      display: 'flex',
      gap: 16,
      alignItems: 'flex-start',
      opacity: p.status === 'partner' ? 0.75 : 1,
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 6, boxSizing: 'border-box' }}>
        <img src={p.logo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px' }}>{p.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: sc.bg, color: sc.color, borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
              {sc.label}
            </span>
            {isLive && (
              <Link
                to="/signup"
                style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', borderRadius: 9999, padding: '6px 16px', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                ربط الآن ←
              </Link>
            )}
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: p.tokenHint ? 10 : 0 }}>{p.desc}</p>
        {p.tokenHint && (
          <div style={{ background: 'var(--canvas)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'monospace', border: '1px solid var(--hairline)', marginTop: 8 }}>
            🔑 {p.tokenLabel} — {p.tokenHint}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ eyebrowText, title }: { eyebrowText: string; title: string }) {
  return (
    <div style={{ marginBottom: 24, marginTop: 56 }}>
      <div style={{ ...eyebrow, color: 'var(--ink-muted)' }}>{eyebrowText}</div>
      <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em' }}>{title}</h2>
    </div>
  )
}

export default function Platforms() {
  return (
    <PageLayout>
      <main style={{ padding: '64px 200px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            ...eyebrow,
            display: 'inline-block',
            background: 'linear-gradient(135deg, #6a4cf5, #d44df0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            المنصات
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 20, lineHeight: 1.15 }}>
            اربط متجرك في دقيقتين
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 32px' }}>
            ٧ منصات متصلة الآن بـ API حقيقي وموثق. إدارة كاملة للطلبات والشحن والتقارير من مكان واحد.
          </p>

          {/* Status legend */}
          <div style={{ display: 'inline-flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {(Object.entries(statusConfig) as [Status, typeof statusConfig[Status]][]).map(([, sc]) => (
              <div key={sc.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                {sc.label}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          {[
            { value: '٧', label: 'منصات متصلة الآن', color: '#22c55e' },
            { value: 'دقيقتان', label: 'متوسط وقت الربط', color: '#6a4cf5' },
            { value: '١٣+', label: 'منصة في الخارطة', color: '#9090a2' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── LIVE ── */}
        <SectionTitle eyebrowText="متصلة الآن" title={`${livePlatforms.length} منصات جاهزة للربط — بدون موافقة مسبقة`} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {livePlatforms.map(p => <PlatformCard key={p.name} p={p} />)}
        </div>

        {/* ── COMING SOON ── */}
        <SectionTitle eyebrowText="قريباً" title="منصات عربية قيد التطوير" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {soonPlatforms.map(p => <PlatformCard key={p.name} p={p} />)}
        </div>

        {/* ── PARTNER REQUIRED ── */}
        <SectionTitle eyebrowText="يتطلب شراكة" title="منصات نعمل على الوصول إليها" />
        <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 20, marginTop: -8 }}>
          هذه المنصات تتطلب موافقة رسمية منها قبل بناء التكامل. نعمل على الحصول عليها.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {partnerPlatforms.map(p => <PlatformCard key={p.name} p={p} />)}
        </div>

        {/* Request platform */}
        <div style={{ marginTop: 56, background: 'var(--canvas-soft)', borderRadius: 16, padding: '32px', border: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>منصتك مش في القائمة؟</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>أخبرنا وسنضيفها لخارطة التطوير. كل طلب يُحسب.</p>
          </div>
          <a
            href="mailto:hello@deema.ai?subject=طلب دعم منصة جديدة"
            style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', borderRadius: 9999, padding: '13px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            اقترح منصة ←
          </a>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 32, background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', borderRadius: 20, padding: '56px 40px', textAlign: 'center' }}>
          <div style={{ ...eyebrow, color: 'rgba(255,255,255,0.7)' }}>ابدأ الآن</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 16 }}>اربط متجرك مجاناً</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', maxWidth: 480, margin: '0 auto 32px' }}>
            ٧ منصات جاهزة الآن. ربط في دقيقتين، بدون بطاقة ائتمان.
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
