# منصة التواصل والتجارة الإلكترونية - دليل شامل

منصة شاملة تجمع بين إدارة علاقات العملاء (CRM) والتجارة الإلكترونية مع دعم الذكاء الاصطناعي والتكامل مع منصات التواصل الاجتماعي.

## 🌟 الميزات الرئيسية

### 📱 إدارة التواصل
- **تكامل متعدد القنوات**: فيسبوك ماسنجر، واتساب، تيليجرام، البريد الإلكتروني، الرسائل النصية
- **محادثات موحدة**: إدارة جميع المحادثات من مكان واحد
- **ردود تلقائية ذكية**: باستخدام الذكاء الاصطناعي (Google Gemini)
- **تعيين المحادثات**: توزيع المحادثات على فريق العمل

### 🛒 التجارة الإلكترونية
- **إدارة المنتجات**: كتالوج شامل مع الصور والأوصاف
- **إدارة الطلبات**: تتبع الطلبات من البداية للنهاية
- **بوابات الدفع**: دعم Stripe و PayPal
- **إدارة المخزون**: تتبع المخزون والتنبيهات

### 👥 إدارة العملاء (CRM)
- **ملفات العملاء**: معلومات شاملة وتاريخ التفاعل
- **تصنيف العملاء**: عملاء محتملين، عملاء، عملاء مميزين
- **تتبع الأنشطة**: سجل كامل لجميع التفاعلات
- **تقارير مفصلة**: تحليلات شاملة للأداء

### 📊 التقارير والتحليلات
- **لوحة معلومات تفاعلية**: مؤشرات الأداء الرئيسية
- **تقارير المبيعات**: تحليل الإيرادات والاتجاهات
- **تقارير العملاء**: سلوك العملاء ومعدلات التحويل
- **تقارير الفريق**: أداء الموظفين والإنتاجية

## 🏗️ البنية التقنية

### Backend
- **Node.js** مع **TypeScript**
- **Express.js** للـ API
- **Prisma** لإدارة قاعدة البيانات
- **PostgreSQL** كقاعدة بيانات رئيسية
- **Redis** للتخزين المؤقت والجلسات
- **Socket.IO** للتواصل الفوري
- **JWT** للمصادقة والتفويض

### Frontend
- **React 18** مع **TypeScript**
- **Vite** كأداة البناء
- **Tailwind CSS** للتصميم
- **React Query** لإدارة البيانات
- **Zustand** لإدارة الحالة
- **React Hook Form** للنماذج

### قواعد البيانات والتخزين
- **PostgreSQL 15** - قاعدة البيانات الرئيسية
- **Redis 7** - التخزين المؤقت والجلسات
- **Prisma ORM** - إدارة قاعدة البيانات

### DevOps والنشر
- **Docker** و **Docker Compose**
- **Nginx** كخادم ويب ووكيل عكسي
- **GitHub Actions** للتكامل المستمر
- دعم النشر على **AWS**, **DigitalOcean**, **VPS**

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- Docker و Docker Compose
- Git

### التثبيت

1. **استنساخ المشروع**
```bash
git clone https://github.com/your-username/communication-platform.git
cd communication-platform
```

2. **إعداد متغيرات البيئة**
```bash
# Backend
cp backend/.env.example backend/.env
# Frontend
cp frontend/.env.example frontend/.env
```

3. **تشغيل المشروع بـ Docker**
```bash
# للتطوير
docker-compose up -d

# للتطوير مع أدوات إضافية
docker-compose --profile development up -d

# للإنتاج
docker-compose -f docker-compose.prod.yml up -d
```

4. **إعداد قاعدة البيانات**
```bash
# دخول إلى حاوية Backend
docker exec -it communication-platform-backend bash

# تشغيل migrations
npm run db:migrate

# إدخال البيانات التجريبية
npm run db:seed
```

### الوصول للتطبيق

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database Admin**: http://localhost:8080 (Adminer)
- **Redis Admin**: http://localhost:8081 (Redis Commander)
- **Email Testing**: http://localhost:8025 (MailHog)

### حسابات تجريبية

```
مدير الشركة: admin@example.com / admin123
مشرف: manager@example.com / admin123
وكيل: agent1@example.com / admin123
```

## 📁 هيكل المشروع

```
communication-platform/
├── backend/                 # خادم Node.js
│   ├── src/
│   │   ├── controllers/     # تحكم API
│   │   ├── services/        # منطق العمل
│   │   ├── middleware/      # وسطاء Express
│   │   ├── routes/          # مسارات API
│   │   ├── utils/           # أدوات مساعدة
│   │   └── config/          # إعدادات التطبيق
│   ├── prisma/              # مخططات قاعدة البيانات
│   └── tests/               # اختبارات Backend
├── frontend/                # تطبيق React
│   ├── src/
│   │   ├── components/      # مكونات React
│   │   ├── pages/           # صفحات التطبيق
│   │   ├── hooks/           # React Hooks مخصصة
│   │   ├── services/        # خدمات API
│   │   ├── utils/           # أدوات مساعدة
│   │   └── styles/          # ملفات التصميم
│   └── public/              # ملفات عامة
├── shared/                  # أنواع وأدوات مشتركة
├── nginx/                   # إعدادات Nginx
├── database/                # سكريبت قاعدة البيانات
├── scripts/                 # سكريبت النشر والصيانة
└── docs/                    # وثائق المشروع
```

## 🔧 التطوير

### تشغيل البيئة المحلية

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (في terminal آخر)
cd frontend
npm install
npm run dev

# قاعدة البيانات
docker-compose up postgres redis -d
```

### الأوامر المفيدة

```bash
# Backend
npm run dev              # تشغيل خادم التطوير
npm run build            # بناء للإنتاج
npm run test             # تشغيل الاختبارات
npm run db:migrate       # تشغيل migrations
npm run db:seed          # إدخال بيانات تجريبية
npm run db:reset         # إعادة تعيين قاعدة البيانات

# Frontend
npm run dev              # تشغيل خادم التطوير
npm run build            # بناء للإنتاج
npm run test             # تشغيل الاختبارات
npm run lint             # فحص الكود
npm run format           # تنسيق الكود
```

## 🔐 الأمان

- **مصادقة JWT** مع refresh tokens
- **تشفير كلمات المرور** باستخدام bcrypt
- **حماية CORS** مع إعدادات مخصصة
- **تحديد معدل الطلبات** لمنع الإساءة
- **تنظيف المدخلات** ومنع SQL injection
- **رؤوس أمان HTTP** باستخدام Helmet
- **تشفير HTTPS** في الإنتاج

## 🌐 النشر

### النشر على VPS

1. **إعداد الخادم**
```bash
# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# تثبيت Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **نسخ المشروع**
```bash
git clone https://github.com/your-username/communication-platform.git
cd communication-platform
```

3. **إعداد البيئة**
```bash
cp .env.production.example .env.production
# تحديث المتغيرات حسب بيئة الإنتاج
```

4. **تشغيل الإنتاج**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### النشر على AWS/DigitalOcean

راجع دليل النشر المفصل في `docs/deployment.md`

## 🧪 الاختبارات

```bash
# اختبارات Backend
cd backend
npm run test              # جميع الاختبارات
npm run test:watch        # مراقبة التغييرات
npm run test:coverage     # تقرير التغطية

# اختبارات Frontend
cd frontend
npm run test              # اختبارات الوحدة
npm run test:e2e          # اختبارات شاملة
npm run test:coverage     # تقرير التغطية
```

## 📚 الوثائق

- [دليل API](docs/api.md)
- [دليل قاعدة البيانات](docs/database.md)
- [دليل النشر](docs/deployment.md)
- [دليل المساهمة](docs/contributing.md)
- [الأسئلة الشائعة](docs/faq.md)

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى قراءة [دليل المساهمة](docs/contributing.md) قبل البدء.

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم

- **البريد الإلكتروني**: support@communication-platform.com
- **الوثائق**: https://docs.communication-platform.com
- **المجتمع**: https://discord.gg/communication-platform

## 🙏 شكر وتقدير

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Prisma](https://prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://typescriptlang.org/)

---

صنع بـ ❤️ للمجتمع العربي
