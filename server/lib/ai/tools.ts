import type { Tool } from '@anthropic-ai/sdk/resources/messages.js'

export const DEEMA_TOOLS: Tool[] = [
  {
    name: 'get_orders',
    description: 'جلب قائمة الطلبات من قاعدة البيانات مع فلاتر اختيارية',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'shipped', 'delivered', 'all'], description: 'حالة الطلبات' },
        city: { type: 'string', description: 'فلتر بالمدينة' },
        payment: { type: 'string', description: 'فلتر بطريقة الدفع' },
        limit: { type: 'number', description: 'عدد النتائج (افتراضي 20)' },
        riskMin: { type: 'number', description: 'الحد الأدنى لدرجة المخاطرة' },
      },
      required: [],
    },
  },
  {
    name: 'accept_orders',
    description: 'قبول طلب أو مجموعة طلبات معلقة',
    input_schema: {
      type: 'object',
      properties: {
        orderIds: { type: 'array', items: { type: 'string' }, description: 'قائمة معرّفات الطلبات للقبول' },
      },
      required: ['orderIds'],
    },
  },
  {
    name: 'reject_order',
    description: 'رفض طلب معلق مع ذكر السبب',
    input_schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'معرّف الطلب' },
        reason: { type: 'string', description: 'سبب الرفض' },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'create_shipments',
    description: 'إنشاء شحنات للطلبات المقبولة',
    input_schema: {
      type: 'object',
      properties: {
        orderIds: { type: 'array', items: { type: 'string' }, description: 'معرّفات الطلبات للشحن' },
        carrier: { type: 'string', description: 'شركة الشحن (smsa, aramex, naqel)' },
      },
      required: ['orderIds'],
    },
  },
  {
    name: 'get_products',
    description: 'جلب قائمة المنتجات',
    input_schema: {
      type: 'object',
      properties: {
        lowStock: { type: 'boolean', description: 'إظهار المنتجات منخفضة المخزون فقط' },
        category: { type: 'string', description: 'فلتر بالتصنيف' },
        limit: { type: 'number' },
      },
      required: [],
    },
  },
  {
    name: 'update_product',
    description: 'تحديث سعر أو مخزون منتج',
    input_schema: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        price: { type: 'number', description: 'السعر الجديد بالهللة' },
        stock: { type: 'number', description: 'الكمية الجديدة' },
        percentChange: { type: 'number', description: 'تغيير نسبي في السعر (مثال: -10 يعني خصم 10%)' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'bulk_update_prices',
    description: 'تحديث أسعار مجموعة منتجات بنسبة مئوية',
    input_schema: {
      type: 'object',
      properties: {
        percentChange: { type: 'number', description: 'نسبة التغيير (+10 زيادة، -10 تخفيض)' },
        category: { type: 'string', description: 'تطبيق على تصنيف معين فقط' },
        productIds: { type: 'array', items: { type: 'string' } },
      },
      required: ['percentChange'],
    },
  },
  {
    name: 'get_analytics',
    description: 'تقرير مبيعات وتحليلات المتجر',
    input_schema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today', 'week', 'month', '7d', '30d', '90d'], description: 'الفترة الزمنية' },
      },
      required: [],
    },
  },
  {
    name: 'create_coupon',
    description: 'إنشاء كوبون خصم جديد',
    input_schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'رمز الكوبون' },
        type: { type: 'string', enum: ['percentage', 'fixed'], description: 'نوع الخصم' },
        value: { type: 'number', description: 'قيمة الخصم' },
        minOrder: { type: 'number', description: 'الحد الأدنى للطلب' },
        maxUsage: { type: 'number', description: 'الحد الأقصى للاستخدام' },
        expiresInDays: { type: 'number', description: 'ينتهي بعد كذا يوم' },
      },
      required: ['code', 'type', 'value'],
    },
  },
  {
    name: 'get_customers',
    description: 'جلب قائمة العملاء',
    input_schema: {
      type: 'object',
      properties: {
        segment: { type: 'string', enum: ['vip', 'loyal', 'regular', 'new', 'all'] },
        city: { type: 'string' },
        limit: { type: 'number' },
      },
      required: [],
    },
  },
  {
    name: 'get_notifications',
    description: 'جلب الإشعارات الأخيرة',
    input_schema: {
      type: 'object',
      properties: {
        unreadOnly: { type: 'boolean' },
        limit: { type: 'number' },
      },
      required: [],
    },
  },
  {
    name: 'get_ai_memory',
    description: 'استرجاع الذاكرة والرؤى المخزنة عن المتجر',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
]
