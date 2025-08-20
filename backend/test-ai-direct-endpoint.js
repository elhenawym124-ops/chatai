const axios = require('axios');

async function testAIDirectly() {
  console.log('🧪 اختبار الذكاء الصناعي مباشرة...\n');

  const baseURL = 'http://localhost:3001';
  
  // إنشاء endpoint مؤقت لاختبار الذكاء الصناعي
  const testEndpoint = `${baseURL}/test-ai-direct`;
  
  const testMessages = [
    'مرحباً',
    'أريد شراء منتج',
    'ما هي أسعار المنتجات؟',
    'عندكم كوتشي أبيض؟',
    'شكراً لك'
  ];

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`\n📝 اختبار رسالة ${i + 1}: "${message}"`);
    console.log('─'.repeat(50));
    
    try {
      // محاكاة رسالة من عميل Facebook
      const messageData = {
        conversationId: 'cmdlofh030029ufv4jt2xj2zv', // محادثة حقيقية
        senderId: 'test-customer-facebook-123',
        content: message,
        attachments: [],
        customerData: {
          name: 'عميل تجريبي',
          phone: '01234567890',
          email: 'test@example.com',
          orderCount: 2
        }
      };

      // استدعاء AI Agent مباشرة
      const response = await axios.post(testEndpoint, messageData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('✅ نجح الاختبار');
      console.log('📊 رد الذكاء الصناعي:', {
        success: response.data.success,
        content: response.data.data?.content?.substring(0, 100) + '...',
        intent: response.data.data?.intent,
        sentiment: response.data.data?.sentiment,
        confidence: response.data.data?.confidence,
        shouldEscalate: response.data.data?.shouldEscalate,
        processingTime: response.data.data?.processingTime + 'ms'
      });

      if (response.data.data?.images && response.data.data.images.length > 0) {
        console.log('🖼️ صور مرفقة:', response.data.data.images.length);
      }

    } catch (error) {
      console.log('❌ فشل الاختبار');
      if (error.response) {
        console.log('📄 رمز الخطأ:', error.response.status);
        console.log('📝 رسالة الخطأ:', error.response.data?.message || error.response.data?.error);
        if (error.response.data?.details) {
          console.log('🔍 تفاصيل الخطأ:', error.response.data.details);
        }
      } else if (error.request) {
        console.log('🌐 خطأ في الشبكة - لا يوجد رد من الخادم');
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
testAIDirectly().catch(console.error);
