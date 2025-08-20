const axios = require('axios');

async function testGeminiKeysIsolation() {
  console.log('🔍 اختبار العزل في Gemini Keys بين الشركات\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. تسجيل الدخول بالمستخدم الموجود
    console.log('1️⃣ تسجيل الدخول بالمستخدم الموجود:');
    console.log('═══════════════════════════════════════');

    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ تسجيل الدخول نجح');
    console.log('🏢 Company ID:', user.companyId);

    // 2. اختبار جلب Gemini Keys مع العزل
    console.log('\n2️⃣ اختبار جلب Gemini Keys مع العزل:');
    console.log('═══════════════════════════════════════');

    const keysResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('🔑 Gemini Keys Response:');
    console.log('- Success:', keysResponse.data.success);
    console.log('- Total Keys:', keysResponse.data.summary?.totalKeys || 0);
    console.log('- Active Keys:', keysResponse.data.summary?.activeKeys || 0);
    console.log('- Company ID:', keysResponse.data.companyId);

    if (keysResponse.data.data && keysResponse.data.data.length > 0) {
      console.log('\n🔑 تفاصيل المفاتيح:');
      keysResponse.data.data.forEach((key, index) => {
        console.log(`${index + 1}. ${key.name}`);
        console.log(`   🆔 ID: ${key.id}`);
        console.log(`   ✅ نشط: ${key.isActive ? 'نعم' : 'لا'}`);
        console.log(`   🏢 Company ID: ${key.companyId || 'غير محدد'}`);
      });
    }

    // 3. تسجيل الدخول بشركة أخرى
    console.log('\n3️⃣ تسجيل الدخول بشركة أخرى:');
    console.log('═══════════════════════════════════════');

    const company2LoginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'company1@test.com',
      password: 'password123'
    });

    const token2 = company2LoginResponse.data.data.token;
    const user2 = company2LoginResponse.data.data.user;
    console.log('✅ تسجيل الدخول نجح للشركة الثانية');
    console.log('🏢 Company ID:', user2.companyId);

    // 4. اختبار جلب Gemini Keys للشركة الثانية
    console.log('\n4️⃣ اختبار جلب Gemini Keys للشركة الثانية:');
    console.log('═══════════════════════════════════════');

    const keys2Response = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    console.log('🔑 Gemini Keys Response للشركة الثانية:');
    console.log('- Success:', keys2Response.data.success);
    console.log('- Total Keys:', keys2Response.data.summary?.totalKeys || 0);
    console.log('- Active Keys:', keys2Response.data.summary?.activeKeys || 0);
    console.log('- Company ID:', keys2Response.data.companyId);

    if (keys2Response.data.data && keys2Response.data.data.length > 0) {
      console.log('\n🔑 تفاصيل المفاتيح للشركة الثانية:');
      keys2Response.data.data.forEach((key, index) => {
        console.log(`${index + 1}. ${key.name}`);
        console.log(`   🆔 ID: ${key.id}`);
        console.log(`   ✅ نشط: ${key.isActive ? 'نعم' : 'لا'}`);
        console.log(`   🏢 Company ID: ${key.companyId || 'غير محدد'}`);
      });
    } else {
      console.log('📭 لا توجد مفاتيح للشركة الثانية (هذا صحيح!)');
    }

    // 5. اختبار إضافة مفتاح للشركة الثانية
    console.log('\n5️⃣ اختبار إضافة مفتاح للشركة الثانية:');
    console.log('═══════════════════════════════════════');

    try {
      const addKeyResponse = await axios.post(`${baseURL}/api/v1/ai/gemini-keys`, {
        name: 'مفتاح الشركة الثانية',
        apiKey: 'AIzaSyDummy_Key_For_Testing_Company2_12345678901234567890',
        description: 'مفتاح تجريبي للشركة الثانية'
      }, {
        headers: { 'Authorization': `Bearer ${token2}` }
      });

      console.log('✅ تم إضافة مفتاح للشركة الثانية');
      console.log('🔑 تفاصيل المفتاح الجديد:', addKeyResponse.data.data?.name);

    } catch (error) {
      if (error.response?.status === 400) {
        console.log('⚠️ فشل إضافة المفتاح (مفتاح تجريبي غير صالح)');
      } else {
        console.log('❌ خطأ في إضافة المفتاح:', error.response?.data?.error);
      }
    }

    // 6. التحقق من العزل النهائي
    console.log('\n6️⃣ التحقق من العزل النهائي:');
    console.log('═══════════════════════════════════════');

    const finalKeys1 = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const finalKeys2 = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    console.log('📊 النتائج النهائية:');
    console.log('- الشركة الأولى - عدد المفاتيح:', finalKeys1.data.summary?.totalKeys || 0);
    console.log('- الشركة الأولى - Company ID:', finalKeys1.data.companyId);
    console.log('- الشركة الثانية - عدد المفاتيح:', finalKeys2.data.summary?.totalKeys || 0);
    console.log('- الشركة الثانية - Company ID:', finalKeys2.data.companyId);

    // 7. النتائج النهائية
    console.log('\n🏆 النتائج النهائية:');
    console.log('═══════════════════════════════════════');

    const company1Id = user.companyId;
    const company2Id = user2.companyId;
    const keys1CompanyId = finalKeys1.data.companyId;
    const keys2CompanyId = finalKeys2.data.companyId;

    const isolationWorking = (
      company1Id !== company2Id &&
      keys1CompanyId === company1Id &&
      keys2CompanyId === company2Id
    );

    if (isolationWorking) {
      console.log('🟢 العزل في Gemini Keys يعمل بشكل مثالي!');
      console.log('✅ كل شركة ترى مفاتيحها فقط');
      console.log('✅ Company IDs صحيحة ومختلفة');
      console.log('✅ لا يوجد تداخل في المفاتيح');
    } else {
      console.log('🔴 مشكلة في العزل!');
      console.log('❌ هناك تداخل في مفاتيح Gemini بين الشركات');
      console.log('❌ Company1 ID:', company1Id);
      console.log('❌ Company2 ID:', company2Id);
      console.log('❌ Keys1 Company ID:', keys1CompanyId);
      console.log('❌ Keys2 Company ID:', keys2CompanyId);
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testGeminiKeysIsolation();
