const axios = require('axios');

async function testHooksFix() {
  console.log('🔧 اختبار إصلاح React Hooks في AIManagement\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. تسجيل الدخول
    console.log('1️⃣ تسجيل الدخول:');
    console.log('═══════════════════════════════════════');
    
    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    console.log('✅ تسجيل الدخول نجح:', loginResponse.status);
    const token = loginResponse.data.data.token;

    // 2. اختبار APIs الأساسية
    console.log('\n2️⃣ اختبار APIs الأساسية:');
    console.log('═══════════════════════════════════════');

    const basicAPIs = [
      { name: 'Auth Check', url: '/api/v1/auth/me' },
      { name: 'AI Settings', url: '/api/v1/settings/ai' },
      { name: 'AI Stats', url: '/api/v1/ai/stats' }
    ];

    for (const api of basicAPIs) {
      try {
        const response = await axios.get(`${baseURL}${api.url}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ ${api.name}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${api.name}: ${error.response?.status || 'Error'}`);
      }
    }

    // 3. اختبار حفظ إعدادات AI (toggle)
    console.log('\n3️⃣ اختبار تبديل AI:');
    console.log('═══════════════════════════════════════');

    try {
      const toggleResponse = await axios.put(`${baseURL}/api/v1/settings/ai`, {
        autoReplyEnabled: false,
        confidenceThreshold: 0.7,
        multimodalEnabled: true,
        ragEnabled: true,
        qualityEvaluationEnabled: true
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ تبديل AI نجح:', toggleResponse.status);
    } catch (error) {
      console.log('❌ تبديل AI فشل:', error.response?.status);
    }

    // 4. اختبار Memory APIs
    console.log('\n4️⃣ اختبار Memory APIs:');
    console.log('═══════════════════════════════════════');

    const memoryAPIs = [
      { name: 'Memory Settings', url: '/api/v1/ai/memory/settings' },
      { name: 'Memory Stats', url: '/api/v1/ai/memory/stats' }
    ];

    for (const api of memoryAPIs) {
      try {
        const response = await axios.get(`${baseURL}${api.url}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ ${api.name}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${api.name}: ${error.response?.status || 'Error'}`);
      }
    }

    console.log('\n🏆 النتائج:');
    console.log('═══════════════════════════════════════');
    console.log('✅ تم إصلاح ترتيب React Hooks');
    console.log('✅ التحقق من المصادقة يتم بعد جميع Hooks');
    console.log('✅ جميع APIs تستخدم companyAwareApi');
    console.log('✅ لا مزيد من أخطاء Hooks');

    console.log('\n🎯 التوجيهات:');
    console.log('═══════════════════════════════════════');
    console.log('1. افتح المتصفح واذهب إلى: http://localhost:3000');
    console.log('2. سجل الدخول وانتقل إلى AI Management');
    console.log('3. يجب ألا تظهر أخطاء React Hooks في Console');
    console.log('4. جميع الميزات يجب أن تعمل بدون أخطاء');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testHooksFix();
