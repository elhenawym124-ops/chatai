# 🚀 دليل البدء السريع - نظام إرسال الصور

## ⚡ البدء في 5 دقائق

### 1. تشغيل النظام
```bash
cd backend
npm install
node server.js
```

### 2. اختبار النظام
```bash
# اختبار النظام البسيط مع الصور
curl -X POST "http://localhost:3001/api/v1/ai/generate-response-simple" \
  -H "Content-Type: application/json" \
  -d '{"message": "أريد صور الكوتشيات", "companyId": "cmd5c0c9y0000ymzdd7wtv7ib"}'
```

### 3. التحقق من النتيجة
```json
{
  "success": true,
  "data": {
    "response": "النص مع تفاصيل المنتجات...",
    "images": [
      {
        "type": "image",
        "payload": {"url": "https://files.easy-orders.net/..."},
        "title": "اسم المنتج",
        "productId": "معرف المنتج"
      }
    ]
  }
}
```

## 🔧 الملفات الرئيسية

### للتعديل على النظام:
- `src/services/simpleProductsAiService.js` - منطق استخراج الصور
- `server.js` - إرسال الصور للماسنجر

### للمراقبة:
- `logs/app.log` - سجل العمليات
- Console output - رسائل الحالة المباشرة

## 📱 اختبار الماسنجر

### إرسال رسالة للبوت:
```
"أريد صور الكوتشيات"
"ابعتي صورة الكوتشي النايك"
"عايز أشوف المنتجات مع صورها"
```

### النتيجة المتوقعة:
1. **رد نصي** مع تفاصيل المنتجات
2. **صور المنتجات** (1-3 صور)
3. **معرفات المنتجات** في النص

## 🔍 مراقبة النظام

### رسائل النجاح في اللوج:
```
🖼️ تم استخراج 3 صورة منتج
📤 AI reply sent successfully
📸 صورة 1 تم إرسالها: message_id
```

### رسائل المشاكل:
```
🖼️ تم استخراج 0 صورة منتج  ❌
❌ Error sending Facebook message  ❌
```

## ⚙️ إعدادات سريعة

### تغيير الصور:
```javascript
// في simpleProductsAiService.js
const realProductImages = {
  'product_id': 'https://new-image-url.com/image.jpg'
};
```

### تفعيل/إلغاء النظام:
```javascript
// في server.js
aiSettings.useAdvancedTools = false; // النظام البسيط مع الصور
aiSettings.useAdvancedTools = true;  // النظام المتقدم بدون صور
```

## 🆘 حل المشاكل السريع

### المشكلة: لا توجد صور
```bash
# 1. تحقق من النص المولد
grep "النص المولد" logs/app.log

# 2. تحقق من استخراج المعرفات
grep "تم العثور على.*منتج" logs/app.log

# 3. تحقق من regex patterns
```

### المشكلة: خطأ في إرسال الصور
```bash
# 1. تحقق من URLs
curl -I "https://files.easy-orders.net/image.webp"

# 2. تحقق من Facebook Token
# 3. جرب صورة أخرى
```

### المشكلة: بطء في الاستجابة
```bash
# 1. راقب وقت الاستجابة
grep "responseTime" logs/app.log

# 2. تحقق من قاعدة البيانات
# 3. راقب استخدام الذاكرة
```

## 📚 مراجع سريعة

### ملفات التوثيق:
- `IMAGE_MESSAGING_SYSTEM_README.md` - التوثيق الشامل
- `README.md` - التوثيق العام
- `PROJECT_SUMMARY.md` - ملخص المشروع

### APIs مهمة:
```bash
# اختبار النظام البسيط
POST /api/v1/ai/generate-response-simple

# اختبار الماسنجر
POST /webhook

# مراقبة الصحة
GET /api/v1/health
```

### أوامر مفيدة:
```bash
# مراقبة اللوج
tail -f logs/app.log

# البحث عن الصور
grep "صورة" logs/app.log

# إعادة تشغيل
npm restart
```

---

**🎯 هذا الدليل يكفي للبدء السريع. للتفاصيل الكاملة، راجع `IMAGE_MESSAGING_SYSTEM_README.md`**
