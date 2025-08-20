# 🛠️ دليل حل المشاكل الشائعة
## Common Issues Troubleshooting Guide

## 🚨 **المشاكل العاجلة**

### **1. النظام لا يرد على الرسائل**

#### **الأعراض:**
- العملاء يرسلون رسائل لكن لا يحصلون على ردود
- لا توجد رسائل في لوحة التحكم
- خطأ في webhook

#### **التشخيص:**
```bash
# فحص حالة الخادم
curl http://localhost:3001/api/health

# فحص webhook فيسبوك
curl -X GET "https://graph.facebook.com/v18.0/me/subscribed_apps?access_token=YOUR_TOKEN"

# فحص اللوج
tail -f backend/logs/app.log
```

#### **الحلول:**
```bash
# 1. إعادة تشغيل الخادم
cd backend && npm restart

# 2. فحص متغيرات البيئة
cat .env | grep FACEBOOK

# 3. فحص اتصال قاعدة البيانات
npx prisma db push

# 4. إعادة تسجيل webhook
node scripts/setup-webhook.js
```

### **2. البوت يرد بمعلومات خاطئة**

#### **الأعراض:**
- البوت يذكر منتجات غير موجودة
- أسعار خاطئة
- معلومات شحن قديمة

#### **التشخيص:**
```bash
# فحص بيانات RAG
node scripts/check-rag-data.js

# فحص البرومبت النشط
curl -X GET http://localhost:3001/api/ai/active-prompt \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **الحلول:**
```bash
# 1. تحديث بيانات RAG
node scripts/update-rag.js

# 2. فحص البرومبت المخصص
# اذهب لصفحة إدارة البرومبت وتأكد من المحتوى

# 3. إعادة تحميل قاعدة المعرفة
curl -X POST http://localhost:3001/api/ai/reload-knowledge
```

### **3. خطأ في قاعدة البيانات**

#### **الأعراض:**
- `Error: P2002: Unique constraint failed`
- `Error: Connection refused`
- `Error: Table doesn't exist`

#### **التشخيص:**
```bash
# فحص حالة MySQL
sudo systemctl status mysql

# فحص الاتصال
mysql -u username -p -e "SELECT 1"

# فحص الجداول
npx prisma studio
```

#### **الحلول:**
```bash
# 1. إعادة تشغيل MySQL
sudo systemctl restart mysql

# 2. إعادة تطبيق المخططات
npx prisma migrate reset
npx prisma migrate dev

# 3. إعادة إنشاء قاعدة البيانات
mysql -u root -p
DROP DATABASE chatbot_db;
CREATE DATABASE chatbot_db;
npx prisma migrate dev
```

## ⚠️ **المشاكل المهمة**

### **4. بطء في الاستجابة**

#### **الأعراض:**
- البوت يستغرق وقت طويل للرد (أكثر من 10 ثوان)
- timeout errors
- العملاء يشتكون من البطء

#### **التشخيص:**
```bash
# فحص أداء الخادم
top
htop

# فحص استعلامات قاعدة البيانات
# في MySQL
SHOW PROCESSLIST;

# فحص لوج الأداء
grep "Processing time" backend/logs/app.log
```

#### **الحلول:**
```bash
# 1. تحسين قاعدة البيانات
# إضافة فهارس
mysql -u root -p chatbot_db
CREATE INDEX idx_conversations_customer ON conversations(customerId);
CREATE INDEX idx_messages_conversation ON messages(conversationId);

# 2. تنظيف البيانات القديمة
node scripts/cleanup-old-data.js

# 3. تحسين إعدادات Gemini
# تقليل طول البرومبت أو استخدام نموذج أسرع
```

### **5. مشاكل مفاتيح Gemini API**

#### **الأعراض:**
- `Error: API key not valid`
- `Error: Quota exceeded`
- `Error: Model not found`

#### **التشخيص:**
```bash
# اختبار مفتاح API
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models

# فحص الحصة المتاحة
node scripts/check-gemini-quota.js
```

#### **الحلول:**
```bash
# 1. تحديث مفتاح API
# اذهب لإعدادات الذكاء الاصطناعي وأضف مفتاح جديد

# 2. تفعيل تدوير المفاتيح
# أضف عدة مفاتيح في النظام

# 3. تحسين استخدام الحصة
# تقليل عدد الطلبات أو استخدام نموذج أقل استهلاكاً
```

### **6. مشاكل تكامل فيسبوك**

#### **الأعراض:**
- `Error: Invalid access token`
- `Error: Webhook verification failed`
- الرسائل لا تصل من فيسبوك

#### **التشخيص:**
```bash
# فحص صحة Token
curl -X GET "https://graph.facebook.com/me?access_token=YOUR_TOKEN"

# فحص webhook
curl -X GET "https://graph.facebook.com/v18.0/YOUR_PAGE_ID/subscribed_apps?access_token=YOUR_TOKEN"
```

#### **الحلول:**
```bash
# 1. تجديد Access Token
# اذهب لـ Facebook Developers وجدد Token

# 2. إعادة تسجيل Webhook
node scripts/setup-facebook-webhook.js

# 3. فحص صلاحيات الصفحة
# تأكد من أن التطبيق له صلاحيات على الصفحة
```

## 🔧 **مشاكل التطوير**

### **7. مشاكل npm install**

#### **الأعراض:**
- `Error: Cannot resolve dependency`
- `Error: Permission denied`
- `Error: Network timeout`

#### **الحلول:**
```bash
# 1. مسح cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 2. استخدام yarn بدلاً من npm
yarn install

# 3. حل مشاكل الصلاحيات
sudo chown -R $(whoami) ~/.npm
```

### **8. مشاكل Prisma**

#### **الأعراض:**
- `Error: Schema parsing error`
- `Error: Migration failed`
- `Error: Client generation failed`

#### **الحلول:**
```bash
# 1. إعادة إنشاء Client
npx prisma generate

# 2. إعادة تطبيق Migration
npx prisma migrate reset
npx prisma migrate dev

# 3. فحص مخطط قاعدة البيانات
npx prisma db pull
npx prisma format
```

### **9. مشاكل Frontend**

#### **الأعراض:**
- صفحة بيضاء
- `Error: Module not found`
- مشاكل في التصميم

#### **الحلول:**
```bash
# 1. مسح cache Next.js
rm -rf .next
npm run dev

# 2. فحص متغيرات البيئة
cat .env.local

# 3. إعادة تثبيت المكتبات
rm -rf node_modules
npm install
```

## 📊 **أدوات التشخيص**

### **سكريبتات مفيدة:**

#### **فحص صحة النظام:**
```bash
#!/bin/bash
# scripts/health-check.sh

echo "🔍 فحص صحة النظام..."

# فحص الخادم
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ الخادم يعمل"
else
    echo "❌ الخادم لا يعمل"
fi

# فحص قاعدة البيانات
if mysql -u $DB_USER -p$DB_PASSWORD -e "SELECT 1" > /dev/null 2>&1; then
    echo "✅ قاعدة البيانات متصلة"
else
    echo "❌ مشكلة في قاعدة البيانات"
fi

# فحص Gemini API
if node scripts/test-gemini.js > /dev/null 2>&1; then
    echo "✅ Gemini API يعمل"
else
    echo "❌ مشكلة في Gemini API"
fi
```

#### **تنظيف البيانات:**
```bash
#!/bin/bash
# scripts/cleanup.sh

echo "🧹 تنظيف البيانات القديمة..."

# حذف المحادثات القديمة (أكثر من 30 يوم)
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
DELETE FROM conversation_memory 
WHERE timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY);
"

# حذف اللوج القديم
find logs/ -name "*.log" -mtime +7 -delete

echo "✅ تم التنظيف"
```

## 📞 **الحصول على المساعدة**

### **خطوات الدعم:**

1. **فحص هذا الدليل** للمشكلة المحددة
2. **تشغيل أدوات التشخيص** المناسبة
3. **جمع معلومات المشكلة:**
   - رسالة الخطأ الكاملة
   - خطوات إعادة إنتاج المشكلة
   - لوج النظام ذات الصلة
4. **البحث في الوثائق** الأخرى
5. **التواصل مع الدعم** مع المعلومات المجمعة

### **معلومات مطلوبة للدعم:**
```bash
# جمع معلومات النظام
echo "نظام التشغيل: $(uname -a)"
echo "إصدار Node.js: $(node --version)"
echo "إصدار npm: $(npm --version)"
echo "إصدار MySQL: $(mysql --version)"

# جمع لوج الأخطاء
tail -n 50 backend/logs/error.log

# جمع إعدادات النظام (بدون كلمات المرور)
cat .env | grep -v PASSWORD | grep -v SECRET | grep -v TOKEN
```

### **قنوات الدعم:**
- **الدعم التقني**: tech-support@company.com
- **دعم المطورين**: dev-support@company.com
- **الدعم العاجل**: urgent-support@company.com

---

## 📚 **مراجع إضافية**

- [مشاكل الذكاء الاصطناعي](AI_ISSUES.md)
- [مشاكل قاعدة البيانات](DATABASE_ISSUES.md)
- [مشاكل التكامل](INTEGRATION_ISSUES.md)
- [دليل الصيانة](../deployment/MONITORING.md)
