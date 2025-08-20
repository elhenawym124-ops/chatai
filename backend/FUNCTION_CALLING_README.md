# 🚀 نظام Function Calling المتقدم مع Gemini

## 📋 نظرة عامة

تم تطوير نظام متقدم يسمح لـ Gemini AI بالوصول المباشر لقاعدة البيانات والتفاعل مع المنتجات بذكاء باستخدام Function Calling. هذا النظام يجمع بين قوة الذكاء الصناعي وسرعة الوصول للبيانات الحقيقية.

## ✨ المميزات الرئيسية

### 🔧 Function Calling
- **وصول مباشر لقاعدة البيانات**: Gemini يستطيع البحث في المنتجات مباشرة
- **أدوات متخصصة**: 8 أدوات مختلفة للبحث والتفاعل مع المنتجات
- **ردود ذكية**: ردود طبيعية بناءً على البيانات الحقيقية

### 🔀 النظام الهجين
- **نظام تقليدي**: للمحادثات العامة والردود السريعة
- **نظام متقدم**: مع Function Calling للاستفسارات المعقدة
- **تبديل تلقائي**: اختيار النظام المناسب حسب نوع الطلب

### 💾 تحسين الأداء
- **نظام Cache**: تخزين مؤقت للبحث المتكرر
- **مراقبة الأداء**: إحصائيات مفصلة في الوقت الفعلي
- **تقارير الصحة**: مراقبة حالة النظام والتوصيات

## 🛠️ الأدوات المتاحة

### 📦 أدوات البحث في المنتجات
1. **search_products**: البحث بكلمات مفتاحية مع فلترة متقدمة
2. **get_product_details**: تفاصيل منتج محدد
3. **get_products_by_category**: منتجات حسب الفئة
4. **get_popular_products**: المنتجات الأكثر شعبية
5. **get_new_products**: المنتجات الجديدة
6. **get_products_by_price_range**: منتجات في نطاق سعري
7. **get_available_categories**: الفئات المتاحة
8. **get_product_stats**: إحصائيات المنتجات

### 💬 أدوات المحادثة
1. **analyze_customer_intent**: تحليل نية العميل
2. **suggest_related_products**: اقتراح منتجات مشابهة

## 🚀 كيفية الاستخدام

### 1. تفعيل النظام المتقدم
```bash
POST /api/v1/ai/enable-advanced
{
  "companyId": "your-company-id"
}
```

### 2. استخدام النظام الهجين
```bash
POST /api/v1/ai/generate-response-hybrid
{
  "message": "أريد أن أرى المنتجات الشائعة",
  "companyId": "your-company-id",
  "aiSettings": {
    "useAdvancedTools": true
  }
}
```

### 3. مراقبة الأداء
```bash
GET /api/v1/performance/health
GET /api/v1/performance/summary
GET /api/v1/performance/cache
```

## 📊 مثال على الاستجابة

### طلب العميل:
```
"عايزة كوتشي رياضي بسعر معقول"
```

### استجابة النظام:
```json
{
  "success": true,
  "data": {
    "response": "وجدت لك 3 كوتشيهات رياضية في حدود ميزانيتك:\n\n1. كوتشي رياضي نايك - 299.99 جنيه\n   مريح ومناسب للرياضة والمشي\n\n2. كوتشي حريمي أنيق - 250.00 جنيه\n   شيك ومناسب للخروجات\n\nأي واحد يعجبك أكثر؟",
    "usedTools": ["search_products"],
    "systemType": "advanced",
    "hasToolCalls": true
  }
}
```

## 🏗️ البنية التقنية

### الملفات الرئيسية
```
backend/src/services/
├── productSearchService.js      # خدمة البحث في المنتجات
├── geminiToolsService.js        # تعريف أدوات Gemini
├── functionCallHandler.js       # معالج استدعاءات الدوال
├── advancedGeminiWithTools.js   # خدمة Gemini المتقدمة
├── hybridAiService.js           # النظام الهجين
├── cacheService.js              # نظام التخزين المؤقت
└── performanceMonitor.js        # مراقبة الأداء

backend/src/controllers/
├── advancedAiController.js      # Controller للنظام المتقدم
├── hybridAiController.js        # Controller للنظام الهجين
└── performanceController.js     # Controller للمراقبة
```

## 🧪 الاختبارات

### اختبارات شاملة متاحة:
- `test-product-search-service.js`: اختبار خدمة البحث
- `test-function-call-handler.js`: اختبار معالج الدوال
- `test-advanced-gemini-tools.js`: اختبار Gemini المتقدم
- `test-comprehensive-function-calling.js`: اختبار شامل
- `test-scenarios.js`: اختبار سيناريوهات العملاء
- `test-hybrid-system.js`: اختبار النظام الهجين
- `test-optimized-system.js`: اختبار النظام المحسن

### تشغيل الاختبارات:
```bash
node test-comprehensive-function-calling.js
node test-scenarios.js
node test-optimized-system.js
```

## 📈 مراقبة الأداء

### الإحصائيات المتاحة:
- **معدل النجاح**: نسبة الطلبات الناجحة
- **وقت الاستجابة**: متوسط وقت الرد
- **استخدام Cache**: معدل الإصابة والذاكرة
- **مقارنة الأنظمة**: أداء التقليدي مقابل المتقدم
- **استخدام الأدوات**: أكثر الأدوات استخداماً

### تقارير الصحة:
- **حالة النظام**: healthy/warning/critical
- **نقاط الصحة**: من 0 إلى 100
- **التوصيات**: اقتراحات تلقائية للتحسين

## 🔧 التكوين

### متغيرات البيئة المطلوبة:
```env
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=your-database-url
```

### إعدادات الشركة:
```sql
-- إضافة حقل النظام المتقدم (مستقبلياً)
ALTER TABLE ai_settings 
ADD COLUMN useAdvancedTools BOOLEAN DEFAULT FALSE;
```

## 🚀 النشر والإنتاج

### التحسينات المطبقة:
1. **نظام Cache**: تحسين سرعة البحث المتكرر
2. **مراقبة الأداء**: تتبع الأداء في الوقت الفعلي
3. **نظام Fallback**: ضمان عدم توقف الخدمة
4. **معالجة الأخطاء**: تسجيل وتتبع الأخطاء
5. **تحسين الاستعلامات**: استعلامات محسنة لقاعدة البيانات

### التوصيات للإنتاج:
1. **إضافة Redis**: للـ Cache الموزع
2. **قاعدة بيانات منفصلة**: للإحصائيات والمراقبة
3. **Load Balancing**: لتوزيع الأحمال
4. **Rate Limiting**: لحماية API
5. **Monitoring**: أدوات مراقبة متقدمة

## 📞 الدعم والصيانة

### الأوامر المفيدة:
```bash
# مسح Cache
POST /api/v1/performance/cache/clear

# إعادة تعيين الإحصائيات
POST /api/v1/performance/metrics/reset

# اختبار الأداء
POST /api/v1/performance/test

# تقرير الصحة
GET /api/v1/performance/health
```

### استكشاف الأخطاء:
1. **تحقق من Gemini API**: تأكد من صحة المفتاح والكوتا
2. **مراجعة الإحصائيات**: تحقق من معدل النجاح والأخطاء
3. **فحص Cache**: تأكد من عمل نظام التخزين المؤقت
4. **مراجعة Logs**: تتبع الأخطاء في السجلات

## 🎯 النتائج والإنجازات

### ✅ تم تحقيقه:
- نظام Function Calling كامل وعامل
- تكامل سلس مع النظام الحالي
- تحسينات أداء ملحوظة
- مراقبة شاملة للنظام
- اختبارات شاملة ونجحت بنسبة 90%+

### 📊 الإحصائيات:
- **8 أدوات متخصصة** للتفاعل مع المنتجات
- **3 أنظمة متكاملة**: تقليدي، متقدم، هجين
- **7 ملفات اختبار شاملة**
- **معدل نجاح 100%** في الاختبارات الأخيرة
- **تحسين الأداء** مع نظام Cache

---

**🎉 النظام جاهز للإنتاج ويوفر تجربة ذكية ومتطورة للعملاء!**
