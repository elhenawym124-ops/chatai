const axios = require('axios');

async function testRealGeminiKey() {
  console.log('🔍 اختبار إضافة مفتاح Gemini حقيقي مع العزل...\n');

  const baseURL = 'http://localhost:3001';
  const realApiKey = 'AIzaSyDfva6184QKvdAMRey3Pp6oKdFHdpxrr-U';
  
  try {
    // 1. تسجيل الدخول
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

    // 2. فحص المفاتيح الحالية
    console.log('\n2️⃣ فحص المفاتيح الحالية:');
    console.log('═══════════════════════════════════════');

    try {
      const currentKeysResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('✅ تم جلب المفاتيح الحالية');
      console.log('📊 عدد المفاتيح:', currentKeysResponse.data.summary?.totalKeys || 0);
      console.log('🏢 Company ID:', currentKeysResponse.data.companyId);

      if (currentKeysResponse.data.data && currentKeysResponse.data.data.length > 0) {
        console.log('\n🔑 المفاتيح الموجودة:');
        currentKeysResponse.data.data.forEach((key, index) => {
          console.log(`${index + 1}. ${key.name}`);
          console.log(`   🆔 ID: ${key.id}`);
          console.log(`   ✅ نشط: ${key.isActive ? 'نعم' : 'لا'}`);
        });
      }

    } catch (error) {
      console.log('❌ خطأ في جلب المفاتيح الحالية:', error.response?.data);
    }

    // 3. إضافة مفتاح حقيقي جديد
    console.log('\n3️⃣ إضافة مفتاح حقيقي جديد:');
    console.log('═══════════════════════════════════════');

    try {
      console.log('🔑 إضافة مفتاح Gemini حقيقي...');
      console.log('🔐 API Key:', realApiKey.substring(0, 20) + '...');

      const addKeyResponse = await axios.post(`${baseURL}/api/v1/ai/gemini-keys`, {
        name: 'مفتاح Gemini حقيقي - اختبار العزل',
        apiKey: realApiKey,
        description: 'مفتاح حقيقي لاختبار العزل بين الشركات'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('✅ تم إضافة المفتاح بنجاح!');
      console.log('📊 استجابة الخادم:', JSON.stringify(addKeyResponse.data, null, 2));

    } catch (error) {
      console.log('❌ خطأ في إضافة المفتاح:');
      console.log('- Status:', error.response?.status);
      console.log('- Status Text:', error.response?.statusText);
      console.log('- Error Data:', JSON.stringify(error.response?.data, null, 2));
      console.log('- Error Message:', error.message);
      
      if (error.response?.data?.details) {
        console.log('- Server Details:', error.response.data.details);
      }
    }

    // 4. فحص المفاتيح بعد الإضافة
    console.log('\n4️⃣ فحص المفاتيح بعد الإضافة:');
    console.log('═══════════════════════════════════════');

    try {
      const finalKeysResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('✅ تم جلب المفاتيح النهائية');
      console.log('📊 عدد المفاتيح:', finalKeysResponse.data.summary?.totalKeys || 0);
      console.log('🏢 Company ID:', finalKeysResponse.data.companyId);

      if (finalKeysResponse.data.data && finalKeysResponse.data.data.length > 0) {
        console.log('\n🔑 جميع المفاتيح:');
        finalKeysResponse.data.data.forEach((key, index) => {
          console.log(`${index + 1}. ${key.name}`);
          console.log(`   🆔 ID: ${key.id}`);
          console.log(`   🔐 API Key: ${key.apiKey || 'مخفي'}`);
          console.log(`   ✅ نشط: ${key.isActive ? 'نعم' : 'لا'}`);
          console.log(`   🏢 Company ID: ${key.companyId || 'غير محدد'}`);
          console.log('   ─'.repeat(40));
        });
      }

    } catch (error) {
      console.log('❌ خطأ في جلب المفاتيح النهائية:', error.response?.data);
    }

    // 5. اختبار العزل مع شركة أخرى
    console.log('\n5️⃣ اختبار العزل مع شركة أخرى:');
    console.log('═══════════════════════════════════════');

    try {
      // تسجيل الدخول بشركة أخرى
      const company2LoginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
        email: 'company1@test.com',
        password: 'password123'
      });

      const token2 = company2LoginResponse.data.data.token;
      const user2 = company2LoginResponse.data.data.user;
      console.log('✅ تسجيل الدخول نجح للشركة الثانية');
      console.log('🏢 Company ID:', user2.companyId);

      // فحص مفاتيح الشركة الثانية
      const company2KeysResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
        headers: { 'Authorization': `Bearer ${token2}` }
      });

      console.log('\n📊 مفاتيح الشركة الثانية:');
      console.log('- عدد المفاتيح:', company2KeysResponse.data.summary?.totalKeys || 0);
      console.log('- Company ID:', company2KeysResponse.data.companyId);

      if (company2KeysResponse.data.data && company2KeysResponse.data.data.length > 0) {
        console.log('\n🔑 مفاتيح الشركة الثانية:');
        company2KeysResponse.data.data.forEach((key, index) => {
          console.log(`${index + 1}. ${key.name} - Company: ${key.companyId}`);
        });
      } else {
        console.log('📭 لا توجد مفاتيح للشركة الثانية (هذا صحيح!)');
      }

      // 6. التحقق من العزل النهائي
      console.log('\n6️⃣ التحقق من العزل النهائي:');
      console.log('═══════════════════════════════════════');

      const company1Keys = finalKeysResponse.data.summary?.totalKeys || 0;
      const company2Keys = company2KeysResponse.data.summary?.totalKeys || 0;
      const company1Id = user.companyId;
      const company2Id = user2.companyId;

      console.log('📊 ملخص العزل:');
      console.log(`- الشركة الأولى (${company1Id}): ${company1Keys} مفتاح`);
      console.log(`- الشركة الثانية (${company2Id}): ${company2Keys} مفتاح`);

      if (company1Id !== company2Id && company1Keys > company2Keys) {
        console.log('\n🟢 العزل يعمل بشكل مثالي!');
        console.log('✅ كل شركة لها مفاتيحها المنفصلة');
        console.log('✅ المفتاح الجديد أضيف للشركة الصحيحة فقط');
        console.log('✅ لا يوجد تداخل في البيانات');
      } else {
        console.log('\n🔴 مشكلة في العزل!');
        console.log('❌ هناك تداخل في المفاتيح بين الشركات');
      }

    } catch (error) {
      console.log('❌ خطأ في اختبار العزل:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testRealGeminiKey();
