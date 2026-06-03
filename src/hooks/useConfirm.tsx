import { useState, useCallback } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

export function useConfirm() {
  const [state, setState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => setState({ opts, resolve }))
  }, [])

  const handleResponse = (val: boolean) => {
    state?.resolve(val)
    setState(null)
  }

  const Dialog = state ? (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={() => handleResponse(false)}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--canvas-soft)', borderRadius: 20, padding: '28px 24px',
          maxWidth: 380, width: '100%', border: '1px solid var(--hairline)',
          fontFamily: "'Zain','Inter',sans-serif", direction: 'rtl',
        }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
          {state.opts.title}
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          {state.opts.message}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => handleResponse(true)}
            style={{
              flex: 1, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
              background: state.opts.danger ? '#ff5577' : 'var(--ink)',
              color: state.opts.danger ? '#fff' : 'var(--canvas)',
            }}>
            {state.opts.confirmLabel || 'تأكيد'}
          </button>
          <button
            onClick={() => handleResponse(false)}
            style={{
              flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
              background: 'transparent', color: 'var(--ink-muted)',
              border: '1px solid var(--hairline)',
            }}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  ) : null

  return { confirm, Dialog }
}
