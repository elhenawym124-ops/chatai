# 🤖 دليل الذكاء الاصطناعي للتطوير
## AI Developer Assistant Guide

## 📋 **تعليمات للذكاء الاصطناعي**

إذا كنت ذكاء اصطناعي يعمل على هذا المشروع، **ابدأ دائماً بقراءة هذه الملفات بالترتيب:**

### **🔍 الملفات الأساسية المطلوبة (اقرأها أولاً):**

```bash
# 1. فهم النظام العام
docs/architecture/SYSTEM_OVERVIEW.md
docs/architecture/SYSTEM_ARCHITECTURE.md

# 2. فهم نظام الذكاء الاصطناعي
docs/ai-system/AI_SYSTEM_OVERVIEW.md
docs/prompt-system/PROMPT_SYSTEM.md

# 3. فهم بنية الكود
backend/src/services/aiAgentService.js
backend/src/services/ragService.js
backend/src/services/memoryService.js

# 4. فهم قاعدة البيانات
backend/prisma/schema.prisma

# 5. فهم الواجهة الأمامية
frontend/src/pages/ai-management.tsx
frontend/src/components/ai/PromptManager.tsx
```

### **📁 هيكل المشروع الأساسي:**

```
المشروع/
├── backend/                     # خادم Node.js
│   ├── src/
│   │   ├── services/           # خدمات الأعمال
│   │   │   ├── aiAgentService.js      # ⭐ الخدمة الرئيسية للذكاء الاصطناعي
│   │   │   ├── ragService.js          # ⭐ نظام استرجاع المعلومات
│   │   │   ├── memoryService.js       # ⭐ نظام الذاكرة
│   │   │   └── facebookService.js     # تكامل فيسبوك
│   │   ├── routes/             # مسارات API
│   │   │   ├── ai.js                  # ⭐ مسارات الذكاء الاصطناعي
│   │   │   └── webhooks.js            # webhooks فيسبوك
│   │   └── middleware/         # وسطاء Express
│   ├── prisma/
│   │   └── schema.prisma              # ⭐ مخطط قاعدة البيانات
│   └── package.json
├── frontend/                   # تطبيق React
│   ├── src/
│   │   ├── pages/
│   │   │   └── ai-management.tsx      # ⭐ صفحة إدارة الذكاء الاصطناعي
│   │   ├── components/
│   │   │   └── ai/
│   │   │       ├── PromptManager.tsx  # ⭐ إدارة البرومبت
│   │   │       └── AISettings.tsx     # إعدادات الذكاء الاصطناعي
│   │   └── services/
│   │       └── api.ts                 # خدمات API
│   └── package.json
└── docs/                       # التوثيق
    ├── AI_DEVELOPER_GUIDE.md          # ⭐ هذا الملف
    ├── architecture/
    ├── ai-system/
    └── troubleshooting/
```

## 🎯 **المفاهيم الأساسية**

### **1. نظام البرومبت (Prompt System):**
```javascript
// ترتيب الأولويات:
// 1. system_prompts (أعلى أولوية) - البرومبت من صفحة الإدارة
// 2. ai_settings - إعدادات الشركة
// 3. company - برومبت قديم
// 4. default - برومبت افتراضي

async getCompanyPrompts(companyId) {
  // يبحث في الجداول بالترتيب أعلاه
  // يرجع البرومبت الأول الموجود
}
```

### **2. نظام RAG (Retrieval-Augmented Generation):**
```javascript
// يبحث في:
// - products (المنتجات)
// - faqs (الأسئلة الشائعة)  
// - policies (السياسات)

async retrieveRelevantData(query, intent, customerId) {
  // يحلل النية ويبحث في البيانات المناسبة
}
```

### **3. نظام الذاكرة (Memory System):**
```javascript
// نوعان من الذاكرة:
// - قصيرة المدى: آخر 5-10 رسائل
// - طويلة المدى: تاريخ العميل الكامل

async getConversationMemory(conversationId, senderId, limit = 5)
```

### **4. تدفق معالجة الرسائل:**
```
رسالة العميل → AI Agent → getCompanyPrompts → RAG → Memory → buildAdvancedPrompt → Gemini → الرد
```

## 🔧 **قواعد التطوير المهمة**

### **⚠️ لا تفعل هذا:**
- ❌ لا تعدل مخطط قاعدة البيانات بدون فهم العلاقات
- ❌ لا تغير ترتيب أولويات البرومبت
- ❌ لا تحذف التسجيل (logging) الموجود
- ❌ لا تعدل منطق RAG بدون فهم كامل

### **✅ افعل هذا:**
- ✅ اقرأ الملفات المطلوبة أولاً
- ✅ احتفظ بالتسجيل المفصل
- ✅ اختبر التغييرات قبل التطبيق
- ✅ اتبع نمط الكود الموجود

### **🧪 قبل أي تعديل:**
```javascript
// 1. فهم الكود الحالي
console.log('🔍 Current system state:', currentState);

// 2. اختبار الوظيفة الحالية
const testResult = await testCurrentFunction();

// 3. تطبيق التعديل
const newResult = await applyModification();

// 4. مقارنة النتائج
console.log('📊 Before vs After:', { testResult, newResult });
```

## 📝 **أمثلة شائعة للمهام**

### **1. إضافة ميزة جديدة للذكاء الاصطناعي:**
```bash
# اقرأ هذه الملفات أولاً:
backend/src/services/aiAgentService.js     # فهم الخدمة الحالية
docs/ai-system/AI_SYSTEM_OVERVIEW.md      # فهم النظام
docs/prompt-system/PROMPT_SYSTEM.md       # فهم البرومبت

# ثم:
# 1. أضف الوظيفة الجديدة
# 2. حدث التوثيق
# 3. أضف اختبارات
```

### **2. تحسين نظام RAG:**
```bash
# اقرأ هذه الملفات أولاً:
backend/src/services/ragService.js        # الخدمة الحالية
backend/prisma/schema.prisma              # بنية البيانات
docs/ai-system/AI_SYSTEM_OVERVIEW.md      # فهم التكامل

# ثم:
# 1. فهم منطق البحث الحالي
# 2. اختبر الأداء الحالي
# 3. طبق التحسينات تدريجياً
```

### **3. إضافة برومبت جديد:**
```bash
# اقرأ هذه الملفات أولاً:
docs/prompt-system/PROMPT_SYSTEM.md       # فهم النظام
backend/src/services/aiAgentService.js    # فهم التطبيق
frontend/src/pages/ai-management.tsx      # فهم الواجهة

# ثم:
# 1. أضف البرومبت في قاعدة البيانات
# 2. اختبر التفعيل
# 3. تأكد من الأولويات
```

## 🚨 **تحذيرات مهمة**

### **🔥 ملفات حساسة - تعامل بحذر:**
```bash
backend/src/services/aiAgentService.js    # قلب النظام
backend/prisma/schema.prisma              # بنية قاعدة البيانات
backend/src/routes/webhooks.js            # تكامل فيسبوك
.env                                       # متغيرات البيئة
```

### **⚡ اختبار إجباري قبل التعديل:**
```bash
# اختبر النظام الحالي
npm test                                   # اختبارات الوحدة
node test-ai-system.js                    # اختبار الذكاء الاصطناعي
curl http://localhost:3001/api/health     # اختبار الخادم
```

### **📊 مراقبة الأداء:**
```bash
# راقب هذه المؤشرات:
- وقت الاستجابة (< 5 ثوان)
- دقة الردود (> 90%)
- استهلاك الذاكرة (< 1GB)
- استخدام Gemini API (ضمن الحصة)
```

## 🎯 **نصائح للذكاء الاصطناعي**

### **1. عند قراءة الكود:**
```javascript
// ابحث عن هذه الأنماط:
console.log('🔍', '✅', '❌', '📝', '⚡')  // رموز التسجيل
async/await                                // العمليات غير المتزامنة
try/catch                                  // معالجة الأخطاء
prisma.                                    // استعلامات قاعدة البيانات
```

### **2. عند كتابة كود جديد:**
```javascript
// اتبع هذا النمط:
console.log('🔍 Starting new function...');
try {
  const result = await newFunction();
  console.log('✅ Function completed successfully');
  return result;
} catch (error) {
  console.error('❌ Function failed:', error.message);
  throw error;
}
```

### **3. عند التعديل:**
```javascript
// احتفظ بالكود القديم كتعليق:
// OLD CODE:
// const oldResult = oldFunction();

// NEW CODE:
const newResult = await newFunction();
console.log('📝 Updated function with new logic');
```

## 📞 **عند الحاجة للمساعدة**

### **مراجع سريعة:**
```bash
docs/troubleshooting/COMMON_ISSUES.md     # مشاكل شائعة
docs/FAQ.md                               # أسئلة شائعة
docs/COMPREHENSIVE_INDEX.md               # فهرس شامل
```

### **أدوات التشخيص:**
```bash
# فحص صحة النظام
curl http://localhost:3001/api/health

# فحص قاعدة البيانات
npx prisma studio

# فحص اللوج
tail -f backend/logs/app.log
```

---

## 🎯 **خلاصة للذكاء الاصطناعي**

**قبل أي عمل على المشروع:**

1. **📖 اقرأ الملفات الأساسية** المذكورة أعلاه
2. **🔍 افهم السياق** والهدف من التعديل
3. **🧪 اختبر النظام الحالي** قبل التعديل
4. **📝 وثق التغييرات** التي ستقوم بها
5. **⚡ طبق التعديلات تدريجياً** مع الاختبار
6. **✅ تأكد من عمل النظام** بعد التعديل

**هذا سيضمن عدم حدوث أخطاء وفهم صحيح للمطلوب! 🎉**
