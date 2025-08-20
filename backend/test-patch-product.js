const axios = require('axios');

async function testPatchProduct() {
  console.log('🔧 Testing PATCH Product Endpoint\n');
  console.log('==================================\n');
  
  const baseURL = 'http://localhost:3001/api/v1';
  const headers = {
    'Authorization': 'Bearer mock-access-token',
    'Content-Type': 'application/json'
  };
  
  const productId = 'cmdjsa4mu0001ufnovkst8phl';
  
  try {
    // First, get the current product to see its structure
    console.log('1. Getting current product data...');
    const getResponse = await axios.get(`${baseURL}/products/${productId}`, { headers });
    
    console.log('✅ Current product:');
    console.log(`   ID: ${getResponse.data.data.id}`);
    console.log(`   Name: ${getResponse.data.data.name}`);
    console.log(`   Price: ${getResponse.data.data.price}`);
    console.log(`   SKU: ${getResponse.data.data.sku}`);
    console.log(`   Stock: ${getResponse.data.data.stock}`);
    
    // Test simple update
    console.log('\n2. Testing simple PATCH update...');
    
    const updateData = {
      name: 'هاف كوتشي محدث',
      description: 'وصف محدث للمنتج',
      price: 120,
      stock: 45
    };
    
    console.log('📤 Sending update data:', updateData);
    
    const patchResponse = await axios.patch(`${baseURL}/products/${productId}`, updateData, { headers });
    
    console.log('✅ PATCH successful:');
    console.log(`   Status: ${patchResponse.status}`);
    console.log(`   Updated name: ${patchResponse.data.data.name}`);
    console.log(`   Updated price: ${patchResponse.data.data.price}`);
    console.log(`   Updated stock: ${patchResponse.data.data.stock}`);
    
    // Test with complex data (like what frontend sends)
    console.log('\n3. Testing complex PATCH update...');
    
    const complexUpdateData = {
      name: 'هاف كوتشي',
      description: '',
      price: 100,
      sku: '012132',
      stock: 50,
      categoryId: 'cmd5c0c9y0001ymzdd7wtv7ib',
      images: [
        'https://picsum.photos/150/150?random=1',
        'https://picsum.photos/150/150?random=2'
      ],
      tags: ['كوتشي', 'رياضي'],
      isActive: true
    };
    
    console.log('📤 Sending complex update data...');
    
    const complexPatchResponse = await axios.patch(`${baseURL}/products/${productId}`, complexUpdateData, { headers });
    
    console.log('✅ Complex PATCH successful:');
    console.log(`   Status: ${complexPatchResponse.status}`);
    console.log(`   Name: ${complexPatchResponse.data.data.name}`);
    console.log(`   SKU: ${complexPatchResponse.data.data.sku}`);
    console.log(`   Images: ${complexPatchResponse.data.data.images ? 'Updated' : 'Not updated'}`);
    
    console.log('\n🎉 PATCH endpoint is working correctly!');
    
  } catch (error) {
    console.error('❌ PATCH test failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    console.log(`   Details: ${error.response?.data?.details || 'No details'}`);
    
    if (error.response?.data) {
      console.log('   Full response:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Check if it's a Prisma error
    if (error.message.includes('Prisma') || error.message.includes('database')) {
      console.log('\n🔍 Possible Prisma/Database issue:');
      console.log('   - Check if product ID exists');
      console.log('   - Check if required fields are provided');
      console.log('   - Check if foreign key constraints are satisfied');
    }
  }
}

testPatchProduct();
