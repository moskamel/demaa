import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { MessageText1, Box, Truck, ChartSquare, People, Tag, ShieldTick, Flash, Global, Notification, DocumentText, Setting2 } from 'iconsax-react'

const features = [
  { icon: MessageText1, title: 'محادثة ذكية بالعربي', desc: 'تكلم Deema بأي لهجة عربية — مصري، سعودي، خليجي — ويفهمك على طول. لا حاجة لأوامر محددة.' },
  { icon: Box, title: 'إدارة الطلبات', desc: 'اقبل وارفض وتابع طلباتك بجملة واحدة. Deema يتعامل مع الطلبات الجديدة والمعلقة والمكتملة.' },
  { icon: Truck, title: 'الشحن الذكي', desc: 'ينشئ بوالص الشحن تلقائياً مع أرامكس وSMSA وJ&T. يتابع حالة الشحنات ويبلغك بأي تأخير.' },
  { icon: ChartSquare, title: 'تقارير وتحليلات', desc: 'ملخص يومي وأسبوعي وشهري — مبيعات ومخزون وعملاء ومشاكل. كل شيء في مكان واحد.' },
  { icon: People, title: 'إدارة الفريق', desc: 'أضف أعضاء الفريق وحدد صلاحياتهم. كل عضو يرى فقط ما يحتاجه.' },
  { icon: Tag, title: 'الكوبونات والعروض', desc: 'أنشئ وأدر كوبونات الخصم والعروض الخاصة. تتبع الاستخدام وقيّم الأداء.' },
  { icon: ShieldTick, title: 'أمان وصلاحيات', desc: 'كل إجراء جماعي يطلب تأكيداً. لا تنفيذ مالي بدون موافقتك الصريحة.' },
  { icon: Flash, title: 'تنفيذ فوري', desc: 'يتصرف Deema في ثوانٍ — لا انتظار، لا تعقيد. فقط نتائج فورية.' },
  { icon: Global, title: 'ثلاث منصات', desc: 'Shopify وWuilt وShantaweb — ربط سريع بدون خبرة تقنية.' },
  { icon: Notification, title: 'إشعارات ذكية', desc: 'يبلغك بالطلبات الجديدة والمشاكل والتحديثات المهمة في الوقت الصح.' },
  { icon: DocumentText, title: 'فواتير وإيصالات', desc: 'يصدر الفواتير والإيصالات تلقائياً ويرسلها للعملاء بالبريد الإلكتروني.' },
  { icon: Setting2, title: 'إعدادات مرنة', desc: 'خصّص Deema حسب احتياجات متجرك — لغة، عملة، ساعات عمل، وأكثر.' },
]

export default function Features() {
  return (
    <PageLayout>

      <main style={{ padding: '64px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.05em', marginBottom: 16 }}>كل مميزات Deema</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5 }}>كل ما تحتاجه لإدارة متجرك بكفاءة — بجملة واحدة بالعربي</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--canvas-soft)',
              borderRadius: 16,
              padding: '24px',
              border: '1px solid var(--hairline)',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--canvas-soft-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={20} color="var(--ink)" variant="Outline" />
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

    </PageLayout>
  )
}
