/**
 * اختبار إرسال webhook مع رسالة فعلية لفحص المشكلة
 */

const axios = require('axios');

async function testWebhookWithMessage() {
  console.log('🔍 اختبار webhook مع رسالة فعلية...');
  console.log('='.repeat(60));

  const webhookURL = 'http://localhost:3001/webhook';
  
  // webhook مع رسالة فعلية
  const testWebhook = {
    "object": "page",
    "entry": [
      {
        "time": Date.now(),
        "id": "114497159957743",
        "messaging": [
          {
            "sender": {
              "id": "TEST_USER_12345"
            },
            "recipient": {
              "id": "114497159957743"
            },
            "timestamp": Date.now(),
            "message": {
              "mid": "test_message_" + Date.now(),
              "text": "مرحبا، هذه رسالة اختبار"
            }
          }
        ]
      }
    ]
  };

  try {
    console.log('📤 إرسال webhook مع رسالة...');
    console.log('محتوى الـ webhook:');
    console.log(JSON.stringify(testWebhook, null, 2));

    const response = await axios.post(webhookURL, testWebhook, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'facebookexternalua'
      }
    });

    console.log(`✅ تم إرسال الـ webhook بنجاح - Status: ${response.status}`);
    console.log(`📝 الاستجابة: ${response.data}`);

    // انتظار قليل لمعالجة الرسالة
    console.log('\n⏳ انتظار معالجة الرسالة...');
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('❌ خطأ في إرسال الـ webhook:', error.message);
    if (error.response) {
      console.error(`📊 Status: ${error.response.status}`);
      console.error(`📝 Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// تشغيل الاختبار
testWebhookWithMessage().catch(console.error);
