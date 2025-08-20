const axios = require('axios');

async function testNewAPI() {
  console.log('Testing new Gemini API endpoints...\n');
  
  try {
    // Test 1: Get all keys with models
    console.log('Test 1: Get all keys with models');
    const response1 = await axios.get('http://localhost:3001/api/v1/ai/gemini-keys');
    
    if (response1.data.success) {
      console.log('✅ API call successful');
      console.log(`Total keys: ${response1.data.summary.totalKeys}`);
      console.log(`Active keys: ${response1.data.summary.activeKeys}`);
      console.log(`Total models: ${response1.data.summary.totalModels}`);
      console.log(`Available models: ${response1.data.summary.availableModels}`);
      
      console.log('\nKeys details:');
      response1.data.data.forEach((key, index) => {
        console.log(`${index + 1}. ${key.name} (Priority: ${key.priority})`);
        console.log(`   API Key: ${key.apiKey}`);
        console.log(`   Active: ${key.isActive ? 'Yes' : 'No'}`);
        console.log(`   Models: ${key.totalModels} (Available: ${key.availableModels})`);
        
        if (key.models && key.models.length > 0) {
          key.models.forEach((model, idx) => {
            const percentage = ((model.usage.used || 0) / (model.usage.limit || 1)) * 100;
            console.log(`     ${idx + 1}. ${model.model} - ${model.usage.used}/${model.usage.limit} (${percentage.toFixed(1)}%)`);
          });
        }
        console.log('');
      });
    } else {
      console.log('❌ API call failed:', response1.data.error);
    }
    
    console.log('='.repeat(60));
    
    // Test 2: Test AI agent with new system
    console.log('\nTest 2: Test AI agent with new system');
    const response2 = await axios.post('http://localhost:3001/test-ai-direct', {
      conversationId: 'api-test-' + Date.now(),
      senderId: 'api-test-customer',
      content: 'مرحبا، عايز أطلب كوتشي',
      attachments: [],
      customerData: {
        id: 'api-test-customer-id',
        name: 'عميل اختبار API',
        phone: '01111111111',
        email: 'apitest@example.com',
        orderCount: 0
      }
    });

    if (response2.data.success) {
      console.log('✅ AI Agent test successful');
      console.log('Response:', response2.data.data.content.substring(0, 200) + '...');
      console.log('Model used:', response2.data.data.model || 'Not specified');
      console.log('Processing time:', response2.data.data.processingTime + 'ms');
    } else {
      console.log('❌ AI Agent test failed:', response2.data.error);
    }
    
    console.log('='.repeat(60));
    
    // Test 3: Test key switching simulation
    console.log('\nTest 3: Test key switching simulation');
    
    // Simulate multiple requests to test switching
    for (let i = 0; i < 3; i++) {
      console.log(`\nRequest ${i + 1}:`);
      
      const response3 = await axios.post('http://localhost:3001/test-ai-direct', {
        conversationId: 'switch-test-' + Date.now() + '-' + i,
        senderId: 'switch-test-customer-' + i,
        content: `اختبار رقم ${i + 1}`,
        attachments: [],
        customerData: {
          id: 'switch-test-customer-id-' + i,
          name: `عميل اختبار التبديل ${i + 1}`,
          phone: '01111111111',
          email: `switchtest${i}@example.com`,
          orderCount: 0
        }
      });

      if (response3.data.success) {
        console.log(`✅ Request ${i + 1} successful`);
        console.log('Model used:', response3.data.data.model || 'Not specified');
      } else {
        console.log(`❌ Request ${i + 1} failed:`, response3.data.error);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 All API tests completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run tests
testNewAPI();
