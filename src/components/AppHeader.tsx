import { useLocation } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
  '/stores':        'متاجري',
  '/reports':       'التقارير',
  '/team':          'الفريق',
  '/connectors':    'التطبيقات',
  '/notifications': 'الإشعارات',
  '/customers':     'العملاء',
  '/activity':      'سجل الأنشطة',
  '/settings':      'الإعدادات',
  '/billing':       'الاشتراك والفواتير',
  '/coupons':       'الكوبونات',
  '/dashboard':     'لوحة التحكم',
}

interface AppHeaderProps {
  title?: string
  children?: React.ReactNode
}

export default function AppHeader({ title, children }: AppHeaderProps) {
  const location = useLocation()
  const pageTitle = title ?? PAGE_TITLES[location.pathname] ?? ''

  return (
    <div style={{
      height: 52, borderBottom: '1px solid var(--hairline)',
      display: 'flex', alignItems: 'center', padding: '0 24px',
      gap: 12, flexShrink: 0, background: 'var(--canvas)',
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px', flex: 1 }}>
        {pageTitle}
      </span>
      {children}
    </div>
  )
}
