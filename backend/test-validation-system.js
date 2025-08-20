const { ValidationService } = require('./src/services/validationService');

/**
 * اختبار نظام التحقق الشامل
 */

async function testValidationSystem() {
  try {
    console.log('🧪 بدء اختبار نظام التحقق الشامل...\n');

    const validationService = new ValidationService();

    // 1. اختبار التحقق من الشركات الموجودة
    console.log('1️⃣ اختبار التحقق من الشركات الموجودة...');
    await testExistingCompanies(validationService);

    // 2. اختبار التحقق من شركة غير موجودة
    console.log('\n2️⃣ اختبار التحقق من شركة غير موجودة...');
    await testNonExistentCompany(validationService);

    // 3. اختبار الإصلاح التلقائي
    console.log('\n3️⃣ اختبار الإصلاح التلقائي...');
    await testAutoFix(validationService);

    // 4. اختبار cache
    console.log('\n4️⃣ اختبار cache...');
    await testCache(validationService);

    // 5. عرض إحصائيات
    console.log('\n5️⃣ إحصائيات النظام...');
    await displayValidationStats(validationService);

    console.log('\n🎉 انتهى اختبار نظام التحقق بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
    process.exit(1);
  }
}

/**
 * اختبار التحقق من الشركات الموجودة
 */
async function testExistingCompanies(validationService) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const companies = await prisma.company.findMany({
      select: { id: true, name: true }
    });

    console.log(`📋 فحص ${companies.length} شركة موجودة:`);

    for (const company of companies) {
      console.log(`\n🏢 فحص شركة: ${company.name}`);
      
      const validation = await validationService.validateCompanySetup(company.id);
      
      if (validation.isValid) {
        console.log(`   ✅ صحيحة`);
        if (validation.hasWarnings) {
          console.log(`   ⚠️ تحذيرات: ${validation.warnings.length}`);
          validation.warnings.forEach(w => {
            console.log(`      - ${w.message} (${w.severity})`);
          });
        }
      } else {
        console.log(`   ❌ غير صحيحة: ${validation.message}`);
        if (validation.issues) {
          validation.issues.forEach(i => {
            console.log(`      - ${i.message} (${i.severity})`);
          });
        }
      }
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ خطأ في اختبار الشركات الموجودة:', error);
  }
}

/**
 * اختبار التحقق من شركة غير موجودة
 */
async function testNonExistentCompany(validationService) {
  try {
    const fakeCompanyId = 'fake-company-id-12345';
    console.log(`🔍 فحص شركة غير موجودة: ${fakeCompanyId}`);
    
    const validation = await validationService.validateCompanySetup(fakeCompanyId);
    
    if (!validation.isValid && validation.error === 'COMPANY_NOT_FOUND') {
      console.log('✅ تم رفض الشركة غير الموجودة بشكل صحيح');
    } else {
      console.log('❌ خطأ: لم يتم رفض الشركة غير الموجودة');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار الشركة غير الموجودة:', error);
  }
}

/**
 * اختبار الإصلاح التلقائي
 */
async function testAutoFix(validationService) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // البحث عن شركة تحتاج إصلاح
    const companies = await prisma.company.findMany({
      select: { id: true, name: true }
    });

    for (const company of companies) {
      const validation = await validationService.validateCompanySetup(company.id);
      
      if (validation.hasWarnings && validation.fixable) {
        console.log(`🔧 اختبار الإصلاح التلقائي للشركة: ${company.name}`);
        
        const fixResult = await validationService.autoFixIssues(company.id, validation);
        
        if (fixResult.success) {
          console.log(`✅ تم الإصلاح: ${fixResult.message}`);
          fixResult.fixes.forEach(fix => {
            console.log(`   - ${fix}`);
          });
        } else {
          console.log(`❌ فشل الإصلاح: ${fixResult.message}`);
        }
        
        break; // اختبار شركة واحدة فقط
      }
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ خطأ في اختبار الإصلاح التلقائي:', error);
  }
}

/**
 * اختبار cache
 */
async function testCache(validationService) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const company = await prisma.company.findFirst({
      select: { id: true, name: true }
    });

    if (company) {
      console.log(`🗄️ اختبار cache مع الشركة: ${company.name}`);
      
      // الطلب الأول - سيتم حفظه في cache
      console.log('   📥 الطلب الأول (بدون cache)...');
      const start1 = Date.now();
      await validationService.validateCompanySetup(company.id);
      const time1 = Date.now() - start1;
      console.log(`   ⏱️ الوقت: ${time1}ms`);
      
      // الطلب الثاني - من cache
      console.log('   📤 الطلب الثاني (من cache)...');
      const start2 = Date.now();
      await validationService.validateCompanySetup(company.id);
      const time2 = Date.now() - start2;
      console.log(`   ⏱️ الوقت: ${time2}ms`);
      
      if (time2 < time1) {
        console.log('✅ cache يعمل بشكل صحيح - الطلب الثاني أسرع');
      } else {
        console.log('⚠️ cache قد لا يعمل بشكل مثالي');
      }
      
      // إحصائيات cache
      const stats = validationService.getCacheStats();
      console.log(`   📊 إحصائيات cache: ${stats.size} عنصر، timeout: ${stats.timeout}ms`);
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ خطأ في اختبار cache:', error);
  }
}

/**
 * عرض إحصائيات التحقق
 */
async function displayValidationStats(validationService) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    console.log('📊 إحصائيات نظام التحقق:');
    console.log('═'.repeat(40));

    // إحصائيات عامة
    const totalCompanies = await prisma.company.count();
    const activeCompanies = await prisma.company.count({
      where: { isActive: true }
    });
    const companiesWithAI = await prisma.company.count({
      where: { aiSettings: { isNot: null } }
    });

    console.log(`🏢 إجمالي الشركات: ${totalCompanies}`);
    console.log(`✅ الشركات النشطة: ${activeCompanies}`);
    console.log(`🤖 شركات لديها إعدادات AI: ${companiesWithAI}`);

    // فحص جودة البيانات
    let validCompanies = 0;
    let companiesWithWarnings = 0;
    let companiesWithIssues = 0;

    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: { id: true, name: true }
    });

    for (const company of companies) {
      const validation = await validationService.validateCompanySetup(company.id);
      
      if (validation.isValid) {
        validCompanies++;
        if (validation.hasWarnings) {
          companiesWithWarnings++;
        }
      } else {
        companiesWithIssues++;
      }
    }

    console.log(`\n📋 جودة البيانات:`);
    console.log(`✅ شركات صحيحة: ${validCompanies}`);
    console.log(`⚠️ شركات بتحذيرات: ${companiesWithWarnings}`);
    console.log(`❌ شركات بمشاكل: ${companiesWithIssues}`);

    // إحصائيات cache
    const cacheStats = validationService.getCacheStats();
    console.log(`\n🗄️ إحصائيات Cache:`);
    console.log(`📦 العناصر المحفوظة: ${cacheStats.size}`);
    console.log(`⏱️ مدة الصلاحية: ${cacheStats.timeout / 1000} ثانية`);

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ خطأ في عرض الإحصائيات:', error);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testValidationSystem()
    .then(() => {
      console.log('\n✅ انتهى اختبار نظام التحقق');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل اختبار نظام التحقق:', error);
      process.exit(1);
    });
}

module.exports = { testValidationSystem };
