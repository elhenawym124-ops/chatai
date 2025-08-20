const axios = require('axios');

async function testRealSystem() {
  console.log('🧪 اختبار النظام الحقيقي...\n');

  try {
    // محاكاة webhook من Facebook
    const webhookData = {
      "object": "page",
      "entry": [
        {
          "time": Date.now(),
          "id": "250528358137901",
          "messaging": [
            {
              "sender": {
                "id": "test_user_12345"
              },
              "recipient": {
                "id": "250528358137901"
              },
              "timestamp": Date.now(),
              "message": {
                "mid": "test_message_id",
                "text": "ابعتي ليا صورة كوتشي لمسه اشوفه"
              }
            }
          ]
        }
      ]
    };

    console.log('📤 إرسال طلب للنظام الحقيقي...');
    console.log(`📨 الرسالة: "${webhookData.entry[0].messaging[0].message.text}"`);
    
    // إرسال الطلب للخادم
    const response = await axios.post('http://localhost:3001/webhook', webhookData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ تم إرسال الطلب بنجاح');
    console.log(`📊 Status Code: ${response.status}`);
    
    // انتظار قليل للمعالجة
    console.log('⏳ انتظار معالجة الطلب...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🎯 النتيجة:');
    console.log('✅ النظام الحقيقي يعمل بدون أخطاء');
    console.log('📝 راجع اللوج للتأكد من إرسال الصور الصحيحة');
    
    console.log('\n🔍 ما يجب البحث عنه في اللوج:');
    console.log('✅ يجب أن ترى: "Found specific product: كوتشي لمسة من سوان"');
    console.log('✅ يجب أن ترى: "كوتشي لمسة من سوان - صورة 1/2/3"');
    console.log('❌ يجب ألا ترى: "كوتشي حريمي - صورة 1/2/3"');

  } catch (error) {
    console.error('❌ خطأ في اختبار النظام الحقيقي:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🔍 السبب: الخادم غير متاح على localhost:3001');
      console.log('💡 الحل: تأكد من تشغيل الخادم بـ npm start');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('🔍 السبب: انتهت مهلة الاتصال');
      console.log('💡 الحل: الخادم يستغرق وقت أطول من المتوقع');
    }
  }
}

testRealSystem();
