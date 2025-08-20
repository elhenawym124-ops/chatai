/**
 * اختبار بسيط للمعالجة المتزامنة
 */

const axios = require('axios');

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
              mid: `test_${Date.now()}_${Math.random()}`,
              text: message
            }
          }]
        }]
      };

      try {
        console.log(`📤 إرسال: ${senderId} - "${message}"`);
        const response = await axios.post('http://localhost:3001/webhook', webhookData, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'facebookexternalua'
          },
          timeout: 5000
        });
        
        console.log(`✅ تم إرسال: ${senderId} - "${message}"`);
        resolve(true);
      } catch (error) {
        console.error(`❌ فشل: ${senderId} - "${message}" - ${error.message}`);
        resolve(false);
      }
    }, delay);
  });
}

async function testSameUserConcurrent() {
  console.log('\n🧪 اختبار: رسائل متزامنة من نفس العميل');
  console.log('=' .repeat(50));

  const senderId = 'test-same-user';
  
  // إرسال رسالتين في نفس الوقت
  const promises = [
    sendMessage(senderId, 'الرسالة الأولى', 0),
    sendMessage(senderId, 'الرسالة الثانية', 100)
  ];

  const results = await Promise.all(promises);
  
  console.log('\n📊 النتائج:');
  console.log(`رسالة 1: ${results[0] ? '✅' : '❌'}`);
  console.log(`رسالة 2: ${results[1] ? '✅' : '❌'}`);
  
  return results.every(r => r);
}

async function testDifferentUsersConcurrent() {
  console.log('\n🧪 اختبار: رسائل متزامنة من عملاء مختلفين');
  console.log('=' .repeat(50));

  // إرسال رسائل من عملاء مختلفين في نفس الوقت
  const promises = [
    sendMessage('user-1', 'مرحبا من العميل الأول', 0),
    sendMessage('user-2', 'مرحبا من العميل الثاني', 0),
    sendMessage('user-3', 'مرحبا من العميل الثالث', 0)
  ];

  const results = await Promise.all(promises);
  
  console.log('\n📊 النتائج:');
  console.log(`عميل 1: ${results[0] ? '✅' : '❌'}`);
  console.log(`عميل 2: ${results[1] ? '✅' : '❌'}`);
  console.log(`عميل 3: ${results[2] ? '✅' : '❌'}`);
  
  return results.every(r => r);
}

async function runTests() {
  console.log('🚀 بدء الاختبارات البسيطة');
  
  // انتظار تشغيل الخادم
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const test1 = await testSameUserConcurrent();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const test2 = await testDifferentUsersConcurrent();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 النتائج النهائية:');
  console.log(`نفس العميل: ${test1 ? '✅ نجح' : '❌ فشل'}`);
  console.log(`عملاء مختلفين: ${test2 ? '✅ نجح' : '❌ فشل'}`);
  
  if (test1 && test2) {
    console.log('🎉 جميع الاختبارات نجحت!');
  } else {
    console.log('⚠️ بعض الاختبارات فشلت');
  }
}

runTests().catch(console.error);
