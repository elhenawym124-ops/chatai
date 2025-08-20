const axios = require('axios');

async function testTwoCompaniesIsolation() {
  console.log('🔍 اختبار العزل بين شركتين مختلفتين\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. إنشاء شركتين مختلفتين
    console.log('1️⃣ إنشاء شركتين مختلفتين:');
    console.log('═══════════════════════════════════════');

    // إنشاء الشركة الأولى
    const company1Response = await axios.post(`${baseURL}/api/v1/auth/register`, {
      email: 'company1@test.com',
      password: 'password123',
      firstName: 'مدير',
      lastName: 'الشركة الأولى',
      companyName: 'شركة الاختبار الأولى',
      phone: '1234567890'
    });

    const user1 = company1Response.data.data.user;
    const token1 = company1Response.data.data.token;
    console.log('✅ الشركة الأولى:', user1.companyId);

    // إنشاء الشركة الثانية
    const company2Response = await axios.post(`${baseURL}/api/v1/auth/register`, {
      email: 'company2@test.com',
      password: 'password123',
      firstName: 'مدير',
      lastName: 'الشركة الثانية',
      companyName: 'شركة الاختبار الثانية',
      phone: '0987654321'
    });

    const user2 = company2Response.data.data.user;
    const token2 = company2Response.data.data.token;
    console.log('✅ الشركة الثانية:', user2.companyId);

    // 2. حفظ إعدادات مختلفة لكل شركة
    console.log('\n2️⃣ حفظ إعدادات مختلفة لكل شركة:');
    console.log('═══════════════════════════════════════');

    // إعدادات الشركة الأولى
    await axios.put(`${baseURL}/api/v1/settings/ai`, {
      autoReplyEnabled: true,
      confidenceThreshold: 0.9,
      multimodalEnabled: true,
      ragEnabled: true,
      qualityEvaluationEnabled: true
    }, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    console.log('✅ تم حفظ إعدادات الشركة الأولى');

    // إعدادات الشركة الثانية
    await axios.put(`${baseURL}/api/v1/settings/ai`, {
      autoReplyEnabled: false,
      confidenceThreshold: 0.5,
      multimodalEnabled: false,
      ragEnabled: false,
      qualityEvaluationEnabled: false
    }, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    console.log('✅ تم حفظ إعدادات الشركة الثانية');

    // 3. اختبار AI Stats للشركتين
    console.log('\n3️⃣ اختبار AI Stats للشركتين:');
    console.log('═══════════════════════════════════════');

    const stats1Response = await axios.get(`${baseURL}/api/v1/ai/stats`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });

    const stats2Response = await axios.get(`${baseURL}/api/v1/ai/stats`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    console.log('📊 الشركة الأولى - AI Stats:');
    console.log('- Company ID:', stats1Response.data.data.companyId);
    console.log('- Total Messages:', stats1Response.data.data.totalMessages);
    console.log('- AI Responses:', stats1Response.data.data.aiResponses);

    console.log('\n📊 الشركة الثانية - AI Stats:');
    console.log('- Company ID:', stats2Response.data.data.companyId);
    console.log('- Total Messages:', stats2Response.data.data.totalMessages);
    console.log('- AI Responses:', stats2Response.data.data.aiResponses);

    // 4. اختبار AI Settings للشركتين
    console.log('\n4️⃣ اختبار AI Settings للشركتين:');
    console.log('═══════════════════════════════════════');

    const settings1Response = await axios.get(`${baseURL}/api/v1/settings/ai`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });

    const settings2Response = await axios.get(`${baseURL}/api/v1/settings/ai`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    console.log('⚙️ الشركة الأولى - AI Settings:');
    console.log('- Company ID:', settings1Response.data.data.companyId);
    console.log('- Auto Reply:', settings1Response.data.data.autoReplyEnabled);
    console.log('- Confidence:', settings1Response.data.data.confidenceThreshold);

    console.log('\n⚙️ الشركة الثانية - AI Settings:');
    console.log('- Company ID:', settings2Response.data.data.companyId);
    console.log('- Auto Reply:', settings2Response.data.data.autoReplyEnabled);
    console.log('- Confidence:', settings2Response.data.data.confidenceThreshold);

    // 5. التحقق من العزل الكامل
    console.log('\n5️⃣ التحقق من العزل الكامل:');
    console.log('═══════════════════════════════════════');

    const stats1 = stats1Response.data.data;
    const stats2 = stats2Response.data.data;
    const settings1 = settings1Response.data.data;
    const settings2 = settings2Response.data.data;

    // التحقق من Company IDs
    const company1Id = user1.companyId;
    const company2Id = user2.companyId;

    console.log('🔍 فحص Company IDs:');
    console.log('- Stats1 Company ID:', stats1.companyId === company1Id ? '✅' : '❌', stats1.companyId);
    console.log('- Stats2 Company ID:', stats2.companyId === company2Id ? '✅' : '❌', stats2.companyId);
    console.log('- Settings1 Company ID:', settings1.companyId === company1Id ? '✅' : '❌', settings1.companyId);
    console.log('- Settings2 Company ID:', settings2.companyId === company2Id ? '✅' : '❌', settings2.companyId);

    // التحقق من اختلاف الإعدادات
    console.log('\n🔍 فحص اختلاف الإعدادات:');
    console.log('- Auto Reply مختلف:', settings1.autoReplyEnabled !== settings2.autoReplyEnabled ? '✅' : '❌');
    console.log('- Confidence مختلف:', settings1.confidenceThreshold !== settings2.confidenceThreshold ? '✅' : '❌');

    // التحقق من عدم تداخل البيانات
    console.log('\n🔍 فحص عدم تداخل البيانات:');
    console.log('- Company IDs مختلفة:', company1Id !== company2Id ? '✅' : '❌');
    console.log('- Stats منفصلة:', stats1.companyId !== stats2.companyId ? '✅' : '❌');

    // 6. النتائج النهائية
    console.log('\n🏆 النتائج النهائية:');
    console.log('═══════════════════════════════════════');

    const isolationWorking = (
      stats1.companyId === company1Id &&
      stats2.companyId === company2Id &&
      settings1.companyId === company1Id &&
      settings2.companyId === company2Id &&
      company1Id !== company2Id &&
      settings1.autoReplyEnabled !== settings2.autoReplyEnabled &&
      settings1.confidenceThreshold !== settings2.confidenceThreshold
    );

    if (isolationWorking) {
      console.log('🟢 العزل بين الشركات يعمل بشكل مثالي!');
      console.log('✅ كل شركة لها بيانات منفصلة تماماً');
      console.log('✅ الإعدادات مختلفة ومعزولة');
      console.log('✅ الإحصائيات منفصلة');
      console.log('✅ Company IDs صحيحة ومختلفة');
      console.log('✅ لا يوجد تداخل في البيانات');
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

testTwoCompaniesIsolation();
