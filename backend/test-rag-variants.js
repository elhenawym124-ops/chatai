const ragService = require('./src/services/ragService');

async function testRAGVariants() {
  console.log('🧪 اختبار RAG مع المتغيرات...\n');
  
  try {
    // تهيئة knowledge base
    console.log('🧠 تهيئة knowledge base...');
    await ragService.initializeKnowledgeBase();
    
    // اختبار استعلامات مختلفة
    const testQueries = [
      {
        query: 'كوتشي اسكوتش',
        intent: 'product_inquiry',
        description: 'البحث عن المنتج بالاسم'
      },
      {
        query: 'كوتشي اسكوتش ألوان',
        intent: 'product_inquiry', 
        description: 'البحث عن ألوان المنتج'
      },
      {
        query: 'كوتشي اسكوتش أبيض',
        intent: 'product_inquiry',
        description: 'البحث عن لون محدد'
      },
      {
        query: 'كوتشي اسكوتش سعر',
        intent: 'price_inquiry',
        description: 'البحث عن السعر'
      },
      {
        query: 'كوتشي اسكوتش متوفر',
        intent: 'product_inquiry',
        description: 'البحث عن التوفر'
      }
    ];
    
    for (const test of testQueries) {
      console.log(`\n🔍 اختبار: ${test.description}`);
      console.log(`📝 الاستعلام: "${test.query}"`);
      console.log(`🎯 النية: ${test.intent}`);
      console.log('─'.repeat(50));
      
      const results = await ragService.retrieveRelevantData(
        test.query, 
        test.intent, 
        'test-customer-id'
      );
      
      if (results && results.length > 0) {
        console.log(`✅ تم العثور على ${results.length} نتيجة:`);
        
        results.forEach((result, index) => {
          console.log(`\n${index + 1}. نوع البيانات: ${result.type}`);
          console.log(`📊 النقاط: ${result.score || 'غير محدد'}`);
          console.log(`📄 المحتوى:`);
          console.log(result.content);
          
          if (result.metadata && result.metadata.variants) {
            console.log(`🎨 المتغيرات (${result.metadata.variants.length}):`);
            result.metadata.variants.forEach(variant => {
              console.log(`   - ${variant.name} (${variant.type}): ${variant.price} ج.م - متوفر: ${variant.stock}`);
            });
          }
        });
      } else {
        console.log('❌ لم يتم العثور على نتائج');
      }
    }
    
    // اختبار محاكاة رسالة عميل
    console.log('\n🤖 اختبار محاكاة رسالة عميل:');
    console.log('='.repeat(50));
    
    const customerMessage = 'أهلاً، عايز أعرف كوتشي اسكوتش متوفر بإيه ألوان؟';
    console.log(`💬 رسالة العميل: "${customerMessage}"`);
    
    const aiAgentService = require('./src/services/aiAgentService');
    
    // محاكاة معالجة الرسالة
    const intent = await aiAgentService.analyzeIntent(customerMessage);
    const sentiment = await aiAgentService.analyzeSentiment(customerMessage);
    
    console.log(`🎯 النية المحللة: ${intent}`);
    console.log(`😊 المشاعر: ${sentiment}`);
    
    const relevantData = await ragService.retrieveRelevantData(
      customerMessage,
      intent,
      'test-customer-id'
    );
    
    console.log(`\n📊 البيانات المسترجعة (${relevantData.length}):`);
    relevantData.forEach((data, index) => {
      console.log(`\n${index + 1}. ${data.type}:`);
      console.log(data.content);
    });
    
    // محاكاة إنشاء الرد
    const response = await aiAgentService.generateResponse({
      message: customerMessage,
      intent,
      sentiment,
      relevantData,
      conversationMemory: [],
      customerData: { name: 'عميل تجريبي' }
    });
    
    console.log(`\n🤖 رد الذكاء الصناعي:`);
    console.log('─'.repeat(30));
    console.log(response);
    console.log('─'.repeat(30));
    
    console.log('\n🎉 انتهى اختبار RAG مع المتغيرات!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

testRAGVariants();
