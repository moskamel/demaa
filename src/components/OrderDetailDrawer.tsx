import { useState, useEffect } from 'react'
import { X, Package, MapPin, Phone, CreditCard, Clock, Truck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { orders as ordersApi, type Order } from '../lib/api'

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

  useEffect(() => {
    if (!orderId) { setOrder(null); return }
    setLoading(true)
    ordersApi.get(orderId).then(data => {
      setOrder(data.order)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [orderId])

  if (!orderId) return null

  if (loading) return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 380, background: 'var(--surface-1)', borderRight: '1px solid var(--hairline)', zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--ink-muted)', fontSize: 14 }}>جاري التحميل...</span>
      </div>
    </>
  )

  if (!order) return null

  const statusColor = statusColors[order.status] || '#999'

  const handleAccept = async () => {
    await ordersApi.accept(order.id)
    setOrder(prev => prev ? { ...prev, status: 'accepted' } : prev)
  }

  const handleReject = async () => {
    await ordersApi.reject(order.id)
    setOrder(prev => prev ? { ...prev, status: 'rejected' } : prev)
  }

  return (
    <>
      {/* overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(2px)' }} />

      {/* drawer */}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 380, background: 'var(--surface-1)', borderRight: '1px solid var(--hairline)', zIndex: 201, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>طلب #{order.externalRef || order.id}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, padding: '3px 10px', borderRadius: 20, background: `${statusColor}18`, border: `1px solid ${statusColor}40` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: statusColor }}>{statusLabels[order.status] || order.status}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-muted)' }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* risk alert */}
          {order.riskScore >= 60 && (
            <div style={{ background: order.riskScore >= 80 ? 'rgba(255,85,119,0.08)' : 'rgba(255,122,61,0.08)', border: `1px solid ${order.riskScore >= 80 ? 'rgba(255,85,119,0.3)' : 'rgba(255,122,61,0.3)'}`, borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertTriangle size={14} color={order.riskScore >= 80 ? '#ff5577' : '#ff7a3d'} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: order.riskScore >= 80 ? '#ff5577' : '#ff7a3d', marginBottom: 3 }}>درجة المخاطرة: {order.riskScore}/100</div>
                {order.riskFactors && <div style={{ fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{order.riskFactors}</div>}
              </div>
            </div>
          )}

          {/* customer */}
          <Section title="معلومات العميل">
            <Row icon={<span style={{ fontSize: 15 }}>👤</span>} label="الاسم" value={order.customerName} />
            <Row icon={<Phone size={13} color="var(--ink-muted)" />} label="الجوال" value={order.customerPhone || '—'} ltr />
            <Row icon={<MapPin size={13} color="var(--ink-muted)" />} label="المدينة" value={order.city} />
            {order.address && <Row icon={<MapPin size={13} color="var(--ink-muted)" />} label="العنوان" value={order.address} />}
            {order.isNewCustomer && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 0', fontSize: 11, color: '#22c55e' }}>
                <span>🆕</span> عميل جديد — أول طلب له
              </div>
            )}
          </Section>

          {/* order items */}
          <Section title="المنتجات">
            {order.items.map((item, i) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--hairline-soft)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={13} color="var(--ink-muted)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>الكمية: {item.qty}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{(item.unitPrice * item.qty).toLocaleString('ar-SA')} ر.س</div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--hairline)', marginTop: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>الإجمالي</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{order.total.toLocaleString('ar-SA')} ر.س</span>
            </div>
          </Section>

          {/* payment & shipping */}
          <Section title="الدفع والشحن">
            <Row icon={<CreditCard size={13} color="var(--ink-muted)" />} label="طريقة الدفع" value={paymentLabels[order.paymentMethod] || order.paymentMethod} />
            <Row icon={<Clock size={13} color="var(--ink-muted)" />} label="تاريخ الطلب" value={new Date(order.placedAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })} />
            {order.shipmentId && <Row icon={<Truck size={13} color="#0099ff" />} label="رقم الشحنة" value={order.shipmentId} ltr valueColor="#0099ff" />}
          </Section>

          {/* actions */}
          {order.status === 'pending' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={handleAccept} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <CheckCircle size={14} /> قبول
              </button>
              <button onClick={handleReject} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(255,85,119,0.3)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: 'rgba(255,85,119,0.08)', color: '#ff5577', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <XCircle size={14} /> رفض
              </button>
            </div>
          )}
          {order.status === 'accepted' && (
            <button style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: '#0099ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Truck size={14} /> إنشاء شحنة
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--canvas)', borderRadius: 12, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--hairline-soft)', fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</div>
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
