import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowLeft, ExternalLink, Loader } from 'lucide-react'
import { storesApi } from '../lib/api'

type Platform = 'shopify' | 'wuilt' | 'shantaweb' | null

const PlatformLogo = ({ domain, name }: { domain: string; name: string }) => {
  const [err, setErr] = useState(false)
  const initial = name[0].toUpperCase()
  const colors: Record<string, string> = { shopify: '#96BF48', wuilt: '#4F46E5', shantaweb: '#E63946' }
  if (err) return (
    <div style={{ width: 32, height: 32, borderRadius: 8, background: colors[domain] || '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{initial}</span>
    </div>
  )
  return (
    <img
      src={`https://logo.clearbit.com/${domain}.com`}
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
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlatformLogo domain={p.id} name={p.name} /></div>
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
