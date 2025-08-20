# دليل إعداد Facebook Messenger

## نظرة عامة

تتيح لك منصة التواصل ربط صفحات Facebook الخاصة بشركتك لاستقبال وإرسال الرسائل مباشرة من خلال المنصة. هذا الدليل يوضح كيفية إعداد التكامل بشكل كامل.

## الوصول إلى إعدادات Facebook

### الطريقة الأولى: من صفحة الإعدادات الرئيسية
1. اذهب إلى **الإعدادات** من القائمة الجانبية
2. في قسم **التكاملات**، انقر على **إعدادات** بجانب Facebook Messenger

### الطريقة الثانية: الرابط المباشر
- اذهب مباشرة إلى: `/settings/facebook`

## مميزات صفحة إعدادات Facebook

### 1. عرض الصفحات المربوطة
- قائمة بجميع صفحات Facebook المربوطة
- حالة كل صفحة (متصل/غير متصل)
- معلومات الصفحة (الاسم، الفئة، معرف الصفحة)
- تاريخ الربط

### 2. ربط صفحة جديدة
- نموذج لإدخال معلومات الصفحة الجديدة
- التحقق من صحة البيانات
- ربط الصفحة بالمنصة

### 3. إعدادات Webhook
- عرض Webhook URL المطلوب لإعداد Facebook App
- عرض Verify Token
- قائمة بالصلاحيات المطلوبة
- قائمة بحقول Webhook المطلوبة

### 4. دليل الإعداد التفاعلي
- خطوات مفصلة لإعداد Facebook App
- روابط مفيدة لـ Facebook Developers
- نصائح وإرشادات مهمة

## خطوات الإعداد السريع

### الخطوة 1: إنشاء Facebook App
1. اذهب إلى [Facebook for Developers](https://developers.facebook.com/)
2. انقر على "My Apps" ثم "Create App"
3. اختر "Business" كنوع التطبيق
4. أدخل اسم التطبيق ومعلومات الاتصال

### الخطوة 2: إضافة Messenger Platform
1. في لوحة تحكم التطبيق، انقر على "Add Product"
2. ابحث عن "Messenger" وانقر على "Set Up"

### الخطوة 3: إعداد Webhook
1. في إعدادات Messenger، اذهب إلى "Webhooks"
2. أدخل Webhook URL من صفحة إعدادات Facebook في المنصة
3. أدخل Verify Token من صفحة إعدادات Facebook في المنصة
4. اختر الأحداث المطلوبة

### الخطوة 4: الحصول على Page Access Token
1. في إعدادات Messenger، اذهب إلى "Access Tokens"
2. اختر الصفحة التي تريد ربطها
3. انقر على "Generate Token"
4. انسخ Page Access Token

### الخطوة 5: ربط الصفحة في المنصة
1. في صفحة إعدادات Facebook، انقر على "ربط صفحة جديدة"
2. أدخل اسم الصفحة
3. أدخل Page ID
4. أدخل Page Access Token
5. انقر على "ربط الصفحة"

## المعلومات المطلوبة

### لإعداد Webhook
- **Webhook URL**: يتم عرضه في صفحة الإعدادات
- **Verify Token**: يتم عرضه في صفحة الإعدادات
- **Webhook Fields**: messages, messaging_postbacks, messaging_optins, message_deliveries, message_reads

### لربط الصفحة
- **اسم الصفحة**: الاسم الظاهر للصفحة
- **Page ID**: معرف الصفحة (يمكن العثور عليه في About الصفحة)
- **Page Access Token**: الرمز المميز للوصول للصفحة

## الصلاحيات المطلوبة

عند إعداد Facebook App، تأكد من طلب الصلاحيات التالية:
- `pages_manage_metadata`
- `pages_read_engagement`
- `pages_messaging`
- `pages_show_list`
- `pages_messaging_subscriptions` (مطلوب لإرسال الصور)
- `pages_manage_posts` (مطلوب لإرسال المرفقات)

## استكشاف الأخطاء

### مشكلة: لا تصل الرسائل إلى المنصة
**الحلول:**
1. تحقق من إعداد Webhook بشكل صحيح
2. تأكد من أن Verify Token صحيح
3. تحقق من أن الصفحة منشورة وليست مسودة

### مشكلة: لا يمكن إرسال الرسائل
**الحلول:**
1. تحقق من صحة Page Access Token
2. تأكد من أن الصفحة مربوطة بشكل صحيح
3. تحقق من الصلاحيات المطلوبة

### مشكلة: لا يمكن إرسال الصور (خطأ 400)
**الحلول:**
1. تأكد من وجود صلاحية `pages_messaging_subscriptions`
2. تأكد من وجود صلاحية `pages_manage_posts`
3. تحقق من أن الصورة متاحة عبر HTTPS
4. تأكد من أن حجم الصورة أقل من 25 ميجابايت
5. تحقق من أن صيغة الصورة مدعومة (JPG, PNG, GIF, WEBP)

### مشكلة: خطأ في التحقق من Webhook
**الحلول:**
1. تأكد من أن Webhook URL صحيح ويمكن الوصول إليه
2. تحقق من أن Verify Token يطابق المُعرف في المنصة
3. تأكد من أن الخادم يعمل ويستجيب للطلبات

## نصائح مهمة

1. **احفظ Page Access Token بأمان** - لا تشاركه مع أحد
2. **اختبر التكامل** قبل البدء في استخدامه مع العملاء
3. **راجع سياسات Facebook** للتأكد من الامتثال
4. **احتفظ بنسخة احتياطية** من إعدادات التطبيق

## الدعم الفني

إذا واجهت أي مشاكل في الإعداد:
1. راجع دليل الإعداد التفاعلي في المنصة
2. تحقق من وثائق Facebook Developers
3. تواصل مع فريق الدعم الفني

## روابط مفيدة

- [Facebook for Developers](https://developers.facebook.com/)
- [Messenger Platform Documentation](https://developers.facebook.com/docs/messenger-platform/)
- [Facebook App Review](https://developers.facebook.com/docs/app-review/)
- [Webhook Setup Guide](https://developers.facebook.com/docs/messenger-platform/webhook/)

---

**ملاحظة**: تأكد من أن صفحة Facebook الخاصة بك منشورة ومتاحة للجمهور قبل محاولة ربطها بالمنصة.
