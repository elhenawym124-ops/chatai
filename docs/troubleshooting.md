# 🔧 دليل استكشاف الأخطاء - Troubleshooting Guide

## 📅 **تاريخ التحديث:** 12 أغسطس 2025

---

## 🎛️ **مشاكل نظام التحكم في الأنماط - الإصدار 2.2.0**

### **❌ أخطاء JavaScript Syntax**

#### المشكلة: `Unexpected token ','`
```
SyntaxError: Unexpected token ','
```

**السبب:** فواصل خاطئة في class methods

**الحل:**
```javascript
// ❌ خطأ
class MyClass {
  async method1() {
    return 'test';
  },  // فاصلة خاطئة
}

// ✅ صحيح
class MyClass {
  async method1() {
    return 'test';
  }  // بدون فاصلة
}
```

#### المشكلة: `Function is not defined`
```
successAnalyticsAPI.getPatternPerformance is not a function
```

**الحل:**
1. تأكد من وجود الدالة في `successAnalyticsAPI.js`
2. إعادة تحميل الصفحة (Ctrl+F5)
3. مسح cache المتصفح

### **🔗 مشاكل APIs الجديدة**

#### المشكلة: `Cannot GET /system/status`
**الحل:**
```bash
# إعادة تشغيل الخادم
cd backend
node server.js
```

#### المشكلة: النظام لا يستجيب للتفعيل/الإيقاف
**التشخيص:**
```javascript
// فحص حالة النظام
const status = await successAnalyticsAPI.getPatternSystemStatus();
console.log('حالة النظام:', status);
```

---

## 🚨 **المشاكل الشائعة وحلولها السريعة**

### **1️⃣ النظام لا يسجل استخدام الأنماط**

**🔍 الأعراض:**
- الواجهة تظهر عدد استخدامات قليل (7 أو أقل)
- لا تظهر رسائل التسجيل في اللوج
- معدل النجاح غير واقعي (95%+)

**🔧 الحل السريع:**
```bash
# 1. إعادة تشغيل الخادم
Ctrl+C
npm start

# 2. مراقبة اللوج للتأكد من ظهور:
# 📊 [AIAgent] Recording usage for X patterns
# ✅ [AIAgent] Successfully recorded usage for X patterns
```

**🔍 التحقق من الحل:**
```bash
# فحص API للتأكد من زيادة العداد
curl -X GET "http://localhost:3001/api/v1/success-learning/pattern-performance?companyId=cme4yvrco002kuftceydlrwdi"
```

---

### **2️⃣ النظام يفهم السياق خطأ**

**🔍 الأعراض:**
- العميل يقول "اه يا ريت" ويفهمها النظام كتأكيد طلب
- ردود غير مناسبة للسياق
- فهم خاطئ للمقاصد

**🔧 الحل:**
```javascript
// تحقق من آخر تحديث لمنطق اكتشاف التأكيد
// في ملف: backend/src/services/aiAgentService.js
// السطر: 1570-1632

// يجب أن يحتوي على قواعد السياق الجديدة:
// 1️⃣ إذا كان آخر رد يسأل عن معلومات إضافية
// 2️⃣ إذا كان آخر رد يطلب تأكيد صريح
```

**🧪 اختبار الحل:**
```
محادثة اختبار:
1. العميل: "بكام الكوتشي؟"
2. النظام: "السعر 349 جنيه. تحب تعرف المقاسات؟"
3. العميل: "اه يا ريت"
4. النظام: يجب أن يعطي معلومات المقاسات (ليس تأكيد طلب)
```

---

### **3️⃣ تضارب البيانات بين الواجهة والـ API**

**🔍 الأعراض:**
- الواجهة تظهر: 95% نجاح، 10 استخدامات
- API يظهر: 58% نجاح، 7 استخدامات
- أرقام مختلفة في أماكن مختلفة

**🔧 الحل:**
```bash
# تشغيل سكريبت إصلاح البيانات
cd backend
node fix-pattern-usage-tracking.js
```

**🔍 التحقق:**
```bash
# مقارنة البيانات من مصادر مختلفة
curl -X GET "http://localhost:3001/api/v1/success-learning/pattern-performance"
# يجب أن تطابق البيانات في الواجهة
```

---

## ⚡ **مشاكل الأداء**

### **1️⃣ بطء في الاستجابة**

**🔍 الأعراض:**
- وقت استجابة أكثر من 60 ثانية
- رسائل timeout في اللوج
- العملاء يشتكون من البطء

**🔧 الحلول:**

#### **أ. فحص حدود Gemini API:**
```bash
# البحث في اللوج عن:
# ❌ Error: [429 Too Many Requests]
# 🔄 تم تجاوز حد النموذج

# الحل: ترقية خطة Gemini أو إضافة مفاتيح إضافية
```

#### **ب. تحسين قاعدة البيانات:**
```sql
-- فحص الاستعلامات البطيئة
EXPLAIN ANALYZE SELECT * FROM "Message" WHERE "conversationId" = 'xxx';

-- إضافة فهارس إذا لزم الأمر
CREATE INDEX idx_message_conversation ON "Message"("conversationId");
```

#### **ج. مراقبة الذاكرة:**
```bash
# فحص استهلاك الذاكرة
top -p $(pgrep node)

# إعادة تشغيل إذا كان الاستهلاك عالي
pm2 restart all
```

---

### **2️⃣ أخطاء في الاتصال**

**🔍 الأعراض:**
```
❌ Error getting Facebook user info: Request failed with status code 400
❌ Connection timeout
❌ ECONNREFUSED
```

**🔧 الحلول:**

#### **أ. أخطاء Facebook API:**
```javascript
// هذه أخطاء طبيعية - النظام يتعامل معها
// لا تحتاج إجراء إلا إذا كانت تؤثر على الأداء

// للتقليل من الرسائل:
// تحديث مستوى التسجيل في الكود
console.log(`ℹ️ [Facebook] User ${userId} info not accessible`);
// بدلاً من console.error
```

#### **ب. أخطاء قاعدة البيانات:**
```bash
# فحص حالة قاعدة البيانات
npx prisma db pull

# إعادة الاتصال
npx prisma generate
```

---

## 🔧 **مشاكل التكوين**

### **1️⃣ متغيرات البيئة مفقودة**

**🔍 الأعراض:**
```
❌ Error: Environment variable GEMINI_API_KEY is not defined
❌ Database connection failed
```

**🔧 الحل:**
```bash
# فحص ملف .env
cat .env

# التأكد من وجود المتغيرات المطلوبة:
DATABASE_URL=
GEMINI_API_KEY_1=
FACEBOOK_PAGE_ACCESS_TOKEN=
WEBHOOK_VERIFY_TOKEN=
```

---

### **2️⃣ مشاكل قاعدة البيانات**

**🔍 الأعراض:**
```
prisma:error Invalid `prisma.message.create()` invocation
Foreign key constraint violated
```

**🔧 الحل:**
```bash
# إعادة تطبيق المخططات
npx prisma migrate reset
npx prisma migrate dev

# إعادة إنشاء العميل
npx prisma generate
```

---

## 📊 **أدوات التشخيص**

### **1️⃣ فحص حالة النظام**

```bash
# فحص الخدمات
curl -X GET "http://localhost:3001/api/v1/health"

# فحص قاعدة البيانات
npx prisma db pull

# فحص الذاكرة والمعالج
htop
```

### **2️⃣ مراقبة اللوج**

```bash
# مراقبة اللوج في الوقت الفعلي
tail -f logs/app.log

# البحث عن أخطاء محددة
grep "ERROR" logs/app.log | tail -20

# فحص أداء الأنماط
grep "Pattern" logs/app.log | tail -10
```

### **3️⃣ اختبار الـ API**

```bash
# اختبار الأنماط
curl -X GET "http://localhost:3001/api/v1/success-learning/patterns"

# اختبار الأداء
curl -X GET "http://localhost:3001/api/v1/success-learning/pattern-performance"

# اختبار الذكاء الاصطناعي
curl -X POST "http://localhost:3001/api/v1/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "مرحبا"}'
```

---

## 🚨 **حالات الطوارئ**

### **1️⃣ النظام متوقف تماماً**

```bash
# 1. فحص العمليات
ps aux | grep node

# 2. قتل العمليات المعلقة
pkill -f node

# 3. إعادة تشغيل كاملة
npm start

# 4. فحص اللوج للأخطاء
tail -f logs/app.log
```

### **2️⃣ قاعدة البيانات تالفة**

```bash
# 1. نسخ احتياطي فوري
pg_dump chatbot_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. إعادة تطبيق المخططات
npx prisma migrate reset --force

# 3. استرداد البيانات من النسخة الاحتياطية
psql chatbot_db < backup_latest.sql
```

### **3️⃣ استهلاك مفرط للموارد**

```bash
# 1. فحص الاستهلاك
top -p $(pgrep node)

# 2. إعادة تشغيل الخدمة
pm2 restart all

# 3. تنظيف الذاكرة
echo 3 > /proc/sys/vm/drop_caches
```

---

## 📞 **الحصول على المساعدة**

### **🔍 قبل طلب المساعدة:**
1. ✅ راجع هذا الدليل
2. ✅ فحص [المشاكل المعروفة](./known-issues.md)
3. ✅ جرب الحلول السريعة
4. ✅ اجمع معلومات التشخيص

### **📋 معلومات مطلوبة عند طلب المساعدة:**
- **الوقت:** متى حدثت المشكلة؟
- **الخطوات:** كيف يمكن إعادة إنتاج المشكلة؟
- **اللوج:** آخر 50 سطر من اللوج
- **البيئة:** إنتاج أم تطوير؟
- **الإصدار:** أي إصدار من النظام؟

### **📧 قنوات الدعم:**
- **الدعم التقني:** support@example.com
- **المطورين:** developers@example.com
- **الطوارئ:** emergency@example.com

---

## 📚 **موارد إضافية**

### **📖 التوثيق:**
- [دليل المطور](./developer-guide.md)
- [نظام الأنماط](./pattern-system.md)
- [الأسئلة الشائعة](./faq.md)

### **🔗 روابط مفيدة:**
- [Prisma Documentation](https://www.prisma.io/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)

---

*هذا الدليل يتم تحديثه باستمرار مع اكتشاف مشاكل جديدة وحلولها*
