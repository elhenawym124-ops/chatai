# 🔧 AI Settings API Documentation

## 📋 **نظرة عامة**

هذا التوثيق يشرح كيفية استخدام API إعدادات الذكاء الاصطناعي في النظام.

---

## 🌐 **Base URL**
```
http://localhost:3001/api/v1/settings
```

---

## 📡 **Endpoints**

### 1. **GET /ai** - جلب إعدادات الذكاء الاصطناعي

#### **الوصف:**
يسترجع الإعدادات الحالية للذكاء الاصطناعي من قاعدة البيانات أو النظام المؤقت.

#### **HTTP Method:** `GET`
#### **URL:** `/api/v1/settings/ai`

#### **Headers:**
```http
Content-Type: application/json
```

#### **Response - Success (200):**
```json
{
  "success": true,
  "data": {
    "qualityEvaluationEnabled": true,
    "autoReplyEnabled": false,
    "confidenceThreshold": 0.7,
    "multimodalEnabled": true,
    "ragEnabled": true,
    "updatedAt": "2025-08-10T00:52:40.603Z"
  }
}
```

#### **Response - Error (500):**
```json
{
  "success": false,
  "error": "Failed to fetch AI settings",
  "details": "Error message details"
}
```

#### **مثال cURL:**
```bash
curl -X GET "http://localhost:3001/api/v1/settings/ai" \
     -H "Content-Type: application/json"
```

---

### 2. **PUT /ai** - تحديث إعدادات الذكاء الاصطناعي

#### **الوصف:**
يحدث إعدادات الذكاء الاصطناعي في قاعدة البيانات أو النظام المؤقت.

#### **HTTP Method:** `PUT`
#### **URL:** `/api/v1/settings/ai`

#### **Headers:**
```http
Content-Type: application/json
```

#### **Request Body:**
```json
{
  "qualityEvaluationEnabled": true,
  "autoReplyEnabled": false,
  "confidenceThreshold": 0.8,
  "multimodalEnabled": true,
  "ragEnabled": true
}
```

#### **Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `qualityEvaluationEnabled` | boolean | No | true | تفعيل/إلغاء تقييم الجودة |
| `autoReplyEnabled` | boolean | No | false | تفعيل/إلغاء الرد التلقائي |
| `confidenceThreshold` | number | No | 0.7 | حد الثقة (0.0 - 1.0) |
| `multimodalEnabled` | boolean | No | true | تفعيل/إلغاء الوسائط المتعددة |
| `ragEnabled` | boolean | No | true | تفعيل/إلغاء نظام RAG |

#### **Response - Success (200):**
```json
{
  "success": true,
  "data": {
    "qualityEvaluationEnabled": true,
    "autoReplyEnabled": false,
    "confidenceThreshold": 0.8,
    "multimodalEnabled": true,
    "ragEnabled": true,
    "updatedAt": "2025-08-10T00:52:40.603Z"
  },
  "message": "AI settings updated successfully"
}
```

#### **Response - Error (500):**
```json
{
  "success": false,
  "error": "Failed to update AI settings"
}
```

#### **مثال cURL:**
```bash
curl -X PUT "http://localhost:3001/api/v1/settings/ai" \
     -H "Content-Type: application/json" \
     -d '{
       "qualityEvaluationEnabled": true,
       "confidenceThreshold": 0.8
     }'
```

---

## 🏗️ **نظام التشغيل الهجين**

### **Primary System: قاعدة البيانات**
- يحاول النظام أولاً حفظ/قراءة البيانات من قاعدة البيانات
- يستخدم جدول `AiSettings` في قاعدة البيانات
- يوفر أداء أفضل واستقرار أكبر

### **Fallback System: النظام المؤقت**
- في حالة فشل قاعدة البيانات، يستخدم ملف JSON مؤقت
- الملف: `backend/temp_quality_settings.json`
- يضمن استمرارية العمل حتى لو كانت قاعدة البيانات غير متاحة

---

## 🔍 **أمثلة الاستخدام**

### **JavaScript/Node.js:**
```javascript
// جلب الإعدادات
const response = await fetch('http://localhost:3001/api/v1/settings/ai');
const settings = await response.json();
console.log(settings.data);

// تحديث الإعدادات
const updateResponse = await fetch('http://localhost:3001/api/v1/settings/ai', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qualityEvaluationEnabled: false,
    confidenceThreshold: 0.9
  })
});
const result = await updateResponse.json();
console.log(result.message);
```

### **Python:**
```python
import requests

# جلب الإعدادات
response = requests.get('http://localhost:3001/api/v1/settings/ai')
settings = response.json()
print(settings['data'])

# تحديث الإعدادات
update_data = {
    'qualityEvaluationEnabled': True,
    'confidenceThreshold': 0.85
}
response = requests.put(
    'http://localhost:3001/api/v1/settings/ai',
    json=update_data
)
result = response.json()
print(result['message'])
```

---

## 🚨 **معالجة الأخطاء**

### **أخطاء شائعة:**

1. **خطأ الاتصال بقاعدة البيانات:**
   - النظام يتحول تلقائياً للنظام المؤقت
   - رسالة في الـ logs: `⚠️ Database not available, using temporary system`

2. **خطأ في صيغة البيانات:**
   - HTTP Status: 400
   - رسالة خطأ واضحة في الاستجابة

3. **خطأ خادم داخلي:**
   - HTTP Status: 500
   - تفاصيل الخطأ في الـ logs

---

## 📊 **مراقبة النظام**

### **Logs المهمة:**
```
✅ [AI-SETTINGS] Loaded from database
⚠️ [AI-SETTINGS] Database not available, using temporary system
📁 [AI-SETTINGS] Loaded from file
💾 [AI-SETTINGS] Writing to file
```

### **ملفات المراقبة:**
- `backend/temp_quality_settings.json` - النظام المؤقت
- Database table: `AiSettings` - النظام الأساسي

---

## 🔧 **إعداد التطوير**

### **متطلبات:**
- Node.js 18+
- MySQL Database
- Prisma ORM

### **تشغيل النظام:**
```bash
# تشغيل الخادم
npm start

# أو
node server.js
```

### **اختبار API:**
```bash
# اختبار GET
curl http://localhost:3001/api/v1/settings/ai

# اختبار PUT
curl -X PUT http://localhost:3001/api/v1/settings/ai \
     -H "Content-Type: application/json" \
     -d '{"qualityEvaluationEnabled": true}'
```

---

## 📝 **ملاحظات مهمة**

1. **الأمان:** تأكد من تشفير الاتصال في الإنتاج
2. **الأداء:** النظام محسن للاستجابة السريعة
3. **الموثوقية:** يعمل حتى لو كانت قاعدة البيانات غير متاحة
4. **التوافق:** يدعم جميع المتصفحات الحديثة

---

## 👨‍💻 **المطور:** Augment Agent
## 📅 **آخر تحديث:** 2025-08-10
## 📋 **الإصدار:** 1.0.0
