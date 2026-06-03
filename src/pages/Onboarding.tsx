import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowLeft, ExternalLink, Loader, Search } from 'lucide-react'
import { storesApi } from '../lib/api'

type Platform = 'shopify' | 'wuilt' | 'shantaweb' | 'facebook' | 'tiktok' | 'salla' | 'zid' | 'amazon' | 'noon' | 'jumia' | 'woocommerce' | 'wix' | 'bigcommerce' | 'ecwid' | null

const PlatformLogo = ({ domain, name }: { domain: string; name: string }) => {
  const [err, setErr] = useState(false)
  const initial = name[0].toUpperCase()
  const colors: Record<string, string> = { shopify: '#96BF48', wuilt: '#4F46E5', shantaweb: '#E63946', facebook: '#1877F2', tiktok: '#010101', salla: '#5B4FCF', zid: '#E4003B', amazon: '#FF9900', noon: '#FEEE00', jumia: '#F68B1E', woocommerce: '#96588A', wix: '#0C6EBD', bigcommerce: '#34313F', ecwid: '#F05523' }
  if (err) return (
    <div style={{ width: 32, height: 32, borderRadius: 8, background: colors[domain] || '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{initial}</span>
    </div>
  )
  const logoDomains: Record<string, string> = { zid: 'zid.sa', salla: 'salla.com', amazon: 'amazon.com', noon: 'noon.com', jumia: 'jumia.com', woocommerce: 'woocommerce.com', wix: 'wix.com', bigcommerce: 'bigcommerce.com', ecwid: 'ecwid.com' }
  const logoDomain = logoDomains[domain] ?? `${domain}.com`
  return (
    <img
      src={`https://logo.clearbit.com/${logoDomain}`}
      alt={name}
      width={32} height={32}
      style={{ borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 2 }}
      onError={() => setErr(true)}
    />
  )
}

const platforms = [
  {
    id: 'shopify',
    name: 'Shopify',
    desc: 'منصة عالمية للتجارة الإلكترونية',
    url: 'https://www.shopify.com/',
    method: 'oauth',
    steps: [
      'افتح Admin Panel الخاص بمتجرك على Shopify',
      'اذهب إلى: Settings ← Apps and sales channels ← Develop apps',
      'اضغط "Create an app" وسمّه Deema',
      'من Admin API access scopes أضف: orders, products, fulfillments',
      'انسخ Admin API access token والصقه هنا',
    ],
  },
  {
    id: 'wuilt',
    name: 'Wuilt',
    desc: 'منصة عربية لبناء المتاجر الإلكترونية',
    url: 'https://wuilt.com/',
    method: 'api-key',
    steps: [
      'سجّل دخولك على لوحة تحكم Wuilt',
      'اذهب إلى: الإعدادات ← التكاملات ← API',
      'اضغط "إنشاء مفتاح API جديد"',
      'امنح الصلاحيات: قراءة الطلبات، المنتجات، الشحن',
      'انسخ المفتاح الظاهر والصقه هنا',
    ],
  },
  {
    id: 'shantaweb',
    name: 'Shantaweb',
    desc: 'منصة متاجر إلكترونية عربية',
    url: 'https://shantaweb.com/',
    method: 'api-key',
    steps: [
      'سجّل دخولك على لوحة تحكم Shantaweb',
      'اذهب إلى: الإعدادات ← API والتكاملات',
      'اضغط "توليد مفتاح API جديد"',
      'حدد الصلاحيات المطلوبة: طلبات، منتجات، شحن',
      'انسخ المفتاح والصقه هنا',
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook & Instagram',
    desc: 'البيع عبر فيسبوك وإنستغرام',
    url: 'https://www.facebook.com/business/commerce',
    method: 'api-key',
    steps: [
      'افتح Meta Business Suite على business.facebook.com',
      'اذهب إلى: الإعدادات ← حسابات ← الصفحات',
      'اختر صفحتك وافتح إعدادات Commerce',
      'اذهب إلى: الإعدادات المتقدمة ← رموز الوصول',
      'أنشئ System User Token بصلاحية manage_pages وانسخه هنا',
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok Shop',
    desc: 'البيع عبر متجر تيك توك',
    url: 'https://seller.tiktok.com',
    method: 'api-key',
    steps: [
      'افتح TikTok Seller Center على seller.tiktok.com',
      'اذهب إلى: My Account ← Developer',
      'اضغط "Apply for API Access"',
      'بعد الموافقة اذهب إلى: API Management ← Access Token',
      'انسخ الـ Access Token والصقه هنا',
    ],
  },
  {
    id: 'salla',
    name: 'Salla — سلة',
    desc: 'منصة التجارة الإلكترونية السعودية الرائدة',
    url: 'https://salla.com',
    method: 'api-key',
    steps: [
      'افتح لوحة تحكم سلة على salla.com',
      'اذهب إلى: التطبيقات ← مطوري سلة',
      'اضغط "إنشاء تطبيق جديد" واختر Private App',
      'فعّل الصلاحيات: الطلبات، المنتجات، الشحن',
      'انسخ Access Token والصقه هنا',
    ],
  },
  {
    id: 'zid',
    name: 'Zid — زد',
    desc: 'منصة التجارة الإلكترونية السعودية المتكاملة',
    url: 'https://zid.sa',
    method: 'api-key',
    steps: [
      'افتح لوحة تحكم زد على zid.sa',
      'اذهب إلى: الإعدادات ← واجهة برمجة التطبيقات',
      'اضغط "إنشاء رمز وصول جديد"',
      'فعّل الصلاحيات: إدارة الطلبات، المنتجات',
      'انسخ Manager Token والصقه هنا',
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    desc: 'أكبر سوق إلكتروني في العالم',
    url: 'https://sellercentral.amazon.com',
    method: 'api-key',
    steps: [
      'افتح Seller Central على sellercentral.amazon.com',
      'اذهب إلى: Apps & Services ← Develop Apps',
      'أنشئ تطبيقاً جديداً واحصل على Client ID و Client Secret',
      'من صفحة Authorize، احصل على Refresh Token',
      'أدخل البيانات بالصيغة: clientId:clientSecret:refreshToken',
    ],
  },
  {
    id: 'noon',
    name: 'Noon',
    desc: 'أكبر سوق إلكتروني في الشرق الأوسط',
    url: 'https://sell.noon.com',
    method: 'api-key',
    steps: [
      'افتح Noon Seller Lab على sell.noon.com',
      'اذهب إلى: الإعدادات ← API & Integrations',
      'اضغط "Generate New API Token"',
      'امنح الصلاحيات: Orders Management, Shipments',
      'انسخ الـ Bearer Token والصقه هنا',
    ],
  },
  {
    id: 'jumia',
    name: 'Jumia',
    desc: 'أكبر سوق إلكتروني في أفريقيا ومصر',
    url: 'https://seller.jumia.com.eg',
    method: 'api-key',
    steps: [
      'افتح Jumia Seller Center على seller.jumia.com.eg',
      'اذهب إلى: الإعدادات ← API Access',
      'اطلب رمز الوصول من فريق الدعم أو من لوحة Developer',
      'بعد الحصول على الرمز أدخل رمز البلد أولاً (eg لمصر)',
      'أدخل البيانات بالصيغة: eg:accessToken',
    ],
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    desc: 'إضافة التجارة الإلكترونية الأشهر على WordPress',
    url: 'https://woocommerce.com',
    method: 'api-key',
    steps: [
      'افتح لوحة تحكم WordPress الخاصة بك',
      'اذهب إلى: WooCommerce ← الإعدادات ← المتقدم ← REST API',
      'اضغط "إضافة مفتاح" وامنح صلاحية القراءة والكتابة',
      'انسخ Consumer Key و Consumer Secret',
      'أدخل البيانات بالصيغة: consumerKey:consumerSecret',
    ],
  },
  {
    id: 'wix',
    name: 'Wix Stores',
    desc: 'منصة بناء المواقع الأشهر مع متجر متكامل',
    url: 'https://wix.com',
    method: 'api-key',
    steps: [
      'افتح Wix Business Manager على manage.wix.com',
      'اذهب إلى: الإعدادات ← Advanced Settings ← API Keys',
      'أنشئ مفتاح API جديد وامنح صلاحيات eCommerce',
      'انسخ الـ API Key ورقم الـ Site ID من الإعدادات',
      'أدخل البيانات بالصيغة: siteId:apiKey',
    ],
  },
  {
    id: 'bigcommerce',
    name: 'BigCommerce',
    desc: 'منصة تجارة إلكترونية عالمية للمتاجر الكبيرة',
    url: 'https://bigcommerce.com',
    method: 'api-key',
    steps: [
      'افتح لوحة تحكم BigCommerce',
      'اذهب إلى: Advanced Settings ← API Accounts',
      'أنشئ حساب API جديد من نوع V2/V3',
      'امنح الصلاحيات: Orders (Read/Write), Shipping (Write)',
      'أدخل البيانات بالصيغة: storeHash:accessToken',
    ],
  },
  {
    id: 'ecwid',
    name: 'Ecwid',
    desc: 'منصة متجر مدمجة مع أي موقع',
    url: 'https://ecwid.com',
    method: 'api-key',
    steps: [
      'افتح لوحة تحكم Ecwid',
      'اذهب إلى: My Profile ← Apps ← Legacy API Keys',
      'انقر "Create Key" واختر الصلاحيات المطلوبة',
      'انسخ الـ Store ID و Secret Token',
      'أدخل البيانات بالصيغة: storeId:secretToken',
    ],
  },
]

export default function Onboarding() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [platform, setPlatform] = useState<Platform>(null)
  const [search, setSearch] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [storeDomain, setStoreDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [connected, setConnected] = useState(false)
  const [_error, setError] = useState('')
  const navigate = useNavigate()

  const handleConnect = async () => {
    if (!apiKey.trim()) return
    setLoading(true)
    setError('')
    try {
      const { store } = await storesApi.connect(platform!, apiKey.trim(), storeDomain.trim() || undefined)
      setLoading(false)
      setConnected(true)
      // Kick off sync in background for supported platforms
      if (store.id && (platform === 'shopify' || platform === 'facebook' || platform === 'tiktok' || platform === 'salla' || platform === 'zid' || platform === 'amazon' || platform === 'noon' || platform === 'jumia' || platform === 'woocommerce' || platform === 'wix' || platform === 'bigcommerce' || platform === 'ecwid')) {
        setSyncing(true)
        try {
          await storesApi.sync(store.id)
        } catch {
          // Sync errors are non-blocking
        }
      }
      setTimeout(() => navigate('/subscribe'), 1800)
    } catch (err: unknown) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'فشل الاتصال، تحقق من المفتاح')
    }
  }

  const selectedPlatform = platforms.find(p => p.id === platform)
  const filteredPlatforms = useMemo(() =>
    search.trim() ? platforms.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.includes(search)) : platforms
  , [search])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: step === 1 ? 'flex-start' : 'center', padding: step === 1 ? '80px 24px 24px' : 24 }}>

      {/* logo */}
      <div style={{ position: 'absolute', top: 24, right: 30, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#000', fontWeight: 700, fontSize: 11 }}>D</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Deema</span>
      </div>

      {/* step indicator */}
      {(() => {
        const steps = ['اختر المنصة', 'بيانات الربط', 'تأكيد']
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 48, direction: 'rtl' }}>
            {steps.map((label, i) => {
              const s = i + 1
              const done = s < step
              const active = s === step
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: done ? 'var(--semantic-success)' : active ? '#fff' : 'var(--hairline)',
                      transition: 'background 0.2s',
                    }} />
                    <span style={{ fontSize: 11, color: done ? 'var(--semantic-success)' : active ? 'var(--ink)' : 'var(--ink-disabled)', whiteSpace: 'nowrap', letterSpacing: '-0.1px', transition: 'color 0.2s' }}>{label}</span>
                  </div>
                  {s < 3 && <div style={{ width: 64, height: 1, background: done ? 'var(--semantic-success)' : 'var(--hairline)', marginBottom: 14, transition: 'background 0.2s' }} />}
                </div>
              )
            })}
          </div>
        )
      })()}

      {/* ── STEP 1: Choose platform ── */}
      {step === 1 && (
        <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24, flexShrink: 0 }}>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1.0, margin: '0 0 10px', color: 'var(--ink)' }}>
              ربط متجرك
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ink-muted)' }}>اختر المنصة التي يعمل عليها متجرك</p>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 16, flexShrink: 0 }}>
            <Search size={15} color="var(--ink-muted)" style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن المنصة..."
              style={{
                width: '100%', padding: '11px 40px 11px 14px', borderRadius: 10,
                border: '1px solid var(--hairline)', background: 'var(--canvas-soft)',
                color: 'var(--ink)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#1c1c1e'; e.target.style.boxShadow = '0 0 0 3px rgba(28,28,30,0.08)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--hairline)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Scrollable platform list */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredPlatforms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-muted)', fontSize: 14 }}>لا توجد نتائج لـ "{search}"</div>
              ) : filteredPlatforms.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id as Platform)} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 18px', borderRadius: 12,
                  border: `1.5px solid ${platform === p.id ? '#1c1c1e' : 'var(--hairline)'}`,
                  background: platform === p.id ? 'var(--canvas-soft-2)' : 'var(--canvas-soft)',
                  cursor: 'pointer', textAlign: 'right', width: '100%',
                  transition: 'border-color 0.15s, background 0.15s',
                }}>
                  <div style={{ flexShrink: 0 }}><PlatformLogo domain={p.id} name={p.name} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{p.desc}</div>
                  </div>
                  {platform === p.id && (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Fixed bottom button */}
          <div style={{ flexShrink: 0, paddingTop: 16, borderTop: '1px solid var(--hairline)', marginTop: 8 }}>
            {platform && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 14px', background: 'var(--canvas-soft)', borderRadius: 10, border: '1px solid var(--hairline)' }}>
                <PlatformLogo domain={platform} name={selectedPlatform?.name || ''} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', flex: 1 }}>{selectedPlatform?.name}</span>
                <button onClick={() => setPlatform(null)} style={{ fontSize: 12, color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>تغيير</button>
              </div>
            )}
            <button
              disabled={!platform}
              onClick={() => setStep(2)}
              style={{
                width: '100%', padding: '13px', borderRadius: 9999, border: 'none',
                background: platform ? '#1c1c1e' : 'var(--hairline)',
                color: platform ? '#fff' : 'var(--ink-muted)',
                cursor: platform ? 'pointer' : 'default',
                fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s',
              }}>
              التالي <ArrowLeft size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: API Key ── */}
      {step === 2 && (
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1.0, margin: '0 0 10px', color: 'var(--ink)' }}>
              ربط {selectedPlatform?.name}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)', letterSpacing: '-0.14px' }}>أدخل بيانات المتجر لإتمام الربط</p>
          </div>

          <div style={{ background: 'var(--canvas-soft)', borderRadius: 15, padding: 20, marginBottom: 16, border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 14, letterSpacing: '-0.13px' }}>
              كيف تحصل على API Key من {selectedPlatform?.name}؟
            </div>
            {selectedPlatform?.steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--ink-muted)', marginBottom: 10 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', background: 'var(--canvas-soft-2)',
                  color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ letterSpacing: '-0.13px' }}>{s}</span>
              </div>
            ))}
            <a href={selectedPlatform?.url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, color: '#6a4cf5', textDecoration: 'none' }}>
              <ExternalLink size={11} />
              فتح {selectedPlatform?.name} في تبويب جديد
            </a>
          </div>

          {(platform === 'shopify' || platform === 'facebook' || platform === 'tiktok' || platform === 'amazon' || platform === 'woocommerce') && (

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', marginBottom: 7, letterSpacing: '-0.13px' }}>
                {platform === 'facebook' ? 'Page ID' : platform === 'tiktok' ? 'Shop ID' : platform === 'amazon' ? 'Marketplace ID' : platform === 'woocommerce' ? 'Store Domain' : 'Store Domain'}
              </label>
              <input
                type="text"
                value={storeDomain}
                onChange={e => setStoreDomain(e.target.value)}
                placeholder={platform === 'facebook' ? '123456789012345' : platform === 'tiktok' ? '7123456789012345678' : platform === 'amazon' ? 'A2VIGQ35RCS4UG' : platform === 'woocommerce' ? 'mystore.com' : 'mystore.myshopify.com'}
                style={{
                  width: '100%', background: 'var(--canvas-soft)',
                  border: '1px solid var(--hairline)', borderRadius: 10,
                  padding: '11px 14px', fontSize: 13, color: 'var(--ink)',
                  outline: 'none', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.boxShadow = 'rgba(0,153,255,0.15) 0 0 0 1px'; e.target.style.borderColor = '#0099ff' }}
                onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--hairline)' }}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', marginBottom: 7, letterSpacing: '-0.13px' }}>API Key</label>
            <input
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={selectedPlatform?.id === 'shopify' ? 'shpat_xxxxxxxxxxxxxxxxxxxx' : 'sk-xxxxxxxxxxxxxxxxxxxx'}
              style={{
                width: '100%', background: 'var(--canvas-soft)',
                border: '1px solid var(--hairline)', borderRadius: 10,
                padding: '11px 14px', fontSize: 13, color: 'var(--ink)',
                outline: 'none', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.boxShadow = 'rgba(0,153,255,0.15) 0 0 0 1px'; e.target.style.borderColor = '#0099ff' }}
              onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--hairline)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setStep(1)} className="btn-secondary" style={{ padding: '11px 18px', borderRadius: 10 }}>
              رجوع
            </button>
            <button
              disabled={!apiKey.trim() || ((platform === 'shopify' || platform === 'facebook' || platform === 'tiktok') && !storeDomain.trim())}
              onClick={() => setStep(3)}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '11px 18px', borderRadius: 10, opacity: (apiKey.trim() && (platform !== 'shopify' && platform !== 'facebook' && platform !== 'tiktok' || storeDomain.trim())) ? 1 : 0.4 }}
            >
              التحقق من الـ Key
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Confirm ── */}
      {step === 3 && (
        <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          {connected ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--semantic-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(34,197,94,0.3)' }}>
                <Check size={30} color="#000" strokeWidth={3} />
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.05em', color: 'var(--ink)' }}>تم الربط! 🎉</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>
                {syncing ? 'جاري مزامنة البيانات...' : 'جاري الانتقال للوحة التحكم...'}
              </p>
              {syncing && (
                <Loader size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--ink-muted)' }} />
              )}
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 500, letterSpacing: '-0.05em', margin: '0 0 10px', color: 'var(--ink)' }}>تأكيد الربط</h1>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 28, letterSpacing: '-0.14px' }}>تحقق من البيانات قبل الاتصال بمتجرك</p>

              <div style={{ background: 'var(--canvas-soft)', borderRadius: 15, padding: 20, marginBottom: 16, textAlign: 'right', border: '1px solid var(--hairline)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                  <span style={{ color: 'var(--ink-muted)' }}>المنصة</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>{selectedPlatform?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13 }}>
                  <span style={{ color: 'var(--ink-muted)' }}>API Key</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--ink)' }}>{apiKey.slice(0, 10)}••••••••</span>
                </div>
                <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 14 }}>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 10 }}>الصلاحيات المطلوبة:</div>
                  {['قراءة الطلبات', 'تحديث الطلبات', 'قراءة المنتجات', 'إنشاء الشحنات'].map(perm => (
                    <div key={perm} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--ink-muted)', marginBottom: 7 }}>
                      <Check size={12} color="var(--semantic-success)" strokeWidth={2.5} />
                      <span style={{ letterSpacing: '-0.13px' }}>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleConnect}
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15, borderRadius: 10 }}>
                {loading ? (
                  <>
                    <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    جارٍ التحقق...
                  </>
                ) : 'ربط المتجر والبدء'}
              </button>
            </>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
