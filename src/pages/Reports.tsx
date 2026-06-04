import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendUp, TrendDown, Box, ShoppingCart, DollarCircle, DocumentDownload, Refresh2, DocumentText } from 'iconsax-react'
import { analytics as analyticsApi, products as productsApi, type AnalyticsOverview, type Product } from '../lib/api'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import AnimatedNumber from '../components/AnimatedNumber'
import { SkeletonKPI, SkeletonRow } from '../components/Skeleton'

const paymentLabels: Record<string, string> = { card: 'بطاقة', cash: 'كاش', tabby: 'تابby', tamara: 'تمارا' }
const paymentColors: Record<string, string> = { card: '#6a4cf5', cash: '#ff7a3d', tabby: '#22c55e', tamara: '#0099ff' }

type Period = '7d' | '30d' | '90d'

export default function Reports() {
  const navigate = useNavigate()
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

  const KPI = ({ icon: Icon, label, numericValue, unit, sub, color, trend }: {
    icon: React.ElementType; label: string; numericValue: number; unit?: string; sub?: string; color: string; trend?: 'up' | 'down'
  }) => (
    <div className="card-interactive animate-fade-in-up" style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}>
          <Icon size={17} color={color} variant="Outline" />
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: trend === 'up' ? '#22c55e' : '#ff5577', background: trend === 'up' ? 'rgba(34,197,94,0.1)' : 'rgba(255,85,119,0.1)', borderRadius: 6, padding: '2px 6px' }}>
            {trend === 'up' ? <TrendUp size={11} variant="Outline" /> : <TrendDown size={11} variant="Outline" />}
          </div>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 4 }}>
        <AnimatedNumber value={numericValue} suffix={unit ? ` ${unit}` : ''} decimals={unit === 'ر.س' ? 0 : 0} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 4 }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppSidebar />
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--canvas)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader>
        <div style={{ display: 'flex', gap: 4, background: 'var(--canvas-soft)', borderRadius: 9, padding: 3 }}>
          {([['7d', '7 أيام'], ['30d', '30 يوم'], ['90d', '3 أشهر']] as [Period, string][]).map(([p, label]) => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, background: period === p ? 'var(--ink)' : 'transparent', color: period === p ? 'var(--canvas)' : 'var(--ink-muted)', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={handleRefresh} disabled={refreshing} style={{ background: 'none', border: '1px solid var(--hairline)', borderRadius: 8, cursor: 'pointer', color: 'var(--ink-muted)', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'inherit' }}>
          <Refresh2 size={13} variant="Outline" style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> تحديث
        </button>
      </AppHeader>
      <div style={{ padding: '30px 30px 30px 20px', width: '100%' }}>
        {loading ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {[0,1,2,3].map(i => <SkeletonKPI key={i} />)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[0,1,2,3,4].map(i => <SkeletonRow key={i} />)}
            </div>
          </div>
        ) : !overview ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ marginBottom: 12 }}><DocumentText size={48} color="var(--ink-muted)" style={{ opacity: 0.3 }} /></div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>لا توجد تقارير بعد</div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20, maxWidth: 280, margin: '0 auto 20px' }}>أضف طلبات لبدء إنشاء التقارير التلقائية</div>
            <button onClick={() => navigate('/orders')} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              الطلبات
            </button>
          </div>
        ) : (
          <>
            {/* KPI grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              <KPI icon={DollarCircle} label="إجمالي الإيرادات" numericValue={overview.totalRevenue} unit="ر.س" sub="خلال الفترة المحددة" color="#6a4cf5" trend="up" />
              <KPI icon={ShoppingCart} label="إجمالي الطلبات" numericValue={overview.totalOrders} sub={`${overview.pendingOrders} معلق`} color="#0099ff" trend="up" />
              <KPI icon={DollarCircle} label="متوسط قيمة الطلب" numericValue={Math.round(overview.avgOrderValue)} unit="ر.س" color="#22c55e" trend="up" />
              <KPI icon={Box} label="طلبات مرفوضة" numericValue={overview.rejectedOrders} sub={overview.totalOrders > 0 ? `${Math.round((overview.rejectedOrders / overview.totalOrders) * 100)}% معدل الرفض` : '—'} color="#ff5577" trend="down" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

              {/* cities breakdown */}
              <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>أعلى المدن</div>
                </div>
                {(() => {
                  const cities = overview.topCities.slice(0, 6)
                  const maxRevenue = Math.max(...cities.map(([, d]) => d.revenue), 1)
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {cities.map(([city, data], i) => {
                        const pct = Math.round((data.revenue / maxRevenue) * 100)
                        const colors = ['#6a4cf5','#0099ff','#22c55e','#ff7a3d','#d44df0','#ff5577']
                        return (
                          <div key={city} className={`animate-fade-in stagger-${Math.min(i+1,8) as 1}`} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 18, height: 18, borderRadius: 5, background: `${colors[i]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: colors[i] }}>{i + 1}</div>
                                <span style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{city}</span>
                                <span style={{ fontSize: 10, color: 'var(--ink-muted)' }}>{data.orders} طلب</span>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{data.revenue.toLocaleString('ar-SA')} ر.س</span>
                            </div>
                            <div style={{ height: 5, background: 'var(--canvas-soft-2)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', borderRadius: 3, background: colors[i],
                                width: `${pct}%`,
                                animation: `barGrow 0.7s var(--ease-out-expo) ${i * 80}ms both`,
                              }} />
                            </div>
                          </div>
                        )
                      })}
                      {cities.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ink-muted)', fontSize: 13 }}>لا توجد بيانات</div>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* payment breakdown */}
              <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px' }}>
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
            <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px', marginBottom: 16 }}>
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
            <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>أداء المنتجات</div>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>مرتب حسب المخزون</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 0 }}>
                <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline)', fontWeight: 600 }}>المنتج</div>
                <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline)', fontWeight: 600 }}>السعر</div>
                <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline)', fontWeight: 600 }}>المخزون</div>
                <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline)', fontWeight: 600 }}>الحالة</div>
                {allProducts.map(p => (
                  <>
                    <div key={`${p.id}-name`} style={{ padding: '12px 20px', borderBottom: '1px solid var(--hairline)' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{p.category || '—'} · {p.sku || p.id}</div>
                    </div>
                    <div key={`${p.id}-price`} style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center' }}>{(p.price / 100).toLocaleString('ar-SA')} ر.س</div>
                    <div key={`${p.id}-stock`} style={{ padding: '12px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: p.stock === 0 ? '#ff5577' : p.stock < 5 ? '#ff7a3d' : 'var(--ink)' }}>{p.stock}</span>
                    </div>
                    <div key={`${p.id}-status`} style={{ padding: '12px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center' }}>
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
    </div>
  )
}
