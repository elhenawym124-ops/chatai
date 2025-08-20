# 📡 وثائق API - نظام الدردشة الذكي

## 🌐 معلومات عامة

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication
```javascript
// Headers مطلوبة
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### Response Format
```javascript
// نجاح العملية
{
  "success": true,
  "data": {...},
  "message": "تم بنجاح"
}

// فشل العملية
{
  "success": false,
  "error": "رسالة الخطأ",
  "code": "ERROR_CODE"
}
```

## 🔐 المصادقة (Authentication)

### تسجيل الدخول
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "COMPANY_ADMIN",
      "companyId": "company_id"
    }
  }
}
```

### التحقق من المستخدم الحالي
```http
GET /auth/me
Authorization: Bearer <token>
```

## 💬 المحادثات (Conversations)

### جلب جميع المحادثات
```http
GET /conversations
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): رقم الصفحة (افتراضي: 1)
- `limit` (optional): عدد النتائج (افتراضي: 50)
- `search` (optional): البحث في المحادثات

**Response:**
```javascript
{
  "success": true,
  "data": [
    {
      "id": "conv_id",
      "customerName": "اسم العميل",
      "customerPhone": "01234567890",
      "status": "ACTIVE",
      "lastMessageAt": "2025-01-20T12:00:00Z",
      "lastMessagePreview": "آخر رسالة...",
      "unreadCount": 3,
      "aiEnabled": true
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50
}
```

### جلب محادثة محددة
```http
GET /conversations/{conversationId}
Authorization: Bearer <token>
```

### جلب رسائل محادثة
```http
GET /conversations/{conversationId}/messages
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): رقم الصفحة
- `limit` (optional): عدد الرسائل

**Response:**
```javascript
{
  "success": true,
  "data": [
    {
      "id": "msg_id",
      "content": "محتوى الرسالة",
      "type": "TEXT",
      "isFromCustomer": true,
      "isAiGenerated": false,
      "timestamp": "2025-01-20T12:00:00Z",
      "sender": {
        "id": "sender_id",
        "name": "اسم المرسل"
      },
      "metadata": {
        "platform": "facebook",
        "confidence": 0.95,
        "intent": "order_inquiry"
      }
    }
  ],
  "stats": {
    "total": 62,
    "customer": 30,
    "ai": 3,
    "manual": 29
  }
}
```

### إرسال رسالة
```http
POST /conversations/{conversationId}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "محتوى الرسالة",
  "type": "TEXT"
}
```

### تحديث حالة المحادثة
```http
PATCH /conversations/{conversationId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CLOSED",
  "aiEnabled": false
}
```

## 🛒 الطلبات (Orders)

### جلب جميع الطلبات
```http
GET /orders-enhanced
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): حالة الطلب (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- `dateFrom` (optional): من تاريخ (YYYY-MM-DD)
- `dateTo` (optional): إلى تاريخ (YYYY-MM-DD)
- `search` (optional): البحث في الطلبات

**Response:**
```javascript
{
  "success": true,
  "data": [
    {
      "id": "order_id",
      "customerName": "اسم العميل",
      "customerPhone": "01234567890",
      "products": [
        {
          "name": "اسم المنتج",
          "size": "38",
          "color": "أحمر",
          "price": 350,
          "quantity": 1
        }
      ],
      "totalAmount": 420,
      "shippingCost": 70,
      "status": "CONFIRMED",
      "shippingAddress": "العنوان الكامل",
      "createdAt": "2025-01-20T12:00:00Z",
      "conversationId": "conv_id"
    }
  ],
  "total": 25,
  "stats": {
    "pending": 5,
    "confirmed": 15,
    "shipped": 3,
    "delivered": 2,
    "cancelled": 0
  }
}
```

### جلب طلب محدد
```http
GET /orders-enhanced/{orderId}
Authorization: Bearer <token>
```

### إنشاء طلب جديد
```http
POST /orders-enhanced
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerName": "اسم العميل",
  "customerPhone": "01234567890",
  "products": [
    {
      "name": "كوتشي رياضي",
      "size": "42",
      "color": "أسود",
      "price": 350,
      "quantity": 1
    }
  ],
  "shippingAddress": "العنوان الكامل",
  "notes": "ملاحظات إضافية",
  "conversationId": "conv_id"
}
```

### تحديث حالة الطلب
```http
PATCH /orders-enhanced/{orderId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "SHIPPED",
  "trackingNumber": "TRK123456789",
  "notes": "تم الشحن عبر شركة الشحن"
}
```

## 🏢 الشركات (Companies)

### جلب بيانات الشركة الحالية
```http
GET /companies/current
Authorization: Bearer <token>
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "id": "company_id",
    "name": "اسم الشركة",
    "phone": "01234567890",
    "email": "info@company.com",
    "address": "عنوان الشركة",
    "settings": {
      "aiEnabled": true,
      "autoReply": true,
      "workingHours": {
        "start": "09:00",
        "end": "18:00"
      }
    },
    "subscription": {
      "plan": "PREMIUM",
      "expiresAt": "2025-12-31T23:59:59Z"
    }
  }
}
```

### تحديث إعدادات الشركة
```http
PATCH /companies/current
Authorization: Bearer <token>
Content-Type: application/json

{
  "settings": {
    "aiEnabled": true,
    "autoReply": false,
    "personalityPrompt": "انت اسمك محمد، الشحن 70"
  }
}
```

## 🤖 الذكاء الصناعي (AI)

### إحصائيات الذكاء الصناعي
```http
GET /ai/stats
Authorization: Bearer <token>
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "totalMessages": 1250,
    "aiMessages": 450,
    "successRate": 0.92,
    "averageResponseTime": 2.3,
    "topIntents": [
      {"intent": "order_inquiry", "count": 120},
      {"intent": "product_question", "count": 85},
      {"intent": "shipping_status", "count": 65}
    ],
    "modelUsage": {
      "gemini-2.0-flash": 320,
      "gemini-2.5-pro": 130
    }
  }
}
```

### تحليل رسالة
```http
POST /ai/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "عايز أعرف سعر الكوتشي الأحمر",
  "conversationId": "conv_id"
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "intent": "product_inquiry",
    "sentiment": "neutral",
    "confidence": 0.89,
    "entities": [
      {"type": "product", "value": "كوتشي"},
      {"type": "color", "value": "أحمر"}
    ],
    "suggestedResponse": "الكوتشي الأحمر متوفر بسعر 350 جنيه..."
  }
}
```

## 📊 التقارير والإحصائيات

### تقرير شامل
```http
GET /reports/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (optional): فترة التقرير (today, week, month, year)
- `dateFrom` (optional): من تاريخ
- `dateTo` (optional): إلى تاريخ

**Response:**
```javascript
{
  "success": true,
  "data": {
    "conversations": {
      "total": 150,
      "active": 45,
      "closed": 105,
      "averageResponseTime": 3.2
    },
    "orders": {
      "total": 85,
      "confirmed": 70,
      "pending": 10,
      "cancelled": 5,
      "totalRevenue": 29750
    },
    "ai": {
      "messagesHandled": 450,
      "successRate": 0.92,
      "escalationRate": 0.08
    },
    "trends": {
      "conversationsGrowth": 0.15,
      "ordersGrowth": 0.23,
      "revenueGrowth": 0.18
    }
  }
}
```

## 🔔 Webhooks

### Facebook Webhook
```http
POST /webhook
Content-Type: application/json

{
  "object": "page",
  "entry": [
    {
      "id": "page_id",
      "time": 1642678800,
      "messaging": [
        {
          "sender": {"id": "user_id"},
          "recipient": {"id": "page_id"},
          "timestamp": 1642678800,
          "message": {
            "mid": "message_id",
            "text": "مرحبا"
          }
        }
      ]
    }
  ]
}
```

### Webhook Verification
```http
GET /webhook?hub.mode=subscribe&hub.challenge=challenge_string&hub.verify_token=verify_token
```

## ⚠️ Error Codes

### Authentication Errors
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Insufficient permissions

### Validation Errors
- `VAL_001`: Missing required fields
- `VAL_002`: Invalid data format
- `VAL_003`: Data too long

### Business Logic Errors
- `BIZ_001`: Conversation not found
- `BIZ_002`: Order already confirmed
- `BIZ_003`: AI service unavailable

### System Errors
- `SYS_001`: Database connection error
- `SYS_002`: External API error
- `SYS_003`: Rate limit exceeded

## 🔧 Rate Limiting

### Limits
- **General API**: 1000 requests/hour per user
- **AI Analysis**: 100 requests/hour per user
- **Webhook**: 10000 requests/hour per page

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642682400
```

## 📝 Examples

### Complete Conversation Flow
```javascript
// 1. Get conversations
const conversations = await fetch('/api/v1/conversations');

// 2. Select conversation
const conversationId = 'conv_123';

// 3. Get messages
const messages = await fetch(`/api/v1/conversations/${conversationId}/messages`);

// 4. Send message
await fetch(`/api/v1/conversations/${conversationId}/messages`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    content: 'مرحبا بك',
    type: 'TEXT'
  })
});
```
