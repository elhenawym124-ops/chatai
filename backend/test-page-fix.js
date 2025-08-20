/**
 * اختبار إصلاح مشكلة اختيار الصفحة
 */

const axios = require('axios');

async function testPageFix() {
  console.log('🔧 اختبار إصلاح مشكلة اختيار الصفحة...');
  console.log('='.repeat(50));

  try {
    // إرسال رسالة تجريبية لصفحة Swan-store مع recipient.id صحيح
    const testWebhook = {
      "object": "page",
      "entry": [
        {
          "time": Date.now(),
          "id": "675323792321557", // معرف صفحة Swan-store
          "messaging": [
            {
              "sender": {
                "id": "PAGE_FIX_TEST_USER"
              },
              "recipient": {
                "id": "675323792321557" // معرف صفحة Swan-store الصحيح
              },
              "timestamp": Date.now(),
              "message": {
                "mid": "page_fix_test_" + Date.now(),
                "text": "اختبار إصلاح الصفحة - هل سيتم الرد من Swan-store؟"
              }
            }
          ]
        }
      ]
    };

    console.log('📤 إرسال رسالة اختبار إصلاح الصفحة...');
    console.log(`📄 صفحة: Swan-store (675323792321557)`);
    console.log(`👤 عميل: PAGE_FIX_TEST_USER`);
    console.log(`💬 رسالة: "اختبار إصلاح الصفحة - هل سيتم الرد من Swan-store؟"`);

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
    
    console.log('\n🔍 تحقق من اللوج لرؤية النتيجة...');
    console.log('📱 إذا ظهر "Using Page Access Token for page: Swan-store" فالإصلاح نجح!');
    console.log('❌ إذا ظهر "Using Page Access Token for page: Simple A42" فالمشكلة لا تزال موجودة');

  } catch (error) {
    console.error('❌ خطأ في اختبار إصلاح الصفحة:', error.message);
  }
}

// تشغيل الاختبار
testPageFix().catch(console.error);
