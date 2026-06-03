import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { TickCircle, CloseCircle, Warning2, InfoCircle } from 'iconsax-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  exiting?: boolean
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

const icons: Record<ToastType, React.ElementType> = { success: TickCircle, error: CloseCircle, warning: Warning2, info: InfoCircle }
const colors: Record<ToastType, string> = { success: '#22c55e', error: '#ff5577', warning: '#ff7a3d', info: '#4d7cff' }
const bgColors: Record<ToastType, string> = {
  success: 'rgba(34,197,94,0.08)',
  error:   'rgba(255,85,119,0.08)',
  warning: 'rgba(255,122,61,0.08)',
  info:    'rgba(77,124,255,0.08)',
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = icons[toast.type]
  const color = colors[toast.type]
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const duration = 3500
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const elapsed = now - start
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100))
      if (elapsed < duration) raf = requestAnimationFrame(tick)
      else onRemove(toast.id)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [toast.id, onRemove])

  return (
    <div
      className={toast.exiting ? 'animate-toast-out' : 'animate-toast-in'}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
        background: 'var(--canvas-soft)', borderRadius: 12,
        border: `1px solid ${color}30`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px ${color}18`,
        fontSize: 13, color: 'var(--ink)',
        minWidth: 240, maxWidth: 340,
        position: 'relative', overflow: 'hidden',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Colored left accent */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: '0 12px 12px 0' }} />

      {/* Icon with bg */}
      <div style={{ width: 28, height: 28, borderRadius: 8, background: bgColors[toast.type], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={14} color={color} variant="Outline" />
      </div>

      <span style={{ flex: 1, letterSpacing: '-0.13px', lineHeight: 1.4 }}>{toast.message}</span>

      <button
        onClick={() => onRemove(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: 2, display: 'flex', borderRadius: 4, flexShrink: 0, transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
      >
        <CloseCircle size={13} variant="Outline" />
      </button>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `${color}20`,
      }}>
        <div style={{
          height: '100%', background: color, borderRadius: 2,
          width: `${progress}%`, transition: 'none',
        }} />
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 200)
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-3), { id, type, message }])
  }, [])

  const success = useCallback((m: string) => toast(m, 'success'), [toast])
  const error   = useCallback((m: string) => toast(m, 'error'),   [toast])
  const warning = useCallback((m: string) => toast(m, 'warning'), [toast])
  const info    = useCallback((m: string) => toast(m, 'info'),    [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', flexDirection: 'column-reverse', gap: 10,
        alignItems: 'center', pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
