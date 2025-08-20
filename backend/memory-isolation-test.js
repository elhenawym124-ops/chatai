/**
 * اختبار العزل في إدارة الذاكرة
 */

const axios = require('axios');

// بيانات الاختبار
const testData = {
  company1: {
    pageId: '123456789', // شركة الحلو
    users: ['company1-user1', 'company1-user2', 'company1-user3']
  },
  company2: {
    pageId: '675323792321557', // Swan-store
    users: ['company2-user1', 'company2-user2', 'company2-user3']
  }
};

let memoryIssues = {
  crossCompanyAccess: [],
  sharedMemoryKeys: [],
  memoryLeaks: [],
  isolationFailures: []
};

async function sendMessage(pageId, senderId, message, company) {
  const webhookData = {
    object: 'page',
    entry: [{
      time: Date.now(),
      id: pageId,
      messaging: [{
        sender: { id: senderId },
        recipient: { id: pageId },
        timestamp: Date.now(),
        message: {
          mid: `memory_test_${Date.now()}_${Math.random()}`,
          text: message
        }
      }]
    }]
  };

  try {
    const response = await axios.post('http://localhost:3001/webhook', webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'facebookexternalua'
      },
      timeout: 10000
    });
    
    console.log(`✅ [${company}] ${senderId}: "${message}"`);
    return { success: true, company, senderId, message };
  } catch (error) {
    console.error(`❌ [${company}] ${senderId}: "${message}" - ${error.message}`);
    return { success: false, company, senderId, message, error: error.message };
  }
}

async function testMemoryIsolationBetweenCompanies() {
  console.log('\n🧪 اختبار: عزل الذاكرة بين الشركات');
  console.log('=' .repeat(60));
  
  // إرسال رسائل من شركات مختلفة بنفس senderId
  const sameSenderId = 'isolation-test-user';
  
  console.log('📤 إرسال رسائل من نفس العميل لشركتين مختلفتين...');
  
  // رسائل للشركة الأولى
  await sendMessage(testData.company1.pageId, sameSenderId, 'رسالة سرية للشركة الأولى', 'Company1');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await sendMessage(testData.company1.pageId, sameSenderId, 'معلومات حساسة للشركة الأولى', 'Company1');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // رسائل للشركة الثانية
  await sendMessage(testData.company2.pageId, sameSenderId, 'رسالة سرية للشركة الثانية', 'Company2');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await sendMessage(testData.company2.pageId, sameSenderId, 'معلومات حساسة للشركة الثانية', 'Company2');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n📋 تحقق من اللوج للبحث عن:');
  console.log('1. هل تم إنشاء محادثات منفصلة لكل شركة؟');
  console.log('2. هل تم عزل الذاكرة بين الشركتين؟');
  console.log('3. هل يمكن للشركة الثانية رؤية ذاكرة الشركة الأولى؟');
  
  return true;
}

async function testSharedMemoryKeys() {
  console.log('\n🧪 اختبار: مفاتيح الذاكرة المشتركة');
  console.log('=' .repeat(60));
  
  console.log('📤 إرسال رسائل متعددة لفحص مفاتيح الذاكرة...');
  
  // إرسال رسائل من عملاء مختلفين
  const promises = [];
  
  // شركة 1
  for (let i = 0; i < 3; i++) {
    promises.push(
      sendMessage(
        testData.company1.pageId, 
        testData.company1.users[i], 
        `رسالة ذاكرة ${i + 1} من شركة 1`, 
        'Company1'
      )
    );
  }
  
  // شركة 2
  for (let i = 0; i < 3; i++) {
    promises.push(
      sendMessage(
        testData.company2.pageId, 
        testData.company2.users[i], 
        `رسالة ذاكرة ${i + 1} من شركة 2`, 
        'Company2'
      )
    );
  }
  
  await Promise.all(promises);
  
  console.log('\n📋 تحقق من اللوج للبحث عن:');
  console.log('1. مفاتيح الذاكرة المستخدمة');
  console.log('2. هل تحتوي المفاتيح على companyId؟');
  console.log('3. هل يمكن تداخل المفاتيح بين الشركات؟');
  
  return true;
}

async function testMemoryLeakage() {
  console.log('\n🧪 اختبار: تسريب الذاكرة');
  console.log('=' .repeat(60));
  
  console.log('📤 إرسال رسائل متعددة لفحص تسريب الذاكرة...');
  
  const senderId = 'memory-leak-test';
  
  // إرسال 10 رسائل متتالية
  for (let i = 1; i <= 10; i++) {
    await sendMessage(
      testData.company1.pageId, 
      senderId, 
      `رسالة تسريب ${i}`, 
      'Company1'
    );
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📋 تحقق من اللوج للبحث عن:');
  console.log('1. هل تتراكم الذاكرة مع كل رسالة؟');
  console.log('2. هل يتم تنظيف الذاكرة القديمة؟');
  console.log('3. هل هناك حد أقصى للذاكرة؟');
  
  return true;
}

async function testCrossCompanyMemoryAccess() {
  console.log('\n🧪 اختبار: الوصول للذاكرة عبر الشركات');
  console.log('=' .repeat(60));
  
  const testUserId = 'cross-company-test';
  
  console.log('📤 إرسال رسائل لاختبار الوصول المتقاطع...');
  
  // رسالة للشركة الأولى مع معلومات حساسة
  await sendMessage(
    testData.company1.pageId, 
    testUserId, 
    'معلومات سرية: كلمة المرور 123456', 
    'Company1'
  );
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // رسالة للشركة الثانية - هل ستحصل على ذاكرة الشركة الأولى؟
  await sendMessage(
    testData.company2.pageId, 
    testUserId, 
    'ما هي كلمة المرور؟', 
    'Company2'
  );
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n📋 تحقق من اللوج للبحث عن:');
  console.log('1. هل تم إنشاء محادثات منفصلة؟');
  console.log('2. هل تسرب أي معلومات بين الشركتين؟');
  console.log('3. هل تم عزل السياق بشكل صحيح؟');
  
  return true;
}

async function analyzeMemoryIsolation() {
  console.log('\n' + '=' .repeat(60));
  console.log('📋 تحليل عزل الذاكرة');
  console.log('=' .repeat(60));
  
  console.log('\n🔍 المشاكل المحتملة في العزل:');
  
  console.log('\n❌ مشكلة 1: مفاتيح الذاكرة بدون companyId');
  console.log('   المفتاح الحالي: conversationId_senderId');
  console.log('   المشكلة: نفس المفتاح يمكن أن يُستخدم لشركات مختلفة');
  console.log('   الحل: companyId_conversationId_senderId');
  
  console.log('\n❌ مشكلة 2: الذاكرة قصيرة المدى مشتركة');
  console.log('   المشكلة: Map واحد لجميع الشركات');
  console.log('   الحل: Map منفصل لكل شركة');
  
  console.log('\n❌ مشكلة 3: عدم فلترة قاعدة البيانات بـ companyId');
  console.log('   المشكلة: الاستعلامات لا تتضمن companyId');
  console.log('   الحل: إضافة companyId لجميع الاستعلامات');
  
  console.log('\n❌ مشكلة 4: تسريب الذاكرة');
  console.log('   المشكلة: عدم تنظيف الذاكرة المؤقتة');
  console.log('   الحل: تنظيف دوري وحدود للذاكرة');
  
  console.log('\n🔧 الحلول المطلوبة:');
  console.log('1. إضافة companyId لمفاتيح الذاكرة');
  console.log('2. عزل الذاكرة قصيرة المدى بين الشركات');
  console.log('3. إضافة companyId لجميع استعلامات قاعدة البيانات');
  console.log('4. تطبيق تنظيف دوري للذاكرة');
  console.log('5. إضافة حدود للذاكرة لكل شركة');
  
  console.log('\n⚠️ خطورة المشكلة:');
  console.log('🚨 عالية جداً - تسريب بيانات بين الشركات!');
  console.log('🚨 انتهاك خصوصية العملاء!');
  console.log('🚨 مخالفة قوانين حماية البيانات!');
}

async function runMemoryIsolationTests() {
  console.log('🚀 بدء اختبار عزل الذاكرة');
  console.log('=' .repeat(60));
  
  try {
    // اختبار 1: عزل الذاكرة بين الشركات
    await testMemoryIsolationBetweenCompanies();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // اختبار 2: مفاتيح الذاكرة المشتركة
    await testSharedMemoryKeys();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // اختبار 3: تسريب الذاكرة
    await testMemoryLeakage();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // اختبار 4: الوصول المتقاطع للذاكرة
    await testCrossCompanyMemoryAccess();
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // تحليل النتائج
    await analyzeMemoryIsolation();
    
  } catch (error) {
    console.error('❌ خطأ في اختبارات الذاكرة:', error);
  }
}

runMemoryIsolationTests().catch(console.error);
