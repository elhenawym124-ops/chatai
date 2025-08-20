const axios = require('axios');

async function testMemoryAPI() {
  console.log('🧪 Testing Memory API...\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test memory stats API
    console.log('📊 Testing memory stats API...');
    const statsResponse = await axios.get(`${baseURL}/api/v1/ai/memory/stats`);
    console.log('Memory Stats Response:', JSON.stringify(statsResponse.data, null, 2));
    
    // Test memory settings API
    console.log('\n⚙️ Testing memory settings API...');
    const settingsResponse = await axios.get(`${baseURL}/api/v1/ai/memory/settings`);
    console.log('Memory Settings Response:', JSON.stringify(settingsResponse.data, null, 2));
    
    console.log('\n✅ All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testMemoryAPI();
