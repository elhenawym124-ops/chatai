const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');

async function testShippingQueries() {
  try {
    console.log('🚚 اختبار استفسارات الشحن...\n');
    
    // 1. اختبار تحليل النية
    console.log('1️⃣ اختبار تحليل النية:');
    console.log('='.repeat(50));
    
    const shippingQueries = [
      'ايه تكلفة الشحن؟',
      'كام الشحن؟',
      'الشحن بكام؟',
      'معلومات عن التوصيل',
      'هل الشحن مجاني؟',
      'متى يوصل الطلب؟',
      'كم يوم التوصيل؟'
    ];
    
    shippingQueries.forEach(query => {
      const intent = aiAgentService.analyzeIntent(query);
      console.log(`"${query}" -> ${intent}`);
    });
    
    // 2. اختبار RAG
    console.log('\n2️⃣ اختبار RAG:');
    console.log('='.repeat(50));
    
    await ragService.ensureInitialized();
    
    for (const query of shippingQueries.slice(0, 3)) {
      console.log(`\n🔍 اختبار: "${query}"`);
      
      const intent = aiAgentService.analyzeIntent(query);
      const ragResults = await ragService.retrieveRelevantData(query, intent);
      
      console.log('النية:', intent);
      console.log('عدد نتائج RAG:', ragResults.length);
      
      ragResults.forEach((result, index) => {
        console.log(`نتيجة ${index + 1}:`);
        console.log('النوع:', result.type);
        console.log('المحتوى:', result.content.substring(0, 150) + '...');
        console.log('النقاط:', result.score);
      });
    }
    
    // 3. اختبار رد كامل
    console.log('\n3️⃣ اختبار رد كامل:');
    console.log('='.repeat(50));
    
    const testData = {
      conversationId: 'test-shipping-simple',
      senderId: 'test-user-shipping-simple',
      content: 'ايه تكلفة الشحن؟',
      customerData: {
        id: 'test-user-shipping-simple',
        name: 'مختبر الشحن البسيط',
        phone: '01234567890',
        orderCount: 0
      }
    };
    
    console.log('إرسال الاستعلام:', testData.content);
    
    const response = await aiAgentService.processCustomerMessage(testData);
    
    console.log('\n📊 النتائج:');
    console.log('نجح المعالجة:', response.success);
    console.log('النية:', response.intent);
    console.log('استخدم RAG:', response.ragDataUsed);
    console.log('الثقة:', response.confidence);
    
    console.log('\n💬 الرد:');
    console.log(response.content);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error('التفاصيل:', error.stack);
  }
}

testShippingQueries();
