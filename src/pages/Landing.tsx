import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Zap, Package, BarChart3, MessageSquare, Shield, Globe } from 'lucide-react'

export default function Landing() {
  return (
    <div style={{ background: 'var(--canvas)', color: 'var(--ink)', minHeight: '100vh' }}>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(9,9,9,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--hairline-soft)',
        height: 56,
        display: 'flex', alignItems: 'center',
        padding: '0 30px',
        gap: 20,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#000', fontWeight: 700, fontSize: 12 }}>D</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.5px', color: 'var(--ink)' }}>Deema</span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 24, flex: 1, justifyContent: 'center' }}>
          {[
            { label: 'المميزات', to: '/features' },
            { label: 'الأسعار', to: '/pricing' },
            { label: 'المنصات', to: '/platforms' },
            { label: 'التحديثات', to: '/changelog' },
          ].map(l => (
            <Link key={l.label} to={l.to} style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500, letterSpacing: '-0.14px' }}>{l.label}</Link>
          ))}
        </div>

        {/* CTA pair */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/login" className="btn-secondary">تسجيل الدخول</Link>
          <Link to="/signup" className="btn-primary">ابدأ مجاناً</Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section style={{ padding: '112px 30px 96px', maxWidth: 1199, margin: '0 auto', textAlign: 'center' }}>

        {/* eyebrow badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--surface-2)', borderRadius: 100, padding: '6px 16px', marginBottom: 40 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--semantic-success)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', letterSpacing: '-0.13px' }}>متاح الآن · مجاني للبداية</span>
        </div>

        {/* display headline */}
        <h1 className="display-hero" style={{ color: 'var(--ink)', margin: '0 auto 24px', maxWidth: 820 }}>
          مساعدك الذكي<br />
          <span style={{ color: 'var(--ink-muted)' }}>لإدارة التجارة</span>
        </h1>

        <p style={{ fontSize: 18, lineHeight: 1.4, color: 'var(--ink-muted)', margin: '0 auto 48px', maxWidth: 500, letterSpacing: '-0.18px', fontWeight: 400 }}>
          Deema يتكلم عربيتك — يقبل طلباتك، يشحن، ويرسل التقارير بجملة واحدة.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/signup" className="btn-primary" style={{ padding: '12px 22px', fontSize: 15 }}>
            ابدأ مجاناً <ArrowLeft size={14} />
          </Link>
          <Link to="/dashboard" className="btn-secondary" style={{ padding: '12px 22px', fontSize: 15 }}>
            شاهد الديمو
          </Link>
        </div>

        {/* social proof */}
        <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex' }}>
            {['#6a4cf5','#d44df0','#ff7a3d','#ff5577','#22c55e'].map((c, i) => (
              <div key={c} style={{
                width: 28, height: 28, borderRadius: '50%', background: c,
                border: '2px solid var(--canvas)',
                marginRight: i > 0 ? -8 : 0,
                position: 'relative', zIndex: 5 - i,
              }} />
            ))}
          </div>
          <span style={{ fontSize: 13, color: 'var(--ink-muted)', letterSpacing: '-0.13px' }}>
            +١٠٠ تاجر يستخدمون Deema يومياً
          </span>
        </div>
      </section>

      {/* ── CHAT MOCKUP TILE ────────────────────────────────────────── */}
      <section style={{ padding: '0 30px 96px', maxWidth: 1199, margin: '0 auto' }}>
        <div style={{
          background: 'var(--surface-1)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: 'rgba(255,255,255,0.06) 0 0.5px 0 inset, rgba(0,0,0,0.4) 0 20px 60px',
        }}>
          {/* chrome bar */}
          <div style={{ background: 'var(--surface-2)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--hairline)' }}>
            {['#ff5f57','#ffbd2e','#28c940'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
            <span style={{ color: 'var(--ink-muted)', fontSize: 12, marginRight: 'auto', letterSpacing: '-0.12px' }}>Deema · متجر النور — Shopify</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: 400 }}>
            {/* sidebar */}
            <div style={{ borderLeft: '1px solid var(--hairline)', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>المحادثات</div>
              {[
                { t: 'طلبات اليوم', d: 'الآن', active: true },
                { t: 'إضافة منتج', d: 'أمس', active: false },
                { t: 'تقرير الأسبوع', d: '٣ أيام', active: false },
              ].map(c => (
                <div key={c.t} style={{
                  padding: '8px 10px', borderRadius: 8,
                  background: c.active ? 'var(--surface-2)' : 'transparent',
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 12, color: c.active ? 'var(--ink)' : 'var(--ink-muted)', letterSpacing: '-0.12px' }}>{c.t}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{c.d}</span>
                </div>
              ))}
              <div style={{ marginTop: 'auto', padding: '8px 10px', borderTop: '1px solid var(--hairline)', paddingTop: 12 }}>
                {[
                  { name: 'متجر النور', platform: 'Shopify', active: true },
                  { name: 'متجر العود', platform: 'Wuilt', active: false },
                ].map(s => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--semantic-success)' }} />
                    <span style={{ fontSize: 11, color: s.active ? 'var(--ink)' : 'var(--ink-muted)' }}>{s.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--ink-muted)', marginRight: 'auto' }}>{s.platform}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* chat messages */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
              {/* Deema morning summary */}
              <div style={{ background: 'var(--surface-2)', borderRadius: '4px 14px 14px 14px', padding: '16px 18px', maxWidth: '75%' }}>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 12 }}>صباح الخير! 🌅 ملخص متجرك:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {[
                    { n: '47', l: 'طلب جديد', c: 'var(--gradient-orange)' },
                    { n: '12', l: 'معلق', c: 'var(--ink)' },
                    { n: '32', l: 'مشحون', c: 'var(--semantic-success)' },
                    { n: '3', l: 'مشاكل', c: 'var(--gradient-coral)' },
                  ].map(s => (
                    <div key={s.l} style={{ background: 'var(--canvas)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: s.c, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" style={{ fontSize: 12, padding: '7px 13px' }}>اقبل الجاهزة</button>
                  <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 13px' }}>وريني المشاكل</button>
                </div>
              </div>

              {/* user bubble */}
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: 'var(--surface-2)', borderRadius: '14px 4px 14px 14px', padding: '10px 14px', fontSize: 13, maxWidth: '60%' }}>
                  اقبل الطلبات السليمة
                </div>
              </div>

              {/* Deema confirmation */}
              <div style={{ background: 'var(--surface-2)', borderRadius: '4px 14px 14px 14px', padding: '14px 18px', maxWidth: '75%', fontSize: 13, lineHeight: 1.65 }}>
                ✅ هتقبل ٣٥ طلب — ١٤,٥٠٠ ج.م<br />
                <span style={{ color: 'var(--ink-muted)' }}>⏩ سيتم إنشاء بوالص الشحن تلقائياً</span>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn-primary" style={{ fontSize: 12, padding: '6px 12px' }}>نعم، نفّذ</button>
                  <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>لا، ألغِ</button>
                  <button className="btn-translucent" style={{ fontSize: 12 }}>التفاصيل</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID (spotlight cards mixed in) ────────────────── */}
      <section style={{ padding: '0 30px 96px', maxWidth: 1199, margin: '0 auto' }}>
        {/* section label */}
        <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h2 className="display-lg" style={{ color: 'var(--ink)', maxWidth: 460 }}>
            كل ما يحتاجه<br />متجرك
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', maxWidth: 280, lineHeight: 1.5, letterSpacing: '-0.15px', paddingBottom: 4 }}>
            من الطلبات للشحن للتقارير — بجملة واحدة بالعربي.
          </p>
        </div>

        {/* 3-col grid with two spotlight cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>

          {/* spotlight violet — col 1 */}
          <div className="spotlight-violet" style={{ gridRow: 'span 1' }}>
            <Package size={24} color="rgba(255,255,255,0.8)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.8px', marginBottom: 10 }}>إدارة الطلبات</h3>
            <p style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.5, marginBottom: 20 }}>يقبل ويرفض ويتابع طلباتك بجملة واحدة</p>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '9px 13px', fontSize: 12, fontFamily: 'monospace', letterSpacing: 0 }}>
              "اقبل الطلبات السليمة"
            </div>
          </div>

          {/* dark card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <Zap size={22} color="var(--ink)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.6px', marginBottom: 10 }}>الشحن الذكي</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.55, marginBottom: 20, letterSpacing: '-0.14px' }}>
              ينشئ بوالص الشحن تلقائياً مع أرامكس وSMSA وJ&T
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['أرامكس', 'SMSA', 'J&T'].map(s => (
                <span key={s} style={{ background: 'var(--surface-2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'var(--ink-muted)' }}>{s}</span>
              ))}
            </div>
          </div>

          {/* dark card with mini stats */}
          <div className="card">
            <BarChart3 size={22} color="var(--ink)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.6px', marginBottom: 10 }}>تقارير فورية</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.55, marginBottom: 20, letterSpacing: '-0.14px' }}>
              ملخص يومي شامل — مبيعات ومخزون ومشاكل
            </p>
            <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
              {[{ n: '٤٧', l: 'طلب', c: 'var(--gradient-orange)' }, { n: '١٤k', l: 'ج.م', c: 'var(--ink)' }, { n: '٩٨٪', l: 'رضا', c: 'var(--semantic-success)' }].map(s => (
                <div key={s.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.c, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* dark card */}
          <div className="card">
            <MessageSquare size={22} color="var(--ink)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.6px', marginBottom: 10 }}>يفهم عربيتك</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.55, marginBottom: 16, letterSpacing: '-0.14px' }}>
              مصري، سعودي، خليجي — كلهم يشتغلون
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['"عايز أشوف الأوردرات"', '"وريني المعلقة"', '"شفت الأوردرات؟"'].map(t => (
                <div key={t} style={{ background: 'var(--surface-2)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--ink-muted)', fontFamily: 'monospace' }}>{t}</div>
              ))}
            </div>
          </div>

          {/* spotlight magenta */}
          <div className="spotlight-magenta">
            <Shield size={24} color="rgba(255,255,255,0.8)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.8px', marginBottom: 10 }}>صلاحيات آمنة</h3>
            <p style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.5, marginBottom: 20 }}>
              كل إجراء جماعي يطلب تأكيداً. لا تنفيذ مالي بدون موافقتك.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>✅ تأكيد قبل التنفيذ</div>
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>🔒 تشفير كامل</div>
            </div>
          </div>

          {/* dark card */}
          <div className="card">
            <Globe size={22} color="var(--ink)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.6px', marginBottom: 10 }}>٣ منصات</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.55, marginBottom: 16, letterSpacing: '-0.14px' }}>
              Shopify، Wuilt، وShantaweb — ربط سريع بدون تقنيات معقدة
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ e: '🛍️', n: 'Shopify' }, { e: '🌐', n: 'Wuilt' }, { e: '🏪', n: 'Shantaweb' }].map(p => (
                <div key={p.n} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{p.e}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{p.n}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section style={{ padding: '0 30px 96px', maxWidth: 1199, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>كيف يعمل</p>
          <h2 className="display-lg" style={{ color: 'var(--ink)' }}>كلّمه<br />يتصرف</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {[
            { n: '١', title: 'اكتب أمرك', desc: 'بالعربي الطبيعي — أي لهجة تريدها', icon: '✍️' },
            { n: '٢', title: 'Deema يفهم', desc: 'يحلل النية ويستخرج البيانات من متجرك', icon: '🧠' },
            { n: '٣', title: 'ينفذ فوراً', desc: 'يطلب تأكيدك للإجراءات الكبيرة، ينفذ الباقي لحالك', icon: '⚡' },
          ].map((s, i) => (
            <div key={s.n} style={{
              background: 'var(--surface-1)',
              padding: '32px 28px',
              borderRadius: i === 0 ? '20px 0 0 20px' : i === 2 ? '0 20px 20px 0' : 0,
              borderLeft: i > 0 ? '1px solid var(--hairline)' : 'none',
            }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 8, letterSpacing: '0.05em' }}>الخطوة {s.n}</div>
              <h3 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.6px', marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.55, letterSpacing: '-0.14px' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────── */}
      <section style={{ padding: '0 30px 96px', maxWidth: 1199, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>الأسعار</p>
          <h2 className="display-lg" style={{ color: 'var(--ink)', marginBottom: 16 }}>اختر خطتك</h2>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', letterSpacing: '-0.18px' }}>ابدأ مجاناً، وسعّد في أي وقت</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 900, margin: '0 auto' }}>
          {[
            {
              name: 'مجاني', price: '٠', period: 'ج.م/شهر', tag: null,
              features: ['متجر واحد', '٥٠ طلب / شهر', 'المنصات الأساسية', 'دعم إيميل'],
              featured: false,
            },
            {
              name: 'احترافي', price: '٩٩', period: 'ج.م/شهر', tag: 'الأكثر شعبية',
              features: ['٣ متاجر', 'طلبات غير محدودة', 'جميع شركات الشحن', 'دعم أولوية', 'تقارير متقدمة'],
              featured: true,
            },
            {
              name: 'شركات', price: '٢٩٩', period: 'ج.م/شهر', tag: null,
              features: ['متاجر غير محدودة', 'API مخصص', 'فريق متعدد', 'مدير حساب', 'SLA مضمون'],
              featured: false,
            },
          ].map(tier => (
            <div key={tier.name} style={{
              background: tier.featured ? 'var(--surface-2)' : 'var(--surface-1)',
              borderRadius: 20,
              padding: 24,
              position: 'relative',
              boxShadow: tier.featured ? 'rgba(255,255,255,0.06) 0 0.5px 0 inset' : 'none',
            }}>
              {tier.tag && (
                <div style={{ position: 'absolute', top: -12, right: 20 }}>
                  <span style={{ background: '#fff', color: '#000', borderRadius: 100, padding: '3px 12px', fontSize: 11, fontWeight: 600 }}>{tier.tag}</span>
                </div>
              )}
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', marginBottom: 8, letterSpacing: '-0.13px' }}>{tier.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px' }}>{tier.price}</span>
                <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{tier.period}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {tier.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Check size={13} color="var(--semantic-success)" strokeWidth={2.5} />
                    <span style={{ fontSize: 13, color: 'var(--ink-muted)', letterSpacing: '-0.13px' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/signup" style={{
                display: 'flex', justifyContent: 'center', textDecoration: 'none',
                ...(tier.featured
                  ? { background: '#fff', color: '#000', borderRadius: 100, padding: '10px 18px', fontSize: 14, fontWeight: 500 }
                  : { background: 'var(--canvas)', color: 'var(--ink)', borderRadius: 100, padding: '10px 18px', fontSize: 14, fontWeight: 500 }
                ),
              }}>ابدأ الآن</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── ORANGE GRADIENT CTA ─────────────────────────────────────── */}
      <section style={{ padding: '0 30px 96px', maxWidth: 1199, margin: '0 auto' }}>
        <div className="spotlight-orange" style={{ borderRadius: 30, textAlign: 'center', padding: '80px 48px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 0.95, color: '#fff', margin: '0 0 16px' }}>
            جرّب Deema<br />مجاناً اليوم
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 36, letterSpacing: '-0.18px' }}>
            لا يحتاج بطاقة ائتمان · ابدأ في دقيقتين
          </p>
          <Link to="/signup" style={{
            background: '#fff', color: '#000', borderRadius: 100,
            padding: '12px 28px', fontSize: 15, fontWeight: 600,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            ابدأ الآن <ArrowLeft size={14} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--hairline-soft)', padding: '64px 30px', maxWidth: 1199, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#000', fontWeight: 700, fontSize: 11 }}>D</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Deema</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6, maxWidth: 240, letterSpacing: '-0.13px' }}>
              مساعد ذكاء اصطناعي متخصص في التجارة الإلكترونية العربية.
            </p>
          </div>
          {[
            {
              title: 'المنتج',
              links: [
                { label: 'المميزات', to: '/features' },
                { label: 'الأسعار', to: '/pricing' },
                { label: 'المنصات', to: '/platforms' },
                { label: 'التحديثات', to: '/changelog' },
              ],
            },
            {
              title: 'الشركة',
              links: [
                { label: 'من نحن', to: '/about' },
                { label: 'تواصل معنا', to: '/contact' },
                { label: 'المدونة', to: '/blog' },
                { label: 'الوظائف', to: '/careers' },
              ],
            },
            {
              title: 'القانوني',
              links: [
                { label: 'الخصوصية', to: '/privacy' },
                { label: 'الشروط', to: '/terms' },
                { label: 'الأمان', to: '/security' },
                { label: 'ملفات تعريف الارتباط', to: '/cookies' },
              ],
            },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16, letterSpacing: '-0.13px' }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l.label} style={{ marginBottom: 10 }}>
                  <Link to={l.to} style={{ fontSize: 13, color: 'var(--ink-muted)', textDecoration: 'none', letterSpacing: '-0.13px' }}>{l.label}</Link>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--hairline-soft)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-muted)', letterSpacing: '-0.12px' }}>© ٢٠٢٥ Deema. جميع الحقوق محفوظة.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {['تويتر', 'لينكدإن', 'إنستغرام'].map(s => (
              <a key={s} href="#" style={{ fontSize: 12, color: 'var(--ink-muted)', textDecoration: 'none' }}>{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
