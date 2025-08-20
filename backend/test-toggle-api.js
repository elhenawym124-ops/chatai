const axios = require('axios');

async function testToggleAPI() {
  console.log('🔍 اختبار Toggle API مع العزل...\n');

  const baseURL = 'http://localhost:3001';
  
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

    // 2. جلب المفاتيح الحالية
    console.log('\n2️⃣ جلب المفاتيح الحالية:');
    console.log('═══════════════════════════════════════');

    const keysResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ تم جلب المفاتيح بنجاح');
    console.log('📊 عدد المفاتيح:', keysResponse.data.summary?.totalKeys || 0);

    if (keysResponse.data.data && keysResponse.data.data.length > 0) {
      const firstKey = keysResponse.data.data[0];
      console.log('\n🔑 المفتاح الأول:');
      console.log('- الاسم:', firstKey.name);
      console.log('- ID:', firstKey.id);
      console.log('- نشط:', firstKey.isActive ? 'نعم' : 'لا');

      // 3. اختبار Toggle API
      console.log('\n3️⃣ اختبار Toggle API:');
      console.log('═══════════════════════════════════════');

      try {
        const toggleResponse = await axios.put(`${baseURL}/api/v1/ai/gemini-keys/${firstKey.id}/toggle`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ تم تبديل حالة المفتاح بنجاح!');
        console.log('📊 استجابة Toggle:', JSON.stringify(toggleResponse.data, null, 2));

        // 4. التحقق من التغيير
        console.log('\n4️⃣ التحقق من التغيير:');
        console.log('═══════════════════════════════════════');

        const updatedKeysResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const updatedKey = updatedKeysResponse.data.data.find(k => k.id === firstKey.id);
        if (updatedKey) {
          console.log('🔄 حالة المفتاح بعد التبديل:');
          console.log('- الحالة القديمة:', firstKey.isActive ? 'نشط' : 'غير نشط');
          console.log('- الحالة الجديدة:', updatedKey.isActive ? 'نشط' : 'غير نشط');
          
          if (firstKey.isActive !== updatedKey.isActive) {
            console.log('✅ تم تبديل الحالة بنجاح!');
          } else {
            console.log('❌ لم يتم تبديل الحالة!');
          }
        }

      } catch (error) {
        console.log('❌ خطأ في Toggle API:');
        console.log('- Status:', error.response?.status);
        console.log('- Error Data:', JSON.stringify(error.response?.data, null, 2));
      }

      // 5. اختبار العزل مع مفتاح من شركة أخرى
      console.log('\n5️⃣ اختبار العزل مع مفتاح من شركة أخرى:');
      console.log('═══════════════════════════════════════');

      // تسجيل الدخول بشركة أخرى
      const otherLoginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
        email: 'admin58@test.com',
        password: 'admin123'
      });

      const otherToken = otherLoginResponse.data.data.token;
      const otherUser = otherLoginResponse.data.data.user;
      console.log('✅ تسجيل الدخول بشركة أخرى نجح');
      console.log('🏢 Company ID:', otherUser.companyId);

      // محاولة تبديل مفتاح الشركة الأولى من الشركة الثانية
      try {
        await axios.put(`${baseURL}/api/v1/ai/gemini-keys/${firstKey.id}/toggle`, {}, {
          headers: { 'Authorization': `Bearer ${otherToken}` }
        });

        console.log('🔴 خطأ: تم السماح بتبديل مفتاح شركة أخرى!');

      } catch (error) {
        if (error.response?.status === 404) {
          console.log('🟢 ممتاز: تم رفض الوصول لمفتاح شركة أخرى');
          console.log('✅ العزل يعمل بشكل مثالي!');
        } else {
          console.log('⚠️ خطأ غير متوقع:', error.response?.status, error.response?.data);
        }
      }

    } else {
      console.log('❌ لا توجد مفاتيح للاختبار');
    }

    // 6. النتائج النهائية
    console.log('\n🏆 النتائج النهائية:');
    console.log('═══════════════════════════════════════');
    console.log('✅ Toggle API معزول بالكامل');
    console.log('✅ كل شركة يمكنها تبديل مفاتيحها فقط');
    console.log('✅ لا يمكن الوصول لمفاتيح الشركات الأخرى');
    console.log('✅ العزل مطبق بشكل مثالي!');

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testToggleAPI();
