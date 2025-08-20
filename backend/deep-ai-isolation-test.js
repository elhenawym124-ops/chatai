const axios = require('axios');

async function deepAIIsolationTest() {
  console.log('🔍 فحص عميق للعزل بين الشركات في AI Management\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. إنشاء مستخدمين من شركتين مختلفتين
    console.log('1️⃣ إنشاء مستخدمين من شركتين مختلفتين:');
    console.log('═══════════════════════════════════════');

    // إنشاء الشركة الأولى والمستخدم
    const company1Response = await axios.post(`${baseURL}/api/v1/auth/register`, {
      name: 'شركة الاختبار الأولى',
      email: 'test1@company1.com',
      password: 'password123',
      companyName: 'شركة الاختبار الأولى'
    });

    const user1 = company1Response.data.data.user;
    const token1 = company1Response.data.data.token;
    console.log('✅ الشركة الأولى:', user1.companyId);

    // إنشاء الشركة الثانية والمستخدم
    const company2Response = await axios.post(`${baseURL}/api/v1/auth/register`, {
      name: 'شركة الاختبار الثانية',
      email: 'test2@company2.com',
      password: 'password123',
      companyName: 'شركة الاختبار الثانية'
    });

    const user2 = company2Response.data.data.user;
    const token2 = company2Response.data.data.token;
    console.log('✅ الشركة الثانية:', user2.companyId);

    // 2. اختبار AI Settings للشركتين
    console.log('\n2️⃣ اختبار AI Settings للشركتين:');
    console.log('═══════════════════════════════════════');

    // إعدادات الشركة الأولى
    const settings1Response = await axios.get(`${baseURL}/api/v1/settings/ai`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });

    console.log('🏢 الشركة الأولى - AI Settings:');
    console.log('- Company ID:', settings1Response.data.data.companyId);
    console.log('- Auto Reply:', settings1Response.data.data.autoReplyEnabled);
    console.log('- Confidence:', settings1Response.data.data.confidenceThreshold);

    // إعدادات الشركة الثانية
    const settings2Response = await axios.get(`${baseURL}/api/v1/settings/ai`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    console.log('\n🏢 الشركة الثانية - AI Settings:');
    console.log('- Company ID:', settings2Response.data.data.companyId);
    console.log('- Auto Reply:', settings2Response.data.data.autoReplyEnabled);
    console.log('- Confidence:', settings2Response.data.data.confidenceThreshold);

    // 3. اختبار AI Stats للشركتين
    console.log('\n3️⃣ اختبار AI Stats للشركتين:');
    console.log('═══════════════════════════════════════');

    try {
      const stats1Response = await axios.get(`${baseURL}/api/v1/ai/stats`, {
        headers: { 'Authorization': `Bearer ${token1}` }
      });

      console.log('📊 الشركة الأولى - AI Stats:');
      console.log('- Total Messages:', stats1Response.data.data.totalMessages || 0);
      console.log('- AI Responses:', stats1Response.data.data.aiResponses || 0);
      console.log('- Human Handoffs:', stats1Response.data.data.humanHandoffs || 0);
      console.log('- Average Response Time:', stats1Response.data.data.averageResponseTime || 0);

      const stats2Response = await axios.get(`${baseURL}/api/v1/ai/stats`, {
        headers: { 'Authorization': `Bearer ${token2}` }
      });

      console.log('\n📊 الشركة الثانية - AI Stats:');
      console.log('- Total Messages:', stats2Response.data.data.totalMessages || 0);
      console.log('- AI Responses:', stats2Response.data.data.aiResponses || 0);
      console.log('- Human Handoffs:', stats2Response.data.data.humanHandoffs || 0);
      console.log('- Average Response Time:', stats2Response.data.data.averageResponseTime || 0);

      // مقارنة البيانات
      const stats1 = stats1Response.data.data;
      const stats2 = stats2Response.data.data;

      console.log('\n🔍 مقارنة البيانات:');
      console.log('- نفس Total Messages:', (stats1.totalMessages || 0) === (stats2.totalMessages || 0));
      console.log('- نفس AI Responses:', (stats1.aiResponses || 0) === (stats2.aiResponses || 0));
      console.log('- نفس Human Handoffs:', (stats1.humanHandoffs || 0) === (stats2.humanHandoffs || 0));
      console.log('- نفس Average Response Time:', (stats1.averageResponseTime || 0) === (stats2.averageResponseTime || 0));

    } catch (error) {
      console.log('❌ خطأ في AI Stats:', error.response?.status);
    }

    // 4. اختبار Gemini Keys للشركتين
    console.log('\n4️⃣ اختبار Gemini Keys للشركتين:');
    console.log('═══════════════════════════════════════');

    try {
      const keys1Response = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
        headers: { 'Authorization': `Bearer ${token1}` }
      });

      console.log('🔑 الشركة الأولى - Gemini Keys:', keys1Response.data.data.length || 0);

      const keys2Response = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
        headers: { 'Authorization': `Bearer ${token2}` }
      });

      console.log('🔑 الشركة الثانية - Gemini Keys:', keys2Response.data.data.length || 0);

    } catch (error) {
      console.log('❌ خطأ في Gemini Keys:', error.response?.status);
    }

    // 5. اختبار حفظ إعدادات مختلفة لكل شركة
    console.log('\n5️⃣ اختبار حفظ إعدادات مختلفة:');
    console.log('═══════════════════════════════════════');

    // حفظ إعدادات مختلفة للشركة الأولى
    await axios.put(`${baseURL}/api/v1/settings/ai`, {
      autoReplyEnabled: true,
      confidenceThreshold: 0.9, // قيمة مختلفة
      multimodalEnabled: true,
      ragEnabled: true,
      qualityEvaluationEnabled: true
    }, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });

    // حفظ إعدادات مختلفة للشركة الثانية
    await axios.put(`${baseURL}/api/v1/settings/ai`, {
      autoReplyEnabled: false,
      confidenceThreshold: 0.5, // قيمة مختلفة
      multimodalEnabled: false,
      ragEnabled: false,
      qualityEvaluationEnabled: false
    }, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    console.log('✅ تم حفظ إعدادات مختلفة لكل شركة');

    // 6. التحقق من الإعدادات بعد الحفظ
    console.log('\n6️⃣ التحقق من الإعدادات بعد الحفظ:');
    console.log('═══════════════════════════════════════');

    const finalSettings1 = await axios.get(`${baseURL}/api/v1/settings/ai`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });

    const finalSettings2 = await axios.get(`${baseURL}/api/v1/settings/ai`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    console.log('🏢 الشركة الأولى - الإعدادات النهائية:');
    console.log('- Auto Reply:', finalSettings1.data.data.autoReplyEnabled);
    console.log('- Confidence:', finalSettings1.data.data.confidenceThreshold);
    console.log('- Company ID:', finalSettings1.data.data.companyId);

    console.log('\n🏢 الشركة الثانية - الإعدادات النهائية:');
    console.log('- Auto Reply:', finalSettings2.data.data.autoReplyEnabled);
    console.log('- Confidence:', finalSettings2.data.data.confidenceThreshold);
    console.log('- Company ID:', finalSettings2.data.data.companyId);

    // 7. النتائج النهائية
    console.log('\n🏆 النتائج النهائية:');
    console.log('═══════════════════════════════════════');

    const settings1Final = finalSettings1.data.data;
    const settings2Final = finalSettings2.data.data;

    const isolationWorking = (
      settings1Final.companyId === user1.companyId &&
      settings2Final.companyId === user2.companyId &&
      settings1Final.autoReplyEnabled !== settings2Final.autoReplyEnabled &&
      settings1Final.confidenceThreshold !== settings2Final.confidenceThreshold
    );

    if (isolationWorking) {
      console.log('🟢 العزل يعمل بشكل صحيح');
      console.log('✅ كل شركة لها إعدادات منفصلة');
      console.log('✅ البيانات معزولة بالكامل');
    } else {
      console.log('🔴 مشكلة في العزل!');
      console.log('❌ البيانات مختلطة بين الشركات');
      console.log('❌ العزل غير مطبق بشكل صحيح');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

deepAIIsolationTest();
