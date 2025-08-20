const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');

async function testIntentAndRAG() {
  try {
    console.log('🧪 اختبار Intent و RAG...\n');
    
    const query = 'عايز اعرف المنتجات المتوفره';
    
    // 1. اختبار Intent
    console.log('1️⃣ اختبار Intent:');
    console.log('='.repeat(50));
    const intent = aiAgentService.analyzeIntent(query);
    console.log('الاستعلام:', query);
    console.log('Intent المكتشف:', intent);
    
    // 2. اختبار RAG مع Intent
    console.log('\n2️⃣ اختبار RAG مع Intent:');
    console.log('='.repeat(50));
    
    await ragService.ensureInitialized();
    
    const ragResults = await ragService.retrieveRelevantData(query, intent);
    console.log('عدد النتائج:', ragResults.length);
    
    ragResults.forEach((item, index) => {
      console.log(`\nالنتيجة ${index + 1}:`);
      console.log('النوع:', item.type);
      console.log('المحتوى:', item.content);
      console.log('النقاط:', item.score);
    });
    
    // 3. اختبار RAG مع product_inquiry مباشرة
    console.log('\n3️⃣ اختبار RAG مع product_inquiry مباشرة:');
    console.log('='.repeat(50));
    
    const productResults = await ragService.retrieveRelevantData(query, 'product_inquiry');
    console.log('عدد النتائج:', productResults.length);
    
    productResults.forEach((item, index) => {
      console.log(`\nالنتيجة ${index + 1}:`);
      console.log('النوع:', item.type);
      console.log('المحتوى:', item.content);
      console.log('النقاط:', item.score);
    });
    
    // 4. فحص knowledge base مباشرة
    console.log('\n4️⃣ فحص knowledge base مباشرة:');
    console.log('='.repeat(50));
    
    if (ragService.knowledgeBase) {
      console.log('عدد العناصر في knowledge base:', ragService.knowledgeBase.size);
      
      let productCount = 0;
      for (const [key, item] of ragService.knowledgeBase.entries()) {
        if (item.type === 'product') {
          productCount++;
          console.log(`منتج ${productCount}: ${item.content}`);
        }
      }
      
      if (productCount === 0) {
        console.log('❌ لا توجد منتجات في knowledge base!');
      }
    } else {
      console.log('❌ knowledge base غير مهيأ!');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error('التفاصيل:', error.stack);
  }
}

testIntentAndRAG();
