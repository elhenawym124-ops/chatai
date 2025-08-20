/**
 * اختبار رسالة حقيقية لصفحة Swan-store
 */

const axios = require('axios');

async function testRealMessage() {
  console.log('📱 إرسال رسالة حقيقية لصفحة Swan-store...');
  console.log('='.repeat(50));

  try {
    // إرسال رسالة تجريبية مع معرف الصفحة الصحيح
    const testWebhook = {
      "object": "page",
      "entry": [
        {
          "time": Date.now(),
          "id": "675323792321557", // معرف صفحة Swan-store الصحيح
          "messaging": [
            {
              "sender": {
                "id": "REAL_TEST_USER_456"
              },
              "recipient": {
                "id": "675323792321557" // معرف صفحة Swan-store الصحيح
              },
              "timestamp": Date.now(),
              "message": {
                "mid": "real_test_message_" + Date.now(),
                "text": "السلام عليكم، أريد أن أشتري منتج"
              }
            }
          ]
        }
      ]
    };

    console.log('📤 إرسال الرسالة...');
    console.log(`📄 صفحة: Swan-store (675323792321557)`);
    console.log(`👤 عميل: REAL_TEST_USER_456`);
    console.log(`💬 رسالة: "السلام عليكم، أريد أن أشتري منتج"`);

    const response = await axios.post('http://localhost:3001/webhook', testWebhook, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'facebookexternalua'
      }
    });

    console.log('✅ تم إرسال الرسالة بنجاح');
    console.log('📊 الاستجابة:', response.data);
    
    // انتظار لمعالجة الرسالة
    console.log('\n⏳ انتظار معالجة الرسالة...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('🔍 تحقق من اللوج لرؤية النتيجة...');
    console.log('📱 إذا ظهر رد في اللوج، فالنظام يعمل بشكل صحيح!');

  } catch (error) {
    console.error('❌ خطأ في إرسال الرسالة:', error.message);
  }
}

// تشغيل الاختبار
testRealMessage().catch(console.error);
