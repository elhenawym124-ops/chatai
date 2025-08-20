async function testFixedAIResponse() {
  console.log('🤖 اختبار رد الذكاء الصناعي بعد إصلاح الأسماء...\n');
  
  try {
    const ragService = require('./src/services/ragService');
    const aiAgentService = require('./src/services/aiAgentService');
    
    // تهيئة knowledge base
    console.log('🧠 تهيئة knowledge base...');
    await ragService.initializeKnowledgeBase();
    
    // اختبار استعلامات مختلفة
    const testMessages = [
      'كوتشي اسكوتش متوفر بإيه ألوان؟',
      'عايز كوتشي اسكوتش أبيض',
      'كوتشي اسكوتش الأسود بكام؟',
      'إيه الألوان المتاحة في كوتشي اسكوتش؟'
    ];
    
    for (const message of testMessages) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`💬 رسالة العميل: "${message}"`);
      console.log(`${'='.repeat(60)}`);
      
      // تحليل النية
      const intent = await aiAgentService.analyzeIntent(message);
      const sentiment = await aiAgentService.analyzeSentiment(message);
      
      console.log(`🎯 النية: ${intent}`);
      console.log(`😊 المشاعر: ${sentiment}`);
      
      // جلب البيانات المرتبطة
      const relevantData = await ragService.retrieveRelevantData(
        message,
        intent,
        'test-customer'
      );
      
      console.log(`\n📊 البيانات المسترجعة (${relevantData.length}):`);
      if (relevantData.length > 0) {
        console.log('📄 المحتوى:');
        console.log(relevantData[0].content);
        
        if (relevantData[0].metadata && relevantData[0].metadata.variants) {
          console.log('\n🎨 المتغيرات في metadata:');
          relevantData[0].metadata.variants.forEach((variant, index) => {
            console.log(`   ${index + 1}. "${variant.name}" - ${variant.price} ج.م (${variant.stock} قطعة)`);
          });
        }
      }
      
      // إنشاء الرد
      const response = await aiAgentService.generateResponse({
        message: message,
        intent,
        sentiment,
        relevantData,
        conversationMemory: [],
        customerData: { name: 'أحمد' }
      });
      
      console.log(`\n🤖 رد الذكاء الصناعي:`);
      console.log('─'.repeat(50));
      console.log(response.content);
      console.log('─'.repeat(50));
      console.log(`🎯 الثقة: ${response.confidence}`);
      console.log(`🚨 يحتاج تصعيد: ${response.shouldEscalate ? 'نعم' : 'لا'}`);
    }
    
    console.log('\n🎉 انتهى الاختبار!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

testFixedAIResponse();
