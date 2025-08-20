const axios = require('axios');

async function testPlansFixed() {
  try {
    console.log('🧪 Testing Fixed Plans Endpoint...\n');
    
    const response = await axios.get('http://localhost:3001/api/v1/companies/plans', {
      headers: { 'Authorization': 'Bearer mock-access-token' }
    });
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Data type:', typeof response.data.data);
    console.log('✅ Is array:', Array.isArray(response.data.data));
    
    if (Array.isArray(response.data.data)) {
      console.log('✅ Plans count:', response.data.data.length);
      console.log('\n📋 Available Plans:');
      response.data.data.forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.name} (${plan.id})`);
        console.log(`      Price: ${plan.price} ${plan.currency}`);
        console.log(`      Features: ${plan.features.join(', ')}`);
        console.log('');
      });
      
      console.log('🎉 Plans endpoint working correctly!');
    } else {
      console.log('❌ Data is not an array:', response.data.data);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testPlansFixed();
