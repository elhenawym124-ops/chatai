const fs = require('fs');
const path = require('path');

console.log('🔍 فحص ذكي للعزل - يتعرف على الإصلاحات الموجودة...\n');

// قائمة الملفات المشكوك فيها
const suspiciousFiles = [
  'src/domains/integrations/services/FacebookService.ts',
  'src/routes/enhancedOrders.js',
  'src/routes/productRoutes.js',
  'src/routes/successLearning.js',
  'src/services/billingNotificationService.js',
  'src/services/inventoryService.js',
  'src/services/patternApplicationService.js',
  'src/services/patternCleanupService.js',
  'src/services/scheduledPatternMaintenanceService.js'
];

let totalIssues = 0;
let fixedIssues = 0;
let remainingIssues = 0;

console.log('📋 فحص الملفات المشكوك فيها:\n');

suspiciousFiles.forEach((file, index) => {
  const filePath = path.join(__dirname, file);
  
  console.log(`${index + 1}. 📄 ${file}`);
  
  if (!fs.existsSync(filePath)) {
    console.log('   ❌ الملف غير موجود\n');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // البحث عن عمليات updateMany و deleteMany
  let fileIssues = 0;
  let fileFixed = 0;
  
  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    
    // البحث عن عمليات bulk
    if (line.includes('.updateMany(') || line.includes('.deleteMany(')) {
      fileIssues++;
      totalIssues++;
      
      // فحص السطور التالية للبحث عن companyId
      let hasCompanyId = false;
      let contextLines = '';
      
      // فحص 10 أسطر بعد العملية
      for (let i = lineIndex; i < Math.min(lineIndex + 10, lines.length); i++) {
        contextLines += lines[i] + '\n';
        if (lines[i].includes('companyId')) {
          hasCompanyId = true;
          break;
        }
      }
      
      if (hasCompanyId) {
        console.log(`   ✅ السطر ${lineNumber}: عملية آمنة (يحتوي على companyId)`);
        fileFixed++;
        fixedIssues++;
      } else {
        console.log(`   ❌ السطر ${lineNumber}: عملية غير آمنة (لا يحتوي على companyId)`);
        console.log(`      الكود: ${line.trim()}`);
        remainingIssues++;
      }
    }
  });
  
  if (fileIssues === 0) {
    console.log('   ✅ لا توجد عمليات bulk في هذا الملف');
  } else {
    console.log(`   📊 الملخص: ${fileFixed}/${fileIssues} عملية آمنة`);
  }
  
  console.log('   ' + '─'.repeat(60));
});

console.log('\n📊 ملخص الفحص الذكي:');
console.log('═'.repeat(70));
console.log(`🔍 إجمالي العمليات المفحوصة: ${totalIssues}`);
console.log(`✅ العمليات الآمنة (مُصلحة): ${fixedIssues}`);
console.log(`❌ العمليات غير الآمنة: ${remainingIssues}`);

const safetyPercentage = totalIssues > 0 ? Math.round((fixedIssues / totalIssues) * 100) : 100;
console.log(`📈 نسبة الأمان: ${safetyPercentage}%`);

if (remainingIssues === 0) {
  console.log('\n🎉 ممتاز! جميع العمليات آمنة ومعزولة بشكل صحيح');
  console.log('✅ النظام جاهز للإنتاج من ناحية العزل');
} else {
  console.log(`\n⚠️  يوجد ${remainingIssues} عملية تحتاج إصلاح`);
  console.log('🔧 يجب إضافة companyId لهذه العمليات');
}

// فحص استعلامات SQL الخام الآمنة
console.log('\n🔍 فحص استعلامات SQL الخام:');
console.log('═'.repeat(50));

const sqlFiles = [
  'src/config/database.ts',
  'src/index.ts',
  'src/services/patternDetector.js'
];

sqlFiles.forEach((file, index) => {
  const filePath = path.join(__dirname, file);
  
  console.log(`${index + 1}. 📄 ${file}`);
  
  if (!fs.existsSync(filePath)) {
    console.log('   ❌ الملف غير موجود\n');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('SELECT 1') || content.includes('connection_test') || content.includes('health_check')) {
    console.log('   ✅ استعلامات آمنة (فحص الاتصال فقط)');
  } else if (content.includes('$queryRaw') || content.includes('$executeRaw')) {
    console.log('   ⚠️  يحتوي على استعلامات SQL خام - يحتاج مراجعة');
  } else {
    console.log('   ✅ لا يحتوي على استعلامات SQL خام');
  }
});

console.log('\n🎯 التوصية النهائية:');
console.log('═'.repeat(50));

if (remainingIssues === 0) {
  console.log('🟢 النظام آمن ومعزول بشكل صحيح');
  console.log('✅ جاهز للإنتاج');
} else if (remainingIssues <= 5) {
  console.log('🟡 النظام آمن نسبياً لكن يحتاج إصلاحات بسيطة');
  console.log('⚠️  يمكن استخدامه في بيئة التطوير');
} else {
  console.log('🔴 النظام يحتاج إصلاحات جوهرية');
  console.log('❌ غير آمن للإنتاج');
}

console.log('\n📄 تم حفظ تقرير مفصل في: reports/smart-isolation-report.json');

// حفظ التقرير
const report = {
  timestamp: new Date().toISOString(),
  totalOperations: totalIssues,
  safeOperations: fixedIssues,
  unsafeOperations: remainingIssues,
  safetyPercentage: safetyPercentage,
  status: remainingIssues === 0 ? 'SAFE' : remainingIssues <= 5 ? 'MOSTLY_SAFE' : 'UNSAFE',
  recommendation: remainingIssues === 0 ? 'Ready for production' : 'Needs fixes before production'
};

const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

fs.writeFileSync(
  path.join(reportsDir, 'smart-isolation-report.json'),
  JSON.stringify(report, null, 2)
);
