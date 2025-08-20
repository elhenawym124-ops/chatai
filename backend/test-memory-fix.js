const axios = require('axios');

async function testMemoryFunctionality() {
  console.log('🧪 Testing AI Memory Functionality...\n');
  
  const baseURL = 'http://localhost:3001';
  const testCustomerId = 'test-customer-memory';
  const testConversationId = 'test-conv-memory';
  
  try {
    // Test 1: Send first message
    console.log('📤 Test 1: Sending first message...');
    const firstResponse = await axios.post(`${baseURL}/webhook`, {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: testCustomerId },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: { text: 'مرحبا، اسمي أحمد وأريد معرفة معلومات عن المنتجات' }
        }]
      }]
    });
    
    console.log('✅ First message sent successfully\n');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Send second message (should remember the name)
    console.log('📤 Test 2: Sending second message...');
    const secondResponse = await axios.post(`${baseURL}/webhook`, {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: testCustomerId },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: { text: 'ما هي أسعار المنتجات المتاحة؟' }
        }]
      }]
    });
    
    console.log('✅ Second message sent successfully\n');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Send third message (should remember previous context)
    console.log('📤 Test 3: Sending third message...');
    const thirdResponse = await axios.post(`${baseURL}/webhook`, {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: testCustomerId },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: { text: 'شكراً لك، هل تتذكر اسمي؟' }
        }]
      }]
    });
    
    console.log('✅ Third message sent successfully\n');
    
    // Test 4: Check memory stats
    console.log('📊 Test 4: Checking memory statistics...');
    const memoryStats = await axios.get(`${baseURL}/api/v1/ai/memory/stats`);
    console.log('Memory Stats:', memoryStats.data);
    
    console.log('\n🎉 All tests completed! Check the server logs to see if memory is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testMemoryFunctionality();
