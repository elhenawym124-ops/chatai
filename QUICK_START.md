# 🚀 دليل البدء السريع - منصة التواصل التجارية

## ⚡ تشغيل النظام في 3 خطوات

### 1. **تشغيل الخادم الحقيقي:**
```bash
cd backend
node real-server.js
```
**✅ النتيجة:** خادم يعمل على http://localhost:3001

### 2. **تشغيل الواجهة الأمامية:**
```bash
cd frontend
npm start
```
**✅ النتيجة:** تطبيق يعمل على http://localhost:3000

### 3. **اختبار النظام:**
- افتح http://localhost:3000
- انتقل إلى صفحة المحادثات
- جرب إرسال رسالة

## 🧪 اختبارات سريعة

### **اختبار الخادم:**
```bash
# Health Check
curl http://localhost:3001/health

# جلب المحادثات
curl http://localhost:3001/api/v1/conversations

# جلب المنتجات
curl http://localhost:3001/api/v1/products
```

### **اختبار إرسال رسالة:**
```bash
curl -X POST http://localhost:3001/api/v1/conversations/cmd5c0f8r000tymzdbqo3s4so/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "رسالة اختبار جديدة"}'
```

### **اختبار الذكاء الاصطناعي:**
```bash
curl -X POST http://localhost:3001/api/v1/ai/generate-response \
  -H "Content-Type: application/json" \
  -d '{"message": "مرحباً، أريد معرفة أسعار اللابتوبات"}'
```

## 📱 الواجهات المتاحة

### **الصفحة الرئيسية:**
- http://localhost:3000

### **صفحة المحادثات:**
- http://localhost:3000/conversations

### **صفحة المنتجات:**
- http://localhost:3000/products

### **إعدادات الذكاء الاصطناعي:**
- http://localhost:3000/ai-settings

## 🗄️ البيانات المحفوظة

### **المحادثات الموجودة:**
1. **محادثة 1:** "أحتاج عرض سعر لطقم أدوات المطبخ الكامل"
2. **محادثة 2:** "مرحباً، أريد معرفة المزيد عن الهواتف الذكية"

### **المنتجات الموجودة:**
1. **لابتوب Dell Inspiron 15** - 25,000 جنيه
2. **هاتف Samsung Galaxy S23** - 18,000 جنيه

## 🔧 إعدادات اختيارية

### **إضافة Gemini API Key:**
```bash
# في ملف .env
GOOGLE_GEMINI_API_KEY="your-api-key-here"
```

### **إعداد Facebook Integration:**
```bash
# في ملف .env
FACEBOOK_WEBHOOK_VERIFY_TOKEN="simple_chat_verify_token_2025"
FACEBOOK_PAGE_ACCESS_TOKEN="your-facebook-token"
```

## 🚨 استكشاف الأخطاء

### **إذا لم يعمل الخادم:**
1. تأكد من أن المنفذ 3001 غير مستخدم
2. تحقق من اتصال قاعدة البيانات
3. راجع رسائل الخطأ في Terminal

### **إذا لم تعمل الواجهة الأمامية:**
1. تأكد من أن المنفذ 3000 غير مستخدم
2. تحقق من تشغيل الخادم أولاً
3. راجع console في المتصفح

### **إذا لم تظهر البيانات:**
1. تأكد من تشغيل الخادم الحقيقي (real-server.js)
2. تحقق من اتصال قاعدة البيانات MySQL
3. جرب إعادة تشغيل الخادم

## 📞 الدعم السريع

### **روابط مفيدة:**
- **Health Check:** http://localhost:3001/health
- **API Documentation:** http://localhost:3001/api/v1
- **Database Status:** تحقق من logs الخادم

### **أوامر مفيدة:**
```bash
# إعادة تشغيل الخادم
cd backend && node real-server.js

# إعادة تشغيل الواجهة
cd frontend && npm start

# تحقق من حالة قاعدة البيانات
cd backend && npx prisma studio
```

## 🎯 الخطوات التالية

### **للتطوير:**
1. جرب إضافة منتجات جديدة
2. اختبر إرسال رسائل مختلفة
3. جرب الذكاء الاصطناعي مع رسائل متنوعة

### **للإنتاج:**
1. أضف Gemini API Key
2. اربط Facebook Page
3. أضف المزيد من المنتجات الحقيقية

---

**🎉 مبروك! النظام جاهز للاستخدام!**

البيانات محفوظة بشكل دائم في قاعدة بيانات MySQL حقيقية، والنظام جاهز للتطوير والاستخدام.
