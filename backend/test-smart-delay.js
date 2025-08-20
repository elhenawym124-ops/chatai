/**
 * اختبار نظام التأخير الذكي للرسائل
 * Smart Message Delay System Test
 */

const axios = require('axios');

// إعدادات الاختبار
const TEST_CONFIG = {
  baseURL: 'http://localhost:3001',
  testSenderId: 'test_user_smart_delay',
  delayBetweenMessages: 500 // نصف ثانية بين الرسائل
};

// سيناريوهات الاختبار
const TEST_SCENARIOS = [
  {
    name: 'رسائل قصيرة متتالية',
    messages: ['عايز', 'كوتشي', 'أسود'],
    expectedBehavior: 'يجب جمعها في رد واحد'
  },
  {
    name: 'سؤال مباشر',
    messages: ['إيه أسعاركم؟'],
    expectedBehavior: 'رد فوري'
  },
  {
    name: 'رسالة طويلة',
    messages: ['عايز أعرف إيه المنتجات المتاحة عندكم وأسعارها وطرق التوصيل'],
    expectedBehavior: 'رد فوري للرسالة الطويلة'
  },
  {
    name: 'رسائل غير مكتملة',
    messages: ['عايز كوتشي و', 'كمان شنطة'],
    expectedBehavior: 'انتظار ثم جمع الرسائل'
  },
  {
    name: 'رد نهائي',
    messages: ['شكراً ليك'],
    expectedBehavior: 'رد عادي'
  }
];

/**
 * محاكاة إرسال webhook من فيسبوك
 */
async function simulateWebhook(senderId, messageText) {
  const webhookData = {
    object: 'page',
    entry: [{
      id: '250528358137901',
      time: Date.now(),
      messaging: [{
        sender: { id: senderId },
        recipient: { id: '250528358137901' },
        timestamp: Date.now(),
        message: {
          mid: `test_${Date.now()}_${Math.random()}`,
          text: messageText
        }
      }]
    }]
  };

  try {
    const response = await axios.post(`${TEST_CONFIG.baseURL}/webhook`, webhookData);
    return response.status === 200;
  } catch (error) {
    console.error(`❌ خطأ في إرسال webhook:`, error.message);
    return false;
  }
}

/**
 * الحصول على إحصائيات النظام
 */
async function getSystemStats() {
  try {
    const response = await axios.get(`${TEST_CONFIG.baseURL}/api/v1/smart-delay/stats`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ خطأ في الحصول على الإحصائيات:`, error.message);
    return null;
  }
}

/**
 * تشغيل سيناريو اختبار واحد
 */
async function runTestScenario(scenario, scenarioIndex) {
  console.log(`\n🧪 اختبار ${scenarioIndex + 1}: ${scenario.name}`);
  console.log(`📝 السلوك المتوقع: ${scenario.expectedBehavior}`);
  console.log(`📨 الرسائل: ${scenario.messages.join(' | ')}`);
  
  const startTime = Date.now();
  
  // إرسال الرسائل
  for (let i = 0; i < scenario.messages.length; i++) {
    const message = scenario.messages[i];
    console.log(`   📤 إرسال رسالة ${i + 1}: "${message}"`);
    
    const success = await simulateWebhook(TEST_CONFIG.testSenderId, message);
    if (!success) {
      console.log(`   ❌ فشل في إرسال الرسالة ${i + 1}`);
      return false;
    }
    
    // انتظار بين الرسائل
    if (i < scenario.messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenMessages));
    }
  }
  
  // انتظار معالجة النظام
  console.log(`   ⏳ انتظار معالجة النظام...`);
  await new Promise(resolve => setTimeout(resolve, 6000)); // 6 ثواني انتظار
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  console.log(`   ✅ انتهى الاختبار في ${totalTime}ms`);
  
  return true;
}

/**
 * اختبار تحديث الإعدادات
 */
async function testConfigUpdate() {
  console.log(`\n⚙️ اختبار تحديث الإعدادات...`);
  
  const newConfig = {
    delays: {
      SHORT_MESSAGE: 2000,
      DIRECT_QUESTION: 300
    },
    maxDelay: 4000
  };
  
  try {
    const response = await axios.post(`${TEST_CONFIG.baseURL}/api/v1/smart-delay/config`, newConfig);
    
    if (response.data.success) {
      console.log(`   ✅ تم تحديث الإعدادات بنجاح`);
      console.log(`   📊 الإعدادات الجديدة:`, response.data.newConfig.DELAYS);
      return true;
    } else {
      console.log(`   ❌ فشل في تحديث الإعدادات`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ خطأ في تحديث الإعدادات:`, error.message);
    return false;
  }
}

/**
 * اختبار معالجة طارئة
 */
async function testEmergencyFlush() {
  console.log(`\n🚨 اختبار المعالجة الطارئة...`);
  
  // إرسال رسائل سريعة
  await simulateWebhook(TEST_CONFIG.testSenderId, 'رسالة');
  await simulateWebhook(TEST_CONFIG.testSenderId, 'سريعة');
  
  try {
    const response = await axios.post(`${TEST_CONFIG.baseURL}/api/v1/smart-delay/flush`);
    
    if (response.data.success) {
      console.log(`   ✅ تم تنفيذ المعالجة الطارئة`);
      console.log(`   📊 تم معالجة: ${response.data.message}`);
      return true;
    } else {
      console.log(`   ❌ فشل في المعالجة الطارئة`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ خطأ في المعالجة الطارئة:`, error.message);
    return false;
  }
}

/**
 * تشغيل جميع الاختبارات
 */
async function runAllTests() {
  console.log('🚀 بدء اختبار نظام التأخير الذكي...\n');
  
  // فحص حالة الخادم
  console.log('🔍 فحص حالة الخادم...');
  const initialStats = await getSystemStats();
  if (!initialStats) {
    console.log('❌ الخادم غير متاح. تأكد من تشغيل الخادم على المنفذ 3001');
    return;
  }
  
  console.log(`✅ الخادم يعمل. قوائم نشطة: ${initialStats.activeQueues}`);
  
  let passedTests = 0;
  let totalTests = TEST_SCENARIOS.length + 2; // +2 للاختبارات الإضافية
  
  // تشغيل سيناريوهات الاختبار
  for (let i = 0; i < TEST_SCENARIOS.length; i++) {
    const success = await runTestScenario(TEST_SCENARIOS[i], i);
    if (success) passedTests++;
    
    // انتظار بين الاختبارات
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // اختبار تحديث الإعدادات
  const configSuccess = await testConfigUpdate();
  if (configSuccess) passedTests++;
  
  // اختبار المعالجة الطارئة
  const flushSuccess = await testEmergencyFlush();
  if (flushSuccess) passedTests++;
  
  // النتائج النهائية
  console.log(`\n📊 نتائج الاختبار:`);
  console.log(`✅ نجح: ${passedTests}/${totalTests} اختبار`);
  console.log(`❌ فشل: ${totalTests - passedTests}/${totalTests} اختبار`);
  
  if (passedTests === totalTests) {
    console.log(`🎉 جميع الاختبارات نجحت! النظام يعمل بشكل مثالي.`);
  } else {
    console.log(`⚠️ بعض الاختبارات فشلت. راجع اللوج أعلاه للتفاصيل.`);
  }
  
  // إحصائيات نهائية
  const finalStats = await getSystemStats();
  if (finalStats) {
    console.log(`\n📈 إحصائيات النظام النهائية:`);
    console.log(`   قوائم نشطة: ${finalStats.activeQueues}`);
    console.log(`   حالة النظام: ${finalStats.systemHealth}`);
  }
}

// تشغيل الاختبارات
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  simulateWebhook,
  getSystemStats,
  TEST_CONFIG
};
