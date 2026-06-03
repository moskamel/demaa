import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: 'var(--canvas)', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16, fontFamily: "'Zain','Inter',sans-serif", padding: 24,
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>حدث خطأ غير متوقع</div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', maxWidth: 380, textAlign: 'center', lineHeight: 1.6 }}>
            {this.state.error?.message || 'خطأ في التطبيق'}
          </div>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/dashboard' }}
            style={{
              padding: '10px 24px', borderRadius: 9999, border: 'none',
              background: 'var(--ink)', color: 'var(--canvas)', cursor: 'pointer',
              fontSize: 14, fontFamily: 'inherit', fontWeight: 500,
            }}>
            العودة للرئيسية
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
