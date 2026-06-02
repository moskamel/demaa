import { useState, useEffect, useRef } from 'react'
import { X, Search, ShoppingCart, Package, Users, BarChart2 } from 'lucide-react'
import { orders as ordersApi, products as productsApi } from '../lib/api'

interface Props {
  onClose: () => void
  onSelectOrder?: (id: string) => void
}

type ResultType = 'order' | 'product' | 'customer' | 'page'

interface Result {
  type: ResultType
  id: string
  title: string
  subtitle: string
  value?: string
}

const PAGES: Result[] = [
  { type: 'page', id: '/dashboard', title: 'المساعد الذكي', subtitle: 'التحدث مع ديما', value: '/dashboard' },
  { type: 'page', id: '/reports', title: 'التقارير', subtitle: 'تحليلات المبيعات والأداء', value: '/reports' },
  { type: 'page', id: '/customers', title: 'العملاء', subtitle: 'إدارة قاعدة العملاء', value: '/customers' },
  { type: 'page', id: '/insights', title: 'الذاكرة الذكية', subtitle: 'رؤى ديما عن متجرك', value: '/insights' },
  { type: 'page', id: '/stores', title: 'المتاجر', subtitle: 'إدارة ربط المنصات', value: '/stores' },
  { type: 'page', id: '/connectors', title: 'التطبيقات', subtitle: 'شحن، دفع، تواصل', value: '/connectors' },
  { type: 'page', id: '/team', title: 'الفريق', subtitle: 'إدارة الأعضاء والصلاحيات', value: '/team' },
  { type: 'page', id: '/billing', title: 'الاشتراك', subtitle: 'الباقات والفواتير', value: '/billing' },
  { type: 'page', id: '/settings', title: 'الإعدادات', subtitle: 'تخصيص ديما', value: '/settings' },
]

const typeIcons: Record<ResultType, React.ElementType> = { order: ShoppingCart, product: Package, customer: Users, page: BarChart2 }
const typeColors: Record<ResultType, string> = { order: '#6a4cf5', product: '#22c55e', customer: '#0099ff', page: '#ff7a3d' }
const typeLabels: Record<ResultType, string> = { order: 'طلب', product: 'منتج', customer: 'عميل', page: 'صفحة' }

export default function SearchModal({ onClose, onSelectOrder }: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const [results, setResults] = useState<Result[]>(PAGES)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { setSelected(0) }, [results])

  useEffect(() => {
    if (!query.trim()) {
      setResults(PAGES)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const q = query.trim()
      const newResults: Result[] = []

      try {
        const [ordersData, productsData] = await Promise.all([
          ordersApi.list({ search: q, limit: '4' }),
          productsApi.list({ search: q }),
        ])
        ordersData.orders.slice(0, 4).forEach(o => {
          newResults.push({ type: 'order', id: o.id, title: `طلب #${o.externalRef || o.id}`, subtitle: `${o.customerName} · ${o.city}`, value: o.id })
        })
        productsData.products.slice(0, 3).forEach(p => {
          newResults.push({ type: 'product', id: p.id, title: p.name, subtitle: `${p.category || '—'} · ${p.price.toLocaleString('ar-EG')} ج.م`, value: p.id })
        })
      } catch {
        // ignore API errors during search
      }

      PAGES.filter(pg =>
        pg.title.includes(q) || pg.subtitle.includes(q) || pg.id.includes(q.toLowerCase())
      ).slice(0, 3).forEach(pg => newResults.push(pg))

      setResults(newResults.length > 0 ? newResults : [])
    }, 300)
  }, [query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, results.length - 1))
      if (e.key === 'ArrowUp') setSelected(s => Math.max(s - 1, 0))
      if (e.key === 'Enter' && results[selected]) handleSelect(results[selected])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [results, selected])

  const handleSelect = (r: Result) => {
    if (r.type === 'order' && onSelectOrder && r.value) { onSelectOrder(r.value); onClose() }
    else if (r.type === 'page' && r.value) { window.location.href = r.value; onClose() }
    else onClose()
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 560, background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', zIndex: 301, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>

        {/* input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--hairline)' }}>
          <Search size={16} color="var(--ink-muted)" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث عن طلب، منتج، عميل، أو صفحة..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)', fontFamily: 'inherit' }} />
          {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: 0 }}><X size={14} /></button>}
          <kbd style={{ fontSize: 10, color: 'var(--ink-muted)', background: 'var(--surface-2)', borderRadius: 5, padding: '3px 7px', border: '1px solid var(--hairline)', cursor: 'pointer', flexShrink: 0 }} onClick={onClose}>Esc</kbd>
        </div>

        {/* results */}
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: 13 }}>
              لا توجد نتائج لـ "{query}"
            </div>
          ) : (
            <>
              {!query && <div style={{ padding: '10px 20px 6px', fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.04em' }}>الوجهات السريعة</div>}
              {results.map((r, i) => {
                const Icon = typeIcons[r.type]
                const color = typeColors[r.type]
                return (
                  <div key={r.id} onClick={() => handleSelect(r)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', cursor: 'pointer', background: selected === i ? 'var(--surface-2)' : 'transparent', transition: 'background 0.1s' }} onMouseEnter={() => setSelected(i)}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} color={color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 1 }}>{r.subtitle}</div>
                    </div>
                    <div style={{ fontSize: 10, color, background: `${color}18`, borderRadius: 5, padding: '2px 8px', flexShrink: 0 }}>{typeLabels[r.type]}</div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* footer hint */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--hairline)', display: 'flex', gap: 16, fontSize: 11, color: 'var(--ink-muted)' }}>
          <span>↑↓ للتنقل</span>
          <span>↵ للاختيار</span>
          <span>Esc للإغلاق</span>
        </div>
      </div>
    </>
  )
}
