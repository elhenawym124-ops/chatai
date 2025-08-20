const ragService = require('./src/services/ragService');

async function testRAGInitialization() {
  console.log('🧠 اختبار تهيئة نظام RAG...');
  
  try {
    console.log('📡 محاولة تهيئة RAG...');
    
    // محاولة التهيئة
    await ragService.ensureInitialized();
    
    if (ragService.isInitialized) {
      console.log('✅ RAG System تم تهيئته بنجاح!');
      
      // فحص قاعدة المعرفة
      const stats = ragService.getKnowledgeBaseStats();
      console.log('📊 إحصائيات قاعدة المعرفة:');
      console.log(`   📦 إجمالي العناصر: ${stats.total}`);
      console.log(`   📋 التفاصيل:`, stats.byType);
      
      // اختبار بحث بسيط
      console.log('\n🔍 اختبار البحث...');
      const searchResult = await ragService.retrieveRelevantData('كوتشي', 'product_inquiry', 'test');
      console.log(`📋 نتائج البحث: ${searchResult.length} عنصر`);
      
      searchResult.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.type}: ${item.metadata?.name || 'بدون اسم'}`);
      });
      
    } else {
      console.log('❌ RAG System لم يتم تهيئته');
    }
    
  } catch (error) {
    console.error('❌ خطأ في تهيئة RAG:');
    console.error('📋 تفاصيل الخطأ:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  }
}

testRAGInitialization();
