const ragService = require('./src/services/ragService');

async function debugSearchAlgorithm() {
  console.log('🔍 Debugging Search Algorithm...\n');
  
  // انتظار تهيئة RAG
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log(`📚 Knowledge Base size: ${ragService.knowledgeBase.size}`);
  
  // 1. فحص محتوى المنتجات
  console.log('\n📦 Products Content Analysis:');
  let productIndex = 0;
  for (const [key, item] of ragService.knowledgeBase.entries()) {
    if (item.type === 'product') {
      productIndex++;
      console.log(`\n${productIndex}. Product Key: ${key}`);
      console.log(`   Name: ${item.metadata?.name}`);
      console.log(`   Content: ${item.content.substring(0, 200)}...`);
      console.log(`   Content length: ${item.content.length} chars`);
    }
  }
  
  // 2. اختبار calculateRelevanceScore مباشرة
  console.log('\n🎯 Testing calculateRelevanceScore:');
  
  const testCases = [
    { content: 'كوتشي اسكوتش عملي ومريح', terms: ['كوتشي'] },
    { content: 'كوتشي اسكوتش عملي ومريح', terms: ['اسكوتش'] },
    { content: 'كوتشي اسكوتش عملي ومريح', terms: ['كوتشي', 'اسكوتش'] },
    { content: 'المنتج: كوتشي أديداس ستان سميث', terms: ['أديداس'] },
    { content: 'المنتج: كوتشي نايك اير فورس 1 أبيض', terms: ['نايك'] }
  ];
  
  testCases.forEach((test, index) => {
    const score = ragService.calculateRelevanceScore(test.content, test.terms);
    console.log(`   Test ${index + 1}: "${test.content.substring(0, 30)}..." + [${test.terms.join(', ')}] = Score: ${score}`);
  });
  
  // 3. اختبار searchProducts مباشرة
  console.log('\n🔍 Testing searchProducts directly:');
  
  const searchQueries = ['كوتشي', 'اسكوتش', 'أديداس', 'نايك'];
  
  for (const query of searchQueries) {
    console.log(`\n   Query: "${query}"`);
    
    try {
      const results = await ragService.searchProducts(query);
      console.log(`   Results: ${results.length}`);
      
      results.forEach((result, index) => {
        console.log(`      ${index + 1}. ${result.metadata?.name} (Score: ${result.score})`);
      });
      
      if (results.length === 0) {
        // تشخيص المشكلة
        console.log('   🔍 Debugging why no results:');
        
        for (const [key, item] of ragService.knowledgeBase.entries()) {
          if (item.type === 'product') {
            const content = item.content.toLowerCase();
            const queryLower = query.toLowerCase();
            const contains = content.includes(queryLower);
            
            console.log(`      Product: ${item.metadata?.name}`);
            console.log(`         Contains "${queryLower}": ${contains}`);
            
            if (contains) {
              const searchTerms = query.toLowerCase().split(' ');
              const score = ragService.calculateRelevanceScore(content, searchTerms);
              console.log(`         Calculated score: ${score}`);
            }
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // 4. فحص نظام الصور
  console.log('\n📸 Image System Debug:');
  
  for (const [key, item] of ragService.knowledgeBase.entries()) {
    if (item.type === 'product') {
      console.log(`\n   Product: ${item.metadata?.name}`);
      console.log(`   Has images in metadata: ${!!item.metadata?.images}`);
      
      if (item.metadata?.images) {
        try {
          const images = Array.isArray(item.metadata.images) ? 
                        item.metadata.images : 
                        JSON.parse(item.metadata.images);
          
          console.log(`   Images count: ${images.length}`);
          images.forEach((img, index) => {
            console.log(`      ${index + 1}. ${img.substring(0, 50)}...`);
          });
        } catch (error) {
          console.log(`   ❌ Image parsing error: ${error.message}`);
        }
      }
    }
  }
  
  // 5. اختبار retrieveRelevantData
  console.log('\n🎯 Testing retrieveRelevantData:');
  
  const testRetrievals = [
    { query: 'كوتشي اسكوتش', intent: 'product_inquiry' },
    { query: 'أديداس', intent: 'product_inquiry' },
    { query: 'سعر', intent: 'price_inquiry' }
  ];
  
  for (const test of testRetrievals) {
    console.log(`\n   Query: "${test.query}" (Intent: ${test.intent})`);
    
    try {
      const results = await ragService.retrieveRelevantData(test.query, test.intent, 'test');
      console.log(`   Results: ${results.length}`);
      
      results.forEach((result, index) => {
        console.log(`      ${index + 1}. Type: ${result.type}, Score: ${result.score}`);
        console.log(`         Content: ${result.content.substring(0, 80)}...`);
      });
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

debugSearchAlgorithm().catch(console.error);
