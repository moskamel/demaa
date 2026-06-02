import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRouter from './routes/auth.js'
import conversationsRouter from './routes/conversations.js'
import ordersRouter from './routes/orders.js'
import productsRouter from './routes/products.js'
import analyticsRouter from './routes/analytics.js'
import notificationsRouter from './routes/notifications.js'
import customersRouter from './routes/customers.js'
import storesRouter from './routes/stores.js'
import aiRouter from './routes/ai.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }))
app.use(express.json({ limit: '10mb' }))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/conversations', conversationsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/products', productsRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/customers', customersRouter)
app.use('/api/stores', storesRouter)
app.use('/api/ai', aiRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() })
})

// 404
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'المسار غير موجود' } })
})

app.listen(PORT, () => {
  console.log(`\n🚀 Deema API Server running on http://localhost:${PORT}`)
  console.log(`📊 Database: SQLite (server/dev.db)`)
  const aiMode = process.env.GROQ_API_KEY ? '✅ Groq (Llama 3.3) — مجاناً' : '🔄 Free engine (built-in) — بدون مفتاح'
  console.log(`🤖 AI: ${aiMode}`)
  console.log(`\nEndpoints:`)
  console.log(`  POST /api/auth/demo     → instant demo login`)
  console.log(`  POST /api/auth/signup   → create account`)
  console.log(`  POST /api/auth/login    → login`)
  console.log(`  GET  /api/orders        → list orders`)
  console.log(`  POST /api/conversations/:id/messages → chat with AI\n`)
})
