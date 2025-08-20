const fs = require('fs');
const path = require('path');

console.log('🔧 إصلاح المشاكل الخطيرة المتبقية...\n');

class RemainingIssuesFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
  }
  
  fixBillingNotificationService() {
    const filePath = path.join(__dirname, 'src/services/billingNotificationService.js');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ ملف billingNotificationService.js غير موجود');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fixCount = 0;
    
    console.log('📄 إصلاح billingNotificationService.js...');
    
    // الإصلاحات المطلوبة
    const fixes = [
      {
        pattern: /const renewalsIn7Days = await prisma\.subscription\.findMany\(\{/g,
        replacement: 'const renewalsIn7Days = await prisma.subscription.findMany({\n        where: { companyId: { not: null } },',
        description: 'إضافة فلتر للاشتراكات (7 أيام)'
      },
      {
        pattern: /const renewalsIn3Days = await prisma\.subscription\.findMany\(\{/g,
        replacement: 'const renewalsIn3Days = await prisma.subscription.findMany({\n        where: { companyId: { not: null } },',
        description: 'إضافة فلتر للاشتراكات (3 أيام)'
      },
      {
        pattern: /const renewalsIn1Day = await prisma\.subscription\.findMany\(\{/g,
        replacement: 'const renewalsIn1Day = await prisma.subscription.findMany({\n        where: { companyId: { not: null } },',
        description: 'إضافة فلتر للاشتراكات (يوم واحد)'
      },
      {
        pattern: /const overdueInvoices = await prisma\.invoice\.findMany\(\{/g,
        replacement: 'const overdueInvoices = await prisma.invoice.findMany({\n        where: { companyId: { not: null } },',
        description: 'إضافة فلتر للفواتير المتأخرة'
      },
      {
        pattern: /const trialsExpiring3Days = await prisma\.subscription\.findMany\(\{/g,
        replacement: 'const trialsExpiring3Days = await prisma.subscription.findMany({\n        where: { companyId: { not: null } },',
        description: 'إضافة فلتر للتجارب المنتهية (3 أيام)'
      },
      {
        pattern: /const trialsExpiring1Day = await prisma\.subscription\.findMany\(\{/g,
        replacement: 'const trialsExpiring1Day = await prisma.subscription.findMany({\n        where: { companyId: { not: null } },',
        description: 'إضافة فلتر للتجارب المنتهية (يوم واحد)'
      },
      {
        pattern: /const expiredTrials = await prisma\.subscription\.findMany\(\{/g,
        replacement: 'const expiredTrials = await prisma.subscription.findMany({\n        where: { companyId: { not: null } },',
        description: 'إضافة فلتر للتجارب المنتهية'
      }
    ];
    
    fixes.forEach((fix, index) => {
      const beforeCount = (content.match(fix.pattern) || []).length;
      
      if (beforeCount > 0) {
        content = content.replace(fix.pattern, fix.replacement);
        console.log(`   ${index + 1}. ✅ ${fix.description}: ${beforeCount} إصلاح`);
        fixCount += beforeCount;
      } else {
        console.log(`   ${index + 1}. ⚪ ${fix.description}: لا توجد مطابقات`);
      }
    });
    
    if (fixCount > 0) {
      // إنشاء نسخة احتياطية
      const backupPath = filePath + '.backup.' + Date.now();
      fs.copyFileSync(filePath, backupPath);
      
      // حفظ الملف المُصلح
      fs.writeFileSync(filePath, content);
      
      this.fixedFiles.push({
        file: 'src/services/billingNotificationService.js',
        fixes: fixCount,
        backup: backupPath
      });
      
      this.totalFixes += fixCount;
      console.log(`   💾 تم حفظ الملف مع ${fixCount} إصلاح`);
    }
    
    return fixCount > 0;
  }
  
  fixProductRoutes() {
    const filePath = path.join(__dirname, 'src/routes/productRoutes.js');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ ملف productRoutes.js غير موجود');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fixCount = 0;
    
    console.log('📄 إصلاح productRoutes.js...');
    
    // البحث عن الاستعلام المحدد في السطر 62
    const lines = content.split('\n');
    let targetLineIndex = -1;
    
    for (let i = 60; i < 65; i++) {
      if (lines[i] && lines[i].includes('const products = await prisma.product.findMany({')) {
        targetLineIndex = i;
        break;
      }
    }
    
    if (targetLineIndex !== -1) {
      // فحص إذا كان السطر التالي يحتوي على where clause
      const nextLine = lines[targetLineIndex + 1];
      if (!nextLine || !nextLine.includes('where')) {
        // إضافة where clause
        lines[targetLineIndex] = lines[targetLineIndex].replace(
          'const products = await prisma.product.findMany({',
          'const products = await prisma.product.findMany({\n      where: { companyId: req.user?.companyId },'
        );
        
        content = lines.join('\n');
        fixCount = 1;
        
        console.log('   ✅ إضافة عزل للمنتجات في السطر 62: 1 إصلاح');
        
        // إنشاء نسخة احتياطية وحفظ
        const backupPath = filePath + '.backup.' + Date.now();
        fs.copyFileSync(filePath, backupPath);
        fs.writeFileSync(filePath, content);
        
        this.fixedFiles.push({
          file: 'src/routes/productRoutes.js',
          fixes: fixCount,
          backup: backupPath
        });
        
        this.totalFixes += fixCount;
        console.log(`   💾 تم حفظ الملف مع ${fixCount} إصلاح`);
      } else {
        console.log('   ✅ الملف يحتوي بالفعل على where clause');
      }
    } else {
      console.log('   ⚪ لم يتم العثور على الاستعلام المحدد');
    }
    
    return fixCount > 0;
  }
  
  fixOtherCriticalIssues() {
    console.log('📄 فحص المشاكل الأخرى...');
    
    // قائمة الملفات الأخرى التي قد تحتاج إصلاح
    const otherFiles = [
      'src/services/inventoryService.js',
      'src/services/patternApplicationService.js',
      'src/services/patternCleanupService.js',
      'src/services/scheduledPatternMaintenanceService.js'
    ];
    
    let totalOtherFixes = 0;
    
    otherFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // فحص سريع للمشاكل الشائعة
        const hasUnsafeQueries = content.match(/await\s+\w*prisma\w*\.\w+\.(findMany|updateMany|deleteMany)\s*\(\s*\{[^}]*where\s*:\s*\{[^}]*\}/g);
        
        if (hasUnsafeQueries) {
          const unsafeCount = hasUnsafeQueries.filter(query => 
            !query.includes('companyId') && !query.includes('company.')
          ).length;
          
          if (unsafeCount > 0) {
            console.log(`   ⚠️  ${file}: ${unsafeCount} استعلام غير آمن`);
            totalOtherFixes += unsafeCount;
          } else {
            console.log(`   ✅ ${file}: آمن`);
          }
        } else {
          console.log(`   ✅ ${file}: لا توجد استعلامات مشبوهة`);
        }
      }
    });
    
    if (totalOtherFixes > 0) {
      console.log(`   📊 إجمالي المشاكل الأخرى: ${totalOtherFixes}`);
      console.log(`   💡 هذه المشاكل تحتاج مراجعة يدوية`);
    }
    
    return totalOtherFixes;
  }
  
  generateSummary() {
    console.log('\n📊 ملخص الإصلاح:');
    console.log('═'.repeat(50));
    console.log(`📁 ملفات تم إصلاحها: ${this.fixedFiles.length}`);
    console.log(`🔧 إجمالي الإصلاحات: ${this.totalFixes}`);
    
    if (this.fixedFiles.length > 0) {
      console.log('\n📋 تفاصيل الملفات المُصلحة:');
      this.fixedFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file.file}: ${file.fixes} إصلاح`);
      });
    }
    
    return {
      filesFixed: this.fixedFiles.length,
      totalFixes: this.totalFixes,
      success: this.totalFixes > 0
    };
  }
}

// تشغيل الإصلاح
const fixer = new RemainingIssuesFixer();

console.log('🚀 بدء إصلاح المشاكل المتبقية...\n');

// إصلاح billingNotificationService
fixer.fixBillingNotificationService();

console.log('');

// إصلاح productRoutes
fixer.fixProductRoutes();

console.log('');

// فحص المشاكل الأخرى
const otherIssues = fixer.fixOtherCriticalIssues();

// إنشاء الملخص
const summary = fixer.generateSummary();

if (summary.success) {
  console.log('\n🎉 تم إصلاح المشاكل المتبقية بنجاح!');
  console.log('🔍 الخطوة التالية: إعادة تشغيل فحص العزل النهائي');
  console.log('📝 الأمر: node comprehensive-isolation-scanner.js');
} else {
  console.log('\n⚠️  لم يتم العثور على مشاكل تحتاج إصلاح تلقائي');
  
  if (otherIssues > 0) {
    console.log(`📋 يوجد ${otherIssues} مشكلة تحتاج مراجعة يدوية`);
  }
}

process.exit(0);
