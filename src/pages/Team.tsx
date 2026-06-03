import { useState, useEffect } from 'react'
import { Add, Trash, ShieldTick, ClipboardText, Headphone } from 'iconsax-react'
import { teamApi, type TeamMember } from '../lib/api'
import AppSidebar from '../components/AppSidebar'
import AppHeader from '../components/AppHeader'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../components/Toast'

type NormRole = 'admin' | 'order_manager' | 'customer_service'

function normalizeRole(role: string): NormRole {
  const r = role.toLowerCase()
  if (r === 'admin') return 'admin'
  if (r === 'order_manager') return 'order_manager'
  return 'customer_service'
}

const roleConfig: Record<NormRole, { label: string; desc: string; icon: typeof ShieldTick; color: string }> = {
  admin: { label: 'مدير', desc: 'صلاحيات كاملة', icon: ShieldTick, color: '#6a4cf5' },
  order_manager: { label: 'مدير طلبات', desc: 'إدارة الطلبات والشحن', icon: ClipboardText, color: '#0099ff' },
  customer_service: { label: 'خدمة عملاء', desc: 'المراسلة والكوبونات', icon: Headphone, color: '#22c55e' },
}

const PERMISSIONS: Record<NormRole, string[]> = {
  admin: ['قبول / رفض الطلبات', 'إنشاء بوالص الشحن', 'إدارة المنتجات', 'التقارير الكاملة', 'إدارة الفريق', 'إعدادات المتجر'],
  order_manager: ['قبول / رفض الطلبات', 'إنشاء بوالص الشحن', 'تقارير الطلبات'],
  customer_service: ['مراسلة العملاء', 'إنشاء كوبونات', 'عرض الطلبات فقط'],
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showHelp, setShowHelp] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<NormRole>('order_manager')
  const [inviting, setInviting] = useState(false)
  const { confirm, Dialog } = useConfirm()
  const toast = useToast()

  useEffect(() => {
    teamApi.list().then(data => {
      setMembers(data.members)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      const data = await teamApi.invite(inviteEmail.trim(), inviteRole)
      setMembers(prev => [...prev, data.member])
      setInviteEmail('')
      setShowInvite(false)
    } catch (err) {
      alert((err as Error).message || 'حدث خطأ أثناء الدعوة')
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (id: string, name: string) => {
    const ok = await confirm({ title: 'إزالة عضو الفريق', message: `هل تريد إزالة "${name}" من الفريق؟`, confirmLabel: 'إزالة العضو', danger: true, risk: 'high', consequence: 'سيفقد العضو فوراً جميع صلاحياته ولن يتمكن من الوصول للنظام.' })
    if (!ok) return
    try {
      await teamApi.remove(id)
      setMembers(prev => prev.filter(m => m.id !== id))
      toast.success('تم إزالة العضو')
    } catch (err) {
      toast.error((err as Error).message || 'فشلت الإزالة')
    }
  }

  const handleRoleChange = async (id: string, role: NormRole) => {
    const member = members.find(m => m.id === id)
    const ok = await confirm({
      title: 'تغيير صلاحية العضو',
      message: `هل تريد تغيير دور "${member?.name || 'العضو'}" إلى "${roleConfig[role].label}"؟`,
      confirmLabel: 'تغيير الصلاحية',
      risk: 'medium',
      consequence: `سيحصل العضو على صلاحيات: ${PERMISSIONS[role].join('، ')}`,
    })
    if (!ok) return
    try {
      await teamApi.updateRole(id, role.toUpperCase())
      setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m))
    } catch (err) {
      toast.error((err as Error).message || 'فشل تغيير الدور')
    }
  }

  return (<>
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--canvas)' }}>
      <AppHeader />

      <div style={{ padding: '50px 150px' }}>
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--ink)', marginBottom: 6 }}>الفريق والصلاحيات</h1>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>{members.length} أعضاء في الفريق</p>
          </div>
          <button
            onClick={() => setShowHelp(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--canvas-soft)', border: '1px solid var(--hairline)', borderRadius: 8, padding: '7px 14px', fontSize: 13, color: 'var(--ink-muted)', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas-soft-2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--canvas-soft)' }}
          >
            <span style={{ fontSize: 13 }}>؟</span>
            مساعدة
          </button>
        </div>

        {/* Help popup */}
        {showHelp && (
          <div className="animate-backdrop-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
            onClick={e => e.target === e.currentTarget && setShowHelp(false)}
          >
            <div className="animate-modal-in" style={{ background: 'var(--canvas-soft)', borderRadius: 20, padding: '28px', width: 520, border: '1px solid var(--hairline)', fontFamily: "'Zain','Inter',sans-serif", direction: 'rtl', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>الصلاحيات والأدوار</h2>
                <button onClick={() => setShowHelp(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {(Object.entries(roleConfig) as [NormRole, typeof roleConfig[NormRole]][]).map(([role, cfg]) => {
                  const Icon = cfg.icon
                  return (
                    <div key={role} style={{ background: 'var(--canvas)', borderRadius: 12, padding: '14px', border: '1px solid var(--hairline)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <Icon size={13} color={cfg.color} variant="Outline" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                      </div>
                      {PERMISSIONS[role].map(p => (
                        <div key={p} style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 4, display: 'flex', gap: 5 }}>
                          <span style={{ color: cfg.color }}>✓</span> {p}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* members */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: 68, borderRadius: 14 }} />)}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {members.map((m, idx) => {
            const normRole = normalizeRole(m.role)
            const cfg = roleConfig[normRole]
            const Icon = cfg.icon
            return (
              <div key={m.id} className="animate-fade-in-up card-interactive" style={{ background: 'var(--canvas-soft)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--hairline)', animationDelay: `${idx * 50}ms` }}>
                {/* avatar */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: cfg.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: cfg.color }}>{m.avatar}</span>
                </div>

                {/* info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{m.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: cfg.color + '18', borderRadius: 4, padding: '2px 7px' }}>
                      <Icon size={10} color={cfg.color} variant="Outline" />
                      <span style={{ fontSize: 11, color: cfg.color }}>{cfg.label}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', direction: 'ltr', textAlign: 'right' }}>{m.email}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>آخر نشاط: {m.lastActive}</div>
                </div>

                {/* role selector */}
                <select
                  value={normRole}
                  onChange={e => handleRoleChange(m.id, e.target.value as NormRole)}
                  style={{ background: 'var(--canvas-soft-2)', border: '1px solid var(--hairline)', borderRadius: 8, padding: '6px 10px', color: 'var(--ink)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  <option value="admin">مدير</option>
                  <option value="order_manager">مدير طلبات</option>
                  <option value="customer_service">خدمة عملاء</option>
                </select>

                {normRole !== 'admin' && (
                  <button onClick={() => handleRemove(m.id, m.name)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,85,119,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Trash size={13} color="var(--gradient-coral)" variant="Outline" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* invite modal */}
        {showInvite && (
          <div className="animate-backdrop-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
            onClick={e => e.target === e.currentTarget && setShowInvite(false)}
          >
            <div className="animate-modal-in" style={{ background: 'var(--canvas-soft)', borderRadius: 20, padding: '28px', width: 380, border: '1px solid var(--hairline)', fontFamily: "'Zain','Inter',sans-serif", direction: 'rtl' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 20, letterSpacing: '-0.3px' }}>دعوة عضو جديد</h2>

              <label style={{ display: 'block', marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6 }}>البريد الإلكتروني</div>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="name@company.sa"
                  style={{ width: '100%', background: 'var(--canvas-soft-2)', border: '1px solid var(--hairline)', borderRadius: 10, padding: '10px 14px', color: 'var(--ink)', fontSize: 13, direction: 'ltr', fontFamily: 'inherit' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6 }}>الصلاحية</div>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as NormRole)}
                  style={{ width: '100%', background: 'var(--canvas-soft-2)', border: '1px solid var(--hairline)', borderRadius: 10, padding: '10px 14px', color: 'var(--ink)', fontSize: 13, fontFamily: 'inherit' }}
                >
                  <option value="order_manager">مدير طلبات</option>
                  <option value="customer_service">خدمة عملاء</option>
                  <option value="admin">مدير (صلاحيات كاملة)</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || inviting}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', borderRadius: 10, padding: '11px', opacity: inviting ? 0.7 : 1 }}
                >
                  {inviting ? 'جاري الإرسال...' : 'إرسال الدعوة'}
                </button>
                <button onClick={() => setShowInvite(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', borderRadius: 10, padding: '11px' }}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
    {Dialog}
  </>)
}
