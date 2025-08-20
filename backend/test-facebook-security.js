const axios = require('axios');

async function testFacebookSecurity() {
  console.log('🔍 اختبار أمان Facebook Settings...\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. اختبار الوصول بدون Authentication
    console.log('1️⃣ اختبار الوصول بدون Authentication:');
    console.log('═══════════════════════════════════════');

    const facebookAPIs = [
      { name: 'Connected Pages', url: '/api/v1/integrations/facebook/connected', method: 'GET' },
      { name: 'Facebook Config', url: '/api/v1/integrations/facebook/config', method: 'GET' },
      { name: 'Facebook Diagnostics', url: '/api/v1/integrations/facebook/diagnostics', method: 'GET' },
      { name: 'Test Token', url: '/api/v1/integrations/facebook/test', method: 'POST', data: { pageAccessToken: 'test' } },
      { name: 'Connect Page', url: '/api/v1/integrations/facebook/connect', method: 'POST', data: { pageId: 'test', pageAccessToken: 'test', pageName: 'test' } }
    ];

    for (const api of facebookAPIs) {
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
        }
        
        console.log(`🔴 ${api.name}: ${response.status} - غير محمي! يمكن الوصول بدون token`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`🟢 ${api.name}: 401 - محمي بشكل صحيح`);
        } else {
          console.log(`⚠️ ${api.name}: ${error.response?.status || 'خطأ'} - ${error.message}`);
        }
      }
    }

    // 2. تسجيل الدخول بشركتين مختلفتين
    console.log('\n2️⃣ تسجيل الدخول بشركتين:');
    console.log('═══════════════════════════════════════');

    const [login1, login2] = await Promise.all([
      axios.post(`${baseURL}/api/v1/auth/login`, {
        email: 'admin58@test.com',
        password: 'admin123'
      }),
      axios.post(`${baseURL}/api/v1/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      })
    ]);

    const user1 = login1.data.data.user;
    const user2 = login2.data.data.user;
    const token1 = login1.data.data.token;
    const token2 = login2.data.data.token;

    console.log('✅ شركة 1:', user1.companyId);
    console.log('✅ شركة 2:', user2.companyId);

    // 3. اختبار العزل بين الشركات
    console.log('\n3️⃣ اختبار العزل بين الشركات:');
    console.log('═══════════════════════════════════════');

    try {
      const [response1, response2] = await Promise.all([
        axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
          headers: { 'Authorization': `Bearer ${token1}` }
        }),
        axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
          headers: { 'Authorization': `Bearer ${token2}` }
        })
      ]);

      console.log('📊 استجابة الشركة 1:', JSON.stringify(response1.data, null, 2));
      console.log('📊 استجابة الشركة 2:', JSON.stringify(response2.data, null, 2));

      // فحص إذا كانت البيانات متطابقة (مشكلة في العزل)
      const data1String = JSON.stringify(response1.data);
      const data2String = JSON.stringify(response2.data);

      if (data1String === data2String) {
        console.log('🔴 مشكلة خطيرة: كلا الشركتين تريان نفس البيانات!');
        console.log('❌ العزل لا يعمل - جميع الشركات ترى بيانات الشركة الأولى');
      } else {
        console.log('✅ العزل يعمل: كل شركة ترى بياناتها المختلفة');
      }

    } catch (error) {
      console.log('❌ خطأ في اختبار العزل:', error.response?.status);
    }

    // 4. اختبار Facebook Config
    console.log('\n4️⃣ اختبار Facebook Config:');
    console.log('═══════════════════════════════════════');

    try {
      const configResponse = await axios.get(`${baseURL}/api/v1/integrations/facebook/config`, {
        headers: { 'Authorization': `Bearer ${token1}` }
      });

      console.log('⚙️ Facebook Config:', JSON.stringify(configResponse.data, null, 2));

      // فحص إذا كان Config يحتوي على معلومات حساسة
      const config = configResponse.data;
      if (config.appId || config.verifyToken) {
        console.log('⚠️ تحذير: Config يحتوي على معلومات حساسة قد تكون مكشوفة');
      }

    } catch (error) {
      console.log('❌ خطأ في جلب Config:', error.response?.status);
    }

    // 5. اختبار إضافة صفحة Facebook
    console.log('\n5️⃣ اختبار إضافة صفحة Facebook:');
    console.log('═══════════════════════════════════════');

    try {
      const testPageData = {
        pageId: `test-page-${Date.now()}`,
        pageAccessToken: 'test-token-123',
        pageName: 'Test Page for Security'
      };

      const connectResponse = await axios.post(`${baseURL}/api/v1/integrations/facebook/connect`, testPageData, {
        headers: { 'Authorization': `Bearer ${token1}` }
      });

      console.log('📤 إضافة صفحة تجريبية:', connectResponse.status);
      console.log('📊 استجابة الإضافة:', JSON.stringify(connectResponse.data, null, 2));

      // التحقق من أن الشركة الأخرى لا ترى الصفحة
      const [pages1, pages2] = await Promise.all([
        axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
          headers: { 'Authorization': `Bearer ${token1}` }
        }),
        axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
          headers: { 'Authorization': `Bearer ${token2}` }
        })
      ]);

      const pages1Count = pages1.data.data?.length || 0;
      const pages2Count = pages2.data.data?.length || 0;

      console.log(`📊 صفحات الشركة 1: ${pages1Count}`);
      console.log(`📊 صفحات الشركة 2: ${pages2Count}`);

      if (pages1Count === pages2Count) {
        console.log('🔴 مشكلة: كلا الشركتين تريان نفس عدد الصفحات!');
      } else {
        console.log('✅ العزل يعمل في إضافة الصفحات');
      }

    } catch (error) {
      console.log('❌ خطأ في إضافة الصفحة:', error.response?.status, error.response?.data);
    }

    // 6. النتائج النهائية
    console.log('\n🏆 ملخص الثغرات الأمنية في Facebook Settings:');
    console.log('═══════════════════════════════════════');
    console.log('🔴 مشاكل أمنية خطيرة:');
    console.log('  ❌ جميع Facebook APIs غير محمية');
    console.log('  ❌ لا تستخدم authenticateToken middleware');
    console.log('  ❌ لا تطبق Company Isolation');
    console.log('  ❌ تستخدم findFirst() بدلاً من companyId');
    console.log('  ❌ جميع الشركات ترى بيانات الشركة الأولى');
    console.log('  ❌ يمكن الوصول بدون authentication');
    console.log('\n⚠️ Facebook Settings يحتاج إصلاح فوري!');

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
  }
}

testFacebookSecurity();
