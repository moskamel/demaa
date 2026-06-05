import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CURRENCIES } from '../lib/currency'
import { useCurrency } from '../context/CurrencyContext'

const T = { hairline: 'rgba(255,255,255,0.08)', slate: '#9090a2', muted: '#5e5e72', ink: '#f0f0f5', purple: '#6a4cf5' }

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const selected = CURRENCIES.find(c => c.code === currency)!

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#18181e', border: `1px solid ${open ? T.purple : T.hairline}`,
          borderRadius: 9999, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 13, fontWeight: 600, color: T.ink, transition: 'border-color 0.15s',
        }}
      >
        <span>{selected.flag}</span>
        <span>{selected.label}</span>
        <span style={{ color: T.slate, fontSize: 11, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 50,
              background: '#1e1e26', border: `1px solid ${T.hairline}`, borderRadius: 14,
              padding: 6, minWidth: 180, boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: currency === c.code ? 'rgba(106,76,245,0.15)' : 'transparent',
                  fontFamily: 'inherit', fontSize: 13,
                  fontWeight: currency === c.code ? 700 : 500,
                  color: currency === c.code ? T.ink : T.slate,
                  textAlign: 'right', transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (currency !== c.code) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (currency !== c.code) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 16 }}>{c.flag}</span>
                <span style={{ flex: 1 }}>{c.label}</span>
                <span style={{ fontSize: 11, color: T.muted }}>{c.symbol}</span>
                {currency === c.code && <span style={{ color: T.purple, fontSize: 12 }}>✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {open && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />}
    </div>
  )
}
