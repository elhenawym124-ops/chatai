# 🧪 دليل اختبار النظام الشامل

## 📋 نظرة عامة على النظام

### ✅ المكونات المكتملة:
1. **Backend API** - Node.js + TypeScript + Express
2. **قاعدة البيانات** - MySQL + Prisma ORM
3. **نظام المصادقة** - JWT + RBAC
4. **إدارة العملاء** - CRM كامل
5. **Frontend** - React + TypeScript + Tailwind CSS

### 🔗 الروابط الأساسية:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:3001/api/v1
- **Database Test**: http://localhost:3001/api/v1/test-db

---

## 🔐 اختبار نظام المصادقة

### 1. تسجيل الدخول
```bash
# Test Login API
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**النتيجة المتوقعة:**
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
      "companyId": "company_id"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### 2. اختبار الحسابات التجريبية
| الدور | البريد الإلكتروني | كلمة المرور |
|-------|------------------|-------------|
| Admin | admin@example.com | admin123 |
| Manager | manager@example.com | admin123 |
| Agent 1 | agent1@example.com | admin123 |
| Agent 2 | agent2@example.com | admin123 |

### 3. اختبار الصلاحيات
```bash
# Get Profile (requires auth)
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 👥 اختبار إدارة العملاء

### 1. الحصول على قائمة العملاء
```bash
curl -X GET "http://localhost:3001/api/v1/customers?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. إنشاء عميل جديد
```bash
curl -X POST http://localhost:3001/api/v1/customers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "محمد",
    "lastName": "أحمد",
    "email": "mohamed.test@example.com",
    "phone": "+966501234567",
    "tags": ["test", "new"],
    "source": "api_test"
  }'
```

### 3. البحث عن العملاء
```bash
curl -X GET "http://localhost:3001/api/v1/customers/search?q=محمد" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. إحصائيات العميل
```bash
curl -X GET http://localhost:3001/api/v1/customers/CUSTOMER_ID/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. تصنيفات العملاء
```bash
curl -X GET http://localhost:3001/api/v1/customers/segments \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🗄️ اختبار قاعدة البيانات

### 1. اختبار الاتصال
```bash
curl -X GET http://localhost:3001/api/v1/test-db
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "companies": 1,
    "users": 4,
    "customers": 3,
    "products": 3,
    "orders": 1,
    "conversations": 2
  }
}
```

### 2. التحقق من البيانات التجريبية
- ✅ 1 شركة تجريبية
- ✅ 4 مستخدمين (Admin, Manager, 2 Agents)
- ✅ 3 عملاء تجريبيين
- ✅ 3 منتجات تجريبية
- ✅ طلب واحد تجريبي
- ✅ محادثتان تجريبيتان

---

## 🎨 اختبار واجهة المستخدم

### 1. تشغيل Frontend
```bash
cd frontend
npm start
```

### 2. صفحات متاحة:
- **تسجيل الدخول**: http://localhost:3000/auth/login
- **لوحة التحكم**: http://localhost:3000/dashboard
- **العملاء**: http://localhost:3000/customers

### 3. اختبار تسجيل الدخول
1. افتح http://localhost:3000/auth/login
2. استخدم: admin@example.com / admin123
3. تحقق من التوجيه إلى لوحة التحكم

### 4. اختبار صفحة العملاء
1. انتقل إلى http://localhost:3000/customers
2. تحقق من عرض قائمة العملاء
3. اختبر البحث والفلترة
4. اختبر إضافة عميل جديد

---

## ⚡ اختبار الأداء

### 1. اختبار سرعة الاستجابة
```bash
# Test API response time
time curl -X GET http://localhost:3001/api/v1/customers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. اختبار التحميل
```bash
# Multiple concurrent requests
for i in {1..10}; do
  curl -X GET http://localhost:3001/api/v1/customers \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN" &
done
wait
```

### 3. اختبار Rate Limiting
```bash
# Test login rate limit (5 attempts per 15 minutes)
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo "Attempt $i"
done
```

---

## 🔒 اختبار الأمان

### 1. اختبار المصادقة
```bash
# Try accessing protected route without token
curl -X GET http://localhost:3001/api/v1/customers
# Expected: 401 Unauthorized
```

### 2. اختبار الصلاحيات
```bash
# Try admin-only action with agent token
curl -X DELETE http://localhost:3001/api/v1/customers/CUSTOMER_ID \
  -H "Authorization: Bearer AGENT_TOKEN"
# Expected: 403 Forbidden
```

### 3. اختبار Input Validation
```bash
# Try invalid email format
curl -X POST http://localhost:3001/api/v1/customers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "invalid-email"
  }'
# Expected: 400 Validation Error
```

---

## 📊 اختبار التقارير والإحصائيات

### 1. إحصائيات العملاء
```bash
curl -X GET http://localhost:3001/api/v1/customers/segments \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. تصدير البيانات
```bash
# Export customers as CSV
curl -X GET "http://localhost:3001/api/v1/customers/export?format=csv" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -o customers.csv
```

---

## 🐛 اختبار معالجة الأخطاء

### 1. خطأ 404 - مورد غير موجود
```bash
curl -X GET http://localhost:3001/api/v1/customers/non-existent-id \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. خطأ 400 - بيانات غير صحيحة
```bash
curl -X POST http://localhost:3001/api/v1/customers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. خطأ 409 - تضارب البيانات
```bash
# Try creating customer with existing email
curl -X POST http://localhost:3001/api/v1/customers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "customer1@example.com"
  }'
```

---

## 📝 اختبار السجلات

### 1. التحقق من ملفات السجل
```bash
# Check log files
ls -la backend/logs/
cat backend/logs/combined.log | tail -20
cat backend/logs/error.log | tail -10
```

### 2. اختبار تسجيل الأحداث
```bash
# Perform actions and check logs
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Check if login event is logged
grep "user_logged_in" backend/logs/combined.log
```

---

## ✅ قائمة التحقق النهائية

### Backend:
- [ ] API يعمل على المنفذ 3001
- [ ] قاعدة البيانات متصلة
- [ ] المصادقة تعمل
- [ ] APIs العملاء تعمل
- [ ] Rate Limiting يعمل
- [ ] السجلات تُكتب بشكل صحيح

### Frontend:
- [ ] التطبيق يعمل على المنفذ 3000
- [ ] صفحة تسجيل الدخول تعمل
- [ ] التوجيه يعمل
- [ ] صفحة العملاء تعرض البيانات
- [ ] التصميم متجاوب

### الأمان:
- [ ] المسارات المحمية تتطلب مصادقة
- [ ] الصلاحيات تُطبق بشكل صحيح
- [ ] Input validation يعمل
- [ ] Rate limiting يمنع الإساءة

### الأداء:
- [ ] استجابة سريعة (< 500ms)
- [ ] يتحمل طلبات متعددة
- [ ] الذاكرة مستقرة

---

## 🚀 الخطوات التالية

بعد اجتياز جميع الاختبارات:

1. **تطوير المزيد من الميزات**:
   - تكامل Facebook Messenger
   - تكامل الذكاء الاصطناعي
   - نظام الإشعارات

2. **تحسين الأداء**:
   - إضافة Redis للتخزين المؤقت
   - تحسين استعلامات قاعدة البيانات
   - ضغط الاستجابات

3. **النشر**:
   - إعداد Docker
   - إعداد CI/CD
   - نشر على الخادم

هذا النظام جاهز الآن للاختبار والتطوير المتقدم! 🎉
