// ── Single source of truth for all subscription plans ─────────────────────────
// Used by: Landing, Pricing, Billing, Subscribe

export interface Plan {
  id: 'free' | 'starter' | 'growth' | 'pro' | 'enterprise'
  name: string
  price: number        // USD
  period: string
  color: string
  tag?: string         // badge text e.g. "الأكثر شعبية"
  featured?: boolean   // highlighted card
  features: string[]
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'مجاني',
    price: 0,
    period: 'للأبد',
    color: '#6b7280',
    features: [
      '١٠٠ طلب / شهر',
      '١ متجر',
      'جميع المنصات المتاحة',
      'محادثة ذكية بالعربي',
      'تقارير أساسية',
      'دعم أساسي',
    ],
  },
  {
    id: 'starter',
    name: 'المبتدئ',
    price: 99,
    period: '/ شهر',
    color: '#3b82f6',
    features: [
      '٥٠٠ طلب / شهر',
      '١ متجر',
      'جميع المنصات',
      'تقارير أساسية',
      'دعم بالبريد',
    ],
  },
  {
    id: 'growth',
    name: 'النمو',
    price: 249,
    period: '/ شهر',
    color: '#6a4cf5',
    tag: 'الأكثر شيوعاً',
    featured: true,
    features: [
      '٢,٠٠٠ طلب / شهر',
      '٢ متجر',
      'جميع المنصات',
      'تقارير متقدمة',
      'ذكاء اصطناعي كامل',
      'دعم أولوية',
    ],
  },
  {
    id: 'pro',
    name: 'الاحترافي',
    price: 499,
    period: '/ شهر',
    color: '#d44df0',
    features: [
      '١٠,٠٠٠ طلب / شهر',
      '٣ متاجر',
      'جميع المنصات',
      'API Access',
      'تصدير التقارير',
      'دعم مباشر ٢٤/٧',
    ],
  },
  {
    id: 'enterprise',
    name: 'المؤسسات',
    price: 999,
    period: '/ شهر',
    color: '#f59e0b',
    features: [
      'طلبات غير محدودة',
      'متاجر غير محدودة',
      'API Access كامل',
      'مدير حساب مخصص',
      'SLA 99.9%',
      'دعم مباشر ٢٤/٧',
    ],
  },
]

export function getPlan(id: string): Plan {
  return PLANS.find(p => p.id === id) ?? PLANS[0]
}
