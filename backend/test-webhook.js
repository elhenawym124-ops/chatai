/**
 * اختبار webhook endpoint بعد تغيير Access Token
 */

const axios = require('axios');

async function testWebhook() {
  console.log('🚀 اختبار webhook بعد تغيير Access Token...');
  console.log('='.repeat(60));

  try {
    // إرسال رسالة اختبار لصفحة Swan-store
    const testWebhook = {
      "object": "page",
      "entry": [
        {
          "time": Date.now(),
          "id": "675323792321557", // معرف صفحة Swan-store
          "messaging": [
            {
              "sender": {
                "id": "TEST_USER_AFTER_TOKEN_UPDATE"
              },
              "recipient": {
                "id": "675323792321557" // معرف صفحة Swan-store الصحيح
              },
              "timestamp": Date.now(),
              "message": {
                "mid": "test_after_token_update_" + Date.now(),
                "text": "🔄 اختبار بعد تحديث Access Token - هل يعمل الآن؟"
              }
            }
          ]
        }
      ]
    };

    console.log('📤 إرسال رسالة اختبار بعد تحديث Token...');
    console.log(`📄 صفحة: Swan-store (675323792321557)`);
    console.log(`👤 عميل: TEST_USER_AFTER_TOKEN_UPDATE`);
    console.log(`💬 رسالة: "🔄 اختبار بعد تحديث Access Token - هل يعمل الآن؟"`);

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
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('\n🎯 النتيجة:');
    console.log('✅ إذا ظهرت رسالة "message" في اللوج فالرسالة وصلت!');
    console.log('✅ إذا ظهر رد من AI فالنظام يعمل بشكل كامل!');
    console.log('❌ إذا ظهر "No message in webhook event" فالمشكلة لا تزال موجودة');

  } catch (error) {
    console.error('❌ خطأ في اختبار webhook:', error.message);
    if (error.response) {
      console.error('📊 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testWebhook().catch(console.error);
