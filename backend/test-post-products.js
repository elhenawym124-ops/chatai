const axios = require('axios');

async function testPostProducts() {
  console.log('🧪 Testing POST /api/v1/products...\n');
  
  const testCases = [
    {
      name: 'Valid Product',
      data: {
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        images: ['https://example.com/image1.jpg'],
        tags: ['test', 'product']
      },
      expectedStatus: 201
    },
    {
      name: 'Missing Required Fields',
      data: {
        description: 'Test without name and price'
      },
      expectedStatus: 400
    },
    {
      name: 'Invalid Price',
      data: {
        name: 'Test Product',
        price: 'invalid-price',
        stock: 10
      },
      expectedStatus: 500
    },
    {
      name: 'Empty Request',
      data: {},
      expectedStatus: 400
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`   Data: ${JSON.stringify(testCase.data, null, 2)}`);
    
    try {
      const response = await axios.post('http://localhost:3001/api/v1/products', testCase.data, {
        headers: {
          'Authorization': 'Bearer mock-access-token',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   ✅ Status: ${response.status} (Expected: ${testCase.expectedStatus})`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.status === testCase.expectedStatus) {
        console.log(`   ✅ Test passed`);
      } else {
        console.log(`   ⚠️ Unexpected status code`);
      }
      
    } catch (error) {
      const status = error.response?.status || 'No response';
      const errorData = error.response?.data || { error: error.message };
      
      console.log(`   ❌ Status: ${status} (Expected: ${testCase.expectedStatus})`);
      console.log(`   Error: ${JSON.stringify(errorData, null, 2)}`);
      
      if (status === testCase.expectedStatus) {
        console.log(`   ✅ Test passed (expected error)`);
      } else {
        console.log(`   ❌ Test failed`);
      }
    }
    
    console.log('');
  }
  
  // اختبار خاص للبيانات المعقدة
  console.log('📝 Testing Complex Product Data:');
  
  const complexData = {
    name: 'كوتشي تست',
    description: 'وصف تفصيلي للمنتج',
    price: 250.50,
    stock: 15,
    category: 'أحذية رياضية',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400'
    ],
    tags: ['كوتشي', 'رياضي', 'جديد'],
    sku: 'TEST-001',
    isActive: true
  };
  
  try {
    const response = await axios.post('http://localhost:3001/api/v1/products', complexData, {
      headers: {
        'Authorization': 'Bearer mock-access-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   ✅ Complex data test passed: ${response.status}`);
    console.log(`   Created product: ${response.data.data?.name}`);
    
  } catch (error) {
    console.log(`   ❌ Complex data test failed: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    console.log(`   Details: ${error.response?.data?.details || 'No details'}`);
  }
  
  console.log('\n🔍 Check server logs for detailed error information');
}

testPostProducts();
