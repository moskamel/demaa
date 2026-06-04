import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchNormal1, People, TrendUp, ShoppingBag, Star1 } from 'iconsax-react'
import { customers as customersApi, orders as ordersApi, type Customer, type Order } from '../lib/api'
import AppSidebar from '../components/AppSidebar'
import { useDebounce } from '../hooks/useDebounce'
import AppHeader from '../components/AppHeader'
import { PageEnter, FadeUp, StaggerList, StaggerItem, AnimCard, AnimBtn, PopNumber } from '../components/Anim'

const segmentColors: Record<string, string> = { vip: '#d44df0', loyal: '#6a4cf5', regular: '#0099ff', new: '#22c55e' }
const segmentLabels: Record<string, string> = { vip: 'VIP', loyal: 'مخلص', regular: 'عادي', new: 'جديد' }
const segmentBg: Record<string, string> = { vip: 'rgba(212,77,240,0.1)', loyal: 'rgba(106,76,245,0.1)', regular: 'rgba(0,153,255,0.1)', new: 'rgba(34,197,94,0.1)' }

// Drawer segment config
const drawerSegmentColor: Record<string, string> = {
  vip: '#f59e0b',
  returning: '#6a4cf5',
  loyal: '#6a4cf5',
  new: '#3b82f6',
  at_risk: '#ef4444',
  regular: '#0099ff',
}
const drawerSegmentLabel: Record<string, string> = {
  vip: 'VIP 👑',
  returning: 'متكرر',
  loyal: 'متكرر',
  new: 'جديد',
  at_risk: 'في خطر ⚠️',
  regular: 'عادي',
}

type SegFilter = 'all' | 'vip' | 'loyal' | 'regular' | 'new'

function CustomerDrawer({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    if (customer.phone) {
      setLoadingOrders(true)
      ordersApi.list({ search: customer.phone, limit: '5' })
        .then(data => setRecentOrders(data.orders))
        .catch(() => setRecentOrders([]))
        .finally(() => setLoadingOrders(false))
    } else {
      setRecentOrders([])
    }
  }, [customer.id, customer.phone])

  const segColor = drawerSegmentColor[customer.segment] || '#6a4cf5'
  const segLabel = drawerSegmentLabel[customer.segment] || customer.segment

  const formatDate = (iso?: string) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const orderStatusColor: Record<string, string> = {
    pending: '#f59e0b',
    accepted: '#3b82f6',
    shipped: '#6a4cf5',
    delivered: '#22c55e',
    rejected: '#ef4444',
  }
  const orderStatusLabel: Record<string, string> = {
    pending: 'معلق',
    accepted: 'مقبول',
    shipped: 'مشحون',
    delivered: 'مُسلَّم',
    rejected: 'مرفوض',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 380, background: '#1a1a1a', padding: 24, overflowY: 'auto',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{customer.name}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: segColor,
                background: `${segColor}22`, borderRadius: 6, padding: '2px 8px',
              }}>{segLabel}</span>
            </div>
            <button
              onClick={() => setBlocked(b => !b)}
              style={{
                padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                background: blocked ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
                color: blocked ? '#ef4444' : 'rgba(255,255,255,0.7)',
                transition: 'all 0.15s',
              }}
            >
              {blocked ? '🔓 إلغاء الحظر' : '🚫 حظر'}
            </button>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >✕</button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { label: 'عدد الطلبات', value: customer.totalOrders },
            { label: 'إجمالي الإنفاق', value: `${(customer.totalSpent / 100).toLocaleString('en-US')} $` },
            { label: 'آخر طلب', value: formatDate(customer.lastOrderAt) },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Risk indicator */}
        {customer.totalOrders === 0 && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>لم يكمل أي طلب</span>
          </div>
        )}

        {/* Contact info */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>معلومات التواصل</div>
          {[
            { icon: '📍', label: 'المدينة', value: customer.city },
            { icon: '📞', label: 'الجوال', value: customer.phone },
            { icon: '✉️', label: 'البريد', value: customer.email },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', minWidth: 50 }}>{label}</span>
              <span style={{ fontSize: 12, color: value ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: value ? 500 : 400 }}>{value || '—'}</span>
            </div>
          ))}
        </div>

        {/* Order history */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>آخر الطلبات</div>
          {!customer.phone ? (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px 0' }}>لا يوجد رقم جوال للبحث</div>
          ) : loadingOrders ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ height: 52, borderRadius: 10, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px 0' }}>لا توجد طلبات</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentOrders.map(order => (
                <div key={order.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                      {order.externalRef ? `#${order.externalRef}` : order.id.slice(-8)}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{formatDate(order.placedAt)}</div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                      {(order.total / 100).toLocaleString('en-US')} $
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: orderStatusColor[order.status] || 'rgba(255,255,255,0.5)',
                      background: `${orderStatusColor[order.status] || 'rgba(255,255,255,0.5)'}18`,
                      borderRadius: 5, padding: '1px 6px',
                    }}>
                      {orderStatusLabel[order.status] || order.status}
                    </span>
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

export default function Customers() {
  const navigate = useNavigate()
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [segFilter, setSegFilter] = useState<SegFilter>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showBlocked, setShowBlocked] = useState(false)
  const debouncedSearch = useDebounce(search, 250)

  useEffect(() => {
    customersApi.list().then(data => {
      setAllCustomers(data.customers)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = allCustomers.filter(c => {
    if (showBlocked) return !!c.isBlocked
    if (c.isBlocked) return false
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
      <PageEnter>

        {/* KPIs */}
        <StaggerList style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { icon: People, label: 'إجمالي العملاء', value: allCustomers.length, color: '#6a4cf5' },
            { icon: Star1, label: 'عملاء VIP', value: vipCount, color: '#d44df0' },
            { icon: TrendUp, label: 'العملاء المخلصون', value: loyalCount, color: '#0099ff' },
            { icon: ShoppingBag, label: 'إجمالي الإنفاق', value: `${totalSpent.toLocaleString('en-US')} $`, color: '#22c55e' },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <StaggerItem key={label}>
              <div className="animate-fade-in-up hover-lift card-hover" style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '16px 18px', animationDelay: `${i * 60}ms` }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={15} color={color} variant="Outline" />
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 2 }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{label}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>

        {/* filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <SearchNormal1 size={13} variant="Outline" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم أو رقم جوال أو مدينة..." style={{ width: '100%', padding: '9px 34px 9px 14px', borderRadius: 10, border: '1px solid var(--hairline)', background: 'var(--canvas-soft)', color: 'var(--ink)', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={() => setShowBlocked(!showBlocked)} style={{
            padding: '6px 12px', borderRadius: 8, border: '1px solid var(--hairline)',
            background: showBlocked ? 'rgba(239,68,68,0.1)' : 'var(--canvas-soft)',
            color: showBlocked ? '#ef4444' : 'var(--ink-muted)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit'
          }}>
            {showBlocked ? '🚫 المحظورون' : 'عرض المحظورين'}
          </button>
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
        ) : allCustomers.length === 0 ? (
          <div className="animate-fade-in-scale" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ marginBottom: 12 }}><People size={48} color="var(--ink-muted)" style={{ opacity: 0.3 }} /></div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>لا يوجد عملاء بعد</div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20, maxWidth: 280, margin: '0 auto 20px' }}>ستظهر بيانات العملاء هنا بعد ربط متجرك وإتمام أول طلب</div>
            <button onClick={() => navigate('/stores')} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              ربط متجر
            </button>
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
              <div key={c.id} className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--hairline)' : 'none', transition: 'background 0.15s', animationDelay: `${i * 30}ms`, cursor: 'pointer' }}
                onClick={() => setSelectedCustomer(c)}
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
                    {c.isBlocked && <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 5, padding: '2px 7px' }}>محظور</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{c.phone || '—'} · {c.city || '—'}</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 60 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{c.totalOrders}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>طلبات</div>
                </div>
                <div style={{ textAlign: 'left', minWidth: 100 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{(c.totalSpent / 100).toLocaleString('en-US')} $</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>إجمالي الإنفاق</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageEnter>
      </div>
      </div>

      {selectedCustomer && (
        <CustomerDrawer customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  )
}
