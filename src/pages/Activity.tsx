import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Check, X, Package, ArrowRight, Zap } from 'lucide-react'
import { store } from '../store/mockData'

const STATIC_ACTIVITIES = [
  { id: 's1', time: '09:15', icon: 'check', color: 'var(--semantic-success)', title: 'قبول ٢٣ طلب بالجملة', by: 'أنت (عبر Deema)', detail: 'المجموع: ١٤,٥٠٠ ر.س', tag: 'orders', date: 'today' },
  { id: 's2', time: '09:32', icon: 'package', color: '#0099ff', title: 'إنشاء ٢٣ بوليصة شحن', by: 'Deema تلقائياً', detail: 'شركة الشحن: أرامكس', tag: 'shipping', date: 'today' },
  { id: 's3', time: '10:05', icon: 'x', color: 'var(--gradient-coral)', title: 'رفض طلب #١٠٢٢٥', by: 'أنت (عبر Deema)', detail: 'السبب: نفاد المخزون', tag: 'orders', date: 'today' },
  { id: 's4', time: '11:20', icon: 'package', color: 'var(--gradient-orange)', title: 'تحديث سعر منتج — سماعة JBL', by: 'أنت (عبر Deema)', detail: 'من ٢٥٠ ر.س → ٢٢٠ ر.س', tag: 'products', date: 'today' },
  { id: 's5', time: '08:30', icon: 'check', color: 'var(--semantic-success)', title: 'قبول ١٥ طلب', by: 'سارة (عبر Deema)', detail: 'المجموع: ٨,٧٥٠ ر.س', tag: 'orders', date: 'yesterday' },
  { id: 's6', time: '13:10', icon: 'x', color: 'var(--gradient-coral)', title: 'رفض طلبين — بيانات خاطئة', by: 'أنت (عبر Deema)', detail: 'طلب #١٠٢١٨ و #١٠٢١٥', tag: 'orders', date: 'yesterday' },
]

const filters = [
  { id: 'all', label: 'الكل' },
  { id: 'orders', label: 'الطلبات' },
  { id: 'products', label: 'المنتجات' },
  { id: 'shipping', label: 'الشحن' },
]

function ActionIcon({ type, color }: { type: string; color: string }) {
  if (type === 'check') return <Check size={14} color={color} strokeWidth={2.5} />
  if (type === 'x') return <X size={14} color={color} strokeWidth={2.5} />
  if (type === 'zap') return <Zap size={14} color={color} />
  return <Package size={14} color={color} />
}

function ActivityRow({ item, index, total }: { item: { id: string; time: string; icon: string; color: string; title: string; by: string; detail: string }; index: number; total: number }) {
  return (
    <div style={{
      background: 'var(--surface-1)',
      padding: '14px 18px',
      borderRadius: index === 0 ? '15px 15px 4px 4px' : index === total - 1 ? '4px 4px 15px 15px' : 4,
      display: 'flex', alignItems: 'center', gap: 14,
      borderBottom: index < total - 1 ? '1px solid var(--hairline-soft)' : 'none',
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <ActionIcon type={item.icon} color={item.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 3, letterSpacing: '-0.14px' }}>{item.title}</div>
        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--ink-muted)' }}>
          <span>{item.by}</span>
          <span style={{ color: 'var(--hairline)' }}>·</span>
          <span>{item.detail}</span>
        </div>
      </div>
      <span style={{ fontSize: 12, color: 'var(--ink-muted)', flexShrink: 0 }}>{item.time}</span>
    </div>
  )
}

export default function Activity() {
  const [active, setActive] = useState('all')

  // Live log from store (chat actions) merged with static history
  const liveLog = store.activitiesLog.map((entry, i) => ({
    id: `live-${i}`,
    time: entry.time,
    icon: entry.action.includes('قبول') ? 'check' : entry.action.includes('رفض') ? 'x' : entry.action.includes('شحن') ? 'package' : 'zap',
    color: entry.action.includes('قبول') ? 'var(--semantic-success)' : entry.action.includes('رفض') ? 'var(--gradient-coral)' : entry.action.includes('شحن') ? '#0099ff' : 'var(--gradient-orange)',
    title: entry.action,
    by: 'أنت (عبر Deema)',
    detail: entry.detail,
    tag: entry.action.includes('طلب') ? 'orders' : entry.action.includes('شحن') ? 'shipping' : entry.action.includes('منتج') || entry.action.includes('سعر') ? 'products' : 'orders',
    date: 'today' as const,
  }))

  const all = [...liveLog, ...STATIC_ACTIVITIES]

  const filtered = (date: string) => all.filter(a => a.date === date && (active === 'all' || a.tag === active))
  const today = filtered('today')
  const yesterday = filtered('yesterday')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', color: 'var(--ink)' }}>
      <nav style={{ height: 52, borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', padding: '0 30px', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13 }}>
          <ArrowRight size={14} /> الرئيسية
        </Link>
        <span style={{ width: 1, height: 14, background: 'var(--hairline)' }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>سجل الأنشطة</span>
        {liveLog.length > 0 && (
          <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', borderRadius: 100, fontSize: 10, padding: '2px 8px', fontWeight: 600 }}>
            {liveLog.length} جديد
          </span>
        )}
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1 }}>
            سجل الأنشطة
          </h1>
          <button className="btn-secondary" style={{ fontSize: 13, padding: '8px 14px', borderRadius: 10 }}>
            <Download size={13} /> تصدير CSV
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'var(--surface-1)', borderRadius: 100, padding: 4, width: 'fit-content' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setActive(f.id)} style={{ background: active === f.id ? 'var(--surface-2)' : 'transparent', color: active === f.id ? 'var(--ink)' : 'var(--ink-muted)', border: 'none', borderRadius: 100, padding: '7px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {f.label}
            </button>
          ))}
        </div>

        {today.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
              اليوم — {liveLog.length > 0 ? `${today.length} أنشطة` : '١٥ يناير ٢٠٢٥'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {today.map((a, i) => <ActivityRow key={a.id} item={a} index={i} total={today.length} />)}
            </div>
          </div>
        )}

        {yesterday.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
              أمس — ١٤ يناير ٢٠٢٥
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {yesterday.map((a, i) => <ActivityRow key={a.id} item={a} index={i} total={yesterday.length} />)}
            </div>
          </div>
        )}

        {today.length === 0 && yesterday.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-muted)' }}>
            <Package size={36} style={{ marginBottom: 14, opacity: 0.3 }} />
            <div style={{ fontSize: 15 }}>لا توجد أنشطة في هذه الفئة</div>
          </div>
        )}
      </div>
    </div>
  )
}
