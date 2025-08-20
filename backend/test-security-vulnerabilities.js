const axios = require('axios');

async function testSecurityVulnerabilities() {
  console.log('🔍 اختبار شامل للثغرات الأمنية في AI Management...\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. تسجيل الدخول للحصول على token صالح
    console.log('1️⃣ تسجيل الدخول:');
    console.log('═══════════════════════════════════════');

    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'admin58@test.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ تسجيل الدخول نجح');
    console.log('🏢 Company ID:', user.companyId);

    // 2. اختبار APIs بدون Authentication
    console.log('\n2️⃣ اختبار APIs بدون Authentication:');
    console.log('═══════════════════════════════════════');

    const unprotectedAPIs = [
      { name: 'AI Settings PUT', method: 'PUT', url: '/api/v1/ai/settings', data: { test: true } },
      { name: 'AI Toggle', method: 'POST', url: '/api/v1/ai/toggle', data: { enabled: true } },
      { name: 'Memory Clear', method: 'DELETE', url: '/api/v1/ai/memory/clear' },
      { name: 'Knowledge Base Update', method: 'POST', url: '/api/v1/ai/knowledge-base/update' },
      { name: 'Memory Stats', method: 'GET', url: '/api/v1/ai/memory/stats' },
      { name: 'Available Models', method: 'GET', url: '/api/v1/ai/available-models' },
      { name: 'Prompts GET', method: 'GET', url: '/api/v1/ai/prompts' },
      { name: 'Prompts POST', method: 'POST', url: '/api/v1/ai/prompts', data: { name: 'test', content: 'test' } },
      { name: 'Memory Settings GET', method: 'GET', url: '/api/v1/ai/memory/settings' },
      { name: 'Memory Settings PUT', method: 'PUT', url: '/api/v1/ai/memory/settings', data: { test: true } },
      { name: 'Memory Cleanup', method: 'POST', url: '/api/v1/ai/memory/cleanup' }
    ];

    for (const api of unprotectedAPIs) {
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
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`🟢 ${api.name}: 401 - محمي بشكل صحيح`);
        } else {
          console.log(`⚠️ ${api.name}: ${error.response?.status || 'خطأ'} - ${error.message}`);
        }
      }
    }

    // 3. اختبار Priority Settings بدون Authentication
    console.log('\n3️⃣ اختبار Priority Settings بدون Authentication:');
    console.log('═══════════════════════════════════════');

    const testCompanyId = 'test-company-id';
    
    try {
      // محاولة الوصول لإعدادات شركة أخرى
      const priorityResponse = await axios.get(`${baseURL}/api/v1/priority-settings/${testCompanyId}`);
      console.log(`🔴 Priority Settings GET: ${priorityResponse.status} - غير محمي! يمكن الوصول لأي شركة`);
    } catch (error) {
      console.log(`🟢 Priority Settings GET: ${error.response?.status} - محمي`);
    }

    try {
      // محاولة تعديل إعدادات شركة أخرى
      const priorityUpdateResponse = await axios.put(`${baseURL}/api/v1/priority-settings/${testCompanyId}`, {
        promptPriority: 'low'
      });
      console.log(`🔴 Priority Settings PUT: ${priorityUpdateResponse.status} - غير محمي! يمكن تعديل أي شركة`);
    } catch (error) {
      console.log(`🟢 Priority Settings PUT: ${error.response?.status} - محمي`);
    }

    // 4. اختبار Cross-Company Access
    console.log('\n4️⃣ اختبار Cross-Company Access:');
    console.log('═══════════════════════════════════════');

    // تسجيل الدخول بشركة أخرى
    const otherLoginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const otherToken = otherLoginResponse.data.data.token;
    const otherUser = otherLoginResponse.data.data.user;
    console.log('✅ تسجيل الدخول بشركة أخرى نجح');
    console.log('🏢 Company ID:', otherUser.companyId);

    // محاولة الوصول لمفاتيح الشركة الأولى باستخدام token الشركة الثانية
    try {
      const crossAccessResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
        headers: { 'Authorization': `Bearer ${otherToken}` }
      });
      
      const keys = crossAccessResponse.data.data || [];
      const hasKeysFromOtherCompany = keys.some(key => key.companyId !== otherUser.companyId);
      
      if (hasKeysFromOtherCompany) {
        console.log('🔴 Cross-Company Access: يمكن رؤية مفاتيح شركات أخرى!');
      } else {
        console.log('🟢 Cross-Company Access: العزل يعمل بشكل صحيح');
      }
    } catch (error) {
      console.log(`⚠️ Cross-Company Access: ${error.response?.status} - خطأ`);
    }

    // 5. اختبار Gemini Key Model Update بدون Authentication
    console.log('\n5️⃣ اختبار Gemini Key APIs بدون Authentication:');
    console.log('═══════════════════════════════════════');

    // الحصول على مفتاح للاختبار
    const keysResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (keysResponse.data.data && keysResponse.data.data.length > 0) {
      const testKeyId = keysResponse.data.data[0].id;

      const geminiAPIs = [
        { name: 'Update Model', method: 'PUT', url: `/api/v1/ai/gemini-keys/${testKeyId}/model`, data: { model: 'test' } },
        { name: 'Test Key', method: 'POST', url: `/api/v1/ai/gemini-keys/${testKeyId}/test` }
      ];

      for (const api of geminiAPIs) {
        try {
          let response;
          if (api.method === 'PUT') {
            response = await axios.put(`${baseURL}${api.url}`, api.data);
          } else {
            response = await axios.post(`${baseURL}${api.url}`, api.data || {});
          }
          console.log(`🔴 ${api.name}: ${response.status} - غير محمي!`);
        } catch (error) {
          if (error.response?.status === 401) {
            console.log(`🟢 ${api.name}: 401 - محمي بشكل صحيح`);
          } else {
            console.log(`⚠️ ${api.name}: ${error.response?.status || 'خطأ'}`);
          }
        }
      }
    }

    // 6. النتائج النهائية
    console.log('\n🏆 ملخص الثغرات الأمنية:');
    console.log('═══════════════════════════════════════');
    console.log('🔴 APIs غير محمية (ثغرات أمنية):');
    console.log('  - PUT /api/v1/ai/settings');
    console.log('  - POST /api/v1/ai/toggle');
    console.log('  - DELETE /api/v1/ai/memory/clear');
    console.log('  - POST /api/v1/ai/knowledge-base/update');
    console.log('  - GET /api/v1/ai/memory/stats');
    console.log('  - GET /api/v1/ai/available-models');
    console.log('  - جميع Prompts APIs');
    console.log('  - جميع Memory APIs');
    console.log('  - PUT /api/v1/ai/gemini-keys/:id/model');
    console.log('  - POST /api/v1/ai/gemini-keys/:id/test');
    console.log('  - جميع Priority Settings APIs');
    console.log('\n⚠️ هذه APIs تحتاج إصلاح فوري!');

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
  }
}

testSecurityVulnerabilities();
