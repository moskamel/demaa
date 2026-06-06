import { useState, useEffect, useRef } from 'react'
import { Add, SearchNormal1, Edit2, Trash, Image, Gallery, TickCircle, Warning2, CloseCircle } from 'iconsax-react'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { products as productsApi, type Product } from '../lib/api'

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

function ProductImage({
  product,
  onImageChange,
}: {
  product: Product
  onImageChange: (id: string, url: string | null) => void
}) {
  const [uploading, setUploading] = useState<UploadState>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading('uploading')
    try {
      const { imageUrl } = await productsApi.uploadImage(product.id, file)
      onImageChange(product.id, imageUrl)
      setUploading('done')
      setTimeout(() => setUploading('idle'), 2000)
    } catch {
      setUploading('error')
      setTimeout(() => setUploading('idle'), 3000)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await productsApi.deleteImage(product.id)
      onImageChange(product.id, null)
    } catch {}
  }

  return (
    <div
      style={{ position: 'relative', width: 72, height: 72, borderRadius: 12, flexShrink: 0, cursor: 'pointer' }}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      title="اضغط أو اسحب صورة لرفعها"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />

      {product.imageUrl ? (
        <>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, display: 'block' }}
          />
          {/* Remove button */}
          <button
            onClick={handleRemove}
            style={{
              position: 'absolute', top: -6, right: -6,
              width: 20, height: 20, borderRadius: '50%',
              background: '#ff5577', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, opacity: 0, transition: 'opacity 0.15s',
            }}
            className="img-remove-btn"
          >
            <CloseCircle size={14} color="#fff" variant="Bold" />
          </button>
        </>
      ) : (
        <div style={{
          width: '100%', height: '100%', borderRadius: 12,
          background: 'var(--canvas-soft-2)', border: '1.5px dashed var(--hairline)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <Gallery size={20} color="var(--ink-disabled)" variant="Outline" />
          <span style={{ fontSize: 9, color: 'var(--ink-disabled)', textAlign: 'center', lineHeight: 1.2 }}>اضغط لرفع صورة</span>
        </div>
      )}

      {/* Upload overlay */}
      {uploading !== 'idle' && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 12,
          background: uploading === 'error' ? 'rgba(255,85,119,0.85)' : uploading === 'done' ? 'rgba(34,197,94,0.85)' : 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {uploading === 'uploading' && (
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
          )}
          {uploading === 'done' && <TickCircle size={22} color="#fff" variant="Bold" />}
          {uploading === 'error' && <Warning2 size={22} color="#fff" variant="Bold" />}
        </div>
      )}

      <style>{`.img-remove-btn { opacity: 0 } *:hover > .img-remove-btn { opacity: 1 }`}</style>
    </div>
  )
}

interface ProductFormData {
  name: string
  price: string
  stock: string
  category: string
  description: string
  sku: string
  costPrice: string
  lowStockAlert: string
}

const EMPTY_FORM: ProductFormData = { name: '', price: '', stock: '0', category: '', description: '', sku: '', costPrice: '', lowStockAlert: '5' }

const CATEGORIES = ['عطور', 'إلكترونيات', 'أزياء', 'عناية', 'منزل', 'رياضة', 'غذاء', 'أخرى']

export default function Products() {
  const [productList, setProductList] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStock, setFilterStock] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const load = () => {
    productsApi.list({ search: search || undefined, category: filterCat || undefined, lowStock: filterStock || undefined })
      .then(r => setProductList(r.products))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, filterCat, filterStock])

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setSaveError('')
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      price: String(p.price / 100),
      stock: String(p.stock),
      category: p.category || '',
      description: p.description || '',
      sku: p.sku || '',
      costPrice: p.costPrice ? String(p.costPrice / 100) : '',
      lowStockAlert: String(p.lowStockAlert),
    })
    setSaveError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { setSaveError('الاسم والسعر مطلوبان'); return }
    setSaving(true)
    setSaveError('')
    try {
      const data = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        category: form.category || undefined,
        description: form.description || undefined,
        sku: form.sku || undefined,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
        lowStockAlert: parseInt(form.lowStockAlert) || 5,
      }
      if (editingId) {
        await productsApi.update(editingId, data)
      } else {
        await productsApi.create(data)
      }
      setShowForm(false)
      load()
    } catch (err: any) {
      setSaveError(err.message || 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await productsApi.update(id, { isActive: false } as any)
      setProductList(p => p.filter(x => x.id !== id))
    } catch {}
    setDeleteConfirm(null)
  }

  const handleImageChange = (id: string, url: string | null) => {
    setProductList(prev => prev.map(p => p.id === id ? { ...p, imageUrl: url ?? undefined } : p))
  }

  const fmt = (n: number) => (n / 100).toLocaleString('ar-EG', { minimumFractionDigits: 0 })

  const categories = [...new Set(productList.map(p => p.category).filter(Boolean))]

  const stockBadge = (p: Product) => {
    if (p.stock === 0) return { label: 'نافد', bg: 'rgba(255,85,119,0.12)', color: '#ff5577' }
    if (p.stock <= p.lowStockAlert) return { label: `${p.stock} متبقي`, bg: 'rgba(255,122,61,0.12)', color: '#ff7a3d' }
    return { label: `${p.stock} قطعة`, bg: 'rgba(34,197,94,0.1)', color: '#22c55e' }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--canvas)', direction: 'rtl' }}>
      <AppSidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppHeader title="المنتجات">
          <button
            onClick={openAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--brand)', color: '#fff',
              border: 'none', borderRadius: 10, padding: '7px 14px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Add size={16} variant="Outline" />
            منتج جديد
          </button>
        </AppHeader>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
              <SearchNormal1 size={14} color="var(--ink-muted)" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن منتج..."
                style={{
                  width: '100%', padding: '8px 36px 8px 12px', borderRadius: 10,
                  border: '1px solid var(--hairline)', background: 'var(--canvas-soft)',
                  color: 'var(--ink)', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  fontFamily: "'Zain','Inter',sans-serif",
                }}
              />
            </div>

            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 10, border: '1px solid var(--hairline)',
                background: 'var(--canvas-soft)', color: 'var(--ink)', fontSize: 13,
                cursor: 'pointer', fontFamily: "'Zain','Inter',sans-serif",
              }}
            >
              <option value="">كل التصنيفات</option>
              {categories.map(c => <option key={c} value={c!}>{c}</option>)}
            </select>

            <button
              onClick={() => setFilterStock(v => !v)}
              style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
                border: '1px solid', fontFamily: "'Zain','Inter',sans-serif",
                background: filterStock ? 'rgba(255,122,61,0.1)' : 'var(--canvas-soft)',
                borderColor: filterStock ? '#ff7a3d' : 'var(--hairline)',
                color: filterStock ? '#ff7a3d' : 'var(--ink-muted)',
              }}
            >
              ⚠️ منخفض المخزون
            </button>

            <span style={{ fontSize: 12, color: 'var(--ink-muted)', marginRight: 'auto' }}>
              {productList.length} منتج
            </span>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-muted)', fontSize: 14 }}>جاري التحميل...</div>
          ) : productList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Image size={48} color="var(--ink-disabled)" variant="Outline" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>لا يوجد منتجات</div>
              <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20 }}>أضف منتجك الأول الآن</div>
              <button onClick={openAdd} style={{ background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                + أضف منتج
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
              {productList.map(p => {
                const badge = stockBadge(p)
                return (
                  <div key={p.id} style={{
                    background: 'var(--canvas-soft)', borderRadius: 16, padding: 16,
                    border: '1px solid var(--hairline)',
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    transition: 'box-shadow 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                  >
                    <ProductImage product={p} onImageChange={handleImageChange} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{p.name}</div>
                          {p.category && (
                            <span style={{ fontSize: 10, background: 'var(--canvas-soft-2)', color: 'var(--ink-muted)', borderRadius: 6, padding: '2px 8px' }}>
                              {p.category}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <button
                            onClick={() => openEdit(p)}
                            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--canvas-soft-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Edit2 size={13} color="var(--ink-muted)" variant="Outline" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(p.id)}
                            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--canvas-soft-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash size={13} color="#ff5577" variant="Outline" />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--brand)' }}>
                          {fmt(p.price)} ريال
                        </span>
                        {p.costPrice && (
                          <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                            تكلفة: {fmt(p.costPrice)} ريال
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                          background: badge.bg, color: badge.color,
                        }}>
                          {badge.label}
                        </span>
                        {p.sku && (
                          <span style={{ fontSize: 10, color: 'var(--ink-disabled)' }}>SKU: {p.sku}</span>
                        )}
                      </div>

                      {p.description && (
                        <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.description}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
        >
          <div style={{
            background: 'var(--canvas)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480,
            maxHeight: '90vh', overflow: 'auto', direction: 'rtl',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>
              {editingId ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="اسم المنتج *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="مثال: عطر الأوقات الذهبية" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="سعر البيع (ريال) *" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} placeholder="0.00" type="number" />
                <Field label="سعر التكلفة (ريال)" value={form.costPrice} onChange={v => setForm(f => ({ ...f, costPrice: v }))} placeholder="اختياري" type="number" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="الكمية" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} placeholder="0" type="number" />
                <Field label="تنبيه عند" value={form.lowStockAlert} onChange={v => setForm(f => ({ ...f, lowStockAlert: v }))} placeholder="5" type="number" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 6 }}>التصنيف</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 10,
                    border: '1px solid var(--hairline)', background: 'var(--canvas-soft)',
                    color: 'var(--ink)', fontSize: 13, fontFamily: "'Zain','Inter',sans-serif",
                  }}
                >
                  <option value="">بدون تصنيف</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <Field label="SKU / رمز المنتج" value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} placeholder="اختياري" />
              <Field label="الوصف" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="وصف مختصر للمنتج (اختياري)" multiline />

              {saveError && (
                <div style={{ fontSize: 12, color: '#ff5577', background: 'rgba(255,85,119,0.08)', padding: '8px 12px', borderRadius: 8 }}>
                  {saveError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
                    background: 'var(--brand)', color: '#fff', fontSize: 14, fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                    fontFamily: "'Zain','Inter',sans-serif",
                  }}
                >
                  {saving ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '11px 20px', borderRadius: 12, border: '1px solid var(--hairline)',
                    background: 'var(--canvas-soft)', color: 'var(--ink-muted)', fontSize: 14,
                    cursor: 'pointer', fontFamily: "'Zain','Inter',sans-serif",
                  }}
                >
                  إلغاء
                </button>
              </div>

              {editingId && (
                <p style={{ fontSize: 11, color: 'var(--ink-muted)', textAlign: 'center', margin: 0 }}>
                  💡 لتغيير الصورة، اضغط على صورة المنتج في القائمة مباشرة
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--canvas)', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%', textAlign: 'center', direction: 'rtl' }}>
            <Warning2 size={40} color="#ff7a3d" variant="Bold" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>حذف المنتج؟</div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20 }}>لن يظهر المنتج بعد الحذف</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: '#ff5577', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Zain','Inter',sans-serif" }}
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid var(--hairline)', background: 'var(--canvas-soft)', color: 'var(--ink-muted)', fontSize: 13, cursor: 'pointer', fontFamily: "'Zain','Inter',sans-serif" }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text', multiline = false,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; multiline?: boolean
}) {
  const base: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    border: '1px solid var(--hairline)', background: 'var(--canvas-soft)',
    color: 'var(--ink)', fontSize: 13, outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Zain','Inter',sans-serif", resize: 'vertical' as const,
  }
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 6 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...base, minHeight: 72 }} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} style={base} />
      }
    </div>
  )
}
