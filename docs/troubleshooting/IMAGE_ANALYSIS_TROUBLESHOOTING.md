# استكشاف أخطاء نظام تحليل الصور

## 🚨 **المشاكل الشائعة وحلولها**

### 1. **النظام يختار ألوان خاطئة**

#### الأعراض:
- العميل يرسل صورة كوتشي أبيض والنظام يختار "البيج"
- اختيار ألوان غير منطقية بناءً على الصورة

#### التشخيص:
```bash
# تحقق من سجلات اختيار الألوان
grep "COLOR-ANALYSIS" logs/app.log | tail -10
grep "COLOR-MATCH" logs/app.log | tail -10
```

#### الحلول:

##### الحل 1: تحقق من ترتيب الأولوية
```javascript
// في imageAnalysisService.js
const colorPriority = ['الابيض', 'الاسود', 'البيج'];
// تأكد من أن الترتيب صحيح
```

##### الحل 2: تحقق من تنويعات الألوان
```javascript
// تأكد من وجود تنويعات كافية
'الابيض': [
  'أبيض', 'ابيض', 'بيضاء', 'بيض', 'white',
  'أبيض ناصع', 'ناصع', 'فاتح جداً'
]
```

##### الحل 3: تحقق من طول النص المحلل
```javascript
// تأكد من تحليل الجزء الصحيح
const searchText = analysisText.substring(0, 500).toLowerCase();
```

### 2. **النظام لا يحلل الصور**

#### الأعراض:
- لا يرد على الصور المرسلة
- رسائل خطأ في السجلات

#### التشخيص:
```bash
# تحقق من سجلات تحليل الصور
grep "IMAGE-ANALYSIS" logs/app.log | tail -20
grep "Error.*image" logs/app.log | tail -10
```

#### الحلول:

##### الحل 1: تحقق من مفتاح Gemini API
```bash
# تحقق من متغيرات البيئة
echo $GEMINI_API_KEY
# يجب أن يكون موجود وصالح
```

##### الحل 2: تحقق من حالة خدمة Gemini
```javascript
// في aiAgentService.js
console.log('🔍 البحث عن مفتاح Gemini نشط...');
console.log('✅ تم العثور على نموذج متاح:', model);
```

##### الحل 3: تحقق من صيغة الصورة
```javascript
// تحقق من الصيغ المدعومة
const supportedFormats = ['jpg', 'jpeg', 'png', 'webp'];
```

### 3. **بطء في تحليل الصور**

#### الأعراض:
- تأخير طويل في الردود (أكثر من 30 ثانية)
- انتهاء مهلة الطلبات

#### التشخيص:
```bash
# تحقق من أوقات المعالجة
grep "processingTime" logs/app.log | tail -10
grep "AI response generated in" logs/app.log | tail -10
```

#### الحلول:

##### الحل 1: تحسين حجم الصور
```javascript
// ضغط الصور قبل التحليل
const maxImageSize = 5 * 1024 * 1024; // 5MB
```

##### الحل 2: استخدام نماذج أسرع
```javascript
// التبديل إلى نموذج أسرع
const fastModel = 'gemini-1.5-flash';
```

##### الحل 3: تحسين الشبكة
```bash
# تحقق من سرعة الاتصال
ping google.com
curl -w "@curl-format.txt" -o /dev/null -s "https://generativelanguage.googleapis.com"
```

### 4. **عدم العثور على المنتجات**

#### الأعراض:
- "لم يتم العثور على منتج مطابق"
- النظام لا يتعرف على المنتجات الموجودة

#### التشخيص:
```bash
# تحقق من تحميل المنتجات
grep "تم تحميل.*منتج" logs/app.log | tail -5
grep "RAG.*products" logs/app.log | tail -5
```

#### الحلول:

##### الحل 1: تحقق من قاعدة البيانات
```bash
# تشغيل فحص RAG
node check-rag.js
```

##### الحل 2: تحديث قاعدة المعرفة
```javascript
// في ragService.js
await this.updateKnowledgeBase();
```

##### الحل 3: تحقق من أوصاف المنتجات
```sql
-- تحقق من المنتجات في قاعدة البيانات
SELECT name, description FROM products WHERE isActive = true;
```

## 🔧 **أدوات التشخيص**

### 1. **فحص شامل للنظام**
```bash
# تشغيل فحص شامل
node check-rag.js
node test-image-analysis.js
```

### 2. **مراقبة السجلات المباشرة**
```bash
# مراقبة السجلات
tail -f logs/app.log | grep -E "(COLOR|IMAGE|ANALYSIS)"
```

### 3. **اختبار تحليل الصور**
```bash
# اختبار مع صورة محددة
curl -X POST http://localhost:3001/api/test/image-analysis \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/test-image.jpg"}'
```

## 📊 **مؤشرات المراقبة**

### مؤشرات الأداء الطبيعية:
- **وقت تحليل الصورة**: 10-20 ثانية
- **دقة اختيار الألوان**: 95%+
- **معدل نجاح التحليل**: 98%+
- **استهلاك الذاكرة**: < 500MB

### علامات التحذير:
- **وقت تحليل > 30 ثانية**: مشكلة في الشبكة أو API
- **دقة < 90%**: مشكلة في خوارزمية الألوان
- **معدل فشل > 5%**: مشكلة في النظام

## 🚨 **حالات الطوارئ**

### إيقاف تحليل الصور مؤقتاً:
```javascript
// في .env
IMAGE_ANALYSIS_ENABLED=false
```

### التبديل إلى وضع النص فقط:
```javascript
// في aiAgentService.js
const textOnlyMode = process.env.TEXT_ONLY_MODE === 'true';
```

### استخدام نسخة احتياطية:
```javascript
// في imageAnalysisService.js
if (primaryAnalysisService.isDown()) {
  return await backupAnalysisService.analyze(image);
}
```

## 📝 **سجلات مفيدة للتشخيص**

### سجلات اختيار الألوان:
```
🔍 [COLOR-ANALYSIS] Analyzing first 500 chars: الصورة تُظهر كوتشي...
🔍 [COLOR-CHECK] Checking variant: الابيض against analysis
🎯 [COLOR-MATCH] Found white color match: الابيض
```

### سجلات تحليل الصور:
```
📸 [IMAGE-ANALYSIS] Processing image: https://example.com/image.jpg
🤖 [AI-PROCESSING] Processing with AI Agent...
✅ AI response generated in 15522ms with RAG data
```

### سجلات الأخطاء:
```
❌ Error in generateAIResponse: [GoogleGenerativeAI Error]
❌ Error processing customer message: GoogleGenerativeAIFetchError
🔄 تم تجاوز حد النموذج، محاولة التبديل...
```

## 🔄 **إجراءات الاستعادة**

### 1. **إعادة تشغيل الخدمة**
```bash
# إعادة تشغيل النظام
pm2 restart chat-backend
# أو
npm run restart
```

### 2. **تنظيف الذاكرة المؤقتة**
```bash
# تنظيف cache
redis-cli FLUSHALL
# أو إعادة تشغيل Redis
sudo systemctl restart redis
```

### 3. **تحديث قاعدة المعرفة**
```javascript
// في وحدة التحكم
const ragService = require('./src/services/ragService');
await ragService.updateKnowledgeBase();
```

## 📞 **متى تطلب المساعدة**

### اطلب المساعدة الفورية إذا:
- معدل فشل التحليل > 20%
- النظام لا يرد على الصور نهائياً
- أخطاء مستمرة في API
- استهلاك ذاكرة غير طبيعي

### معلومات مطلوبة عند طلب المساعدة:
1. **وصف المشكلة**: ما يحدث بالضبط
2. **السجلات**: آخر 50 سطر من السجلات
3. **البيئة**: إعدادات النظام والمتغيرات
4. **الاختبارات**: ما تم تجربته من حلول

## ✅ **قائمة التحقق السريع**

### قبل الإبلاغ عن مشكلة:
- [ ] تحقق من السجلات
- [ ] تحقق من متغيرات البيئة
- [ ] اختبر مع صورة بسيطة
- [ ] تحقق من حالة الشبكة
- [ ] تحقق من حالة قاعدة البيانات
- [ ] جرب إعادة تشغيل الخدمة

### معلومات النظام:
- [ ] إصدار Node.js
- [ ] إصدار النظام
- [ ] حالة قاعدة البيانات
- [ ] حالة Redis
- [ ] مساحة القرص المتاحة

## 🎯 **نصائح للوقاية**

1. **مراقبة دورية**: فحص السجلات يومياً
2. **اختبارات منتظمة**: تشغيل اختبارات أسبوعية
3. **تحديثات منتظمة**: تحديث التبعيات شهرياً
4. **نسخ احتياطية**: نسخ احتياطية يومية لقاعدة البيانات
5. **مراقبة الأداء**: تتبع مؤشرات الأداء باستمرار

**💡 تذكر: الوقاية خير من العلاج!**
