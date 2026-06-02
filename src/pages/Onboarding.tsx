import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowLeft, ExternalLink, Loader } from 'lucide-react'
import { storesApi } from '../lib/api'

type Platform = 'shopify' | 'wuilt' | 'shantaweb' | null

const ShopifyLogo = () => (
  <svg viewBox="0 0 109 124" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
    <path d="M95.3 24.2c-.1-.7-.7-1.1-1.2-1.1s-10.5-.2-10.5-.2-8.3-8.1-9.1-8.9c-.8-.8-2.4-.6-3-.4-.1 0-1.8.6-4.6 1.4-2.7-7.8-7.5-15-16-15-.2 0-.5 0-.7.1C47.6.4 45.3-.4 43.2-.4c-17.4 0-25.7 21.7-28.3 32.7C7.6 34.5.9 36.5.4 36.7c-2.3.7-2.4.8-2.7 3C-2.6 41.7-9 90-9 90l71.3 13.4 38.5-8.3S96 24.9 95.3 24.2zM68.2 16.3c-2.1.7-4.5 1.4-7.1 2.2v-1.6c0-4.8-.7-8.7-1.8-11.8 4.5 1 7.5 5.8 8.9 11.2zm-14-10.8c1.2 3.1 2 7.2 2 13v.8c-4.7 1.5-9.8 3-14.9 4.6C43.8 14.5 50.1 7.3 54.2 5.5zm-6.3-.4c-.6 0-1.2.2-1.8.5 5.3-9.7 14.2-6.2 14.2-6.2-1.3-3.5-4.7-5.6-8.5-5.6C46.2-.2 44 1.5 44 1.5c.6-.8 1.3-1.4 1.9-1.4h.4c-.3 0-.4.1-.4.1s-1.7-.5-4.3.8c0 0 .1-.1.1-.1z" fill="#95BF47"/>
    <path d="M94.1 23.1c-.5 0-10.5-.2-10.5-.2s-8.3-8.1-9.1-8.9c-.3-.3-.7-.4-1.1-.5l-5.8 118.7 38.5-8.3S96 24.9 95.3 24.2c-.4-.7-1-.8-1.2-1.1z" fill="#5E8E3E"/>
    <path d="M54.5 43.9l-4.8 14.2s-4.2-2.2-9.4-2.2c-7.5 0-7.9 4.7-7.9 5.9 0 6.5 16.9 9 16.9 24.2 0 12-7.5 19.6-17.7 19.6-12.2 0-18.4-7.6-18.4-7.6l3.3-10.8s6.4 5.5 11.8 5.5c3.5 0 5-2.8 5-4.8 0-8.4-13.9-8.8-13.9-22.7 0-11.6 8.4-22.9 25.2-22.9 6.5 0 9.9 1.6 9.9 1.6z" fill="#fff"/>
  </svg>
)

const WuiltLogo = () => (
  <svg viewBox="0 0 40 40" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#4F46E5"/>
    <text x="20" y="28" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial, sans-serif">W</text>
  </svg>
)

const ShantawebLogo = () => (
  <svg viewBox="0 0 40 40" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#E63946"/>
    <text x="20" y="28" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif">S</text>
  </svg>
)

const platforms = [
  {
    id: 'shopify',
    name: 'Shopify',
    desc: 'منصة عالمية للتجارة الإلكترونية',
    logo: <ShopifyLogo />,
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
    logo: <WuiltLogo />,
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
    logo: <ShantawebLogo />,
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
]

export default function Onboarding() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [platform, setPlatform] = useState<Platform>(null)
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
      // Kick off sync in background for Shopify
      if (platform === 'shopify' && store.id) {
        setSyncing(true)
        try {
          await storesApi.sync(store.id)
        } catch {
          // Sync errors are non-blocking
        }
      }
      setTimeout(() => navigate('/dashboard'), 1800)
    } catch (err: unknown) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'فشل الاتصال، تحقق من المفتاح')
    }
  }

  const selectedPlatform = platforms.find(p => p.id === platform)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

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
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 48, direction: 'ltr' }}>
            {steps.map((label, i) => {
              const s = i + 1
              const done = s < step
              const active = s === step
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: done ? 'var(--semantic-success)' : active ? '#fff' : 'var(--surface-3)',
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
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1.0, margin: '0 0 12px', color: 'var(--ink)' }}>
              ربط متجرك
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ink-muted)', letterSpacing: '-0.15px' }}>اختر المنصة التي يعمل عليها متجرك</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {platforms.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id as Platform)} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 20px', borderRadius: 15,
                border: `1px solid ${platform === p.id ? 'rgba(255,255,255,0.3)' : 'var(--hairline)'}`,
                background: platform === p.id ? 'var(--surface-2)' : 'var(--surface-1)',
                cursor: 'pointer', textAlign: 'right', width: '100%',
                boxShadow: platform === p.id ? 'rgba(0,153,255,0.15) 0 0 0 1px' : 'none',
              }}>
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.logo}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 2, letterSpacing: '-0.3px' }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-muted)', letterSpacing: '-0.13px' }}>{p.desc}</div>
                </div>
                {platform === p.id && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--semantic-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} color="#000" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            disabled={!platform}
            onClick={() => setStep(2)}
            className="btn-primary"
            style={{
              marginTop: 20, width: '100%', justifyContent: 'center',
              padding: '12px 20px', fontSize: 15, borderRadius: 10,
              opacity: platform ? 1 : 0.4, cursor: platform ? 'pointer' : 'default',
            }}>
            التالي <ArrowLeft size={15} />
          </button>
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

          <div style={{ background: 'var(--surface-1)', borderRadius: 15, padding: 20, marginBottom: 16, border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 14, letterSpacing: '-0.13px' }}>
              كيف تحصل على API Key من {selectedPlatform?.name}؟
            </div>
            {selectedPlatform?.steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--ink-muted)', marginBottom: 10 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', background: 'var(--surface-2)',
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

          {platform === 'shopify' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', marginBottom: 7, letterSpacing: '-0.13px' }}>Store Domain</label>
              <input
                type="text"
                value={storeDomain}
                onChange={e => setStoreDomain(e.target.value)}
                placeholder="mystore.myshopify.com"
                style={{
                  width: '100%', background: 'var(--surface-1)',
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
                width: '100%', background: 'var(--surface-1)',
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
              disabled={!apiKey.trim() || (platform === 'shopify' && !storeDomain.trim())}
              onClick={() => setStep(3)}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '11px 18px', borderRadius: 10, opacity: (apiKey.trim() && (platform !== 'shopify' || storeDomain.trim())) ? 1 : 0.4 }}>
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

              <div style={{ background: 'var(--surface-1)', borderRadius: 15, padding: 20, marginBottom: 16, textAlign: 'right', border: '1px solid var(--hairline)' }}>
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
