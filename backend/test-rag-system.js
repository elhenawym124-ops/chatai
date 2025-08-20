const ragService = require('./src/services/ragService');

async function testRAGSystem() {
  console.log('🧪 اختبار نظام RAG...');
  
  try {
    // انتظار تهيئة قاعدة المعرفة
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n📊 فحص قاعدة المعرفة...');
    console.log('عدد العناصر في قاعدة المعرفة:', ragService.knowledgeBase.size);
    
    // عرض محتويات قاعدة المعرفة
    let productCount = 0;
    let faqCount = 0;
    let policyCount = 0;
    
    for (const [key, item] of ragService.knowledgeBase.entries()) {
      if (item.type === 'product') productCount++;
      else if (item.type === 'faq') faqCount++;
      else if (item.type === 'policy') policyCount++;
    }
    
    console.log(`📦 المنتجات: ${productCount}`);
    console.log(`❓ الأسئلة الشائعة: ${faqCount}`);
    console.log(`📋 السياسات: ${policyCount}`);
    
    // اختبار البحث عن منتجات
    console.log('\n🔍 اختبار البحث عن منتجات...');
    
    const testQueries = [
      { query: 'حذاء', intent: 'product_inquiry' },
      { query: 'سعر', intent: 'price_inquiry' },
      { query: 'منتج', intent: 'product_inquiry' },
      { query: 'متوفر', intent: 'product_inquiry' }
    ];
    
    for (const test of testQueries) {
      console.log(`\n🔎 البحث عن: "${test.query}" (النية: ${test.intent})`);
      
      const results = await ragService.retrieveRelevantData(
        test.query, 
        test.intent, 
        'test-customer'
      );
      
      console.log(`📊 النتائج: ${results.length} عنصر`);
      
      if (results.length > 0) {
        results.slice(0, 2).forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.type}: ${result.content.substring(0, 100)}...`);
          if (result.score) {
            console.log(`      النقاط: ${result.score.toFixed(2)}`);
          }
        });
      } else {
        console.log('   ❌ لم يتم العثور على نتائج');
      }
    }
    
    // اختبار البحث العام
    console.log('\n🔍 اختبار البحث العام...');
    const generalResults = await ragService.retrieveRelevantData(
      'مرحبا كيف حالك', 
      'general', 
      'test-customer'
    );
    
    console.log(`📊 نتائج البحث العام: ${generalResults.length} عنصر`);

  } catch (error) {
    console.error('❌ خطأ في اختبار RAG:', error);
  }
}

testRAGSystem();
