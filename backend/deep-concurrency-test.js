/**
 * فحص عميق للمشاكل في المعالجة المتزامنة
 */

const axios = require('axios');

// متغيرات لتتبع النتائج
let testResults = {
  messagesSent: 0,
  messagesReceived: 0,
  errors: [],
  timings: [],
  duplicates: [],
  missing: [],
  orderIssues: []
};

async function sendMessage(senderId, message, expectedOrder, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const startTime = Date.now();
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
              mid: `test_${Date.now()}_${Math.random()}_${expectedOrder}`,
              text: message
            }
          }]
        }]
      };

      try {
        console.log(`📤 [${expectedOrder}] إرسال: ${senderId} - "${message}"`);
        testResults.messagesSent++;
        
        const response = await axios.post('http://localhost:3001/webhook', webhookData, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'facebookexternalua'
          },
          timeout: 10000
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        testResults.timings.push({
          senderId,
          message,
          expectedOrder,
          duration,
          timestamp: startTime
        });
        
        console.log(`✅ [${expectedOrder}] تم إرسال: ${senderId} - "${message}" (${duration}ms)`);
        resolve({ success: true, duration, expectedOrder });
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        testResults.errors.push({
          senderId,
          message,
          expectedOrder,
          error: error.message,
          duration,
          timestamp: startTime
        });
        
        console.error(`❌ [${expectedOrder}] فشل: ${senderId} - "${message}" - ${error.message}`);
        resolve({ success: false, error: error.message, duration, expectedOrder });
      }
    }, delay);
  });
}

async function testRapidSequentialMessages() {
  console.log('\n🧪 اختبار: رسائل متتالية سريعة من نفس العميل');
  console.log('=' .repeat(70));

  const senderId = 'rapid-test-user';
  const messages = [
    'الرسالة الأولى',
    'الرسالة الثانية', 
    'الرسالة الثالثة',
    'الرسالة الرابعة',
    'الرسالة الخامسة'
  ];

  console.log('📤 إرسال 5 رسائل متتالية بفواصل 100ms...');
  
  const promises = messages.map((message, index) => 
    sendMessage(senderId, message, index + 1, index * 100)
  );

  const results = await Promise.all(promises);
  
  console.log('\n📊 نتائج الإرسال السريع:');
  results.forEach((result, index) => {
    console.log(`رسالة ${index + 1}: ${result.success ? '✅' : '❌'} (${result.duration}ms)`);
  });
  
  return results;
}

async function testHighConcurrency() {
  console.log('\n🧪 اختبار: حمولة عالية - 10 عملاء × 3 رسائل');
  console.log('=' .repeat(70));

  const promises = [];
  
  // 10 عملاء، كل عميل يرسل 3 رسائل
  for (let userId = 1; userId <= 10; userId++) {
    for (let msgNum = 1; msgNum <= 3; msgNum++) {
      const senderId = `user-${userId}`;
      const message = `رسالة ${msgNum} من العميل ${userId}`;
      const expectedOrder = (userId - 1) * 3 + msgNum;
      
      promises.push(
        sendMessage(senderId, message, expectedOrder, Math.random() * 500)
      );
    }
  }

  console.log('📤 إرسال 30 رسالة من 10 عملاء بشكل متزامن...');
  
  const results = await Promise.all(promises);
  
  console.log('\n📊 نتائج الحمولة العالية:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ نجح: ${successful}/30`);
  console.log(`❌ فشل: ${failed}/30`);
  
  return results;
}

async function testRaceConditions() {
  console.log('\n🧪 اختبار: حالات السباق (Race Conditions)');
  console.log('=' .repeat(70));

  const senderId = 'race-test-user';
  
  // إرسال رسائل في نفس اللحظة تماماً
  const promises = [
    sendMessage(senderId, 'رسالة متزامنة 1', 1, 0),
    sendMessage(senderId, 'رسالة متزامنة 2', 2, 0),
    sendMessage(senderId, 'رسالة متزامنة 3', 3, 0),
    sendMessage(senderId, 'رسالة متزامنة 4', 4, 0),
    sendMessage(senderId, 'رسالة متزامنة 5', 5, 0)
  ];

  console.log('📤 إرسال 5 رسائل في نفس اللحظة تماماً...');
  
  const results = await Promise.all(promises);
  
  console.log('\n📊 نتائج حالات السباق:');
  results.forEach((result, index) => {
    console.log(`رسالة ${index + 1}: ${result.success ? '✅' : '❌'} (${result.duration}ms)`);
  });
  
  return results;
}

async function testMemoryLeaks() {
  console.log('\n🧪 اختبار: تسريب الذاكرة والتايمرات');
  console.log('=' .repeat(70));

  const senderId = 'memory-test-user';
  
  // إرسال رسائل متتالية ثم إلغاء بعضها
  console.log('📤 إرسال رسائل متتالية لاختبار تسريب التايمرات...');
  
  const promises = [];
  for (let i = 1; i <= 15; i++) {
    promises.push(
      sendMessage(senderId, `رسالة تايمر ${i}`, i, i * 50)
    );
  }

  const results = await Promise.all(promises);
  
  console.log('\n📊 نتائج اختبار التايمرات:');
  const successful = results.filter(r => r.success).length;
  console.log(`✅ نجح: ${successful}/15`);
  
  return results;
}

async function analyzeResults() {
  console.log('\n' + '=' .repeat(70));
  console.log('📋 تحليل عميق للنتائج');
  console.log('=' .repeat(70));
  
  console.log(`📊 إجمالي الرسائل المرسلة: ${testResults.messagesSent}`);
  console.log(`📊 إجمالي الأخطاء: ${testResults.errors.length}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ الأخطاء المكتشفة:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. [${error.expectedOrder}] ${error.senderId}: ${error.error}`);
    });
  }
  
  // تحليل الأوقات
  if (testResults.timings.length > 0) {
    const avgTime = testResults.timings.reduce((sum, t) => sum + t.duration, 0) / testResults.timings.length;
    const maxTime = Math.max(...testResults.timings.map(t => t.duration));
    const minTime = Math.min(...testResults.timings.map(t => t.duration));
    
    console.log('\n⏱️ تحليل الأوقات:');
    console.log(`متوسط وقت الاستجابة: ${avgTime.toFixed(2)}ms`);
    console.log(`أسرع استجابة: ${minTime}ms`);
    console.log(`أبطأ استجابة: ${maxTime}ms`);
  }
  
  console.log('\n🔍 نصائح للفحص اليدوي:');
  console.log('1. راجع اللوج للبحث عن رسائل "تم إلغاء التايمر"');
  console.log('2. ابحث عن رسائل مفقودة أو مكررة');
  console.log('3. تحقق من ترتيب معالجة الرسائل');
  console.log('4. راقب استهلاك الذاكرة والـ CPU');
  console.log('5. ابحث عن race conditions في اللوج');
}

async function runDeepTests() {
  console.log('🚀 بدء الفحص العميق للمعالجة المتزامنة');
  console.log('=' .repeat(70));
  
  // انتظار تشغيل الخادم
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    // اختبار 1: رسائل متتالية سريعة
    await testRapidSequentialMessages();
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // اختبار 2: حالات السباق
    await testRaceConditions();
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // اختبار 3: حمولة عالية
    await testHighConcurrency();
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // اختبار 4: تسريب الذاكرة
    await testMemoryLeaks();
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // تحليل النتائج
    await analyzeResults();
    
  } catch (error) {
    console.error('❌ خطأ في الاختبارات:', error);
  }
}

runDeepTests().catch(console.error);
