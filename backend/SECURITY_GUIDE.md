# دليل الأمان والعزل - Security & Isolation Guide

## 🛡️ قواعد الأمان الأساسية

### 1. عزل البيانات بين الشركات
- **ALWAYS** تأكد من وجود `companyId` في جميع استعلامات قاعدة البيانات
- **NEVER** استخدم `findMany()` بدون `where` clause
- **ALWAYS** تحقق من `req.user.companyId` قبل الوصول للبيانات

### 2. مصادقة المستخدمين
- **ALWAYS** استخدم `requireAuth` middleware في جميع Routes
- **NEVER** استخدم fallback `companyId` مُثبت في الكود
- **ALWAYS** تحقق من وجود `req.user` و `req.user.companyId`

### 3. أمثلة آمنة

#### ✅ استعلام آمن:
```javascript
const products = await prisma.product.findMany({
  where: { 
    companyId: req.user.companyId,
    isActive: true 
  }
});
```

#### ❌ استعلام غير آمن:
```javascript
const products = await prisma.product.findMany(); // خطر!
```

#### ✅ Route آمن:
```javascript
router.get('/products', requireAuth, async (req, res) => {
  if (!req.user.companyId) {
    return res.status(403).json({ error: 'Company required' });
  }
  // ... باقي الكود
});
```

### 4. Middleware الأمني المتاح

#### companyIsolationMiddleware
```javascript
const { companyIsolationMiddleware } = require('./middleware/companyIsolation');
router.use(companyIsolationMiddleware);
```

#### ensureCompanyIsolation
```javascript
const { ensureCompanyIsolation } = require('./middleware/companyIsolation');
router.get('/products', ensureCompanyIsolation('product'), getProducts);
```

### 5. فحص الأمان

#### تشغيل فحص شامل:
```bash
node deep-isolation-audit.js
```

#### تشغيل فحص سريع:
```bash
node ultimate-smart-isolation-check.js
```

### 6. قائمة التحقق الأمني

- [ ] جميع Routes تحتوي على `requireAuth`
- [ ] جميع استعلامات قاعدة البيانات تحتوي على `companyId`
- [ ] لا توجد `companyId` مُثبتة في الكود
- [ ] جميع Controllers تتحقق من `req.user.companyId`
- [ ] تم اختبار العزل بين الشركات

### 7. الإبلاغ عن المشاكل الأمنية

إذا اكتشفت مشكلة أمنية:
1. **لا تكتب المشكلة في commit message**
2. أبلغ فريق الأمان فوراً
3. استخدم `[SECURITY]` في بداية الرسالة

---

**تذكر: الأمان مسؤولية الجميع! 🛡️**

تم إنشاء هذا الدليل تلقائياً في: 2025-08-17T10:07:03.159Z
