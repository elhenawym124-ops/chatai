# ⚡ دليل البدء السريع
## Quick Start Guide for Developers

## 🎯 **نظرة عامة**

هذا الدليل سيساعدك على تشغيل النظام محلياً في أقل من 15 دقيقة. اتبع الخطوات بالترتيب للحصول على نظام عامل بالكامل.

## 📋 **المتطلبات الأساسية**

### **البرامج المطلوبة:**
```bash
# تأكد من وجود هذه البرامج
node --version    # v18.0.0 أو أحدث
npm --version     # v8.0.0 أو أحدث
mysql --version   # v8.0 أو أحدث
git --version     # أي إصدار حديث
```

### **الحسابات المطلوبة:**
- **Google Cloud Account** - للحصول على Gemini API Key
- **Facebook Developer Account** - لتكامل Messenger
- **MySQL Database** - محلي أو سحابي

## 🚀 **خطوات التثبيت**

### **الخطوة 1: استنساخ المشروع**
```bash
# استنساخ المشروع
git clone <repository-url>
cd chatbot-system

# فحص بنية المشروع
ls -la
# يجب أن ترى: frontend/ backend/ docs/ README.md
```

### **الخطوة 2: إعداد قاعدة البيانات**
```bash
# تشغيل MySQL
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS

# إنشاء قاعدة البيانات
mysql -u root -p
CREATE DATABASE chatbot_db;
CREATE USER 'chatbot_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON chatbot_db.* TO 'chatbot_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **الخطوة 3: إعداد Backend**
```bash
# الانتقال لمجلد Backend
cd backend

# تثبيت المكتبات
npm install

# إنشاء ملف البيئة
cp .env.example .env

# تحرير ملف البيئة
nano .env
```

#### **إعداد متغيرات البيئة (.env):**
```env
# قاعدة البيانات
DATABASE_URL="mysql://chatbot_user:your_password@localhost:3306/chatbot_db"

# Gemini AI
GEMINI_API_KEY="your_gemini_api_key_here"

# Facebook
FACEBOOK_PAGE_ACCESS_TOKEN="your_facebook_token"
FACEBOOK_VERIFY_TOKEN="your_verify_token"
FACEBOOK_APP_SECRET="your_app_secret"

# JWT
JWT_SECRET="your_jwt_secret_here"

# الخادم
PORT=3001
NODE_ENV=development
```

#### **تشغيل Migration:**
```bash
# إنشاء جداول قاعدة البيانات
npx prisma migrate dev --name init

# إنشاء Prisma Client
npx prisma generate

# (اختياري) إضافة بيانات تجريبية
npx prisma db seed
```

#### **تشغيل Backend:**
```bash
# تشغيل الخادم
npm run dev

# يجب أن ترى:
# ✅ Server running on port 3001
# ✅ Database connected successfully
# ✅ RAG system initialized
```

### **الخطوة 4: إعداد Frontend**
```bash
# فتح terminal جديد
cd frontend

# تثبيت المكتبات
npm install

# إنشاء ملف البيئة
cp .env.example .env.local

# تحرير ملف البيئة
nano .env.local
```

#### **إعداد متغيرات Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="Customer Service Bot"
NEXT_PUBLIC_COMPANY_NAME="Your Company"
```

#### **تشغيل Frontend:**
```bash
# تشغيل التطبيق
npm run dev

# يجب أن ترى:
# ✅ Ready - started server on 0.0.0.0:3000
# ✅ Local: http://localhost:3000
```

## 🔧 **الإعداد الأولي**

### **الخطوة 1: إنشاء حساب مدير**
```bash
# في مجلد backend
node scripts/create-admin.js

# أو عبر API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### **الخطوة 2: تسجيل الدخول**
1. افتح http://localhost:3000
2. اذهب لصفحة تسجيل الدخول
3. استخدم البيانات التي أنشأتها

### **الخطوة 3: إعداد Gemini API**
1. اذهب لـ **الإعدادات > الذكاء الاصطناعي**
2. أضف مفتاح Gemini API
3. اختبر الاتصال

### **الخطوة 4: إنشاء برومبت مخصص**
1. اذهب لـ **الإعدادات > إدارة البرومبت**
2. أنشئ برومبت جديد:
```
انتي اسمك ساره، مساعدة مبيعات ذكية في متجر إلكتروني.
- استخدمي اللغة العربية العامية
- كوني ودودة ومفيدة
- اذكري المنتجات المتاحة فقط
- قدمي معلومات دقيقة عن الأسعار والشحن
```
3. فعّل البرومبت

## 📱 **إعداد فيسبوك (اختياري)**

### **الخطوة 1: إنشاء Facebook App**
1. اذهب لـ [Facebook Developers](https://developers.facebook.com)
2. أنشئ تطبيق جديد
3. أضف منتج "Messenger"

### **الخطوة 2: إعداد Webhook**
```bash
# URL الـ Webhook
https://your-domain.com/api/webhooks/facebook

# أو للتطوير المحلي (استخدم ngrok)
ngrok http 3001
# ثم استخدم: https://abc123.ngrok.io/api/webhooks/facebook
```

### **الخطوة 3: إعداد الصفحة**
1. في لوحة تحكم Facebook
2. اربط صفحة فيسبوك بالتطبيق
3. احصل على Page Access Token
4. أضف Token في إعدادات النظام

## 🧪 **اختبار النظام**

### **اختبار Backend API:**
```bash
# اختبار الصحة العامة
curl http://localhost:3001/api/health

# اختبار المصادقة
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# اختبار الذكاء الاصطناعي
curl -X POST http://localhost:3001/api/ai/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "مرحبا"}'
```

### **اختبار Frontend:**
1. افتح http://localhost:3000
2. تسجيل الدخول
3. تصفح الصفحات المختلفة
4. اختبر إضافة منتج جديد
5. اختبر إنشاء محادثة تجريبية

### **اختبار الذكاء الاصطناعي:**
```bash
# في مجلد backend
node test-ai.js

# أو
npm run test:ai
```

## 📊 **إضافة بيانات تجريبية**

### **منتجات تجريبية:**
```bash
# تشغيل script البيانات التجريبية
node scripts/seed-data.js

# أو يدوياً عبر واجهة الإدارة:
# 1. اذهب لـ "المنتجات"
# 2. أضف منتجات جديدة
# 3. أضف أسعار ومواصفات
```

### **أسئلة شائعة:**
```bash
# إضافة FAQs
node scripts/add-faqs.js

# أو عبر الواجهة:
# 1. اذهب لـ "إدارة المحتوى"
# 2. أضف أسئلة شائعة
# 3. أضف سياسات الشحن والإرجاع
```

## 🔍 **فحص النظام**

### **التحقق من الخدمات:**
```bash
# فحص Backend
curl http://localhost:3001/api/health
# يجب أن يرجع: {"status": "ok", "database": "connected"}

# فحص Frontend
curl http://localhost:3000
# يجب أن يرجع صفحة HTML

# فحص قاعدة البيانات
npx prisma studio
# يفتح واجهة إدارة قاعدة البيانات
```

### **فحص اللوج:**
```bash
# لوج Backend
tail -f backend/logs/app.log

# لوج قاعدة البيانات
tail -f backend/logs/database.log

# لوج الذكاء الاصطناعي
tail -f backend/logs/ai.log
```

## 🚨 **حل المشاكل الشائعة**

### **مشكلة اتصال قاعدة البيانات:**
```bash
# فحص حالة MySQL
sudo systemctl status mysql

# إعادة تشغيل MySQL
sudo systemctl restart mysql

# فحص الاتصال
mysql -u chatbot_user -p chatbot_db
```

### **مشكلة Gemini API:**
```bash
# فحص المفتاح
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models

# اختبار الاتصال
node scripts/test-gemini.js
```

### **مشكلة Frontend:**
```bash
# مسح cache
rm -rf frontend/.next
rm -rf frontend/node_modules
npm install

# إعادة تشغيل
npm run dev
```

## 📚 **الخطوات التالية**

بعد تشغيل النظام بنجاح:

1. **📖 اقرأ التوثيق المفصل:**
   - [بنية النظام](../architecture/SYSTEM_ARCHITECTURE.md)
   - [نظام الذكاء الاصطناعي](../ai-system/AI_SYSTEM_OVERVIEW.md)

2. **🔧 خصص النظام:**
   - أضف منتجاتك
   - خصص البرومبت
   - أعد إعدادات الشركة

3. **📱 اربط فيسبوك:**
   - [دليل تكامل فيسبوك](../integrations/facebook.md)

4. **🚀 انشر النظام:**
   - [دليل النشر](../deployment/DEPLOYMENT_GUIDE.md)

## 📞 **الدعم**

إذا واجهت مشاكل:
- راجع [دليل حل المشاكل](../troubleshooting/COMMON_ISSUES.md)
- اطلع على [الأسئلة الشائعة](../FAQ.md)
- تواصل مع فريق الدعم

---

**🎉 تهانينا! النظام جاهز للاستخدام**
