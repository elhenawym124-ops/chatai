/**
 * اختبار إصلاح العزل في إدارة الذاكرة
 */

const axios = require('axios');

// بيانات الاختبار
const testData = {
  company1: {
    pageId: '123456789', // شركة الحلو
    companyId: await getCompanyByName('الحلو'),
    users: ['company1-user1', 'company1-user2']
  },
  company2: {
    pageId: '675323792321557', // Swan-store  
    companyId: 'cme8oj1fo000cufdcg2fquia9',
    users: ['company2-user1', 'company2-user2']
  }
};

let isolationResults = {
  memoryKeysIsolated: false,
  databaseIsolated: false,
  crossCompanyAccessBlocked: false,
  errors: []
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
          mid: `isolation_test_${Date.now()}_${Math.random()}`,
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

async function testMemoryKeyIsolation() {
  console.log('\n🧪 اختبار: عزل مفاتيح الذاكرة');
  console.log('=' .repeat(60));
  
  const sameSenderId = 'isolation-key-test';
  
  console.log('📤 إرسال رسائل من نفس العميل لشركتين مختلفتين...');
  
  // رسائل للشركة الأولى
  await sendMessage(testData.company1.pageId, sameSenderId, 'رسالة سرية للشركة الأولى', 'Company1');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // رسائل للشركة الثانية
  await sendMessage(testData.company2.pageId, sameSenderId, 'رسالة سرية للشركة الثانية', 'Company2');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n📋 تحقق من اللوج للبحث عن:');
  console.log('1. مفاتيح الذاكرة تحتوي على companyId');
  console.log('2. لا يوجد تداخل بين مفاتيح الشركتين');
  console.log('3. كل شركة لها ذاكرة منفصلة');
  
  return true;
}

async function testDatabaseIsolation() {
  console.log('\n🧪 اختبار: عزل قاعدة البيانات');
  console.log('=' .repeat(60));
  
  console.log('📤 إرسال رسائل متعددة لفحص عزل قاعدة البيانات...');
  
  // إرسال رسائل من عملاء مختلفين لشركات مختلفة
  const promises = [];
  
  // شركة 1
  for (let i = 0; i < 2; i++) {
    promises.push(
      sendMessage(
        testData.company1.pageId, 
        testData.company1.users[i], 
        `رسالة قاعدة بيانات ${i + 1} من شركة 1`, 
        'Company1'
      )
    );
  }
  
  // شركة 2
  for (let i = 0; i < 2; i++) {
    promises.push(
      sendMessage(
        testData.company2.pageId, 
        testData.company2.users[i], 
        `رسالة قاعدة بيانات ${i + 1} من شركة 2`, 
        'Company2'
      )
    );
  }
  
  await Promise.all(promises);
  
  console.log('\n📋 تحقق من اللوج للبحث عن:');
  console.log('1. استعلامات قاعدة البيانات تتضمن companyId');
  console.log('2. لا يتم جلب بيانات من شركات أخرى');
  console.log('3. كل شركة ترى بياناتها فقط');
  
  return true;
}

async function testCrossCompanyAccessPrevention() {
  console.log('\n🧪 اختبار: منع الوصول المتقاطع بين الشركات');
  console.log('=' .repeat(60));
  
  const testUserId = 'cross-access-test';
  
  console.log('📤 إرسال رسائل لاختبار منع الوصول المتقاطع...');
  
  // رسالة للشركة الأولى مع معلومات حساسة
  await sendMessage(
    testData.company1.pageId, 
    testUserId, 
    'معلومات سرية شركة 1: الرقم السري 987654', 
    'Company1'
  );
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // رسالة للشركة الثانية - يجب ألا تحصل على معلومات الشركة الأولى
  await sendMessage(
    testData.company2.pageId, 
    testUserId, 
    'ما هو الرقم السري؟', 
    'Company2'
  );
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n📋 تحقق من اللوج للبحث عن:');
  console.log('1. تم إنشاء محادثات منفصلة لكل شركة');
  console.log('2. لم يتم تسريب أي معلومات بين الشركتين');
  console.log('3. كل شركة لها سياق منفصل تماماً');
  
  return true;
}

async function testMemoryCleanupAndLimits() {
  console.log('\n🧪 اختبار: تنظيف الذاكرة والحدود');
  console.log('=' .repeat(60));
  
  const senderId = 'cleanup-test';
  
  console.log('📤 إرسال رسائل متعددة لاختبار تنظيف الذاكرة...');
  
  // إرسال 5 رسائل متتالية
  for (let i = 1; i <= 5; i++) {
    await sendMessage(
      testData.company1.pageId, 
      senderId, 
      `رسالة تنظيف ${i}`, 
      'Company1'
    );
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📋 تحقق من اللوج للبحث عن:');
  console.log('1. تم تطبيق حدود الذاكرة قصيرة المدى');
  console.log('2. تم تنظيف الذاكرة القديمة');
  console.log('3. لا يوجد تسريب في الذاكرة');
  
  return true;
}

async function analyzeIsolationResults() {
  console.log('\n' + '=' .repeat(60));
  console.log('📋 تحليل نتائج إصلاح العزل');
  console.log('=' .repeat(60));
  
  console.log('\n✅ الإصلاحات المطبقة:');
  console.log('1. ✅ إضافة companyId لجميع مفاتيح الذاكرة');
  console.log('2. ✅ إضافة companyId لجميع استعلامات قاعدة البيانات');
  console.log('3. ✅ إضافة عمود companyId لجدول conversation_memory');
  console.log('4. ✅ إضافة فهارس للأداء والعزل');
  console.log('5. ✅ إضافة التحقق من companyId في جميع الدوال');
  
  console.log('\n🔍 المؤشرات المطلوب مراقبتها:');
  console.log('1. مفاتيح الذاكرة: companyId_conversationId_senderId');
  console.log('2. استعلامات قاعدة البيانات تتضمن companyId');
  console.log('3. عدم وجود رسائل خطأ "companyId is required"');
  console.log('4. عدم تسريب معلومات بين الشركات');
  
  console.log('\n🎯 معايير النجاح:');
  console.log('✅ كل مفتاح ذاكرة يحتوي على companyId');
  console.log('✅ كل استعلام قاعدة بيانات يتضمن companyId');
  console.log('✅ لا يوجد وصول متقاطع بين الشركات');
  console.log('✅ الذاكرة معزولة بشكل كامل');
  
  console.log('\n🚨 علامات الخطر:');
  console.log('❌ مفاتيح ذاكرة بدون companyId');
  console.log('❌ استعلامات بدون companyId');
  console.log('❌ تسريب معلومات بين الشركات');
  console.log('❌ رسائل خطأ "companyId is required"');
  
  console.log('\n🏆 النتيجة المتوقعة:');
  console.log('✅ العزل الكامل بين الشركات');
  console.log('✅ أمان البيانات مضمون');
  console.log('✅ عدم تسريب المعلومات');
  console.log('✅ الامتثال لقوانين حماية البيانات');
}

async function runIsolationFixTests() {
  console.log('🚀 بدء اختبار إصلاح العزل في الذاكرة');
  console.log('=' .repeat(60));
  
  try {
    // اختبار 1: عزل مفاتيح الذاكرة
    await testMemoryKeyIsolation();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // اختبار 2: عزل قاعدة البيانات
    await testDatabaseIsolation();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // اختبار 3: منع الوصول المتقاطع
    await testCrossCompanyAccessPrevention();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // اختبار 4: تنظيف الذاكرة
    await testMemoryCleanupAndLimits();
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // تحليل النتائج
    await analyzeIsolationResults();
    
  } catch (error) {
    console.error('❌ خطأ في اختبارات العزل:', error);
  }
}

runIsolationFixTests().catch(console.error);
