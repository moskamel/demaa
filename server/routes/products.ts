import { Router } from 'express'
import multer from 'multer'
import prisma from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { uploadImageBuffer, deleteImage } from '../lib/cloudinary.js'

const router = Router()
router.use(requireAuth)

// Arabic category → English search terms for better image results
const CATEGORY_KEYWORDS: Record<string, string> = {
  'عطور': 'perfume bottle luxury',
  'إلكترونيات': 'electronics gadget',
  'أزياء': 'fashion clothing apparel',
  'عناية': 'skincare beauty cosmetics',
  'منزل': 'home decor interior',
  'رياضة': 'sports fitness equipment',
  'غذاء': 'food product',
}

// GET /products/suggest-images?q=product+name&category=cat
router.get('/suggest-images', async (req: AuthRequest, res) => {
  const q = String(req.query.q || '').trim()
  const category = String(req.query.category || '').trim()

  if (!q) { res.json({ images: [] }); return }

  const pexelsKey = process.env.PEXELS_API_KEY
  if (!pexelsKey) {
    // Fallback: return placeholder images based on category
    res.json({ images: [], note: 'PEXELS_API_KEY not configured' }); return
  }

  try {
    // Build search query: combine Arabic name transliteration hint + category hint
    const catKeywords = CATEGORY_KEYWORDS[category] || ''
    const query = encodeURIComponent(`${q} ${catKeywords}`.trim().slice(0, 100))

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=8&orientation=square`,
      { headers: { Authorization: pexelsKey } }
    )

    if (!response.ok) {
      res.json({ images: [] }); return
    }

    const data = await response.json() as { photos: Array<{ src: { medium: string; small: string }; alt: string }> }
    const images = data.photos.map(p => ({
      url: p.src.medium,
      thumb: p.src.small,
      alt: p.alt,
    }))

    res.json({ images })
  } catch {
    res.json({ images: [] })
  }
})

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('يجب أن يكون الملف صورة'))
  },
})

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
  if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, storeId: store.id },
  })
  if (!product) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  res.json({ product })
})

// PATCH /products/:id
router.patch('/:id', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({ where: { organizationId: req.orgId } })
  if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
  const { name, price, stock, category, lowStockAlert, description, sku, imageUrl, costPrice } = req.body
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (price !== undefined) data.price = Math.round(Number(price) * 100)
  if (stock !== undefined) data.stock = Number(stock)
  if (category !== undefined) data.category = category
  if (lowStockAlert !== undefined) data.lowStockAlert = Number(lowStockAlert)
  if (description !== undefined) data.description = description
  if (sku !== undefined) data.sku = sku
  if (imageUrl !== undefined) data.imageUrl = imageUrl
  if (costPrice !== undefined) data.costPrice = Math.round(Number(costPrice) * 100)

  const product = await prisma.product.updateMany({
    where: { id: req.params.id, storeId: store.id },
    data,
  })
  res.json({ updated: product.count })
})

// POST /products/:id/image — upload or replace product image
router.post('/:id/image', upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const store = await prisma.store.findFirst({ where: { organizationId: req.orgId } })
    if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }

    const product = await prisma.product.findFirst({
      where: { id: req.params.id, storeId: store.id },
    })
    if (!product) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }
    if (!req.file) { res.status(400).json({ error: { code: 'NO_FILE', message: 'لم يتم رفع أي صورة' } }); return }

    // Delete old image from Cloudinary if it exists
    if (product.imageUrl) {
      const match = product.imageUrl.match(/deema\/products\/(.+?)(?:\.[^.]+)?$/)
      if (match) await deleteImage(`deema/products/${match[1]}`).catch(() => {})
    }

    const { url } = await uploadImageBuffer(
      req.file.buffer,
      'deema/products',
      `product_${product.id}`
    )

    await prisma.product.update({
      where: { id: product.id },
      data: { imageUrl: url },
    })

    res.json({ imageUrl: url })
  } catch (err: any) {
    console.error('Image upload error:', err)
    res.status(500).json({ error: { code: 'UPLOAD_FAILED', message: err.message || 'فشل رفع الصورة' } })
  }
})

// DELETE /products/:id/image — remove product image
router.delete('/:id/image', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({ where: { organizationId: req.orgId } })
  if (!store) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }

  const product = await prisma.product.findFirst({ where: { id: req.params.id, storeId: store.id } })
  if (!product) { res.status(404).json({ error: { code: 'NOT_FOUND' } }); return }

  if (product.imageUrl) {
    const match = product.imageUrl.match(/deema\/products\/(.+?)(?:\.[^.]+)?$/)
    if (match) await deleteImage(`deema/products/${match[1]}`).catch(() => {})
    await prisma.product.update({ where: { id: product.id }, data: { imageUrl: null } })
  }

  res.json({ deleted: true })
})

// POST /products — create new product
router.post('/', async (req: AuthRequest, res) => {
  const store = await prisma.store.findFirst({ where: { organizationId: req.orgId, isActive: true } })
  if (!store) { res.status(400).json({ error: { code: 'NO_STORE' } }); return }

  const { name, price, stock = 0, category, description, sku, costPrice, lowStockAlert = 5 } = req.body
  if (!name || price === undefined) {
    res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'الاسم والسعر مطلوبان' } }); return
  }

  const product = await prisma.product.create({
    data: {
      storeId: store.id,
      name,
      price: Math.round(Number(price) * 100),
      stock: Number(stock),
      category,
      description,
      sku,
      ...(costPrice && { costPrice: Math.round(Number(costPrice) * 100) }),
      lowStockAlert: Number(lowStockAlert),
      isActive: true,
    },
  })

  res.json({ product })
})

export default router
