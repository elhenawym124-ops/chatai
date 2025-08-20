# 📚 دليل دوال Frontend - successAnalyticsAPI.js

## 📋 نظرة عامة

ملف `successAnalyticsAPI.js` يحتوي على **20 دالة كاملة** لإدارة نظام الأنماط والتحليلات.

## 🎛️ دوال التحكم في النظام

### 1. enablePatternSystem()
```javascript
await successAnalyticsAPI.enablePatternSystem(companyId);
```
**الوظيفة:** تفعيل جميع الأنماط المعتمدة
**المعاملات:** `companyId` (اختياري)
**الإرجاع:** بيانات التفعيل مع عدد الأنماط المتأثرة

### 2. disablePatternSystem()
```javascript
await successAnalyticsAPI.disablePatternSystem(companyId, reason);
```
**الوظيفة:** إيقاف جميع الأنماط
**المعاملات:** 
- `companyId` (اختياري)
- `reason` (اختياري) - سبب الإيقاف

### 3. getPatternSystemStatus()
```javascript
const status = await successAnalyticsAPI.getPatternSystemStatus(companyId);
```
**الوظيفة:** جلب حالة النظام والإحصائيات
**الإرجاع:**
```javascript
{
  enabled: true,
  totalPatterns: 113,
  activePatterns: 11,
  approvedPatterns: 11,
  inactivePatterns: 102
}
```

## 🔧 دوال إدارة الأنماط

### 4. getPatterns()
```javascript
const patterns = await successAnalyticsAPI.getPatterns({
  patternType: 'greeting',
  isActive: true,
  isApproved: true,
  limit: 20
});
```
**الوظيفة:** جلب الأنماط مع فلترة
**المعاملات:** كائن options مع فلاتر مختلفة

### 5. approvePattern()
```javascript
await successAnalyticsAPI.approvePattern(patternId, 'admin');
```
**الوظيفة:** اعتماد نمط معين
**المعاملات:** 
- `patternId` - معرف النمط
- `approvedBy` - المستخدم المعتمد

### 6. unapprovePattern()
```javascript
await successAnalyticsAPI.unapprovePattern(patternId, 'تم إيقاف الاعتماد');
```
**الوظيفة:** إيقاف اعتماد نمط معتمد
**المعاملات:**
- `patternId` - معرف النمط
- `reason` - سبب الإيقاف

### 7. rejectPattern()
```javascript
await successAnalyticsAPI.rejectPattern(patternId);
```
**الوظيفة:** رفض نمط نهائياً

### 8. testPattern()
```javascript
const result = await successAnalyticsAPI.testPattern(
  patternId, 
  'مرحباً، كيف يمكنني مساعدتك؟',
  companyId
);
```
**الوظيفة:** اختبار نمط على رسالة معينة

## 📊 دوال الإحصائيات

### 9. getOutcomeStats()
```javascript
const stats = await successAnalyticsAPI.getOutcomeStats(30);
```
**الوظيفة:** إحصائيات النتائج لفترة معينة
**المعاملات:** `timeRange` - عدد الأيام

### 10. getPatternPerformance()
```javascript
const performance = await successAnalyticsAPI.getPatternPerformance(companyId);
```
**الوظيفة:** إحصائيات أداء الأنماط

### 11. getPatternUsage()
```javascript
const usage = await successAnalyticsAPI.getPatternUsage({
  companyId: 'company_id',
  patternId: 'pattern_id',
  days: 7
});
```
**الوظيفة:** إحصائيات استخدام الأنماط

### 12. getResponseEffectiveness()
```javascript
const effectiveness = await successAnalyticsAPI.getResponseEffectiveness({
  conversationId: 'conv_id',
  responseType: 'pattern',
  minEffectiveness: 0.7,
  limit: 50
});
```
**الوظيفة:** فعالية الردود والأنماط

### 13. getQuickStats()
```javascript
const quickStats = await successAnalyticsAPI.getQuickStats();
```
**الوظيفة:** إحصائيات سريعة للداشبورد
**الإرجاع:**
```javascript
{
  weeklyStats: {...},
  topPatterns: [...],
  summary: {
    conversionRate: 7.12,
    totalValue: 7348,
    successfulConversations: 19,
    activePatterns: 11
  }
}
```

### 14. getPatternsSummary()
```javascript
const summary = await successAnalyticsAPI.getPatternsSummary(companyId);
```
**الوظيفة:** ملخص شامل للأنماط مع الأداء والاستخدام

## 🔬 دوال التحليل

### 15. analyzeNewPatterns()
```javascript
await successAnalyticsAPI.analyzeNewPatterns();
```
**الوظيفة:** تحليل واكتشاف أنماط جديدة من المحادثات

### 16. detectNewPatterns()
```javascript
const newPatterns = await successAnalyticsAPI.detectNewPatterns(7);
```
**الوظيفة:** اكتشاف أنماط جديدة لفترة معينة

### 17. runComprehensiveAnalysis()
```javascript
const analysis = await successAnalyticsAPI.runComprehensiveAnalysis({
  timeRange: 30,
  companyId: 'company_id'
});
```
**الوظيفة:** تشغيل تحليل شامل للأنماط والأداء

## 📁 دوال البيانات

### 18. getAllData()
```javascript
const allData = await successAnalyticsAPI.getAllData(30);
```
**الوظيفة:** جلب جميع البيانات (إحصائيات + أنماط + فعالية)

### 19. exportData()
```javascript
const csvData = await successAnalyticsAPI.exportData('csv', 30);
```
**الوظيفة:** تصدير البيانات بصيغة CSV أو JSON

### 20. recordOutcome()
```javascript
await successAnalyticsAPI.recordOutcome({
  conversationId: 'conv_id',
  outcome: 'purchase',
  value: 150,
  patternUsed: 'pattern_id'
});
```
**الوظيفة:** تسجيل نتيجة محادثة

## 🛠️ دوال مساعدة

### convertToCSV()
```javascript
const csvString = successAnalyticsAPI.convertToCSV(data);
```
**الوظيفة:** تحويل البيانات إلى صيغة CSV

## 📊 أمثلة الاستخدام

### مثال شامل - إدارة النظام
```javascript
try {
  // 1. فحص الحالة
  const status = await successAnalyticsAPI.getPatternSystemStatus();
  console.log('النظام مفعل:', status.enabled);
  
  // 2. جلب الأنماط
  const patterns = await successAnalyticsAPI.getPatterns({ 
    isApproved: true, 
    limit: 10 
  });
  
  // 3. تفعيل النظام إذا كان معطلاً
  if (!status.enabled) {
    await successAnalyticsAPI.enablePatternSystem();
    console.log('تم تفعيل النظام');
  }
  
  // 4. جلب إحصائيات سريعة
  const quickStats = await successAnalyticsAPI.getQuickStats();
  console.log('معدل التحويل:', quickStats.summary.conversionRate);
  
} catch (error) {
  console.error('خطأ:', error.message);
}
```

### مثال - تصدير البيانات
```javascript
try {
  // تصدير كـ CSV
  const csvData = await successAnalyticsAPI.exportData('csv', 30);
  
  // إنشاء ملف للتحميل
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `patterns-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  
} catch (error) {
  console.error('فشل في التصدير:', error.message);
}
```

## ⚠️ ملاحظات مهمة

### الأداء
- **استخدم limit** عند جلب الأنماط
- **تجنب الاستدعاءات المتكررة** للدوال الثقيلة
- **استخدم cache** للبيانات الثابتة

### الأمان
- **تأكد من companyId** في جميع الاستدعاءات
- **استخدم try/catch** دائماً
- **تحقق من الصلاحيات** قبل العمليات الحساسة

### التوافق
- **جميع المتصفحات الحديثة**
- **يعمل مع ES6+ modules**
- **متوافق مع React 18+**
