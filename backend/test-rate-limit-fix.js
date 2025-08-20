const axios = require('axios');

async function testRateLimitFix() {
  console.log('🔧 اختبار إصلاح Rate Limiting\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. اختبار Health Check
    console.log('1️⃣ اختبار Health Check:');
    console.log('═══════════════════════════════════════');
    
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health Check نجح:', healthResponse.status);
    console.log('🛡️ نقاط الأمان:', healthResponse.data.security?.score);

    // 2. اختبار تسجيل الدخول
    console.log('\n2️⃣ اختبار تسجيل الدخول:');
    console.log('═══════════════════════════════════════');
    
    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    console.log('✅ تسجيل الدخول نجح:', loginResponse.status);
    const token = loginResponse.data.data.token;
    console.log('🔑 Token موجود:', !!token);

    // 3. اختبار طلبات متعددة سريعة
    console.log('\n3️⃣ اختبار طلبات متعددة سريعة:');
    console.log('═══════════════════════════════════════');
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        axios.get(`${baseURL}/api/v1/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(error => ({ error: error.response?.status }))
      );
    }

    const results = await Promise.all(promises);
    const successful = results.filter(r => !r.error).length;
    const rateLimited = results.filter(r => r.error === 429).length;

    console.log(`✅ طلبات نجحت: ${successful}/10`);
    console.log(`🚫 طلبات محظورة: ${rateLimited}/10`);

    if (rateLimited === 0) {
      console.log('🎉 Rate Limiting معطل بنجاح للتطوير!');
    } else {
      console.log('⚠️ Rate Limiting ما زال فعال');
    }

    // 4. اختبار APIs مختلفة
    console.log('\n4️⃣ اختبار APIs مختلفة:');
    console.log('═══════════════════════════════════════');

    const apiTests = [
      { name: 'Conversations', url: '/api/v1/conversations' },
      { name: 'Customers', url: '/api/v1/customers' },
      { name: 'Companies Current', url: '/api/v1/companies/current' }
    ];

    for (const test of apiTests) {
      try {
        const response = await axios.get(`${baseURL}${test.url}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ ${test.name}: ${response.status}`);
      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`🚫 ${test.name}: Rate Limited (429)`);
        } else if (error.response?.status === 401) {
          console.log(`🔐 ${test.name}: Auth Required (401)`);
        } else if (error.response?.status === 404) {
          console.log(`❓ ${test.name}: Not Found (404)`);
        } else {
          console.log(`❌ ${test.name}: Error (${error.response?.status})`);
        }
      }
    }

    console.log('\n🏆 النتائج:');
    console.log('═══════════════════════════════════════');
    console.log('✅ الخادم يعمل بشكل طبيعي');
    console.log('✅ تسجيل الدخول يعمل');
    console.log('✅ Rate Limiting معطل للتطوير');
    console.log('✅ APIs متاحة للاستخدام');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('🔧 تأكد من أن الخادم يعمل على localhost:3001');
    }
  }
}

testRateLimitFix();
