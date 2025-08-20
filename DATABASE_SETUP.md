# إعداد قاعدة البيانات MySQL

## الطريقة الأولى: تثبيت MySQL محلياً

### 1. تحميل وتثبيت MySQL
- اذهب إلى: https://dev.mysql.com/downloads/mysql/
- حمل MySQL Community Server للويندوز
- ثبت MySQL مع الإعدادات التالية:
  - Root Password: `password`
  - Port: `3306`

### 2. إنشاء قاعدة البيانات
افتح MySQL Command Line أو MySQL Workbench وأدخل:

```sql
CREATE DATABASE communication_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'app_password';
GRANT ALL PRIVILEGES ON communication_platform.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. تحديث ملف .env
تأكد من أن ملف `.env` في مجلد backend يحتوي على:

```env
DATABASE_URL=mysql://root:password@localhost:3306/communication_platform
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=communication_platform
DB_TYPE=mysql
```

## الطريقة الثانية: استخدام Docker (إذا كان متوفراً)

### 1. تثبيت Docker Desktop
- حمل من: https://www.docker.com/products/docker-desktop/
- ثبت وشغل Docker Desktop

### 2. تشغيل قاعدة البيانات
```bash
docker compose up mysql phpmyadmin redis -d
```

### 3. الوصول إلى phpMyAdmin
- افتح المتصفح واذهب إلى: http://localhost:8080
- Username: `root`
- Password: `password`

## تشغيل المشروع مع MySQL

### 1. إنشاء الجداول
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 2. إضافة بيانات تجريبية (اختياري)
```bash
npx prisma db seed
```

### 3. تشغيل Backend
```bash
npm run dev
```

## أوامر مفيدة

### Prisma Commands
```bash
# إنشاء migration جديد
npx prisma migrate dev --name init

# إعادة تعيين قاعدة البيانات
npx prisma migrate reset

# فتح Prisma Studio
npx prisma studio
```

### MySQL Commands
```sql
-- عرض قواعد البيانات
SHOW DATABASES;

-- استخدام قاعدة البيانات
USE communication_platform;

-- عرض الجداول
SHOW TABLES;

-- عرض بنية جدول
DESCRIBE users;
```

## استكشاف الأخطاء

### خطأ الاتصال بقاعدة البيانات
1. تأكد من تشغيل MySQL
2. تحقق من صحة بيانات الاتصال في `.env`
3. تأكد من وجود قاعدة البيانات

### خطأ في Prisma
1. تأكد من تشغيل `npx prisma generate`
2. تحقق من ملف `schema.prisma`
3. جرب `npx prisma db push`

## الروابط المفيدة
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080 (إذا كان Docker يعمل)
- **Prisma Studio**: http://localhost:5555 (بعد تشغيل `npx prisma studio`)

## ملاحظات مهمة
- تأكد من تشغيل MySQL قبل تشغيل Backend
- استخدم `password` كلمة مرور root في التطوير فقط
- في الإنتاج، استخدم كلمات مرور قوية ومعقدة
