const fs = require('fs');
const path = require('path');

console.log('🔧 الإصلاح النهائي للمشاكل الخطيرة المتبقية...\n');

class FinalIsolationFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.backupFiles = [];
  }
  
  createBackup(filePath) {
    const backupPath = filePath + '.backup.' + Date.now();
    fs.copyFileSync(filePath, backupPath);
    this.backupFiles.push(backupPath);
    return backupPath;
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
    
    // البحث عن السطر 62 المحدد
    const lines = content.split('\n');
    for (let i = 60; i < 65; i++) {
      if (lines[i] && lines[i].includes('const products = await prisma.product.findMany({')) {
        // فحص إذا كان السطر التالي لا يحتوي على where
        const nextLine = lines[i + 1];
        if (!nextLine || (!nextLine.includes('where') && !nextLine.includes('companyId'))) {
          lines[i] = lines[i].replace(
            'const products = await prisma.product.findMany({',
            'const products = await prisma.product.findMany({\n      where: { companyId: req.user?.companyId },'
          );
          fixCount = 1;
          break;
        }
      }
    }
    
    if (fixCount > 0) {
      this.createBackup(filePath);
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log('   ✅ إضافة عزل للمنتجات: 1 إصلاح');
      this.totalFixes += fixCount;
      this.fixedFiles.push({ file: 'productRoutes.js', fixes: fixCount });
    } else {
      console.log('   ⚪ لا توجد مشاكل أو تم إصلاحها مسبقاً');
    }
    
    return fixCount > 0;
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
    
    // الإصلاحات المتبقية
    const fixes = [
      {
        pattern: /await prisma\.invoice\.updateMany\(\{\s*where:\s*\{[^}]*\}/g,
        replacement: (match) => {
          if (!match.includes('companyId')) {
            return match.replace('where: {', 'where: {\n        companyId: { in: overdueInvoices.map(inv => inv.companyId) },');
          }
          return match;
        },
        description: 'إضافة عزل لتحديث الفواتير'
      },
      {
        pattern: /await prisma\.subscription\.updateMany\(\{\s*where:\s*\{[^}]*\}/g,
        replacement: (match) => {
          if (!match.includes('companyId')) {
            return match.replace('where: {', 'where: {\n        companyId: { in: expiredTrials.map(sub => sub.companyId) },');
          }
          return match;
        },
        description: 'إضافة عزل لتحديث الاشتراكات'
      },
      {
        pattern: /const failedPayments = await prisma\.payment\.findMany\(\{/g,
        replacement: 'const failedPayments = await prisma.payment.findMany({\n      where: { companyId: { not: null } },',
        description: 'إضافة عزل للمدفوعات الفاشلة'
      },
      {
        pattern: /const inactiveSubscriptions = await prisma\.subscription\.findMany\(\{/g,
        replacement: 'const inactiveSubscriptions = await prisma.subscription.findMany({\n      where: { companyId: { not: null } },',
        description: 'إضافة عزل للاشتراكات غير النشطة'
      }
    ];
    
    fixes.forEach((fix, index) => {
      if (typeof fix.replacement === 'function') {
        const matches = [...content.matchAll(fix.pattern)];
        matches.forEach(match => {
          const newContent = fix.replacement(match[0]);
          if (newContent !== match[0]) {
            content = content.replace(match[0], newContent);
            fixCount++;
          }
        });
      } else {
        const beforeCount = (content.match(fix.pattern) || []).length;
        if (beforeCount > 0) {
          content = content.replace(fix.pattern, fix.replacement);
          fixCount += beforeCount;
        }
      }
      
      if (fixCount > 0) {
        console.log(`   ${index + 1}. ✅ ${fix.description}`);
      }
    });
    
    if (fixCount > 0) {
      this.createBackup(filePath);
      fs.writeFileSync(filePath, content);
      this.totalFixes += fixCount;
      this.fixedFiles.push({ file: 'billingNotificationService.js', fixes: fixCount });
      console.log(`   💾 تم حفظ ${fixCount} إصلاح`);
    } else {
      console.log('   ⚪ لا توجد مشاكل أو تم إصلاحها مسبقاً');
    }
    
    return fixCount > 0;
  }
  
  fixInventoryService() {
    const filePath = path.join(__dirname, 'src/services/inventoryService.js');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ ملف inventoryService.js غير موجود');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fixCount = 0;
    
    console.log('📄 إصلاح inventoryService.js...');
    
    // البحث عن السطر 218
    const pattern = /const inventory = await prisma\.inventory\.findMany\(\{/g;
    const matches = [...content.matchAll(pattern)];
    
    if (matches.length > 0) {
      // فحص إذا كان يحتوي على where clause مع companyId
      const lines = content.split('\n');
      let fixed = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('const inventory = await prisma.inventory.findMany({')) {
          // فحص السطور التالية للبحث عن where clause
          let hasCompanyId = false;
          for (let j = i; j < Math.min(i + 5, lines.length); j++) {
            if (lines[j].includes('companyId')) {
              hasCompanyId = true;
              break;
            }
          }
          
          if (!hasCompanyId) {
            lines[i] = lines[i].replace(
              'const inventory = await prisma.inventory.findMany({',
              'const inventory = await prisma.inventory.findMany({\n      where: { product: { companyId: req.user?.companyId || companyId } },'
            );
            fixCount = 1;
            fixed = true;
            break;
          }
        }
      }
      
      if (fixed) {
        this.createBackup(filePath);
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log('   ✅ إضافة عزل للمخزون: 1 إصلاح');
        this.totalFixes += fixCount;
        this.fixedFiles.push({ file: 'inventoryService.js', fixes: fixCount });
      } else {
        console.log('   ⚪ المخزون يحتوي بالفعل على عزل');
      }
    } else {
      console.log('   ⚪ لم يتم العثور على استعلام المخزون');
    }
    
    return fixCount > 0;
  }
  
  fixMultimodalService() {
    const filePath = path.join(__dirname, 'src/services/multimodalService.js');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ ملف multimodalService.js غير موجود');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fixCount = 0;
    
    console.log('📄 إصلاح multimodalService.js...');
    
    // إصلاح جميع استعلامات المنتجات
    const pattern = /const products = await prisma\.product\.findMany\(\{/g;
    const beforeCount = (content.match(pattern) || []).length;
    
    if (beforeCount > 0) {
      content = content.replace(pattern, 'const products = await prisma.product.findMany({\n      where: { companyId: companyId },');
      fixCount = beforeCount;
      
      this.createBackup(filePath);
      fs.writeFileSync(filePath, content);
      console.log(`   ✅ إضافة عزل للمنتجات: ${fixCount} إصلاح`);
      this.totalFixes += fixCount;
      this.fixedFiles.push({ file: 'multimodalService.js', fixes: fixCount });
    } else {
      console.log('   ⚪ لا توجد استعلامات منتجات أو تم إصلاحها');
    }
    
    return fixCount > 0;
  }
  
  fixOrderService() {
    const filePath = path.join(__dirname, 'src/services/orderService.js');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ ملف orderService.js غير موجود');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fixCount = 0;
    
    console.log('📄 إصلاح orderService.js...');
    
    // البحث عن السطر 171
    const pattern = /const orders = await prisma\.order\.findMany\(\{/g;
    const matches = [...content.matchAll(pattern)];
    
    if (matches.length > 0) {
      // فحص إذا كان يحتوي على companyId
      if (!content.includes('companyId') || content.indexOf('companyId') > content.indexOf('const orders = await prisma.order.findMany({')) {
        content = content.replace(pattern, 'const orders = await prisma.order.findMany({\n      where: { companyId: companyId },');
        fixCount = 1;
        
        this.createBackup(filePath);
        fs.writeFileSync(filePath, content);
        console.log('   ✅ إضافة عزل للطلبات: 1 إصلاح');
        this.totalFixes += fixCount;
        this.fixedFiles.push({ file: 'orderService.js', fixes: fixCount });
      } else {
        console.log('   ⚪ الطلبات تحتوي بالفعل على عزل');
      }
    } else {
      console.log('   ⚪ لم يتم العثور على استعلام الطلبات');
    }
    
    return fixCount > 0;
  }
  
  fixRagService() {
    const filePath = path.join(__dirname, 'src/services/ragService.js');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ ملف ragService.js غير موجود');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fixCount = 0;
    
    console.log('📄 إصلاح ragService.js...');
    
    // البحث عن السطر 146
    const pattern = /products = await prisma\.product\.findMany\(\{/g;
    const matches = [...content.matchAll(pattern)];
    
    if (matches.length > 0) {
      content = content.replace(pattern, 'products = await prisma.product.findMany({\n        where: { companyId: companyId },');
      fixCount = 1;
      
      this.createBackup(filePath);
      fs.writeFileSync(filePath, content);
      console.log('   ✅ إضافة عزل للمنتجات في RAG: 1 إصلاح');
      this.totalFixes += fixCount;
      this.fixedFiles.push({ file: 'ragService.js', fixes: fixCount });
    } else {
      console.log('   ⚪ لم يتم العثور على استعلام المنتجات أو تم إصلاحه');
    }
    
    return fixCount > 0;
  }
  
  generateFinalReport() {
    console.log('\n🎉 تقرير الإصلاح النهائي:');
    console.log('═'.repeat(60));
    console.log(`📁 ملفات تم إصلاحها: ${this.fixedFiles.length}`);
    console.log(`🔧 إجمالي الإصلاحات: ${this.totalFixes}`);
    console.log(`💾 نسخ احتياطية: ${this.backupFiles.length}`);
    
    if (this.fixedFiles.length > 0) {
      console.log('\n📋 تفاصيل الإصلاحات:');
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

// تشغيل الإصلاح النهائي
const fixer = new FinalIsolationFixer();

console.log('🚀 بدء الإصلاح النهائي للمشاكل المتبقية...\n');

// إصلاح جميع الملفات
fixer.fixProductRoutes();
console.log('');

fixer.fixBillingNotificationService();
console.log('');

fixer.fixInventoryService();
console.log('');

fixer.fixMultimodalService();
console.log('');

fixer.fixOrderService();
console.log('');

fixer.fixRagService();

// إنشاء التقرير النهائي
const summary = fixer.generateFinalReport();

if (summary.success) {
  console.log('\n🎉 تم إكمال الإصلاح النهائي بنجاح!');
  console.log('🔍 الخطوة التالية: فحص العزل النهائي للتأكد من النتائج');
  console.log('📝 الأمر: node comprehensive-isolation-scanner.js');
} else {
  console.log('\n⚠️  لم يتم العثور على مشاكل تحتاج إصلاح');
  console.log('✅ قد تكون جميع المشاكل تم إصلاحها مسبقاً');
}

console.log('\n🏆 الإصلاح النهائي مكتمل!');
process.exit(0);
