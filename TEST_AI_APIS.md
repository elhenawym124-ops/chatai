# 🤖 اختبار AI APIs

## المتطلبات:
1. تسجيل الدخول أولاً للحصول على Access Token
2. إعداد Google Gemini API Key في متغيرات البيئة
3. استخدام الرمز المميز في جميع الطلبات

## 1. تسجيل الدخول للحصول على Token
```bash
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

## 2. توليد رد ذكي للعميل
```bash
POST http://localhost:3001/api/v1/ai/generate-response
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "message": "أريد شراء هاتف جديد",
  "customerId": "CUSTOMER_ID",
  "conversationId": "CONVERSATION_ID"
}
```

## 3. تحليل المشاعر
```bash
POST http://localhost:3001/api/v1/ai/analyze-sentiment
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "message": "أنا غير راضي عن الخدمة وأريد استرداد أموالي"
}
```

## 4. توصيات المنتجات
```bash
POST http://localhost:3001/api/v1/ai/recommend-products
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "customerId": "CUSTOMER_ID",
  "context": "العميل يبحث عن هاتف ذكي جديد"
}
```

## 5. الحصول على إعدادات الذكاء الاصطناعي
```bash
GET http://localhost:3001/api/v1/ai/settings
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 6. تحديث إعدادات الذكاء الاصطناعي (للمدراء فقط)
```bash
PUT http://localhost:3001/api/v1/ai/settings
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "promptTemplate": "أنت مساعد خدمة عملاء محترف لشركة {company_name}. كن مهذباً ومفيداً.",
  "autoReplyEnabled": true,
  "confidenceThreshold": 0.8,
  "escalationRules": {
    "negativeSentiment": true,
    "lowConfidence": true,
    "humanRequest": true
  }
}
```

## 7. اختبار الذكاء الاصطناعي
```bash
POST http://localhost:3001/api/v1/ai/test
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "message": "مرحباً، أريد معرفة أسعار الهواتف المتاحة",
  "promptTemplate": "أنت مساعد مبيعات محترف. ساعد العميل في العثور على المنتج المناسب."
}
```

## 8. الحصول على إحصائيات الذكاء الاصطناعي
```bash
GET http://localhost:3001/api/v1/ai/analytics?dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 9. تحليل المحادثة
```bash
GET http://localhost:3001/api/v1/ai/insights/CONVERSATION_ID
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

// توليد رد ذكي
const aiResponse = await fetch('http://localhost:3001/api/v1/ai/generate-response', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'أريد شراء هاتف جديد بسعر معقول',
    customerId: 'customer_id_here'
  })
});

const aiData = await aiResponse.json();
console.log('AI Response:', aiData);

// تحليل المشاعر
const sentimentResponse = await fetch('http://localhost:3001/api/v1/ai/analyze-sentiment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'أنا سعيد جداً بالخدمة الممتازة'
  })
});

const sentimentData = await sentimentResponse.json();
console.log('Sentiment Analysis:', sentimentData);

// توصيات المنتجات
const recommendationsResponse = await fetch('http://localhost:3001/api/v1/ai/recommend-products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customerId: 'customer_id_here',
    context: 'العميل يبحث عن منتجات تقنية'
  })
});

const recommendations = await recommendationsResponse.json();
console.log('Product Recommendations:', recommendations);
```

## الاستجابات المتوقعة:

### توليد رد ذكي:
```json
{
  "success": true,
  "message": "AI response generated successfully",
  "data": {
    "response": "مرحباً! يسعدني مساعدتك في العثور على الهاتف المناسب. لدينا مجموعة رائعة من الهواتف الذكية بأسعار متنوعة. هل تفضل نوعاً معيناً أو لديك ميزانية محددة؟",
    "confidence": 0.85,
    "intent": "purchase",
    "entities": [
      {
        "type": "product_name",
        "value": "هاتف",
        "confidence": 0.9
      }
    ],
    "suggestedActions": ["show_products", "ask_budget"],
    "requiresHumanIntervention": false
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### تحليل المشاعر:
```json
{
  "success": true,
  "message": "Sentiment analysis completed",
  "data": {
    "sentiment": "negative",
    "confidence": 0.92,
    "emotions": ["frustrated", "disappointed", "angry"]
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### توصيات المنتجات:
```json
{
  "success": true,
  "message": "Product recommendations generated",
  "data": [
    {
      "productId": "product_1",
      "productName": "iPhone 15 Pro",
      "reason": "هاتف متطور يناسب احتياجات العميل التقنية",
      "confidence": 0.88
    },
    {
      "productId": "product_2",
      "productName": "Samsung Galaxy S24",
      "reason": "بديل ممتاز بمواصفات عالية وسعر منافس",
      "confidence": 0.82
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### إحصائيات الذكاء الاصطناعي:
```json
{
  "success": true,
  "message": "AI analytics retrieved successfully",
  "data": {
    "totalInteractions": 150,
    "averageConfidence": 0.78,
    "escalationRate": 15.5,
    "intentDistribution": [
      { "intent": "inquiry", "count": 60, "percentage": 40 },
      { "intent": "purchase", "count": 45, "percentage": 30 },
      { "intent": "support", "count": 30, "percentage": 20 },
      { "intent": "complaint", "count": 15, "percentage": 10 }
    ],
    "sentimentDistribution": [
      { "sentiment": "positive", "count": 90, "percentage": 60 },
      { "sentiment": "neutral", "count": 45, "percentage": 30 },
      { "sentiment": "negative", "count": 15, "percentage": 10 }
    ]
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## ملاحظات مهمة:

1. **Google Gemini API Key**: 
   - يجب الحصول على API key من Google AI Studio
   - إضافته في متغير البيئة `GOOGLE_GEMINI_API_KEY`

2. **الصلاحيات**:
   - جميع المستخدمين: توليد الردود وتحليل المشاعر
   - المدراء والأدمن فقط: إعدادات الذكاء الاصطناعي والإحصائيات

3. **معدل الثقة**:
   - أقل من 0.6: يتطلب تدخل بشري
   - 0.6 - 0.8: جيد
   - أكثر من 0.8: ممتاز

4. **تحليل المشاعر**:
   - positive: إيجابي
   - negative: سلبي (قد يتطلب تدخل بشري)
   - neutral: محايد

5. **أنواع النوايا**:
   - inquiry: استفسار
   - purchase: شراء
   - support: دعم فني
   - complaint: شكوى
   - compliment: إطراء
   - other: أخرى

## إعداد Google Gemini:

1. انتقل إلى [Google AI Studio](https://makersuite.google.com/app/apikey)
2. أنشئ API key جديد
3. أضفه في ملف `.env`:
```env
GOOGLE_GEMINI_API_KEY=your-actual-api-key-here
```

## اختبار الميزات:

1. **الردود الذكية**: اختبر رسائل مختلفة وتحقق من جودة الردود
2. **تحليل المشاعر**: اختبر رسائل إيجابية وسلبية ومحايدة
3. **التوصيات**: اختبر مع عملاء مختلفين وسياقات متنوعة
4. **الإعدادات**: اختبر تخصيص القوالب والقواعد
5. **الإحصائيات**: راجع الأداء والاتجاهات

النظام جاهز الآن لتقديم تجربة ذكية ومتطورة للعملاء! 🤖✨
