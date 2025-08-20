# 🔌 توثيق API - مرجع شامل

## نظرة عامة

هذا القسم يحتوي على توثيق شامل لجميع نقاط نهاية API في منصة التواصل والتجارة الإلكترونية.

## 🌐 معلومات عامة

### Base URL
```
https://your-domain.com/api/v1
```

### المصادقة
جميع طلبات API تتطلب مصادقة باستخدام JWT Token:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### تنسيق الاستجابة
جميع الاستجابات بتنسيق JSON:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### رموز الحالة
- `200` - نجح الطلب
- `201` - تم إنشاء المورد بنجاح
- `400` - خطأ في البيانات المرسلة
- `401` - غير مصرح له
- `403` - ممنوع الوصول
- `404` - المورد غير موجود
- `500` - خطأ في الخادم

## 📚 أقسام التوثيق

### 🔐 [المصادقة والترخيص](authentication.md)
- تسجيل الدخول والخروج
- إدارة الرموز المميزة
- تجديد الجلسات
- إدارة الصلاحيات

### 👥 [إدارة العملاء](customers.md)
- إنشاء وتحديث العملاء
- البحث والفلترة
- تاريخ التفاعلات
- إحصائيات العملاء

### 💬 [المحادثات والرسائل](conversations.md)
- إرسال واستقبال الرسائل
- إدارة المحادثات
- الرسائل التلقائية
- تتبع حالة الرسائل

### 🛍️ [إدارة المنتجات](products.md)
- إضافة وتحديث المنتجات
- إدارة الفئات
- رفع الصور
- إدارة المخزون

### 📦 [إدارة الطلبات](orders.md)
- إنشاء ومعالجة الطلبات
- تتبع حالة الطلبات
- إدارة المدفوعات
- التقارير المالية

### 📊 [التقارير والتحليلات](reports.md)
- تقارير المبيعات
- إحصائيات التفاعل
- تحليل الأداء
- البيانات التحليلية

### 🔗 [Webhooks والتكاملات](webhooks.md)
- إعداد Webhooks
- أحداث النظام
- التكاملات الخارجية
- مراقبة الأحداث

## 🛠️ أدوات التطوير

### Postman Collection
```bash
# تحميل مجموعة Postman
curl -o api-collection.json https://your-domain.com/api/postman-collection
```

### OpenAPI Specification
```bash
# تحميل مواصفات OpenAPI
curl -o openapi.yaml https://your-domain.com/api/openapi.yaml
```

### SDK للغات البرمجة
- **JavaScript/Node.js**: `npm install your-platform-sdk`
- **Python**: `pip install your-platform-sdk`
- **PHP**: `composer require your-platform/sdk`

## 🔍 أمثلة سريعة

### تسجيل الدخول
```bash
curl -X POST https://your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### إرسال رسالة
```bash
curl -X POST https://your-domain.com/api/v1/conversations/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId": "123", "message": "مرحبا"}'
```

### إضافة منتج
```bash
curl -X POST https://your-domain.com/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "منتج جديد", "price": 100, "description": "وصف المنتج"}'
```

## 📝 ملاحظات مهمة

### معدل الطلبات
- **الحد الأقصى**: 1000 طلب في الساعة لكل مستخدم
- **الحد اليومي**: 10000 طلب في اليوم

### أمان البيانات
- جميع الطلبات عبر HTTPS
- تشفير البيانات الحساسة
- تسجيل جميع العمليات

### الدعم الفني
- **البريد الإلكتروني**: api-support@your-domain.com
- **التوثيق التفاعلي**: https://your-domain.com/api-docs
- **منتدى المطورين**: https://developers.your-domain.com

---

**📚 للحصول على تفاصيل أكثر، راجع الأقسام المتخصصة في هذا المجلد.**
