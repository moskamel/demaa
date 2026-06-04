import { useState, useEffect } from 'react'
import { CloseCircle, Box, Location, Call, Card, Clock, Truck, Warning2, TickCircle, Refresh2 } from 'iconsax-react'
import { orders as ordersApi, type Order } from '../lib/api'
import { useToast } from './Toast'
import { useConfirm } from '../hooks/useConfirm'

interface Props {
  orderId: string | null
  onClose: () => void
}

const statusColors: Record<string, string> = {
  pending: '#ff7a3d', accepted: '#22c55e', shipped: '#0099ff',
  delivered: '#22c55e', rejected: '#ff5577', cancelled: '#999',
}
const statusLabels: Record<string, string> = {
  pending: 'معلق', accepted: 'مقبول', shipped: 'مشحون',
  delivered: 'مُسلَّم', rejected: 'مرفوض', cancelled: 'ملغي',
}
const paymentLabels: Record<string, string> = { card: 'بطاقة ائتمانية', cash: 'كاش عند الاستلام', tabby: 'تابby', tamara: 'تمارا' }

export default function OrderDetailDrawer({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<'accept' | 'reject' | 'ship' | null>(null)
  const { toast } = useToast()
  const { confirm, Dialog: ConfirmDialog } = useConfirm()

  useEffect(() => {
    if (!orderId) { setOrder(null); return }
    setLoading(true)
    ordersApi.get(orderId).then(data => {
      setOrder(data.order)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [orderId])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!orderId) return null

  if (loading) return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.12)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 380, background: 'var(--canvas-soft)', borderRight: '1px solid var(--hairline)', zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Refresh2 size={22} color="var(--ink-muted)" variant="Outline" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--ink-muted)', fontSize: 13 }}>جاري التحميل</span>
        </div>
      </div>
    </>
  )

  if (!order) return null

  const statusColor = statusColors[order.status] || '#999'

  const handleAccept = async () => {
    const ok = await confirm({
      title: 'قبول الطلب',
      message: `هل تريد قبول طلب #${order.externalRef || order.id} للعميل ${order.customerName}؟`,
      confirmLabel: 'قبول الطلب',
      risk: 'medium',
      consequence: 'سيتم إخطار العميل وانتقال الطلب لمرحلة التجهيز.',
    })
    if (!ok) return
    setActionLoading('accept')
    try {
      await ordersApi.accept(order.id)
      setOrder(prev => prev ? { ...prev, status: 'accepted' } : prev)
      toast('تم قبول الطلب بنجاح', 'success')
    } catch {
      toast('حدث خطأ أثناء قبول الطلب', 'error')
    } finally { setActionLoading(null) }
  }

  const handleReject = async () => {
    const ok = await confirm({
      title: 'رفض الطلب',
      message: `هل تريد رفض طلب #${order.externalRef || order.id} للعميل ${order.customerName}؟`,
      confirmLabel: 'رفض الطلب',
      risk: 'high',
      danger: true,
      consequence: 'لا يمكن التراجع عن هذا الإجراء. سيتم إخطار العميل بالرفض.',
    })
    if (!ok) return
    setActionLoading('reject')
    try {
      await ordersApi.reject(order.id)
      setOrder(prev => prev ? { ...prev, status: 'rejected' } : prev)
      toast('تم رفض الطلب', 'warning')
    } catch {
      toast('حدث خطأ أثناء رفض الطلب', 'error')
    } finally { setActionLoading(null) }
  }

  const handleShip = async () => {
    const ok = await confirm({
      title: 'إنشاء شحنة',
      message: `هل تريد إنشاء شحنة للطلب #${order.externalRef || order.id}؟`,
      confirmLabel: 'إنشاء الشحنة',
      risk: 'medium',
      consequence: 'سيتم إنشاء شحنة عبر SMSA وإخطار العميل برقم التتبع.',
    })
    if (!ok) return
    setActionLoading('ship')
    try {
      const result = await ordersApi.ship(order.id, 'smsa')
      setOrder(prev => prev ? { ...prev, status: 'shipped', shipmentId: result.trackingNumber } : prev)
      toast('تم إنشاء الشحنة بنجاح', 'success')
    } catch {
      toast('حدث خطأ أثناء إنشاء الشحنة', 'error')
    } finally { setActionLoading(null) }
  }

  return (
    <>
      {/* overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.12)', zIndex: 200, backdropFilter: 'blur(2px)' }} />

      {/* drawer */}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 380, background: 'var(--canvas-soft)', borderRight: '1px solid var(--hairline)', zIndex: 201, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>طلب #{order.externalRef || order.id}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, padding: '3px 10px', borderRadius: 20, background: `${statusColor}18`, border: `1px solid ${statusColor}40` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: statusColor }}>{statusLabels[order.status] || order.status}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--canvas-soft-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-muted)' }}>
            <CloseCircle size={14} variant="Outline" />
          </button>
        </div>

        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* risk alert */}
          {order.riskScore >= 60 && (
            <div style={{ background: order.riskScore >= 80 ? 'rgba(255,85,119,0.08)' : 'rgba(255,122,61,0.08)', border: `1px solid ${order.riskScore >= 80 ? 'rgba(255,85,119,0.3)' : 'rgba(255,122,61,0.3)'}`, borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Warning2 size={14} color={order.riskScore >= 80 ? '#ff5577' : '#ff7a3d'} variant="Outline" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: order.riskScore >= 80 ? '#ff5577' : '#ff7a3d', marginBottom: 3 }}>درجة المخاطرة: {order.riskScore}/100</div>
                {order.riskFactors && (() => { try { const f = JSON.parse(order.riskFactors!); return Array.isArray(f) && f.length > 0 ? <div style={{ fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{f.join(' · ')}</div> : null } catch { return <div style={{ fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{order.riskFactors}</div> } })()}
              </div>
            </div>
          )}

          {/* customer */}
          <Section title="معلومات العميل">
            <Row icon={<span style={{ fontSize: 15 }}>👤</span>} label="الاسم" value={order.customerName} />
            <Row icon={<Call size={13} color="var(--ink-muted)" variant="Outline" />} label="الجوال" value={order.customerPhone || '—'} ltr />
            <Row icon={<Location size={13} color="var(--ink-muted)" variant="Outline" />} label="المدينة" value={order.city} />
            {order.address && <Row icon={<Location size={13} color="var(--ink-muted)" variant="Outline" />} label="العنوان" value={order.address} />}
            {order.isNewCustomer && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 0', fontSize: 11, color: '#22c55e' }}>
                <span>🆕</span> عميل جديد — أول طلب له
              </div>
            )}
          </Section>

          {/* order items */}
          <Section title="المنتجات">
            {order.items.map((item, i) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--canvas-soft-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Box size={13} color="var(--ink-muted)" variant="Outline" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>الكمية: {item.qty}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{(item.totalPrice / 100).toLocaleString('en-US')} $</div>
              </div>
            ))}
            {(() => {
              const vatAmount = order.total * 0.15 / 1.15
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--hairline)', marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 500 }}>ضريبة القيمة المضافة (15%)</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>{(vatAmount / 100).toLocaleString('en-US')} $</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>الإجمالي</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{(order.total / 100).toLocaleString('en-US')} $</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>شامل ضريبة القيمة المضافة 15%</div>
                    </div>
                  </div>
                </>
              )
            })()}
          </Section>

          {/* payment & shipping */}
          <Section title="الدفع والشحن">
            <Row icon={<Card size={13} color="var(--ink-muted)" variant="Outline" />} label="طريقة الدفع" value={paymentLabels[order.paymentMethod] || order.paymentMethod} />
            <Row icon={<Clock size={13} color="var(--ink-muted)" variant="Outline" />} label="تاريخ الطلب" value={new Date(order.placedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
            {order.shipmentId && <Row icon={<Truck size={13} color="#0099ff" variant="Outline" />} label="رقم الشحنة" value={order.shipmentId} ltr valueColor="#0099ff" />}
          </Section>

          {/* actions */}
          {order.status === 'pending' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <ActionBtn
                onClick={handleAccept}
                loading={actionLoading === 'accept'}
                disabled={!!actionLoading}
                bg="#22c55e" color="#fff"
                icon={<TickCircle size={14} variant="Outline" />}
                label="قبول"
              />
              <ActionBtn
                onClick={handleReject}
                loading={actionLoading === 'reject'}
                disabled={!!actionLoading}
                bg="rgba(255,85,119,0.08)" color="#ff5577"
                border="1px solid rgba(255,85,119,0.3)"
                icon={<CloseCircle size={14} variant="Outline" />}
                label="رفض"
              />
            </div>
          )}
          {order.status === 'accepted' && (
            <ActionBtn
              onClick={handleShip}
              loading={actionLoading === 'ship'}
              disabled={!!actionLoading}
              bg="#0099ff" color="#fff"
              icon={<Truck size={14} variant="Outline" />}
              label="إنشاء شحنة"
              fullWidth
            />
          )}
        </div>
      </div>

      {ConfirmDialog}
    </>
  )
}

function ActionBtn({ onClick, loading, disabled, bg, color, border, icon, label, fullWidth }: {
  onClick: () => void; loading: boolean; disabled: boolean
  bg: string; color: string; border?: string
  icon: React.ReactNode; label: string; fullWidth?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex: fullWidth ? undefined : 1, width: fullWidth ? '100%' : undefined,
      padding: '10px', borderRadius: 10, border: border || 'none',
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
      fontSize: 13, fontWeight: 600, background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      opacity: disabled ? 0.7 : 1, transition: 'opacity 0.15s',
    }}>
      {loading ? <Refresh2 size={14} variant="Outline" style={{ animation: 'spin 1s linear infinite' }} /> : icon}
      {label}
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--canvas)', borderRadius: 12, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--hairline)', fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ padding: '8px 14px' }}>{children}</div>
    </div>
  )
}

function Row({ icon, label, value, ltr, valueColor }: { icon: React.ReactNode; label: string; value: string; ltr?: boolean; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
      <div style={{ flexShrink: 0, width: 18, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <span style={{ fontSize: 12, color: 'var(--ink-muted)', minWidth: 80 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: valueColor || 'var(--ink)', direction: ltr ? 'ltr' : 'rtl' }}>{value}</span>
    </div>
  )
}
