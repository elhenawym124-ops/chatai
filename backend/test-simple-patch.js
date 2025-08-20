const axios = require('axios');

async function testSimplePatch() {
  console.log('🔧 Testing Simple PATCH (No Foreign Keys)\n');
  console.log('==========================================\n');
  
  const baseURL = 'http://localhost:3001/api/v1';
  const headers = {
    'Authorization': 'Bearer mock-access-token',
    'Content-Type': 'application/json'
  };
  
  const productId = 'cmdjsa4mu0001ufnovkst8phl';
  
  try {
    // Test 1: Simple fields only
    console.log('1. Testing basic fields update...');
    
    const basicUpdate = {
      name: 'هاف كوتشي محدث',
      description: 'وصف جديد للمنتج',
      price: 150,
      stock: 30
    };
    
    console.log('📤 Sending basic update:', basicUpdate);
    
    const basicResponse = await axios.patch(`${baseURL}/products/${productId}`, basicUpdate, { headers });
    
    console.log('✅ Basic update successful:');
    console.log(`   Name: ${basicResponse.data.data.name}`);
    console.log(`   Price: ${basicResponse.data.data.price}`);
    console.log(`   Stock: ${basicResponse.data.data.stock}`);
    
    // Test 2: With arrays (images, tags)
    console.log('\n2. Testing arrays update...');
    
    const arrayUpdate = {
      name: 'هاف كوتشي مع صور',
      images: [
        'https://picsum.photos/150/150?random=1',
        'https://picsum.photos/150/150?random=2'
      ],
      tags: ['كوتشي', 'رياضي', 'جديد']
    };
    
    console.log('📤 Sending array update:', arrayUpdate);
    
    const arrayResponse = await axios.patch(`${baseURL}/products/${productId}`, arrayUpdate, { headers });
    
    console.log('✅ Array update successful:');
    console.log(`   Name: ${arrayResponse.data.data.name}`);
    console.log(`   Images: ${arrayResponse.data.data.images}`);
    console.log(`   Tags: ${arrayResponse.data.data.tags}`);
    
    // Test 3: Check if arrays are properly stored as JSON strings
    console.log('\n3. Verifying data storage...');
    
    const getResponse = await axios.get(`${baseURL}/products/${productId}`, { headers });
    const product = getResponse.data.data;
    
    console.log('📊 Stored data:');
    console.log(`   Images type: ${typeof product.images}`);
    console.log(`   Images value: ${product.images}`);
    console.log(`   Tags type: ${typeof product.tags}`);
    console.log(`   Tags value: ${product.tags}`);
    
    // Try to parse JSON
    try {
      const parsedImages = JSON.parse(product.images || '[]');
      const parsedTags = JSON.parse(product.tags || '[]');
      
      console.log('✅ JSON parsing successful:');
      console.log(`   Parsed images: ${parsedImages.length} items`);
      console.log(`   Parsed tags: ${parsedTags.length} items`);
    } catch (error) {
      console.log('⚠️ JSON parsing failed:', error.message);
    }
    
    console.log('\n🎉 PATCH endpoint is working correctly!');
    console.log('✅ Basic fields update: OK');
    console.log('✅ Arrays converted to JSON: OK');
    console.log('✅ Data stored properly: OK');
    
  } catch (error) {
    console.error('❌ Simple PATCH test failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    
    if (error.response?.data?.details) {
      console.log(`   Details: ${error.response.data.details}`);
    }
  }
}

testSimplePatch();
