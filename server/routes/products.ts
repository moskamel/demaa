import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /products
router.get('/', async (req: AuthRequest, res) => {
  const { category, lowStock, search, limit = '50' } = req.query as Record<string, string>
  const store = await prisma.store.findFirst({ where: { organizationId: req.orgId, isActive: true } })
  if (!store) { res.json({ products: [] }); return }

  const where: Record<string, unknown> = { storeId: store.id, isActive: true }
  if (category) where.category = category
  if (search) where.name = { contains: search }

  const products = await prisma.product.findMany({
    where,
    orderBy: { name: 'asc' },
    take: parseInt(limit),
  })

  const filtered = lowStock === 'true'
    ? products.filter(p => p.stock < p.lowStockAlert)
    : products

  res.json({ products: filtered })
})

// GET /products/low-stock
router.get('/low-stock', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({ where: { organizationId: req.orgId, isActive: true } })
  if (!store) { res.json({ products: [] }); return }

  const all = await prisma.product.findMany({ where: { storeId: store.id, isActive: true } })
  const lowStock = all.filter(p => p.stock < p.lowStockAlert)
  res.json({ products: lowStock })
})

// GET /products/:id
router.get('/:id', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({ where: { organizationId: req.orgId } })
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, storeId: store?.id },
  })
  if (!product) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  res.json({ product })
})

// PATCH /products/:id
router.patch('/:id', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({ where: { organizationId: req.orgId } })
  const { name, price, stock, category, lowStockAlert } = req.body
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (price !== undefined) data.price = Math.round(Number(price) * 100)
  if (stock !== undefined) data.stock = Number(stock)
  if (category !== undefined) data.category = category
  if (lowStockAlert !== undefined) data.lowStockAlert = Number(lowStockAlert)

  const product = await prisma.product.updateMany({
    where: { id: req.params.id, storeId: store?.id },
    data,
  })
  res.json({ updated: product.count })
})

export default router
