const axios = require('axios');

async function testFixedModel() {
  console.log('🧪 Testing Fixed Gemini Model...\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test 1: رسالة بسيطة للتأكد من عمل النموذج
    console.log('📝 Test 1: Simple message to test model...');
    
    const simpleTestData = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: '7801113803290451' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: {
            text: 'مرحبا، هل النظام يعمل الآن؟'
          }
        }]
      }]
    };
    
    const response1 = await axios.post(`${baseURL}/webhook`, simpleTestData);
    console.log('✅ Simple test sent successfully');
    
    // انتظار المعالجة
    console.log('⏳ Waiting for AI response...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Test 2: طلب منتجات لاختبار RAG
    console.log('\n🛍️ Test 2: Product inquiry to test RAG...');
    
    const productTestData = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: '7801113803290451' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: {
            text: 'عندكم أحذية رياضية؟'
          }
        }]
      }]
    };
    
    const response2 = await axios.post(`${baseURL}/webhook`, productTestData);
    console.log('✅ Product inquiry sent successfully');
    
    // انتظار المعالجة
    console.log('⏳ Waiting for product response...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Test 3: طلب صور لاختبار إرسال الصور
    console.log('\n📸 Test 3: Image request to test image sending...');
    
    const imageTestData = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: '7801113803290451' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: {
            text: 'أريد أن أرى صور الأحذية'
          }
        }]
      }]
    };
    
    const response3 = await axios.post(`${baseURL}/webhook`, imageTestData);
    console.log('✅ Image request sent successfully');
    
    // انتظار المعالجة
    console.log('⏳ Waiting for images...');
    await new Promise(resolve => setTimeout(resolve, 12000));
    
    console.log('\n🎉 All tests completed!');
    console.log('🔍 Check server logs for detailed results');
    console.log('');
    console.log('📊 Expected Results:');
    console.log('✅ No more quota exceeded errors');
    console.log('✅ AI responses working normally');
    console.log('✅ Product information from RAG');
    console.log('✅ Images sent successfully');
    console.log('');
    console.log('🔧 Model Details:');
    console.log('   • Model: gemini-1.5-flash');
    console.log('   • Quota: 1,500 requests/day (vs 50 before)');
    console.log('   • Rate: 15 requests/minute');
    console.log('   • Vision: Enabled');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFixedModel();
