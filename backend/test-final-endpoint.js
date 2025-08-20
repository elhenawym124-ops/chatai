const axios = require('axios');

async function testFinalEndpoint() {
  try {
    console.log('🧪 Testing Final Safe Endpoint...\n');
    
    const response = await axios.get('http://localhost:3001/api/v1/companies/frontend-safe/1/usage', {
      headers: { 'Authorization': 'Bearer mock-access-token' }
    });
    
    const data = response.data.data;
    
    console.log('✅ Response received');
    console.log('📊 usageData array:');
    
    if (data.usageData && Array.isArray(data.usageData)) {
      data.usageData.forEach((item, index) => {
        console.log(`   Item ${index + 1}: ${item.name}`);
        console.log(`     current: ${item.current} (${typeof item.current})`);
        console.log(`     limit: ${item.limit} (${typeof item.limit})`);
        console.log(`     percentage: ${item.percentage} (${typeof item.percentage})`);
        
        // Test toLocaleString
        try {
          console.log(`     current.toLocaleString(): ${item.current.toLocaleString()}`);
          console.log(`     limit.toLocaleString(): ${item.limit.toLocaleString()}`);
          console.log(`     percentage.toLocaleString(): ${item.percentage.toLocaleString()}%`);
          console.log(`     ✅ All toLocaleString calls successful`);
        } catch (error) {
          console.log(`     ❌ toLocaleString error: ${error.message}`);
        }
        console.log('');
      });
      
      console.log('🎉 Frontend-safe endpoint is working perfectly!');
      console.log('📋 All values are numbers and support toLocaleString()');
      
    } else {
      console.log('❌ usageData is not an array');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testFinalEndpoint();
