# 🧪 اختبار APIs المصادقة

## الحسابات التجريبية المتاحة:

```
Admin: admin@example.com / admin123
Manager: manager@example.com / admin123
Agent 1: agent1@example.com / admin123
Agent 2: agent2@example.com / admin123
```

## 1. تسجيل مستخدم جديد
```bash
POST http://localhost:3001/api/v1/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "أحمد",
  "lastName": "محمد",
  "companyName": "شركة جديدة",
  "phone": "+966501234567"
}
```

## 2. تسجيل الدخول
```bash
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

## 3. الحصول على الملف الشخصي
```bash
GET http://localhost:3001/api/v1/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 4. تحديث الملف الشخصي
```bash
PUT http://localhost:3001/api/v1/auth/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "firstName": "أحمد المحدث",
  "phone": "+966507654321"
}
```

## 5. تغيير كلمة المرور
```bash
POST http://localhost:3001/api/v1/auth/change-password
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "newpassword123"
}
```

## 6. تحديث الرمز المميز
```bash
POST http://localhost:3001/api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

## 7. تسجيل الخروج
```bash
POST http://localhost:3001/api/v1/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

## 8. طلب إعادة تعيين كلمة المرور
```bash
POST http://localhost:3001/api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "admin@example.com"
}
```

## اختبار باستخدام cURL:

### تسجيل الدخول:
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### الحصول على الملف الشخصي:
```bash
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## اختبار باستخدام JavaScript:

```javascript
// تسجيل الدخول
const loginResponse = await fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123'
  })
});

const loginData = await loginResponse.json();
console.log('Login Response:', loginData);

// استخدام الرمز المميز
const profileResponse = await fetch('http://localhost:3001/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${loginData.data.tokens.accessToken}`
  }
});

const profileData = await profileResponse.json();
console.log('Profile Data:', profileData);
```

## الاستجابات المتوقعة:

### نجاح تسجيل الدخول:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "admin@example.com",
      "firstName": "أحمد",
      "lastName": "المدير",
      "role": "COMPANY_ADMIN",
      "companyId": "company_id",
      "company": {
        "id": "company_id",
        "name": "شركة التواصل التجريبية",
        "plan": "PREMIUM"
      }
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### خطأ في المصادقة:
```json
{
  "success": false,
  "message": "Invalid email or password",
  "error": "UNAUTHORIZED",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## ملاحظات مهمة:

1. **الرموز المميزة**: 
   - Access Token صالح لمدة 15 دقيقة
   - Refresh Token صالح لمدة 7 أيام

2. **Rate Limiting**:
   - تسجيل الدخول: 5 محاولات كل 15 دقيقة
   - التسجيل: 3 محاولات كل ساعة
   - إعادة تعيين كلمة المرور: 3 محاولات كل ساعة

3. **الأمان**:
   - كلمات المرور مشفرة باستخدام bcrypt
   - الرموز المميزة موقعة باستخدام JWT
   - Rate limiting لمنع الهجمات

4. **التسجيل**:
   - جميع العمليات مسجلة في ملفات السجل
   - أحداث الأمان مسجلة بشكل منفصل

## الخطوات التالية:
1. اختبار جميع APIs
2. التحقق من Rate Limiting
3. اختبار الأخطاء المختلفة
4. التحقق من السجلات
