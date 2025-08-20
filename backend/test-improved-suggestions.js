const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testImprovedSuggestions() {
  const baseURL = 'http://localhost:3001';
  const mockToken = 'mock-jwt-token';
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  console.log('🧪 Testing Improved Product Suggestions...\n');
  
  const testMessages = [
    'قولي الموديلات',
    'ايه اللي عندك',
    'عندك منتجات ايه',
    'انصحيني بحاجة حلوة'
  ];
  
  for (const message of testMessages) {
    console.log(`🔍 Testing: "${message}"`);
    
    try {
      const response = await fetch(`${baseURL}/api/v1/ai/recommend-products-advanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          message: message,
          companyId: companyId,
          maxSuggestions: 3,
          includeImages: true
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.data?.recommendations) {
        console.log(`✅ Success: Found ${data.data.recommendations.length} recommendations`);
        data.data.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec.productName || rec.name} - ${rec.price} جنيه`);
          console.log(`      السبب: ${rec.reason}`);
        });
      } else {
        console.log(`❌ Failed: ${data.error || 'No recommendations'}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

testImprovedSuggestions();
