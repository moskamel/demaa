import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft2, Flash, TickCircle, Repeat, Box, Shop, People } from 'iconsax-react'
import { aiApi, orders as ordersApi, storesApi, teamApi, type Subscription } from '../lib/api'

const FEATURES = [
  'منصات غير محدودة',
  'طلبات غير محدودة',
  'تطبيقات وتكاملات غير محدودة',
  'فريق عمل غير محدود',
  'تقارير كاملة ومتقدمة',
  'ذكاء اصطناعي مدعوم بـ Groq AI',
  'إدارة المخزون التلقائية',
  'كوبونات وإشعارات',
  'API Access كامل',
  'أولوية الدعم الفني',
  'تحليلات متقدمة وبيانات حية',
  'تصدير التقارير',
]

export default function Billing() {
  const [sub, setSub] = useState<Subscription | null>(null)
  const [orderCount, setOrderCount] = useState<number | null>(null)
  const [storeCount, setStoreCount] = useState<number | null>(null)
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      aiApi.usage(),
      ordersApi.stats(),
      storesApi.list(),
      teamApi.list(),
    ]).then(([usageData, stats, storesData, teamData]) => {
      setSub(usageData.subscription)
      setOrderCount(stats.pending + stats.accepted + stats.shipped + stats.delivered + stats.rejected)
      setStoreCount(storesData.stores.length)
      setMemberCount(teamData.members.length)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const planLabel = sub?.planId === 'pro' ? 'Pro' : sub?.planId === 'growth' ? 'Growth' : 'Free'
  const statusColor = sub?.status === 'active' ? '#22c55e' : '#ff7a3d'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', paddingBottom: 60 }}>
      <div style={{ borderBottom: '1px solid var(--hairline)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft2 size={14} variant="Outline" /> الرئيسية
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>الاشتراك</span>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>

        {/* hero banner */}
        <div style={{ background: 'linear-gradient(135deg, #007cf0 0%, #00dfd8 100%)', borderRadius: 20, padding: '32px 28px', marginBottom: 32, textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Flash size={24} color="#fff" variant="Outline" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>
            {loading ? '...' : `باقة ${planLabel}`}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 20 }}>
            جميع المميزات متاحة لك بدون قيود ولا رسوم
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 20px' }}>
            <Repeat size={18} color="#fff" variant="Outline" />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
              {loading ? '...' : sub?.status === 'active' ? 'مفعّل · غير محدود' : 'غير مفعّل'}
            </span>
          </div>
        </div>

        {/* plan card */}
        <div style={{ background: 'var(--canvas-soft)', borderRadius: 20, border: '2px solid #6a4cf5', padding: '28px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, background: 'linear-gradient(90deg, #6a4cf5, #d44df0)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>
                  {loading ? '...' : `باقة ${planLabel}`}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6a4cf5', background: 'rgba(106,76,245,0.12)', borderRadius: 6, padding: '3px 8px' }}>باقتك الحالية</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
                <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                  {loading ? '...' : sub?.status === 'active' ? 'جميع المميزات مفعّلة' : 'الاشتراك غير نشط'}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#22c55e', letterSpacing: '-1px', lineHeight: 1 }}>مجاناً</div>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>بدون رسوم</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <TickCircle size={10} color="#22c55e" variant="Outline" />
                </div>
                <span style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.4 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* real usage stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'الطلبات المعالجة', value: loading ? '...' : (orderCount ?? 0).toLocaleString('ar-EG'), icon: Box, color: '#6a4cf5' },
            { label: 'المتاجر المربوطة', value: loading ? '...' : (storeCount ?? 0).toLocaleString('ar-EG'), icon: Shop, color: '#0099ff' },
            { label: 'أعضاء الفريق', value: loading ? '...' : (memberCount ?? 0).toLocaleString('ar-EG'), icon: People, color: '#22c55e' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '16px', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Icon size={16} color={color} variant="Outline" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
