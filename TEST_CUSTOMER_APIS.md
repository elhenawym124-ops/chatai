# 🧪 اختبار Customer APIs

## المتطلبات:
1. تسجيل الدخول أولاً للحصول على Access Token
2. استخدام الرمز المميز في جميع الطلبات

## 1. تسجيل الدخول للحصول على Token
```bash
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

## 2. الحصول على قائمة العملاء
```bash
GET http://localhost:3001/api/v1/customers
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### مع فلترة وترقيم:
```bash
GET http://localhost:3001/api/v1/customers?page=1&limit=10&search=أحمد&status=ACTIVE
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 3. الحصول على عميل محدد
```bash
GET http://localhost:3001/api/v1/customers/CUSTOMER_ID
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 4. إنشاء عميل جديد
```bash
POST http://localhost:3001/api/v1/customers
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "firstName": "محمد",
  "lastName": "أحمد",
  "email": "mohamed.ahmed@example.com",
  "phone": "+966501234567",
  "address": "الرياض، المملكة العربية السعودية",
  "city": "الرياض",
  "country": "السعودية",
  "tags": ["vip", "متكرر"],
  "notes": "عميل مهم",
  "source": "website"
}
```

## 5. تحديث عميل
```bash
PUT http://localhost:3001/api/v1/customers/CUSTOMER_ID
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "firstName": "محمد المحدث",
  "phone": "+966507654321",
  "status": "ACTIVE",
  "tags": ["vip", "متكرر", "محدث"]
}
```

## 6. البحث عن العملاء
```bash
GET http://localhost:3001/api/v1/customers/search?q=محمد
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 7. الحصول على إحصائيات عميل
```bash
GET http://localhost:3001/api/v1/customers/CUSTOMER_ID/stats
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 8. الحصول على تفاعلات العميل
```bash
GET http://localhost:3001/api/v1/customers/CUSTOMER_ID/interactions
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 9. إضافة ملاحظة للعميل
```bash
POST http://localhost:3001/api/v1/customers/CUSTOMER_ID/notes
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "content": "تم التواصل مع العميل اليوم ومناقشة المنتجات الجديدة"
}
```

## 10. الحصول على ملاحظات العميل
```bash
GET http://localhost:3001/api/v1/customers/CUSTOMER_ID/notes
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 11. الحصول على تصنيفات العملاء
```bash
GET http://localhost:3001/api/v1/customers/segments
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 12. تصدير العملاء (CSV)
```bash
GET http://localhost:3001/api/v1/customers/export?format=csv
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 13. تصدير العملاء (JSON)
```bash
GET http://localhost:3001/api/v1/customers/export?format=json
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## اختبار باستخدام JavaScript:

```javascript
// الحصول على Token
const loginResponse = await fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123'
  })
});

const { data: { tokens } } = await loginResponse.json();
const token = tokens.accessToken;

// الحصول على العملاء
const customersResponse = await fetch('http://localhost:3001/api/v1/customers', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const customersData = await customersResponse.json();
console.log('Customers:', customersData);

// إنشاء عميل جديد
const newCustomerResponse = await fetch('http://localhost:3001/api/v1/customers', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'سارة',
    lastName: 'محمد',
    email: 'sara.mohamed@example.com',
    phone: '+966501111111',
    tags: ['جديد'],
    source: 'facebook'
  })
});

const newCustomer = await newCustomerResponse.json();
console.log('New Customer:', newCustomer);

// البحث عن العملاء
const searchResponse = await fetch('http://localhost:3001/api/v1/customers/search?q=سارة', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const searchResults = await searchResponse.json();
console.log('Search Results:', searchResults);
```

## الاستجابات المتوقعة:

### قائمة العملاء:
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": [
    {
      "id": "customer_id",
      "firstName": "أحمد",
      "lastName": "العميل",
      "email": "customer1@example.com",
      "phone": "+966501111111",
      "status": "ACTIVE",
      "tags": ["vip", "loyal"],
      "createdAt": "2024-01-01T12:00:00.000Z",
      "_count": {
        "conversations": 2,
        "orders": 1,
        "notes_rel": 0
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### إحصائيات العميل:
```json
{
  "success": true,
  "message": "Customer statistics retrieved successfully",
  "data": {
    "conversationsCount": 2,
    "ordersCount": 1,
    "totalSpent": 2999.99,
    "averageOrderValue": 2999.99,
    "lastOrderDate": "2024-01-01T12:00:00.000Z",
    "lastConversationDate": "2024-01-01T12:00:00.000Z",
    "customerLifetimeValue": 2999.99,
    "daysSinceLastOrder": 5,
    "daysSinceLastContact": 2
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### تصنيفات العملاء:
```json
{
  "success": true,
  "message": "Customer segments retrieved successfully",
  "data": {
    "total": 3,
    "active": 2,
    "leads": 1,
    "vip": 1,
    "recent": 3,
    "segments": [
      { "name": "All Customers", "count": 3, "percentage": 100 },
      { "name": "Active", "count": 2, "percentage": 66.67 },
      { "name": "Leads", "count": 1, "percentage": 33.33 },
      { "name": "VIP", "count": 1, "percentage": 33.33 },
      { "name": "Recent (30 days)", "count": 3, "percentage": 100 }
    ]
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## ملاحظات مهمة:

1. **المصادقة**: جميع APIs تتطلب Authentication Token
2. **الصلاحيات**: 
   - AGENT: يمكنه رؤية وتحديث العملاء
   - MANAGER/ADMIN: صلاحيات كاملة + حذف العملاء
3. **الفلترة**: يمكن فلترة العملاء حسب الحالة والتاريخ والبحث
4. **التصدير**: متاح للمدراء والأدمن فقط
5. **الأمان**: جميع المدخلات منظفة ومحققة

## العملاء التجريبيين المتاحين:
- أحمد العميل (customer1@example.com)
- فاطمة الزبون (customer2@example.com)
- عميل آخر

يمكنك استخدام IDs هؤلاء العملاء لاختبار APIs المختلفة.
