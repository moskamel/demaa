import { motion, AnimatePresence } from 'framer-motion'
import { TickCircle } from 'iconsax-react'
import type { Plan } from '../lib/plans'
import { CURRENCIES, PLAN_PRICES, formatPrice } from '../lib/currency'
import type { CurrencyCode } from '../lib/currency'

const T = {
  ink: '#f0f0f5',
  slate: '#9090a2',
  muted: '#5e5e72',
  hairline: 'rgba(255,255,255,0.08)',
  surface: '#18181e',
}

function AnimatedPrice({ text }: { text: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={text}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.18 }}
        style={{ display: 'inline-block' }}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  )
}

interface PlanCardProps {
  plan: Plan
  currency: CurrencyCode
  billing: 'monthly' | 'yearly'
  /** Rendered at the bottom of the card */
  cta: React.ReactNode
  /** Highlight ring for selected state (Subscribe page) */
  selected?: boolean
  /** Show "current plan" badge instead of CTA (Billing page) */
  isCurrent?: boolean
  /** Animation delay index */
  index?: number
  onClick?: () => void
}

export default function PlanCard({ plan, currency, billing, cta, selected, index = 0, onClick }: PlanCardProps) {
  const currencyInfo = CURRENCIES.find(c => c.code === currency)!
  const billingIdx = billing === 'monthly' ? 0 : 1
  const amount = (PLAN_PRICES[plan.id]?.[currency] ?? [0, 0])[billingIdx]
  const displayPrice = amount === 0 ? null : formatPrice(amount, currencyInfo)

  const savings = (() => {
    if (billing !== 'yearly') return null
    const monthly = (PLAN_PRICES[plan.id]?.[currency] ?? [0, 0])[0]
    const yearly = (PLAN_PRICES[plan.id]?.[currency] ?? [0, 0])[1]
    if (!monthly || !yearly) return null
    const saved = monthly * 12 - yearly
    return saved > 0 ? formatPrice(saved, currencyInfo) : null
  })()

  const isSmallCurrency = currencyInfo.decimals > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      whileHover={{ y: -6, boxShadow: plan.featured ? '0 32px 80px rgba(106,76,245,0.3)' : '0 20px 48px rgba(0,0,0,0.5)' }}
      onClick={onClick}
      style={{
        background: plan.featured
          ? 'linear-gradient(145deg,rgba(106,76,245,0.18),rgba(212,77,240,0.09))'
          : T.surface,
        borderRadius: 24,
        padding: '28px 22px 24px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        border: selected
          ? `2px solid ${plan.color}`
          : plan.featured
            ? '1px solid rgba(106,76,245,0.4)'
            : `1px solid ${T.hairline}`,
        boxShadow: selected
          ? `0 0 0 4px ${plan.color}22, 0 16px 48px rgba(106,76,245,0.15)`
          : plan.featured
            ? '0 16px 48px rgba(106,76,245,0.15)'
            : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Featured top bar */}
      {plan.featured && (
        <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, borderRadius: '24px 24px 0 0', background: 'linear-gradient(90deg,#6a4cf5,#d44df0)' }} />
      )}

      {/* Tag badge */}
      {plan.tag && (
        <div style={{ position: 'absolute', top: -13, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <span style={{ background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{plan.tag}</span>
        </div>
      )}

      {/* Plan name */}
      <div style={{ fontSize: 14, fontWeight: 700, color: plan.color, marginBottom: 14, letterSpacing: '0.02em', marginTop: plan.tag ? 6 : 0 }}>{plan.name}</div>

      {/* Price */}
      <div style={{ marginBottom: 4 }}>
        {displayPrice === null ? (
          <span style={{ fontSize: 36, fontWeight: 800, color: T.ink, letterSpacing: '-2px', lineHeight: 1 }}>مجاناً</span>
        ) : (
          <span style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'baseline', gap: 5, direction: 'ltr' }}>
            <span style={{ fontSize: isSmallCurrency ? 14 : 16, fontWeight: 700, color: T.slate, letterSpacing: 0 }}>{currencyInfo.symbol}</span>
            <span style={{ fontSize: isSmallCurrency ? 26 : 36, fontWeight: 800, color: T.ink, letterSpacing: '-1.5px', lineHeight: 1 }}>
              <AnimatedPrice text={amount.toFixed(currencyInfo.decimals)} />
            </span>
          </span>
        )}
      </div>

      {/* Period + savings */}
      <div style={{ marginBottom: 20, minHeight: 36 }}>
        <div style={{ fontSize: 12, color: T.muted }}>
          {plan.price === 0 ? 'للأبد' : billing === 'monthly' ? '/ شهر' : '/ سنة'}
        </div>
        {savings && (
          <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', marginTop: 3 }}>
            وفّر <AnimatedPrice text={savings} />
          </div>
        )}
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24, flex: 1 }}>
        {plan.features.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <TickCircle size={13} color={plan.featured ? '#22c55e' : plan.color} variant="Outline" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12, color: plan.featured ? T.slate : T.muted, lineHeight: 1.45 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* CTA slot */}
      {cta}
    </motion.div>
  )
}
