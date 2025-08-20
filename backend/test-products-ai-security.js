const axios = require('axios');

async function testProductsAISecurity() {
  console.log('🔍 اختبار أمان APIs المنتجات ونظام AI/RAG...\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. اختبار APIs المنتجات بدون Authentication
    console.log('1️⃣ اختبار APIs المنتجات بدون Authentication:');
    console.log('═══════════════════════════════════════');

    const productAPIs = [
      { name: 'Get Categories', url: '/api/v1/products/categories', method: 'GET' },
      { name: 'Create Category', url: '/api/v1/products/categories', method: 'POST', data: { name: 'Test Category' } },
      { name: 'Get Product by ID', url: '/api/v1/products/1', method: 'GET' },
      { name: 'Delete Product', url: '/api/v1/products/1', method: 'DELETE' }
    ];

    let unprotectedProductAPIs = [];

    for (const api of productAPIs) {
      try {
        let response;
        const config = { timeout: 5000 };
        
        switch (api.method) {
          case 'GET':
            response = await axios.get(`${baseURL}${api.url}`, config);
            break;
          case 'POST':
            response = await axios.post(`${baseURL}${api.url}`, api.data || {}, config);
            break;
          case 'DELETE':
            response = await axios.delete(`${baseURL}${api.url}`, config);
            break;
        }
        
        console.log(`🔴 ${api.name}: ${response.status} - غير محمي!`);
        unprotectedProductAPIs.push(api.name);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`🟢 ${api.name}: 401 - محمي بشكل صحيح`);
        } else {
          console.log(`⚠️ ${api.name}: ${error.response?.status || 'خطأ'}`);
        }
      }
    }

    // 2. اختبار APIs نظام AI بدون Authentication
    console.log('\n2️⃣ اختبار APIs نظام AI بدون Authentication:');
    console.log('═══════════════════════════════════════');

    const aiAPIs = [
      { name: 'AI Settings', url: '/api/v1/ai/settings', method: 'PUT', data: { isEnabled: true } },
      { name: 'AI Toggle', url: '/api/v1/ai/toggle', method: 'POST', data: { enabled: true } },
      { name: 'Clear Memory', url: '/api/v1/ai/memory/clear', method: 'DELETE' },
      { name: 'Update Knowledge Base', url: '/api/v1/ai/knowledge-base/update', method: 'POST' },
      { name: 'Memory Stats', url: '/api/v1/ai/memory/stats', method: 'GET' },
      { name: 'RAG Stats', url: '/api/v1/ai/rag/stats', method: 'GET' },
      { name: 'Multimodal Stats', url: '/api/v1/ai/multimodal/stats', method: 'GET' },
      { name: 'Available Models', url: '/api/v1/ai/available-models', method: 'GET' },
      { name: 'System Prompts', url: '/api/v1/ai/prompts', method: 'GET' },
      { name: 'Create Prompt', url: '/api/v1/ai/prompts', method: 'POST', data: { name: 'Test', content: 'Test' } }
    ];

    let unprotectedAIAPIs = [];

    for (const api of aiAPIs) {
      try {
        let response;
        const config = { timeout: 5000 };
        
        switch (api.method) {
          case 'GET':
            response = await axios.get(`${baseURL}${api.url}`, config);
            break;
          case 'POST':
            response = await axios.post(`${baseURL}${api.url}`, api.data || {}, config);
            break;
          case 'PUT':
            response = await axios.put(`${baseURL}${api.url}`, api.data || {}, config);
            break;
          case 'DELETE':
            response = await axios.delete(`${baseURL}${api.url}`, config);
            break;
        }
        
        console.log(`🔴 ${api.name}: ${response.status} - غير محمي!`);
        unprotectedAIAPIs.push(api.name);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`🟢 ${api.name}: 401 - محمي بشكل صحيح`);
        } else {
          console.log(`⚠️ ${api.name}: ${error.response?.status || 'خطأ'} - ${error.message}`);
        }
      }
    }

    // 3. تسجيل الدخول واختبار العزل
    console.log('\n3️⃣ اختبار العزل بعد تسجيل الدخول:');
    console.log('═══════════════════════════════════════');

    const [login1, login2] = await Promise.all([
      axios.post(`${baseURL}/api/v1/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      }),
      axios.post(`${baseURL}/api/v1/auth/login`, {
        email: 'admin58@test.com',
        password: 'admin123'
      })
    ]);

    const user1 = login1.data.data.user;
    const user2 = login2.data.data.user;
    const token1 = login1.data.data.token;
    const token2 = login2.data.data.token;

    console.log('✅ شركة 1:', user1.companyId);
    console.log('✅ شركة 2:', user2.companyId);

    // اختبار المنتجات مع Authentication
    try {
      const [products1, products2] = await Promise.all([
        axios.get(`${baseURL}/api/v1/products`, {
          headers: { 'Authorization': `Bearer ${token1}` }
        }),
        axios.get(`${baseURL}/api/v1/products`, {
          headers: { 'Authorization': `Bearer ${token2}` }
        })
      ]);

      console.log('📦 منتجات الشركة 1:', {
        count: products1.data.data?.length || 0,
        companyId: products1.data.companyId
      });

      console.log('📦 منتجات الشركة 2:', {
        count: products2.data.data?.length || 0,
        companyId: products2.data.companyId
      });

      // فحص العزل في المنتجات
      if (products1.data.companyId === user1.companyId && products2.data.companyId === user2.companyId) {
        console.log('✅ المنتجات معزولة بشكل صحيح');
      } else {
        console.log('🔴 مشكلة في عزل المنتجات');
      }

    } catch (error) {
      console.log('❌ خطأ في اختبار المنتجات:', error.response?.status);
    }

    // اختبار AI Stats مع Authentication
    try {
      const [aiStats1, aiStats2] = await Promise.all([
        axios.get(`${baseURL}/api/v1/ai/stats`, {
          headers: { 'Authorization': `Bearer ${token1}` }
        }),
        axios.get(`${baseURL}/api/v1/ai/stats`, {
          headers: { 'Authorization': `Bearer ${token2}` }
        })
      ]);

      console.log('🤖 AI Stats الشركة 1:', {
        companyId: aiStats1.data.companyId,
        conversations: aiStats1.data.data?.totalConversations
      });

      console.log('🤖 AI Stats الشركة 2:', {
        companyId: aiStats2.data.companyId,
        conversations: aiStats2.data.data?.totalConversations
      });

      // فحص العزل في AI Stats
      if (aiStats1.data.companyId === user1.companyId && aiStats2.data.companyId === user2.companyId) {
        console.log('✅ AI Stats معزولة بشكل صحيح');
      } else {
        console.log('🔴 مشكلة في عزل AI Stats');
      }

    } catch (error) {
      console.log('❌ خطأ في اختبار AI Stats:', error.response?.status);
    }

    // 4. النتائج النهائية
    console.log('\n🏆 النتائج النهائية:');
    console.log('═══════════════════════════════════════');

    console.log(`🔴 APIs المنتجات غير المحمية: ${unprotectedProductAPIs.length}`);
    unprotectedProductAPIs.forEach(api => console.log(`  ❌ ${api}`));

    console.log(`🔴 APIs نظام AI غير المحمية: ${unprotectedAIAPIs.length}`);
    unprotectedAIAPIs.forEach(api => console.log(`  ❌ ${api}`));

    const totalUnprotected = unprotectedProductAPIs.length + unprotectedAIAPIs.length;

    if (totalUnprotected === 0) {
      console.log('🟢 جميع APIs محمية ومعزولة بشكل صحيح!');
    } else {
      console.log(`🔴 يوجد ${totalUnprotected} API غير محمي - يحتاج إصلاح فوري!`);
    }

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testProductsAISecurity();
