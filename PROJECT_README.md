# 🚀 منصة التواصل التجاري المتكاملة

منصة شاملة للتواصل التجاري مبنية بـ Node.js و React و TypeScript مع دعم الذكاء الاصطناعي وتكامل Facebook Messenger.

## 🌟 الميزات الرئيسية

### ✅ المكتمل حالياً:
- 🔐 **نظام مصادقة متقدم** - JWT + RBAC مع أدوار متعددة
- 👥 **إدارة العملاء (CRM)** - نظام شامل لإدارة العملاء والتفاعلات
- 📊 **قاعدة بيانات متطورة** - MySQL + Prisma ORM مع علاقات معقدة
- 🎨 **واجهة مستخدم حديثة** - React + TypeScript + Tailwind CSS
- 📝 **نظام سجلات متقدم** - تتبع شامل للأحداث والأداء
- 🛡️ **أمان عالي** - Rate limiting + Input validation + CORS
- 📱 **تصميم متجاوب** - يعمل على جميع الأجهزة

### 🔄 قيد التطوير:
- 💬 **تكامل Facebook Messenger** - استقبال وإرسال الرسائل
- 🤖 **الذكاء الاصطناعي** - ردود ذكية باستخدام Google Gemini
- 🛒 **المتجر الإلكتروني** - نظام تجارة إلكترونية كامل
- 🔔 **نظام الإشعارات** - إشعارات فورية متعددة القنوات
- 📈 **التقارير والتحليلات** - لوحات معلومات تفاعلية

## 🏗️ البنية التقنية

### Backend:
- **Node.js** + **TypeScript** + **Express.js**
- **MySQL** + **Prisma ORM**
- **JWT Authentication** + **RBAC**
- **Winston Logging** + **Rate Limiting**

### Frontend:
- **React 18** + **TypeScript**
- **Tailwind CSS** + **Heroicons**
- **React Router** + **React Hook Form**
- **Axios** + **Context API**

### قاعدة البيانات:
- **MySQL 8.0** (Remote Database)
- **Prisma ORM** للإدارة
- **Auto-migrations** + **Seeding**

## 🚀 التشغيل السريع

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd communication-platform
```

### 2. تشغيل Backend
```bash
cd backend
npm install
npm run dev
```
Backend يعمل على: http://localhost:3001

### 3. تشغيل Frontend
```bash
cd frontend
npm install
npm start
```
Frontend يعمل على: http://localhost:3000

### 4. الحسابات التجريبية
| الدور | البريد الإلكتروني | كلمة المرور |
|-------|------------------|-------------|
| Admin | admin@example.com | admin123 |
| Manager | manager@example.com | admin123 |
| Agent 1 | agent1@example.com | admin123 |
| Agent 2 | agent2@example.com | admin123 |

## 📁 هيكل المشروع

```
communication-platform/
├── backend/                 # Node.js Backend
│   ├── src/
│   │   ├── domains/        # Domain-driven design
│   │   │   ├── auth/       # المصادقة
│   │   │   ├── customers/  # إدارة العملاء
│   │   │   └── conversations/ # المحادثات
│   │   ├── shared/         # الكود المشترك
│   │   │   ├── base/       # Base classes
│   │   │   ├── errors/     # معالجة الأخطاء
│   │   │   ├── types/      # TypeScript types
│   │   │   └── utils/      # أدوات مساعدة
│   │   ├── config/         # إعدادات النظام
│   │   └── index.ts        # نقطة البداية
│   ├── prisma/             # قاعدة البيانات
│   │   ├── schema.prisma   # نموذج البيانات
│   │   └── seed.ts         # البيانات التجريبية
│   └── logs/               # ملفات السجل
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # مكونات قابلة للإعادة
│   │   ├── pages/          # صفحات التطبيق
│   │   ├── services/       # خدمات API
│   │   ├── hooks/          # React hooks
│   │   └── types/          # TypeScript types
│   └── public/             # الملفات العامة
├── docs/                   # التوثيق
└── tests/                  # الاختبارات
```

## 🔗 APIs المتاحة

### المصادقة:
- `POST /api/v1/auth/login` - تسجيل الدخول
- `POST /api/v1/auth/register` - التسجيل
- `GET /api/v1/auth/me` - الملف الشخصي
- `POST /api/v1/auth/refresh` - تحديث الرمز المميز

### العملاء:
- `GET /api/v1/customers` - قائمة العملاء
- `POST /api/v1/customers` - إضافة عميل
- `GET /api/v1/customers/:id` - تفاصيل العميل
- `PUT /api/v1/customers/:id` - تحديث العميل
- `GET /api/v1/customers/search` - البحث
- `GET /api/v1/customers/segments` - التصنيفات

## 🧪 الاختبار

### اختبار Backend APIs:
```bash
# تسجيل الدخول
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# الحصول على العملاء
curl -X GET http://localhost:3001/api/v1/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### اختبار قاعدة البيانات:
```bash
curl -X GET http://localhost:3001/api/v1/test-db
```

## 📊 البيانات التجريبية

النظام يأتي مع بيانات تجريبية شاملة:
- **1 شركة** تجريبية
- **4 مستخدمين** بأدوار مختلفة
- **3 عملاء** تجريبيين
- **3 منتجات** تجريبية
- **طلبات ومحادثات** تجريبية

## 🛡️ الأمان

- **JWT Authentication** مع Refresh Tokens
- **Role-Based Access Control (RBAC)**
- **Rate Limiting** لمنع الإساءة
- **Input Validation** شامل
- **CORS** محدود
- **Password Hashing** باستخدام bcrypt
- **SQL Injection Protection** عبر Prisma

## 📝 السجلات

النظام يسجل جميع الأحداث في:
- `logs/combined.log` - جميع السجلات
- `logs/error.log` - الأخطاء فقط
- `logs/performance.log` - الأداء
- Console logs للتطوير

## 🔧 التكوين

### متغيرات البيئة (Backend):
```env
# Database
DATABASE_URL="mysql://username:password@host:port/database"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

### متغيرات البيئة (Frontend):
```env
VITE_API_URL="http://localhost:3001/api/v1"
```

## 📈 الأداء

- **استجابة سريعة**: < 500ms للطلبات العادية
- **Rate Limiting**: حماية من الإساءة
- **Database Indexing**: استعلامات محسنة
- **Lazy Loading**: تحميل تدريجي للواجهة

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم

للدعم والاستفسارات:
- 📧 البريد الإلكتروني: support@example.com
- 📱 الهاتف: +966 50 123 4567
- 💬 الدردشة: متاح في التطبيق

## 🎯 الخطوات التالية

1. **إكمال تكامل Facebook Messenger**
2. **إضافة الذكاء الاصطناعي**
3. **تطوير المتجر الإلكتروني**
4. **نظام الإشعارات المتقدم**
5. **لوحات المعلومات التفاعلية**
6. **تطبيق الجوال**

---

**تم تطوير هذا المشروع بـ ❤️ لخدمة الشركات العربية**
