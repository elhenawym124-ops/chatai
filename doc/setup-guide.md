# 🚀 دليل تشغيل نظام الدردشة الذكي

## 📋 متطلبات النظام

### البرامج المطلوبة
- **Node.js** (الإصدار 18 أو أحدث)
- **npm** أو **yarn**
- **PostgreSQL** (قاعدة البيانات)
- **Git** (لإدارة الكود)

### متطلبات إضافية
- **مفاتيح Google Gemini API** (للذكاء الصناعي)
- **Facebook Page Access Token** (للتكامل مع فيسبوك)
- **Webhook URL** (للاستقبال من فيسبوك)

## 🔧 خطوات التثبيت

### 1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd test-chat/x4/x
```

### 2. **تثبيت التبعيات**

#### الخادم الخلفي (Backend)
```bash
cd backend
npm install
```

#### الواجهة الأمامية (Frontend)
```bash
cd frontend
npm install
```

### 3. **إعداد قاعدة البيانات**

#### إنشاء قاعدة البيانات
```sql
-- في PostgreSQL
CREATE DATABASE chatbot_db;
CREATE USER chatbot_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chatbot_db TO chatbot_user;
```

#### تطبيق المخططات
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 4. **إعداد متغيرات البيئة**

#### ملف `.env` في مجلد backend
```env
# قاعدة البيانات
DATABASE_URL="postgresql://chatbot_user:your_password@localhost:5432/chatbot_db"

# الخادم
PORT=3001
NODE_ENV=development

# Facebook Integration
FACEBOOK_VERIFY_TOKEN=your_verify_token
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

#### ملف `.env` في مجلد frontend
```env
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_WS_URL=ws://localhost:3001
```

## 🚀 تشغيل النظام

### 1. **تشغيل الخادم الخلفي**
```bash
cd backend
npm start
```

**الإخراج المتوقع:**
```
✅ SimpleMonitor initialized successfully
✅ Socket.IO server initialized
🎉 Clean Server running on port 3001
📱 Frontend URL: http://localhost:3000
🔗 Backend URL: http://localhost:3001
📊 API Base URL: http://localhost:3001/api/v1
🤖 AI Features: ENABLED
✅ AI Agent ready for customer service
```

### 2. **تشغيل الواجهة الأمامية**
```bash
cd frontend
npm start
```

**الإخراج المتوقع:**
```
Compiled successfully!

You can now view the app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

## 🔗 الوصول للنظام

### الروابط الأساسية
- **🌐 الواجهة الأمامية:** http://localhost:3000
- **🔧 الخادم الخلفي:** http://localhost:3001
- **📊 API Documentation:** http://localhost:3001/api/v1
- **🔌 WebSocket:** ws://localhost:3001

### صفحات النظام
- **📱 المحادثات:** http://localhost:3000/conversations-improved
- **📊 الطلبات:** http://localhost:3000/orders-enhanced
- **⚙️ الإعدادات:** http://localhost:3000/settings

## 🧪 اختبار النظام

### 1. **اختبار الاتصال**
```bash
# اختبار الخادم الخلفي
curl http://localhost:3001/api/v1/health

# الاستجابة المتوقعة
{"status":"ok","timestamp":"2025-01-20T12:00:00Z"}
```

### 2. **اختبار قاعدة البيانات**
```bash
cd backend
npx prisma studio
# يفتح واجهة إدارة قاعدة البيانات على http://localhost:5555
```

### 3. **اختبار الذكاء الصناعي**
- إرسال رسالة اختبار من فيسبوك
- مراقبة سجلات الخادم للتأكد من الاستجابة
- التحقق من حفظ الرسائل في قاعدة البيانات

## 🔍 استكشاف الأخطاء

### مشاكل شائعة

#### 1. **خطأ في الاتصال بقاعدة البيانات**
```
Error: P1001: Can't reach database server
```
**الحل:**
- التأكد من تشغيل PostgreSQL
- فحص معلومات الاتصال في `.env`
- اختبار الاتصال: `psql -h localhost -U chatbot_user -d chatbot_db`

#### 2. **خطأ في مفاتيح API**
```
Error: Invalid API key for Gemini
```
**الحل:**
- التحقق من صحة `GEMINI_API_KEY`
- التأكد من تفعيل API في Google Cloud Console
- فحص حدود الاستخدام

#### 3. **خطأ في منافذ الشبكة**
```
Error: Port 3001 is already in use
```
**الحل:**
```bash
# العثور على العملية المستخدمة للمنفذ
netstat -ano | findstr :3001

# إنهاء العملية
taskkill /PID <process_id> /F

# أو تغيير المنفذ في .env
PORT=3002
```

### سجلات النظام

#### مراقبة سجلات الخادم
```bash
# في مجلد backend
tail -f logs/server.log

# أو مراقبة الإخراج المباشر
npm start | tee logs/server.log
```

#### سجلات مهمة للمراقبة
```
✅ Found X real messages:
   👤 Y من العملاء
   🤖 Z من الذكاء الصناعي
   👨‍💼 W يدوية
```

## 🔧 إعدادات متقدمة

### تخصيص الذكاء الصناعي
```javascript
// في backend/src/config/aiConfig.js
module.exports = {
  gemini: {
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    maxTokens: 1000,
    timeout: 30000
  },
  prompts: {
    personality: 'انت اسمك محمد، الشحن 70، لغة رسمية، مفيش نرونه ف التعامل بياع صارم',
    systemRules: [
      'استخدم فقط المعلومات الموجودة في قاعدة البيانات',
      'لا تذكر أي منتجات غير موجودة',
      'كن مهذباً ومفيداً'
    ]
  }
};
```

### تخصيص الواجهة
```css
/* في frontend/src/styles/theme.css */
:root {
  --ai-message-bg: #e8f5e8;
  --manual-message-bg: #e3f2fd;
  --customer-message-bg: #f5f5f5;
  --primary-color: #2196f3;
  --success-color: #4caf50;
}
```

## 📊 مراقبة الأداء

### مؤشرات مهمة
- **وقت الاستجابة:** < 5 ثوانٍ
- **معدل نجاح الذكاء الصناعي:** > 90%
- **استخدام الذاكرة:** < 512 MB
- **استخدام المعالج:** < 50%

### أدوات المراقبة
```bash
# مراقبة استخدام الموارد
htop

# مراقبة سجلات النظام
journalctl -f -u chatbot

# مراقبة قاعدة البيانات
pg_stat_activity
```

## 🔄 التحديث والصيانة

### تحديث التبعيات
```bash
# الخادم الخلفي
cd backend
npm update

# الواجهة الأمامية
cd frontend
npm update
```

### نسخ احتياطية
```bash
# نسخة احتياطية من قاعدة البيانات
pg_dump chatbot_db > backup_$(date +%Y%m%d).sql

# استعادة النسخة الاحتياطية
psql chatbot_db < backup_20250120.sql
```

## 📞 الدعم التقني

### معلومات الاتصال
- **المطور:** فريق التطوير
- **البريد الإلكتروني:** support@chatbot.com
- **الهاتف:** +20 xxx xxx xxxx

### الموارد المفيدة
- **📚 وثائق Prisma:** https://www.prisma.io/docs
- **🤖 وثائق Gemini API:** https://ai.google.dev/docs
- **⚛️ وثائق React:** https://reactjs.org/docs
- **📱 وثائق Facebook API:** https://developers.facebook.com/docs
