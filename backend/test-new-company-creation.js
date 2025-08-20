/**
 * اختبار إنشاء شركة جديدة لفحص القيم الافتراضية
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNewCompanyCreation() {
  console.log('🧪 اختبار إنشاء شركة جديدة...');
  console.log('='.repeat(60));

  try {
    // 1. إنشاء شركة جديدة للاختبار
    console.log('1️⃣ إنشاء شركة جديدة...');
    
    const testCompany = await prisma.company.create({
      data: {
        name: 'شركة اختبار جديدة',
        email: `test-${Date.now()}@example.com`,
        phone: '+20 100 000 0000',
        plan: 'BASIC',
        currency: 'EGP'
        // لاحظ: لم نحدد isActive، سيأخذ القيمة الافتراضية
      }
    });

    console.log(`✅ تم إنشاء الشركة: ${testCompany.name} (${testCompany.id})`);
    console.log(`   isActive: ${testCompany.isActive} (القيمة الافتراضية من schema)`);

    // 2. فحص إعدادات AI - هل يتم إنشاؤها تلقائياً؟
    console.log('\n2️⃣ فحص إعدادات AI...');
    
    const aiSettings = await prisma.aiSettings.findUnique({
      where: { companyId: testCompany.id }
    });

    if (aiSettings) {
      console.log('✅ إعدادات AI موجودة (تم إنشاؤها تلقائياً):');
      console.log(`   aiEnabled: ${aiSettings.aiEnabled}`);
      console.log(`   autoResponse: ${aiSettings.autoResponse}`);
      console.log(`   autoReplyEnabled: ${aiSettings.autoReplyEnabled} (القيمة الافتراضية)`);
    } else {
      console.log('❌ إعدادات AI غير موجودة - لم يتم إنشاؤها تلقائياً');
      
      // إنشاء إعدادات AI يدوياً لمعرفة القيم الافتراضية
      console.log('   📝 إنشاء إعدادات AI يدوياً...');
      
      const newAiSettings = await prisma.aiSettings.create({
        data: {
          companyId: testCompany.id
          // لم نحدد أي قيم، سنرى القيم الافتراضية من schema
        }
      });

      console.log('✅ تم إنشاء إعدادات AI بالقيم الافتراضية:');
      console.log(`   aiEnabled: ${newAiSettings.aiEnabled}`);
      console.log(`   autoResponse: ${newAiSettings.autoResponse}`);
      console.log(`   autoReplyEnabled: ${newAiSettings.autoReplyEnabled}`);
      console.log(`   workingHoursEnabled: ${newAiSettings.workingHoursEnabled}`);
      console.log(`   maxRepliesPerCustomer: ${newAiSettings.maxRepliesPerCustomer}`);
      console.log(`   multimodalEnabled: ${newAiSettings.multimodalEnabled}`);
      console.log(`   ragEnabled: ${newAiSettings.ragEnabled}`);
      console.log(`   confidenceThreshold: ${newAiSettings.confidenceThreshold}`);
    }

    // 3. محاكاة ربط صفحة فيسبوك
    console.log('\n3️⃣ محاكاة ربط صفحة فيسبوك...');
    
    const facebookPage = await prisma.facebookPage.create({
      data: {
        pageId: `test_page_${Date.now()}`,
        pageAccessToken: 'test_token_123',
        pageName: 'صفحة اختبار',
        companyId: testCompany.id
        // لاحظ: لم نحدد isActive، سنرى القيمة الافتراضية
      }
    });

    console.log(`✅ تم ربط صفحة فيسبوك: ${facebookPage.pageName}`);
    console.log(`   isActive: ${facebookPage.isActive} (القيمة الافتراضية)`);
    console.log(`   status: ${facebookPage.status} (القيمة الافتراضية)`);

    // 4. محاكاة إضافة مفتاح Gemini
    console.log('\n4️⃣ محاكاة إضافة مفتاح Gemini...');
    
    const geminiKey = await prisma.geminiKey.create({
      data: {
        name: 'مفتاح اختبار',
        apiKey: `test_api_key_${Date.now()}`,
        companyId: testCompany.id
        // لم نحدد isActive أو model، سنرى القيم الافتراضية
      }
    });

    console.log(`✅ تم إضافة مفتاح Gemini: ${geminiKey.name}`);
    console.log(`   isActive: ${geminiKey.isActive} (القيمة الافتراضية)`);
    console.log(`   model: ${geminiKey.model} (القيمة الافتراضية)`);

    // 5. تحليل النتائج
    console.log('\n📊 تحليل النتائج:');
    console.log('='.repeat(40));

    const issues = [];

    // فحص الشركة
    if (testCompany.isActive !== true) {
      issues.push('❌ الشركة الجديدة غير نشطة بشكل افتراضي');
    } else {
      console.log('✅ الشركة نشطة بشكل افتراضي');
    }

    // فحص إعدادات AI
    const finalAiSettings = await prisma.aiSettings.findUnique({
      where: { companyId: testCompany.id }
    });

    if (!finalAiSettings) {
      issues.push('❌ إعدادات AI لا يتم إنشاؤها تلقائياً');
    } else {
      if (finalAiSettings.autoReplyEnabled !== true) {
        issues.push('❌ autoReplyEnabled = false بشكل افتراضي');
      }
      if (finalAiSettings.aiEnabled !== true) {
        issues.push('❌ aiEnabled = undefined/null بشكل افتراضي');
      }
      if (finalAiSettings.autoResponse !== true) {
        issues.push('❌ autoResponse = undefined/null بشكل افتراضي');
      }
    }

    // فحص صفحة فيسبوك
    if (facebookPage.isActive !== true) {
      issues.push('❌ صفحة فيسبوك غير نشطة بشكل افتراضي');
    }

    // فحص مفتاح Gemini
    if (geminiKey.isActive !== true) {
      issues.push('❌ مفتاح Gemini غير نشط بشكل افتراضي');
    } else {
      console.log('✅ مفتاح Gemini نشط بشكل افتراضي');
    }

    // النتيجة النهائية
    console.log('\n🎯 النتيجة النهائية:');
    if (issues.length > 0) {
      console.log('❌ نعم، المشاكل ستحدث مع أي شركة جديدة!');
      console.log('\n🚨 المشاكل التي ستحدث:');
      issues.forEach(issue => console.log(`   ${issue}`));
      
      console.log('\n💡 الحل المطلوب:');
      console.log('   1. تحديث القيم الافتراضية في schema.prisma');
      console.log('   2. أو إنشاء trigger لتفعيل الإعدادات تلقائياً');
      console.log('   3. أو تحديث كود إنشاء الشركات لتفعيل كل شيء');
    } else {
      console.log('✅ لا، الشركات الجديدة ستعمل بشكل صحيح');
    }

    // 6. تنظيف - حذف الشركة التجريبية
    console.log('\n🧹 تنظيف البيانات التجريبية...');
    
    await prisma.geminiKey.delete({
      where: { id: geminiKey.id }
    });
    
    await prisma.facebookPage.delete({
      where: { id: facebookPage.id }
    });
    
    if (finalAiSettings) {
      await prisma.aiSettings.delete({
        where: { id: finalAiSettings.id }
      });
    }
    
    await prisma.company.delete({
      where: { id: testCompany.id }
    });

    console.log('✅ تم حذف البيانات التجريبية');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبار
testNewCompanyCreation().catch(console.error);
