/**
 * فحص لوج الخادم للبحث عن رسالتك الجديدة
 */

const axios = require('axios');

async function checkServerLogs() {
  console.log('🔍 فحص لوج الخادم للبحث عن رسالتك الجديدة...');
  console.log('='.repeat(60));

  try {
    // فحص إذا كان الخادم يعمل
    console.log('🌐 فحص حالة الخادم...');
    const healthCheck = await axios.get('http://localhost:3001/test');
    console.log('✅ الخادم يعمل:', healthCheck.data);

    // إرسال رسالة اختبار للبحث عن رسالتك
    const testWebhook = {
      "object": "page",
      "entry": [
        {
          "time": Date.now(),
          "id": "675323792321557", // معرف صفحة Swan-store
          "messaging": [
            {
              "sender": {
                "id": "SEARCH_FOR_YOUR_MESSAGE"
              },
              "recipient": {
                "id": "675323792321557"
              },
              "timestamp": Date.now(),
              "message": {
                "mid": "search_message_" + Date.now(),
                "text": "🔍 البحث عن رسالتك: السلام عليكم - هل وصلت؟"
              }
            }
          ]
        }
      ]
    };

    console.log('\n📤 إرسال رسالة اختبار للبحث...');
    const response = await axios.post('http://localhost:3001/webhook', testWebhook, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'facebookexternalua'
      }
    });

    console.log('✅ تم إرسال رسالة البحث:', response.data);
    
    console.log('\n📋 تعليمات:');
    console.log('1. ابحث في لوج الخادم عن رسالة "السلام عليكم"');
    console.log('2. ابحث عن رسالة "🔍 البحث عن رسالتك"');
    console.log('3. قارن بين الرسالتين لرؤية الفرق');
    
    console.log('\n🎯 ما نبحث عنه:');
    console.log('✅ إذا ظهرت رسالة "message" في اللوج = الرسالة وصلت');
    console.log('❌ إذا ظهرت "No message in webhook event" = المشكلة لا تزال موجودة');
    console.log('✅ إذا ظهر رد من AI = النظام يعمل بشكل كامل');

  } catch (error) {
    console.error('❌ خطأ في فحص الخادم:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('🚨 الخادم غير متصل! يجب تشغيل الخادم أولاً.');
      console.log('💡 شغل الخادم بالأمر: npm start');
    }
  }
}

// تشغيل الفحص
checkServerLogs().catch(console.error);
