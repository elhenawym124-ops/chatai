# 🚀 تشغيل سريع مع MySQL

## الخطوات السريعة

### 1. تثبيت MySQL
```bash
# تحميل من الموقع الرسمي
https://dev.mysql.com/downloads/mysql/

# أو استخدام Chocolatey (Windows)
choco install mysql

# أو استخدام XAMPP (يحتوي على MySQL)
https://www.apachefriends.org/download.html
```

### 2. إنشاء قاعدة البيانات
```sql
-- افتح MySQL Command Line أو phpMyAdmin
CREATE DATABASE communication_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. تحديث إعدادات الاتصال
تأكد من أن ملف `backend/.env` يحتوي على:
```env
DATABASE_URL=mysql://root:password@localhost:3306/communication_platform
```
**غير `password` إلى كلمة مرور MySQL الخاصة بك**

### 4. إنشاء الجداول
```bash
cd backend
npx prisma db push
```

### 5. إضافة بيانات تجريبية (اختياري)
```bash
npm run db:seed
```

### 6. تشغيل المشروع
```bash
# Backend
cd backend
npm run dev

# Frontend (في terminal آخر)
cd frontend
npm run dev
```

## اختبار الاتصال

### تحقق من Backend
- افتح: http://localhost:3001/health
- اختبار قاعدة البيانات: http://localhost:3001/api/v1/test-db

### تحقق من Frontend
- افتح: http://localhost:3000

## حل المشاكل الشائعة

### خطأ "Access denied for user"
```bash
# تأكد من كلمة مرور MySQL
mysql -u root -p
# أدخل كلمة المرور الصحيحة
```

### خطأ "Database does not exist"
```sql
-- أنشئ قاعدة البيانات يدوياً
CREATE DATABASE communication_platform;
```

### خطأ "Connection refused"
```bash
# تأكد من تشغيل MySQL
# Windows: افتح Services وابحث عن MySQL
# أو استخدم XAMPP Control Panel
```

## أدوات مفيدة

### MySQL Workbench
- تحميل: https://dev.mysql.com/downloads/workbench/
- أداة رسومية لإدارة MySQL

### phpMyAdmin (مع XAMPP)
- افتح: http://localhost/phpmyadmin
- Username: root
- Password: (فارغ أو كلمة مرور MySQL)

### Prisma Studio
```bash
cd backend
npx prisma studio
# افتح: http://localhost:5555
```

## الخطوات التالية
1. ✅ MySQL يعمل
2. ✅ Backend متصل بقاعدة البيانات
3. ✅ Frontend يعمل
4. 🔄 إضافة المزيد من الميزات

## معلومات مهمة
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **Database**: MySQL على localhost:3306
- **Admin Email**: admin@communication-platform.com
- **Admin Password**: admin123
