import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, Download, RefreshCw } from 'lucide-react'
import { ORDERS, PRODUCTS } from '../store/mockData'

// ── Computed analytics from mock data ───────────────────────────────────────

const completedOrders = ORDERS.filter(o => ['accepted', 'shipped', 'delivered'].includes(o.status))
const totalRevenue = completedOrders.reduce((s, o) => s + o.total, 0)
const pendingCount = ORDERS.filter(o => o.status === 'pending').length
const shippedCount = ORDERS.filter(o => o.status === 'shipped').length
const rejectedCount = ORDERS.filter(o => o.status === 'rejected').length
const avgOrder = totalRevenue / (completedOrders.length || 1)

const citySales: Record<string, { orders: number; revenue: number }> = {}
ORDERS.forEach(o => {
  if (!citySales[o.city]) citySales[o.city] = { orders: 0, revenue: 0 }
  citySales[o.city].orders++
  if (['accepted', 'shipped', 'delivered'].includes(o.status)) citySales[o.city].revenue += o.total
})
const sortedCities = Object.entries(citySales).sort((a, b) => b[1].revenue - a[1].revenue)

const paymentBreakdown: Record<string, number> = {}
ORDERS.forEach(o => {
  paymentBreakdown[o.payment] = (paymentBreakdown[o.payment] || 0) + 1
})

const lowStockProducts = PRODUCTS.filter(p => p.stock < 5)

// Mock daily data for the last 7 days
const DAILY = [
  { day: 'الأحد', orders: 8, revenue: 2720 },
  { day: 'الاثنين', orders: 12, revenue: 4080 },
  { day: 'الثلاثاء', orders: 7, revenue: 2380 },
  { day: 'الأربعاء', orders: 15, revenue: 5100 },
  { day: 'الخميس', orders: 19, revenue: 6460 },
  { day: 'الجمعة', orders: 24, revenue: 8160 },
  { day: 'السبت', orders: 18, revenue: 6120 },
]
const maxDailyOrders = Math.max(...DAILY.map(d => d.orders))

const paymentLabels: Record<string, string> = { card: 'بطاقة', cash: 'كاش', tabby: 'تابby', tamara: 'تمارا' }
const paymentColors: Record<string, string> = { card: '#6a4cf5', cash: '#ff7a3d', tabby: '#22c55e', tamara: '#0099ff' }

type Period = '7d' | '30d' | '90d'

export default function Reports() {
  const [period, setPeriod] = useState<Period>('7d')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const KPI = ({ icon: Icon, label, value, sub, color, trend }: {
    icon: React.ElementType; label: string; value: string; sub?: string; color: string; trend?: 'up' | 'down'
  }) => (
    <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={color} />
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: trend === 'up' ? '#22c55e' : '#ff5577' }}>
            {trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend === 'up' ? '+12%' : '-3%'}
          </div>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color, marginTop: 4 }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', paddingBottom: 60 }}>
      {/* top bar */}
      <div style={{ borderBottom: '1px solid var(--hairline)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13 }}>
          <ChevronLeft size={14} /> الرئيسية
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>التقارير</span>
        <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* period selector */}
          <div style={{ display: 'flex', gap: 3, background: 'var(--surface-1)', borderRadius: 8, padding: 3 }}>
            {(['7d', '30d', '90d'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, background: period === p ? 'var(--surface-2)' : 'transparent', color: period === p ? 'var(--ink)' : 'var(--ink-muted)' }}>
                {p === '7d' ? '٧ أيام' : p === '30d' ? '٣٠ يوم' : '٩٠ يوم'}
              </button>
            ))}
          </div>
          <button onClick={handleRefresh} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-muted)' }}>
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear' : 'none' }} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--surface-1)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: 'var(--ink-muted)' }}>
            <Download size={12} /> تصدير
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px' }}>

        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <KPI icon={DollarSign} label="إجمالي الإيرادات" value={`${totalRevenue.toLocaleString('ar-SA')} ر.س`} sub="هذا الشهر" color="#6a4cf5" trend="up" />
          <KPI icon={ShoppingCart} label="إجمالي الطلبات" value={ORDERS.length.toString()} sub={`${pendingCount} معلق · ${shippedCount} مشحون`} color="#0099ff" trend="up" />
          <KPI icon={DollarSign} label="متوسط قيمة الطلب" value={`${Math.round(avgOrder).toLocaleString('ar-SA')} ر.س`} color="#22c55e" trend="up" />
          <KPI icon={Package} label="طلبات مرفوضة" value={rejectedCount.toString()} sub={`${Math.round((rejectedCount / ORDERS.length) * 100)}% معدل الرفض`} color="#ff5577" trend="down" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* bar chart */}
          <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>الطلبات اليومية</div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>آخر ٧ أيام</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
              {DAILY.map(d => (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)' }}>{d.orders}</div>
                  <div style={{ width: '100%', borderRadius: 6, background: 'linear-gradient(180deg, #6a4cf5 0%, rgba(106,76,245,0.3) 100%)', height: `${(d.orders / maxDailyOrders) * 90}px`, minHeight: 4, transition: 'height 0.4s ease' }} />
                  <div style={{ fontSize: 10, color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>{d.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* payment breakdown */}
          <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>طرق الدفع</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(paymentBreakdown).map(([method, count]) => {
                const pct = Math.round((count / ORDERS.length) * 100)
                return (
                  <div key={method}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{paymentLabels[method] || method}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--hairline)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: paymentColors[method] || '#999', borderRadius: 4 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* city breakdown */}
          <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>أعلى المدن</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sortedCities.slice(0, 6).map(([city, data], i) => (
                <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: i === 0 ? 'rgba(106,76,245,0.15)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: i === 0 ? '#6a4cf5' : 'var(--ink-muted)', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{city}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{data.orders} طلب</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{data.revenue.toLocaleString('ar-SA')} ر.س</div>
                </div>
              ))}
            </div>
          </div>

          {/* low stock */}
          <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>تحذيرات المخزون</div>
              {lowStockProducts.length > 0 && (
                <span style={{ fontSize: 11, color: '#ff7a3d', background: 'rgba(255,122,61,0.12)', borderRadius: 6, padding: '2px 8px' }}>{lowStockProducts.length} منتج</span>
              )}
            </div>
            {lowStockProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ink-muted)', fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                المخزون في مستوى جيد
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lowStockProducts.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: p.stock === 0 ? 'rgba(255,85,119,0.06)' : 'rgba(255,122,61,0.06)', borderRadius: 8, border: `1px solid ${p.stock === 0 ? 'rgba(255,85,119,0.2)' : 'rgba(255,122,61,0.2)'}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{p.category}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: p.stock === 0 ? '#ff5577' : '#ff7a3d' }}>
                      {p.stock === 0 ? 'نافد' : p.stock}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* products table */}
        <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>أداء المنتجات</div>
            <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>مرتب حسب الإيراد</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 0 }}>
            <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline-soft)', fontWeight: 600 }}>المنتج</div>
            <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline-soft)', fontWeight: 600 }}>السعر</div>
            <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline-soft)', fontWeight: 600 }}>المخزون</div>
            <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline-soft)', fontWeight: 600 }}>الحالة</div>
            {PRODUCTS.map(p => (
              <>
                <div key={`${p.id}-name`} style={{ padding: '12px 20px', borderBottom: '1px solid var(--hairline-soft)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{p.category} · {p.id}</div>
                </div>
                <div key={`${p.id}-price`} style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', borderBottom: '1px solid var(--hairline-soft)', display: 'flex', alignItems: 'center' }}>{p.price.toLocaleString('ar-SA')} ر.س</div>
                <div key={`${p.id}-stock`} style={{ padding: '12px 20px', borderBottom: '1px solid var(--hairline-soft)', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: p.stock === 0 ? '#ff5577' : p.stock < 5 ? '#ff7a3d' : 'var(--ink)' }}>{p.stock}</span>
                </div>
                <div key={`${p.id}-status`} style={{ padding: '12px 20px', borderBottom: '1px solid var(--hairline-soft)', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: p.stock === 0 ? '#ff5577' : p.stock < 5 ? '#ff7a3d' : '#22c55e', background: p.stock === 0 ? 'rgba(255,85,119,0.1)' : p.stock < 5 ? 'rgba(255,122,61,0.1)' : 'rgba(34,197,94,0.1)', borderRadius: 6, padding: '3px 8px' }}>
                    {p.stock === 0 ? 'نافد' : p.stock < 5 ? 'منخفض' : 'متوفر'}
                  </span>
                </div>
              </>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
