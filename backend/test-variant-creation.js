async function testVariantCreation() {
  console.log('🧪 Testing Variant Creation Fix...\n');
  
  const productId = 'cmde4snz7003puf4swmfv9qa1';
  const mockToken = 'mock-access-token';
  
  try {
    console.log('🎨 Testing variant creation with different data types...');
    
    // Test 1: String stock (what frontend sends)
    console.log('\n📋 Test 1: Creating variant with string stock...');
    
    const variantData1 = {
      type: 'color',
      name: 'أخضر اختبار',
      sku: 'TEST-GREEN-001',
      price: '350',
      comparePrice: '400',
      cost: '',
      stock: '25', // String value
      isActive: true,
      images: 'https://via.placeholder.com/200x200/00FF00/FFFFFF?text=Green+Test',
      productId: productId
    };
    
    const response1 = await fetch(`http://localhost:3001/api/v1/products/${productId}/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify(variantData1)
    });
    
    console.log('📊 Response status:', response1.status);
    
    const data1 = await response1.json();
    console.log('📊 Response data:', data1);
    
    if (data1.success) {
      console.log('✅ String stock test PASSED!');
      console.log(`   Created variant: ${data1.data.name}`);
      console.log(`   Stock: ${data1.data.stock} (type: ${typeof data1.data.stock})`);
      console.log(`   Price: ${data1.data.price} (type: ${typeof data1.data.price})`);
    } else {
      console.log('❌ String stock test FAILED:', data1.error);
    }
    
    // Test 2: Number stock
    console.log('\n📋 Test 2: Creating variant with number stock...');
    
    const variantData2 = {
      type: 'size',
      name: 'مقاس كبير اختبار',
      sku: 'TEST-LARGE-002',
      price: 375,
      comparePrice: 450,
      cost: null,
      stock: 30, // Number value
      isActive: true,
      images: 'https://via.placeholder.com/200x200/FF00FF/FFFFFF?text=Large+Test',
      productId: productId
    };
    
    const response2 = await fetch(`http://localhost:3001/api/v1/products/${productId}/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify(variantData2)
    });
    
    const data2 = await response2.json();
    
    if (data2.success) {
      console.log('✅ Number stock test PASSED!');
      console.log(`   Created variant: ${data2.data.name}`);
      console.log(`   Stock: ${data2.data.stock} (type: ${typeof data2.data.stock})`);
      console.log(`   Price: ${data2.data.price} (type: ${typeof data2.data.price})`);
    } else {
      console.log('❌ Number stock test FAILED:', data2.error);
    }
    
    // Test 3: Empty/null values
    console.log('\n📋 Test 3: Creating variant with empty values...');
    
    const variantData3 = {
      type: 'color',
      name: 'أزرق اختبار',
      sku: 'TEST-BLUE-002',
      price: '300',
      comparePrice: '',
      cost: '',
      stock: '', // Empty string
      isActive: true,
      images: '',
      productId: productId
    };
    
    const response3 = await fetch(`http://localhost:3001/api/v1/products/${productId}/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify(variantData3)
    });
    
    const data3 = await response3.json();
    
    if (data3.success) {
      console.log('✅ Empty values test PASSED!');
      console.log(`   Created variant: ${data3.data.name}`);
      console.log(`   Stock: ${data3.data.stock} (type: ${typeof data3.data.stock})`);
      console.log(`   Price: ${data3.data.price} (type: ${typeof data3.data.price})`);
    } else {
      console.log('❌ Empty values test FAILED:', data3.error);
    }
    
    console.log('\n🎉 Variant creation tests complete!');
    console.log('✅ Frontend should now be able to create variants successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testVariantCreation();
