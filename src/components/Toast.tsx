import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { TickCircle, CloseCircle, Warning2, InfoCircle } from 'iconsax-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

const icons: Record<ToastType, React.ElementType> = { success: TickCircle, error: CloseCircle, warning: Warning2, info: InfoCircle }
const colors: Record<ToastType, string> = { success: '#22c55e', error: '#ff5577', warning: '#ff7a3d', info: '#0099ff' }

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = icons[toast.type]
  const color = colors[toast.type]

  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3500)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
      background: 'var(--canvas)', borderRadius: 10, border: '1px solid var(--hairline)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.10)', fontSize: 13, color: 'var(--ink)',
      animation: 'fadeIn 0.18s ease-out', minWidth: 220, maxWidth: 320,
    }}>
      <Icon size={15} color={color} variant="Outline" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, letterSpacing: '-0.13px' }}>{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: 0, display: 'flex' }}>
        <CloseCircle size={13} variant="Outline" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-3), { id, type, message }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
