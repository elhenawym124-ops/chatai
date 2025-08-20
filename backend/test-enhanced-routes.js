const axios = require('axios');

async function testEnhancedRoutes() {
  console.log('📸 Testing Enhanced Routes...\n');
  
  const headers = {
    'Authorization': 'Bearer mock-access-token',
    'Content-Type': 'application/json'
  };
  
  try {
    // Test enhanced products route
    console.log('1. Testing enhanced products route...');
    const productsResponse = await axios.get('http://localhost:3001/api/v1/products-enhanced', { headers });
    console.log('✅ Enhanced products route works');
    console.log(`   Products found: ${productsResponse.data.data.length}`);
    
    if (productsResponse.data.data.length > 0) {
      const firstProduct = productsResponse.data.data[0];
      console.log(`   Using product: ${firstProduct.name} (ID: ${firstProduct.id})`);
      
      // Test image upload to product
      console.log('\n2. Testing image upload to product...');
      const imageUrl = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop';
      
      const imageResponse = await axios.post(`http://localhost:3001/api/v1/products-enhanced/${firstProduct.id}/images`, {
        imageUrl: imageUrl,
        description: 'Test image from enhanced route'
      }, { headers });
      
      console.log('✅ Image upload successful!');
      console.log(`   Product ID: ${imageResponse.data.data.productId}`);
      console.log(`   Image URL: ${imageResponse.data.data.imageUrl}`);
      console.log(`   Total images: ${imageResponse.data.data.totalImages}`);
      
      // Test variant image upload if variants exist
      if (firstProduct.variants && firstProduct.variants.length > 0) {
        console.log('\n3. Testing variant image upload...');
        const firstVariant = firstProduct.variants[0];
        console.log(`   Using variant: ${firstVariant.name} (ID: ${firstVariant.id})`);
        
        const variantImageUrl = 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop';
        
        const variantImageResponse = await axios.post(`http://localhost:3001/api/v1/products-enhanced/${firstProduct.id}/variants/${firstVariant.id}/images`, {
          imageUrl: variantImageUrl,
          description: 'Test variant image'
        }, { headers });
        
        console.log('✅ Variant image upload successful!');
        console.log(`   Variant ID: ${variantImageResponse.data.data.variantId}`);
        console.log(`   Image URL: ${variantImageResponse.data.data.imageUrl}`);
        console.log(`   Total images: ${variantImageResponse.data.data.totalImages}`);
      } else {
        console.log('\n3. No variants found for image testing');
      }
      
    } else {
      console.log('❌ No products found to test image upload');
    }
    
    console.log('\n🎉 Enhanced routes testing completed!');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data?.error || error.message);
    console.log('   Status:', error.response?.status);
    console.log('   Details:', error.response?.data?.details);
    
    if (error.response?.data) {
      console.log('   Full response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testEnhancedRoutes();
