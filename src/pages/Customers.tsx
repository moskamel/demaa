import { useState, useEffect } from 'react'
import { SearchNormal1, People, TrendUp, ShoppingBag, Star1 } from 'iconsax-react'
import { customers as customersApi, type Customer } from '../lib/api'
import AppSidebar from '../components/AppSidebar'
import { useDebounce } from '../hooks/useDebounce'
import AppHeader from '../components/AppHeader'

const segmentColors: Record<string, string> = { vip: '#d44df0', loyal: '#6a4cf5', regular: '#0099ff', new: '#22c55e' }
const segmentLabels: Record<string, string> = { vip: 'VIP', loyal: 'مخلص', regular: 'عادي', new: 'جديد' }
const segmentBg: Record<string, string> = { vip: 'rgba(212,77,240,0.1)', loyal: 'rgba(106,76,245,0.1)', regular: 'rgba(0,153,255,0.1)', new: 'rgba(34,197,94,0.1)' }

type SegFilter = 'all' | 'vip' | 'loyal' | 'regular' | 'new'

export default function Customers() {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [segFilter, setSegFilter] = useState<SegFilter>('all')
  const debouncedSearch = useDebounce(search, 250)

  useEffect(() => {
    customersApi.list().then(data => {
      setAllCustomers(data.customers)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = allCustomers.filter(c => {
    const matchSeg = segFilter === 'all' || c.segment === segFilter
    const q = debouncedSearch.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.city || '').toLowerCase().includes(q)
    return matchSeg && matchSearch
  })

  const vipCount = allCustomers.filter(c => c.segment === 'vip').length
  const loyalCount = allCustomers.filter(c => c.segment === 'loyal').length
  const totalSpentHalalahs = allCustomers.reduce((s, c) => s + c.totalSpent, 0)
  const totalSpent = totalSpentHalalahs / 100

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--canvas)', paddingBottom: 60 }}>
      <AppHeader />
      <div style={{ padding: '30px 200px' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { icon: People, label: 'إجمالي العملاء', value: allCustomers.length, color: '#6a4cf5' },
            { icon: Star1, label: 'عملاء VIP', value: vipCount, color: '#d44df0' },
            { icon: TrendUp, label: 'العملاء المخلصون', value: loyalCount, color: '#0099ff' },
            { icon: ShoppingBag, label: 'إجمالي الإنفاق', value: `${totalSpent.toLocaleString('ar-EG')} ج.م`, color: '#22c55e' },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <div key={label} className="animate-fade-in-up hover-lift" style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '16px 18px', animationDelay: `${i * 60}ms` }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={15} color={color} variant="Outline" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <SearchNormal1 size={13} variant="Outline" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم أو رقم جوال أو مدينة..." style={{ width: '100%', padding: '9px 34px 9px 14px', borderRadius: 10, border: '1px solid var(--hairline)', background: 'var(--canvas-soft)', color: 'var(--ink)', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--canvas-soft)', borderRadius: 9, padding: 3 }}>
            {(['all', 'vip', 'loyal', 'regular', 'new'] as SegFilter[]).map(s => (
              <button key={s} onClick={() => setSegFilter(s)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, background: segFilter === s ? 'var(--canvas-soft-2)' : 'transparent', color: segFilter === s ? 'var(--ink)' : 'var(--ink-muted)' }}>
                {s === 'all' ? 'الكل' : segmentLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {/* table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--canvas-soft)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--hairline)' }}>
            {[0,1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 0, borderBottom: '1px solid var(--hairline)' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="animate-fade-in-scale" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>لا توجد نتائج</div>
            <div style={{ fontSize: 12 }}>جرب تغيير كلمة البحث أو الفلتر</div>
          </div>
        ) : (
          <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
            {filtered.map((c, i) => (
              <div key={c.id} className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--hairline)' : 'none', transition: 'background 0.15s', animationDelay: `${i * 30}ms` }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas-soft-2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${segmentColors[c.segment] || '#6a4cf5'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                  {c.segment === 'vip' ? '⭐' : c.segment === 'loyal' ? '💜' : c.segment === 'new' ? '🆕' : '👤'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: segmentColors[c.segment] || '#6a4cf5', background: segmentBg[c.segment] || 'rgba(106,76,245,0.1)', borderRadius: 5, padding: '2px 7px' }}>{segmentLabels[c.segment] || c.segment}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{c.phone || '—'} · {c.city || '—'}</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 60 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{c.totalOrders}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>طلبات</div>
                </div>
                <div style={{ textAlign: 'left', minWidth: 100 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{(c.totalSpent / 100).toLocaleString('ar-EG')} ج.م</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>إجمالي الإنفاق</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
