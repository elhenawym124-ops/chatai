async function testSimpleRoute() {
  console.log('🧪 Testing Simple Route...\n');
  
  const testProductId = 'cmd5c0en8000iymzdijfkpnjf';
  
  const response = await fetch(`http://localhost:3001/test-delete-image/${testProductId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ test: 'data' })
  });
  
  console.log('📊 Response status:', response.status);
  
  const data = await response.json();
  console.log('📊 Response data:', data);
  
  if (data.success) {
    console.log('✅ Simple route works!');
  } else {
    console.log('❌ Simple route failed');
  }
}

testSimpleRoute().catch(console.error);
