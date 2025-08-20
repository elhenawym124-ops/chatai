const axios = require('axios');

async function testSpecificProductImages() {
  console.log('🧪 Testing Specific Product Image Sending...\n');
  
  const testCases = [
    {
      message: 'عايز أشوف الكوتشي الاسكوتش',
      expected: 'Should send images specifically for كوتشي اسكوتش'
    },
    {
      message: 'ورني صور كوتشي نايك',
      expected: 'Should send images specifically for Nike shoes'
    },
    {
      message: 'أريد أن أرى صور أديداس',
      expected: 'Should send images specifically for Adidas shoes'
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`📝 Test ${i + 1}/3: "${test.message}"`);
    console.log(`   Expected: ${test.expected}`);
    
    const testData = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: '7801113803290451' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: { text: test.message }
        }]
      }]
    };
    
    try {
      await axios.post('http://localhost:3001/webhook', testData);
      console.log('✅ Sent successfully');
      
      // انتظار بين الاختبارات
      console.log('⏳ Waiting for response...');
      await new Promise(resolve => setTimeout(resolve, 12000));
      
    } catch (error) {
      console.error('❌ Failed:', error.message);
    }
    
    console.log('');
  }
  
  console.log('🔍 Check server logs for specific product matching');
  console.log('');
  console.log('📊 What should happen now:');
  console.log('1. RAG searches for specific product');
  console.log('2. If RAG finds 0 items, direct database search kicks in');
  console.log('3. Direct search finds matching products by name');
  console.log('4. Sends images for the SPECIFIC requested product');
  console.log('5. No more generic/wrong images');
  console.log('');
  console.log('🎯 Expected logs:');
  console.log('✅ "🔍 RAG found no images, searching directly in database..."');
  console.log('✅ "🔍 Direct search found X products for: [message]"');
  console.log('✅ "📸 Added direct image for product: [specific product name]"');
}

testSpecificProductImages().catch(console.error);
