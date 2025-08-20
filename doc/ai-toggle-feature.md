# ميزة تشغيل/إيقاف الذكاء الاصطناعي للمحادثات

## نظرة عامة

تتيح هذه الميزة للمستخدمين تشغيل أو إيقاف الذكاء الاصطناعي لمحادثات محددة، مما يوفر تحكماً دقيقاً في متى يجب أن يرد النظام تلقائياً ومتى يجب أن يبقى صامتاً.

## الوظائف الرئيسية

### 1. التحكم في حالة AI لكل محادثة
- **تشغيل AI**: يقوم النظام بمعالجة الرسائل وإرسال ردود تلقائية
- **إيقاف AI**: يحفظ النظام الرسائل فقط دون إرسال أي ردود

### 2. واجهة مستخدم بديهية
- زر تبديل (Toggle) في واجهة المحادثة
- مؤشر بصري واضح:
  - **أخضر**: AI مُفعل
  - **أحمر**: AI مُعطل

### 3. حفظ الحالة
- تُحفظ حالة AI في قاعدة البيانات لكل محادثة
- الحالة الافتراضية: مُفعل (true)

## التنفيذ التقني

### 1. قاعدة البيانات

```sql
-- حفظ حالة AI في metadata للمحادثة
UPDATE Conversation 
SET metadata = JSON_SET(COALESCE(metadata, '{}'), '$.aiEnabled', false)
WHERE id = 'conversation_id';
```

### 2. API Endpoint

```javascript
PATCH /api/v1/conversations/:conversationId/ai-toggle
```

**Request Body:**
```json
{
  "aiEnabled": true/false
}
```

**Response:**
```json
{
  "success": true,
  "conversationId": "cmehrqu48009ruff8ec01mk8p",
  "aiEnabled": false,
  "customerId": "23949903971327041"
}
```

### 3. Frontend Component

```jsx
// مكون زر التبديل
const AIToggleButton = ({ conversationId, initialState }) => {
  const [aiEnabled, setAiEnabled] = useState(initialState);
  
  const handleToggle = async () => {
    const response = await fetch(`/api/v1/conversations/${conversationId}/ai-toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aiEnabled: !aiEnabled })
    });
    
    if (response.ok) {
      setAiEnabled(!aiEnabled);
    }
  };
  
  return (
    <button 
      onClick={handleToggle}
      className={aiEnabled ? 'ai-enabled' : 'ai-disabled'}
    >
      {aiEnabled ? '🤖 AI مُفعل' : '⏸️ AI مُعطل'}
    </button>
  );
};
```

### 4. Webhook Processing

```javascript
// التحقق من حالة AI قبل المعالجة
async function handleFacebookMessage(conversation, messageData) {
  // التحقق من حالة AI
  console.log('🔍 Checking AI status for conversation:', conversation.id);
  
  try {
    const conversationRecord = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      select: { metadata: true }
    });
    
    // تحليل metadata للحصول على حالة aiEnabled
    let aiEnabled = true; // الافتراضي
    if (conversationRecord?.metadata) {
      const metadata = typeof conversationRecord.metadata === 'string' 
        ? JSON.parse(conversationRecord.metadata) 
        : conversationRecord.metadata;
      aiEnabled = metadata.aiEnabled ?? true;
    }
    
    console.log('🤖 AI Status for conversation:', aiEnabled ? 'ENABLED' : 'DISABLED');
    
    if (!aiEnabled) {
      console.log('⏸️ AI is disabled for this conversation - skipping AI processing');
      console.log('📝 [AI-DISABLED] Message saved but no AI response will be generated');
      return; // الخروج المبكر دون معالجة AI
    }
  } catch (error) {
    console.error('❌ Error checking AI status:', error);
    // المتابعة مع معالجة AI في حالة الخطأ (fail-safe)
  }
  
  // معالجة AI العادية
  console.log('🤖 Processing message with AI Agent...');
  // ... باقي كود المعالجة
}
```

## سجلات النظام (Logs)

### عند تشغيل AI:
```
🔍 Checking AI status for conversation: cmehrqu48009ruff8ec01mk8p
🤖 AI Status for conversation: ENABLED
🤖 Processing message with AI Agent...
📤 Message sent to Facebook user 23949903971327041
```

### عند إيقاف AI:
```
🔍 Checking AI status for conversation: cmehrqu48009ruff8ec01mk8p
🤖 AI Status for conversation: DISABLED
⏸️ AI is disabled for this conversation - skipping AI processing
📝 [AI-DISABLED] Message saved but no AI response will be generated
```

## حالات الاستخدام

### 1. خدمة العملاء اليدوية
- إيقاف AI عندما يريد موظف خدمة العملاء التعامل مع المحادثة يدوياً
- منع التداخل بين الردود التلقائية والردود البشرية

### 2. محادثات حساسة
- إيقاف AI للمحادثات التي تتطلب تدخل بشري
- ضمان عدم إرسال ردود غير مناسبة في مواقف حساسة

### 3. اختبار النظام
- إيقاف AI مؤقتاً لاختبار تدفق الرسائل
- مراقبة سلوك العملاء دون تدخل تلقائي

## الأمان والموثوقية

### 1. Fail-Safe Design
- في حالة فشل التحقق من حالة AI، يستمر النظام بالمعالجة العادية
- منع فقدان الرسائل المهمة

### 2. تسجيل شامل
- تسجيل جميع عمليات تغيير حالة AI
- تتبع دقيق لحالة كل محادثة

### 3. عزل البيانات
- التحقق من صلاحيات الشركة قبل تغيير حالة AI
- ضمان عدم تداخل البيانات بين الشركات

## الاختبار

### اختبار تشغيل AI:
1. تأكد أن الزر أخضر (AI مُفعل)
2. أرسل رسالة من فيسبوك
3. تحقق من وصول رد تلقائي من AI

### اختبار إيقاف AI:
1. اضغط الزر لإيقاف AI (يصبح أحمر)
2. أرسل رسالة من فيسبوك
3. تأكد من عدم وصول أي رد تلقائي

## الصيانة

### مراقبة الأداء
- مراقبة أوقات استجابة API endpoint
- تتبع معدلات نجاح/فشل تغيير الحالة

### تحديث قاعدة البيانات
- تنظيف دوري لبيانات metadata القديمة
- فهرسة مناسبة لتحسين أداء الاستعلامات

## الإصدارات المستقبلية

### ميزات مقترحة:
1. **جدولة تلقائية**: تشغيل/إيقاف AI في أوقات محددة
2. **قواعد ذكية**: إيقاف AI تلقائياً بناءً على محتوى الرسالة
3. **إحصائيات**: تقارير عن استخدام AI لكل محادثة
4. **إشعارات**: تنبيه الموظفين عند إيقاف AI لمحادثة نشطة

---

**تاريخ الإنشاء**: 2025-08-20  
**الإصدار**: 1.0  
**الحالة**: مُختبر ومُطبق بنجاح ✅
