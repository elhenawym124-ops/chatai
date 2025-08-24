# 📸 تحليل نظام إرسال الصور للعميل - Image Sending Analysis

## 🎯 متى يتم إرسال الصور للعميل؟

بناءً على تحليل الكود، إليك التفاصيل الكاملة لنظام إرسال الصور:

---

## 🧠 نظام الكشف الذكي لطلب الصور

### 1. **الذكاء الاصطناعي المتقدم**
يستخدم النظام الذكاء الاصطناعي (Gemini) لتحليل رسالة العميل وتحديد إذا كان يطلب صور:

#### معايير التحليل:
```javascript
// في aiAgentService.js - isCustomerRequestingImages()
معايير التحليل:
1. الطلب المباشر للصور: "ممكن صورة"، "ابعتلي صور"، "عايز أشوف صور"
2. الطلب غير المباشر: "عايز أشوف"، "وريني"، "كيف شكله"، "شكله ايه"
3. السياق العام: هل يسأل عن منتج ويريد رؤيته؟
4. النية الضمنية: هل يبدو مهتم برؤية المنتج بصرياً؟
```

#### تجنب الإيجابيات الخاطئة:
```javascript
تجنب الإيجابيات الخاطئة:
- "أشوف المتاح" = يريد معرفة ما متوفر (ليس بالضرورة صور)
- "شوف لي" = قد يعني البحث وليس الصور
- "إيه اللي عندكم" = استفسار عام وليس طلب صور
```

### 2. **النظام الاحتياطي (Fallback)**
إذا فشل الذكاء الاصطناعي، يستخدم النظام كلمات مفتاحية محددة:

```javascript
const explicitImageKeywords = [
  'ممكن صورة', 'ابعتلي صور', 'عايز صور', 'اريد صور',
  'صورة للمنتج', 'صور المنتج', 'وريني صور'
];
```

---

## 🔄 عملية إرسال الصور

### الخطوة 1: **تحليل الطلب**
```javascript
// في getSmartResponse()
const wantsImages = await this.isCustomerRequestingImages(customerMessage, conversationMemory, companyId);
```

### الخطوة 2: **البحث عن المنتج**
```javascript
if (wantsImages) {
  // البحث عن منتج محدد
  const specificResult = await ragService.retrieveSpecificProduct(customerMessage, intent, customerId, conversationMemory, companyId);
  
  if (specificResult && specificResult.isSpecific && specificResult.product) {
    // إنشاء الصور من المنتج المحدد
    if (specificResult.product.metadata?.images) {
      const specificImages = specificResult.product.metadata.images.map((imageUrl, index) => ({
        type: 'image',
        payload: {
          url: imageUrl,
          title: `${specificResult.product.metadata.name} - صورة ${index + 1}`
        }
      }));
    }
  }
}
```

### الخطوة 3: **فلترة الصور**
```javascript
// فلترة الصور بناءً على اللون المطلوب
const filteredImages = this.filterImagesByColor(specificImages, customerMessage);
```

### الخطوة 4: **الإرسال الفعلي**
```javascript
// في server.js - webhook handler
if (aiResponse.images && aiResponse.images.length > 0) {
  // فلترة الصور الصالحة
  const validImages = aiResponse.images.filter(image => 
    image && image.payload && image.payload.url
  );
  
  if (validImages.length > 0) {
    // إرسال رسالة تأكيد
    await sendFacebookMessage(senderId, `📸 جاري إرسال ${validImages.length} صور للمنتجات...`, 'TEXT');
    
    // إرسال كل صورة منفصلة
    for (const image of validImages) {
      await sendFacebookMessage(senderId, image.payload.url, 'IMAGE', messagePageId);
      await new Promise(resolve => setTimeout(resolve, 1000)); // تأخير بين الصور
    }
    
    // رسالة متابعة ذكية
    const smartFollowUpMessage = await generateSmartFollowUpMessage(sentCount, validImages, messageText, senderId);
    if (smartFollowUpMessage) {
      await sendFacebookMessage(senderId, smartFollowUpMessage, 'TEXT');
    }
  }
}
```

---

## 📝 أمثلة عملية

### ✅ **رسائل تؤدي لإرسال صور:**

#### الطلب المباشر:
- "ممكن صورة للكوتشي؟"
- "ابعتلي صور الشنطة"
- "عايز أشوف صور المنتج"
- "اريد صور الفستان"

#### الطلب غير المباشر:
- "عايز أشوف الكوتشي"
- "وريني الشنطة"
- "كيف شكل الفستان؟"
- "شكله ايه؟"

#### السياق الضمني:
- "الكوتشي ده حلو، ممكن أشوفه؟"
- "عندكم فساتين؟ عايزة أشوف"

### ❌ **رسائل لا تؤدي لإرسال صور:**

#### الاستفسار العام:
- "أشوف المتاح عندكم"
- "إيه اللي عندكم؟"
- "شوف لي حاجة حلوة"

#### طلب المعلومات:
- "كام سعر الكوتشي؟"
- "متوفر مقاسات ايه؟"
- "الألوان المتاحة ايه؟"

---

## 🔧 الشروط التقنية

### 1. **وجود المنتج**
```javascript
if (specificResult && specificResult.isSpecific && specificResult.product) {
  // المنتج موجود ومحدد
}
```

### 2. **وجود الصور**
```javascript
if (specificResult.product.metadata?.images) {
  // المنتج يحتوي على صور
}
```

### 3. **صحة الصور**
```javascript
const validImages = aiResponse.images.filter(image => {
  if (!image || !image.payload || !image.payload.url) {
    return false; // صورة غير صالحة
  }
  return true; // صورة صالحة
});
```

### 4. **حالة الاتصال**
```javascript
// يجب أن تكون صفحة Facebook متصلة
if (page.status !== 'connected') {
  return res.status(400).json({
    success: false,
    error: `Page status is '${page.status}', not 'connected'`
  });
}
```

---

## 🎯 ميزات متقدمة

### 1. **فلترة الألوان**
```javascript
// إذا طلب العميل لون محدد
const filteredImages = this.filterImagesByColor(specificImages, customerMessage);
```

### 2. **رسائل المتابعة الذكية**
```javascript
// رسالة تأكيد قبل الإرسال
await sendFacebookMessage(senderId, `📸 جاري إرسال ${validImages.length} صور للمنتجات...`);

// رسالة متابعة بعد الإرسال
const smartFollowUpMessage = await generateSmartFollowUpMessage(sentCount, validImages, messageText, senderId);
```

### 3. **حفظ في قاعدة البيانات**
```javascript
// حفظ كل صورة كرسالة منفصلة
const imageMessage = await prisma.message.create({
  data: {
    content: image.payload.url,
    type: 'IMAGE',
    conversationId: conversationId,
    isFromCustomer: false,
    attachments: JSON.stringify([{
      type: 'image',
      url: image.payload.url,
      title: image.title || null
    }])
  }
});
```

---

## 🚨 حالات خاصة

### 1. **عدم وجود صور**
```javascript
if (!specificResult.product.metadata?.images) {
  // إضافة رسالة توضيحية
  ragData.push({
    type: 'system_message',
    content: 'العميل طلب صور لكن لا توجد صور متاحة حالياً للمنتجات المطلوبة'
  });
}
```

### 2. **فشل الإرسال**
```javascript
// النظام الصامت - لا يرسل رسالة خطأ للعميل
console.log('🤐 [SILENT-MODE] Image sending error but no error message sent to customer');
```

### 3. **تحليل الصور المرسلة من العميل**
```javascript
// إذا أرسل العميل صورة
if (attachments && attachments.length > 0) {
  const imageAttachments = attachments.filter(att =>
    att.type === 'image' || 
    (att.payload && att.payload.url && att.payload.url.match(/\.(jpg|jpeg|png|gif|webp)$/i))
  );
  
  // تحليل الصورة وإرسال رد مناسب
  const aiResponse = await this.processImageWithAI(imageContext, messageData, intent, imageResult.productMatch);
}
```

---

## 📊 الخلاصة

**النظام يرسل صور للعميل عندما:**

1. ✅ **يطلب العميل صور** (مباشر أو غير مباشر)
2. ✅ **يوجد منتج محدد** في قاعدة البيانات
3. ✅ **المنتج يحتوي على صور** صالحة
4. ✅ **صفحة Facebook متصلة** وتعمل
5. ✅ **الذكاء الاصطناعي يؤكد** الطلب

**النظام لا يرسل صور عندما:**

1. ❌ العميل لا يطلب صور صراحة
2. ❌ لا يوجد منتج محدد
3. ❌ المنتج لا يحتوي على صور
4. ❌ الصور غير صالحة أو معطوبة
5. ❌ مشاكل تقنية في الاتصال

**النظام ذكي ومتطور ويعتمد على الذكاء الاصطناعي لفهم نوايا العميل بدقة!** 🤖✨
