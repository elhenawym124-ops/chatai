/**
 * اختبار معالجة الرسائل المتزامنة
 * لفحص قدرة النظام على التعامل مع رسائل متعددة في نفس الوقت
 */

const axios = require('axios');

const TEST_CONFIG = {
  serverUrl: 'http://localhost:3001',
  testSenderId1: 'test-user-concurrent-1',
  testSenderId2: 'test-user-concurrent-2',
  testSenderId3: 'test-user-concurrent-3',
  delayBetweenRequests: 100, // 100ms بين الطلبات
  maxWaitTime: 15000 // 15 ثانية انتظار أقصى
};

/**
 * محاكاة webhook من فيسبوك
 */
async function simulateWebhook(senderId, messageText, messageId = null) {
  const webhookData = {
    object: 'page',
    entry: [{
      time: Date.now(),
      id: '123456789',
      messaging: [{
        sender: { id: senderId },
        recipient: { id: '123456789' },
        timestamp: Date.now(),
        message: {
          mid: messageId || `test_${Date.now()}_${Math.random()}`,
          text: messageText
        }
      }]
    }]
  };

  try {
    const response = await axios.post(`${TEST_CONFIG.serverUrl}/webhook`, webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'facebookexternalua'
      },
      timeout: 5000
    });

    return response.status === 200;
  } catch (error) {
    console.error(`❌ خطأ في إرسال webhook للعميل ${senderId}:`, error.message);
    return false;
  }
}

/**
 * اختبار رسائل متزامنة من نفس العميل
 */
async function testConcurrentMessagesFromSameUser() {
  console.log('\n🧪 اختبار 1: رسائل متزامنة من نفس العميل');
  console.log('=' .repeat(50));

  const senderId = TEST_CONFIG.testSenderId1;
  const messages = [
    'مرحبا',
    'كيف الحال؟',
    'عايز أعرف الأسعار'
  ];

  console.log(`📤 إرسال ${messages.length} رسائل متزامنة من العميل: ${senderId}`);

  const startTime = Date.now();
  
  // إرسال جميع الرسائل في نفس الوقت
  const promises = messages.map((message, index) => {
    return new Promise(async (resolve) => {
      // تأخير صغير لمحاكاة الإرسال المتتالي السريع
      setTimeout(async () => {
        const messageId = `concurrent_same_${Date.now()}_${index}`;
        console.log(`   📨 إرسال رسالة ${index + 1}: "${message}"`);
        const success = await simulateWebhook(senderId, message, messageId);
        resolve({ index: index + 1, message, success });
      }, index * TEST_CONFIG.delayBetweenRequests);
    });
  });

  const results = await Promise.all(promises);
  
  // انتظار معالجة النظام
  console.log('⏳ انتظار معالجة النظام...');
  await new Promise(resolve => setTimeout(resolve, 8000));

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  console.log('\n📊 نتائج الاختبار:');
  results.forEach(result => {
    console.log(`   ${result.success ? '✅' : '❌'} رسالة ${result.index}: "${result.message}"`);
  });

  console.log(`⏱️  إجمالي الوقت: ${totalTime}ms`);
  
  return results.every(r => r.success);
}

/**
 * اختبار رسائل متزامنة من عملاء مختلفين
 */
async function testConcurrentMessagesFromDifferentUsers() {
  console.log('\n🧪 اختبار 2: رسائل متزامنة من عملاء مختلفين');
  console.log('=' .repeat(50));

  const scenarios = [
    { senderId: TEST_CONFIG.testSenderId1, message: 'السلام عليكم من العميل الأول' },
    { senderId: TEST_CONFIG.testSenderId2, message: 'مرحبا من العميل الثاني' },
    { senderId: TEST_CONFIG.testSenderId3, message: 'أهلا من العميل الثالث' }
  ];

  console.log(`📤 إرسال ${scenarios.length} رسائل متزامنة من عملاء مختلفين`);

  const startTime = Date.now();
  
  // إرسال جميع الرسائل في نفس الوقت تماماً
  const promises = scenarios.map((scenario, index) => {
    return new Promise(async (resolve) => {
      const messageId = `concurrent_diff_${Date.now()}_${index}`;
      console.log(`   📨 إرسال من ${scenario.senderId}: "${scenario.message}"`);
      const success = await simulateWebhook(scenario.senderId, scenario.message, messageId);
      resolve({ ...scenario, success });
    });
  });

  const results = await Promise.all(promises);
  
  // انتظار معالجة النظام
  console.log('⏳ انتظار معالجة النظام...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  console.log('\n📊 نتائج الاختبار:');
  results.forEach(result => {
    console.log(`   ${result.success ? '✅' : '❌'} ${result.senderId}: "${result.message}"`);
  });

  console.log(`⏱️  إجمالي الوقت: ${totalTime}ms`);
  
  return results.every(r => r.success);
}

/**
 * اختبار الحمولة العالية
 */
async function testHighLoadConcurrency() {
  console.log('\n🧪 اختبار 3: حمولة عالية - رسائل متعددة متزامنة');
  console.log('=' .repeat(50));

  const messageCount = 10;
  const userCount = 3;
  
  console.log(`📤 إرسال ${messageCount} رسائل من ${userCount} عملاء (${messageCount * userCount} رسالة إجمالي)`);

  const startTime = Date.now();
  const allPromises = [];

  // إنشاء رسائل متعددة من عملاء متعددين
  for (let userIndex = 0; userIndex < userCount; userIndex++) {
    const senderId = `test-user-load-${userIndex + 1}`;
    
    for (let msgIndex = 0; msgIndex < messageCount; msgIndex++) {
      const promise = new Promise(async (resolve) => {
        // تأخير عشوائي صغير لمحاكاة الواقع
        const delay = Math.random() * 500;
        setTimeout(async () => {
          const message = `رسالة ${msgIndex + 1} من العميل ${userIndex + 1}`;
          const messageId = `load_test_${userIndex}_${msgIndex}_${Date.now()}`;
          console.log(`   📨 ${senderId}: "${message}"`);
          const success = await simulateWebhook(senderId, message, messageId);
          resolve({ senderId, message, success, userIndex, msgIndex });
        }, delay);
      });
      
      allPromises.push(promise);
    }
  }

  const results = await Promise.all(allPromises);
  
  // انتظار معالجة النظام
  console.log('⏳ انتظار معالجة النظام...');
  await new Promise(resolve => setTimeout(resolve, 15000));

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // تحليل النتائج
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  
  console.log('\n📊 نتائج اختبار الحمولة العالية:');
  console.log(`   ✅ نجح: ${successCount}/${results.length} رسالة`);
  console.log(`   ❌ فشل: ${failureCount}/${results.length} رسالة`);
  console.log(`   📈 معدل النجاح: ${((successCount / results.length) * 100).toFixed(1)}%`);
  console.log(`   ⏱️  إجمالي الوقت: ${totalTime}ms`);
  console.log(`   ⚡ متوسط الوقت لكل رسالة: ${(totalTime / results.length).toFixed(1)}ms`);

  return successCount === results.length;
}

/**
 * تشغيل جميع الاختبارات
 */
async function runAllTests() {
  console.log('🚀 بدء اختبارات المعالجة المتزامنة للرسائل');
  console.log('=' .repeat(60));

  const tests = [
    { name: 'رسائل متزامنة من نفس العميل', fn: testConcurrentMessagesFromSameUser },
    { name: 'رسائل متزامنة من عملاء مختلفين', fn: testConcurrentMessagesFromDifferentUsers },
    { name: 'اختبار الحمولة العالية', fn: testHighLoadConcurrency }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`\n🧪 تشغيل: ${test.name}`);
      const success = await test.fn();
      results.push({ name: test.name, success });
      
      // انتظار بين الاختبارات
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ خطأ في اختبار "${test.name}":`, error.message);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }

  // تقرير نهائي
  console.log('\n' + '=' .repeat(60));
  console.log('📋 التقرير النهائي لاختبارات المعالجة المتزامنة');
  console.log('=' .repeat(60));

  results.forEach(result => {
    const status = result.success ? '✅ نجح' : '❌ فشل';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   خطأ: ${result.error}`);
    }
  });

  const successCount = results.filter(r => r.success).length;
  const totalTests = results.length;

  console.log(`\n📊 النتيجة الإجمالية: ${successCount}/${totalTests} اختبارات نجحت`);
  
  if (successCount === totalTests) {
    console.log('🎉 جميع الاختبارات نجحت! النظام يدعم المعالجة المتزامنة بكفاءة');
  } else {
    console.log('⚠️  بعض الاختبارات فشلت - يحتاج النظام لتحسينات في المعالجة المتزامنة');
  }
}

// تشغيل الاختبارات
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('\n✅ انتهت جميع الاختبارات');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 خطأ في تشغيل الاختبارات:', error);
      process.exit(1);
    });
}

module.exports = {
  testConcurrentMessagesFromSameUser,
  testConcurrentMessagesFromDifferentUsers,
  testHighLoadConcurrency,
  runAllTests
};
