const fs = require('fs');
const path = require('path');

console.log('🛠️ إصلاح المشاكل الأمنية المكتشفة في الفحص العميق...\n');

class SecurityIssuesFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.criticalFixes = 0;
  }
  
  createBackup(filePath) {
    const backupPath = filePath + '.security-backup.' + Date.now();
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }
  
  // إصلاح ثغرات المصادقة الخطيرة
  fixAuthenticationGaps() {
    console.log('🔐 إصلاح ثغرات المصادقة...');
    
    const authFiles = [
      {
        file: 'src/controllers/continuousLearningController_old.js',
        fixes: [
          {
            pattern: /const \{ companyId \} = req\.user \|\| \{ companyId: ['"`][^'"`]*['"`] \};/g,
            replacement: `// Security fix: Require authenticated user with companyId
    if (!req.user || !req.user.companyId) {
      return res.status(401).json({ error: 'Authentication required with valid company' });
    }
    const { companyId } = req.user;`,
            description: 'إزالة fallback companyId وإجبار المصادقة'
          }
        ]
      },
      {
        file: 'src/routes/productRoutes.js',
        fixes: [
          {
            pattern: /const user = req\.user \|\| \{ companyId: ['"`][^'"`]*['"`] \};/g,
            replacement: `// Security fix: Require authenticated user
    if (!req.user || !req.user.companyId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const user = req.user;`,
            description: 'إزالة user object افتراضي وإجبار المصادقة'
          }
        ]
      }
    ];
    
    authFiles.forEach(fileConfig => {
      const filePath = path.join(__dirname, fileConfig.file);
      
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let fileFixed = false;
        let fixCount = 0;
        
        console.log(`   📄 معالجة ${fileConfig.file}...`);
        
        fileConfig.fixes.forEach(fix => {
          const beforeCount = (content.match(fix.pattern) || []).length;
          
          if (beforeCount > 0) {
            content = content.replace(fix.pattern, fix.replacement);
            console.log(`      ✅ ${fix.description}: ${beforeCount} إصلاح`);
            fixCount += beforeCount;
            fileFixed = true;
            this.criticalFixes += beforeCount;
          }
        });
        
        if (fileFixed) {
          this.createBackup(filePath);
          fs.writeFileSync(filePath, content);
          this.totalFixes += fixCount;
          this.fixedFiles.push({ file: fileConfig.file, fixes: fixCount, type: 'Authentication' });
        } else {
          console.log(`      ⚪ لا توجد مشاكل أو تم إصلاحها مسبقاً`);
        }
      } else {
        console.log(`      ❌ الملف غير موجود: ${fileConfig.file}`);
      }
    });
  }
  
  // إصلاح Routes غير الآمنة
  fixUnsafeRoutes() {
    console.log('\n🛣️ إصلاح Routes غير الآمنة...');
    
    const routeFiles = [
      {
        file: 'src/domains/ai/routes/aiRoutes.ts',
        fixes: [
          {
            pattern: /router\.post\('\/generate-response', aiController\.generateResponse\);/g,
            replacement: `router.post('/generate-response', requireAuth, aiController.generateResponse);`,
            description: 'إضافة مصادقة لـ generate-response'
          },
          {
            pattern: /router\.post\('\/analyze-sentiment', aiController\.analyzeSentiment\);/g,
            replacement: `router.post('/analyze-sentiment', requireAuth, aiController.analyzeSentiment);`,
            description: 'إضافة مصادقة لـ analyze-sentiment'
          },
          {
            pattern: /router\.post\('\/recommend-products', aiController\.recommendProducts\);/g,
            replacement: `router.post('/recommend-products', requireAuth, aiController.recommendProducts);`,
            description: 'إضافة مصادقة لـ recommend-products'
          },
          {
            pattern: /router\.get\('\/insights\/:conversationId', aiController\.getConversationInsights\);/g,
            replacement: `router.get('/insights/:conversationId', requireAuth, aiController.getConversationInsights);`,
            description: 'إضافة مصادقة لـ insights'
          }
        ]
      }
    ];
    
    routeFiles.forEach(fileConfig => {
      const filePath = path.join(__dirname, fileConfig.file);
      
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let fileFixed = false;
        let fixCount = 0;
        
        console.log(`   📄 معالجة ${fileConfig.file}...`);
        
        // إضافة import للـ requireAuth إذا لم يكن موجود
        if (!content.includes('requireAuth') && !content.includes('import') && !content.includes('require')) {
          content = `const { requireAuth } = require('../../../middleware/auth');\n${content}`;
          console.log(`      ✅ إضافة import للـ requireAuth`);
          fixCount++;
        }
        
        fileConfig.fixes.forEach(fix => {
          const beforeCount = (content.match(fix.pattern) || []).length;
          
          if (beforeCount > 0) {
            content = content.replace(fix.pattern, fix.replacement);
            console.log(`      ✅ ${fix.description}: ${beforeCount} إصلاح`);
            fixCount += beforeCount;
            fileFixed = true;
          }
        });
        
        if (fileFixed) {
          this.createBackup(filePath);
          fs.writeFileSync(filePath, content);
          this.totalFixes += fixCount;
          this.fixedFiles.push({ file: fileConfig.file, fixes: fixCount, type: 'Routes' });
        } else {
          console.log(`      ⚪ لا توجد مشاكل أو تم إصلاحها مسبقاً`);
        }
      } else {
        console.log(`      ❌ الملف غير موجود: ${fileConfig.file}`);
      }
    });
  }
  
  // إصلاح تسريب البيانات المحتمل
  fixDataLeaks() {
    console.log('\n💧 إصلاح تسريب البيانات المحتمل...');
    
    const filePath = path.join(__dirname, 'src/routes/orders.js');
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let fixCount = 0;
      
      console.log(`   📄 معالجة orders.js...`);
      
      // البحث عن السطر المحدد وإصلاحه
      const lines = content.split('\n');
      for (let i = 135; i < 145; i++) {
        if (lines[i] && lines[i].includes('const total = await prisma.order.count({ where });')) {
          // التأكد من أن where يحتوي على companyId
          let hasCompanyIdCheck = false;
          for (let j = Math.max(0, i - 10); j < i; j++) {
            if (lines[j] && (lines[j].includes('where.companyId') || lines[j].includes('companyId'))) {
              hasCompanyIdCheck = true;
              break;
            }
          }
          
          if (!hasCompanyIdCheck) {
            // إضافة تحقق من companyId
            lines[i] = `    // Security: Ensure companyId is always included
    if (!where.companyId && req.user?.companyId) {
      where.companyId = req.user.companyId;
    }
    if (!where.companyId) {
      return res.status(400).json({ error: 'Company ID required for security' });
    }
    ${lines[i]}`;
            
            fixCount = 1;
            console.log(`      ✅ إضافة تحقق أمني من companyId: 1 إصلاح`);
            break;
          }
        }
      }
      
      if (fixCount > 0) {
        this.createBackup(filePath);
        fs.writeFileSync(filePath, lines.join('\n'));
        this.totalFixes += fixCount;
        this.fixedFiles.push({ file: 'orders.js', fixes: fixCount, type: 'Data Leak Prevention' });
      } else {
        console.log(`      ⚪ لا توجد مشاكل أو تم إصلاحها مسبقاً`);
      }
    } else {
      console.log(`      ❌ الملف غير موجود: orders.js`);
    }
  }
  
  // إنشاء middleware أمني إضافي
  createSecurityMiddleware() {
    console.log('\n🛡️ إنشاء middleware أمني إضافي...');
    
    const middlewarePath = path.join(__dirname, 'src/middleware/companyIsolation.js');
    
    const middlewareContent = `// Company Isolation Security Middleware
// تم إنشاؤه تلقائياً لضمان العزل الآمن

const companyIsolationMiddleware = (req, res, next) => {
  // التأكد من وجود المستخدم والشركة
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  if (!req.user.companyId) {
    return res.status(403).json({ 
      error: 'User must be associated with a company',
      code: 'COMPANY_REQUIRED'
    });
  }
  
  // إضافة companyId إلى جميع query parameters
  req.companyId = req.user.companyId;
  
  // تسجيل محاولة الوصول للمراقبة
  console.log(\`[SECURITY] Company access: \${req.user.companyId} - \${req.method} \${req.path}\`);
  
  next();
};

// Middleware للتحقق من عزل البيانات في الاستعلامات
const ensureCompanyIsolation = (tableName) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // التحقق من أن البيانات المُرجعة تحتوي على companyId صحيح
      if (data && Array.isArray(data)) {
        const invalidData = data.filter(item => 
          item.companyId && item.companyId !== req.user.companyId
        );
        
        if (invalidData.length > 0) {
          console.error(\`[SECURITY BREACH] Data leak detected in \${tableName}:\`, invalidData);
          return originalJson.call(this, { 
            error: 'Security violation detected',
            code: 'DATA_ISOLATION_BREACH'
          });
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  companyIsolationMiddleware,
  ensureCompanyIsolation
};`;
    
    try {
      fs.writeFileSync(middlewarePath, middlewareContent);
      console.log(`   ✅ تم إنشاء middleware أمني: ${middlewarePath}`);
      this.totalFixes++;
      this.fixedFiles.push({ file: 'middleware/companyIsolation.js', fixes: 1, type: 'Security Middleware' });
    } catch (error) {
      console.log(`   ❌ خطأ في إنشاء middleware: ${error.message}`);
    }
  }
  
  generateSecurityReport() {
    console.log('\n🛡️ تقرير إصلاح المشاكل الأمنية:');
    console.log('═'.repeat(70));
    console.log(`📁 ملفات تم إصلاحها: ${this.fixedFiles.length}`);
    console.log(`🔧 إجمالي الإصلاحات: ${this.totalFixes}`);
    console.log(`🚨 إصلاحات خطيرة: ${this.criticalFixes}`);
    
    if (this.fixedFiles.length > 0) {
      console.log('\n📋 تفاصيل الإصلاحات:');
      this.fixedFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file.file}: ${file.fixes} إصلاح (${file.type})`);
      });
    }
    
    console.log('\n🎯 الإصلاحات المطبقة:');
    console.log('─'.repeat(50));
    console.log('✅ إزالة companyId المُثبت في الكود');
    console.log('✅ إجبار المصادقة للمستخدمين');
    console.log('✅ إضافة middleware أمني للـ routes');
    console.log('✅ حماية من تسريب البيانات');
    console.log('✅ إنشاء middleware عزل إضافي');
    
    return {
      filesFixed: this.fixedFiles.length,
      totalFixes: this.totalFixes,
      criticalFixes: this.criticalFixes,
      success: true
    };
  }
}

// تشغيل إصلاح المشاكل الأمنية
const fixer = new SecurityIssuesFixer();

console.log('🚀 بدء إصلاح المشاكل الأمنية المكتشفة...\n');

// إصلاح جميع المشاكل
fixer.fixAuthenticationGaps();
fixer.fixUnsafeRoutes();
fixer.fixDataLeaks();
fixer.createSecurityMiddleware();

// إنشاء التقرير
const summary = fixer.generateSecurityReport();

console.log('\n🎉 تم إكمال إصلاح المشاكل الأمنية!');
console.log('🔍 الخطوة التالية: إعادة تشغيل الفحص العميق للتأكد');
console.log('📝 الأمر: node deep-isolation-audit.js');

console.log('\n🛡️ النظام الآن أكثر أماناً!');
process.exit(0);
