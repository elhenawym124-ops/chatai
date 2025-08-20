// اختبار الخادم الحقيقي
const axios = require('axios');

async function testRealServer() {
  console.log('🧪 اختبار الخادم الحقيقي...\n');

  try {
    // Test Facebook webhook format
    const webhookData = {
      object: 'page',
      entry: [{
        id: 'test_page_id',
        time: Date.now(),
        messaging: [{
          sender: { id: 'test_user_12345' },
          recipient: { id: 'test_page_id' },
          timestamp: Date.now(),
          message: {
            mid: 'test_message_id_' + Date.now(),
            text: 'مرحبا'
          }
        }]
      }]
    };

    console.log('📤 إرسال webhook للخادم...');
    console.log('📝 الرسالة:', webhookData.entry[0].messaging[0].message.text);

    const response = await axios.post('http://localhost:3001/webhook', webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': 'sha256=test' // Mock signature
      },
      timeout: 60000
    });

    console.log('\n✅ استجابة الخادم:');
    console.log('🔢 كود الحالة:', response.status);
    console.log('📋 البيانات:', response.data);

  } catch (error) {
    console.error('\n❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('📋 تفاصيل الخطأ:', error.response.data);
      console.error('🔢 كود الحالة:', error.response.status);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 الخادم غير متصل على المنفذ 3001');
    }
  }
}

testRealServer();
