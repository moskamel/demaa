import { useState, useCallback, useRef } from 'react'

type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  risk?: RiskLevel
  /** For bulk actions – show a count badge */
  affectedCount?: number
  /** For critical risk – user must type this phrase to confirm */
  confirmPhrase?: string
  /** Extra consequence text shown in a warning box */
  consequence?: string
}

const RISK_COLOR: Record<RiskLevel, string> = {
  low:      '#22c55e',
  medium:   '#ff7a3d',
  high:     '#ff5577',
  critical: '#ff1744',
}

const RISK_ICON: Record<RiskLevel, string> = {
  low:      '✏️',
  medium:   '⚠️',
  high:     '🚨',
  critical: '💀',
}

const RISK_LABEL: Record<RiskLevel, string> = {
  low:      'خطر منخفض',
  medium:   'خطر متوسط',
  high:     'خطر عالٍ',
  critical: 'خطر بالغ',
}

export function useConfirm() {
  const [state, setState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null)
  const [exiting, setExiting] = useState(false)
  const [phrase, setPhrase] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setExiting(false)
    setPhrase('')
    return new Promise(resolve => {
      setState({ opts, resolve })
      setTimeout(() => inputRef.current?.focus(), 80)
    })
  }, [])

  const handleResponse = (val: boolean) => {
    if (val && state?.opts.confirmPhrase && phrase.trim().toUpperCase() !== state.opts.confirmPhrase.toUpperCase()) return
    setExiting(true)
    setTimeout(() => {
      state?.resolve(val)
      setState(null)
      setExiting(false)
      setPhrase('')
    }, 180)
  }

  const Dialog = state ? (() => {
    const { opts } = state
    const risk: RiskLevel = opts.risk ?? (opts.danger ? 'high' : 'low')
    const color = RISK_COLOR[risk]
    const isCritical = risk === 'critical' || !!opts.confirmPhrase
    const phraseMatch = opts.confirmPhrase
      ? phrase.trim().toUpperCase() === opts.confirmPhrase.toUpperCase()
      : true

    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
          opacity: exiting ? 0 : 1,
          transition: exiting ? 'opacity 0.18s ease' : 'opacity 0.15s ease',
          animation: exiting ? undefined : 'fadeIn 0.15s ease',
        }}
        onClick={() => handleResponse(false)}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--canvas-soft)', borderRadius: 20, padding: '28px 24px',
            maxWidth: 420, width: '100%', border: `1px solid ${isCritical ? color + '40' : 'var(--hairline)'}`,
            fontFamily: "'Zain','Inter',sans-serif", direction: 'rtl',
            boxShadow: `0 24px 80px rgba(0,0,0,0.55)${isCritical ? `, 0 0 0 1px ${color}20` : ''}`,
            transform: exiting ? 'scale(0.94) translateY(8px)' : 'scale(1)',
            opacity: exiting ? 0 : 1,
            transition: exiting ? 'all 0.18s ease' : 'all 0.18s ease',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>
              {RISK_ICON[risk]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{opts.title}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color, background: color + '18', borderRadius: 6, display: 'inline-block', padding: '2px 8px' }}>
                {RISK_LABEL[risk]}
              </div>
            </div>
          </div>

          {/* Message */}
          <div style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: opts.affectedCount || opts.consequence ? 16 : 24 }}>
            {opts.message}
          </div>

          {/* Affected count */}
          {opts.affectedCount !== undefined && (
            <div style={{ background: color + '10', border: `1px solid ${color}30`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color }}>{opts.affectedCount}</span>
              <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>عنصر سيتأثر بهذا الإجراء</span>
            </div>
          )}

          {/* Consequence */}
          {opts.consequence && (
            <div style={{ background: 'rgba(255,122,61,0.08)', border: '1px solid rgba(255,122,61,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#ff7a3d', lineHeight: 1.5 }}>
              ⚠️ {opts.consequence}
            </div>
          )}

          {/* Type-to-confirm */}
          {opts.confirmPhrase && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6 }}>
                اكتب <strong style={{ color: 'var(--ink)', fontFamily: 'monospace' }}>{opts.confirmPhrase}</strong> للتأكيد
              </div>
              <input
                ref={inputRef}
                value={phrase}
                onChange={e => setPhrase(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && phraseMatch) handleResponse(true) }}
                placeholder={opts.confirmPhrase}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  borderRadius: 8, border: `1.5px solid ${phrase ? (phraseMatch ? '#22c55e' : '#ff5577') : 'var(--hairline)'}`,
                  background: 'var(--canvas)', color: 'var(--ink)', fontSize: 13,
                  fontFamily: 'monospace', outline: 'none', transition: 'border-color 0.15s',
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => handleResponse(true)}
              disabled={!!opts.confirmPhrase && !phraseMatch}
              className="btn-press"
              style={{
                flex: 1, padding: '11px', borderRadius: 10, border: 'none', cursor: (!opts.confirmPhrase || phraseMatch) ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                background: (!opts.confirmPhrase || phraseMatch) ? color : 'var(--canvas-soft-2)',
                color: (!opts.confirmPhrase || phraseMatch) ? '#fff' : 'var(--ink-disabled)',
                transition: 'all 0.15s',
                opacity: opts.confirmPhrase && !phraseMatch ? 0.5 : 1,
              }}
            >
              {opts.confirmLabel || 'تأكيد'}
            </button>
            <button
              onClick={() => handleResponse(false)}
              className="btn-press"
              style={{
                flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                background: 'transparent', color: 'var(--ink-muted)',
                border: '1px solid var(--hairline)',
                transition: 'transform 0.12s, border-color 0.15s',
              }}
            >
              {opts.cancelLabel || 'إلغاء'}
            </button>
          </div>
        </div>
      </div>
    )
  })() : null

  return { confirm, Dialog }
}
