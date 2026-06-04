import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, SearchNormal1, TickCircle, CloseCircle, Truck, Refresh2, DocumentDownload } from 'iconsax-react'
import { orders as ordersApi, type Order, type OrderFilters } from '../lib/api'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import OrderDetailDrawer from '../components/OrderDetailDrawer'

const STATUS_TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'معلق' },
  { key: 'accepted', label: 'مقبول' },
  { key: 'shipped', label: 'مشحون' },
  { key: 'delivered', label: 'مُسلَّم' },
  { key: 'rejected', label: 'مرفوض' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  accepted: '#22c55e',
  shipped: '#3b82f6',
  delivered: '#10b981',
  rejected: '#ef4444',
  cancelled: '#6b7280',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'معلق', accepted: 'مقبول', shipped: 'مشحون',
  delivered: 'مُسلَّم', rejected: 'مرفوض', cancelled: 'ملغي',
}

const PAYMENT_LABELS: Record<string, string> = {
  card: 'بطاقة 💳', cash: 'كاش ⚠️', cod: 'COD ⚠️',
  tabby: 'تابby', tamara: 'تمارا',
}

export default function Orders() {
  const navigate = useNavigate()
  const [orderList, setOrderList] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [openOrderId, setOpenOrderId] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [stats, setStats] = useState({ pending: 0, accepted: 0, shipped: 0, delivered: 0, rejected: 0 })

  const load = useCallback(async (filters: OrderFilters = {}) => {
    setLoading(true)
    try {
      const res = await ordersApi.list({ ...filters, limit: '100' })
      setOrderList(res.orders)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  const loadStats = useCallback(async () => {
    try { const s = await ordersApi.stats(); setStats(s) } catch { /* silent */ }
  }, [])

  useEffect(() => { load(); loadStats() }, [load, loadStats])

  useEffect(() => {
    const filters: OrderFilters = {}
    if (activeTab !== 'all') filters.status = activeTab
    if (search.trim()) filters.search = search.trim()
    load(filters)
    setSelectedIds(new Set())
  }, [activeTab, search, load])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === orderList.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(orderList.map(o => o.id)))
  }

  const bulkAccept = async () => {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    try {
      await ordersApi.bulkAccept(Array.from(selectedIds))
      setSelectedIds(new Set())
      await load({ status: activeTab !== 'all' ? activeTab : undefined })
      await loadStats()
    } finally { setBulkLoading(false) }
  }

  const handleAccept = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await ordersApi.accept(id)
      await load({ status: activeTab !== 'all' ? activeTab : undefined })
      await loadStats()
    } catch { /* silent */ }
  }

  const handleReject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('تأكيد رفض هذا الطلب؟')) return
    try {
      await ordersApi.reject(id)
      await load({ status: activeTab !== 'all' ? activeTab : undefined })
      await loadStats()
    } catch { /* silent */ }
  }

  const handleShip = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await ordersApi.ship(id)
      await load({ status: activeTab !== 'all' ? activeTab : undefined })
      await loadStats()
    } catch { /* silent */ }
  }

  const exportCSV = () => {
    const headers = ['رقم الطلب', 'العميل', 'الهاتف', 'المدينة', 'الإجمالي', 'الحالة', 'الدفع', 'التاريخ']
    const rows = orderList.map(o => [
      o.externalRef || o.id,
      o.customerName,
      o.customerPhone || '',
      o.city,
      (o.total / 100).toFixed(2),
      STATUS_LABELS[o.status] || o.status,
      PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod,
      new Date(o.placedAt).toLocaleDateString('en-US'),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--canvas)', fontFamily: "'Zain','Inter',sans-serif", direction: 'rtl', overflow: 'hidden' }}>
      <AppSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <AppHeader title="الطلبات" subtitle={`${stats.pending} معلق · ${stats.shipped} مشحون`} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {(() => {
              const codPending = orderList.filter(o => (o.paymentMethod === 'cash' || o.paymentMethod === 'cod') && o.status === 'pending').length
              return [
                { label: 'معلق', value: stats.pending, color: '#f59e0b', tab: 'pending' },
                { label: 'مقبول', value: stats.accepted, color: '#22c55e', tab: 'accepted' },
                { label: 'مشحون', value: stats.shipped, color: '#3b82f6', tab: 'shipped' },
                { label: 'مُسلَّم', value: stats.delivered, color: '#10b981', tab: 'delivered' },
                { label: 'مرفوض', value: stats.rejected, color: '#ef4444', tab: 'rejected' },
                { label: 'COD معلق', value: codPending, color: '#f59e0b', tab: 'pending' },
              ]
            })().map(s => (
              <div key={s.label} onClick={() => setActiveTab(s.tab)}
                style={{ flex: '1 1 120px', background: 'var(--canvas-soft)', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', border: `1px solid rgba(255,255,255,0.06)`, transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = s.color + '44')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <SearchNormal1 size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)', pointerEvents: 'none' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث باسم العميل أو رقم الطلب..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 36px 9px 12px', background: 'var(--canvas-soft)', border: '1px solid var(--hairline)', borderRadius: 10, color: 'var(--ink)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
              />
            </div>

            {/* Export */}
            <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'var(--canvas-soft)', border: '1px solid var(--hairline)', borderRadius: 10, color: 'var(--ink-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              <DocumentDownload size={14} />
              تصدير CSV
            </button>

            <button onClick={() => { load(); loadStats() }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'var(--canvas-soft)', border: '1px solid var(--hairline)', borderRadius: 10, color: 'var(--ink-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Refresh2 size={14} />
            </button>
          </div>

          {/* Status tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--canvas-soft)', borderRadius: 10, padding: 4 }}>
            {STATUS_TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                flex: 1, padding: '6px 0', borderRadius: 7, border: 'none',
                background: activeTab === t.key ? 'var(--canvas)' : 'transparent',
                color: activeTab === t.key ? 'var(--ink)' : 'var(--ink-muted)',
                fontSize: 12, fontWeight: activeTab === t.key ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'rgba(106,76,245,0.1)', border: '1px solid rgba(106,76,245,0.25)', borderRadius: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#a78bfa' }}>{selectedIds.size} طلب محدد</span>
              <button onClick={bulkAccept} disabled={bulkLoading} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#22c55e', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {bulkLoading ? 'جارٍ القبول...' : 'قبول المحدد'}
              </button>
              <button onClick={() => setSelectedIds(new Set())} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'var(--ink-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                إلغاء التحديد
              </button>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-muted)' }}>جارٍ التحميل...</div>
          ) : orderList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Box size={40} color="var(--ink-muted)" style={{ opacity: 0.4, marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>لا توجد طلبات</div>
              <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20 }}>
                {search ? 'لا توجد نتائج لهذا البحث' : 'لم تصلك طلبات بعد'}
              </div>
              {!search && (
                <button onClick={() => navigate('/stores')} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ربط متجر
                </button>
              )}
            </div>
          ) : (
            <div style={{ background: 'var(--canvas-soft)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--hairline)' }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 120px 90px 90px 100px 130px', gap: 0, padding: '10px 16px', background: 'var(--canvas)', borderBottom: '1px solid var(--hairline)', fontSize: 11, color: 'var(--ink-muted)', fontWeight: 600 }}>
                <div onClick={selectAll} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, border: `2px solid ${selectedIds.size > 0 && selectedIds.size === orderList.length ? '#6a4cf5' : 'var(--hairline)'}`, background: selectedIds.size === orderList.length ? '#6a4cf5' : 'transparent', transition: 'all 0.1s' }} />
                </div>
                <div>العميل</div>
                <div>المبلغ</div>
                <div>المدينة</div>
                <div>الدفع</div>
                <div>الحالة</div>
                <div>الإجراءات</div>
              </div>

              {/* Rows */}
              {orderList.map((o, i) => {
                const isCOD = o.paymentMethod === 'cash' || o.paymentMethod === 'cod'
                const isHighRisk = o.riskScore >= 60
                return (
                  <div key={o.id} onClick={() => setOpenOrderId(o.id)}
                    style={{
                      display: 'grid', gridTemplateColumns: '36px 1fr 120px 90px 90px 100px 130px',
                      gap: 0, padding: '12px 16px', cursor: 'pointer',
                      borderBottom: i < orderList.length - 1 ? '1px solid var(--hairline)' : 'none',
                      background: selectedIds.has(o.id) ? 'rgba(106,76,245,0.06)' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!selectedIds.has(o.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                    onMouseLeave={e => { if (!selectedIds.has(o.id)) e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Checkbox */}
                    <div onClick={e => { e.stopPropagation(); toggleSelect(o.id) }} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 14, height: 14, borderRadius: 4, border: `2px solid ${selectedIds.has(o.id) ? '#6a4cf5' : 'var(--hairline)'}`, background: selectedIds.has(o.id) ? '#6a4cf5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' }}>
                        {selectedIds.has(o.id) && <span style={{ color: '#fff', fontSize: 9 }}>✓</span>}
                      </div>
                    </div>

                    {/* Customer */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.customerName}</span>
                        {o.isNewCustomer && <span style={{ fontSize: 9, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>جديد</span>}
                        {isHighRisk && <span style={{ fontSize: 9, background: 'rgba(239,68,68,0.12)', color: '#f87171', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>خطر {o.riskScore}</span>}
                        {isCOD && <span style={{ fontSize: 9, background: 'rgba(245,158,11,0.12)', color: '#fbbf24', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>COD</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                        {o.externalRef ? `#${o.externalRef}` : `#${o.id.slice(-6)}`}
                        {o.customerPhone && ` · ${o.customerPhone}`}
                      </div>
                    </div>

                    {/* Amount */}
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center' }}>
                      {(o.total / 100).toLocaleString('en-US')} <span style={{ fontSize: 11, color: 'var(--ink-muted)', marginRight: 3 }}>$</span>
                    </div>

                    {/* City */}
                    <div style={{ fontSize: 13, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center' }}>📍 {o.city}</div>

                    {/* Payment */}
                    <div style={{ fontSize: 12, color: isCOD ? '#fbbf24' : 'var(--ink-muted)', display: 'flex', alignItems: 'center' }}>
                      {PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod}
                    </div>

                    {/* Status badge */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLORS[o.status] || '#6b7280', background: (STATUS_COLORS[o.status] || '#6b7280') + '18', borderRadius: 6, padding: '3px 8px' }}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {o.status === 'pending' && (
                        <>
                          <button onClick={e => handleAccept(o.id, e)} title="قبول" style={{ padding: '5px 8px', borderRadius: 7, border: 'none', background: 'rgba(34,197,94,0.12)', color: '#22c55e', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <TickCircle size={13} /> قبول
                          </button>
                          <button onClick={e => handleReject(o.id, e)} title="رفض" style={{ padding: '5px 8px', borderRadius: 7, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <CloseCircle size={13} /> رفض
                          </button>
                        </>
                      )}
                      {o.status === 'accepted' && (
                        <button onClick={e => handleShip(o.id, e)} title="شحن" style={{ padding: '5px 8px', borderRadius: 7, border: 'none', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Truck size={13} /> شحن
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {openOrderId && (
        <OrderDetailDrawer
          orderId={openOrderId}
          onClose={() => { setOpenOrderId(null); load() }}
        />
      )}
    </div>
  )
}
