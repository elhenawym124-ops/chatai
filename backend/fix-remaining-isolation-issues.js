const fs = require('fs');
const path = require('path');

console.log('🔧 بدء إصلاح المشاكل المتبقية في العزل...\n');

// قائمة الملفات التي تحتاج إصلاح
const filesToFix = [
  {
    file: 'src/domains/integrations/services/FacebookService.ts',
    issues: [
      {
        line: 506,
        description: 'Add company isolation to message update',
        fix: 'Add companyId filter'
      },
      {
        line: 535,
        description: 'Add company isolation to message update',
        fix: 'Add companyId filter'
      },
      {
        line: 587,
        description: 'Add company isolation to integration update',
        fix: 'Add companyId filter'
      }
    ]
  },
  {
    file: 'src/routes/enhancedOrders.js',
    issues: [
      {
        line: 479,
        description: 'Add company isolation to orderItem delete',
        fix: 'Add companyId filter'
      }
    ]
  },
  {
    file: 'src/routes/productRoutes.js',
    issues: [
      {
        line: 400,
        description: 'Add company isolation to product update',
        fix: 'Add companyId filter'
      }
    ]
  },
  {
    file: 'src/routes/successLearning.js',
    issues: [
      {
        line: 1175,
        description: 'Add company isolation to pattern update',
        fix: 'Add companyId filter'
      },
      {
        line: 1245,
        description: 'Add company isolation to pattern update',
        fix: 'Add companyId filter'
      },
      {
        line: 1262,
        description: 'Add company isolation to pattern update',
        fix: 'Add companyId filter'
      }
    ]
  },
  {
    file: 'src/services/billingNotificationService.js',
    issues: [
      {
        line: 237,
        description: 'Add company isolation to invoice update',
        fix: 'Add companyId filter'
      },
      {
        line: 340,
        description: 'Add company isolation to subscription update',
        fix: 'Add companyId filter'
      }
    ]
  },
  {
    file: 'src/services/inventoryService.js',
    issues: [
      {
        line: 666,
        description: 'Add company isolation to stockAlert delete',
        fix: 'Add companyId filter'
      }
    ]
  },
  {
    file: 'src/services/patternApplicationService.js',
    issues: [
      {
        line: 289,
        description: 'Add company isolation to pattern performance update',
        fix: 'Add companyId filter'
      }
    ]
  },
  {
    file: 'src/services/patternCleanupService.js',
    issues: [
      {
        line: 145,
        description: 'Add company isolation to pattern delete',
        fix: 'Add companyId filter'
      }
    ]
  },
  {
    file: 'src/services/scheduledPatternMaintenanceService.js',
    issues: [
      {
        line: 200,
        description: 'Add company isolation to pattern update',
        fix: 'Add companyId filter'
      },
      {
        line: 268,
        description: 'Add company isolation to pattern delete',
        fix: 'Add companyId filter'
      },
      {
        line: 346,
        description: 'Add company isolation to pattern usage delete',
        fix: 'Add companyId filter'
      }
    ]
  }
];

console.log(`📋 تم العثور على ${filesToFix.length} ملف يحتاج إصلاح\n`);

// فحص الملفات الموجودة
let fixedFiles = 0;
let totalIssues = 0;

filesToFix.forEach((fileInfo, index) => {
  const filePath = path.join(__dirname, fileInfo.file);
  
  console.log(`${index + 1}. 📄 ${fileInfo.file}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ الملف موجود`);
    console.log(`   🔧 المشاكل: ${fileInfo.issues.length}`);
    
    fileInfo.issues.forEach((issue, issueIndex) => {
      console.log(`      ${issueIndex + 1}. السطر ${issue.line}: ${issue.description}`);
      totalIssues++;
    });
    
    fixedFiles++;
  } else {
    console.log(`   ❌ الملف غير موجود`);
  }
  
  console.log('   ' + '─'.repeat(60));
});

console.log(`\n📊 ملخص الإصلاح:`);
console.log(`   📁 ملفات موجودة: ${fixedFiles}/${filesToFix.length}`);
console.log(`   🔧 إجمالي المشاكل: ${totalIssues}`);

// إنشاء تقرير إصلاح
const reportPath = path.join(__dirname, 'reports', 'isolation-fix-plan.json');
const report = {
  timestamp: new Date().toISOString(),
  totalFiles: filesToFix.length,
  existingFiles: fixedFiles,
  totalIssues: totalIssues,
  files: filesToFix,
  status: fixedFiles === filesToFix.length ? 'READY_TO_FIX' : 'MISSING_FILES'
};

// إنشاء مجلد التقارير إذا لم يكن موجوداً
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📄 تم إنشاء تقرير الإصلاح: ${reportPath}`);

if (fixedFiles === filesToFix.length) {
  console.log(`\n✅ جميع الملفات موجودة وجاهزة للإصلاح!`);
  console.log(`🚀 يمكن الآن تطبيق الإصلاحات التلقائية`);
} else {
  console.log(`\n⚠️  بعض الملفات مفقودة - يجب مراجعة المسارات`);
}

console.log(`\n🔧 الخطوة التالية: تطبيق الإصلاحات على الملفات الموجودة`);
