import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY || ''
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID || ''
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET || ''
const BASE_URL = process.env.DEEMA_BASE_URL || 'http://localhost:5173'

// POST /api/payment/initiate
// Creates a Paymob hosted-checkout session and returns the payment URL
router.post('/initiate', requireAuth, async (req, res) => {
  if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID) {
    return res.status(503).json({
      error: { code: 'PAYMENT_NOT_CONFIGURED', message: 'بوابة الدفع غير مفعّلة. يرجى التواصل مع الدعم.' }
    })
  }

  const user = (req as any).user
  const { plan = 'pro' } = req.body

  // Amount in piasters (EGP × 100)
  const amountCents = plan === 'pro' ? 4950 : 0

  try {
    // Step 1: Authenticate — get auth token
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
    })
    if (!authRes.ok) throw new Error('Paymob auth failed')
    const { token: authToken } = await authRes.json() as { token: string }

    // Step 2: Create order
    const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: 'EGP',
        items: [{ name: `Deema ${plan === 'pro' ? 'Pro' : 'Free'} Plan`, amount_cents: amountCents, description: 'Monthly subscription', quantity: 1 }],
      }),
    })
    if (!orderRes.ok) throw new Error('Paymob order creation failed')
    const { id: orderId } = await orderRes.json() as { id: number }

    // Step 3: Create payment key
    const keyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          first_name: user.name?.split(' ')[0] || 'Customer',
          last_name: user.name?.split(' ').slice(1).join(' ') || 'User',
          email: user.email || 'customer@deema.app',
          phone_number: '+201000000000',
          apartment: 'NA', floor: 'NA', street: 'NA', building: 'NA',
          shipping_method: 'NA', postal_code: 'NA', city: 'Cairo',
          country: 'EG', state: 'Cairo',
        },
        currency: 'EGP',
        integration_id: Number(PAYMOB_INTEGRATION_ID),
        redirect_url: `${BASE_URL}/subscribe/callback`,
      }),
    })
    if (!keyRes.ok) throw new Error('Paymob payment key creation failed')
    const { token: paymentKey } = await keyRes.json() as { token: string }

    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_INTEGRATION_ID}?payment_token=${paymentKey}`

    res.json({ paymentUrl: iframeUrl, orderId, paymentKey })
  } catch (err) {
    console.error('[paymob]', err)
    res.status(502).json({ error: { code: 'PAYMENT_GATEWAY_ERROR', message: 'فشل الاتصال ببوابة الدفع. حاول مجدداً.' } })
  }
})

// POST /api/payment/callback — Paymob server-to-server transaction callback
router.post('/callback', async (req, res) => {
  // Paymob sends HMAC-verified callbacks; in production verify HMAC_SECRET
  const { obj } = req.body
  if (obj?.success === true) {
    // TODO: update user subscription status in DB
    console.log('[paymob] successful payment', obj.id, obj.order?.id)
  }
  res.sendStatus(200)
})

export default router
