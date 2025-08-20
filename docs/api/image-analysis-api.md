# API نظام تحليل الصور

## 📋 **نظرة عامة**

هذا المستند يوثق واجهات برمجة التطبيقات (APIs) الخاصة بنظام تحليل الصور المتقدم.

## 🔗 **Base URL**
```
https://your-domain.com/api/v1
```

## 🔐 **المصادقة**

جميع طلبات API تتطلب مصادقة باستخدام Bearer Token:

```http
Authorization: Bearer YOUR_API_TOKEN
```

## 📸 **نقاط نهاية تحليل الصور**

### 1. **تحليل صورة واحدة**

#### `POST /image-analysis/analyze`

تحليل صورة واحدة والحصول على معلومات مفصلة.

**الطلب:**
```http
POST /api/v1/image-analysis/analyze
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "imageUrl": "https://example.com/image.jpg",
  "includeProducts": true,
  "includeColors": true,
  "analysisDepth": "detailed"
}
```

**الاستجابة الناجحة:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://example.com/image.jpg",
    "analysis": {
      "description": "كوتشي رياضي أبيض ناصع مع نعل سميك...",
      "detectedObjects": ["shoes", "sneakers"],
      "colors": {
        "primary": "أبيض",
        "secondary": "أسود",
        "detected": ["أبيض ناصع", "نعل أبيض"]
      },
      "confidence": 0.95
    },
    "productMatch": {
      "found": true,
      "productId": "cmdtad0xx000hufl4rgq2yjcg",
      "productName": "كوتشي الاسكوتش",
      "selectedColor": "الابيض",
      "price": 349,
      "confidence": 0.92
    },
    "processingTime": 15234
  }
}
```

**معاملات الطلب:**

| المعامل | النوع | مطلوب | الوصف |
|---------|------|--------|-------|
| `imageUrl` | string | ✅ | رابط الصورة المراد تحليلها |
| `includeProducts` | boolean | ❌ | تضمين مطابقة المنتجات (افتراضي: true) |
| `includeColors` | boolean | ❌ | تضمين تحليل الألوان (افتراضي: true) |
| `analysisDepth` | string | ❌ | عمق التحليل: "basic", "detailed", "comprehensive" |

### 2. **تحليل متعدد الصور**

#### `POST /image-analysis/batch`

تحليل عدة صور في طلب واحد.

**الطلب:**
```http
POST /api/v1/image-analysis/batch
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "images": [
    {
      "id": "img1",
      "url": "https://example.com/image1.jpg"
    },
    {
      "id": "img2", 
      "url": "https://example.com/image2.jpg"
    }
  ],
  "options": {
    "includeProducts": true,
    "analysisDepth": "detailed"
  }
}
```

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "img1",
        "status": "success",
        "analysis": { /* نتائج التحليل */ }
      },
      {
        "id": "img2",
        "status": "success", 
        "analysis": { /* نتائج التحليل */ }
      }
    ],
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0,
      "totalProcessingTime": 28456
    }
  }
}
```

### 3. **اختبار اختيار الألوان**

#### `POST /image-analysis/test-colors`

اختبار خوارزمية اختيار الألوان مع نص تحليل محدد.

**الطلب:**
```http
POST /api/v1/image-analysis/test-colors
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "analysisText": "كوتشي رياضي أبيض ناصع مع نعل أبيض سميك",
  "availableColors": ["الابيض", "الاسود", "البيج"]
}
```

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "selectedColor": "الابيض",
    "matchedVariation": "أبيض ناصع",
    "confidence": 1.0,
    "searchText": "كوتشي رياضي أبيض ناصع مع نعل أبيض سميك",
    "allMatches": [
      {
        "color": "الابيض",
        "variations": ["أبيض ناصع", "أبيض"],
        "found": true
      }
    ]
  }
}
```

## 🎨 **نقاط نهاية إدارة الألوان**

### 1. **الحصول على الألوان المدعومة**

#### `GET /image-analysis/colors`

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "colors": [
      {
        "name": "الابيض",
        "variations": ["أبيض", "ابيض", "بيضاء", "white", "أبيض ناصع"],
        "priority": 1
      },
      {
        "name": "الاسود", 
        "variations": ["أسود", "اسود", "سوداء", "black", "داكن"],
        "priority": 2
      }
    ]
  }
}
```

### 2. **إضافة لون جديد**

#### `POST /image-analysis/colors`

**الطلب:**
```http
POST /api/v1/image-analysis/colors
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "الاحمر",
  "variations": ["أحمر", "احمر", "red", "قرمزي"],
  "priority": 4
}
```

### 3. **تحديث تنويعات لون**

#### `PUT /image-analysis/colors/{colorName}`

**الطلب:**
```http
PUT /api/v1/image-analysis/colors/الابيض
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "variations": ["أبيض", "ابيض", "بيضاء", "white", "أبيض ناصع", "ناصع"],
  "priority": 1
}
```

## 📊 **نقاط نهاية الإحصائيات**

### 1. **إحصائيات التحليل**

#### `GET /image-analysis/stats`

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "totalAnalyses": 1250,
    "successRate": 98.4,
    "averageProcessingTime": 16234,
    "colorAccuracy": 100.0,
    "productMatchRate": 94.2,
    "dailyStats": {
      "today": 45,
      "yesterday": 52,
      "thisWeek": 312
    },
    "topColors": [
      {"color": "الابيض", "count": 450},
      {"color": "الاسود", "count": 380},
      {"color": "البيج", "count": 420}
    ]
  }
}
```

### 2. **إحصائيات الأداء**

#### `GET /image-analysis/performance`

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "averageResponseTime": 15234,
    "p95ResponseTime": 25000,
    "p99ResponseTime": 35000,
    "errorRate": 1.6,
    "throughput": 120,
    "memoryUsage": {
      "current": "245MB",
      "peak": "512MB",
      "average": "280MB"
    }
  }
}
```

## 🔧 **نقاط نهاية الإدارة**

### 1. **إعادة تحميل النماذج**

#### `POST /image-analysis/reload-models`

إعادة تحميل نماذج الذكاء الاصطناعي.

**الطلب:**
```http
POST /api/v1/image-analysis/reload-models
Authorization: Bearer YOUR_TOKEN
```

### 2. **تنظيف الذاكرة المؤقتة**

#### `POST /image-analysis/clear-cache`

**الطلب:**
```http
POST /api/v1/image-analysis/clear-cache
Authorization: Bearer YOUR_TOKEN
```

### 3. **فحص صحة النظام**

#### `GET /image-analysis/health`

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "geminiAI": "online",
      "database": "online", 
      "redis": "online"
    },
    "lastCheck": "2025-08-04T19:30:00Z",
    "uptime": "5d 12h 30m"
  }
}
```

## ❌ **رموز الأخطاء**

| الكود | الرسالة | الوصف |
|-------|---------|-------|
| 400 | Invalid image URL | رابط الصورة غير صالح |
| 401 | Unauthorized | مصادقة مطلوبة |
| 403 | Forbidden | ليس لديك صلاحية |
| 404 | Image not found | الصورة غير موجودة |
| 413 | Image too large | الصورة كبيرة جداً |
| 415 | Unsupported format | صيغة غير مدعومة |
| 429 | Rate limit exceeded | تجاوز حد الطلبات |
| 500 | Analysis failed | فشل في التحليل |
| 503 | Service unavailable | الخدمة غير متاحة |

**مثال على رد خطأ:**
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Invalid image URL",
    "details": "The provided URL is not accessible or does not contain a valid image"
  }
}
```

## 📝 **أمثلة الاستخدام**

### JavaScript/Node.js
```javascript
const axios = require('axios');

async function analyzeImage(imageUrl) {
  try {
    const response = await axios.post('/api/v1/image-analysis/analyze', {
      imageUrl: imageUrl,
      includeProducts: true,
      analysisDepth: 'detailed'
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Analysis failed:', error.response.data);
  }
}
```

### Python
```python
import requests

def analyze_image(image_url, token):
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'imageUrl': image_url,
        'includeProducts': True,
        'analysisDepth': 'detailed'
    }
    
    response = requests.post(
        '/api/v1/image-analysis/analyze',
        json=data,
        headers=headers
    )
    
    return response.json()
```

### cURL
```bash
curl -X POST "https://your-domain.com/api/v1/image-analysis/analyze" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "includeProducts": true,
    "analysisDepth": "detailed"
  }'
```

## 🔄 **معدل الطلبات**

| نوع الحساب | الحد الأقصى | النافذة الزمنية |
|------------|-------------|-----------------|
| مجاني | 100 طلب | ساعة |
| أساسي | 1000 طلب | ساعة |
| متقدم | 10000 طلب | ساعة |
| مؤسسي | غير محدود | - |

## 📞 **الدعم**

للحصول على المساعدة مع API:
- **التوثيق**: [docs/api/README.md](README.md)
- **الأمثلة**: [examples/api-examples.md](../examples/api-examples.md)
- **المشاكل الشائعة**: [troubleshooting/API_ISSUES.md](../troubleshooting/API_ISSUES.md)

**📝 آخر تحديث:** أغسطس 2025
