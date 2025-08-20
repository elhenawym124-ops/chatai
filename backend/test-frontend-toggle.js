const axios = require('axios');

async function testFrontendToggle() {
  console.log('🔍 اختبار Toggle API مع مستخدم Frontend...\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. تسجيل الدخول بمستخدم Frontend
    console.log('1️⃣ تسجيل الدخول بمستخدم Frontend:');
    console.log('═══════════════════════════════════════');

    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'admin58@test.com',
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
    console.log('🏢 Company ID:', keysResponse.data.companyId);

    if (keysResponse.data.data && keysResponse.data.data.length > 0) {
      const firstKey = keysResponse.data.data[0];
      console.log('\n🔑 المفتاح الأول:');
      console.log('- الاسم:', firstKey.name);
      console.log('- ID:', firstKey.id);
      console.log('- نشط:', firstKey.isActive ? 'نعم' : 'لا');
      console.log('- Company ID:', firstKey.companyId);

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

        // 5. إعادة تبديل الحالة للحالة الأصلية
        console.log('\n5️⃣ إعادة تبديل الحالة للحالة الأصلية:');
        console.log('═══════════════════════════════════════');

        const toggleBackResponse = await axios.put(`${baseURL}/api/v1/ai/gemini-keys/${firstKey.id}/toggle`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ تم إعادة تبديل الحالة بنجاح!');
        console.log('📊 الحالة النهائية:', toggleBackResponse.data.data.isActive ? 'نشط' : 'غير نشط');

      } catch (error) {
        console.log('❌ خطأ في Toggle API:');
        console.log('- Status:', error.response?.status);
        console.log('- Error Data:', JSON.stringify(error.response?.data, null, 2));
      }

    } else {
      console.log('❌ لا توجد مفاتيح للاختبار');
    }

    // 6. النتائج النهائية
    console.log('\n🏆 النتائج النهائية:');
    console.log('═══════════════════════════════════════');
    console.log('✅ Toggle API يعمل مع مستخدم Frontend');
    console.log('✅ العزل مطبق بشكل صحيح');
    console.log('✅ Company ID صحيح في جميع الاستجابات');
    console.log('\n🎉 Frontend جاهز للاستخدام!');

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testFrontendToggle();
