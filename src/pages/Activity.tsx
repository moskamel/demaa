import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, CheckCircle, XCircle, Package, ArrowRight, Bell } from 'lucide-react'

const activities = {
  today: [
    {
      id: 1, time: '09:15', icon: 'check', color: 'var(--success)',
      title: 'قبول ٢٣ طلب بالجملة',
      by: 'أنت (عبر Deema)',
      detail: 'المجموع: ١٤,٥٠٠ ر.س',
      tag: 'orders',
    },
    {
      id: 2, time: '09:32', icon: 'package', color: 'var(--accent-teal)',
      title: 'إنشاء ٢٣ بوليصة شحن',
      by: 'Deema تلقائياً',
      detail: 'شركة الشحن: أرامكس',
      tag: 'shipping',
    },
    {
      id: 3, time: '10:05', icon: 'x', color: 'var(--error)',
      title: 'رفض طلب #١٠٢٢٥',
      by: 'أنت (عبر Deema)',
      detail: 'السبب: نفاد المخزون',
      tag: 'orders',
    },
    {
      id: 4, time: '11:20', icon: 'package', color: 'var(--accent-amber)',
      title: 'تحديث سعر منتج — سماعة JBL',
      by: 'أنت (عبر Deema)',
      detail: 'من ٢٥٠ ر.س إلى ٢٢٠ ر.س',
      tag: 'products',
    },
    {
      id: 5, time: '14:45', icon: 'check', color: 'var(--success)',
      title: 'شحن ٨ طلبات تلقائياً',
      by: 'Deema تلقائياً',
      detail: 'شركة الشحن: SMSA',
      tag: 'shipping',
    },
  ],
  yesterday: [
    {
      id: 6, time: '08:30', icon: 'check', color: 'var(--success)',
      title: 'قبول ١٥ طلب',
      by: 'سارة (عبر Deema)',
      detail: 'المجموع: ٨,٧٥٠ ر.س',
      tag: 'orders',
    },
    {
      id: 7, time: '13:10', icon: 'x', color: 'var(--error)',
      title: 'رفض طلبين — بيانات خاطئة',
      by: 'أنت (عبر Deema)',
      detail: 'طلب #١٠٢١٨ و #١٠٢١٥',
      tag: 'orders',
    },
  ],
}

const filters = [
  { id: 'all', label: 'الكل' },
  { id: 'orders', label: 'الطلبات' },
  { id: 'products', label: 'المنتجات' },
  { id: 'shipping', label: 'الشحن' },
  { id: 'team', label: 'الفريق' },
]

const IconFor = ({ icon, color }: { icon: string; color: string }) => {
  if (icon === 'check') return <CheckCircle size={16} color={color} />
  if (icon === 'x') return <XCircle size={16} color={color} />
  return <Package size={16} color={color} />
}

export default function Activity() {
  const [activeFilter, setActiveFilter] = useState('all')

  const filter = (list: typeof activities.today) =>
    activeFilter === 'all' ? list : list.filter(a => a.tag === activeFilter)

  const todayFiltered = filter(activities.today)
  const yestFiltered = filter(activities.yesterday)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      {/* Nav */}
      <nav style={{
        background: 'var(--canvas)',
        borderBottom: '1px solid var(--hairline)',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        gap: 16,
      }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 13 }}>
          <ArrowRight size={14} />
          الرئيسية
        </Link>
        <div style={{ width: 1, height: 16, background: 'var(--hairline)' }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>سجل الأنشطة</span>
        <div style={{ flex: 1 }} />
        <Bell size={17} color="var(--muted)" />
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h1 className="font-display" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.02em', color: 'var(--ink)' }}>سجل الأنشطة</h1>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--surface-card)',
            border: '1px solid var(--hairline)',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 13,
            color: 'var(--ink)',
            cursor: 'pointer',
            fontWeight: 500,
          }}>
            <Download size={13} />
            تصدير CSV
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
              background: activeFilter === f.id ? 'var(--surface-card)' : 'transparent',
              color: activeFilter === f.id ? 'var(--ink)' : 'var(--muted)',
              border: 'none',
              borderRadius: 8,
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: activeFilter === f.id ? 600 : 400,
              cursor: 'pointer',
            }}>{f.label}</button>
          ))}
        </div>

        {/* Today */}
        {todayFiltered.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              اليوم — ١٥ يناير ٢٠٢٥
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayFiltered.map(a => (
                <div key={a.id} style={{
                  background: 'var(--canvas)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--surface-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <IconFor icon={a.icon} color={a.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{a.title}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--muted)' }}>
                      <span>بواسطة: {a.by}</span>
                      <span style={{ color: 'var(--hairline)' }}>|</span>
                      <span>{a.detail}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yesterday */}
        {yestFiltered.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              أمس — ١٤ يناير ٢٠٢٥
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {yestFiltered.map(a => (
                <div key={a.id} style={{
                  background: 'var(--canvas)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--surface-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <IconFor icon={a.icon} color={a.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{a.title}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--muted)' }}>
                      <span>بواسطة: {a.by}</span>
                      <span style={{ color: 'var(--hairline)' }}>|</span>
                      <span>{a.detail}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {todayFiltered.length === 0 && yestFiltered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--muted)' }}>
            <Package size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 15 }}>لا توجد أنشطة في هذه الفئة</div>
          </div>
        )}
      </div>
    </div>
  )
}
