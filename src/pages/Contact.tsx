import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <PageLayout>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '64px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 16 }}>تواصل معنا</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>نحن هنا نسمعك — رد خلال ٢٤ ساعة</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '20px', border: '1px solid var(--hairline)' }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>📧</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>البريد الإلكتروني</h3>
                <a href="mailto:hello@deema.ai" style={{ fontSize: 14, color: 'var(--ink-muted)', textDecoration: 'none' }}>hello@deema.ai</a>
              </div>
              <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '20px', border: '1px solid var(--hairline)' }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>💬</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>واتساب</h3>
                <a href="https://wa.me/201000000000" style={{ fontSize: 14, color: 'var(--ink-muted)', textDecoration: 'none' }}>+20 100 000 0000</a>
                <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>السبت – الخميس، ٩ص – ٦م</p>
              </div>
              <div style={{ background: 'var(--canvas-soft)', borderRadius: 16, padding: '20px', border: '1px solid var(--hairline)' }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>📍</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>المقر</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>القاهرة، مصر</p>
              </div>
            </div>
          </div>

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
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>تم إرسال رسالتك!</h2>
                <p style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.6 }}>شكراً لتواصلك معنا. سنرد عليك خلال ٢٤ ساعة على بريدك الإلكتروني.</p>
                <button onClick={() => setSubmitted(false)} className="btn-secondary" style={{ marginTop: 24, cursor: 'pointer' }}>إرسال رسالة أخرى</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{
                background: 'var(--canvas-soft)',
                borderRadius: 20,
                padding: '32px',
                border: '1px solid var(--hairline)',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>أرسل رسالة</h2>
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
                <button type="submit" className="btn-primary" style={{ cursor: 'pointer' }}>إرسال الرسالة</button>
              </form>
            )}
          </div>
        </div>
      </main>

    </PageLayout>
  )
}
