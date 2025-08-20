# 🔒 Company Isolation Security Rules

هذا المجلد يحتوي على قواعد Semgrep مخصصة للكشف عن مشاكل العزل (Isolation) في النظام متعدد المستأجرين.

## 📁 الملفات

### `isolation-rules.yml`
القواعد الأساسية للكشف عن مشاكل العزل:
- ✅ Prisma queries بدون `companyId` filter
- ✅ API routes بدون company isolation middleware  
- ✅ Raw SQL queries بدون company filtering
- ✅ Hardcoded company IDs
- ✅ Missing authentication في العمليات الحساسة

### `advanced-isolation-rules.yml`
القواعد المتقدمة للكشف عن مشاكل معقدة:
- ✅ OR conditions بدون company isolation
- ✅ Nested queries بدون عزل
- ✅ Transactions بدون فحص العزل
- ✅ File operations بدون company context
- ✅ Cache operations بدون عزل
- ✅ Event emissions بدون company context

## 🚀 كيفية الاستخدام

### التثبيت
```bash
# تثبيت Semgrep
npm run security:install
# أو
pip install semgrep
```

### تشغيل الفحص

#### فحص سريع
```bash
npm run security:quick
```

#### فحص شامل مع تقرير
```bash
npm run security:isolation
```

#### فحص يدوي
```bash
# فحص القواعد الأساسية
semgrep --config=.semgrep/isolation-rules.yml src/

# فحص القواعد المتقدمة
semgrep --config=.semgrep/advanced-isolation-rules.yml src/

# فحص أمان عام
semgrep --config=auto --severity=ERROR src/
```

## 📊 فهم النتائج

### مستويات الخطورة

#### 🔴 ERROR (خطأ حرج)
- مشاكل أمنية خطيرة تحتاج إصلاح فوري
- مثال: Prisma query بدون `companyId` filter
- يمكن أن تؤدي إلى تسريب بيانات بين الشركات

#### 🟡 WARNING (تحذير)
- مشاكل محتملة تحتاج مراجعة
- مثال: API route بدون company isolation middleware
- قد تؤدي إلى مشاكل أمنية في المستقبل

#### 🔵 INFO (معلومات)
- ملاحظات للتحسين
- مثال: Logging بدون company context
- لا تؤثر على الأمان مباشرة

## 🛠️ أمثلة على المشاكل الشائعة

### ❌ مشكلة: Prisma query بدون عزل
```javascript
// خطأ - بدون companyId filter
const users = await prisma.user.findMany({
  where: {
    active: true
  }
});
```

### ✅ الحل الصحيح
```javascript
// صحيح - مع companyId filter
const users = await prisma.user.findMany({
  where: {
    companyId: req.user.companyId,
    active: true
  }
});
```

### ❌ مشكلة: API route بدون middleware
```javascript
// خطأ - بدون company isolation
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
```

### ✅ الحل الصحيح
```javascript
// صحيح - مع company isolation middleware
router.get('/users', requireCompanyAccess, async (req, res) => {
  const users = await prisma.user.findMany({
    where: { companyId: req.user.companyId }
  });
  res.json(users);
});
```

## 🔧 تخصيص القواعد

### إضافة قاعدة جديدة
```yaml
- id: my-custom-rule
  pattern: |
    prisma.$MODEL.customMethod({
      ...
    })
  message: "Custom isolation check message"
  languages: [javascript, typescript]
  severity: ERROR
```

### استثناء ملفات معينة
```yaml
paths:
  exclude:
    - "src/migrations/"
    - "src/seeds/"
    - "tests/"
```

## 📈 التكامل مع CI/CD

### GitHub Actions
```yaml
- name: Security Scan
  run: |
    pip install semgrep
    npm run security:isolation
    
- name: Upload Security Report
  uses: actions/upload-artifact@v2
  with:
    name: security-report
    path: backend/reports/
```

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
npm run security:quick
if [ $? -ne 0 ]; then
  echo "❌ Security issues found. Please fix before committing."
  exit 1
fi
```

## 🎯 أفضل الممارسات

### 1. فحص دوري
- شغل الفحص قبل كل commit
- اعمل فحص شامل أسبوعياً
- راجع التقارير بانتظام

### 2. إصلاح الأولويات
1. **ERROR**: إصلاح فوري مطلوب
2. **WARNING**: مراجعة وإصلاح خلال أسبوع
3. **INFO**: تحسين عند الفرصة

### 3. توثيق الاستثناءات
```javascript
// semgrep-disable: prisma-missing-company-filter
// Reason: This is a system-wide operation that needs access to all companies
const allCompanies = await prisma.company.findMany();
```

## 🚨 حالات الطوارئ

### إذا وجدت مشكلة حرجة:
1. **توقف فوراً** عن استخدام الكود المتأثر
2. **قيم التأثير**: هل تم تسريب بيانات؟
3. **أصلح المشكلة** فوراً
4. **اختبر الإصلاح** بعناية
5. **راجع الكود المشابه** للتأكد من عدم وجود مشاكل أخرى

### للدعم الفني:
- راجع الـ logs في `backend/reports/`
- تحقق من الـ documentation
- اتصل بفريق الأمان إذا لزم الأمر

---

**تذكر**: العزل الصحيح هو أساس أمان النظام متعدد المستأجرين! 🔐
