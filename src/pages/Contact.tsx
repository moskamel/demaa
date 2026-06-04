import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: 16,
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <PageLayout>
      <main style={{ padding: '64px 200px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            ...eyebrow,
            display: 'inline-block',
            background: 'linear-gradient(135deg, #6a4cf5, #d44df0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            تواصل معنا
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 16, lineHeight: 1.15 }}>
            نحن هنا لمساعدتك
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
            فريق دعم عربي حقيقي يرد في أقل من ساعة — السبت إلى الخميس، ٩ صباحاً حتى ٦ مساءً.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

          {/* Left: contact info + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '20px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📧</div>
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>البريد الإلكتروني</h3>
              <a href="mailto:hello@deema.ai" style={{ fontSize: 14, color: 'var(--ink-muted)', textDecoration: 'none' }}>hello@deema.ai</a>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>نرد خلال ٢٤ ساعة في أيام العمل</p>
            </div>
            <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '20px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>💬</div>
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>واتساب</h3>
              <a href="https://wa.me/201000000000" style={{ fontSize: 14, color: 'var(--ink-muted)', textDecoration: 'none' }}>+20 100 000 0000</a>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>السبت – الخميس، ٩ص – ٦م</p>
            </div>
            <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '20px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📍</div>
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>المقر</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>القاهرة، مصر</p>
            </div>

            {/* Direct CTA */}
            <div style={{ background: 'linear-gradient(135deg, #6a4cf511, #d44df011)', borderRadius: 16, padding: '24px', border: '1px solid var(--hairline)', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 16, fontWeight: 600 }}>أو ابدأ مباشرة</p>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                لا تنتظر — سجّل الآن وجرّب Deema مجاناً بدون أي بيانات بنكية.
              </p>
              <Link
                to="/signup"
                style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', borderRadius: 9999, padding: '13px 28px', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                ابدأ مجاناً ←
              </Link>
            </div>
          </div>

          {/* Right: form */}
          <div>
            {submitted ? (
              <div style={{
                background: 'var(--canvas-soft)',
                borderRadius: 20,
                padding: '48px 32px',
                border: '1px solid var(--hairline)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>تم إرسال رسالتك!</h2>
                <p style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.6 }}>شكراً لتواصلك معنا. سنرد عليك خلال ٢٤ ساعة على بريدك الإلكتروني.</p>
                <button onClick={() => setSubmitted(false)} style={{ marginTop: 24, cursor: 'pointer', background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 9999, padding: '10px 24px', fontSize: 14, color: 'var(--ink)' }}>إرسال رسالة أخرى</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{
                background: 'var(--canvas-soft)',
                borderRadius: 20,
                padding: '32px',
                border: '1px solid var(--hairline)',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>أرسل رسالة</h2>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--ink-muted)', display: 'block', marginBottom: 6 }}>الاسم</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="اسمك الكامل"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--canvas)', border: '1px solid var(--hairline)',
                      borderRadius: 10, padding: '10px 14px',
                      color: 'var(--ink)', fontSize: 14,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--ink-muted)', display: 'block', marginBottom: 6 }}>البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--canvas)', border: '1px solid var(--hairline)',
                      borderRadius: 10, padding: '10px 14px',
                      color: 'var(--ink)', fontSize: 14,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--ink-muted)', display: 'block', marginBottom: 6 }}>رسالتك</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="اكتب رسالتك هنا..."
                    rows={5}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--canvas)', border: '1px solid var(--hairline)',
                      borderRadius: 10, padding: '10px 14px',
                      color: 'var(--ink)', fontSize: 14,
                      resize: 'vertical',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #6a4cf5, #d44df0)', color: '#fff', borderRadius: 9999, padding: '13px 40px', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    إرسال الرسالة ←
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </main>
    </PageLayout>
  )
}
