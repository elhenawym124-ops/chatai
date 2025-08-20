/**
 * اختبار نهائي أخير للتأكد من عمل النظام بشكل كامل
 */

const axios = require('axios');

async function ultimateFinalTest() {
  console.log('🚀 اختبار نهائي أخير للنظام...');
  console.log('='.repeat(60));

  try {
    // إرسال رسالة نهائية أخيرة لصفحة Swan-store
    const testWebhook = {
      "object": "page",
      "entry": [
        {
          "time": Date.now(),
          "id": "675323792321557", // معرف صفحة Swan-store
          "messaging": [
            {
              "sender": {
                "id": "ULTIMATE_FINAL_TEST_USER"
              },
              "recipient": {
                "id": "675323792321557" // معرف صفحة Swan-store الصحيح
              },
              "timestamp": Date.now(),
              "message": {
                "mid": "ultimate_final_test_" + Date.now(),
                "text": "🎉 اختبار نهائي أخير - هل تم إصلاح مشكلة الإرسال؟"
              }
            }
          ]
        }
      ]
    };

    console.log('📤 إرسال رسالة اختبار نهائية أخيرة...');
    console.log(`📄 صفحة: Swan-store (675323792321557)`);
    console.log(`👤 عميل: ULTIMATE_FINAL_TEST_USER`);
    console.log(`💬 رسالة: "🎉 اختبار نهائي أخير - هل تم إصلاح مشكلة الإرسال؟"`);

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
    await new Promise(resolve => setTimeout(resolve, 25000));
    
    console.log('\n🎯 النتيجة النهائية:');
    console.log('✅ إذا ظهر "Using Page Access Token for page: Swan-store" فالنظام يعمل بشكل كامل!');
    console.log('✅ إذا لم تظهر رسالة خطأ "Failed to send Facebook message" فالإرسال نجح!');
    console.log('❌ إذا ظهر "Using Page Access Token for page: Simple A42" فالمشكلة لا تزال موجودة');
    
    console.log('\n📱 تحقق من اللوج لرؤية:');
    console.log('1. ✅ تم استقبال الرسالة لصفحة Swan-store');
    console.log('2. ✅ تم معالجة الرسالة بالذكاء الاصطناعي');
    console.log('3. ✅ تم توليد رد مناسب');
    console.log('4. ✅ تم إرسال الرد من صفحة Swan-store (وليس Simple A42)');
    console.log('5. ✅ لم تظهر رسالة خطأ في الإرسال');

    console.log('\n🎊 إذا تحققت جميع النقاط أعلاه، فالنظام يعمل بشكل مثالي!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار النهائي الأخير:', error.message);
  }
}

// تشغيل الاختبار النهائي الأخير
ultimateFinalTest().catch(console.error);
