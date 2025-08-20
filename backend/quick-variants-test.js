const axios = require('axios');

async function quickVariantsTest() {
  try {
    console.log('🧪 Quick Variants Test');
    
    const response = await axios.get('http://localhost:3001/api/v1/products-enhanced/cmdjsa4mu0001ufnovkst8phl/variants', {
      headers: { 'Authorization': 'Bearer mock-access-token' }
    });
    
    console.log('✅ GET variants successful');
    console.log('   Count:', response.data.data.length);
    
    if (response.data.data.length > 0) {
      const v = response.data.data[0];
      console.log('   Sample variant:');
      console.log('     Name:', v.name);
      console.log('     Type:', v.type);
      console.log('     Price:', v.price);
      console.log('     Stock:', v.stock);
      console.log('     SKU:', v.sku || 'Not set');
      console.log('     Images:', v.images || 'Not set');
    }
    
    console.log('🎉 Variants endpoints working!');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data?.error || error.message);
  }
}

quickVariantsTest();
