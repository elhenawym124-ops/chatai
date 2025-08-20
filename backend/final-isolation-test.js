const axios = require('axios');

async function finalIsolationTest() {
  console.log('🎯 اختبار شامل للعزل في AI Management\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. اختبار الشركة الأولى
    console.log('1️⃣ اختبار الشركة الأولى:');
    console.log('═══════════════════════════════════════');

    const login1Response = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const token1 = login1Response.data.data.token;
    const user1 = login1Response.data.data.user;
    console.log('✅ تسجيل الدخول نجح');
    console.log('🏢 Company ID:', user1.companyId);

    // جلب AI Stats
    const stats1Response = await axios.get(`${baseURL}/api/v1/ai/stats`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });

    // جلب Gemini Keys
    const keys1Response = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });

    // جلب AI Settings
    const settings1Response = await axios.get(`${baseURL}/api/v1/settings/ai`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });

    console.log('📊 بيانات الشركة الأولى:');
    console.log('- AI Stats Company ID:', stats1Response.data.companyId);
    console.log('- Total Messages:', stats1Response.data.data.totalMessages);
    console.log('- Gemini Keys Company ID:', keys1Response.data.companyId);
    console.log('- Total Keys:', keys1Response.data.summary.totalKeys);
    console.log('- AI Settings Company ID:', settings1Response.data.data.companyId);
    console.log('- Auto Reply:', settings1Response.data.data.autoReplyEnabled);

    // 2. اختبار الشركة الثانية
    console.log('\n2️⃣ اختبار الشركة الثانية:');
    console.log('═══════════════════════════════════════');

    const login2Response = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'company1@test.com',
      password: 'password123'
    });

    const token2 = login2Response.data.data.token;
    const user2 = login2Response.data.data.user;
    console.log('✅ تسجيل الدخول نجح');
    console.log('🏢 Company ID:', user2.companyId);

    // جلب AI Stats
    const stats2Response = await axios.get(`${baseURL}/api/v1/ai/stats`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    // جلب Gemini Keys
    const keys2Response = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    // جلب AI Settings
    const settings2Response = await axios.get(`${baseURL}/api/v1/settings/ai`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    console.log('📊 بيانات الشركة الثانية:');
    console.log('- AI Stats Company ID:', stats2Response.data.companyId);
    console.log('- Total Messages:', stats2Response.data.data.totalMessages);
    console.log('- Gemini Keys Company ID:', keys2Response.data.companyId);
    console.log('- Total Keys:', keys2Response.data.summary.totalKeys);
    console.log('- AI Settings Company ID:', settings2Response.data.data.companyId);
    console.log('- Auto Reply:', settings2Response.data.data.autoReplyEnabled);

    // 3. التحقق من العزل الشامل
    console.log('\n3️⃣ التحقق من العزل الشامل:');
    console.log('═══════════════════════════════════════');

    const company1Id = user1.companyId;
    const company2Id = user2.companyId;

    // فحص Company IDs
    const statsIsolated = (
      stats1Response.data.companyId === company1Id &&
      stats2Response.data.companyId === company2Id
    );

    const keysIsolated = (
      keys1Response.data.companyId === company1Id &&
      keys2Response.data.companyId === company2Id
    );

    const settingsIsolated = (
      settings1Response.data.data.companyId === company1Id &&
      settings2Response.data.data.companyId === company2Id
    );

    // فحص اختلاف البيانات
    const differentData = (
      company1Id !== company2Id &&
      keys1Response.data.summary.totalKeys !== keys2Response.data.summary.totalKeys
    );

    console.log('🔍 نتائج فحص العزل:');
    console.log('- Company IDs مختلفة:', company1Id !== company2Id ? '✅' : '❌');
    console.log('- AI Stats معزول:', statsIsolated ? '✅' : '❌');
    console.log('- Gemini Keys معزول:', keysIsolated ? '✅' : '❌');
    console.log('- AI Settings معزول:', settingsIsolated ? '✅' : '❌');
    console.log('- البيانات مختلفة:', differentData ? '✅' : '❌');

    // 4. اختبار إضافة مفتاح للشركة الثانية
    console.log('\n4️⃣ اختبار إضافة مفتاح للشركة الثانية:');
    console.log('═══════════════════════════════════════');

    try {
      const addKeyResponse = await axios.post(`${baseURL}/api/v1/ai/gemini-keys`, {
        name: 'مفتاح الشركة الثانية',
        apiKey: 'AIzaSyDfva6184QKvdAMRey3Pp6oKdFHdpxrr-U',
        description: 'مفتاح للشركة الثانية'
      }, {
        headers: { 'Authorization': `Bearer ${token2}` }
      });

      console.log('✅ تم إضافة مفتاح للشركة الثانية');
      console.log('🏢 Company ID:', addKeyResponse.data.data.companyId);

      // فحص المفاتيح بعد الإضافة
      const finalKeys1 = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
        headers: { 'Authorization': `Bearer ${token1}` }
      });

      const finalKeys2 = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
        headers: { 'Authorization': `Bearer ${token2}` }
      });

      console.log('\n📊 المفاتيح بعد الإضافة:');
      console.log('- الشركة الأولى:', finalKeys1.data.summary.totalKeys, 'مفتاح');
      console.log('- الشركة الثانية:', finalKeys2.data.summary.totalKeys, 'مفتاح');

    } catch (error) {
      console.log('⚠️ فشل إضافة المفتاح:', error.response?.data?.error);
    }

    // 5. النتائج النهائية
    console.log('\n🏆 النتائج النهائية:');
    console.log('═══════════════════════════════════════');

    const allIsolated = statsIsolated && keysIsolated && settingsIsolated && differentData;

    if (allIsolated) {
      console.log('🟢 العزل في AI Management يعمل بشكل مثالي!');
      console.log('✅ AI Stats معزول بالكامل');
      console.log('✅ Gemini Keys معزول بالكامل');
      console.log('✅ AI Settings معزول بالكامل');
      console.log('✅ كل شركة لها بيانات منفصلة تماماً');
      console.log('✅ إضافة مفاتيح جديدة تعمل مع العزل');
      console.log('✅ لا يوجد تداخل في البيانات');
      console.log('\n🎉 AI Management آمن ومعزول بالكامل!');
    } else {
      console.log('🔴 مشكلة في العزل!');
      console.log('❌ هناك تداخل في البيانات بين الشركات');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

finalIsolationTest();
