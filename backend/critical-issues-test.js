/**
 * اختبار المشاكل الحرجة في المعالجة المتزامنة
 */

const axios = require('axios');

// متغيرات لتتبع المشاكل
let issueTracker = {
  apiExhaustion: {
    detected: false,
    firstOccurrence: null,
    messageCount: 0
  },
  raceConditions: {
    detected: false,
    timerCancellations: 0,
    simultaneousProcessing: 0
  },
  memoryLeaks: {
    detected: false,
    memoryGrowth: []
  },
  multipleAICalls: {
    detected: false,
    callsPerMessage: []
  }
};

async function sendMessage(senderId, message, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(async () => {
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
              mid: `critical_test_${Date.now()}_${Math.random()}`,
              text: message
            }
          }]
        }]
      };

      try {
        const startTime = Date.now();
        const response = await axios.post('http://localhost:3001/webhook', webhookData, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'facebookexternalua'
          },
          timeout: 15000
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ [${senderId}] "${message}" - ${duration}ms`);
        resolve({ success: true, duration, message });
      } catch (error) {
        console.error(`❌ [${senderId}] "${message}" - ${error.message}`);
        resolve({ success: false, error: error.message, message });
      }
    }, delay);
  });
}

async function testAPIExhaustion() {
  console.log('\n🧪 اختبار: استنفاد API');
  console.log('=' .repeat(50));
  
  const senderId = 'api-exhaustion-test';
  let messageCount = 0;
  
  console.log('📤 إرسال رسائل حتى استنفاد API...');
  
  while (!issueTracker.apiExhaustion.detected && messageCount < 20) {
    messageCount++;
    const message = `رسالة استنفاد ${messageCount}`;
    
    const result = await sendMessage(senderId, message);
    
    if (!result.success && result.error.includes('quota')) {
      issueTracker.apiExhaustion.detected = true;
      issueTracker.apiExhaustion.firstOccurrence = new Date();
      issueTracker.apiExhaustion.messageCount = messageCount;
      
      console.log(`🚨 تم استنفاد API بعد ${messageCount} رسالة!`);
      break;
    }
    
    // انتظار قصير بين الرسائل
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (!issueTracker.apiExhaustion.detected) {
    console.log(`✅ لم يتم استنفاد API بعد ${messageCount} رسالة`);
  }
  
  return issueTracker.apiExhaustion.detected;
}

async function testRaceConditions() {
  console.log('\n🧪 اختبار: Race Conditions');
  console.log('=' .repeat(50));
  
  const senderId = 'race-condition-test';
  
  console.log('📤 إرسال 5 رسائل في نفس اللحظة...');
  
  // إرسال رسائل متزامنة تماماً
  const promises = [];
  for (let i = 1; i <= 5; i++) {
    promises.push(sendMessage(senderId, `رسالة متزامنة ${i}`, 0));
  }
  
  const results = await Promise.all(promises);
  
  // تحليل النتائج
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ نجح: ${successful}/5`);
  console.log(`❌ فشل: ${failed}/5`);
  
  if (failed > 0) {
    issueTracker.raceConditions.detected = true;
    console.log('🚨 تم اكتشاف Race Conditions!');
  }
  
  return issueTracker.raceConditions.detected;
}

async function testMultipleAICalls() {
  console.log('\n🧪 اختبار: استدعاءات AI متعددة');
  console.log('=' .repeat(50));
  
  const senderId = 'multiple-ai-test';
  
  console.log('📤 إرسال 3 رسائل متتالية بسرعة...');
  
  // إرسال رسائل متتالية بفواصل قصيرة
  const promises = [
    sendMessage(senderId, 'رسالة AI 1', 0),
    sendMessage(senderId, 'رسالة AI 2', 100),
    sendMessage(senderId, 'رسالة AI 3', 200)
  ];
  
  const results = await Promise.all(promises);
  
  console.log('📊 النتائج:');
  results.forEach((result, index) => {
    console.log(`رسالة ${index + 1}: ${result.success ? '✅' : '❌'} (${result.duration || 0}ms)`);
  });
  
  // انتظار معالجة النظام
  console.log('\n⏳ انتظار معالجة النظام...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  console.log('\n📋 تحقق من اللوج للبحث عن:');
  console.log('1. "معالجة 3 رسالة منفصلة" - يعني مشكلة!');
  console.log('2. عدد استدعاءات AI للرسائل الثلاث');
  console.log('3. "تم إلغاء التايمر" - يعني Race Condition');
  
  return true;
}

async function testMemoryUsage() {
  console.log('\n🧪 اختبار: استخدام الذاكرة');
  console.log('=' .repeat(50));
  
  const senderId = 'memory-test';
  
  console.log('📤 إرسال رسائل لمراقبة الذاكرة...');
  
  for (let i = 1; i <= 10; i++) {
    const message = `رسالة ذاكرة ${i}`;
    
    // قياس الذاكرة قبل الإرسال
    const memoryBefore = process.memoryUsage();
    
    await sendMessage(senderId, message);
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // قياس الذاكرة بعد الإرسال
    const memoryAfter = process.memoryUsage();
    
    const memoryGrowth = {
      message: i,
      heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
      external: memoryAfter.external - memoryBefore.external
    };
    
    issueTracker.memoryLeaks.memoryGrowth.push(memoryGrowth);
    
    console.log(`📊 رسالة ${i}: Heap +${(memoryGrowth.heapUsed / 1024 / 1024).toFixed(2)}MB`);
  }
  
  // تحليل نمو الذاكرة
  const totalHeapGrowth = issueTracker.memoryLeaks.memoryGrowth.reduce(
    (sum, item) => sum + item.heapUsed, 0
  );
  
  console.log(`\n📊 إجمالي نمو الذاكرة: ${(totalHeapGrowth / 1024 / 1024).toFixed(2)}MB`);
  
  if (totalHeapGrowth > 50 * 1024 * 1024) { // 50MB
    issueTracker.memoryLeaks.detected = true;
    console.log('🚨 تم اكتشاف تسريب ذاكرة محتمل!');
  }
  
  return issueTracker.memoryLeaks.detected;
}

async function generateReport() {
  console.log('\n' + '=' .repeat(70));
  console.log('📋 تقرير المشاكل الحرجة');
  console.log('=' .repeat(70));
  
  console.log('\n🚨 المشاكل المكتشفة:');
  
  if (issueTracker.apiExhaustion.detected) {
    console.log(`❌ استنفاد API: بعد ${issueTracker.apiExhaustion.messageCount} رسالة`);
  } else {
    console.log('✅ استنفاد API: لم يتم اكتشافه');
  }
  
  if (issueTracker.raceConditions.detected) {
    console.log('❌ Race Conditions: تم اكتشافها');
  } else {
    console.log('✅ Race Conditions: لم يتم اكتشافها');
  }
  
  if (issueTracker.memoryLeaks.detected) {
    console.log('❌ تسريب الذاكرة: تم اكتشافه');
  } else {
    console.log('✅ تسريب الذاكرة: لم يتم اكتشافه');
  }
  
  console.log('\n📊 إحصائيات الذاكرة:');
  if (issueTracker.memoryLeaks.memoryGrowth.length > 0) {
    const avgGrowth = issueTracker.memoryLeaks.memoryGrowth.reduce(
      (sum, item) => sum + item.heapUsed, 0
    ) / issueTracker.memoryLeaks.memoryGrowth.length;
    
    console.log(`متوسط نمو الذاكرة لكل رسالة: ${(avgGrowth / 1024 / 1024).toFixed(2)}MB`);
  }
  
  console.log('\n🔍 توصيات:');
  
  if (issueTracker.apiExhaustion.detected) {
    console.log('1. تطبيق Rate Limiting ذكي');
    console.log('2. تجميع الرسائل في طلبات مجمعة');
    console.log('3. إضافة نظام Queue للرسائل');
  }
  
  if (issueTracker.raceConditions.detected) {
    console.log('4. إصلاح منطق التايمرات');
    console.log('5. تطبيق Mutex للمعالجة المتزامنة');
    console.log('6. تحسين Smart Delay');
  }
  
  if (issueTracker.memoryLeaks.detected) {
    console.log('7. تنظيف الذاكرة بعد كل معالجة');
    console.log('8. تطبيق حد أقصى للذاكرة');
    console.log('9. تنظيف التايمرات المُلغاة');
  }
  
  console.log('\n⚠️ النظام يحتاج إصلاحات حرجة قبل النشر!');
}

async function runCriticalTests() {
  console.log('🚀 بدء اختبار المشاكل الحرجة');
  console.log('=' .repeat(70));
  
  try {
    // اختبار 1: استنفاد API
    await testAPIExhaustion();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // اختبار 2: Race Conditions
    await testRaceConditions();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // اختبار 3: استدعاءات AI متعددة
    await testMultipleAICalls();
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // اختبار 4: استخدام الذاكرة
    await testMemoryUsage();
    
    // تقرير النتائج
    await generateReport();
    
  } catch (error) {
    console.error('❌ خطأ في الاختبارات:', error);
  }
}

runCriticalTests().catch(console.error);
