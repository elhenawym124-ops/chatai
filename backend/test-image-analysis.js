const multimodalService = require('./src/services/multimodalService');

async function testImageAnalysis() {
  console.log('🧪 اختبار تحليل الصور...\n');
  
  try {
    // محاكاة رسالة تحتوي على صورة
    const mockImageMessage = {
      conversationId: 'test-conversation',
      senderId: 'test-user',
      content: 'ايه رأيك في الكوتشي ده؟',
      attachments: [{
        type: 'image',
        payload: {
          url: 'https://example.com/shoe-image.jpg' // رابط وهمي للاختبار
        }
      }],
      timestamp: new Date(),
      customerData: {
        id: 'test-customer',
        name: 'Test User'
      }
    };

    console.log('🔍 فحص نوع الرسالة...');
    const messageType = await multimodalService.detectMessageType(mockImageMessage);
    console.log(`📝 نوع الرسالة: ${messageType}`);

    if (messageType === 'image') {
      console.log('\n🖼️ معالجة الصورة...');
      
      // ملاحظة: هذا سيفشل لأن الرابط وهمي، لكن يمكننا رؤية كيف يعمل النظام
      try {
        const result = await multimodalService.processImage(mockImageMessage);
        console.log('✅ نتيجة التحليل:');
        console.log(`النوع: ${result.type}`);
        console.log(`التحليل: ${result.analysis || result.processedContent}`);
      } catch (error) {
        console.log(`❌ خطأ متوقع (رابط وهمي): ${error.message}`);
      }
    }

    // اختبار الحصول على المنتجات المتاحة
    console.log('\n📦 اختبار الحصول على المنتجات المتاحة...');
    const availableProducts = await multimodalService.getAvailableProducts();
    console.log('المنتجات المتاحة:');
    console.log(availableProducts);

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// اختبار إضافي لمحاكاة webhook مع صورة
async function simulateImageWebhook() {
  console.log('\n🌐 محاكاة webhook مع صورة...');
  
  const mockWebhookData = {
    object: 'page',
    entry: [{
      id: '123',
      time: Date.now(),
      messaging: [{
        sender: { id: 'test_user_image' },
        recipient: { id: 'test_page' },
        timestamp: Date.now(),
        message: {
          mid: 'test_mid_image',
          text: 'ايه رأيك في الكوتشي ده؟',
          attachments: [{
            type: 'image',
            payload: {
              url: 'https://example.com/shoe-image.jpg'
            }
          }]
        }
      }]
    }]
  };

  console.log('📝 بيانات الـ webhook:');
  console.log(JSON.stringify(mockWebhookData, null, 2));
  
  console.log('\n💡 لاختبار حقيقي، أرسل صورة عبر Facebook Messenger');
  console.log('النظام سيقوم بـ:');
  console.log('1. تحليل الصورة باستخدام Gemini Vision');
  console.log('2. مقارنة المنتج في الصورة مع المنتجات المتاحة');
  console.log('3. اقتراح المنتج المطابق أو البديل الأقرب');
  console.log('4. عرض السعر والتفاصيل');
}

testImageAnalysis().then(() => {
  simulateImageWebhook();
});
