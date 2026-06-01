import { Link } from 'react-router-dom'
import { ArrowLeft, Zap, Package, BarChart3, CheckCircle, Star } from 'lucide-react'

export default function Landing() {
  return (
    <div style={{ background: 'var(--canvas)', color: 'var(--ink)' }}>
      {/* Top Nav */}
      <nav style={{
        background: 'var(--canvas)',
        borderBottom: '1px solid var(--hairline)',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 48px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>D</span>
          </span>
          <span style={{ fontFamily: 'Noto Serif Arabic, serif', fontSize: 20, fontWeight: 400, color: 'var(--ink)' }}>Deema</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>تسجيل الدخول</Link>
          <Link to="/onboarding" style={{
            background: 'var(--primary)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 500,
          }}>ابدأ مجاناً</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '96px 48px', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--surface-card)',
            borderRadius: 999,
            padding: '4px 14px',
            marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', letterSpacing: '0.05em' }}>متاح الآن — نسخة تجريبية مجانية</span>
          </div>

          <h1 className="font-display" style={{ fontSize: 52, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 20px', color: 'var(--ink)' }}>
            دعني أدير متجرك<br />
            <span style={{ color: 'var(--primary)' }}>وأنت ترتاح</span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--body)', margin: '0 0 36px', maxWidth: 440 }}>
            Deema مساعدك الذكي للتجارة الإلكترونية — يدير طلباتك، شحنك، ومنتجاتك بالعربي بكلمة واحدة منك.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/onboarding" style={{
              background: 'var(--primary)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              ابدأ مجاناً
              <ArrowLeft size={16} />
            </Link>
            <Link to="/dashboard" style={{
              background: 'transparent',
              color: 'var(--ink)',
              textDecoration: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 500,
              border: '1px solid var(--hairline)',
            }}>
              شاهد كيف يعمل
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 28 }}>
            <div style={{ display: 'flex' }}>
              {['A','B','C','D','E'].map((l,i) => (
                <div key={l} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: ['#cc785c','#5db8a6','#e8a55a','#5db872','#a9583e'][i],
                  border: '2px solid var(--canvas)',
                  marginRight: i > 0 ? -8 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#fff', fontWeight: 600,
                  position: 'relative', zIndex: 5-i,
                }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="var(--accent-amber)" color="var(--accent-amber)" />)}
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>+١٠٠ تاجر يثقون بنا</span>
            </div>
          </div>
        </div>

        {/* Hero mockup */}
        <div style={{
          background: 'var(--surface-dark)',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 24px 64px rgba(20,20,19,0.18)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #2a2825' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c940' }} />
            <span style={{ color: 'var(--on-dark-soft)', fontSize: 12, marginRight: 'auto' }}>متجر النور — سلة</span>
          </div>

          {/* Deema message */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>D</span>
              </div>
              <span style={{ color: 'var(--on-dark-soft)', fontSize: 12 }}>Deema</span>
            </div>
            <div style={{ background: 'var(--surface-dark-elevated)', borderRadius: '4px 12px 12px 12px', padding: '12px 16px', color: 'var(--on-dark)', fontSize: 14, lineHeight: 1.6 }}>
              صباح الخير أحمد! 🌅 ملخص متجرك:
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { n: '47', l: 'طلب جديد', c: 'var(--accent-amber)' },
              { n: '12', l: 'معلق', c: 'var(--primary)' },
              { n: '32', l: 'مشحون', c: 'var(--success)' },
              { n: '3', l: 'مشاكل', c: 'var(--error)' },
            ].map(s => (
              <div key={s.l} style={{ background: 'var(--surface-dark-soft)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.c, fontFamily: 'monospace' }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'var(--on-dark-soft)' }}>{s.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              اقبل الجاهزة
            </button>
            <button style={{ flex: 1, background: 'var(--surface-dark-elevated)', color: 'var(--on-dark)', border: 'none', borderRadius: 8, padding: '10px 12px', fontSize: 12, cursor: 'pointer' }}>
              وريني المشاكل
            </button>
          </div>

          {/* User message */}
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: 'var(--primary)', borderRadius: '12px 4px 12px 12px', padding: '10px 14px', color: '#fff', fontSize: 13, maxWidth: '70%' }}>
              اقبل الطلبات السليمة
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: 'var(--surface-card)', borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', padding: '32px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 96 }}>
          {[
            { n: '١٠٠+', l: 'متجر متصل' },
            { n: '٩٨٪+', l: 'رضا التجار' },
            { n: '٣', l: 'منصات مدعومة' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div className="font-display" style={{ fontSize: 36, color: 'var(--primary)', letterSpacing: '-0.03em' }}>{s.n}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '96px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="font-display" style={{ fontSize: 36, letterSpacing: '-0.02em', margin: '0 0 12px', color: 'var(--ink)' }}>كل شيء يحتاجه متجرك</h2>
          <p style={{ color: 'var(--muted)', fontSize: 16 }}>Deema يفهم عربيتك ويتصرف فوراً</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            {
              icon: <Package size={24} color="var(--primary)" />,
              title: 'إدارة الطلبات',
              desc: 'يقبل ويرفض ويتابع طلباتك بأمر واحد. يعمل مع سلة وزد وShopify.',
              example: '"اقبل الطلبات السليمة"',
            },
            {
              icon: <Zap size={24} color="var(--accent-teal)" />,
              title: 'الشحن الذكي',
              desc: 'ينشئ بوالص الشحن تلقائياً مع أرامكس و SMSA و J&T.',
              example: '"اشحن الطلبات المقبولة"',
            },
            {
              icon: <BarChart3 size={24} color="var(--accent-amber)" />,
              title: 'تقارير فورية',
              desc: 'ملخص يومي قبل ما تصحى — مبيعات، مخزون، ومشاكل.',
              example: '"مبيعات هذا الأسبوع"',
            },
          ].map(f => (
            <div key={f.title} style={{
              background: 'var(--surface-card)',
              borderRadius: 12,
              padding: 32,
            }}>
              <div style={{ marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', color: 'var(--ink)' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--body)', lineHeight: 1.6, margin: '0 0 16px' }}>{f.desc}</p>
              <div style={{
                background: 'var(--surface-dark)',
                borderRadius: 8,
                padding: '8px 12px',
                fontFamily: 'Noto Sans Arabic, sans-serif',
                fontSize: 13,
                color: 'var(--on-dark-soft)',
              }}>
                مثال: <span style={{ color: 'var(--accent-amber)' }}>{f.example}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section style={{ padding: '64px 48px', background: 'var(--surface-soft)', borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="font-display" style={{ fontSize: 28, margin: '0 0 8px', letterSpacing: '-0.02em' }}>متصل بمنصتك المفضلة</h2>
          <p style={{ color: 'var(--muted)', fontSize: 15, margin: '0 0 40px' }}>ربط سريع بدون تقنيات معقدة</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            {[
              { name: 'سلة', desc: 'المنصة السعودية الأولى', color: '#7B5EA7', emoji: '🟣' },
              { name: 'زد', desc: 'تجارة إلكترونية عربية', color: '#00A86B', emoji: '🟢' },
              { name: 'Shopify', desc: 'منصة عالمية', color: '#96BF48', emoji: '🌿' },
            ].map(p => (
              <div key={p.name} style={{
                background: 'var(--canvas)',
                border: '1px solid var(--hairline)',
                borderRadius: 12,
                padding: '24px 32px',
                textAlign: 'center',
                width: 180,
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{p.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — chat demo */}
      <section style={{ padding: '96px 48px', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: 12, textTransform: 'uppercase' }}>كيف يعمل</div>
          <h2 className="font-display" style={{ fontSize: 36, letterSpacing: '-0.02em', margin: '0 0 16px', color: 'var(--ink)' }}>كلّمه بالعربي<br />يتصرف لحالك</h2>
          <p style={{ color: 'var(--body)', fontSize: 16, lineHeight: 1.7, margin: '0 0 32px' }}>
            ما محتاج تتعلم أي نظام. فقط اكتب ما تريد بلهجتك — مصري، سعودي، خليجي — وDeema يفهم وينفذ.
          </p>
          {[
            { cmd: '"وريني الطلبات المعلقة"', res: 'يعرض ١٢ طلب معلق مع التفاصيل' },
            { cmd: '"اشحن الطلبات المقبولة"', res: 'ينشئ ٢٣ بوليصة شحن فوراً' },
            { cmd: '"مبيعات هذا الأسبوع"', res: 'تقرير كامل في ثوانٍ' },
          ].map(item => (
            <div key={item.cmd} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{item.cmd}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{item.res}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--surface-dark)', borderRadius: 12, padding: 24, fontSize: 13 }}>
          {[
            { role: 'user', msg: 'وريني الطلبات المعلقة' },
            { role: 'deema', msg: 'عندك ١٢ طلب معلق في متجر النور 📦\n\nأعلى طلب: #١٠٢٣٤ — محمد الأحمدي — ٢٤٠ ر.س\n\nهل تريد قبولها جميعاً؟' },
            { role: 'user', msg: 'اقبل الجاهزة' },
            { role: 'deema', msg: '✅ تم قبول ٩ طلبات بنجاح\n⚠️ ٣ طلبات تحتاج مراجعة (مشكلة في العنوان)\n\nهل تريد إنشاء بوالص الشحن الآن؟' },
          ].map((m, i) => (
            <div key={i} style={{
              marginBottom: 12,
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end',
              flexDirection: m.role === 'deema' ? 'row-reverse' : 'row',
            }}>
              {m.role === 'deema' && (
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8 }}>
                  <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>D</span>
                </div>
              )}
              <div style={{
                background: m.role === 'user' ? 'var(--primary)' : 'var(--surface-dark-elevated)',
                color: m.role === 'user' ? '#fff' : 'var(--on-dark)',
                borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                padding: '10px 14px',
                maxWidth: '78%',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
              }}>{m.msg}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '96px 48px', background: 'var(--surface-soft)', borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="font-display" style={{ fontSize: 36, letterSpacing: '-0.02em', margin: '0 0 12px', color: 'var(--ink)' }}>اختر خطتك</h2>
            <p style={{ color: 'var(--muted)', fontSize: 16 }}>ابدأ مجاناً، وسعّد في أي وقت</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 900, margin: '0 auto' }}>
            {[
              {
                name: 'مجاني',
                price: '٠',
                period: 'ر.س/شهر',
                desc: 'للبداية',
                features: ['متجر واحد', '٥٠ طلب/شهر', 'المنصات الأساسية', 'دعم عبر الإيميل'],
                cta: 'ابدأ مجاناً',
                featured: false,
              },
              {
                name: 'احترافي',
                price: '٩٩',
                period: 'ر.س/شهر',
                desc: 'الأكثر شعبية',
                features: ['٣ متاجر', 'طلبات غير محدودة', 'جميع المنصات', 'شركات الشحن', 'دعم أولوية'],
                cta: 'ابدأ الآن',
                featured: true,
              },
              {
                name: 'شركات',
                price: '٢٩٩',
                period: 'ر.س/شهر',
                desc: 'للنمو الكبير',
                features: ['متاجر غير محدودة', 'API مخصص', 'فريق متعدد', 'تقارير متقدمة', 'مدير حساب'],
                cta: 'تواصل معنا',
                featured: false,
              },
            ].map(tier => (
              <div key={tier.name} style={{
                background: tier.featured ? 'var(--surface-dark)' : 'var(--canvas)',
                border: tier.featured ? 'none' : '1px solid var(--hairline)',
                borderRadius: 12,
                padding: 32,
                position: 'relative',
              }}>
                {tier.featured && (
                  <div style={{ position: 'absolute', top: -12, right: 24 }}>
                    <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 999, padding: '3px 12px', fontSize: 11, fontWeight: 600 }}>الأكثر شعبية</span>
                  </div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, color: tier.featured ? 'var(--on-dark-soft)' : 'var(--muted)', marginBottom: 4 }}>{tier.desc}</div>
                  <h3 className="font-display" style={{ fontSize: 22, margin: '0 0 8px', color: tier.featured ? 'var(--on-dark)' : 'var(--ink)' }}>{tier.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 32, fontWeight: 700, color: tier.featured ? 'var(--on-dark)' : 'var(--ink)', fontFamily: 'monospace' }}>{tier.price}</span>
                    <span style={{ fontSize: 13, color: tier.featured ? 'var(--on-dark-soft)' : 'var(--muted)' }}>{tier.period}</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tier.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: tier.featured ? 'var(--on-dark)' : 'var(--body)' }}>
                      <CheckCircle size={15} color={tier.featured ? 'var(--success)' : 'var(--success)'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/onboarding" style={{
                  display: 'block',
                  textAlign: 'center',
                  background: tier.featured ? 'var(--primary)' : 'var(--surface-card)',
                  color: tier.featured ? '#fff' : 'var(--ink)',
                  textDecoration: 'none',
                  borderRadius: 8,
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                }}>{tier.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA coral band */}
      <section style={{ padding: '64px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            background: 'var(--primary)',
            borderRadius: 16,
            padding: '64px 48px',
            textAlign: 'center',
          }}>
            <h2 className="font-display" style={{ fontSize: 36, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>جرّب Deema مجاناً اليوم</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '0 0 32px' }}>لا يحتاج بطاقة ائتمان — ابدأ في دقيقتين</p>
            <Link to="/onboarding" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--canvas)',
              color: 'var(--ink)',
              textDecoration: 'none',
              borderRadius: 8,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
            }}>
              ابدأ الآن مجاناً
              <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--surface-dark)', padding: '48px', color: 'var(--on-dark-soft)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>D</span>
              </span>
              <span style={{ color: 'var(--on-dark)', fontFamily: 'Noto Serif Arabic, serif', fontSize: 18 }}>Deema</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 280 }}>مساعدك الذكي للتجارة الإلكترونية العربية. يدير متجرك بلهجتك.</p>
          </div>
          <div>
            <div style={{ color: 'var(--on-dark)', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>المنتج</div>
            {['المميزات', 'الأسعار', 'المنصات', 'التحديثات'].map(l => (
              <div key={l} style={{ fontSize: 13, marginBottom: 10 }}><a href="#" style={{ color: 'var(--on-dark-soft)', textDecoration: 'none' }}>{l}</a></div>
            ))}
          </div>
          <div>
            <div style={{ color: 'var(--on-dark)', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>الشركة</div>
            {['من نحن', 'تواصل معنا', 'سياسة الخصوصية', 'الشروط والأحكام'].map(l => (
              <div key={l} style={{ fontSize: 13, marginBottom: 10 }}><a href="#" style={{ color: 'var(--on-dark-soft)', textDecoration: 'none' }}>{l}</a></div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid #2a2825', textAlign: 'center', fontSize: 12, color: 'var(--on-dark-soft)' }}>
          © ٢٠٢٥ Deema. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  )
}
