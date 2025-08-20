async function checkAIEndpoints() {
  console.log('🔍 فحص AI Endpoints المتاحة...\n');
  
  const baseURL = 'http://localhost:3001';
  const mockToken = 'mock-access-token';
  
  const endpoints = [
    // AI Settings
    { path: '/api/v1/ai/settings', method: 'GET', name: 'إعدادات AI' },
    { path: '/api/v1/ai/product-settings', method: 'GET', name: 'إعدادات المنتجات AI' },
    
    // Product AI
    { path: '/api/v1/ai/recommend-products', method: 'POST', name: 'اقتراح المنتجات', data: { customerId: 'test', context: 'test' } },
    { path: '/api/v1/ai/recommend-products-advanced', method: 'POST', name: 'اقتراح المنتجات المتقدم', data: { customerMessage: 'أريد كوتشي', companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' } },
    { path: '/api/v1/ai/analyze-image', method: 'POST', name: 'تحليل الصور', data: { imageUrl: 'test.jpg' } },
    { path: '/api/v1/ai/create-order', method: 'POST', name: 'إنشاء طلب', data: { conversation: ['test'] } },
    
    // Smart responses
    { path: '/api/v1/ai/smart-response', method: 'POST', name: 'الردود الذكية', data: { message: 'مرحبا' } },
    { path: '/api/v1/ai/response', method: 'POST', name: 'رد AI', data: { message: 'مرحبا' } },
    
    // Other AI endpoints
    { path: '/api/v1/ai/sentiment', method: 'POST', name: 'تحليل المشاعر', data: { text: 'أحب هذا المنتج' } },
    { path: '/api/v1/ai/intent', method: 'POST', name: 'تحليل النية', data: { message: 'أريد شراء منتج' } },
    { path: '/api/v1/ai/recommendations', method: 'POST', name: 'التوصيات', data: { customerId: 'test' } },
    
    // Gemini specific
    { path: '/api/v1/gemini/generate', method: 'POST', name: 'Gemini Generate', data: { prompt: 'مرحبا' } },
    { path: '/api/v1/gemini/chat', method: 'POST', name: 'Gemini Chat', data: { message: 'مرحبا' } },
  ];
  
  for (const endpoint of endpoints) {
    console.log(`🔗 اختبار: ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
    
    try {
      const options = {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      if (endpoint.data && endpoint.method !== 'GET') {
        options.body = JSON.stringify(endpoint.data);
      }
      
      const response = await fetch(`${baseURL}${endpoint.path}`, options);
      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200 || response.status === 201) {
        console.log(`   ✅ متاح - ${data.message || 'نجح'}`);
        if (data.data) {
          console.log(`   📋 البيانات: ${JSON.stringify(data.data).substring(0, 100)}...`);
        }
      } else if (response.status === 404) {
        console.log(`   ❌ غير موجود`);
      } else {
        console.log(`   ⚠️ خطأ: ${data.error || data.message || 'خطأ غير معروف'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ خطأ في الاتصال: ${error.message}`);
    }
    
    console.log('');
  }
  
  // فحص endpoints إضافية من server.js
  console.log('🔍 فحص endpoints إضافية من server.js:');
  
  const serverEndpoints = [
    { path: '/api/v1/ai/prompts', method: 'GET', name: 'البرومبت' },
    { path: '/api/v1/ai/models', method: 'GET', name: 'النماذج' },
    { path: '/api/v1/ai/training', method: 'GET', name: 'التدريب' },
    { path: '/api/v1/ai/learning', method: 'GET', name: 'التعلم' },
  ];
  
  for (const endpoint of serverEndpoints) {
    console.log(`🔗 اختبار: ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
    
    try {
      const response = await fetch(`${baseURL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`   ✅ متاح`);
        if (data.data) {
          console.log(`   📋 البيانات: ${JSON.stringify(data.data).substring(0, 100)}...`);
        }
      } else {
        console.log(`   ❌ غير متاح: ${data.error || 'خطأ غير معروف'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
    }
    
    console.log('');
  }
}

checkAIEndpoints();
