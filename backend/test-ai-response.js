const aiAgentService = require('./src/services/aiAgentService');

async function testAIResponse() {
  console.log('🧪 اختبار الذكاء الصناعي...');
  
  try {
    // بيانات رسالة تجريبية
    const testMessage = {
      senderId: 'test-customer-123',
      conversationId: 'test-conversation-456',
      content: 'مرحباً، أريد معرفة أسعار المنتجات',
      customerData: {
        name: 'أحمد محمد',
        phone: '01234567890',
        orderCount: 2
      }
    };
    
    console.log('📤 إرسال رسالة تجريبية:', testMessage.content);
    
    // معالجة الرسالة بالذكاء الصناعي
    const response = await aiAgentService.processCustomerMessage(testMessage);
    
    if (response) {
      console.log('✅ رد الذكاء الصناعي:');
      console.log('📝 المحتوى:', response.content);
      console.log('🎯 النية:', response.intent);
      console.log('😊 المشاعر:', response.sentiment);
      console.log('⚠️ يحتاج تدخل بشري:', response.shouldEscalate);
      console.log('🎯 مستوى الثقة:', response.confidence);
    } else {
      console.log('❌ لم يتم إنتاج رد من الذكاء الصناعي');
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار الذكاء الصناعي:', error.message);
    console.error('تفاصيل الخطأ:', error);
  }
}

testAIResponse();
