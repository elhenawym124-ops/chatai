# 🔐 المصادقة والترخيص - Authentication & Authorization

## نظرة عامة

نظام المصادقة في المنصة يستخدم JWT (JSON Web Tokens) لضمان أمان الوصول إلى الموارد.

## 🔑 تسجيل الدخول

### POST `/api/v1/auth/login`

تسجيل الدخول للحصول على رمز الوصول.

#### الطلب
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

#### الاستجابة الناجحة (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "اسم المستخدم",
      "role": "admin",
      "companyId": "company_456"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  },
  "message": "تم تسجيل الدخول بنجاح"
}
```

#### أخطاء محتملة
```json
// 401 - بيانات خاطئة
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة"
}

// 429 - محاولات كثيرة
{
  "success": false,
  "error": "TOO_MANY_ATTEMPTS",
  "message": "محاولات تسجيل دخول كثيرة. حاول مرة أخرى بعد 15 دقيقة"
}
```

## 🔄 تجديد الرمز المميز

### POST `/api/v1/auth/refresh`

تجديد رمز الوصول باستخدام refresh token.

#### الطلب
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### الاستجابة الناجحة (200)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "تم تجديد الرمز المميز بنجاح"
}
```

## 🚪 تسجيل الخروج

### POST `/api/v1/auth/logout`

تسجيل الخروج وإلغاء صحة الرموز المميزة.

#### الطلب
```http
POST /api/v1/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### الاستجابة الناجحة (200)
```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

## 👤 معلومات المستخدم الحالي

### GET `/api/v1/auth/me`

الحصول على معلومات المستخدم المسجل حالياً.

#### الطلب
```http
GET /api/v1/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### الاستجابة الناجحة (200)
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "اسم المستخدم",
    "role": "admin",
    "companyId": "company_456",
    "permissions": [
      "read:customers",
      "write:customers",
      "read:products",
      "write:products"
    ],
    "lastLogin": "2024-01-01T10:00:00Z",
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

## 🔒 تغيير كلمة المرور

### PUT `/api/v1/auth/password`

تغيير كلمة المرور للمستخدم الحالي.

#### الطلب
```http
PUT /api/v1/auth/password
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

#### الاستجابة الناجحة (200)
```json
{
  "success": true,
  "message": "تم تغيير كلمة المرور بنجاح"
}
```

## 🔐 الصلاحيات والأدوار

### أنواع الأدوار
- **`super_admin`** - مدير النظام العام
- **`admin`** - مدير الشركة
- **`manager`** - مدير القسم
- **`agent`** - موظف خدمة العملاء
- **`viewer`** - مستخدم للعرض فقط

### الصلاحيات المتاحة
```javascript
// صلاحيات العملاء
"read:customers"     // عرض العملاء
"write:customers"    // إضافة/تعديل العملاء
"delete:customers"   // حذف العملاء

// صلاحيات المنتجات
"read:products"      // عرض المنتجات
"write:products"     // إضافة/تعديل المنتجات
"delete:products"    // حذف المنتجات

// صلاحيات المحادثات
"read:conversations" // عرض المحادثات
"write:conversations"// إرسال الرسائل

// صلاحيات الطلبات
"read:orders"        // عرض الطلبات
"write:orders"       // إنشاء/تعديل الطلبات
"delete:orders"      // حذف الطلبات

// صلاحيات التقارير
"read:reports"       // عرض التقارير
"export:reports"     // تصدير التقارير

// صلاحيات الإعدادات
"read:settings"      // عرض الإعدادات
"write:settings"     // تعديل الإعدادات
```

## 🛡️ حماية نقاط النهاية

### التحقق من الصلاحيات
```http
GET /api/v1/customers
Authorization: Bearer YOUR_ACCESS_TOKEN
X-Required-Permission: read:customers
```

### مثال على رد خطأ الصلاحيات (403)
```json
{
  "success": false,
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "ليس لديك صلاحية للوصول إلى هذا المورد",
  "requiredPermission": "read:customers"
}
```

## 🔧 إعدادات الأمان

### مدة صلاحية الرموز
- **Access Token**: 1 ساعة
- **Refresh Token**: 30 يوم

### سياسة كلمات المرور
- الحد الأدنى: 8 أحرف
- يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، رمز خاص
- لا يمكن استخدام آخر 5 كلمات مرور

### حماية من الهجمات
- **Rate Limiting**: 5 محاولات تسجيل دخول في 15 دقيقة
- **Account Lockout**: قفل الحساب بعد 10 محاولات فاشلة
- **Session Management**: إنهاء الجلسات المتعددة

## 📱 أمثلة عملية

### JavaScript/Node.js
```javascript
// تسجيل الدخول
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const data = await response.json();
const accessToken = data.data.tokens.accessToken;

// استخدام الرمز المميز
const protectedResponse = await fetch('/api/v1/customers', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Python
```python
import requests

# تسجيل الدخول
login_response = requests.post('/api/v1/auth/login', json={
    'email': 'user@example.com',
    'password': 'password'
})

access_token = login_response.json()['data']['tokens']['accessToken']

# استخدام الرمز المميز
headers = {'Authorization': f'Bearer {access_token}'}
customers_response = requests.get('/api/v1/customers', headers=headers)
```

## 🆘 استكشاف الأخطاء

### مشاكل شائعة

#### 1. "Token expired"
```json
{
  "success": false,
  "error": "TOKEN_EXPIRED",
  "message": "انتهت صلاحية الرمز المميز"
}
```
**الحل**: استخدم refresh token لتجديد access token

#### 2. "Invalid token format"
```json
{
  "success": false,
  "error": "INVALID_TOKEN_FORMAT",
  "message": "تنسيق الرمز المميز غير صحيح"
}
```
**الحل**: تأكد من إرسال الرمز بالتنسيق: `Bearer YOUR_TOKEN`

#### 3. "Account locked"
```json
{
  "success": false,
  "error": "ACCOUNT_LOCKED",
  "message": "الحساب مقفل بسبب محاولات تسجيل دخول متعددة"
}
```
**الحل**: انتظر 30 دقيقة أو تواصل مع الدعم الفني

---

**🔐 تذكر: احتفظ بالرموز المميزة آمنة ولا تشاركها مع أحد!**
