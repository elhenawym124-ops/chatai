const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugGeminiResponse() {
  const baseURL = 'http://localhost:3001';
  const mockToken = 'mock-jwt-token';
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  console.log('🔍 تشخيص استجابة Gemini للمنتجات...\n');
  
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/recommend-products-advanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify({
        message: 'أريد كوتشي حريمي',
        companyId: companyId,
        maxSuggestions: 3,
        includeImages: true
      })
    });
    
    const data = await response.json();
    
    console.log('📋 الاستجابة الكاملة:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data?.recommendations) {
      console.log('\n🔍 تحليل الاقتراحات:');
      data.data.recommendations.forEach((rec, index) => {
        console.log(`\n   اقتراح ${index + 1}:`);
        console.log(`      productName: ${rec.productName} (type: ${typeof rec.productName})`);
        console.log(`      reason: ${rec.reason}`);
        console.log(`      confidence: ${rec.confidence}`);
        console.log(`      productId: ${rec.productId}`);
        console.log(`      price: ${rec.price}`);
        console.log(`      stock: ${rec.stock}`);
        console.log(`      matchingProduct: ${rec.matchingProduct ? 'موجود' : 'غير موجود'}`);
        
        // Show all properties
        console.log(`      جميع الخصائص:`, Object.keys(rec));
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

debugGeminiResponse();
