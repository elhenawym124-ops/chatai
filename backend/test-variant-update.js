async function testVariantUpdate() {
  console.log('🧪 Testing Variant Update Fix...\n');
  
  const productId = 'cmde4snz7003puf4swmfv9qa1';
  const mockToken = 'mock-access-token';
  
  try {
    // Get existing variants
    console.log('📋 Getting existing variants...');
    
    const getResponse = await fetch(`http://localhost:3001/api/v1/products/${productId}/variants`, {
      headers: {
        'Authorization': `Bearer ${mockToken}`
      }
    });
    
    const getData = await getResponse.json();
    
    if (!getData.success || getData.data.length === 0) {
      console.log('❌ No variants found to test');
      return;
    }
    
    const testVariant = getData.data[0];
    console.log(`✅ Found variant to test: ${testVariant.name} (ID: ${testVariant.id})`);
    
    // Test PUT method (what frontend uses)
    console.log('\n🔄 Testing PUT method...');
    
    const updatedData = {
      ...testVariant,
      name: testVariant.name + ' - PUT Test',
      stock: testVariant.stock + 1
    };
    
    const putResponse = await fetch(`http://localhost:3001/api/v1/products/variants/${testVariant.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify(updatedData)
    });
    
    console.log('📊 PUT Response status:', putResponse.status);
    
    const putData = await putResponse.json();
    console.log('📊 PUT Response data:', putData);
    
    if (putData.success) {
      console.log('✅ PUT method works!');
      console.log(`   Updated name: ${putData.data.name}`);
      console.log(`   Updated stock: ${putData.data.stock}`);
    } else {
      console.log('❌ PUT method failed:', putData.error);
    }
    
    // Test PATCH method (original)
    console.log('\n🔄 Testing PATCH method...');
    
    const patchData = {
      name: testVariant.name + ' - PATCH Test',
      stock: testVariant.stock + 2
    };
    
    const patchResponse = await fetch(`http://localhost:3001/api/v1/products/variants/${testVariant.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify(patchData)
    });
    
    const patchResponseData = await patchResponse.json();
    
    if (patchResponseData.success) {
      console.log('✅ PATCH method works!');
      console.log(`   Updated name: ${patchResponseData.data.name}`);
      console.log(`   Updated stock: ${patchResponseData.data.stock}`);
    } else {
      console.log('❌ PATCH method failed:', patchResponseData.error);
    }
    
    console.log('\n🎉 Variant update test complete!');
    console.log('✅ Both PUT and PATCH methods should now work');
    console.log('🔗 Frontend should be able to save variants successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testVariantUpdate();
