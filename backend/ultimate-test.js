/**
 * اختبار نهائي للتأكد من عمل النظام بشكل كامل
 */

const axios = require('axios');

async function ultimateTest() {
  console.log('🚀 اختبار نهائي للنظام...');
  console.log('='.repeat(50));

  try {
    // إرسال رسالة نهائية لصفحة Swan-store
    const testWebhook = {
      "object": "page",
      "entry": [
        {
          "time": Date.now(),
          "id": "675323792321557", // معرف صفحة Swan-store
          "messaging": [
            {
              "sender": {
                "id": "ULTIMATE_TEST_USER"
              },
              "recipient": {
                "id": "675323792321557" // معرف صفحة Swan-store الصحيح
              },
              "timestamp": Date.now(),
              "message": {
                "mid": "ultimate_test_" + Date.now(),
                "text": "🎉 اختبار نهائي - هل النظام يعمل بشكل كامل الآن؟"
              }
            }
          ]
        }
      ]
    };

    console.log('📤 إرسال رسالة اختبار نهائية...');
    console.log(`📄 صفحة: Swan-store (675323792321557)`);
    console.log(`👤 عميل: ULTIMATE_TEST_USER`);
    console.log(`💬 رسالة: "🎉 اختبار نهائي - هل النظام يعمل بشكل كامل الآن؟"`);

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
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    console.log('\n🎯 النتيجة النهائية:');
    console.log('✅ إذا ظهر "Using Page Access Token for page: Swan-store" فالنظام يعمل بشكل كامل!');
    console.log('❌ إذا ظهر "Using Page Access Token for page: Simple A42" فالمشكلة لا تزال موجودة');
    
    console.log('\n📱 تحقق من اللوج لرؤية:');
    console.log('1. تم استقبال الرسالة لصفحة Swan-store');
    console.log('2. تم معالجة الرسالة بالذكاء الاصطناعي');
    console.log('3. تم توليد رد مناسب');
    console.log('4. تم إرسال الرد من صفحة Swan-store (وليس Simple A42)');

  } catch (error) {
    console.error('❌ خطأ في الاختبار النهائي:', error.message);
  }
}

// تشغيل الاختبار النهائي
ultimateTest().catch(console.error);
