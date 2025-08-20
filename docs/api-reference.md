# 📚 مرجع APIs الكامل - نظام إدارة الأنماط

## 🎛️ APIs التحكم في النظام

### 1. تفعيل النظام
```http
POST /api/v1/success-learning/system/enable
```

**المعاملات:**
```json
{
  "companyId": "string" // معرف الشركة
}
```

**الاستجابة:**
```json
{
  "success": true,
  "message": "تم تفعيل نظام إدارة الأنماط بنجاح",
  "data": {
    "enabled": true,
    "enabledAt": "2025-08-12T09:00:13.180Z",
    "enabledBy": "admin",
    "patternsEnabled": 11
  }
}
```

### 2. إيقاف النظام
```http
POST /api/v1/success-learning/system/disable
```

**المعاملات:**
```json
{
  "companyId": "string", // معرف الشركة
  "reason": "string"     // سبب الإيقاف (اختياري)
}
```

**الاستجابة:**
```json
{
  "success": true,
  "message": "تم إيقاف نظام إدارة الأنماط بنجاح",
  "data": {
    "enabled": false,
    "disabledAt": "2025-08-12T09:00:12.117Z",
    "disabledBy": "admin",
    "reason": "تم الإيقاف يدوياً",
    "patternsDisabled": 113
  }
}
```

### 3. حالة النظام
```http
GET /api/v1/success-learning/system/status?companyId=company_id
```

**الاستجابة:**
```json
{
  "success": true,
  "message": "تم جلب حالة النظام بنجاح",
  "data": {
    "enabled": true,
    "totalPatterns": 113,
    "activePatterns": 11,
    "approvedPatterns": 11,
    "inactivePatterns": 102,
    "lastChange": "2025-08-12T09:00:13.180Z",
    "changedBy": "admin",
    "disableReason": null
  }
}
```

## 🔧 APIs إدارة الأنماط

### 4. إيقاف اعتماد نمط
```http
PUT /api/v1/success-learning/patterns/{patternId}/unapprove
```

**المعاملات:**
```json
{
  "reason": "string" // سبب إيقاف الاعتماد
}
```

### 5. اختبار نمط
```http
POST /api/v1/success-learning/test-pattern
```

**المعاملات:**
```json
{
  "patternId": "string",
  "testMessage": "string",
  "companyId": "string"
}
```

## 📊 Frontend APIs

### JavaScript Functions

#### نظام التحكم
```javascript
// تفعيل النظام
await successAnalyticsAPI.enablePatternSystem(companyId);

// إيقاف النظام
await successAnalyticsAPI.disablePatternSystem(companyId, reason);

// حالة النظام
const status = await successAnalyticsAPI.getPatternSystemStatus(companyId);
```

#### إدارة الأنماط
```javascript
// جلب الأنماط
const patterns = await successAnalyticsAPI.getPatterns(options);

// اعتماد نمط
await successAnalyticsAPI.approvePattern(patternId, approvedBy);

// إيقاف اعتماد نمط
await successAnalyticsAPI.unapprovePattern(patternId, reason);

// رفض نمط
await successAnalyticsAPI.rejectPattern(patternId);

// اختبار نمط
const result = await successAnalyticsAPI.testPattern(patternId, message, companyId);
```

#### الإحصائيات
```javascript
// إحصائيات النتائج
const stats = await successAnalyticsAPI.getOutcomeStats(timeRange);

// أداء الأنماط
const performance = await successAnalyticsAPI.getPatternPerformance(companyId);

// استخدام الأنماط
const usage = await successAnalyticsAPI.getPatternUsage(options);

// إحصائيات سريعة
const quickStats = await successAnalyticsAPI.getQuickStats();
```

#### التحليل
```javascript
// تحليل أنماط جديدة
await successAnalyticsAPI.analyzeNewPatterns();

// اكتشاف أنماط جديدة
const newPatterns = await successAnalyticsAPI.detectNewPatterns(timeRange);

// تحليل شامل
const analysis = await successAnalyticsAPI.runComprehensiveAnalysis(options);
```

#### البيانات
```javascript
// جلب جميع البيانات
const allData = await successAnalyticsAPI.getAllData(timeRange);

// تصدير البيانات
const csvData = await successAnalyticsAPI.exportData('csv', timeRange);

// تسجيل نتيجة
await successAnalyticsAPI.recordOutcome(outcomeData);
```

## 🎯 أمثلة الاستخدام

### مثال كامل - تفعيل النظام
```javascript
try {
  // فحص الحالة الحالية
  const currentStatus = await successAnalyticsAPI.getPatternSystemStatus();
  console.log('حالة النظام:', currentStatus.enabled ? 'مفعل' : 'معطل');
  
  if (!currentStatus.enabled) {
    // تفعيل النظام
    await successAnalyticsAPI.enablePatternSystem();
    console.log('تم تفعيل النظام بنجاح');
    
    // فحص الحالة الجديدة
    const newStatus = await successAnalyticsAPI.getPatternSystemStatus();
    console.log('الأنماط النشطة:', newStatus.activePatterns);
  }
} catch (error) {
  console.error('خطأ:', error.message);
}
```

### مثال - إيقاف النظام مع سبب
```javascript
try {
  await successAnalyticsAPI.disablePatternSystem(
    'cme4yvrco002kuftceydlrwdi', 
    'صيانة النظام'
  );
  console.log('تم إيقاف النظام للصيانة');
} catch (error) {
  console.error('فشل في إيقاف النظام:', error.message);
}
```

## ⚠️ ملاحظات مهمة

### الفرق بين العمليات
- **تفعيل النظام:** يفعل الأنماط المعتمدة فقط
- **إيقاف النظام:** يعطل جميع الأنماط
- **إيقاف اعتماد:** يؤثر على نمط واحد فقط

### الأداء
- **العمليات سريعة:** أقل من ثانية واحدة
- **آمنة:** لا تؤثر على البيانات الأصلية
- **قابلة للعكس:** يمكن التراجع فوراً

### التوافق
- **المتصفحات:** جميع المتصفحات الحديثة
- **الأجهزة:** سطح المكتب والجوال
- **الشبكة:** يعمل مع اتصال إنترنت بطيء
