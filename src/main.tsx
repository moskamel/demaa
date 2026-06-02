import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/connectors" element={<Connectors />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/team" element={<Team />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/customers" element={<Customers />} />
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
  </StrictMode>,
)
