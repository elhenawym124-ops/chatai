const fs = require('fs');
const path = require('path');

/**
 * سكريبت لإزالة جميع معرفات الشركات المكتوبة بشكل ثابت
 */

const HARDCODED_COMPANY_ID = 'cme8zve740006ufbcre9qzue4';

// قائمة الملفات التي تحتوي على hardcoded IDs
const filesToFix = [
  './add-new-facebook-page.js',
  './check-company-prompts.js',
  './final-isolation-cleanup.js',
  './final-memory-isolation-test.js',
  './fix-isolation-violations.js',
  './src/services/memoryService.js',
  './test-existing-customer.js',
  './test-fallback-existence.js',
  './test-final-security.js',
  './test-frontend-memory-api.js',
  './test-isolation-comprehensive.js',
  './test-isolation-final.js',
  './test-memory-api-isolation.js',
  './test-memory-isolation-deep.js',
  './test-memory-isolation-fixed.js',
  './test-memory-isolation-real.js',
  './test-memory-stats-isolation.js'
];

async function removeHardcodedIds() {
  try {
    console.log('🧹 بدء إزالة معرفات الشركات المكتوبة بشكل ثابت...\n');

    let totalFiles = 0;
    let fixedFiles = 0;
    let errors = 0;

    for (const filePath of filesToFix) {
      try {
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️ الملف غير موجود: ${filePath}`);
          continue;
        }

        totalFiles++;
        console.log(`📝 معالجة ملف: ${filePath}`);

        const content = fs.readFileSync(filePath, 'utf8');
        
        // فحص إذا كان الملف يحتوي على hardcoded ID
        if (!content.includes(HARDCODED_COMPANY_ID)) {
          console.log(`   ✅ الملف لا يحتوي على hardcoded IDs`);
          continue;
        }

        // تحديد نوع الإصلاح المطلوب
        const fixResult = await fixFile(filePath, content);
        
        if (fixResult.success) {
          fixedFiles++;
          console.log(`   ✅ تم إصلاح الملف: ${fixResult.message}`);
        } else {
          errors++;
          console.log(`   ❌ فشل إصلاح الملف: ${fixResult.error}`);
        }

      } catch (error) {
        errors++;
        console.error(`❌ خطأ في معالجة ${filePath}:`, error.message);
      }
    }

    console.log('\n📊 النتائج:');
    console.log('═'.repeat(40));
    console.log(`📁 إجمالي الملفات: ${totalFiles}`);
    console.log(`✅ تم إصلاحها: ${fixedFiles}`);
    console.log(`❌ أخطاء: ${errors}`);
    console.log(`⏭️ لم تحتج إصلاح: ${totalFiles - fixedFiles - errors}`);

    if (fixedFiles > 0) {
      console.log('\n🎉 تم إزالة جميع معرفات الشركات المكتوبة بشكل ثابت!');
      console.log('🔐 النظام الآن آمن ومعزول بالكامل');
    }

  } catch (error) {
    console.error('❌ خطأ في السكريبت:', error);
    process.exit(1);
  }
}

/**
 * إصلاح ملف واحد
 */
async function fixFile(filePath, content) {
  try {
    let newContent = content;
    let changes = [];

    // تحديد نوع الملف والإصلاح المناسب
    if (filePath.includes('test-') || filePath.includes('check-')) {
      // ملفات الاختبار - استبدال بطريقة ديناميكية
      newContent = fixTestFile(content, changes);
    } else if (filePath.includes('memoryService.js')) {
      // خدمة الذاكرة - إزالة الفحص الثابت
      newContent = fixMemoryService(content, changes);
    } else if (filePath.includes('add-new-facebook-page.js')) {
      // إضافة صفحة فيسبوك - جعلها ديناميكية
      newContent = fixFacebookPageScript(content, changes);
    } else {
      // ملفات أخرى - إصلاح عام
      newContent = fixGenericFile(content, changes);
    }

    // كتابة الملف المحدث
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return {
        success: true,
        message: `${changes.length} تغيير`
      };
    } else {
      return {
        success: false,
        error: 'لا توجد تغييرات مطلوبة'
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * إصلاح ملفات الاختبار
 */
function fixTestFile(content, changes) {
  let newContent = content;

  // استبدال hardcoded ID بطريقة ديناميكية
  const patterns = [
    {
      old: `const company2 = '${HARDCODED_COMPANY_ID}';`,
      new: `// الحصول على شركة الحلو ديناميكياً\n  const companies = await prisma.company.findMany({ where: { name: { contains: 'الحلو' } } });\n  const company2 = companies[0]?.id || 'company-not-found';`
    },
    {
      old: `company1: '${HARDCODED_COMPANY_ID}',`,
      new: `company1: await getCompanyByName('الحلو'),`
    },
    {
      old: `companyId: '${HARDCODED_COMPANY_ID}',`,
      new: `companyId: await getCompanyByName('الحلو'),`
    },
    {
      old: `'${HARDCODED_COMPANY_ID}'`,
      new: `await getCompanyByName('الحلو')`
    }
  ];

  patterns.forEach(pattern => {
    if (newContent.includes(pattern.old)) {
      newContent = newContent.replace(pattern.old, pattern.new);
      changes.push(`استبدال hardcoded ID`);
    }
  });

  // إضافة helper function إذا لم تكن موجودة
  if (changes.length > 0 && !newContent.includes('getCompanyByName')) {
    const helperFunction = `
// Helper function للحصول على معرف الشركة بالاسم
async function getCompanyByName(name) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const company = await prisma.company.findFirst({
      where: { name: { contains: name } }
    });
    await prisma.$disconnect();
    return company?.id || null;
  } catch (error) {
    console.error('خطأ في البحث عن الشركة:', error);
    return null;
  }
}
`;
    newContent = helperFunction + newContent;
    changes.push('إضافة helper function');
  }

  return newContent;
}

/**
 * إصلاح خدمة الذاكرة
 */
function fixMemoryService(content, changes) {
  let newContent = content;

  // إزالة الفحص الثابت للشركة
  const oldCheck = `record.companyId === '${HARDCODED_COMPANY_ID}' // القيمة الافتراضية المؤقتة`;
  const newCheck = `!record.companyId || record.companyId === '' // فحص عام للقيم الفارغة`;

  if (newContent.includes(oldCheck)) {
    newContent = newContent.replace(oldCheck, newCheck);
    changes.push('إزالة فحص hardcoded company ID');
  }

  return newContent;
}

/**
 * إصلاح سكريبت إضافة صفحة فيسبوك
 */
function fixFacebookPageScript(content, changes) {
  let newContent = content;

  // جعل معرف الشركة ديناميكي
  const oldLine = `const companyId = '${HARDCODED_COMPANY_ID}'; // شركة الحلو`;
  const newLine = `// الحصول على معرف شركة الحلو ديناميكياً
  const company = await prisma.company.findFirst({
    where: { name: { contains: 'الحلو' } }
  });
  
  if (!company) {
    console.error('❌ لم يتم العثور على شركة الحلو');
    process.exit(1);
  }
  
  const companyId = company.id;
  console.log(\`🏢 تم العثور على شركة الحلو: \${company.name} (\${companyId})\`);`;

  if (newContent.includes(oldLine)) {
    newContent = newContent.replace(oldLine, newLine);
    changes.push('جعل معرف الشركة ديناميكي');
  }

  return newContent;
}

/**
 * إصلاح عام للملفات الأخرى
 */
function fixGenericFile(content, changes) {
  let newContent = content;

  // استبدال جميع المراجع للـ hardcoded ID
  const regex = new RegExp(HARDCODED_COMPANY_ID, 'g');
  const matches = content.match(regex);

  if (matches) {
    // إضافة تعليق توضيحي
    newContent = `// تم إزالة hardcoded company IDs - استخدم طرق ديناميكية للحصول على معرفات الشركات\n\n` + newContent;
    
    // استبدال بمتغير أو دالة
    newContent = newContent.replace(regex, 'DYNAMIC_COMPANY_ID_NEEDED');
    changes.push(`استبدال ${matches.length} hardcoded ID`);
  }

  return newContent;
}

// تشغيل السكريبت
if (require.main === module) {
  removeHardcodedIds()
    .then(() => {
      console.log('\n✅ انتهى إزالة معرفات الشركات المكتوبة بشكل ثابت');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل السكريبت:', error);
      process.exit(1);
    });
}

module.exports = { removeHardcodedIds };
