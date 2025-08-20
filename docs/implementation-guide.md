# 🚀 دليل التطبيق العملي - نظام التبديل الذكي

## 📅 تاريخ الإنشاء: 1 أغسطس 2025

---

## 📋 نظرة عامة

هذا الدليل يوضح كيفية تطبيق نظام التبديل الذكي في مشاريع جديدة أو تحديث المشاريع الحالية.

---

## 🏗️ الهيكل الأساسي للنظام

### 1. الكلاس الرئيسي (AIAgentService)

```javascript
class AIAgentService {
  constructor() {
    // نموذج نشط للجلسة الحالية
    this.currentActiveModel = null;
    
    // ذاكرة مؤقتة للنماذج المستنفدة
    this.exhaustedModelsCache = new Map();
    
    // خدمات مساعدة
    this.ragService = null;
    this.learningService = null;
  }

  // الدوال الأساسية
  async getCurrentActiveModel() { }
  updateCurrentActiveModel(newModel) { }
  async findNextAvailableModel() { }
  async markModelAsExhausted(geminiConfig, error) { }
}
```

### 2. الدوال الأساسية المطلوبة

#### أ) إدارة النموذج النشط
```javascript
/**
 * الحصول على النموذج النشط الحالي
 * يحصل على النموذج من قاعدة البيانات مرة واحدة فقط
 */
async getCurrentActiveModel() {
  if (!this.currentActiveModel) {
    this.currentActiveModel = await this.getActiveGeminiKey();
  }
  return this.currentActiveModel;
}

/**
 * تحديث النموذج النشط (يُستخدم عند التبديل)
 */
updateCurrentActiveModel(newModel) {
  console.log(`🔄 [DEBUG] Updating current active model to: ${newModel?.model}`);
  this.currentActiveModel = newModel;
}
```

#### ب) آلية التبديل
```javascript
async generateAIResponse(prompt, conversationMemory = [], useRAG = false) {
  try {
    // الحصول على النموذج النشط
    const geminiConfig = await this.getCurrentActiveModel();
    
    if (!geminiConfig) {
      throw new Error('No active Gemini API key found');
    }

    // محاولة إنشاء الرد
    const aiContent = await this.callGeminiAPI(prompt, geminiConfig);
    return aiContent;
    
  } catch (error) {
    // فحص إذا كان خطأ استنفاد الحصة
    if (this.isQuotaExceededError(error)) {
      console.log('🔄 تم تجاوز حد النموذج، محاولة التبديل...');
      
      // تحديد النموذج كمستنفد
      await this.markModelAsExhausted(geminiConfig, error);
      
      // البحث عن نموذج بديل
      const backupModel = await this.findNextAvailableModel();
      
      if (backupModel) {
        console.log(`🔄 تم التبديل إلى نموذج بديل: ${backupModel.model}`);
        
        // تحديث النموذج النشط للجلسة
        this.updateCurrentActiveModel(backupModel);
        
        // تحديث عداد الاستخدام
        if (backupModel.modelId) {
          await this.updateModelUsage(backupModel.modelId);
        }
        
        // إعادة المحاولة بالنموذج الجديد
        return await this.callGeminiAPI(prompt, backupModel);
      }
    }
    
    throw error;
  }
}
```

#### ج) فحص أخطاء الحصة
```javascript
/**
 * فحص إذا كان الخطأ متعلق بتجاوز حصة الاستخدام
 */
isQuotaExceededError(error) {
  return error.message && (
    error.message.includes('429') ||
    error.message.includes('Too Many Requests') ||
    error.message.includes('quota') ||
    error.message.includes('exceeded')
  );
}
```

#### د) تسجيل النماذج المستنفدة
```javascript
async markModelAsExhausted(geminiConfig, error) {
  try {
    // استخراج الحد من رسالة الخطأ
    const quotaMatch = error.message.match(/"quotaValue":"(\d+)"/);
    const quotaLimit = quotaMatch ? parseInt(quotaMatch[1]) : null;
    
    if (quotaLimit) {
      console.log(`⚠️ تحديد النموذج ${geminiConfig.model} كمستنفد بناءً على خطأ 429...`);
      console.log(`✅ تم تحديد النموذج ${geminiConfig.model} كمستنفد (${quotaLimit}/${quotaLimit})`);
      
      // تحديث قاعدة البيانات
      const modelId = await this.getModelId(geminiConfig.keyId, geminiConfig.model);
      if (modelId) {
        await prisma.geminiModel.update({
          where: { id: modelId },
          data: {
            currentUsage: quotaLimit,
            lastExhaustedAt: new Date()
          }
        });
      }
      
      // إضافة للذاكرة المؤقتة
      const cacheKey = `${geminiConfig.keyId}_${geminiConfig.model}`;
      this.exhaustedModelsCache.set(cacheKey, {
        exhaustedAt: Date.now(),
        quotaLimit
      });
    }
  } catch (error) {
    console.error('❌ خطأ في تحديد النموذج كمستنفد:', error);
  }
}
```

---

## 🔧 خطوات التطبيق

### الخطوة 1: إضافة المتغيرات للكلاس

```javascript
class YourAIService {
  constructor() {
    // إضافة هذه المتغيرات
    this.currentActiveModel = null;
    this.exhaustedModelsCache = new Map();
  }
}
```

### الخطوة 2: إضافة الدوال الأساسية

انسخ الدوال التالية إلى كلاسك:
- `getCurrentActiveModel()`
- `updateCurrentActiveModel()`
- `isQuotaExceededError()`
- `markModelAsExhausted()`

### الخطوة 3: تحديث دالة إنشاء الردود

```javascript
// قبل التحديث
async generateResponse(prompt) {
  const config = await this.getActiveKey();
  return await this.callAPI(prompt, config);
}

// بعد التحديث
async generateResponse(prompt) {
  try {
    const config = await this.getCurrentActiveModel();
    return await this.callAPI(prompt, config);
  } catch (error) {
    if (this.isQuotaExceededError(error)) {
      // تطبيق آلية التبديل
      await this.markModelAsExhausted(config, error);
      const backupModel = await this.findNextAvailableModel();
      
      if (backupModel) {
        this.updateCurrentActiveModel(backupModel);
        return await this.callAPI(prompt, backupModel);
      }
    }
    throw error;
  }
}
```

### الخطوة 4: تحديث جميع الدوال الأخرى

```javascript
// قبل التحديث
async analyzeText(text, providedConfig = null) {
  const config = providedConfig || await this.getActiveKey();
  // باقي الكود...
}

// بعد التحديث
async analyzeText(text) {
  const config = await this.getCurrentActiveModel();
  // باقي الكود...
}
```

---

## 🧪 اختبار النظام

### 1. إنشاء ملف اختبار أساسي

```javascript
// test-switching.js
const YourAIService = require('./yourAIService');

async function testSwitching() {
  const aiService = new YourAIService();
  
  console.log('🧪 اختبار نظام التبديل...');
  
  try {
    // اختبار رسالة عادية
    const response = await aiService.generateResponse('مرحبا');
    console.log('✅ الرد:', response);
    
    // اختبار عدة رسائل للتأكد من الثبات
    for (let i = 0; i < 5; i++) {
      const testResponse = await aiService.generateResponse(`رسالة اختبار ${i + 1}`);
      console.log(`✅ رد ${i + 1}:`, testResponse.substring(0, 50) + '...');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testSwitching();
```

### 2. فحص اللوج

ابحث عن هذه الرسائل في اللوج:
```
🔄 تم تجاوز حد النموذج، محاولة التبديل...
✅ تم تحديد النموذج gemini-2.5-flash كمستنفد (250/250)
🔄 تم التبديل إلى نموذج بديل: gemini-2.0-flash
🔄 [DEBUG] Updating current active model to: gemini-2.0-flash
```

---

## 📊 مراقبة الأداء

### 1. إضافة مؤشرات الأداء

```javascript
class AIService {
  constructor() {
    this.currentActiveModel = null;
    this.exhaustedModelsCache = new Map();
    
    // مؤشرات الأداء
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      switchingEvents: 0,
      averageResponseTime: 0
    };
  }

  async generateResponse(prompt) {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;
    
    try {
      const response = await this.callAPI(prompt);
      this.performanceMetrics.successfulRequests++;
      
      // حساب متوسط زمن الاستجابة
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);
      
      return response;
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        this.performanceMetrics.switchingEvents++;
        // آلية التبديل...
      }
      throw error;
    }
  }

  updateAverageResponseTime(newTime) {
    const total = this.performanceMetrics.averageResponseTime * this.performanceMetrics.successfulRequests;
    this.performanceMetrics.averageResponseTime = (total + newTime) / this.performanceMetrics.successfulRequests;
  }

  getPerformanceReport() {
    const successRate = (this.performanceMetrics.successfulRequests / this.performanceMetrics.totalRequests) * 100;
    
    return {
      totalRequests: this.performanceMetrics.totalRequests,
      successRate: `${successRate.toFixed(2)}%`,
      switchingEvents: this.performanceMetrics.switchingEvents,
      averageResponseTime: `${this.performanceMetrics.averageResponseTime.toFixed(0)}ms`
    };
  }
}
```

### 2. تقرير دوري للأداء

```javascript
// إضافة تقرير كل 100 طلب
if (this.performanceMetrics.totalRequests % 100 === 0) {
  console.log('📊 تقرير الأداء:', this.getPerformanceReport());
}
```

---

## 🔧 التخصيص والتوسيع

### 1. إضافة نماذج جديدة

```javascript
// في قاعدة البيانات
const newModels = [
  { name: 'gemini-3.0-flash', dailyLimit: 1000000 },
  { name: 'gemini-3.0-pro', dailyLimit: 500000 }
];

// في الكود
async findNextAvailableModel() {
  // البحث يشمل النماذج الجديدة تلقائياً
  const availableModels = await this.getAllAvailableModels();
  // باقي المنطق...
}
```

### 2. إضافة أولويات للنماذج

```javascript
const modelPriorities = {
  'gemini-2.5-pro': 1,      // أولوية عالية
  'gemini-2.5-flash': 2,    // أولوية متوسطة
  'gemini-2.0-flash': 3,    // أولوية منخفضة
  'gemini-1.5-pro': 4       // أولوية احتياطية
};

async findNextAvailableModel() {
  const models = await this.getAllAvailableModels();
  
  // ترتيب حسب الأولوية
  models.sort((a, b) => modelPriorities[a.name] - modelPriorities[b.name]);
  
  // اختيار أول نموذج متاح
  for (const model of models) {
    if (await this.isModelHealthy(model)) {
      return model;
    }
  }
  
  return null;
}
```

### 3. إضافة إشعارات للمطورين

```javascript
async markModelAsExhausted(geminiConfig, error) {
  // الكود الأساسي...
  
  // إرسال إشعار للمطورين
  await this.sendDeveloperNotification({
    type: 'MODEL_EXHAUSTED',
    model: geminiConfig.model,
    keyId: geminiConfig.keyId,
    timestamp: new Date(),
    quotaLimit: quotaLimit
  });
}

async sendDeveloperNotification(data) {
  // يمكن إرسال عبر Slack, Email, أو Webhook
  console.log('🚨 [ALERT] Model exhausted:', data);
  
  // مثال: إرسال webhook
  try {
    await fetch('https://your-monitoring-system.com/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('❌ فشل إرسال الإشعار:', error);
  }
}
```

---

## 🚀 نصائح للإنتاج

### 1. إعدادات الأمان
```javascript
// حد أقصى لمحاولات التبديل
const MAX_SWITCHING_ATTEMPTS = 3;
let switchingAttempts = 0;

if (switchingAttempts >= MAX_SWITCHING_ATTEMPTS) {
  throw new Error('تم تجاوز الحد الأقصى لمحاولات التبديل');
}
```

### 2. تنظيف الذاكرة المؤقتة
```javascript
// تنظيف النماذج المستنفدة كل 24 ساعة
setInterval(() => {
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  for (const [key, value] of this.exhaustedModelsCache.entries()) {
    if (value.exhaustedAt < oneDayAgo) {
      this.exhaustedModelsCache.delete(key);
      console.log(`🧹 تم حذف ${key} من الذاكرة المؤقتة`);
    }
  }
}, 60 * 60 * 1000); // كل ساعة
```

### 3. مراقبة الصحة
```javascript
// فحص دوري لصحة النماذج
setInterval(async () => {
  const currentModel = await this.getCurrentActiveModel();
  if (currentModel && !(await this.isModelHealthy(currentModel))) {
    console.log('⚠️ النموذج الحالي غير صحي، البحث عن بديل...');
    const backupModel = await this.findNextAvailableModel();
    if (backupModel) {
      this.updateCurrentActiveModel(backupModel);
    }
  }
}, 5 * 60 * 1000); // كل 5 دقائق
```

---

*هذا الدليل يوفر كل ما تحتاجه لتطبيق نظام التبديل الذكي في مشروعك. اتبع الخطوات بالترتيب وستحصل على نظام موثوق وقابل للتوسيع.*
