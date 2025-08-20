const axios = require('axios');

async function testAIAPI() {
  console.log('🧪 اختبار API الذكاء الصناعي...\n');

  const baseURL = 'http://localhost:3001/api/v1';

  // أولاً: اختبار إعدادات الذكاء الصناعي
  console.log('⚙️ اختبار إعدادات الذكاء الصناعي...');
  console.log('─'.repeat(50));

  try {
    const settingsResponse = await axios.get(`${baseURL}/ai/settings`, {
      timeout: 10000
    });

    console.log('✅ نجح جلب الإعدادات');
    console.log('📊 الإعدادات:', JSON.stringify(settingsResponse.data, null, 2));
  } catch (error) {
    console.log('❌ فشل جلب الإعدادات');
    if (error.response) {
      console.log('📄 رمز الخطأ:', error.response.status);
      console.log('📝 رسالة الخطأ:', error.response.data?.message || error.response.data?.error);
    } else {
      console.log('⚠️ خطأ:', error.message);
    }
  }

  // ثانياً: اختبار إحصائيات الذكاء الصناعي
  console.log('\n📊 اختبار إحصائيات الذكاء الصناعي...');
  console.log('─'.repeat(50));

  try {
    const statsResponse = await axios.get(`${baseURL}/ai/stats`, {
      timeout: 10000
    });

    console.log('✅ نجح جلب الإحصائيات');
    console.log('📊 الإحصائيات:', JSON.stringify(statsResponse.data, null, 2));
  } catch (error) {
    console.log('❌ فشل جلب الإحصائيات');
    if (error.response) {
      console.log('📄 رمز الخطأ:', error.response.status);
      console.log('📝 رسالة الخطأ:', error.response.data?.message || error.response.data?.error);
    } else {
      console.log('⚠️ خطأ:', error.message);
    }
  }

  // ثالثاً: اختبار مفاتيح Gemini
  console.log('\n🔑 اختبار مفاتيح Gemini...');
  console.log('─'.repeat(50));

  try {
    const keysResponse = await axios.get(`${baseURL}/ai/gemini-keys`, {
      timeout: 10000
    });

    console.log('✅ نجح جلب المفاتيح');
    console.log('🔑 المفاتيح:', JSON.stringify(keysResponse.data, null, 2));
  } catch (error) {
    console.log('❌ فشل جلب المفاتيح');
    if (error.response) {
      console.log('📄 رمز الخطأ:', error.response.status);
      console.log('📝 رسالة الخطأ:', error.response.data?.message || error.response.data?.error);
    } else {
      console.log('⚠️ خطأ:', error.message);
    }
  }

  // رابعاً: اختبار إرسال رسالة والحصول على رد ذكي
  console.log('\n💬 اختبار إرسال رسالة...');
  console.log('─'.repeat(50));

  const testMessages = [
    'مرحباً',
    'أريد شراء منتج',
    'ما هي أسعار المنتجات؟'
  ];

  // استخدام معرف محادثة حقيقي من قاعدة البيانات
  const realConversationId = 'cmdlofh030029ufv4jt2xj2zv';

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`\n📝 اختبار رسالة ${i + 1}: "${message}"`);

    try {
      // استخدام endpoint المحادثات مع معرف حقيقي
      const response = await axios.post(`${baseURL}/conversations/${realConversationId}/messages`, {
        message: message,
        senderId: 'test-customer-123',
        senderType: 'customer'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('✅ نجح إرسال الرسالة');
      console.log('📊 الرد:', {
        success: response.data.success,
        messageId: response.data.data?.id,
        aiResponse: response.data.data?.aiResponse ? 'موجود' : 'غير موجود'
      });

      if (response.data.data?.aiResponse) {
        console.log('🤖 رد الذكاء الصناعي:', {
          content: response.data.data.aiResponse.content?.substring(0, 100) + '...',
          intent: response.data.data.aiResponse.intent,
          confidence: response.data.data.aiResponse.confidence
        });
      }

    } catch (error) {
      console.log('❌ فشل إرسال الرسالة');
      if (error.response) {
        console.log('📄 رمز الخطأ:', error.response.status);
        console.log('📝 رسالة الخطأ:', error.response.data?.message || error.response.data?.error);
      } else {
        console.log('⚠️ خطأ:', error.message);
      }
    }

    // انتظار قصير بين الرسائل
    if (i < testMessages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n🏁 انتهى الاختبار');
}

// تشغيل الاختبار
testAIAPI().catch(console.error);
