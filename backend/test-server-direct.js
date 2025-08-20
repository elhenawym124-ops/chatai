const axios = require('axios');

async function testServerDirectly() {
  console.log('🧪 اختبار الخادم مباشرة...\n');

  try {
    // Test the webhook endpoint directly
    const testMessage = {
      object: 'page',
      entry: [{
        id: 'test_page_id',
        time: Date.now(),
        messaging: [{
          sender: { id: 'test_user_123' },
          recipient: { id: 'test_page_id' },
          timestamp: Date.now(),
          message: {
            mid: 'test_message_id',
            text: 'مرحبا'
          }
        }]
      }]
    };

    console.log('📤 إرسال رسالة اختبار للخادم...');
    console.log('📝 الرسالة:', testMessage.entry[0].messaging[0].message.text);

    const response = await axios.post('http://localhost:3001/webhook', testMessage, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ استجابة الخادم:', response.status);
    console.log('📋 البيانات:', response.data);

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('📋 تفاصيل الخطأ:', error.response.data);
      console.error('🔢 كود الحالة:', error.response.status);
    }
  }
}

testServerDirectly();
