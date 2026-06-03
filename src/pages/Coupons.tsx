import { useState, useEffect } from 'react'
import { Add, Trash, TickCircle, CloseCircle, PercentageSquare, Tag } from 'iconsax-react'
import { couponsApi, type CouponData } from '../lib/api'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../components/Toast'

const INPUT: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid var(--hairline)', background: 'var(--canvas-soft-2)',
  color: 'var(--ink)', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
}

function formatVal(c: CouponData) {
  return c.type === 'percentage' ? `${c.value / 100}%` : `${(c.value / 100).toLocaleString('ar-EG')} ج.م`
}

export default function Coupons() {
  const [coupons, setCoupons] = useState<CouponData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', maxUsage: '', expiresAt: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const { confirm, Dialog } = useConfirm()
  const toast = useToast()

  useEffect(() => {
    couponsApi.list().then(d => { setCoupons(d.coupons); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.code.trim()) { setFormError('كود الكوبون مطلوب'); return }
    if (!form.value || isNaN(+form.value) || +form.value <= 0) { setFormError('القيمة يجب أن تكون رقم موجب'); return }
    if (form.type === 'percentage' && +form.value > 100) { setFormError('النسبة لا يمكن أن تتجاوز 100%'); return }

    setSaving(true)
    try {
      const valueInSmallest = form.type === 'percentage' ? Math.round(+form.value * 100) : Math.round(+form.value * 100)
      const res = await couponsApi.create({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: valueInSmallest,
        maxUsage: form.maxUsage ? parseInt(form.maxUsage) : undefined,
      })
      setCoupons(prev => [res.coupon, ...prev])
      setShowForm(false)
      setForm({ code: '', type: 'percentage', value: '', maxUsage: '', expiresAt: '' })
      toast.success('تم إنشاء الكوبون بنجاح')
    } catch (err) {
      setFormError((err as Error).message || 'حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (c: CouponData) => {
    try {
      await couponsApi.update(c.id, { isActive: !c.isActive })
      setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x))
    } catch {
      toast.error('فشل تحديث الكوبون')
    }
  }

  const handleDelete = async (c: CouponData) => {
    const ok = await confirm({ title: 'حذف الكوبون', message: `هل أنت متأكد من حذف كوبون "${c.code}"؟ هذا الإجراء لا يمكن التراجع عنه.`, confirmLabel: 'حذف', danger: true })
    if (!ok) return
    try {
      await couponsApi.delete(c.id)
      setCoupons(prev => prev.filter(x => x.id !== c.id))
      toast.success('تم حذف الكوبون')
    } catch {
      toast.error('فشل حذف الكوبون')
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--canvas)' }}>
        <AppHeader>
          <button onClick={() => setShowForm(true)} className="btn-primary-sm" style={{ gap: 6 }}>
            <Add size={14} variant="Outline" /> كوبون جديد
          </button>
        </AppHeader>

        <div style={{ padding: '50px', width: '100%' }}>

          {/* Create form */}
          {showForm && (
            <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', padding: '24px', marginBottom: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>إنشاء كوبون جديد</div>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>كود الكوبون</label>
                    <input value={form.code} onChange={e => setForm(s => ({ ...s, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" style={INPUT} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>نوع الخصم</label>
                    <select value={form.type} onChange={e => setForm(s => ({ ...s, type: e.target.value }))} style={{ ...INPUT, height: 38 }}>
                      <option value="percentage">نسبة مئوية %</option>
                      <option value="fixed">مبلغ ثابت</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>
                      {form.type === 'percentage' ? 'نسبة الخصم (%)' : 'مبلغ الخصم (ج.م)'}
                    </label>
                    <input type="number" min="1" max={form.type === 'percentage' ? 100 : undefined} value={form.value} onChange={e => setForm(s => ({ ...s, value: e.target.value }))} placeholder={form.type === 'percentage' ? '20' : '50'} style={INPUT} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>الحد الأقصى للاستخدام (اختياري)</label>
                    <input type="number" min="1" value={form.maxUsage} onChange={e => setForm(s => ({ ...s, maxUsage: e.target.value }))} placeholder="100" style={INPUT} />
                  </div>
                </div>
                {formError && <div style={{ fontSize: 13, color: '#ff5577', background: 'rgba(255,85,119,0.1)', borderRadius: 8, padding: '8px 12px' }}>{formError}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" disabled={saving} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: 'var(--ink)', color: 'var(--canvas)', cursor: saving ? 'default' : 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'جاري الإنشاء...' : 'إنشاء الكوبون'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setFormError('') }} style={{ padding: '10px 18px', borderRadius: 9, border: '1px solid var(--hairline)', background: 'transparent', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'إجمالي الكوبونات', value: coupons.length, icon: Tag, color: '#6a4cf5' },
              { label: 'الكوبونات النشطة', value: coupons.filter(c => c.isActive).length, icon: TickCircle, color: '#22c55e' },
              { label: 'إجمالي الاستخدامات', value: coupons.reduce((s, c) => s + c.usageCount, 0), icon: PercentageSquare, color: '#0099ff' },
            ].map(({ label, value, icon: Icon, color }, i) => (
              <div key={label} className="animate-fade-in-up hover-lift" style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '16px 18px', animationDelay: `${i * 60}ms` }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Icon size={14} color={color} variant="Outline" />
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{loading ? '...' : value}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--canvas-soft)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--hairline)' }}>
              {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 0, borderBottom: '1px solid var(--hairline)' }} />)}
            </div>
          ) : coupons.length === 0 ? (
            <div className="animate-fade-in-scale" style={{ textAlign: 'center', padding: '80px 0' }}>
              <PercentageSquare size={40} variant="Outline" color="var(--ink-muted)" style={{ marginBottom: 16, opacity: 0.4 }} />
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-muted)', marginBottom: 8 }}>لا توجد كوبونات</div>
              <div style={{ fontSize: 13, color: 'var(--ink-disabled)' }}>أنشئ أول كوبون خصم لعملائك</div>
            </div>
          ) : (
            <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
              {coupons.map((c, i) => (
                <div key={c.id} className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < coupons.length - 1 ? '1px solid var(--hairline)' : 'none', transition: 'background 0.15s', animationDelay: `${i * 40}ms` }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas-soft-2)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(106,76,245,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Tag size={16} color="#6a4cf5" variant="Outline" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.05em', fontFamily: 'monospace' }}>{c.code}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: c.isActive ? '#22c55e' : 'var(--ink-disabled)', background: c.isActive ? 'rgba(34,197,94,0.12)' : 'var(--canvas-soft-2)', borderRadius: 5, padding: '2px 7px' }}>
                        {c.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                      خصم {formatVal(c)}
                      {c.maxUsage ? ` · ${c.usageCount}/${c.maxUsage} استخدام` : ` · ${c.usageCount} استخدام`}
                      {c.expiresAt ? ` · ينتهي ${new Date(c.expiresAt).toLocaleDateString('ar-EG')}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => toggleActive(c)} title={c.isActive ? 'تعطيل' : 'تفعيل'} style={{ background: 'none', border: '1px solid var(--hairline)', borderRadius: 8, cursor: 'pointer', color: 'var(--ink-muted)', padding: '6px 10px', fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {c.isActive ? <CloseCircle size={13} variant="Outline" /> : <TickCircle size={13} variant="Outline" />}
                      {c.isActive ? 'تعطيل' : 'تفعيل'}
                    </button>
                    <button onClick={() => handleDelete(c)} title="حذف" style={{ background: 'none', border: '1px solid rgba(255,85,119,0.2)', borderRadius: 8, cursor: 'pointer', color: '#ff5577', padding: '6px 8px', display: 'flex', alignItems: 'center' }}>
                      <Trash size={13} variant="Outline" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {Dialog}
    </div>
  )
}
