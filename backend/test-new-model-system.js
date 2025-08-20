const axios = require('axios');

async function testNewModelSystem() {
  console.log('🚀 Testing New Model Rotation System...\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test 1: رسالة بسيطة لاختبار النموذج الجديد
    console.log('🧪 Test 1: Simple message with new model...');
    
    const simpleTest = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: '7801113803290451' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: {
            text: 'مرحبا، هل النظام يعمل مع النموذج الجديد؟'
          }
        }]
      }]
    };
    
    const response1 = await axios.post(`${baseURL}/webhook`, simpleTest);
    console.log('✅ Simple test sent successfully');
    
    // انتظار المعالجة
    console.log('⏳ Waiting for AI response...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Test 2: طلب منتجات مع صور
    console.log('\n📸 Test 2: Product request with images...');
    
    const productTest = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: '7801113803290451' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: {
            text: 'أريد أن أرى صور الأحذية الرياضية المتاحة'
          }
        }]
      }]
    };
    
    const response2 = await axios.post(`${baseURL}/webhook`, productTest);
    console.log('✅ Product with images test sent successfully');
    
    // انتظار المعالجة والصور
    console.log('⏳ Waiting for product response and images...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Test 3: اختبار متعدد للتأكد من الاستقرار
    console.log('\n🔄 Test 3: Multiple requests to test stability...');
    
    for (let i = 1; i <= 3; i++) {
      const multiTest = {
        object: 'page',
        entry: [{
          messaging: [{
            sender: { id: '7801113803290451' },
            recipient: { id: 'page_id' },
            timestamp: Date.now(),
            message: {
              text: `اختبار رقم ${i} - هل النظام مستقر؟`
            }
          }]
        }]
      };
      
      await axios.post(`${baseURL}/webhook`, multiTest);
      console.log(`✅ Multi-test ${i}/3 sent`);
      
      // تأخير بين الطلبات
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('\n⏳ Waiting for all responses...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('🔍 Check server logs for detailed results');
    console.log('');
    console.log('📊 Expected Results:');
    console.log('✅ No quota exceeded errors');
    console.log('✅ Fast AI responses with gemini-2.0-flash-exp');
    console.log('✅ Product images sent successfully');
    console.log('✅ System stability across multiple requests');
    console.log('✅ Automatic model switching if needed');
    console.log('');
    console.log('🔧 Current Configuration:');
    console.log('   • Primary Model: gemini-2.0-flash-exp');
    console.log('   • Quota: 10,000 requests/day');
    console.log('   • Fallback Models: gemini-1.5-flash, gemini-pro, gemini-1.5-pro');
    console.log('   • Auto-switching: Enabled');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testNewModelSystem();
