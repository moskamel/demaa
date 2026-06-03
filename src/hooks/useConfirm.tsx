import { useState, useCallback } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

export function useConfirm() {
  const [state, setState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null)
  const [exiting, setExiting] = useState(false)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setExiting(false)
    return new Promise(resolve => setState({ opts, resolve }))
  }, [])

  const handleResponse = (val: boolean) => {
    setExiting(true)
    setTimeout(() => {
      state?.resolve(val)
      setState(null)
      setExiting(false)
    }, 180)
  }

  const Dialog = state ? (
    <div
      className="animate-backdrop-in"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        opacity: exiting ? 0 : undefined,
        transition: exiting ? 'opacity 0.18s ease' : undefined,
      }}
      onClick={() => handleResponse(false)}
    >
      <div
        className={exiting ? '' : 'animate-modal-in'}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--canvas-soft)', borderRadius: 20, padding: '28px 24px',
          maxWidth: 380, width: '100%', border: '1px solid var(--hairline)',
          fontFamily: "'Zain','Inter',sans-serif", direction: 'rtl',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          transform: exiting ? 'scale(0.94) translateY(8px)' : undefined,
          opacity: exiting ? 0 : undefined,
          transition: exiting ? 'all 0.18s ease' : undefined,
        }}
      >
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, marginBottom: 16,
          background: state.opts.danger ? 'rgba(255,85,119,0.12)' : 'rgba(106,76,245,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {state.opts.danger ? '⚠️' : '❓'}
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
          {state.opts.title}
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          {state.opts.message}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => handleResponse(true)}
            className="btn-press"
            style={{
              flex: 1, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
              background: state.opts.danger ? '#ff5577' : 'var(--ink)',
              color: state.opts.danger ? '#fff' : 'var(--canvas)',
              transition: 'transform 0.12s, opacity 0.12s',
            }}
          >
            {state.opts.confirmLabel || 'تأكيد'}
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
            إلغاء
          </button>
        </div>
      </div>
    </div>
  ) : null

  return { confirm, Dialog }
}
