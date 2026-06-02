import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Sun, Shield, Bell, Zap, Globe, User, Lock } from 'lucide-react'
import { settingsApi } from '../lib/api'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{ width: 40, height: 22, borderRadius: 100, background: checked ? 'var(--semantic-success)' : 'var(--surface-2)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}
    >
      <div style={{ position: 'absolute', top: 3, right: checked ? 3 : 19, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'right 0.2s' }} />
    </button>
  )
}

function SettingRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--hairline-soft)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: desc ? 2 : 0 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{desc}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: typeof Sun; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 16, padding: '20px 22px', marginBottom: 16, border: '1px solid var(--hairline)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Icon size={14} color="var(--ink-muted)" />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const [settings, setSettings] = useState({
    morningBrief: true,
    morningTime: '09:00',
    personality: 'friendly' as 'friendly' | 'formal',
    lang: 'ar' as 'ar' | 'en',
    notifUrgent: true,
    notifStock: true,
    notifOrders: false,
    notifWeekly: true,
    confirmBulk: true,
    autoShipNotify: true,
    stockThreshold: 10,
    twoFactor: false,
    sessionLog: true,
  })

  const [profile, setProfile] = useState({ name: '', email: '', phone: '' })
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    settingsApi.getProfile().then(r => {
      setProfile({ name: r.user.name, email: r.user.email, phone: r.user.phone || '' })
    }).catch(() => {})
  }, [])

  const set = (key: keyof typeof settings, val: boolean | string | number) => setSettings(s => ({ ...s, [key]: val }))

  const handleSaveProfile = async () => {
    setSaving(true)
    setProfileMsg('')
    try {
      await settingsApi.updateProfile({ name: profile.name, phone: profile.phone || undefined })
      setProfileMsg('تم حفظ التغييرات بنجاح')
      setTimeout(() => setProfileMsg(''), 3000)
    } catch {
      setProfileMsg('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordMsg('')
    if (!passwords.current || !passwords.newPass) { setPasswordError('يرجى تعبئة جميع الحقول'); return }
    if (passwords.newPass !== passwords.confirm) { setPasswordError('كلمة المرور الجديدة غير متطابقة'); return }
    if (passwords.newPass.length < 6) { setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    setSavingPassword(true)
    try {
      await settingsApi.changePassword(passwords.current, passwords.newPass)
      setPasswordMsg('تم تغيير كلمة المرور بنجاح')
      setPasswords({ current: '', newPass: '', confirm: '' })
      setTimeout(() => setPasswordMsg(''), 3000)
    } catch (err) {
      setPasswordError((err as Error).message || 'حدث خطأ')
    } finally {
      setSavingPassword(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--hairline)',
    background: 'var(--surface-2)', color: 'var(--ink)', fontSize: 13, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', paddingBottom: 60 }}>
      {/* top bar */}
      <div style={{ borderBottom: '1px solid var(--hairline)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 13 }}>
          <ChevronLeft size={14} /> الرئيسية
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>الإعدادات</span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--ink)', marginBottom: 28 }}>الإعدادات</h1>

        {/* Profile section */}
        <Section icon={User} title="الملف الشخصي">
          <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>الاسم الكامل</label>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>البريد الإلكتروني</label>
              <input value={profile.email} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>رقم الجوال</label>
              <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="05xxxxxxxx" style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} />
            </div>
            {profileMsg && (
              <div style={{ fontSize: 12, color: '#22c55e', background: 'rgba(34,197,94,0.08)', borderRadius: 8, padding: '8px 12px' }}>{profileMsg}</div>
            )}
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '9px 20px', borderRadius: 10, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'جاري الحفظ...' : 'حفظ الملف الشخصي'}
            </button>
          </div>
        </Section>

        {/* Password section */}
        <Section icon={Lock} title="تغيير كلمة المرور">
          <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>كلمة المرور الحالية</label>
              <input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>كلمة المرور الجديدة</label>
              <input type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6, display: 'block' }}>تأكيد كلمة المرور</label>
              <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} />
            </div>
            {passwordError && (
              <div style={{ fontSize: 12, color: '#ff5577', background: 'rgba(255,85,119,0.08)', borderRadius: 8, padding: '8px 12px' }}>{passwordError}</div>
            )}
            {passwordMsg && (
              <div style={{ fontSize: 12, color: '#22c55e', background: 'rgba(34,197,94,0.08)', borderRadius: 8, padding: '8px 12px' }}>{passwordMsg}</div>
            )}
            <button onClick={handleChangePassword} disabled={savingPassword} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '9px 20px', borderRadius: 10, opacity: savingPassword ? 0.7 : 1 }}>
              {savingPassword ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
            </button>
          </div>
        </Section>

        {/* Deema settings */}
        <Section icon={Zap} title="إعدادات Deema">
          <div style={{ paddingTop: 8 }}>
            <SettingRow
              label="الملخص الصباحي"
              desc="Deema تبدأ هي كل صباح بملخص متجرك"
              checked={settings.morningBrief}
              onChange={v => set('morningBrief', v)}
            />
            {settings.morningBrief && (
              <div style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--hairline-soft)' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-muted)', flex: 1 }}>وقت الملخص</span>
                <input
                  type="time"
                  value={settings.morningTime}
                  onChange={e => set('morningTime', e.target.value)}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 8, padding: '6px 10px', color: 'var(--ink)', fontSize: 13, direction: 'ltr', fontFamily: 'inherit' }}
                />
              </div>
            )}
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--hairline-soft)' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>شخصية Deema</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {([['friendly', 'ودية وعفوية'], ['formal', 'رسمية ومهنية']] as const).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => set('personality', v)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${settings.personality === v ? 'var(--accent-blue)' : 'var(--hairline)'}`, background: settings.personality === v ? 'rgba(0,153,255,0.08)' : 'transparent', color: settings.personality === v ? 'var(--accent-blue)' : 'var(--ink-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* language */}
        <Section icon={Globe} title="اللغة">
          <div style={{ paddingTop: 8 }}>
            <div style={{ padding: '10px 0' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>لغة التفاعل</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {([['ar', 'العربية'], ['en', 'English']] as const).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => set('lang', v)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${settings.lang === v ? 'var(--accent-blue)' : 'var(--hairline)'}`, background: settings.lang === v ? 'rgba(0,153,255,0.08)' : 'transparent', color: settings.lang === v ? 'var(--accent-blue)' : 'var(--ink-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* notifications */}
        <Section icon={Bell} title="الإشعارات">
          <div>
            <SettingRow label="مشاكل عاجلة" desc="طلبات مشبوهة، أخطاء دفع" checked={settings.notifUrgent} onChange={v => set('notifUrgent', v)} />
            <SettingRow label="نفاد المخزون" checked={settings.notifStock} onChange={v => set('notifStock', v)} />
            <SettingRow label="طلبات جديدة" checked={settings.notifOrders} onChange={v => set('notifOrders', v)} />
            <SettingRow label="تقارير أسبوعية" checked={settings.notifWeekly} onChange={v => set('notifWeekly', v)} />
            {settings.notifStock && (
              <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--hairline-soft)' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-muted)', flex: 1 }}>حد تنبيه المخزون</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    value={settings.stockThreshold}
                    onChange={e => set('stockThreshold', parseInt(e.target.value))}
                    min={1} max={100}
                    style={{ width: 60, background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 8, padding: '6px 10px', color: 'var(--ink)', fontSize: 13, textAlign: 'center', direction: 'ltr', fontFamily: 'inherit' }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>قطعة</span>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* automation */}
        <Section icon={Zap} title="الأتمتة">
          <div>
            <SettingRow label="تأكيد قبل الإجراءات الجماعية" desc="اطلب تأكيد قبل قبول أو رفض أكثر من 5 طلبات" checked={settings.confirmBulk} onChange={v => set('confirmBulk', v)} />
            <SettingRow label="إشعار واتساب عند الشحن" desc="يُرسل تلقائياً لو واتساب مربوط" checked={settings.autoShipNotify} onChange={v => set('autoShipNotify', v)} />
          </div>
        </Section>

        {/* security */}
        <Section icon={Shield} title="الأمان">
          <div>
            <SettingRow label="التحقق بخطوتين" desc="OTP عبر الجوال عند كل تسجيل دخول" checked={settings.twoFactor} onChange={v => set('twoFactor', v)} />
            <SettingRow label="سجل الجلسات" desc="تتبع كل الأجهزة التي سجّلت دخول" checked={settings.sessionLog} onChange={v => set('sessionLog', v)} />
          </div>
        </Section>
      </div>
    </div>
  )
}
