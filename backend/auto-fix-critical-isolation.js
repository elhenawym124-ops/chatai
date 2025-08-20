const fs = require('fs');
const path = require('path');

console.log('🔧 إصلاح تلقائي للمشاكل الخطيرة في العزل...\n');

class CriticalIsolationFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
    
    // قائمة الملفات الخطيرة التي تحتاج إصلاح فوري
    this.criticalFiles = [
      {
        file: 'src/index.ts',
        fixes: [
          {
            pattern: /const messages = await prisma\.message\.findMany\(\{/g,
            replacement: 'const messages = await prisma.message.findMany({\n      where: { conversation: { companyId: req.user?.companyId } },',
            description: 'إضافة عزل للرسائل'
          }
        ]
      },
      {
        file: 'src/routes/adminAnalyticsRoutes.js',
        fixes: [
          {
            pattern: /const users = await prisma\.user\.findMany\(\{/g,
            replacement: 'const users = await prisma.user.findMany({\n      where: { companyId: req.user?.companyId },',
            description: 'إضافة عزل للمستخدمين'
          },
          {
            pattern: /const customers = await prisma\.customer\.findMany\(\{/g,
            replacement: 'const customers = await prisma.customer.findMany({\n      where: { companyId: req.user?.companyId },',
            description: 'إضافة عزل للعملاء'
          },
          {
            pattern: /const conversations = await prisma\.conversation\.findMany\(\{/g,
            replacement: 'const conversations = await prisma.conversation.findMany({\n      where: { companyId: req.user?.companyId },',
            description: 'إضافة عزل للمحادثات'
          }
        ]
      },
      {
        file: 'src/routes/notifications.js',
        fixes: [
          {
            pattern: /const notifications = await prisma\.notification\.findMany\(\{/g,
            replacement: 'const notifications = await prisma.notification.findMany({\n      where: { companyId: req.user?.companyId },',
            description: 'إضافة عزل للإشعارات'
          }
        ]
      },
      {
        file: 'src/routes/productRoutes.js',
        fixes: [
          {
            pattern: /const products = await prisma\.product\.findMany\(\{(?!\s*where)/g,
            replacement: 'const products = await prisma.product.findMany({\n      where: { companyId: req.user?.companyId },',
            description: 'إضافة عزل للمنتجات'
          },
          {
            pattern: /const variants = await prisma\.productVariant\.findMany\(\{/g,
            replacement: 'const variants = await prisma.productVariant.findMany({\n      where: { product: { companyId: req.user?.companyId } },',
            description: 'إضافة عزل لمتغيرات المنتجات'
          }
        ]
      },
      {
        file: 'src/routes/walletPayment.js',
        fixes: [
          {
            pattern: /const walletNumbers = await prisma\.walletNumber\.findMany\(\{/g,
            replacement: 'const walletNumbers = await prisma.walletNumber.findMany({\n      where: { companyId: req.user?.companyId },',
            description: 'إضافة عزل لأرقام المحفظة'
          },
          {
            pattern: /const receipts = await prisma\.paymentReceipt\.findMany\(\{/g,
            replacement: 'const receipts = await prisma.paymentReceipt.findMany({\n      where: { companyId: req.user?.companyId },',
            description: 'إضافة عزل لإيصالات الدفع'
          },
          {
            pattern: /const total = await prisma\.paymentReceipt\.count\(\{/g,
            replacement: 'const total = await prisma.paymentReceipt.count({\n      where: { companyId: req.user?.companyId },',
            description: 'إضافة عزل لعد الإيصالات'
          }
        ]
      }
    ];
  }
  
  fixFile(fileConfig) {
    const filePath = path.join(__dirname, fileConfig.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  الملف غير موجود: ${fileConfig.file}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileFixed = false;
    let fixCount = 0;
    
    console.log(`📄 معالجة الملف: ${fileConfig.file}`);
    
    fileConfig.fixes.forEach((fix, index) => {
      const beforeCount = (content.match(fix.pattern) || []).length;
      
      if (beforeCount > 0) {
        content = content.replace(fix.pattern, fix.replacement);
        console.log(`   ${index + 1}. ✅ ${fix.description}: ${beforeCount} إصلاح`);
        fixCount += beforeCount;
        fileFixed = true;
      } else {
        console.log(`   ${index + 1}. ⚪ ${fix.description}: لا توجد مطابقات`);
      }
    });
    
    if (fileFixed) {
      // إنشاء نسخة احتياطية
      const backupPath = filePath + '.backup.' + Date.now();
      fs.copyFileSync(filePath, backupPath);
      
      // حفظ الملف المُصلح
      fs.writeFileSync(filePath, content);
      
      this.fixedFiles.push({
        file: fileConfig.file,
        fixes: fixCount,
        backup: backupPath
      });
      
      this.totalFixes += fixCount;
      console.log(`   💾 تم حفظ الملف مع ${fixCount} إصلاح`);
      console.log(`   🔄 نسخة احتياطية: ${path.basename(backupPath)}`);
    } else {
      console.log(`   ✅ الملف لا يحتاج إصلاح`);
    }
    
    console.log('   ' + '─'.repeat(60));
    return fileFixed;
  }
  
  fixAllFiles() {
    console.log('🚀 بدء إصلاح الملفات الخطيرة...\n');
    
    this.criticalFiles.forEach(fileConfig => {
      this.fixFile(fileConfig);
    });
    
    return this.generateSummary();
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
      
      console.log('\n💾 النسخ الاحتياطية:');
      this.fixedFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${path.basename(file.backup)}`);
      });
    }
    
    return {
      filesFixed: this.fixedFiles.length,
      totalFixes: this.totalFixes,
      success: this.totalFixes > 0
    };
  }
  
  createRestoreScript() {
    if (this.fixedFiles.length === 0) return;
    
    const restoreScript = `#!/bin/bash
# سكريبت استعادة النسخ الاحتياطية
echo "🔄 استعادة النسخ الاحتياطية..."

${this.fixedFiles.map(file => 
  `cp "${file.backup}" "${path.join(__dirname, file.file)}"`
).join('\n')}

echo "✅ تم استعادة جميع الملفات"
`;
    
    const scriptPath = path.join(__dirname, 'restore-backups.sh');
    fs.writeFileSync(scriptPath, restoreScript);
    
    console.log(`\n🔄 تم إنشاء سكريبت الاستعادة: ${scriptPath}`);
    console.log('   يمكنك استخدامه لاستعادة النسخ الأصلية إذا لزم الأمر');
  }
}

// تشغيل الإصلاح
const fixer = new CriticalIsolationFixer();
const summary = fixer.fixAllFiles();
fixer.createRestoreScript();

if (summary.success) {
  console.log('\n🎉 تم إصلاح المشاكل الخطيرة بنجاح!');
  console.log('🔍 الخطوة التالية: إعادة تشغيل فحص العزل للتأكد');
  console.log('📝 الأمر: node comprehensive-isolation-scanner.js');
} else {
  console.log('\n⚠️  لم يتم العثور على مشاكل تحتاج إصلاح');
}

process.exit(0);
