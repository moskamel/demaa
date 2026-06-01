import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowLeft, ExternalLink, Loader } from 'lucide-react'

type Platform = 'salla' | 'zid' | 'shopify' | null

export default function Onboarding() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [platform, setPlatform] = useState<Platform>(null)
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const navigate = useNavigate()

  const handleConnect = () => {
    if (!apiKey.trim()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setConnected(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    }, 2000)
  }

  const platforms = [
    { id: 'salla', name: 'سلة', desc: 'المنصة السعودية الأولى', emoji: '🟣', method: 'api-key' },
    { id: 'zid', name: 'زد', desc: 'تجارة إلكترونية عربية', emoji: '🟢', method: 'oauth' },
    { id: 'shopify', name: 'Shopify', desc: 'منصة عالمية', emoji: '🌿', method: 'oauth' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Logo */}
      <div style={{ position: 'absolute', top: 24, right: 48, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>D</span>
        </div>
        <span style={{ fontFamily: 'Noto Serif Arabic, serif', fontSize: 18, color: 'var(--ink)' }}>Deema</span>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: s < step ? 'var(--success)' : s === step ? 'var(--primary)' : 'var(--surface-card)',
              color: s <= step ? '#fff' : 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}>
              {s < step ? <CheckCircle size={14} /> : s}
            </div>
            {s < 3 && <div style={{ width: 40, height: 2, background: s < step ? 'var(--success)' : 'var(--hairline)', borderRadius: 1 }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Choose platform */}
      {step === 1 && (
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 className="font-display" style={{ fontSize: 32, margin: '0 0 10px', letterSpacing: '-0.02em', color: 'var(--ink)' }}>ربط متجرك</h1>
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>اختر المنصة التي يعمل عليها متجرك</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {platforms.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id as Platform)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '20px 24px',
                borderRadius: 12,
                border: `2px solid ${platform === p.id ? 'var(--primary)' : 'var(--hairline)'}`,
                background: platform === p.id ? 'var(--surface-soft)' : 'var(--canvas)',
                cursor: 'pointer',
                textAlign: 'right',
                width: '100%',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 32 }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{p.desc}</div>
                </div>
                {platform === p.id && <CheckCircle size={20} color="var(--primary)" />}
              </button>
            ))}
          </div>

          <button
            disabled={!platform}
            onClick={() => setStep(2)}
            style={{
              marginTop: 24,
              width: '100%',
              background: platform ? 'var(--primary)' : 'var(--primary-disabled)',
              color: platform ? '#fff' : 'var(--muted)',
              border: 'none',
              borderRadius: 8,
              padding: '13px 20px',
              fontSize: 15,
              fontWeight: 600,
              cursor: platform ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
            التالي
            <ArrowLeft size={16} />
          </button>
        </div>
      )}

      {/* Step 2: API Key / OAuth */}
      {step === 2 && (
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 className="font-display" style={{ fontSize: 30, margin: '0 0 8px', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              ربط {platforms.find(p => p.id === platform)?.name}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>أدخل بيانات المتجر لإتمام الربط</p>
          </div>

          {/* Instructions card */}
          <div style={{ background: 'var(--surface-card)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>
              كيف تحصل على API Key من {platforms.find(p => p.id === platform)?.name}؟
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                `افتح لوحة تحكم ${platforms.find(p => p.id === platform)?.name}`,
                'اذهب إلى: التطبيقات ← مفاتيح API',
                'اضغط "إنشاء مفتاح جديد"',
                'انسخ المفتاح والصقه هنا',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--body)' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
            <button style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--canvas)',
              border: '1px solid var(--hairline)',
              borderRadius: 6,
              padding: '8px 14px',
              fontSize: 12,
              cursor: 'pointer',
              color: 'var(--primary)',
              fontWeight: 500,
            }}>
              <ExternalLink size={12} />
              فتح {platforms.find(p => p.id === platform)?.name} في تبويب جديد
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>API Key</label>
            <input
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
              style={{
                width: '100%',
                background: 'var(--canvas)',
                border: '1px solid var(--hairline)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--ink)',
                outline: 'none',
                fontFamily: 'JetBrains Mono, monospace',
                direction: 'ltr',
                textAlign: 'left',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: '1px solid var(--hairline)', borderRadius: 8, padding: '12px 20px', fontSize: 14, color: 'var(--muted)', cursor: 'pointer' }}>
              رجوع
            </button>
            <button
              disabled={!apiKey.trim()}
              onClick={() => setStep(3)}
              style={{
                flex: 1,
                background: apiKey.trim() ? 'var(--primary)' : 'var(--primary-disabled)',
                color: apiKey.trim() ? '#fff' : 'var(--muted)',
                border: 'none',
                borderRadius: 8,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: apiKey.trim() ? 'pointer' : 'default',
              }}>
              التحقق من الـ Key
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Verify & connect */}
      {step === 3 && (
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <h1 className="font-display" style={{ fontSize: 30, margin: '0 0 8px', letterSpacing: '-0.02em', color: 'var(--ink)' }}>تأكيد الربط</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 32 }}>سنقوم بالتحقق من بياناتك والاتصال بمتجرك</p>

          <div style={{ background: 'var(--surface-card)', borderRadius: 12, padding: 24, marginBottom: 24, textAlign: 'right' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>المنصة</span>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{platforms.find(p => p.id === platform)?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>API Key</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--ink)' }}>{apiKey.slice(0, 8)}••••••••</span>
            </div>
            <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>الصلاحيات المطلوبة:</div>
              {['قراءة الطلبات', 'تحديث الطلبات', 'قراءة المنتجات', 'إنشاء الشحنات'].map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--body)', marginBottom: 5 }}>
                  <CheckCircle size={13} color="var(--success)" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {connected ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={28} color="#fff" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>تم الربط بنجاح! 🎉</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>جاري الانتقال للوحة التحكم...</div>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '14px 20px',
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
              {loading ? (
                <>
                  <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  جارٍ التحقق...
                </>
              ) : 'ربط المتجر والبدء'}
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
