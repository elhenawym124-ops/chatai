const ragService = require('./src/services/ragService');

async function testRAGPerformance() {
  console.log('🔍 Testing RAG Performance...\n');
  
  const testQueries = [
    { query: 'كوتشي اسكوتش', intent: 'product_inquiry', expected: 'Should find اسكوتش product' },
    { query: 'سعر أديداس', intent: 'price_inquiry', expected: 'Should find أديداس with price' },
    { query: 'ألوان متوفرة', intent: 'product_inquiry', expected: 'Should find color information' },
    { query: 'كوتشي نايك أبيض', intent: 'product_inquiry', expected: 'Should find Nike white shoes' },
    { query: 'أحذية نسائية', intent: 'product_inquiry', expected: 'Should find women shoes' },
    { query: 'شحن توصيل', intent: 'shipping_info', expected: 'Should find shipping FAQs' },
    { query: 'منتجات متوفرة', intent: 'product_inquiry', expected: 'Should find all products' },
    { query: 'كم سعر الأبيض', intent: 'price_inquiry', expected: 'Should find white color prices' },
    { query: 'مقاسات', intent: 'product_inquiry', expected: 'Should find size information' },
    { query: 'بوما', intent: 'product_inquiry', expected: 'Should find Puma products' }
  ];
  
  let totalQueries = 0;
  let successfulQueries = 0;
  let weakResults = [];
  
  for (const test of testQueries) {
    totalQueries++;
    console.log(`📝 Query: "${test.query}" (Intent: ${test.intent})`);
    console.log(`   Expected: ${test.expected}`);
    
    try {
      const results = await ragService.retrieveRelevantData(test.query, test.intent, 'test-customer');
      
      console.log(`   ✅ Found ${results.length} results`);
      
      if (results.length > 0) {
        successfulQueries++;
        results.forEach((result, index) => {
          console.log(`      ${index + 1}. Type: ${result.type}, Score: ${result.score?.toFixed(2) || 'N/A'}`);
          console.log(`         Content: ${result.content.substring(0, 80)}...`);
        });
        
        // تحليل جودة النتائج
        const avgScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length;
        if (avgScore < 2) {
          weakResults.push({ query: test.query, avgScore, resultCount: results.length });
        }
      } else {
        console.log(`   ❌ No results found`);
        weakResults.push({ query: test.query, avgScore: 0, resultCount: 0 });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('📊 RAG Performance Analysis:');
  console.log(`✅ Success Rate: ${successfulQueries}/${totalQueries} (${(successfulQueries/totalQueries*100).toFixed(1)}%)`);
  
  if (weakResults.length > 0) {
    console.log('\n⚠️ Weak Results (Need Improvement):');
    weakResults.forEach(weak => {
      console.log(`   - "${weak.query}": ${weak.resultCount} results, avg score: ${weak.avgScore.toFixed(2)}`);
    });
  }
  
  console.log('\n🔍 Areas for Improvement:');
  console.log('1. Synonym handling (نايك = Nike, أديداس = Adidas)');
  console.log('2. Arabic text normalization');
  console.log('3. Semantic search vs keyword matching');
  console.log('4. Context understanding');
  console.log('5. Fuzzy matching for typos');
  
  return {
    successRate: successfulQueries / totalQueries,
    weakResults,
    needsImprovement: successfulQueries < totalQueries * 0.8 || weakResults.length > 3
  };
}

testRAGPerformance()
  .then(results => {
    console.log('\n🎯 Final Assessment:');
    if (results.needsImprovement) {
      console.log('❌ RAG needs significant improvements');
    } else {
      console.log('✅ RAG performance is acceptable');
    }
  })
  .catch(console.error);
