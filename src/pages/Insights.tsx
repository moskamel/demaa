import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft2, Cpu, TrendUp, Warning2, Clock, ChartSquare } from 'iconsax-react'
import { aiApi, orders, type AiMemory, type UsageRecord } from '../lib/api'

interface PnlData {
  revenue: number
  cost: number
  profit: number
  margin: number
  codPending: number
  codCollected: number
  codPendingValue: number
  topCities: { city: string; orders: number; revenue: number }[]
}

const INSIGHT_ICONS: Record<string, string> = {
  preferred_carrier: '🚚',
  top_city: '📍',
  best_sales_day: '📅',
  avg_order_value: '💰',
  top_product: '⭐',
  cod_rejection_threshold: '⚠️',
  peak_hour: '🕘',
  return_rate: '↩️',
  low_stock_risk: '📦',
  cash_ratio: '💵',
}

const INSIGHT_VALUE_LABELS: Record<string, (v: string) => string> = {
  preferred_carrier: v => v === 'smsa' ? 'SMSA' : v,
  top_city: v => v === 'cairo' ? 'القاهرة' : v,
  best_sales_day: v => ({ friday: 'الجمعة', thursday: 'الخميس', saturday: 'السبت' }[v] ?? v),
  avg_order_value: v => `${v} ر.س`,
  cod_rejection_threshold: v => `>${v} ر.س`,
  peak_hour: v => v,
  return_rate: v => `${(parseFloat(v) * 100).toFixed(0)}%`,
  cash_ratio: v => `${(parseFloat(v) * 100).toFixed(0)}%`,
  low_stock_risk: v => v,
  top_product: v => v,
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 90 ? '#22c55e' : pct >= 70 ? '#ff7a3d' : '#ff5577'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--hairline)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 11, color, fontVariantNumeric: 'tabular-nums', minWidth: 32, textAlign: 'left' }}>{pct}%</span>
    </div>
  )
}

export default function Insights() {
  const navigate = useNavigate()
  const [insights, setInsights] = useState<AiMemory[]>([])
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([])
  const [subscription, setSubscription] = useState<{ ordersLimit: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [pnl, setPnl] = useState<PnlData>({
    revenue: 0, cost: 0, profit: 0, margin: 0,
    codPending: 0, codCollected: 0, codPendingValue: 0,
    topCities: [],
  })
  const [pnlLoading, setPnlLoading] = useState(true)

  useEffect(() => {
    Promise.all([aiApi.memory(), aiApi.usage()])
      .then(([memData, usageData]) => {
        setInsights(memData.memory)
        setUsageRecords(usageData.records)
        setSubscription(usageData.subscription)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const loadPnl = async () => {
      try {
        const [deliveredRes, pendingRes] = await Promise.all([
          orders.list({ status: 'delivered', limit: '200' }),
          orders.list({ status: 'pending', limit: '200' }),
        ])

        const revenue = deliveredRes.orders.reduce((s, o) => s + o.total, 0)
        const cost = revenue * 0.6
        const profit = revenue - cost
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0

        const codPendingOrders = pendingRes.orders.filter(o => o.paymentMethod === 'cash' || o.paymentMethod === 'cod')
        const codPending = codPendingOrders.length
        const codPendingValue = codPendingOrders.reduce((s, o) => s + o.total, 0)
        const codCollected = deliveredRes.orders.filter(o => o.paymentMethod === 'cash' || o.paymentMethod === 'cod').length

        // Build top cities from delivered orders
        const cityMap: Record<string, { orders: number; revenue: number }> = {}
        for (const o of deliveredRes.orders) {
          const c = o.city || 'غير محدد'
          if (!cityMap[c]) cityMap[c] = { orders: 0, revenue: 0 }
          cityMap[c].orders++
          cityMap[c].revenue += o.total
        }
        const topCities = Object.entries(cityMap)
          .map(([city, data]) => ({ city, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        setPnl({ revenue, cost, profit, margin, codPending, codCollected, codPendingValue, topCities })
      } catch { /* silent */ }
      finally { setPnlLoading(false) }
    }
    loadPnl()
  }, [])

  const latestUsage = usageRecords[usageRecords.length - 1]
  const planLimit = subscription?.ordersLimit ?? 1000
  const usagePct = latestUsage ? Math.round((latestUsage.ordersProcessed / planLimit) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', paddingBottom: 60 }}>
      {/* top bar */}
      <div style={{ borderBottom: '1px solid var(--hairline)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft2 size={14} variant="Outline" /> الرئيسية
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>الذاكرة الذكية</span>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #007cf0 0%, #00dfd8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={22} color="#fff" variant="Outline" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px' }}>الذاكرة الذكية</div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>ديما تتعلم من متجرك — {insights.length} رؤى نشطة</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)', fontSize: 14 }}>جاري التحميل...</div>
        ) : (
          <>
            {/* usage banner */}
            {latestUsage && (
              <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px 24px', marginBottom: 28, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <TrendUp size={14} color="var(--ink-muted)" variant="Outline" />
                    <span style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 500 }}>الاستخدام هذا الشهر</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-1px' }}>{latestUsage.ordersProcessed.toLocaleString('ar-SA')}</span>
                    <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>/ {planLimit.toLocaleString('ar-SA')} طلب</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--hairline)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${usagePct}%`, height: '100%', background: usagePct > 80 ? '#ff5577' : usagePct > 60 ? '#ff7a3d' : '#6a4cf5', borderRadius: 4 }} />
                  </div>
                </div>
                {[...usageRecords].reverse().map(rec => (
                  <div key={rec.id} style={{ textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 4 }}>{rec.month}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{rec.ordersProcessed.toLocaleString('ar-SA')}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>
                      {rec.messagesUsed} رسالة
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* insights grid */}
            {insights.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>رؤى المتجر</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-muted)', background: 'var(--canvas-soft)', borderRadius: 6, padding: '2px 8px' }}>محدّثة تلقائياً</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                  {insights.map(insight => {
                    const displayValue = (INSIGHT_VALUE_LABELS[insight.key] ?? (v => v))(insight.value)
                    return (
                      <div key={insight.key} style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 20, marginBottom: 4 }}>{INSIGHT_ICONS[insight.key] ?? '💡'}</div>
                            <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 500 }}>{insight.label || insight.key}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink-muted)', fontSize: 10 }}>
                            <Clock size={9} variant="Outline" />
                            محدّث
                          </div>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.3 }}>{displayValue}</div>
                        <ConfidenceBar value={insight.confidence} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {insights.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ marginBottom: 12 }}><ChartSquare size={48} color="var(--ink-muted)" style={{ opacity: 0.3 }} /></div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>لا توجد بيانات تحليلية بعد</div>
                <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20, maxWidth: 280, margin: '0 auto 20px' }}>تحتاج على الأقل 10 طلبات لعرض التحليلات</div>
                <button onClick={() => navigate('/orders')} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  اذهب للطلبات
                </button>
              </div>
            )}

            {/* low stock alert */}
            {(() => {
              const lowStockInsight = insights.find(i => i.key === 'low_stock_risk')
              if (!lowStockInsight) return null
              const prods = lowStockInsight.value.split(',')
              return (
                <div style={{ background: 'rgba(255,122,61,0.08)', border: '1px solid rgba(255,122,61,0.25)', borderRadius: 14, padding: '16px 20px', marginTop: 20, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <Warning2 size={16} color="#ff7a3d" variant="Outline" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#ff7a3d', marginBottom: 4 }}>تحذير: منتجات على وشك النفاد</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {prods.map(p => (
                        <span key={p} style={{ fontSize: 12, color: 'var(--ink)', background: 'rgba(255,122,61,0.15)', borderRadius: 6, padding: '3px 10px' }}>{p.trim()}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}
          </>
        )}
        {/* ── P&L Financial Report ── */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 20 }}>📊</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>التقرير المالي</span>
          </div>

          {pnlLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-muted)', fontSize: 14 }}>جاري تحميل البيانات المالية...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
                {/* Revenue */}
                <div style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '20px' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 500, marginBottom: 10 }}>إجمالي الإيرادات</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e', letterSpacing: '-0.8px', lineHeight: 1.2 }}>
                    {pnl.revenue.toLocaleString('ar-SA', { maximumFractionDigits: 0 })}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>ر.س</div>
                </div>

                {/* Cost */}
                <div style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '20px' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 500, marginBottom: 10 }}>إجمالي التكاليف</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#ff5577', letterSpacing: '-0.8px', lineHeight: 1.2 }}>
                    {pnl.cost.toLocaleString('ar-SA', { maximumFractionDigits: 0 })}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>ر.س (تقديري 60%)</div>
                </div>

                {/* Profit */}
                <div style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '20px' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 500, marginBottom: 10 }}>صافي الربح</div>
                  <div style={{ fontSize: 22, fontWeight: 700, background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.8px', lineHeight: 1.2 }}>
                    {pnl.profit.toLocaleString('ar-SA', { maximumFractionDigits: 0 })}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>ر.س</div>
                </div>

                {/* Margin */}
                <div style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '20px' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 500, marginBottom: 10 }}>هامش الربح</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#ff7a3d', letterSpacing: '-0.8px', lineHeight: 1.2 }}>
                    {pnl.margin.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>من الإيرادات</div>
                </div>
              </div>

              {/* COD Breakdown */}
              <div style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '20px 24px', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>تفاصيل الدفع عند الاستلام (COD)</div>
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 6 }}>طلبات COD المعلقة</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#ff7a3d' }}>{pnl.codPending.toLocaleString('ar-SA')}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>طلب</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 6 }}>قيمة COD المعلقة</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#ff5577' }}>{pnl.codPendingValue.toLocaleString('ar-SA', { maximumFractionDigits: 0 })}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>ر.س</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 6 }}>طلبات COD المحصّلة</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{pnl.codCollected.toLocaleString('ar-SA')}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>طلب</div>
                  </div>
                </div>
              </div>

              {/* Top 5 Cities Bar Chart */}
              {pnl.topCities.length > 0 && (
                <div style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '20px 24px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 18 }}>أفضل 5 مدن حسب الإيرادات</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {(() => {
                      const maxRev = Math.max(...pnl.topCities.map(c => c.revenue), 1)
                      return pnl.topCities.map((c, idx) => (
                        <div key={c.city}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 11, color: 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums', minWidth: 16 }}>#{idx + 1}</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{c.city}</span>
                              <span style={{ fontSize: 11, color: 'var(--ink-muted)', background: 'var(--hairline)', borderRadius: 5, padding: '1px 7px' }}>{c.orders} طلب</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                              {c.revenue.toLocaleString('ar-SA', { maximumFractionDigits: 0 })} ر.س
                            </span>
                          </div>
                          <div style={{ height: 6, background: 'var(--hairline)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                              width: `${(c.revenue / maxRev) * 100}%`,
                              height: '100%',
                              borderRadius: 4,
                              background: idx === 0
                                ? 'linear-gradient(90deg,#6a4cf5,#d44df0)'
                                : idx === 1
                                  ? '#007cf0'
                                  : idx === 2
                                    ? '#22c55e'
                                    : '#ff7a3d',
                              transition: 'width 0.8s ease',
                            }} />
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
