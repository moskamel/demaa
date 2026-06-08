import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import authRouter from './routes/auth.js'
import conversationsRouter from './routes/conversations.js'
import ordersRouter from './routes/orders.js'
import productsRouter from './routes/products.js'
import analyticsRouter from './routes/analytics.js'
import notificationsRouter from './routes/notifications.js'
import customersRouter from './routes/customers.js'
import storesRouter from './routes/stores.js'
import aiRouter from './routes/ai.js'
import teamRouter from './routes/team.js'
import connectorsRouter from './routes/connectors.js'
import couponsRouter from './routes/coupons.js'
import settingsRouter from './routes/settings.js'
import webhooksRouter from './routes/webhooks.js'
import webhookAdminRouter from './routes/webhook-admin.js'
import oauthRouter from './routes/oauth/index.js'
import billingRouter from './routes/billing.js'
import voiceRouter from './routes/voice.js'
import { startRetryWorker } from './lib/webhooks/processor.js'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000']

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: allowedOrigins, credentials: true }))

// Auth rate limiting — 20 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT', message: 'محاولات كثيرة، يرجى الانتظار دقائق ثم المحاولة مجدداً' } },
})

// General API rate limiting — 300 req per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT', message: 'طلبات كثيرة جداً، يرجى التباطؤ' } },
})

// Webhooks mounted BEFORE express.json() — need raw body for HMAC verification
app.use('/webhooks', webhooksRouter)

app.use(express.json({ limit: '10mb' }))

// Routes
app.use('/api/auth', authLimiter, authRouter)
app.use('/api', apiLimiter)
app.use('/api/conversations', conversationsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/products', productsRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/customers', customersRouter)
app.use('/api/stores', storesRouter)
app.use('/api/ai', aiRouter)
app.use('/api/team', teamRouter)
app.use('/api/connectors', connectorsRouter)
app.use('/api/coupons', couponsRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/webhooks', webhookAdminRouter)
app.use('/api/oauth', oauthRouter)
app.use('/api/billing', billingRouter)
app.use('/api/voice', voiceRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() })
})

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  import('path').then(({ default: path }) => {
    import('url').then(({ fileURLToPath }) => {
      const __dirname = path.dirname(fileURLToPath(import.meta.url))
      const distPath = path.join(__dirname, '../dist')
      app.use(express.static(distPath))
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'))
      })
    })
  })
} else {
  // 404
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'المسار غير موجود' } })
  })
}

// Global error handler (Express 5 async errors land here)
import type { Request, Response, NextFunction } from 'express'
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server error]', err)
  res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'خطأ في الخادم' } })
})

app.listen(PORT, () => {
  startRetryWorker()
  console.log(`\n🚀 Deema API Server running on http://localhost:${PORT}`)
  console.log(`📊 Database: SQLite (server/dev.db)`)
  const aiMode = process.env.GROQ_API_KEY ? '✅ Groq (Llama 3.3) — مجاناً' : '🔄 Free engine (built-in) — بدون مفتاح'
  console.log(`🤖 AI: ${aiMode}`)
  const webhookBase = process.env.DEEMA_BASE_URL ? `${process.env.DEEMA_BASE_URL}/webhooks` : '⚠️  set DEEMA_BASE_URL to enable real-time webhooks'
  console.log(`🔔 Webhooks: ${webhookBase}`)
  console.log(`\nEndpoints:`)
  console.log(`  POST /api/auth/demo     → instant demo login`)
  console.log(`  POST /api/auth/signup   → create account`)
  console.log(`  POST /api/auth/login    → login`)
  console.log(`  GET  /api/orders        → list orders`)
  console.log(`  POST /api/conversations/:id/messages → chat with AI\n`)
})
