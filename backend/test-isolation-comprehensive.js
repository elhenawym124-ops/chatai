/**
 * اختبار شامل ومتقدم للعزل في الذاكرة
 * يفحص جميع الطبقات والسيناريوهات المحتملة
 */

const memoryService = require('./src/services/memoryService');
const aiAgentService = require('./src/services/aiAgentService');
const IntelligentChatService = require('./src/services/intelligentChatService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// بيانات الاختبار
const testCompanies = {
  company1: await getCompanyByName('الحلو'),
  company2: 'cme8oj1fo000cufdcg2fquia9',
  company3: 'cme8ondkz0000uf6s5gy28i17'
};

const testUsers = {
  user1: 'comprehensive-test-user-1',
  user2: 'comprehensive-test-user-2',
  sharedUser: 'shared-user-comprehensive'
};

let testResults = {
  memoryServiceIsolation: false,
  aiAgentServiceIsolation: false,
  intelligentChatServiceIsolation: false,
  databaseIsolation: false,
  crossCompanyPrevention: false,
  memoryCleanupIsolation: false,
  apiEndpointIsolation: false,
  errors: []
};

async function testMemoryServiceIsolation() {
  console.log('\n🔍 اختبار 1: عزل memoryService');
  console.log('=' .repeat(50));
  
  try {
    // اختبار saveInteraction
    const interaction1 = {
      conversationId: 'test-conv-1',
      senderId: testUsers.sharedUser,
      companyId: testCompanies.company1,
      userMessage: 'رسالة سرية للشركة الأولى',
      aiResponse: 'رد الشركة الأولى',
      intent: 'secret_company1',
      sentiment: 'positive'
    };

    const interaction2 = {
      conversationId: 'test-conv-2',
      senderId: testUsers.sharedUser,
      companyId: testCompanies.company2,
      userMessage: 'رسالة سرية للشركة الثانية',
      aiResponse: 'رد الشركة الثانية',
      intent: 'secret_company2',
      sentiment: 'positive'
    };

    await memoryService.saveInteraction(interaction1);
    await memoryService.saveInteraction(interaction2);

    // اختبار getConversationMemory
    const memory1 = await memoryService.getConversationMemory(
      'test-conv-1', testUsers.sharedUser, 10, testCompanies.company1
    );
    const memory2 = await memoryService.getConversationMemory(
      'test-conv-2', testUsers.sharedUser, 10, testCompanies.company2
    );

    // التحقق من العزل
    const company1HasCompany2Data = memory1.some(m => m.intent === 'secret_company2');
    const company2HasCompany1Data = memory2.some(m => m.intent === 'secret_company1');

    if (company1HasCompany2Data || company2HasCompany1Data) {
      testResults.errors.push('تسريب بيانات في memoryService');
      return false;
    }

    // اختبار searchMemories
    const search1 = await memoryService.searchMemories(
      'test-conv-1', testUsers.sharedUser, 'سرية', 5, testCompanies.company1
    );
    const search2 = await memoryService.searchMemories(
      'test-conv-2', testUsers.sharedUser, 'سرية', 5, testCompanies.company2
    );

    const search1HasCompany2Results = search1.some(r => r.companyId === testCompanies.company2);
    const search2HasCompany1Results = search2.some(r => r.companyId === testCompanies.company1);

    if (search1HasCompany2Results || search2HasCompany1Results) {
      testResults.errors.push('تسريب في نتائج البحث في memoryService');
      return false;
    }

    // اختبار clearCustomerMemory
    const clearedCount = await memoryService.clearCustomerMemory(
      testUsers.sharedUser, testCompanies.company1
    );

    // التحقق من أن بيانات الشركة الثانية لم تتأثر
    const remainingMemory2 = await memoryService.getConversationMemory(
      'test-conv-2', testUsers.sharedUser, 10, testCompanies.company2
    );

    if (remainingMemory2.length === 0) {
      testResults.errors.push('تم حذف بيانات شركة أخرى بالخطأ في clearCustomerMemory');
      return false;
    }

    console.log('✅ memoryService معزول بشكل صحيح');
    return true;

  } catch (error) {
    testResults.errors.push(`خطأ في اختبار memoryService: ${error.message}`);
    return false;
  }
}

async function testAIAgentServiceIsolation() {
  console.log('\n🔍 اختبار 2: عزل aiAgentService');
  console.log('=' .repeat(50));
  
  try {
    const messageData1 = {
      conversationId: 'ai-test-conv-1',
      senderId: testUsers.user1,
      companyId: testCompanies.company1,
      content: 'اختبار عزل aiAgentService للشركة الأولى',
      customerData: { id: testUsers.user1, name: 'Test User 1' }
    };

    const messageData2 = {
      conversationId: 'ai-test-conv-2',
      senderId: testUsers.user1,
      companyId: testCompanies.company2,
      content: 'اختبار عزل aiAgentService للشركة الثانية',
      customerData: { id: testUsers.user1, name: 'Test User 1' }
    };

    const response1 = await aiAgentService.processCustomerMessage(messageData1);
    const response2 = await aiAgentService.processCustomerMessage(messageData2);

    // التحقق من أن كل شركة لها معالجة منفصلة
    if (!response1.success || !response2.success) {
      testResults.errors.push('فشل في معالجة الرسائل في aiAgentService');
      return false;
    }

    // التحقق من أن الذاكرة معزولة
    const memory1 = await memoryService.getConversationMemory(
      'ai-test-conv-1', testUsers.user1, 10, testCompanies.company1
    );
    const memory2 = await memoryService.getConversationMemory(
      'ai-test-conv-2', testUsers.user1, 10, testCompanies.company2
    );

    const memory1HasCompany2Content = memory1.some(m => 
      m.userMessage.includes('الشركة الثانية')
    );
    const memory2HasCompany1Content = memory2.some(m => 
      m.userMessage.includes('الشركة الأولى')
    );

    if (memory1HasCompany2Content || memory2HasCompany1Content) {
      testResults.errors.push('تسريب محتوى بين الشركات في aiAgentService');
      return false;
    }

    console.log('✅ aiAgentService معزول بشكل صحيح');
    return true;

  } catch (error) {
    testResults.errors.push(`خطأ في اختبار aiAgentService: ${error.message}`);
    return false;
  }
}

async function testIntelligentChatServiceIsolation() {
  console.log('\n🔍 اختبار 3: عزل intelligentChatService');
  console.log('=' .repeat(50));
  
  try {
    const intelligentChatService = new IntelligentChatService();

    const response1 = await intelligentChatService.generateIntelligentResponse(
      'اختبار الدردشة الذكية للشركة الأولى',
      [],
      testCompanies.company1,
      testUsers.user2
    );

    const response2 = await intelligentChatService.generateIntelligentResponse(
      'اختبار الدردشة الذكية للشركة الثانية',
      [],
      testCompanies.company2,
      testUsers.user2
    );

    if (!response1.success || !response2.success) {
      testResults.errors.push('فشل في توليد الردود في intelligentChatService');
      return false;
    }

    // اختبار getConversationMemory
    const memory1 = await intelligentChatService.getConversationMemory(
      testUsers.user2, testCompanies.company1, 10
    );
    const memory2 = await intelligentChatService.getConversationMemory(
      testUsers.user2, testCompanies.company2, 10
    );

    // التحقق من العزل
    if (memory1.length > 0 && memory2.length > 0) {
      const memory1HasCompany2Content = memory1.some(m => 
        m.message && m.message.includes('الشركة الثانية')
      );
      const memory2HasCompany1Content = memory2.some(m => 
        m.message && m.message.includes('الشركة الأولى')
      );

      if (memory1HasCompany2Content || memory2HasCompany1Content) {
        testResults.errors.push('تسريب محتوى في intelligentChatService');
        return false;
      }
    }

    console.log('✅ intelligentChatService معزول بشكل صحيح');
    return true;

  } catch (error) {
    testResults.errors.push(`خطأ في اختبار intelligentChatService: ${error.message}`);
    return false;
  }
}

async function testDatabaseIsolation() {
  console.log('\n🔍 اختبار 4: عزل قاعدة البيانات');
  console.log('=' .repeat(50));
  
  try {
    // فحص مباشر لقاعدة البيانات
    const allRecords = await prisma.conversationMemory.findMany({
      select: {
        id: true,
        companyId: true,
        senderId: true,
        userMessage: true
      }
    });

    console.log(`📊 إجمالي السجلات: ${allRecords.length}`);

    // فحص أن كل سجل له companyId
    const recordsWithoutCompanyId = allRecords.filter(r => !r.companyId);
    if (recordsWithoutCompanyId.length > 0) {
      testResults.errors.push(`${recordsWithoutCompanyId.length} سجل بدون companyId`);
      return false;
    }

    // فحص توزيع الشركات
    const companyDistribution = {};
    allRecords.forEach(record => {
      if (!companyDistribution[record.companyId]) {
        companyDistribution[record.companyId] = 0;
      }
      companyDistribution[record.companyId]++;
    });

    console.log('📈 توزيع الشركات:');
    Object.entries(companyDistribution).forEach(([companyId, count]) => {
      console.log(`   ${companyId}: ${count} سجل`);
    });

    // فحص عدم وجود تداخل في المحتوى
    for (const [companyId, count] of Object.entries(companyDistribution)) {
      const companyRecords = allRecords.filter(r => r.companyId === companyId);
      
      for (const otherCompanyId of Object.keys(companyDistribution)) {
        if (companyId !== otherCompanyId) {
          const hasOtherCompanyContent = companyRecords.some(r => 
            r.userMessage && r.userMessage.includes(otherCompanyId)
          );
          
          if (hasOtherCompanyContent) {
            testResults.errors.push(`تسريب محتوى من ${otherCompanyId} إلى ${companyId}`);
            return false;
          }
        }
      }
    }

    console.log('✅ قاعدة البيانات معزولة بشكل صحيح');
    return true;

  } catch (error) {
    testResults.errors.push(`خطأ في اختبار قاعدة البيانات: ${error.message}`);
    return false;
  }
}

async function testCrossCompanyPrevention() {
  console.log('\n🔍 اختبار 5: منع الوصول المتقاطع');
  console.log('=' .repeat(50));
  
  try {
    // محاولة الوصول لبيانات شركة أخرى
    const unauthorizedMemory = await memoryService.getConversationMemory(
      'test-conv-1', // محادثة الشركة الأولى
      testUsers.sharedUser,
      10,
      testCompanies.company2 // محاولة الوصول بهوية الشركة الثانية
    );

    if (unauthorizedMemory.length > 0) {
      // فحص إذا كانت البيانات تخص الشركة الأولى فعلاً
      const hasCompany1Data = unauthorizedMemory.some(m => 
        m.companyId === testCompanies.company1
      );
      
      if (hasCompany1Data) {
        testResults.errors.push('تم الوصول لبيانات شركة أخرى بنجاح!');
        return false;
      }
    }

    // اختبار البحث المتقاطع
    const unauthorizedSearch = await memoryService.searchMemories(
      'test-conv-1',
      testUsers.sharedUser,
      'سرية',
      5,
      testCompanies.company3 // شركة ثالثة تحاول الوصول
    );

    const hasUnauthorizedResults = unauthorizedSearch.some(r => 
      r.companyId !== testCompanies.company3
    );

    if (hasUnauthorizedResults) {
      testResults.errors.push('تسريب في نتائج البحث المتقاطع');
      return false;
    }

    console.log('✅ منع الوصول المتقاطع يعمل بشكل صحيح');
    return true;

  } catch (error) {
    testResults.errors.push(`خطأ في اختبار منع الوصول المتقاطع: ${error.message}`);
    return false;
  }
}

async function runComprehensiveIsolationTest() {
  console.log('🚀 بدء الاختبار الشامل للعزل في الذاكرة');
  console.log('=' .repeat(60));
  
  try {
    // تشغيل جميع الاختبارات
    testResults.memoryServiceIsolation = await testMemoryServiceIsolation();
    testResults.aiAgentServiceIsolation = await testAIAgentServiceIsolation();
    testResults.intelligentChatServiceIsolation = await testIntelligentChatServiceIsolation();
    testResults.databaseIsolation = await testDatabaseIsolation();
    testResults.crossCompanyPrevention = await testCrossCompanyPrevention();

    // فحص نهائي للعزل
    const auditResults = await memoryService.auditMemoryIsolation();
    testResults.memoryCleanupIsolation = auditResults.isolationViolations.length === 0;

    // تحليل النتائج
    const passedTests = Object.values(testResults).filter(result => result === true).length;
    const totalTests = Object.keys(testResults).length - 1; // استثناء errors

    console.log('\n' + '=' .repeat(60));
    console.log('📊 ملخص الاختبار الشامل للعزل');
    console.log('=' .repeat(60));
    
    Object.entries(testResults).forEach(([test, passed]) => {
      if (test !== 'errors') {
        const status = passed ? '✅ نجح' : '❌ فشل';
        console.log(`${status} ${test}`);
      }
    });

    if (testResults.errors.length > 0) {
      console.log('\n🚨 الأخطاء المكتشفة:');
      testResults.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    console.log(`\n🎯 النتيجة النهائية: ${passedTests}/${totalTests} اختبار نجح`);

    if (passedTests === totalTests && testResults.errors.length === 0) {
      console.log('🏆 العزل في الذاكرة مطبق بشكل مثالي!');
      console.log('✅ النظام آمن ومعزول بالكامل');
      console.log('✅ جاهز للإنتاج من ناحية العزل');
      console.log('🔒 الخصوصية والأمان مضمونان');
    } else {
      console.log('🚨 يوجد مشاكل في العزل تحتاج إصلاح فوري!');
      console.log('❌ النظام غير آمن للإنتاج');
    }

  } catch (error) {
    console.error('❌ خطأ في تشغيل الاختبار الشامل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runComprehensiveIsolationTest().catch(console.error);
