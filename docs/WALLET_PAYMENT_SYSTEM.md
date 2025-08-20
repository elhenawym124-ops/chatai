# 💳 نظام دفع المحافظ الإلكترونية

## 📋 نظرة عامة

تم تطوير نظام دفع شامل ومتكامل يسمح للعملاء بدفع فواتيرهم وتجديد اشتراكاتهم باستخدام المحافظ الإلكترونية المصرية (فودافون كاش، أورانج موني، إتصالات فلوس، CIB Wallet).

## 🎯 المميزات الرئيسية

### ✅ للعملاء
- **صفحة إرشادية بسيطة** لتجديد الاشتراك
- **نسخ سريع** لأرقام المحافظ
- **رفع الإيصالات** مع التحقق من النوع والحجم
- **نظام خطوات متدرج** للدفع
- **واجهة عربية** كاملة ومتجاوبة

### ✅ للإدارة
- **إدارة ديناميكية** لأرقام المحافظ
- **مراجعة الإيصالات** المعلقة
- **تأكيد/رفض المدفوعات** بضغطة واحدة
- **تحديث تلقائي** لحالة الفواتير
- **إنشاء سجل دفع** عند التأكيد

## 🏗️ البنية التقنية

### Backend APIs

#### 📱 APIs العامة
```
GET /api/v1/wallet-payment/wallet-numbers
GET /api/v1/wallet-payment/invoice/{id}
POST /api/v1/wallet-payment/submit-receipt
```

#### 🔐 APIs الإدارة
```
GET /api/v1/wallet-payment/admin/wallet-numbers
POST /api/v1/wallet-payment/admin/wallet-numbers
PUT /api/v1/wallet-payment/admin/wallet-numbers/{id}
DELETE /api/v1/wallet-payment/admin/wallet-numbers/{id}
GET /api/v1/wallet-payment/admin/pending-receipts
POST /api/v1/wallet-payment/admin/approve-receipt/{id}
POST /api/v1/wallet-payment/admin/reject-receipt/{id}
```

### Frontend Pages

#### 👤 صفحات العميل
- `/invoices` - فواتيري
- `/payments` - مدفوعاتي  
- `/subscription` - اشتراكي (صفحة إرشادية)
- `/payment/subscription-renewal` - دفع تجديد الاشتراك

#### 🎛️ صفحات الإدارة
- `/super-admin/wallet-management` - إدارة المحافظ
- `/payment/{invoiceId}` - صفحة دفع الفواتير

## 📊 قاعدة البيانات

### جداول جديدة

#### WalletNumber
```sql
model WalletNumber {
  id          String   @id @default(cuid())
  name        String   // اسم المحفظة
  number      String   // رقم المحفظة
  icon        String   // أيقونة المحفظة
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  receipts    WalletReceipt[]
}
```

#### WalletReceipt
```sql
model WalletReceipt {
  id              String   @id @default(cuid())
  invoiceId       String?  // معرف الفاتورة (اختياري)
  walletNumberId  String   // معرف رقم المحفظة
  receiptImage    String   // مسار صورة الإيصال
  status          String   @default("PENDING") // PENDING, APPROVED, REJECTED
  amount          Float?   // المبلغ (اختياري)
  notes           String?  // ملاحظات
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  invoice         Invoice?     @relation(fields: [invoiceId], references: [id])
  walletNumber    WalletNumber @relation(fields: [walletNumberId], references: [id])
}
```

## 🎨 واجهة المستخدم

### القائمة الجانبية للعميل
تم إضافة قسم جديد **"💳 الفواتير والمدفوعات"**:
- 🧾 فواتيري
- 💰 مدفوعاتي
- 📋 اشتراكي

### القائمة الجانبية للإدارة
تم إضافة:
- 🏦 إدارة المحافظ

## 🔄 سير العمل

### للعميل - دفع الفواتير
1. الدخول لصفحة "فواتيري"
2. الضغط على "دفع" للفاتورة المطلوبة
3. اختيار ونسخ رقم المحفظة
4. إجراء التحويل من التليفون
5. رفع صورة الإيصال
6. إرسال للمراجعة

### للعميل - تجديد الاشتراك
1. الدخول لصفحة "اشتراكي"
2. مراجعة تاريخ التجديد والمبلغ
3. نسخ رقم المحفظة المناسب
4. الضغط على "إرسال إيصال الدفع"
5. اختيار المحفظة ورفع الإيصال
6. تأكيد الإرسال

### للإدارة
1. الدخول لصفحة "إدارة المحافظ"
2. مراجعة الإيصالات المعلقة
3. الضغط على "موافقة" أو "رفض"
4. النظام يحدث حالة الفاتورة تلقائياً
5. إنشاء سجل دفع عند الموافقة

## 🛠️ التثبيت والإعداد

### 1. تحديث قاعدة البيانات
```bash
npx prisma db push
npx prisma generate
```

### 2. إضافة أرقام المحافظ الأولية
```sql
INSERT INTO WalletNumber (id, name, number, icon, isActive) VALUES
('wallet1', 'فودافون كاش', '01234567890', '📱', true),
('wallet2', 'أورانج موني', '01098765432', '🟠', true),
('wallet3', 'إتصالات فلوس', '01156789012', '🔵', true),
('wallet4', 'CIB Wallet', '01087654321', '🏦', true);
```

### 3. إنشاء مجلد الرفع
```bash
mkdir backend/uploads
```

## 🧪 الاختبار

### اختبار APIs
```bash
node backend/test-wallet-system-final.js
```

### اختبار الواجهات
- صفحة الاشتراك: `http://localhost:3000/subscription`
- صفحة دفع التجديد: `http://localhost:3000/payment/subscription-renewal`
- صفحة إدارة المحافظ: `http://localhost:3000/super-admin/wallet-management`

## 🔒 الأمان

### التحقق من الملفات
- **الحجم الأقصى:** 5 ميجابايت
- **الأنواع المسموحة:** صور فقط (JPG, PNG, GIF)
- **التخزين:** مجلد محمي `/uploads`

### التحقق من الصلاحيات
- APIs الإدارة محمية بـ authentication
- APIs العامة متاحة للجميع
- التحقق من ملكية الفواتير

## 📈 الإحصائيات والتقارير

### للعميل
- إجمالي الفواتير
- الفواتير المدفوعة/المعلقة/المتأخرة
- إجمالي المدفوعات
- سجل المدفوعات الكامل

### للإدارة
- الإيصالات المعلقة
- إحصائيات المحافظ
- تقارير المدفوعات

## 🚀 التطوير المستقبلي

### مميزات مقترحة
- **إشعارات فورية** عند تأكيد الدفع
- **تكامل مع APIs المحافظ** للتحقق التلقائي
- **نظام خصومات** للدفع المبكر
- **تقارير متقدمة** للمدفوعات
- **دعم عملات متعددة**

## 📞 الدعم الفني

### مشاكل شائعة
- **خطأ 401:** تأكد من تسجيل الدخول للوصول لصفحات الإدارة
- **فشل رفع الصورة:** تحقق من حجم ونوع الملف
- **عدم ظهور المحافظ:** تأكد من وجود محافظ نشطة في قاعدة البيانات

### ملفات السجلات
- Backend logs: `backend/logs/`
- Upload errors: `backend/uploads/errors.log`

---

**تم التطوير:** أغسطس 2025  
**الحالة:** مكتمل وجاهز للإنتاج  
**المطور:** AI Assistant
