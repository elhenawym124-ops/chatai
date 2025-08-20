async function testWithAuth() {
  console.log('🔐 Testing with Authentication Token...\n');
  
  const testProductId = 'cmd5c0en8000iymzdijfkpnjf';
  const testImageUrl = 'https://via.placeholder.com/200x200/FF00FF/FFFFFF?text=Auth+Test';
  
  // Mock token that should work with mockAuth middleware
  const mockToken = 'mock-access-token';
  
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
  
  // Test 2: Try delete with auth token
  console.log('\n🗑️ Step 2: Testing delete with auth token...');
  
  const deleteResponse = await fetch(`http://localhost:3001/api/v1/products/${testProductId}/images`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${mockToken}`
    },
    body: JSON.stringify({ imageUrl: testImageUrl })
  });
  
  console.log('📊 Delete response status:', deleteResponse.status);
  
  const deleteData = await deleteResponse.json();
  console.log('📊 Delete response data:', deleteData);
  
  if (deleteData.success) {
    console.log('✅ Delete with auth token works!');
  } else {
    console.log('❌ Delete with auth token failed:', deleteData.error);
  }
  
  console.log('\n🎉 Auth Test Complete!');
}

testWithAuth().catch(console.error);
