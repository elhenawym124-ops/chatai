const axios = require('axios');

async function testColorQuestions() {
  console.log('🎨 Testing Color Questions...\n');
  
  const testCases = [
    {
      message: 'عايز اعرف الالوان المتوفرة للكوتشي الاسكوتش',
      expected: 'Should list colors: أبيض (320ج), بيج (310ج), أسود (310ج)'
    },
    {
      message: 'ايه الألوان المتوفرة؟',
      expected: 'Should list all product colors'
    },
    {
      message: 'كم سعر اللون الأبيض للاسكوتش؟',
      expected: 'Should say 320 جنيه'
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
  
  console.log('🔍 Check server logs for improved color responses');
  console.log('');
  console.log('📊 What should happen now:');
  console.log('✅ RAG should find color information in product descriptions');
  console.log('✅ AI should provide specific color details and prices');
  console.log('❌ Should NOT say "لا تتوفر لدي معلومات"');
  console.log('❌ Should NOT transfer to human agent for color questions');
  console.log('');
  console.log('🎯 Expected responses:');
  console.log('- "كوتشي اسكوتش متوفر بثلاثة ألوان..."');
  console.log('- "الأبيض بسعر 320 جنيه..."');
  console.log('- "البيج والأسود بسعر 310 جنيه..."');
}

testColorQuestions().catch(console.error);
