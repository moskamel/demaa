import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'

function isTokenValid(): boolean {
  const token = localStorage.getItem('deema_token')
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  if (!isTokenValid()) {
    localStorage.removeItem('deema_token')
    localStorage.removeItem('deema_user')
    localStorage.removeItem('deema_org')
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  return isTokenValid() ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Activity from './pages/Activity'
import Stores from './pages/Stores'
import Connectors from './pages/Connectors'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Team from './pages/Team'
import Billing from './pages/Billing'
import Insights from './pages/Insights'
import Reports from './pages/Reports'
import Customers from './pages/Customers'
import Orders from './pages/Orders'
import Subscribe from './pages/Subscribe'
import Coupons from './pages/Coupons'
import NotFound from './pages/NotFound'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import Platforms from './pages/Platforms'
import Changelog from './pages/Changelog'
import About from './pages/About'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import Careers from './pages/Careers'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Security from './pages/Security'
import Cookies from './pages/Cookies'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/signup" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
            <Route path="/activity" element={<PrivateRoute><Activity /></PrivateRoute>} />
            <Route path="/stores" element={<PrivateRoute><Stores /></PrivateRoute>} />
            <Route path="/connectors" element={<PrivateRoute><Connectors /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/team" element={<PrivateRoute><Team /></PrivateRoute>} />
            <Route path="/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
            <Route path="/insights" element={<PrivateRoute><Insights /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
            <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
            <Route path="/coupons" element={<PrivateRoute><Coupons /></PrivateRoute>} />
            <Route path="/subscribe" element={<PrivateRoute><Subscribe /></PrivateRoute>} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/platforms" element={<Platforms />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/security" element={<Security />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
