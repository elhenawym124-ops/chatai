async function testRouteDirectly() {
  console.log('🔍 Testing Route Directly...\n');
  
  const testProductId = 'cmd5c0en8000iymzdijfkpnjf';
  const testImageUrl = 'https://via.placeholder.com/200x200/FFFF00/000000?text=Direct+Test';
  
  // Test 1: Add image first
  console.log('➕ Step 1: Adding test image...');
  
  const addResponse = await fetch(`http://localhost:3001/api/v1/products/${testProductId}/images/url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageUrl: testImageUrl })
  });
  
  const addData = await addResponse.json();
  console.log('📊 Add response:', addData);
  
  if (!addData.success) {
    console.log('❌ Failed to add image, stopping test');
    return;
  }
  
  // Test 2: Try different delete approaches
  console.log('\n🗑️ Step 2: Testing different delete approaches...');
  
  // Approach 1: DELETE with body
  console.log('\n🔸 Approach 1: DELETE with JSON body');
  const deleteResponse1 = await fetch(`http://localhost:3001/api/v1/products/${testProductId}/images`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageUrl: testImageUrl })
  });
  
  console.log('📊 Delete response status:', deleteResponse1.status);
  console.log('📊 Delete response headers:', Object.fromEntries(deleteResponse1.headers.entries()));
  
  const deleteData1 = await deleteResponse1.json();
  console.log('📊 Delete response data:', deleteData1);
  
  // If first approach failed, try approach 2
  if (!deleteData1.success) {
    console.log('\n🔸 Approach 2: DELETE with query parameter');
    const deleteResponse2 = await fetch(`http://localhost:3001/api/v1/products/${testProductId}/images?imageUrl=${encodeURIComponent(testImageUrl)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const deleteData2 = await deleteResponse2.json();
    console.log('📊 Delete with query response:', deleteData2);
  }
  
  // Test 3: Check what routes are actually available
  console.log('\n🔍 Step 3: Testing route availability...');
  
  // Test if the route exists by sending a malformed request
  const testResponse = await fetch(`http://localhost:3001/api/v1/products/${testProductId}/images`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({}) // Empty body to trigger validation error
  });
  
  const testData = await testResponse.json();
  console.log('📊 Route test response:', testData);
  
  if (testData.error === 'Image URL is required') {
    console.log('✅ Route is accessible and working!');
  } else if (testData.error === 'Authentication required') {
    console.log('❌ Route is being blocked by authentication middleware');
  } else {
    console.log('⚠️ Unexpected response from route');
  }
  
  console.log('\n🎉 Direct Route Test Complete!');
}

testRouteDirectly().catch(console.error);
