import { Link } from 'react-router-dom'
import { MessageSquare, Package, Truck, BarChart3, Users, Tag, Shield, Zap, Globe, Bell, FileText, Settings } from 'lucide-react'

const features = [
  { icon: MessageSquare, title: 'محادثة ذكية بالعربي', desc: 'تكلم Deema بأي لهجة عربية — مصري، سعودي، خليجي — ويفهمك على طول. لا حاجة لأوامر محددة.' },
  { icon: Package, title: 'إدارة الطلبات', desc: 'اقبل وارفض وتابع طلباتك بجملة واحدة. Deema يتعامل مع الطلبات الجديدة والمعلقة والمكتملة.' },
  { icon: Truck, title: 'الشحن الذكي', desc: 'ينشئ بوالص الشحن تلقائياً مع أرامكس وSMSA وJ&T. يتابع حالة الشحنات ويبلغك بأي تأخير.' },
  { icon: BarChart3, title: 'تقارير وتحليلات', desc: 'ملخص يومي وأسبوعي وشهري — مبيعات ومخزون وعملاء ومشاكل. كل شيء في مكان واحد.' },
  { icon: Users, title: 'إدارة الفريق', desc: 'أضف أعضاء الفريق وحدد صلاحياتهم. كل عضو يرى فقط ما يحتاجه.' },
  { icon: Tag, title: 'الكوبونات والعروض', desc: 'أنشئ وأدر كوبونات الخصم والعروض الخاصة. تتبع الاستخدام وقيّم الأداء.' },
  { icon: Shield, title: 'أمان وصلاحيات', desc: 'كل إجراء جماعي يطلب تأكيداً. لا تنفيذ مالي بدون موافقتك الصريحة.' },
  { icon: Zap, title: 'تنفيذ فوري', desc: 'يتصرف Deema في ثوانٍ — لا انتظار، لا تعقيد. فقط نتائج فورية.' },
  { icon: Globe, title: 'ثلاث منصات', desc: 'Shopify وWuilt وShantaweb — ربط سريع بدون خبرة تقنية.' },
  { icon: Bell, title: 'إشعارات ذكية', desc: 'يبلغك بالطلبات الجديدة والمشاكل والتحديثات المهمة في الوقت الصح.' },
  { icon: FileText, title: 'فواتير وإيصالات', desc: 'يصدر الفواتير والإيصالات تلقائياً ويرسلها للعملاء بالبريد الإلكتروني.' },
  { icon: Settings, title: 'إعدادات مرنة', desc: 'خصّص Deema حسب احتياجات متجرك — لغة، عملة، ساعات عمل، وأكثر.' },
]

export default function Features() {
  return (
    <div dir="rtl" style={{ background: 'var(--canvas)', color: 'var(--ink)', minHeight: '100vh' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--hairline)',
        height: 56,
        display: 'flex', alignItems: 'center',
        padding: '0 30px',
        gap: 20,
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          → الرئيسية
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontWeight: 700, fontSize: 12 }}>D</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.5px' }}>Deema</span>
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '64px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 16 }}>كل مميزات Deema</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>كل ما تحتاجه لإدارة متجرك بكفاءة — بجملة واحدة بالعربي</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--canvas-soft)',
              borderRadius: 16,
              padding: '24px',
              border: '1px solid var(--hairline)',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--canvas-soft-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={20} color="var(--ink)" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.3px' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 64 }}>
          <Link to="/onboarding" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>ابدأ مجاناً الآن</Link>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--hairline)', padding: '24px 30px', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>© Deema 2025</span>
      </footer>
    </div>
  )
}
