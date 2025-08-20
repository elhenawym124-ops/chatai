const ragService = require('./src/services/ragService');

async function testRAGSearch() {
  console.log('🧪 اختبار البحث في RAG...\n');
  
  try {
    // انتظار التهيئة
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📊 محتويات قاعدة المعرفة:');
    console.log(`عدد العناصر الكلي: ${ragService.knowledgeBase.size}`);
    
    let productCount = 0;
    console.log('\n📦 المنتجات المحملة:');
    for (const [key, item] of ragService.knowledgeBase.entries()) {
      if (item.type === 'product') {
        productCount++;
        console.log(`${productCount}. ${item.metadata.name} - ${item.metadata.price} ج.م`);
        console.log(`   المحتوى: ${item.content.substring(0, 100)}...`);
      }
    }
    
    console.log(`\n📊 إجمالي المنتجات: ${productCount}`);
    
    // اختبار البحث بكلمات مختلفة
    const searchQueries = [
      'ايه المنتجات الموجودة',
      'المنتجات',
      'منتجات',
      'كوتشي',
      'هاف كوتشي',
      'اسكوتش'
    ];
    
    for (const query of searchQueries) {
      console.log(`\n🔍 البحث عن: "${query}"`);
      
      try {
        const results = await ragService.retrieveRelevantData(query, 'product_inquiry', 'test');
        console.log(`   النتائج: ${results.length}`);
        
        results.forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.metadata?.name || 'غير محدد'} (نقاط: ${result.score || 'غير محدد'})`);
        });
        
        if (results.length === 0) {
          console.log('   ❌ لا توجد نتائج');
        }
      } catch (error) {
        console.log(`   ❌ خطأ في البحث: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

testRAGSearch();
