async function testPageLoad() {
  console.log('🔍 Testing Product Edit Page Load...\n');
  
  const productId = 'cmde4snz7003puf4swmfv9qa1';
  
  try {
    // Test API endpoint that the frontend calls
    console.log('📡 Testing API endpoint...');
    
    const response = await fetch(`http://localhost:3001/api/v1/products/${productId}`, {
      headers: {
        'Authorization': 'Bearer mock-access-token'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API endpoint working');
      console.log(`📦 Product: ${data.data.name}`);
      console.log(`💰 Price: ${data.data.price} جنيه`);
      console.log(`📊 Stock: ${data.data.stock}`);
      console.log(`🖼️ Images type: ${typeof data.data.images}`);
      console.log(`🖼️ Images value:`, data.data.images);
      
      if (data.data.images) {
        if (typeof data.data.images === 'string') {
          if (data.data.images.startsWith('[')) {
            try {
              const parsed = JSON.parse(data.data.images);
              console.log(`📋 Parsed images (${parsed.length}):`, parsed);
            } catch (e) {
              console.log('❌ Failed to parse JSON images');
            }
          } else {
            const split = data.data.images.split(',');
            console.log(`📋 Split images (${split.length}):`, split);
          }
        } else if (Array.isArray(data.data.images)) {
          console.log(`📋 Array images (${data.data.images.length}):`, data.data.images);
        }
      }
      
      console.log(`🎨 Variants: ${data.data.variants ? data.data.variants.length : 0}`);
      
      if (data.data.variants && data.data.variants.length > 0) {
        console.log('📋 Variants:');
        data.data.variants.forEach((variant, index) => {
          console.log(`   ${index + 1}. ${variant.name} (${variant.type}) - Stock: ${variant.stock}`);
        });
      }
      
    } else {
      console.log('❌ API endpoint failed:', data.error);
    }
    
    // Test categories endpoint
    console.log('\n📂 Testing categories endpoint...');
    
    const categoriesResponse = await fetch('http://localhost:3001/api/v1/products/categories', {
      headers: {
        'Authorization': 'Bearer mock-access-token'
      }
    });
    
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success) {
      console.log(`✅ Categories loaded: ${categoriesData.data.length} categories`);
    } else {
      console.log('❌ Categories failed:', categoriesData.error);
    }
    
    console.log('\n🎯 Frontend should now load without errors!');
    console.log(`🔗 Edit page: http://localhost:3000/products/${productId}/edit`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPageLoad();
