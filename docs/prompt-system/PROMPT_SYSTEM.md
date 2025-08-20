# 📝 نظام البرومبت المخصص
## Custom Prompt System Documentation

## 🎯 **نظرة عامة**

نظام البرومبت المخصص هو القلب الذي يحدد شخصية وسلوك البوت. يتيح للمديرين إنشاء وتخصيص شخصيات مختلفة للبوت حسب احتياجات الشركة والعملاء.

## 🏗️ **بنية النظام**

### **مكونات النظام:**
```mermaid
graph TD
    A[Admin Interface] --> B[Prompt Management]
    B --> C[System Prompts Table]
    C --> D[AI Agent Service]
    D --> E[getCompanyPrompts()]
    E --> F[buildAdvancedPrompt()]
    F --> G[Gemini AI]
```

### **جداول قاعدة البيانات:**
```sql
-- الجدول الرئيسي للبرومبتات
CREATE TABLE system_prompts (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  isActive BOOLEAN DEFAULT false,
  companyId VARCHAR(191),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول إعدادات الذكاء الاصطناعي (احتياطي)
CREATE TABLE ai_settings (
  id VARCHAR(191) PRIMARY KEY,
  companyId VARCHAR(191) NOT NULL,
  personalityPrompt TEXT,
  responsePrompt TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔄 **ترتيب الأولويات**

### **نظام الأولويات الهرمي:**
```javascript
async getCompanyPrompts(companyId) {
  // 1. الأولوية الأولى: system_prompts (البرومبت النشط)
  const activeSystemPrompt = await prisma.systemPrompt.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' }
  });
  
  if (activeSystemPrompt) {
    return {
      personalityPrompt: activeSystemPrompt.content,
      source: 'system_prompt',
      promptName: activeSystemPrompt.name
    };
  }
  
  // 2. الأولوية الثانية: ai_settings
  const aiSettings = await prisma.aiSettings.findFirst({
    where: { companyId }
  });
  
  if (aiSettings && aiSettings.personalityPrompt) {
    return {
      personalityPrompt: aiSettings.personalityPrompt,
      source: 'ai_settings'
    };
  }
  
  // 3. الأولوية الثالثة: company table
  const company = await prisma.company.findUnique({
    where: { id: companyId }
  });
  
  if (company && company.personalityPrompt) {
    return {
      personalityPrompt: company.personalityPrompt,
      source: 'company'
    };
  }
  
  // 4. البرومبت الافتراضي
  return {
    personalityPrompt: null,
    source: 'default'
  };
}
```

## 📝 **بناء البرومبت المتقدم**

### **مراحل البناء:**

#### **1. البرومبت الأساسي**
```javascript
// إذا وجد برومبت مخصص
if (companyPrompts.personalityPrompt) {
  prompt += `${companyPrompts.personalityPrompt}\n\n`;
} else {
  // البرومبت الافتراضي
  prompt += `أنت ساره، مساعدة مبيعات ذكية وطبيعية في متجر إلكتروني:
- تتحدثين بطريقة ودودة ومهنية
- تستخدمين اللغة العربية الواضحة
- تفهمين نية العميل قبل اقتراح المنتجات
- تقدمين معلومات دقيقة من قاعدة البيانات\n\n`;
}
```

#### **2. معلومات العميل**
```javascript
prompt += `معلومات العميل:
- الاسم: ${customerData?.name || 'عميل جديد'}
- الهاتف: ${customerData?.phone || 'غير محدد'}
- عدد الطلبات السابقة: ${customerData?.orderCount || 0}\n\n`;
```

#### **3. ذاكرة المحادثة**
```javascript
if (conversationMemory && conversationMemory.length > 0) {
  prompt += `📚 سجل المحادثة السابقة (للسياق):\n`;
  prompt += `=====================================\n`;
  
  conversationMemory.forEach((interaction, index) => {
    const timeAgo = this.getTimeAgo(new Date(interaction.timestamp));
    prompt += `${index + 1}. منذ ${timeAgo}:\n`;
    prompt += `   العميل: ${interaction.userMessage}\n`;
    prompt += `   ردك: ${interaction.aiResponse}\n\n`;
  });
  
  prompt += `=====================================\n\n`;
}
```

#### **4. بيانات RAG**
```javascript
if (ragData && ragData.length > 0) {
  prompt += `🗃️ المعلومات المتاحة من قاعدة البيانات:\n`;
  prompt += `=====================================\n`;
  
  ragData.forEach((item, index) => {
    if (item.type === 'product') {
      prompt += `🛍️ منتج ${index + 1}: ${item.content}\n`;
    } else if (item.type === 'faq') {
      prompt += `❓ سؤال شائع ${index + 1}: ${item.content}\n`;
    } else if (item.type === 'policy') {
      prompt += `📋 سياسة ${index + 1}: ${item.content}\n`;
    }
  });
  
  prompt += `=====================================\n\n`;
}
```

#### **5. الرسالة والتعليمات النهائية**
```javascript
prompt += `رسالة العميل: "${customerMessage}"\n\n`;

prompt += `🎯 تعليمات الرد النهائية:
1. ✅ استخدمي فقط المعلومات الموجودة في قاعدة البيانات أعلاه
2. 🚫 لا تذكري أي منتجات أو معلومات غير موجودة في القائمة
3. 💰 اذكري الأسعار والتفاصيل الدقيقة كما هي مكتوبة
4. 📝 إذا سأل عن منتجات، اعرضي المنتجات المتاحة بالتفصيل
5. ❌ إذا لم يكن المنتج في القائمة، قولي أنه غير متوفر حالياً
6. 🗣️ استخدمي اللغة العربية الطبيعية والودودة`;
```

## 🎨 **أمثلة البرومبتات**

### **برومبت خدمة عملاء ودود:**
```
انتي اسمك ساره، مساعدة مبيعات ذكية وودودة في متجر إلكتروني.

شخصيتك:
- ودودة ومرحبة دائماً
- تستخدمي اللغة العربية العامية المصرية
- تحبي مساعدة العملاء وتقديم أفضل خدمة
- صبورة ومتفهمة لاحتياجات العملاء

أسلوبك في الرد:
- ابدئي بتحية ودودة
- استخدمي الإيموجي بشكل مناسب 😊
- اسألي عن احتياجات العميل بوضوح
- قدمي المعلومات بطريقة منظمة ومفهومة

معلومات مهمة:
- الشحن مجاني للطلبات فوق 200 جنيه
- الشحن للقاهرة والجيزة: 30 جنيه
- الشحن للمحافظات: 50 جنيه
- يمكن الإرجاع خلال 14 يوم
```

### **برومبت خدمة عملاء رسمي:**
```
أنت مساعد خدمة عملاء محترف في شركة تجارة إلكترونية.

المبادئ الأساسية:
- الاحترافية في التعامل
- الدقة في المعلومات
- السرعة في الاستجابة
- الوضوح في التواصل

إرشادات الرد:
- استخدم اللغة العربية الفصحى
- قدم المعلومات بشكل منظم ومرقم
- اذكر جميع التفاصيل المطلوبة
- تأكد من فهم العميل قبل إنهاء المحادثة

سياسات الشركة:
- ساعات العمل: من 9 صباحاً إلى 6 مساءً
- خدمة العملاء متاحة طوال الأسبوع
- يتم الرد على الاستفسارات خلال 24 ساعة
```

### **برومبت متخصص في المنتجات:**
```
انتي خبيرة منتجات في متجر الأزياء والإكسسوارات.

خبرتك تشمل:
- معرفة تفصيلية بجميع المنتجات
- القدرة على اقتراح المنتجات المناسبة
- معرفة بأحدث صيحات الموضة
- خبرة في تنسيق الألوان والأحجام

عند التعامل مع العملاء:
- اسألي عن المناسبة أو الاستخدام المطلوب
- اقترحي منتجات متكاملة (outfit كامل)
- اذكري تفاصيل الخامات والألوان المتاحة
- قدمي نصائح للعناية بالمنتجات

معلومات المنتجات:
- جميع المنتجات أصلية ومضمونة
- تتوفر مقاسات من S إلى XL
- إمكانية التبديل خلال 7 أيام
- خصومات خاصة للعملاء المميزين
```

## ⚙️ **إدارة البرومبتات**

### **إنشاء برومبت جديد:**
```javascript
// عبر واجهة الإدارة
POST /api/ai/prompts
{
  "name": "خدمة عملاء ودودة",
  "content": "انتي اسمك ساره...",
  "category": "customer_service",
  "isActive": true
}
```

### **تفعيل برومبت:**
```javascript
// تفعيل برومبت معين
PUT /api/ai/prompts/:id/activate
{
  "isActive": true
}

// إلغاء تفعيل جميع البرومبتات الأخرى تلقائياً
```

### **تحديث برومبت:**
```javascript
PUT /api/ai/prompts/:id
{
  "name": "اسم محدث",
  "content": "محتوى محدث...",
  "category": "فئة جديدة"
}
```

## 🧪 **اختبار البرومبتات**

### **اختبار سريع:**
```javascript
// اختبار برومبت قبل التفعيل
POST /api/ai/test-prompt
{
  "promptContent": "البرومبت المراد اختباره...",
  "testMessage": "مرحبا، أريد معرفة المنتجات المتاحة"
}
```

### **مقارنة البرومبتات:**
```javascript
// مقارنة ردود برومبتات مختلفة
POST /api/ai/compare-prompts
{
  "prompts": [
    { "id": "prompt1", "name": "البرومبت الأول" },
    { "id": "prompt2", "name": "البرومبت الثاني" }
  ],
  "testMessage": "رسالة الاختبار"
}
```

## 📊 **مراقبة الأداء**

### **مؤشرات الأداء:**
- **معدل الاستجابة**: سرعة الرد على الرسائل
- **دقة الردود**: مدى صحة المعلومات المقدمة
- **رضا العملاء**: تقييم العملاء للردود
- **معدل التحويل**: نسبة تحويل المحادثات لمبيعات

### **تحليل الاستخدام:**
```javascript
// إحصائيات البرومبت
GET /api/ai/prompts/:id/analytics
{
  "totalUsage": 1250,
  "averageResponseTime": "2.3s",
  "successRate": "94.5%",
  "customerSatisfaction": "4.2/5"
}
```

## 🔧 **أفضل الممارسات**

### **كتابة البرومبت:**
1. **وضوح الهوية**: حدد اسم وشخصية البوت بوضوح
2. **تعليمات محددة**: اكتب تعليمات واضحة ومحددة
3. **أمثلة عملية**: أضف أمثلة للردود المطلوبة
4. **حدود واضحة**: حدد ما يجب وما لا يجب فعله

### **التحسين المستمر:**
1. **مراقبة الأداء**: راقب ردود البوت باستمرار
2. **جمع الملاحظات**: اجمع ملاحظات العملاء والفريق
3. **التحديث الدوري**: حدث البرومبت بناءً على الملاحظات
4. **الاختبار المستمر**: اختبر التغييرات قبل التطبيق

### **إدارة الإصدارات:**
1. **نسخ احتياطية**: احتفظ بنسخ من البرومبتات السابقة
2. **تسجيل التغييرات**: وثق جميع التغييرات والأسباب
3. **اختبار مرحلي**: اختبر على مجموعة محدودة أولاً
4. **خطة الرجوع**: جهز خطة للعودة للإصدار السابق

---

## 📞 **المراجع والدعم**

- [نظام الذكاء الاصطناعي](../ai-system/AI_SYSTEM_OVERVIEW.md)
- [نظام RAG](../rag-system/RAG_SYSTEM.md)
- [دليل المدير](../admin-guide/PROMPT_MANAGEMENT.md)
- [حل مشاكل البرومبت](../troubleshooting/PROMPT_ISSUES.md)
