const axios = require('axios');

async function testProductResponses() {
  console.log('🧪 Testing Product Response Behavior...\n');
  
  const testQuestions = [
    {
      question: 'ايه المنتجات المتوفرة عندكم؟',
      expected: 'Should list all available products with details'
    },
    {
      question: 'عندكم ايه من الكوتشيات؟',
      expected: 'Should show shoe products specifically'
    },
    {
      question: 'اعرض عليا المنتجات',
      expected: 'Should display products with images'
    },
    {
      question: 'ايه اللي متوفر؟',
      expected: 'Should show available inventory'
    }
  ];
  
  for (let i = 0; i < testQuestions.length; i++) {
    const test = testQuestions[i];
    console.log(`📝 Test ${i + 1}/4: "${test.question}"`);
    console.log(`   Expected: ${test.expected}`);
    
    const testData = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: '7801113803290451' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: { text: test.question }
        }]
      }]
    };
    
    try {
      await axios.post('http://localhost:3001/webhook', testData);
      console.log('✅ Sent successfully');
      
      // انتظار بين الأسئلة
      console.log('⏳ Waiting for response...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
    } catch (error) {
      console.error('❌ Failed:', error.message);
    }
    
    console.log('');
  }
  
  console.log('🔍 Check server logs for detailed responses');
  console.log('');
  console.log('📊 What should happen:');
  console.log('1. AI should detect product_inquiry intent');
  console.log('2. RAG should find relevant products');
  console.log('3. Response should include:');
  console.log('   - Product names');
  console.log('   - Prices');
  console.log('   - Descriptions');
  console.log('   - Stock status');
  console.log('4. Images should be sent after text');
}

testProductResponses().catch(console.error);
