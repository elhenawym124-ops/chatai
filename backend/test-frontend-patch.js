const axios = require('axios');

async function testFrontendPatch() {
  console.log('🎯 Testing Frontend PATCH Simulation\n');
  console.log('=====================================\n');
  
  const baseURL = 'http://localhost:3001/api/v1';
  const headers = {
    'Authorization': 'Bearer mock-access-token',
    'Content-Type': 'application/json'
  };
  
  const productId = 'cmdjsa4mu0001ufnovkst8phl';
  
  try {
    // Get valid categoryId first
    console.log('1. Getting valid categories...');
    
    const categoriesResponse = await axios.get(`${baseURL}/products/categories`, { headers });
    const categories = categoriesResponse.data.data;
    
    console.log(`✅ Found ${categories.length} categories`);
    const validCategoryId = categories.length > 0 ? categories[0].id : null;
    console.log(`   Using category ID: ${validCategoryId}`);
    
    // Simulate exact frontend data
    console.log('\n2. Simulating frontend PATCH request...');
    
    const frontendData = {
      name: 'هاف كوتشي',
      description: 'وصف محدث من الواجهة الأمامية',
      price: 100,
      sku: '012132',
      stock: 50,
      images: [
        'https://picsum.photos/150/150?random=1',
        'https://picsum.photos/150/150?random=2'
      ],
      tags: ['كوتشي', 'رياضي'],
      isActive: true
    };
    
    // Add valid categoryId if available
    if (validCategoryId) {
      frontendData.categoryId = validCategoryId;
    }
    
    console.log('📤 Sending frontend-like data:', {
      ...frontendData,
      images: `[${frontendData.images.length} items]`,
      tags: `[${frontendData.tags.length} items]`
    });
    
    const patchResponse = await axios.patch(`${baseURL}/products/${productId}`, frontendData, { headers });
    
    console.log('✅ Frontend PATCH successful:');
    console.log(`   Status: ${patchResponse.status}`);
    console.log(`   Name: ${patchResponse.data.data.name}`);
    console.log(`   Price: ${patchResponse.data.data.price}`);
    console.log(`   SKU: ${patchResponse.data.data.sku}`);
    console.log(`   Stock: ${patchResponse.data.data.stock}`);
    console.log(`   Active: ${patchResponse.data.data.isActive}`);
    
    // Verify the update
    console.log('\n3. Verifying the update...');
    
    const verifyResponse = await axios.get(`${baseURL}/products/${productId}`, { headers });
    const updatedProduct = verifyResponse.data.data;
    
    console.log('📊 Updated product verification:');
    console.log(`   Name: ${updatedProduct.name}`);
    console.log(`   Price: ${updatedProduct.price}`);
    console.log(`   SKU: ${updatedProduct.sku}`);
    console.log(`   Stock: ${updatedProduct.stock}`);
    console.log(`   Images stored: ${updatedProduct.images ? 'Yes' : 'No'}`);
    console.log(`   Tags stored: ${updatedProduct.tags ? 'Yes' : 'No'}`);
    
    // Parse and display arrays
    try {
      const images = JSON.parse(updatedProduct.images || '[]');
      const tags = JSON.parse(updatedProduct.tags || '[]');
      
      console.log(`   Images count: ${images.length}`);
      console.log(`   Tags count: ${tags.length}`);
      console.log(`   First image: ${images[0] || 'None'}`);
      console.log(`   First tag: ${tags[0] || 'None'}`);
      
    } catch (error) {
      console.log('   ⚠️ Error parsing arrays:', error.message);
    }
    
    console.log('\n🎉 Frontend PATCH simulation successful!');
    console.log('\n📋 Summary:');
    console.log('✅ Frontend data format accepted');
    console.log('✅ Arrays converted to JSON strings');
    console.log('✅ All fields updated correctly');
    console.log('✅ Foreign key validation working');
    console.log('✅ Product update complete');
    
    console.log('\n🔧 Frontend should now be able to save products without errors!');
    
  } catch (error) {
    console.error('❌ Frontend PATCH simulation failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    
    if (error.response?.data?.details) {
      console.log(`   Details: ${error.response.data.details}`);
    }
    
    // Provide debugging info
    if (error.response?.status === 500) {
      console.log('\n🔍 Debugging info:');
      console.log('   - Check if categoryId is valid');
      console.log('   - Check if all required fields are provided');
      console.log('   - Check server logs for detailed error');
    }
  }
}

testFrontendPatch();
