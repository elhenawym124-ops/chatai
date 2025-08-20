const axios = require('axios');

async function testAILogging() {
  console.log('🧪 Testing AI Logging System...');
  
  try {
    // Test 1: AI Test endpoint
    console.log('\n1. Testing AI Test endpoint...');
    const testResponse = await axios.post('http://localhost:3001/api/v1/ai/test', {
      message: 'مرحباً، هذا اختبار للنظام الجديد'
    });
    console.log('✅ AI Test Response:', testResponse.data.success ? 'Success' : 'Failed');

    // Test 2: Generate Response endpoint
    console.log('\n2. Testing Generate Response endpoint...');
    try {
      const generateResponse = await axios.post('http://localhost:3001/api/v1/ai/generate-response', {
        messageText: 'كيف يمكنني مساعدتك؟',
        context: {
          customerId: 'test-customer',
          conversationId: 'test-conversation'
        }
      });
      console.log('✅ Generate Response:', generateResponse.data.success ? 'Success' : 'Failed');
    } catch (error) {
      console.log('⚠️ Generate Response failed (expected if no API key)');
    }

    // Test 3: Advanced Response endpoint
    console.log('\n3. Testing Advanced Response endpoint...');
    try {
      const advancedResponse = await axios.post('http://localhost:3001/api/v1/ai/generate-advanced-response', {
        message: 'أريد شراء منتج جديد',
        customerId: 'test-customer',
        includeProducts: false
      });
      console.log('✅ Advanced Response:', advancedResponse.data.success ? 'Success' : 'Failed');
    } catch (error) {
      console.log('⚠️ Advanced Response failed (expected if no API key)');
    }

    // Test 4: Get Statistics
    console.log('\n4. Getting AI Response Statistics...');
    const statsResponse = await axios.get('http://localhost:3001/api/v1/ai/response-stats');
    console.log('✅ Statistics retrieved:', statsResponse.data);

    // Test 5: Get Recent Logs
    console.log('\n5. Getting Recent Logs...');
    const logsResponse = await axios.get('http://localhost:3001/api/v1/ai/response-logs?limit=5');
    console.log('✅ Recent logs count:', logsResponse.data.data.length);
    
    if (logsResponse.data.data.length > 0) {
      console.log('📋 Sample log entry:');
      const sampleLog = logsResponse.data.data[0];
      console.log(`   System: ${sampleLog.systemUsed}`);
      console.log(`   Message: ${sampleLog.message.content?.substring(0, 50)}...`);
      console.log(`   Response: ${sampleLog.response.content?.substring(0, 50)}...`);
      console.log(`   Success: ${sampleLog.metadata.success}`);
    }

    console.log('\n🎉 AI Logging System Test Completed!');
    console.log('🌐 Visit http://localhost:3001/ai-dashboard to see the dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAILogging();
