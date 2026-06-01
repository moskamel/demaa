import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Check, X, Package, ArrowRight } from 'lucide-react'

const all = [
  {
    id: 1, time: '09:15', icon: 'check', color: 'var(--semantic-success)',
    title: 'قبول ٢٣ طلب بالجملة', by: 'أنت (عبر Deema)',
    detail: 'المجموع: ١٤,٥٠٠ ر.س', tag: 'orders', date: 'today',
  },
  {
    id: 2, time: '09:32', icon: 'package', color: '#0099ff',
    title: 'إنشاء ٢٣ بوليصة شحن', by: 'Deema تلقائياً',
    detail: 'شركة الشحن: أرامكس', tag: 'shipping', date: 'today',
  },
  {
    id: 3, time: '10:05', icon: 'x', color: 'var(--gradient-coral)',
    title: 'رفض طلب #١٠٢٢٥', by: 'أنت (عبر Deema)',
    detail: 'السبب: نفاد المخزون', tag: 'orders', date: 'today',
  },
  {
    id: 4, time: '11:20', icon: 'package', color: 'var(--gradient-orange)',
    title: 'تحديث سعر منتج — سماعة JBL', by: 'أنت (عبر Deema)',
    detail: 'من ٢٥٠ ر.س → ٢٢٠ ر.س', tag: 'products', date: 'today',
  },
  {
    id: 5, time: '14:45', icon: 'check', color: 'var(--semantic-success)',
    title: 'شحن ٨ طلبات تلقائياً', by: 'Deema تلقائياً',
    detail: 'شركة الشحن: SMSA', tag: 'shipping', date: 'today',
  },
  {
    id: 6, time: '08:30', icon: 'check', color: 'var(--semantic-success)',
    title: 'قبول ١٥ طلب', by: 'سارة (عبر Deema)',
    detail: 'المجموع: ٨,٧٥٠ ر.س', tag: 'orders', date: 'yesterday',
  },
  {
    id: 7, time: '13:10', icon: 'x', color: 'var(--gradient-coral)',
    title: 'رفض طلبين — بيانات خاطئة', by: 'أنت (عبر Deema)',
    detail: 'طلب #١٠٢١٨ و #١٠٢١٥', tag: 'orders', date: 'yesterday',
  },
]

const filters = [
  { id: 'all', label: 'الكل' },
  { id: 'orders', label: 'الطلبات' },
  { id: 'products', label: 'المنتجات' },
  { id: 'shipping', label: 'الشحن' },
]

const Icon = ({ type, color }: { type: string; color: string }) => {
  if (type === 'check') return <Check size={14} color={color} strokeWidth={2.5} />
  if (type === 'x') return <X size={14} color={color} strokeWidth={2.5} />
  return <Package size={14} color={color} />
}

export default function Activity() {
  const [active, setActive] = useState('all')

  const filtered = (date: string) =>
    all.filter(a => a.date === date && (active === 'all' || a.tag === active))

  const today = filtered('today')
  const yesterday = filtered('yesterday')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', color: 'var(--ink)' }}>

      {/* nav */}
      <nav style={{ height: 52, borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', padding: '0 30px', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13, letterSpacing: '-0.13px' }}>
          <ArrowRight size={14} /> الرئيسية
        </Link>
        <span style={{ width: 1, height: 14, background: 'var(--hairline)' }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>سجل الأنشطة</span>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--ink)' }}>
            سجل الأنشطة
          </h1>
          <button className="btn-secondary" style={{ fontSize: 13, padding: '8px 14px', borderRadius: 10 }}>
            <Download size={13} /> تصدير CSV
          </button>
        </div>

        {/* filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'var(--surface-1)', borderRadius: 100, padding: 4, width: 'fit-content' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setActive(f.id)} style={{
              background: active === f.id ? 'var(--surface-2)' : 'transparent',
              color: active === f.id ? 'var(--ink)' : 'var(--ink-muted)',
              border: 'none', borderRadius: 100,
              padding: '7px 16px', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', letterSpacing: '-0.13px',
              boxShadow: active === f.id ? 'rgba(255,255,255,0.04) 0 0.5px 0 inset' : 'none',
            }}>{f.label}</button>
          ))}
        </div>

        {/* today */}
        {today.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
              اليوم — ١٥ يناير ٢٠٢٥
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {today.map((a, i) => (
                <div key={a.id} style={{
                  background: 'var(--surface-1)',
                  padding: '14px 18px',
                  borderRadius: i === 0 ? '15px 15px 4px 4px' : i === today.length - 1 ? '4px 4px 15px 15px' : 4,
                  display: 'flex', alignItems: 'center', gap: 14,
                  borderBottom: i < today.length - 1 ? '1px solid var(--hairline-soft)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon type={a.icon} color={a.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 3, letterSpacing: '-0.14px' }}>{a.title}</div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--ink-muted)', letterSpacing: '-0.12px' }}>
                      <span>{a.by}</span>
                      <span style={{ color: 'var(--hairline)' }}>·</span>
                      <span>{a.detail}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--ink-muted)', flexShrink: 0, letterSpacing: '-0.12px' }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* yesterday */}
        {yesterday.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
              أمس — ١٤ يناير ٢٠٢٥
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {yesterday.map((a, i) => (
                <div key={a.id} style={{
                  background: 'var(--surface-1)',
                  padding: '14px 18px',
                  borderRadius: i === 0 ? '15px 15px 4px 4px' : i === yesterday.length - 1 ? '4px 4px 15px 15px' : 4,
                  display: 'flex', alignItems: 'center', gap: 14,
                  borderBottom: i < yesterday.length - 1 ? '1px solid var(--hairline-soft)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon type={a.icon} color={a.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 3, letterSpacing: '-0.14px' }}>{a.title}</div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--ink-muted)', letterSpacing: '-0.12px' }}>
                      <span>{a.by}</span>
                      <span style={{ color: 'var(--hairline)' }}>·</span>
                      <span>{a.detail}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--ink-muted)', flexShrink: 0 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {today.length === 0 && yesterday.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-muted)' }}>
            <Package size={36} style={{ marginBottom: 14, opacity: 0.3 }} />
            <div style={{ fontSize: 15, letterSpacing: '-0.15px' }}>لا توجد أنشطة في هذه الفئة</div>
          </div>
        )}
      </div>
    </div>
  )
}
