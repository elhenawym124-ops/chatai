# 🚀 دليل البدء السريع - Quick Start Guide

## ⚡ البدء في 3 خطوات

### 1️⃣ تثبيت التبعيات
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2️⃣ تشغيل النظام
```bash
# العودة للمجلد الرئيسي
cd ..

# تشغيل كلا الخادمين مع الإصلاح التلقائي
npm run dev
```

### 3️⃣ فتح التطبيق
- **الواجهة الأمامية**: http://localhost:3000
- **الخادم الخلفي**: http://localhost:3001
- **API**: http://localhost:3001/api/v1

---

## 🎯 الأوامر الأساسية

| الأمر | الوصف | الاستخدام |
|-------|--------|-----------|
| `npm run dev` | تشغيل النظام كاملاً | للتطوير اليومي |
| `npm run fix-antivirus` | إصلاح مشاكل مكافح الفيروسات | عند المشاكل |
| `npm run start-both` | تشغيل الخادمين فقط | بدون إصلاح |

---

## 🛠️ متطلبات النظام

### الأساسية:
- **Node.js**: 18.0.0 أو أحدث
- **npm**: 9.0.0 أو أحدث
- **Git**: لإدارة الإصدارات

### اختيارية:
- **VS Code**: للتطوير
- **Postman**: لاختبار API
- **Chrome DevTools**: للتصحيح

---

## 🔧 الإعداد الأولي

### 1. استنساخ المشروع:
```bash
git clone [repository-url]
cd [project-name]
```

### 2. إعداد متغيرات البيئة:
```bash
# في مجلد backend
cp .env.example .env
# عدل الملف حسب إعداداتك
```

### 3. إعداد قاعدة البيانات:
```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## 🚨 حل المشاكل الشائعة

### مشكلة مكافح الفيروسات:
```bash
npm run fix-antivirus
```

### مشكلة المنافذ مشغولة:
```bash
# إيقاف العمليات على المنافذ
npx kill-port 3000 3001
```

### مشكلة التبعيات:
```bash
# حذف وإعادة تثبيت
rm -rf node_modules
npm install
```

---

## 📚 التوثيق الإضافي

- [`setup-guide.md`](./setup-guide.md) - دليل الإعداد المفصل
- [`antivirus-solution.md`](./antivirus-solution.md) - حل مشاكل مكافح الفيروسات
- [`api-documentation.md`](./api-documentation.md) - توثيق API
- [`INDEX.md`](./INDEX.md) - فهرس التوثيق الشامل

---

## ✅ التحقق من التشغيل

### الخادم الخلفي:
- ✅ يعرض رسالة "Server running on port 3001"
- ✅ API متاح على http://localhost:3001/api/v1
- ✅ Socket.IO يعمل

### الخادم الأمامي:
- ✅ يعرض "Local: http://localhost:3000"
- ✅ الصفحة تفتح بدون أخطاء
- ✅ يتصل بالخادم الخلفي

---

## 🎉 مبروك!

إذا رأيت كلا الخادمين يعملان، فأنت جاهز للبدء في التطوير!

**التالي**: راجع [`README.md`](./README.md) لفهم بنية المشروع.
