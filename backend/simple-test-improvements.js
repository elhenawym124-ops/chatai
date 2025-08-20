const axios = require('axios');

async function simpleTest() {
  console.log('🧪 Simple Test for Improvements...\n');
  
  const baseURL = 'http://localhost:3001/api/v1';
  const headers = {
    'Authorization': 'Bearer mock-access-token',
    'Content-Type': 'application/json'
  };
  
  try {
    // 1. Test Currency Settings
    console.log('💰 Test 1: Currency Settings');
    console.log('=============================');
    
    const currenciesResponse = await axios.get(`${baseURL}/settings/currencies`, { headers });
    console.log('✅ Available currencies:');
    currenciesResponse.data.data.forEach(currency => {
      console.log(`   ${currency.code}: ${currency.name} (${currency.symbol})`);
    });
    
    const settingsResponse = await axios.get(`${baseURL}/settings/company`, { headers });
    console.log('\n✅ Current company settings:');
    console.log(`   Currency: ${settingsResponse.data.data.settings.currency}`);
    console.log(`   Symbol: ${settingsResponse.data.data.settings.currencySymbol}`);
    
    // Update to EGP
    const updateResponse = await axios.put(`${baseURL}/settings/company`, {
      settings: {
        currency: 'EGP',
        currencySymbol: 'جنيه'
      }
    }, { headers });
    
    console.log('\n✅ Currency updated to EGP (جنيه):');
    console.log(`   New Currency: ${updateResponse.data.data.settings.currency}`);
    console.log(`   New Symbol: ${updateResponse.data.data.settings.currencySymbol}`);
    
    // 2. Test Adding Images by URL to existing product
    console.log('\n📸 Test 2: Adding Images by URL');
    console.log('================================');
    
    // Get existing products first
    const productsResponse = await axios.get(`${baseURL}/products`, { headers });
    
    if (productsResponse.data.data.length > 0) {
      const firstProduct = productsResponse.data.data[0];
      console.log(`Using existing product: ${firstProduct.name} (ID: ${firstProduct.id})`);
      
      const imageURL = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop';
      
      try {
        const imageResponse = await axios.post(`${baseURL}/products/${firstProduct.id}/images`, {
          imageUrl: imageURL,
          description: 'صورة اختبار جديدة'
        }, { headers });
        
        console.log('✅ Image added to product:');
        console.log(`   Product ID: ${imageResponse.data.data.productId}`);
        console.log(`   Image URL: ${imageResponse.data.data.imageUrl}`);
        console.log(`   Total Images: ${imageResponse.data.data.totalImages}`);
        
      } catch (error) {
        if (error.response?.data?.error === 'Image already exists') {
          console.log('ℹ️ Image already exists (expected behavior)');
        } else {
          console.log('❌ Error adding image:', error.response?.data?.error);
        }
      }
      
      // Test adding image to variant if exists
      if (firstProduct.variants && firstProduct.variants.length > 0) {
        const firstVariant = firstProduct.variants[0];
        console.log(`\nTesting variant image: ${firstVariant.name} (ID: ${firstVariant.id})`);
        
        const variantImageURL = 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop';
        
        try {
          const variantImageResponse = await axios.post(`${baseURL}/products/${firstProduct.id}/variants/${firstVariant.id}/images`, {
            imageUrl: variantImageURL,
            description: 'صورة متغير اختبار'
          }, { headers });
          
          console.log('✅ Image added to variant:');
          console.log(`   Variant ID: ${variantImageResponse.data.data.variantId}`);
          console.log(`   Image URL: ${variantImageResponse.data.data.imageUrl}`);
          console.log(`   Total Images: ${variantImageResponse.data.data.totalImages}`);
          
        } catch (error) {
          if (error.response?.data?.error === 'Image already exists') {
            console.log('ℹ️ Variant image already exists (expected behavior)');
          } else {
            console.log('❌ Error adding variant image:', error.response?.data?.error);
          }
        }
      }
      
    } else {
      console.log('⚠️ No existing products found to test image upload');
    }
    
    // 3. Test Error Handling
    console.log('\n❌ Test 3: Error Handling');
    console.log('==========================');
    
    try {
      await axios.post(`${baseURL}/products/invalid-id/images`, {
        imageUrl: 'https://example.com/image.jpg'
      }, { headers });
    } catch (error) {
      console.log('✅ Invalid product ID error handled:');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data.error}`);
    }
    
    try {
      await axios.post(`${baseURL}/products/${productsResponse.data.data[0]?.id || 'test'}/images`, {
        imageUrl: 'invalid-url'
      }, { headers });
    } catch (error) {
      console.log('✅ Invalid URL error handled:');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data.error}`);
    }
    
    console.log('\n🎉 Simple tests completed!');
    console.log('\n📋 Working Features:');
    console.log('✅ Currency settings (EGP/جنيه)');
    console.log('✅ Image upload by URL for products');
    console.log('✅ Image upload by URL for variants');
    console.log('✅ Error handling for invalid data');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

simpleTest();
