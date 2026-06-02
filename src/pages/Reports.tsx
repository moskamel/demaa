import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, Download, RefreshCw } from 'lucide-react'
import { analytics as analyticsApi, products as productsApi, type AnalyticsOverview, type Product } from '../lib/api'

const paymentLabels: Record<string, string> = { card: 'بطاقة', cash: 'كاش', tabby: 'تابby', tamara: 'تمارا' }
const paymentColors: Record<string, string> = { card: '#6a4cf5', cash: '#ff7a3d', tabby: '#22c55e', tamara: '#0099ff' }

type Period = '7d' | '30d' | '90d'

export default function Reports() {
  const [period, setPeriod] = useState<Period>('30d')
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (p: Period, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [ovData, prodData] = await Promise.all([
        analyticsApi.overview(p),
        productsApi.list(),
      ])
      setOverview(ovData)
      setAllProducts(prodData.products)
    } catch {
      // ignore
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load(period) }, [period])

  const handleRefresh = () => load(period, true)

  const lowStockProducts = allProducts.filter(p => p.stock < p.lowStockAlert)

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
          </div>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 4 }}>{sub}</div>}
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-muted)', fontSize: 14 }}>جاري التحميل...</div>
        ) : !overview ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-muted)', fontSize: 14 }}>لا توجد بيانات لهذه الفترة</div>
        ) : (
          <>
            {/* KPI grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              <KPI icon={DollarSign} label="إجمالي الإيرادات" value={`${overview.totalRevenue.toLocaleString('ar-SA')} ر.س`} sub="خلال الفترة المحددة" color="#6a4cf5" trend="up" />
              <KPI icon={ShoppingCart} label="إجمالي الطلبات" value={overview.totalOrders.toString()} sub={`${overview.pendingOrders} معلق`} color="#0099ff" trend="up" />
              <KPI icon={DollarSign} label="متوسط قيمة الطلب" value={`${Math.round(overview.avgOrderValue).toLocaleString('ar-SA')} ر.س`} color="#22c55e" trend="up" />
              <KPI icon={Package} label="طلبات مرفوضة" value={overview.rejectedOrders.toString()} sub={overview.totalOrders > 0 ? `${Math.round((overview.rejectedOrders / overview.totalOrders) * 100)}% معدل الرفض` : '—'} color="#ff5577" trend="down" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

              {/* cities breakdown */}
              <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>أعلى المدن</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {overview.topCities.slice(0, 6).map(([city, data], i) => (
                    <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: i === 0 ? 'rgba(106,76,245,0.15)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: i === 0 ? '#6a4cf5' : 'var(--ink-muted)', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{city}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{data.orders} طلب</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{data.revenue.toLocaleString('ar-SA')} ر.س</div>
                    </div>
                  ))}
                  {overview.topCities.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ink-muted)', fontSize: 13 }}>لا توجد بيانات</div>
                  )}
                </div>
              </div>

              {/* payment breakdown */}
              <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>طرق الدفع</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(overview.paymentBreakdown).map(([method, count]) => {
                    const total = Object.values(overview.paymentBreakdown).reduce((s, v) => s + v, 0)
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0
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

            {/* low stock */}
            <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px', marginBottom: 16 }}>
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
                        <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{p.category || '—'}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: p.stock === 0 ? '#ff5577' : '#ff7a3d' }}>
                        {p.stock === 0 ? 'نافد' : p.stock}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* products table */}
            <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>أداء المنتجات</div>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>مرتب حسب المخزون</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 0 }}>
                <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline-soft)', fontWeight: 600 }}>المنتج</div>
                <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline-soft)', fontWeight: 600 }}>السعر</div>
                <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline-soft)', fontWeight: 600 }}>المخزون</div>
                <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline-soft)', fontWeight: 600 }}>الحالة</div>
                {allProducts.map(p => (
                  <>
                    <div key={`${p.id}-name`} style={{ padding: '12px 20px', borderBottom: '1px solid var(--hairline-soft)' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{p.category || '—'} · {p.sku || p.id}</div>
                    </div>
                    <div key={`${p.id}-price`} style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', borderBottom: '1px solid var(--hairline-soft)', display: 'flex', alignItems: 'center' }}>{(p.price / 100).toLocaleString('ar-SA')} ر.س</div>
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
          </>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
