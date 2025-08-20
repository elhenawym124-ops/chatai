const axios = require('axios');

async function testAIStatsIsolation() {
  console.log('🔍 اختبار العزل في AI Stats بعد الإصلاح\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. تسجيل الدخول بالمستخدم الموجود
    console.log('1️⃣ تسجيل الدخول:');
    console.log('═══════════════════════════════════════');

    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ تسجيل الدخول نجح');
    console.log('🏢 Company ID:', user.companyId);

    // 2. اختبار AI Stats مع العزل
    console.log('\n2️⃣ اختبار AI Stats مع العزل:');
    console.log('═══════════════════════════════════════');

    const statsResponse = await axios.get(`${baseURL}/api/v1/ai/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📊 AI Stats Response:');
    console.log('- Success:', statsResponse.data.success);
    console.log('- Total Messages:', statsResponse.data.data.totalMessages);
    console.log('- AI Responses:', statsResponse.data.data.aiResponses);
    console.log('- Human Handoffs:', statsResponse.data.data.humanHandoffs);
    console.log('- Average Response Time:', statsResponse.data.data.avgResponseTime);
    console.log('- Company ID:', statsResponse.data.data.companyId);

    // 3. التحقق من العزل
    console.log('\n3️⃣ التحقق من العزل:');
    console.log('═══════════════════════════════════════');

    const expectedCompanyId = user.companyId;
    const returnedCompanyId = statsResponse.data.data.companyId;

    if (expectedCompanyId === returnedCompanyId) {
      console.log('🟢 العزل يعمل بشكل صحيح!');
      console.log('✅ Company ID متطابق:', expectedCompanyId);
    } else {
      console.log('🔴 مشكلة في العزل!');
      console.log('❌ Expected Company ID:', expectedCompanyId);
      console.log('❌ Returned Company ID:', returnedCompanyId);
    }

    // 4. اختبار بدون token (يجب أن يفشل)
    console.log('\n4️⃣ اختبار بدون token (يجب أن يفشل):');
    console.log('═══════════════════════════════════════');

    try {
      await axios.get(`${baseURL}/api/v1/ai/stats`);
      console.log('🔴 خطأ: تم السماح بالوصول بدون token!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('🟢 ممتاز: تم رفض الوصول بدون token');
      } else {
        console.log('⚠️ خطأ غير متوقع:', error.response?.status);
      }
    }

    // 5. اختبار AI Settings للمقارنة
    console.log('\n5️⃣ اختبار AI Settings للمقارنة:');
    console.log('═══════════════════════════════════════');

    const settingsResponse = await axios.get(`${baseURL}/api/v1/settings/ai`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('⚙️ AI Settings Response:');
    console.log('- Success:', settingsResponse.data.success);
    console.log('- Company ID:', settingsResponse.data.data.companyId);
    console.log('- Auto Reply:', settingsResponse.data.data.autoReplyEnabled);
    console.log('- Confidence:', settingsResponse.data.data.confidenceThreshold);

    // 6. النتائج النهائية
    console.log('\n🏆 النتائج النهائية:');
    console.log('═══════════════════════════════════════');

    const statsCompanyId = statsResponse.data.data.companyId;
    const settingsCompanyId = settingsResponse.data.data.companyId;

    if (statsCompanyId === settingsCompanyId && statsCompanyId === user.companyId) {
      console.log('🟢 العزل مطبق بشكل صحيح في جميع APIs');
      console.log('✅ AI Stats معزول بنجاح');
      console.log('✅ AI Settings معزول بنجاح');
      console.log('✅ Company ID متطابق في جميع الاستجابات');
    } else {
      console.log('🔴 مشكلة في العزل!');
      console.log('❌ Stats Company ID:', statsCompanyId);
      console.log('❌ Settings Company ID:', settingsCompanyId);
      console.log('❌ User Company ID:', user.companyId);
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testAIStatsIsolation();
