async function testNewRoute() {
  console.log('🔍 Testing New Route Path...\n');
  
  const testProductId = 'cmd5c0en8000iymzdijfkpnjf';
  const testImageUrl = 'https://via.placeholder.com/200x200/00FFFF/000000?text=New+Route+Test';
  
  // Test 1: Add image first using original route
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
  
  // Test 2: Try new delete route
  console.log('\n🗑️ Step 2: Testing new delete route...');
  
  const deleteResponse = await fetch(`http://localhost:3001/products/${testProductId}/images/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageUrl: testImageUrl })
  });
  
  console.log('📊 Delete response status:', deleteResponse.status);
  
  const deleteData = await deleteResponse.json();
  console.log('📊 Delete response data:', deleteData);
  
  if (deleteData.success) {
    console.log('✅ New route works! Image deleted successfully');
  } else {
    console.log('❌ New route failed:', deleteData.error);
  }
  
  console.log('\n🎉 New Route Test Complete!');
}

testNewRoute().catch(console.error);
