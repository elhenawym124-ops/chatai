# Backend - Communication Platform API

## نظرة عامة

هذا هو الخادم الخلفي لمنصة إدارة التواصل والتجارة الإلكترونية، مبني باستخدام Node.js و TypeScript و Express.js.

## هيكل المجلدات

```
src/
├── controllers/     # وحدات التحكم - معالجة طلبات HTTP
├── services/        # خدمات الأعمال - منطق التطبيق الأساسي
├── models/          # نماذج البيانات - تعريفات Prisma
├── middleware/      # الوسطاء - المصادقة، التحقق، إلخ
├── routes/          # مسارات API - تعريف نقاط النهاية
├── utils/           # أدوات مساعدة - وظائف مشتركة
└── config/          # إعدادات التطبيق - قاعدة البيانات، إلخ
```

## المميزات الرئيسية

### 🔐 نظام المصادقة والترخيص
- JWT Authentication مع Refresh Tokens
- Role-Based Access Control (RBAC)
- إدارة الجلسات مع Redis
- حماية من CSRF و XSS

### 📱 تكامل Facebook Messenger
- Webhook لاستقبال الرسائل
- إرسال الرسائل والردود التلقائية
- دعم الوسائط المتعددة
- إدارة صفحات Facebook

### 🤖 تكامل الذكاء الاصطناعي
- Google Gemini API للردود الذكية
- تحليل مشاعر العملاء
- اقتراحات المنتجات الذكية
- التعلم من التفاعلات

### 🛒 نظام التجارة الإلكترونية
- إدارة المنتجات والفئات
- نظام الطلبات وسلة التسوق
- تكامل بوابات الدفع (Stripe, PayPal)
- إدارة المخزون والشحن

### 👥 نظام إدارة العملاء (CRM)
- قاعدة بيانات العملاء
- تتبع التفاعلات والمحادثات
- تصنيف العملاء وإدارة الفرص
- تحليل قيمة العميل (CLV)

### 📊 التقارير والتحليلات
- تقارير المبيعات والأداء
- إحصائيات المحادثات
- تحليل سلوك العملاء
- KPIs قابلة للتخصيص

### 🔔 نظام الإشعارات
- Push Notifications
- إشعارات البريد الإلكتروني
- رسائل SMS
- تذكيرات مجدولة

## التقنيات المستخدمة

- **Node.js** - بيئة تشغيل JavaScript
- **TypeScript** - لغة برمجة مع أنواع ثابتة
- **Express.js** - إطار عمل الويب
- **Prisma** - ORM لقاعدة البيانات
- **PostgreSQL** - قاعدة البيانات الرئيسية
- **Redis** - التخزين المؤقت والجلسات
- **JWT** - المصادقة والترخيص
- **Socket.io** - التواصل في الوقت الفعلي
- **Multer** - رفع الملفات
- **Nodemailer** - إرسال البريد الإلكتروني
- **Jest** - اختبارات الوحدة

## البدء في التطوير

### المتطلبات
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### التثبيت
```bash
cd backend
npm install
```

### إعداد قاعدة البيانات
```bash
# نسخ ملف البيئة
cp .env.example .env

# تشغيل migrations
npx prisma migrate dev

# إضافة بيانات أولية
npx prisma db seed
```

### تشغيل الخادم
```bash
# وضع التطوير
npm run dev

# وضع الإنتاج
npm run build
npm start
```

## API Documentation

### نقاط النهاية الرئيسية

#### المصادقة
- `POST /api/auth/register` - تسجيل حساب جديد
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/refresh` - تجديد الرمز المميز
- `POST /api/auth/logout` - تسجيل الخروج

#### إدارة العملاء
- `GET /api/customers` - قائمة العملاء
- `POST /api/customers` - إضافة عميل جديد
- `GET /api/customers/:id` - تفاصيل العميل
- `PUT /api/customers/:id` - تحديث العميل

#### المحادثات
- `GET /api/conversations` - قائمة المحادثات
- `POST /api/conversations` - بدء محادثة جديدة
- `GET /api/conversations/:id/messages` - رسائل المحادثة
- `POST /api/conversations/:id/messages` - إرسال رسالة

#### المنتجات
- `GET /api/products` - قائمة المنتجات
- `POST /api/products` - إضافة منتج جديد
- `GET /api/products/:id` - تفاصيل المنتج
- `PUT /api/products/:id` - تحديث المنتج

#### الطلبات
- `GET /api/orders` - قائمة الطلبات
- `POST /api/orders` - إنشاء طلب جديد
- `GET /api/orders/:id` - تفاصيل الطلب
- `PUT /api/orders/:id/status` - تحديث حالة الطلب

## الاختبارات

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل الاختبارات مع التغطية
npm run test:coverage

# تشغيل اختبارات محددة
npm test -- --testNamePattern="Auth"
```

## النشر

```bash
# بناء التطبيق
npm run build

# تشغيل في الإنتاج
npm start
```

## المساهمة

1. إنشاء فرع جديد للميزة
2. كتابة الكود مع الاختبارات
3. التأكد من مرور جميع الاختبارات
4. إرسال Pull Request
