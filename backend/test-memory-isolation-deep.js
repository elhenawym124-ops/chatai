/**
 * فحص عميق جداً للعزل في الذاكرة
 */

const memoryService = require('./src/services/memoryService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// بيانات الاختبار
const testCompanies = {
  company1: await getCompanyByName('الحلو'),
  company2: 'cme8oj1fo000cufdcg2fquia9',
  company3: 'test-company-3'
};

const testUsers = {
  user1: 'isolation-test-user-1',
  user2: 'isolation-test-user-2',
  sharedUser: 'shared-user-across-companies'
};

async function testMemoryKeyIsolation() {
  console.log('\n🔍 اختبار 1: عزل مفاتيح الذاكرة');
  console.log('=' .repeat(50));
  
  try {
    // إنشاء تفاعلات لنفس المستخدم في شركات مختلفة
    const interactions = [
      {
        conversationId: 'conv1',
        senderId: testUsers.sharedUser,
        companyId: testCompanies.company1,
        userMessage: 'رسالة سرية للشركة الأولى',
        aiResponse: 'رد الشركة الأولى',
        intent: 'secret_company1',
        sentiment: 'positive'
      },
      {
        conversationId: 'conv2',
        senderId: testUsers.sharedUser,
        companyId: testCompanies.company2,
        userMessage: 'رسالة سرية للشركة الثانية',
        aiResponse: 'رد الشركة الثانية',
        intent: 'secret_company2',
        sentiment: 'positive'
      }
    ];

    // حفظ التفاعلات
    for (const interaction of interactions) {
      await memoryService.saveInteraction(interaction);
    }

    // فحص العزل - الشركة الأولى يجب أن ترى بياناتها فقط
    const company1Memory = await memoryService.getConversationMemory(
      'conv1', 
      testUsers.sharedUser, 
      10, 
      testCompanies.company1
    );

    // فحص العزل - الشركة الثانية يجب أن ترى بياناتها فقط
    const company2Memory = await memoryService.getConversationMemory(
      'conv2', 
      testUsers.sharedUser, 
      10, 
      testCompanies.company2
    );

    console.log(`✅ ذاكرة الشركة الأولى: ${company1Memory.length} تفاعل`);
    console.log(`✅ ذاكرة الشركة الثانية: ${company2Memory.length} تفاعل`);

    // التحقق من عدم التداخل
    const company1HasCompany2Data = company1Memory.some(m => m.intent === 'secret_company2');
    const company2HasCompany1Data = company2Memory.some(m => m.intent === 'secret_company1');

    if (company1HasCompany2Data || company2HasCompany1Data) {
      console.error('❌ تسريب بيانات بين الشركات!');
      return false;
    }

    console.log('✅ العزل في مفاتيح الذاكرة يعمل بشكل صحيح');
    return true;

  } catch (error) {
    console.error('❌ خطأ في اختبار مفاتيح الذاكرة:', error.message);
    return false;
  }
}

async function testDatabaseIsolation() {
  console.log('\n🔍 اختبار 2: عزل قاعدة البيانات');
  console.log('=' .repeat(50));
  
  try {
    // فحص مباشر لقاعدة البيانات
    const allRecords = await prisma.conversationMemory.findMany({
      where: {
        senderId: testUsers.sharedUser
      }
    });

    console.log(`📊 إجمالي السجلات للمستخدم المشترك: ${allRecords.length}`);

    // فحص أن كل سجل له companyId
    const recordsWithoutCompanyId = allRecords.filter(r => !r.companyId);
    if (recordsWithoutCompanyId.length > 0) {
      console.error(`❌ ${recordsWithoutCompanyId.length} سجل بدون companyId!`);
      return false;
    }

    // فحص العزل بين الشركات
    const company1Records = allRecords.filter(r => r.companyId === testCompanies.company1);
    const company2Records = allRecords.filter(r => r.companyId === testCompanies.company2);

    console.log(`✅ سجلات الشركة الأولى: ${company1Records.length}`);
    console.log(`✅ سجلات الشركة الثانية: ${company2Records.length}`);

    // التحقق من عدم وجود تداخل في المحتوى
    const company1HasCompany2Content = company1Records.some(r => 
      r.userMessage.includes('الشركة الثانية')
    );
    const company2HasCompany1Content = company2Records.some(r => 
      r.userMessage.includes('الشركة الأولى')
    );

    if (company1HasCompany2Content || company2HasCompany1Content) {
      console.error('❌ تسريب محتوى بين الشركات في قاعدة البيانات!');
      return false;
    }

    console.log('✅ العزل في قاعدة البيانات يعمل بشكل صحيح');
    return true;

  } catch (error) {
    console.error('❌ خطأ في اختبار قاعدة البيانات:', error.message);
    return false;
  }
}

async function testCrossCompanyAccess() {
  console.log('\n🔍 اختبار 3: منع الوصول المتقاطع');
  console.log('=' .repeat(50));
  
  try {
    // محاولة الوصول لبيانات شركة أخرى
    try {
      const unauthorizedAccess = await memoryService.getConversationMemory(
        'conv1', // محادثة الشركة الأولى
        testUsers.sharedUser,
        10,
        testCompanies.company2 // محاولة الوصول بهوية الشركة الثانية
      );

      if (unauthorizedAccess.length > 0) {
        console.error('❌ تم الوصول لبيانات شركة أخرى!');
        return false;
      }
    } catch (error) {
      // هذا متوقع - يجب أن يفشل الوصول
    }

    // اختبار البحث المتقاطع
    const company1Search = await memoryService.searchMemories(
      'conv1',
      testUsers.sharedUser,
      'سرية',
      5,
      testCompanies.company1
    );

    const company2Search = await memoryService.searchMemories(
      'conv2',
      testUsers.sharedUser,
      'سرية',
      5,
      testCompanies.company2
    );

    console.log(`✅ نتائج بحث الشركة الأولى: ${company1Search.length}`);
    console.log(`✅ نتائج بحث الشركة الثانية: ${company2Search.length}`);

    // التحقق من عدم تسريب النتائج
    const company1HasCompany2Results = company1Search.some(r => 
      r.companyId === testCompanies.company2
    );
    const company2HasCompany1Results = company2Search.some(r => 
      r.companyId === testCompanies.company1
    );

    if (company1HasCompany2Results || company2HasCompany1Results) {
      console.error('❌ تسريب في نتائج البحث بين الشركات!');
      return false;
    }

    console.log('✅ منع الوصول المتقاطع يعمل بشكل صحيح');
    return true;

  } catch (error) {
    console.error('❌ خطأ في اختبار الوصول المتقاطع:', error.message);
    return false;
  }
}

async function testMemoryCleanupIsolation() {
  console.log('\n🔍 اختبار 4: عزل تنظيف الذاكرة');
  console.log('=' .repeat(50));
  
  try {
    // إنشاء بيانات اختبار للتنظيف
    const testInteraction = {
      conversationId: 'cleanup-test',
      senderId: 'cleanup-user',
      companyId: testCompanies.company1,
      userMessage: 'رسالة للتنظيف',
      aiResponse: 'رد للتنظيف',
      intent: 'cleanup_test',
      sentiment: 'neutral'
    };

    await memoryService.saveInteraction(testInteraction);

    // اختبار تنظيف معزول للشركة الأولى فقط
    const cleanupResults = await memoryService.clearCustomerMemory(
      'cleanup-user',
      testCompanies.company1
    );

    console.log(`✅ تم تنظيف ${cleanupResults} سجل للشركة الأولى`);

    // التحقق من عدم تأثر بيانات الشركات الأخرى
    const remainingRecords = await prisma.conversationMemory.findMany({
      where: {
        senderId: testUsers.sharedUser,
        companyId: testCompanies.company2
      }
    });

    if (remainingRecords.length === 0) {
      console.error('❌ تم حذف بيانات شركات أخرى بالخطأ!');
      return false;
    }

    console.log('✅ تنظيف الذاكرة معزول بشكل صحيح');
    return true;

  } catch (error) {
    console.error('❌ خطأ في اختبار تنظيف الذاكرة:', error.message);
    return false;
  }
}

async function runMemoryAudit() {
  console.log('\n🔍 اختبار 5: فحص العزل الشامل');
  console.log('=' .repeat(50));
  
  try {
    const auditResults = await memoryService.auditMemoryIsolation();
    
    console.log('📊 نتائج فحص العزل:');
    console.log(`   - مفاتيح الذاكرة قصيرة المدى: ${auditResults.shortTermMemoryKeys.length}`);
    console.log(`   - سجلات بدون companyId: ${auditResults.databaseRecordsWithoutCompanyId}`);
    console.log(`   - انتهاكات العزل: ${auditResults.isolationViolations.length}`);

    if (auditResults.isolationViolations.length > 0) {
      console.log('\n🚨 انتهاكات العزل المكتشفة:');
      auditResults.isolationViolations.forEach((violation, index) => {
        console.log(`   ${index + 1}. ${violation.type} (${violation.severity})`);
      });
      return false;
    }

    console.log('✅ فحص العزل الشامل نجح - لا توجد انتهاكات');
    return true;

  } catch (error) {
    console.error('❌ خطأ في فحص العزل الشامل:', error.message);
    return false;
  }
}

async function runDeepIsolationTests() {
  console.log('🚀 بدء الفحص العميق للعزل في الذاكرة');
  console.log('=' .repeat(60));
  
  const testResults = {
    memoryKeyIsolation: false,
    databaseIsolation: false,
    crossCompanyAccess: false,
    memoryCleanupIsolation: false,
    memoryAudit: false
  };

  try {
    // تشغيل جميع الاختبارات
    testResults.memoryKeyIsolation = await testMemoryKeyIsolation();
    testResults.databaseIsolation = await testDatabaseIsolation();
    testResults.crossCompanyAccess = await testCrossCompanyAccess();
    testResults.memoryCleanupIsolation = await testMemoryCleanupIsolation();
    testResults.memoryAudit = await runMemoryAudit();

    // تحليل النتائج
    const passedTests = Object.values(testResults).filter(result => result === true).length;
    const totalTests = Object.keys(testResults).length;

    console.log('\n' + '=' .repeat(60));
    console.log('📊 ملخص نتائج الفحص العميق للعزل');
    console.log('=' .repeat(60));
    
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅ نجح' : '❌ فشل';
      console.log(`${status} ${test}`);
    });

    console.log(`\n🎯 النتيجة النهائية: ${passedTests}/${totalTests} اختبار نجح`);

    if (passedTests === totalTests) {
      console.log('🏆 العزل في الذاكرة مطبق بشكل مثالي!');
      console.log('✅ النظام آمن ومعزول بالكامل');
      console.log('✅ جاهز للإنتاج من ناحية العزل');
    } else {
      console.log('🚨 يوجد مشاكل في العزل تحتاج إصلاح فوري!');
      console.log('❌ النظام غير آمن للإنتاج');
    }

  } catch (error) {
    console.error('❌ خطأ في تشغيل اختبارات العزل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runDeepIsolationTests().catch(console.error);
