# 📋 نظام الفواتير والاشتراكات - دليل شامل

## 🎯 نظرة عامة

تم تطوير نظام شامل لإدارة الفواتير والاشتراكات للشركات مع واجهات إدارية متقدمة ونظام إشعارات تلقائية.

## 🏗️ البنية التقنية

### 🗄️ قاعدة البيانات (Prisma Schema)

#### جدول الاشتراكات (Subscription)
```prisma
model Subscription {
  id              String   @id @default(cuid())
  companyId       String
  planType        String   // BASIC, PRO, ENTERPRISE
  status          String   // ACTIVE, TRIAL, INACTIVE, CANCELLED, EXPIRED, SUSPENDED
  startDate       DateTime
  endDate         DateTime?
  nextBillingDate DateTime?
  trialEndDate    DateTime?
  billingCycle    String   // monthly, yearly
  price           Float
  currency        String   @default("EGP")
  autoRenew       Boolean  @default(true)
  cancelledAt     DateTime?
  cancelReason    String?
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  company         Company  @relation(fields: [companyId], references: [id])
  invoices        Invoice[]
  payments        Payment[]
}
```

#### جدول الفواتير (Invoice)
```prisma
model Invoice {
  id              String   @id @default(cuid())
  invoiceNumber   String   @unique
  companyId       String
  subscriptionId  String?
  type            String   // SUBSCRIPTION, ONE_TIME, UPGRADE, DOWNGRADE, REFUND
  status          String   // DRAFT, SENT, PAID, OVERDUE, CANCELLED, REFUNDED
  issueDate       DateTime @default(now())
  dueDate         DateTime
  paidDate        DateTime?
  subtotal        Float
  taxAmount       Float    @default(0)
  discountAmount  Float    @default(0)
  totalAmount     Float
  currency        String   @default("EGP")
  paymentTerms    String?
  notes           String?
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  company         Company      @relation(fields: [companyId], references: [id])
  subscription    Subscription? @relation(fields: [subscriptionId], references: [id])
  items           InvoiceItem[]
  payments        Payment[]
}
```

#### جدول عناصر الفاتورة (InvoiceItem)
```prisma
model InvoiceItem {
  id          String  @id @default(cuid())
  invoiceId   String
  description String
  quantity    Float   @default(1)
  unitPrice   Float
  totalPrice  Float
  metadata    Json?
  createdAt   DateTime @default(now())
  
  // Relations
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
}
```

#### جدول المدفوعات (Payment)
```prisma
model Payment {
  id              String   @id @default(cuid())
  paymentNumber   String   @unique
  companyId       String
  invoiceId       String?
  subscriptionId  String?
  amount          Float
  currency        String   @default("EGP")
  status          String   // PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED
  method          String   // CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, PAYPAL, STRIPE, CASH, CHECK
  gateway         String?
  transactionId   String?
  failureReason   String?
  paidAt          DateTime?
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  company         Company       @relation(fields: [companyId], references: [id])
  invoice         Invoice?      @relation(fields: [invoiceId], references: [id])
  subscription    Subscription? @relation(fields: [subscriptionId], references: [id])
}
```

## 🔧 APIs الخلفية

### 📋 APIs الاشتراكات
- `GET /api/v1/admin/subscriptions` - جلب جميع الاشتراكات مع فلترة وبحث
- `POST /api/v1/admin/subscriptions` - إنشاء اشتراك جديد
- `PUT /api/v1/admin/subscriptions/:id` - تحديث اشتراك
- `POST /api/v1/admin/subscriptions/:id/cancel` - إلغاء اشتراك
- `POST /api/v1/admin/subscriptions/:id/renew` - تجديد اشتراك

### 📄 APIs الفواتير
- `GET /api/v1/admin/invoices` - جلب جميع الفواتير مع فلترة وبحث
- `POST /api/v1/admin/invoices` - إنشاء فاتورة جديدة
- `PUT /api/v1/admin/invoices/:id/status` - تحديث حالة الفاتورة
- `POST /api/v1/admin/invoices/:id/send` - إرسال فاتورة
- `GET /api/v1/admin/invoices/stats/overview` - إحصائيات الفواتير

### 💰 APIs المدفوعات
- `GET /api/v1/admin/payments` - جلب جميع المدفوعات مع فلترة وبحث
- `POST /api/v1/admin/payments` - تسجيل مدفوعة جديدة
- `PUT /api/v1/admin/payments/:id/status` - تحديث حالة المدفوعة

### 🔍 معاملات الفلترة والبحث
جميع APIs تدعم:
- `page` - رقم الصفحة
- `limit` - عدد العناصر في الصفحة
- `search` - البحث في النصوص
- `status` - فلترة بالحالة
- `dateFrom` / `dateTo` - فلترة بالتاريخ
- `sortBy` / `sortOrder` - ترتيب النتائج

## 🎨 واجهات المستخدم

### 📋 صفحة إدارة الاشتراكات (`/super-admin/subscriptions`)
**الميزات:**
- عرض جميع الاشتراكات في جدول تفاعلي
- بطاقات إحصائيات (إجمالي، نشط، تجريبي، إيرادات)
- فلاتر متقدمة (حالة، نوع الخطة، بحث)
- إجراءات (عرض فواتير، مدفوعات، تعديل، إلغاء)
- نافذة إنشاء اشتراك جديد
- نافذة إلغاء الاشتراك مع سبب الإلغاء

### 📄 صفحة إدارة الفواتير (`/super-admin/invoices`)
**الميزات:**
- عرض جميع الفواتير مع تفاصيل شاملة
- تبويبات (الفواتير، الإحصائيات)
- فلاتر متقدمة (حالة، نوع، تاريخ)
- إجراءات (عرض تفاصيل، إرسال، تحديد كمدفوعة)
- نافذة إنشاء فاتورة جديدة مع عناصر متعددة
- نافذة عرض تفاصيل الفاتورة الكاملة

### 💰 صفحة إدارة المدفوعات (`/super-admin/payments`)
**الميزات:**
- عرض جميع المدفوعات مع تفاصيل الطريقة
- بطاقات إحصائيات المدفوعات
- فلاتر متقدمة (حالة، طريقة الدفع، تاريخ)
- أيقونات مختلفة لطرق الدفع
- نافذة تسجيل مدفوعة جديدة
- نافذة عرض تفاصيل المدفوعة

## 🔔 نظام الإشعارات التلقائية

### ⏰ الجدولة الزمنية
- **فحص يومي:** 9:00 صباحاً
- **فحص أسبوعي:** الاثنين 10:00 صباحاً

### 📧 أنواع الإشعارات

#### 1. تذكيرات التجديد
- **7 أيام قبل التجديد:** تذكير مبكر
- **3 أيام قبل التجديد:** تذكير متوسط
- **1 يوم قبل التجديد:** تذكير عاجل

#### 2. إشعارات الفواتير المتأخرة
- فحص يومي للفواتير المتأخرة
- تحديث تلقائي لحالة الفاتورة إلى `OVERDUE`
- إرسال إشعار للشركة

#### 3. تذكيرات انتهاء الفترة التجريبية
- **3 أيام قبل الانتهاء:** تذكير مبكر
- **1 يوم قبل الانتهاء:** تذكير عاجل
- **عند الانتهاء:** تحديث الحالة إلى `EXPIRED`

#### 4. إشعارات فشل المدفوعات
- فحص المدفوعات الفاشلة في آخر 24 ساعة
- إرسال إشعار فوري للشركة

#### 5. التقارير الأسبوعية
- إحصائيات الاشتراكات الجديدة والملغية
- إجمالي الإيرادات الأسبوعية
- عدد الفواتير الجديدة والمدفوعة

## 📊 الإحصائيات والتقارير

### 📈 إحصائيات الاشتراكات
- إجمالي الاشتراكات
- توزيع حسب الحالة (نشط، تجريبي، ملغي)
- الإيرادات الشهرية المتوقعة
- معدل النمو

### 📄 إحصائيات الفواتير
- إجمالي الفواتير
- توزيع حسب الحالة (مسودة، مرسلة، مدفوعة، متأخرة)
- إجمالي الإيرادات
- متوسط قيمة الفاتورة

### 💰 إحصائيات المدفوعات
- إجمالي المدفوعات
- توزيع حسب الحالة والطريقة
- إجمالي المبالغ المحصلة
- معدل نجاح المدفوعات

## 🧪 نتائج الاختبار

### ✅ اختبارات ناجحة:
- جلب جميع الاشتراكات: ✅ (2 اشتراكات)
- فلترة الاشتراكات النشطة: ✅ (1 اشتراك)
- فلترة اشتراكات PRO: ✅ (1 اشتراك)
- جلب جميع الفواتير: ✅ (6 فواتير)
- فلترة الفواتير المدفوعة: ✅ (2 فاتورة)
- جلب جميع المدفوعات: ✅ (2 مدفوعة)
- فلترة التحويلات البنكية: ✅ (1 مدفوعة)
- نظام الصفحات: ✅
- فلترة التواريخ: ✅
- الإحصائيات: ✅
- نظام الإشعارات: ✅

## 🚀 كيفية الاستخدام

### 1. الوصول للنظام
```
URL: http://localhost:3000/super-admin/subscriptions
المصادقة: Super Admin فقط
```

### 2. إدارة الاشتراكات
- انتقل إلى صفحة الاشتراكات
- استخدم الفلاتر للبحث
- اضغط "اشتراك جديد" لإنشاء اشتراك
- استخدم الإجراءات لإدارة الاشتراكات

### 3. إدارة الفواتير
- انتقل إلى صفحة الفواتير
- عرض الإحصائيات في التبويب الثاني
- إنشاء فواتير جديدة
- تتبع حالات الدفع

### 4. إدارة المدفوعات
- انتقل إلى صفحة المدفوعات
- تسجيل مدفوعات جديدة
- تتبع طرق الدفع المختلفة

## 🔧 التكوين والصيانة

### متطلبات النظام
- Node.js 18+
- PostgreSQL/MySQL
- Redis (للتخزين المؤقت)

### التبعيات المطلوبة
```bash
npm install node-cron  # للإشعارات التلقائية
```

### تشغيل النظام
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm start
```

### مراقبة النظام
- نظام الإشعارات يعمل تلقائياً
- فحص يومي في 9:00 صباحاً
- فحص أسبوعي يوم الاثنين 10:00 صباحاً

## 📝 ملاحظات مهمة

1. **الأمان:** جميع APIs محمية بنظام مصادقة Super Admin
2. **الأداء:** استخدام فهارس قاعدة البيانات للاستعلامات السريعة
3. **التوسع:** النظام قابل للتوسع لإضافة ميزات جديدة
4. **الصيانة:** نظام تنظيف تلقائي للبيانات القديمة
5. **المراقبة:** سجلات شاملة لجميع العمليات

## 🎯 الخطوات التالية المقترحة

1. **تكامل البريد الإلكتروني:** إضافة خدمة إرسال الإيميلات الفعلية
2. **تصدير PDF:** إضافة إمكانية تصدير الفواتير كـ PDF
3. **لوحة تحكم متقدمة:** إضافة رسوم بيانية وتحليلات متقدمة
4. **API للعملاء:** إنشاء APIs للعملاء لعرض فواتيرهم
5. **تكامل بوابات الدفع:** ربط مع Stripe, PayPal, إلخ

---

**تم إنجاز النظام بنجاح ✅**
**جميع الاختبارات تمت بنجاح ✅**
**النظام جاهز للاستخدام الفوري ✅**
