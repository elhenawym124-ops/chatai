const axios = require('axios');

async function testColorFiltering() {
  console.log('🎨 Testing Color Filtering Improvements...\n');
  
  const colorTests = [
    {
      message: 'فين صورة الابيض',
      expected: 'Should find only white products'
    },
    {
      message: 'أريد أن أرى الكوتشي الأبيض',
      expected: 'Should find white shoes specifically'
    },
    {
      message: 'ورني صور أديداس الأبيض',
      expected: 'Should find white Adidas products'
    },
    {
      message: 'عايز أشوف نايك أبيض',
      expected: 'Should find white Nike products'
    }
  ];
  
  for (let i = 0; i < colorTests.length; i++) {
    const test = colorTests[i];
    console.log(`📝 Test ${i + 1}/4: "${test.message}"`);
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
  
  console.log('🔍 Check server logs for:');
  console.log('✅ "🎨 Filtered to X products for color: أبيض"');
  console.log('✅ Correct model usage (gemini-2.0-flash-exp)');
  console.log('✅ Only white/relevant products in images');
  console.log('❌ Should NOT see "📦 No specific filter found"');
}

testColorFiltering().catch(console.error);
