# نظام تتبع أنظمة الذكاء الصناعي - AI Response Logging System

## نظرة عامة

تم إضافة نظام شامل لتتبع ومراقبة جميع أنظمة الذكاء الصناعي المختلفة في المشروع. هذا النظام يسمح بمعرفة أي نظام تم استخدامه لتوليد كل رد، مع إحصائيات مفصلة وواجهة مرئية.

## الأنظمة المتتبعة (5 أنظمة)

### 1. DirectGeminiAPI 🟢
- **الموقع**: Facebook webhook processing (السطر 1393)
- **الاستخدام**: الردود المباشرة عبر Facebook
- **المميزات**: استخدام مباشر لـ Gemini API
- **اللون في اللوج**: أخضر

### 2. AdvancedGeminiService 🔵
- **الموقع**: Auto-reply system & Advanced endpoints
- **الاستخدام**: الردود المتقدمة مع إدارة المفاتيح المتعددة
- **المميزات**: دعم عدة نماذج، إحصائيات مفصلة
- **اللون في اللوج**: أزرق

### 3. GeminiService 🔷
- **الموقع**: Basic AI endpoints
- **الاستخدام**: الردود الأساسية عبر API
- **المميزات**: خدمة أساسية للذكاء الصناعي
- **اللون في اللوج**: سماوي

### 4. SmartResponseService 🟣
- **الموقع**: Smart response endpoints
- **الاستخدام**: الردود الذكية المخصصة
- **المميزات**: ردود ذكية حسب السياق
- **اللون في اللوج**: بنفسجي

### 5. StaticFallback 🟡
- **الموقع**: Fallback responses
- **الاستخدام**: الردود الاحتياطية عند فشل الأنظمة الأخرى
- **المميزات**: ردود ثابتة آمنة
- **اللون في اللوج**: أصفر

## المميزات المضافة

### 1. AIResponseLogger Class
```javascript
const aiLogger = new AIResponseLogger();
```

**الوظائف الرئيسية:**
- `log(systemName, messageData, responseData, metadata)` - تسجيل الردود
- `getStats(hours)` - الحصول على إحصائيات
- `generateRequestId()` - توليد معرف فريد لكل طلب

### 2. ملف اللوج
- **المسار**: `backend/logs/ai-responses.log`
- **التنسيق**: JSON lines
- **المحتوى**: تفاصيل كاملة لكل رد

### 3. API Endpoints جديدة

#### GET /api/v1/ai/response-stats
```json
{
  "success": true,
  "data": {
    "totalResponses": 10,
    "systemUsage": {
      "AdvancedGeminiService": 5,
      "DirectGeminiAPI": 3,
      "GeminiService": 2
    },
    "averageResponseTime": 2500,
    "successRate": 95,
    "modelUsage": {
      "gemini-1.5-flash": 8,
      "gemini-2.5-flash": 2
    },
    "platformUsage": {
      "facebook": 6,
      "api": 4
    }
  }
}
```

#### GET /api/v1/ai/response-logs
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-07-21T04:58:56.552Z",
      "systemUsed": "AdvancedGeminiService",
      "requestId": "req_1753073936552_x4mjasnah",
      "message": {
        "content": "مرحباً",
        "customerId": "customer123",
        "platform": "facebook"
      },
      "response": {
        "content": "أهلاً وسهلاً!",
        "confidence": 0.8,
        "model": "gemini-1.5-flash",
        "responseTime": 1500
      }
    }
  ]
}
```

### 4. لوحة التحكم المرئية

**الرابط**: http://localhost:3001/ai-dashboard

**المميزات:**
- إحصائيات في الوقت الفعلي
- رسوم بيانية لاستخدام الأنظمة
- عرض آخر الردود
- تحديث تلقائي كل 30 ثانية
- واجهة عربية كاملة

## كيفية الاستخدام

### 1. مراقبة الردود في الكونسول
```
🤖 [AdvancedGeminiService] Response generated for message: "مرحباً، كيف يمكنني مساعدتك؟..."
   └─ Model: gemini-1.5-flash, Confidence: 0.8, Time: 1500ms
```

### 2. فحص ملف اللوج
```bash
tail -f backend/logs/ai-responses.log
```

### 3. استخدام API للإحصائيات
```javascript
// الحصول على إحصائيات آخر 24 ساعة
const stats = await fetch('/api/v1/ai/response-stats');

// الحصول على آخر 50 رد
const logs = await fetch('/api/v1/ai/response-logs?limit=50');

// فلترة حسب النظام
const advancedLogs = await fetch('/api/v1/ai/response-logs?system=AdvancedGeminiService');
```

## الاختبار

```bash
# تشغيل اختبار شامل
node test-ai-logging.js
```

## الفوائد

1. **تتبع دقيق**: معرفة أي نظام استخدم لكل رد
2. **تحليل الأداء**: مقارنة أداء الأنظمة المختلفة
3. **اكتشاف المشاكل**: رصد الأخطاء والردود الفاشلة
4. **تحسين النظام**: بيانات لاتخاذ قرارات التطوير
5. **مراقبة الاستخدام**: فهم أنماط استخدام الأنظمة

## ملاحظات مهمة

- النظام يعمل بدون تأثير على الأداء
- اللوجز محفوظة في ملفات منفصلة
- يمكن تخصيص فترة الإحصائيات
- واجهة المراقبة تعمل في الوقت الفعلي
- النظام متوافق مع جميع الأنظمة الموجودة

## التطوير المستقبلي

- إضافة تنبيهات عند فشل الأنظمة
- تصدير الإحصائيات إلى ملفات
- إضافة مرشحات متقدمة
- دمج مع أنظمة المراقبة الخارجية
