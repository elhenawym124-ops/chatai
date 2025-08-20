/**
 * اختبار فصل الرسائل المتعددة
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

async function testMessageSeparation() {
  console.log('\n🧪 اختبار: فصل الرسائل المتعددة من نفس العميل');
  console.log('=' .repeat(60));

  const senderId = 'test-separation-user';
  
  console.log('📤 إرسال رسالتين متتاليتين بسرعة...');
  
  // إرسال رسالتين بفاصل قصير جداً
  const promises = [
    sendMessage(senderId, 'الرسالة الأولى', 0),
    sendMessage(senderId, 'الرسالة الثانية', 50) // 50ms فقط
  ];

  const results = await Promise.all(promises);
  
  console.log('\n📊 نتائج الإرسال:');
  console.log(`رسالة 1: ${results[0] ? '✅ تم الإرسال' : '❌ فشل'}`);
  console.log(`رسالة 2: ${results[1] ? '✅ تم الإرسال' : '❌ فشل'}`);
  
  // انتظار معالجة النظام
  console.log('\n⏳ انتظار معالجة النظام...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  console.log('\n📋 تحقق من اللوج لترى:');
  console.log('1. هل تم معالجة الرسائل منفصلة أم مدمجة؟');
  console.log('2. هل تم إنشاء ردود منفصلة لكل رسالة؟');
  console.log('3. هل تم حفظ كل رسالة في قاعدة البيانات منفصلة؟');
  
  return results.every(r => r);
}

async function testConcurrentDifferentUsers() {
  console.log('\n🧪 اختبار: رسائل متزامنة من عملاء مختلفين');
  console.log('=' .repeat(60));

  console.log('📤 إرسال رسائل من 3 عملاء في نفس الوقت...');
  
  // إرسال رسائل من عملاء مختلفين في نفس الوقت تماماً
  const promises = [
    sendMessage('user-concurrent-1', 'مرحبا من العميل الأول', 0),
    sendMessage('user-concurrent-2', 'مرحبا من العميل الثاني', 0),
    sendMessage('user-concurrent-3', 'مرحبا من العميل الثالث', 0)
  ];

  const results = await Promise.all(promises);
  
  console.log('\n📊 نتائج الإرسال:');
  results.forEach((result, index) => {
    console.log(`عميل ${index + 1}: ${result ? '✅ تم الإرسال' : '❌ فشل'}`);
  });
  
  // انتظار معالجة النظام
  console.log('\n⏳ انتظار معالجة النظام...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  console.log('\n📋 تحقق من اللوج لترى:');
  console.log('1. هل تم معالجة جميع الرسائل؟');
  console.log('2. هل تم إنشاء ردود لجميع العملاء؟');
  console.log('3. هل تم تجنب التداخل بين المعالجات؟');
  
  return results.every(r => r);
}

async function runTests() {
  console.log('🚀 بدء اختبارات فصل ومعالجة الرسائل');
  console.log('=' .repeat(60));
  
  // انتظار تشغيل الخادم
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const test1 = await testMessageSeparation();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const test2 = await testConcurrentDifferentUsers();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 النتائج النهائية:');
  console.log(`فصل الرسائل: ${test1 ? '✅ نجح الإرسال' : '❌ فشل الإرسال'}`);
  console.log(`عملاء متعددين: ${test2 ? '✅ نجح الإرسال' : '❌ فشل الإرسال'}`);
  
  console.log('\n📝 ملاحظات مهمة:');
  console.log('- نجاح الإرسال لا يعني نجاح المعالجة');
  console.log('- راجع اللوج لتحليل سلوك النظام');
  console.log('- ابحث عن رسائل "معالجة رسالة منفصلة"');
  console.log('- تأكد من عدم وجود "النص المدمج"');
}

runTests().catch(console.error);
