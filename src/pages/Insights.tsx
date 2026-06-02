import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Brain, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import { aiApi, type AiMemory, type UsageRecord } from '../lib/api'

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
  avg_order_value: v => `${v} ج.م`,
  cod_rejection_threshold: v => `>${v} ج.م`,
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
  const [insights, setInsights] = useState<AiMemory[]>([])
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([])
  const [subscription, setSubscription] = useState<{ ordersLimit: number } | null>(null)
  const [loading, setLoading] = useState(true)

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

  const latestUsage = usageRecords[usageRecords.length - 1]
  const planLimit = subscription?.ordersLimit ?? 1000
  const usagePct = latestUsage ? Math.round((latestUsage.ordersProcessed / planLimit) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', paddingBottom: 60 }}>
      {/* top bar */}
      <div style={{ borderBottom: '1px solid var(--hairline)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13 }}>
          <ChevronLeft size={14} /> الرئيسية
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>الذاكرة الذكية</span>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #6a4cf5 0%, #d44df0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={22} color="#fff" />
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
              <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '20px 24px', marginBottom: 28, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <TrendingUp size={14} color="var(--ink-muted)" />
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
                  <span style={{ fontSize: 11, color: 'var(--ink-muted)', background: 'var(--surface-1)', borderRadius: 6, padding: '2px 8px' }}>محدّثة تلقائياً</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                  {insights.map(insight => {
                    const displayValue = (INSIGHT_VALUE_LABELS[insight.key] ?? (v => v))(insight.value)
                    return (
                      <div key={insight.key} style={{ background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 20, marginBottom: 4 }}>{INSIGHT_ICONS[insight.key] ?? '💡'}</div>
                            <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 500 }}>{insight.label || insight.key}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink-muted)', fontSize: 10 }}>
                            <Clock size={9} />
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
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)', fontSize: 14 }}>
                <Brain size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                <div>لا توجد رؤى بعد — تفاعل مع ديما لتبدأ التعلم</div>
              </div>
            )}

            {/* low stock alert */}
            {(() => {
              const lowStockInsight = insights.find(i => i.key === 'low_stock_risk')
              if (!lowStockInsight) return null
              const prods = lowStockInsight.value.split(',')
              return (
                <div style={{ background: 'rgba(255,122,61,0.08)', border: '1px solid rgba(255,122,61,0.25)', borderRadius: 14, padding: '16px 20px', marginTop: 20, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <AlertTriangle size={16} color="#ff7a3d" style={{ flexShrink: 0, marginTop: 1 }} />
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
      </div>
    </div>
  )
}
