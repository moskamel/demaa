import { useState, useEffect } from 'react'
import { DocumentDownload, TickCircle, CloseCircle, Box, Flash } from 'iconsax-react'
import { analytics, type ActivityLog } from '../lib/api'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'

const filters = [
  { id: 'all', label: 'الكل' },
  { id: 'orders', label: 'الطلبات' },
  { id: 'products', label: 'المنتجات' },
  { id: 'shipping', label: 'الشحن' },
]

function getIcon(action: string) {
  if (action.includes('accept') || action.includes('قبول')) return 'check'
  if (action.includes('reject') || action.includes('رفض')) return 'x'
  if (action.includes('ship') || action.includes('شحن')) return 'package'
  return 'zap'
}

function getColor(action: string) {
  if (action.includes('accept') || action.includes('قبول')) return 'var(--semantic-success)'
  if (action.includes('reject') || action.includes('رفض')) return 'var(--gradient-coral)'
  if (action.includes('ship') || action.includes('شحن')) return '#0099ff'
  return 'var(--gradient-orange)'
}

function getTag(action: string, entity?: string) {
  const e = (entity || '').toLowerCase()
  if (e === 'order' || action.includes('طلب')) return 'orders'
  if (e === 'shipment' || action.includes('شحن')) return 'shipping'
  if (e === 'product' || action.includes('منتج') || action.includes('سعر')) return 'products'
  return 'orders'
}

function ActionIcon({ type, color }: { type: string; color: string }) {
  if (type === 'check') return <TickCircle size={14} color={color} variant="Outline" />
  if (type === 'x') return <CloseCircle size={14} color={color} variant="Outline" />
  if (type === 'zap') return <Flash size={14} color={color} variant="Outline" />
  return <Box size={14} color={color} variant="Outline" />
}

function ActivityRow({ item, index, total }: { item: { id: string; time: string; icon: string; color: string; title: string; by: string; detail: string }; index: number; total: number }) {
  return (
    <div className="animate-fade-in-up" style={{
      background: 'var(--canvas-soft)',
      padding: '14px 18px',
      borderRadius: index === 0 ? '15px 15px 4px 4px' : index === total - 1 ? '4px 4px 15px 15px' : 4,
      display: 'flex', alignItems: 'center', gap: 14,
      borderBottom: index < total - 1 ? '1px solid var(--hairline)' : 'none',
      animationDelay: `${index * 30}ms`,
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas-soft-2)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--canvas-soft)' }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--canvas-soft-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analytics.activity().then(data => {
      setLogs(data.logs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const mapped = logs.map(log => {
    const action = log.action
    return {
      id: log.id,
      time: new Date(log.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      icon: getIcon(action),
      color: getColor(action),
      title: log.summary || action,
      by: 'أنت (عبر Deema)',
      detail: log.summary,
      tag: getTag(action, log.entity),
      date: isToday(log.createdAt) ? 'today' : 'yesterday',
    }
  })

  function isToday(dateStr: string) {
    const d = new Date(dateStr)
    const now = new Date()
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }

  const filtered = (date: string) => mapped.filter(a => a.date === date && (active === 'all' || a.tag === active))
  const today = filtered('today')
  const yesterday = filtered('yesterday')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--canvas)', color: 'var(--ink)' }}>
      <AppHeader>
        {logs.length > 0 && (
          <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', borderRadius: 100, fontSize: 10, padding: '2px 8px', fontWeight: 600 }}>
            {logs.length}
          </span>
        )}
      </AppHeader>

      <div style={{ padding: '50px 300px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1 }}>
            سجل الأنشطة
          </h1>
          <button className="btn-secondary" style={{ fontSize: 13, padding: '8px 14px', borderRadius: 10 }} onClick={() => {
            const rows = [['الوقت', 'النشاط', 'التفاصيل'], ...mapped.map(a => [a.time, a.title, a.detail])]
            const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
            const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `activity-${new Date().toISOString().slice(0,10)}.csv`; a.click()
            URL.revokeObjectURL(url)
          }}>
            <DocumentDownload size={13} variant="Outline" /> تصدير CSV
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'var(--canvas-soft)', borderRadius: 100, padding: 4, width: 'fit-content' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setActive(f.id)} style={{ background: active === f.id ? 'var(--canvas-soft-2)' : 'transparent', color: active === f.id ? 'var(--ink)' : 'var(--ink-muted)', border: 'none', borderRadius: 100, padding: '7px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[0,1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: i === 0 ? '15px 15px 4px 4px' : i === 6 ? '4px 4px 15px 15px' : 4 }} />)}
          </div>
        ) : (
          <>
            {today.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
                  اليوم
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {today.map((a, i) => <ActivityRow key={a.id} item={a} index={i} total={today.length} />)}
                </div>
              </div>
            )}

            {yesterday.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
                  أمس
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {yesterday.map((a, i) => <ActivityRow key={a.id} item={a} index={i} total={yesterday.length} />)}
                </div>
              </div>
            )}

            {today.length === 0 && yesterday.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-muted)' }}>
                <Box size={36} variant="Outline" style={{ marginBottom: 14, opacity: 0.3 }} />
                <div style={{ fontSize: 15 }}>لا توجد أنشطة في هذه الفئة</div>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  )
}
