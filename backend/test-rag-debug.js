const ragService = require('./src/services/ragService');

async function testRAGDebug() {
  console.log('🔍 اختبار تشخيص RAG Knowledge Base...\n');
  
  try {
    // تهيئة knowledge base
    console.log('🧠 تهيئة knowledge base...');
    await ragService.initializeKnowledgeBase();
    
    // فحص محتويات knowledge base
    console.log('\n📊 محتويات Knowledge Base:');
    console.log('='.repeat(50));
    
    let productCount = 0;
    let faqCount = 0;
    let policyCount = 0;
    
    for (const [key, item] of ragService.knowledgeBase.entries()) {
      if (item.type === 'product') {
        productCount++;
        console.log(`\n🛍️ منتج ${productCount}:`);
        console.log(`Key: ${key}`);
        console.log(`Content: ${item.content.substring(0, 200)}...`);
        
        if (item.metadata && item.metadata.variants) {
          console.log(`🎨 المتغيرات (${item.metadata.variants.length}):`);
          item.metadata.variants.forEach((variant, index) => {
            console.log(`   ${index + 1}. "${variant.name}" - ${variant.price} ج.م (${variant.stock} قطعة)`);
          });
        }
      } else if (item.type === 'faq') {
        faqCount++;
      } else if (item.type === 'policy') {
        policyCount++;
      }
    }
    
    console.log(`\n📈 إحصائيات Knowledge Base:`);
    console.log(`   🛍️ المنتجات: ${productCount}`);
    console.log(`   ❓ الأسئلة الشائعة: ${faqCount}`);
    console.log(`   📋 السياسات: ${policyCount}`);
    console.log(`   📊 إجمالي العناصر: ${ragService.knowledgeBase.size}`);
    
    // اختبار البحث
    console.log('\n🔍 اختبار البحث:');
    console.log('='.repeat(50));
    
    const testQueries = [
      'كوتشي اسكوتش',
      'كوتشي اسكوتش ألوان',
      'كوتشي اسكوتش أبيض',
      'كوتشي اسكوتش سعر'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 البحث عن: "${query}"`);
      
      const results = await ragService.retrieveRelevantData(
        query,
        'product_inquiry',
        'test-customer'
      );
      
      if (results && results.length > 0) {
        console.log(`✅ تم العثور على ${results.length} نتيجة:`);
        results.forEach((result, index) => {
          console.log(`   ${index + 1}. النوع: ${result.type}, النقاط: ${result.score || 'غير محدد'}`);
          console.log(`      المحتوى: ${result.content.substring(0, 100)}...`);
        });
      } else {
        console.log('❌ لم يتم العثور على نتائج');
      }
    }
    
    // اختبار محاكاة رسالة فيسبوك
    console.log('\n💬 اختبار محاكاة رسالة فيسبوك:');
    console.log('='.repeat(50));
    
    const facebookMessage = {
      content: 'أهلاً، عايز أعرف كوتشي اسكوتش متوفر بإيه ألوان؟',
      senderId: 'facebook_user_123',
      customerData: {
        name: 'عميل فيسبوك',
        phone: '01234567890'
      }
    };
    
    console.log(`📱 رسالة فيسبوك: "${facebookMessage.content}"`);
    
    const aiAgentService = require('./src/services/aiAgentService');
    
    try {
      const response = await aiAgentService.processCustomerMessage(facebookMessage);
      
      if (response) {
        console.log('\n🤖 رد الذكاء الصناعي:');
        console.log('─'.repeat(40));
        console.log(response.content);
        console.log('─'.repeat(40));
        console.log(`🎯 النية: ${response.intent}`);
        console.log(`😊 المشاعر: ${response.sentiment}`);
        console.log(`🚨 يحتاج تصعيد: ${response.shouldEscalate ? 'نعم' : 'لا'}`);
        console.log(`🎯 الثقة: ${response.confidence}`);
      } else {
        console.log('❌ لم يتم إنشاء رد من الذكاء الصناعي');
      }
    } catch (error) {
      console.error('❌ خطأ في معالجة الرسالة:', error.message);
    }
    
    console.log('\n🎉 انتهى اختبار التشخيص!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

testRAGDebug();
