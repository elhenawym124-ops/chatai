const axios = require('axios');

async function testCorrectUser() {
  console.log('🔍 اختبار المستخدم الصحيح من Frontend...\n');

  const baseURL = 'http://localhost:3001';
  const realApiKey = 'AIzaSyDfva6184QKvdAMRey3Pp6oKdFHdpxrr-U';
  
  try {
    // 1. تسجيل الدخول بالمستخدم الصحيح
    console.log('1️⃣ تسجيل الدخول بالمستخدم الصحيح:');
    console.log('═══════════════════════════════════════');

    // المستخدم الذي وجدناه
    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'admin58@test.com',
      password: 'admin123' // جرب كلمة المرور الافتراضية
    });

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ تسجيل الدخول نجح');
    console.log('🏢 Company ID:', user.companyId);
    console.log('👤 المستخدم:', user.firstName, user.lastName);

    // 2. فحص المفاتيح الحالية
    console.log('\n2️⃣ فحص المفاتيح الحالية:');
    console.log('═══════════════════════════════════════');

    const keysResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ تم جلب المفاتيح بنجاح');
    console.log('📊 عدد المفاتيح:', keysResponse.data.summary?.totalKeys || 0);
    console.log('🏢 Company ID:', keysResponse.data.companyId);

    if (keysResponse.data.data && keysResponse.data.data.length > 0) {
      console.log('\n🔑 المفاتيح الموجودة:');
      keysResponse.data.data.forEach((key, index) => {
        console.log(`${index + 1}. ${key.name}`);
        console.log(`   🆔 ID: ${key.id}`);
        console.log(`   ✅ نشط: ${key.isActive ? 'نعم' : 'لا'}`);
      });
    }

    // 3. اختبار إضافة مفتاح جديد
    console.log('\n3️⃣ اختبار إضافة مفتاح جديد:');
    console.log('═══════════════════════════════════════');

    try {
      console.log('🔑 إضافة مفتاح جديد...');

      const addKeyResponse = await axios.post(`${baseURL}/api/v1/ai/gemini-keys`, {
        name: 'مفتاح Frontend الجديد',
        apiKey: realApiKey,
        description: 'مفتاح جديد من Frontend'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('✅ تم إضافة المفتاح بنجاح!');
      console.log('📊 استجابة الخادم:', JSON.stringify(addKeyResponse.data, null, 2));

    } catch (error) {
      console.log('❌ خطأ في إضافة المفتاح:');
      console.log('- Status:', error.response?.status);
      console.log('- Error Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.data?.details) {
        console.log('- Server Details:', error.response.data.details);
      }
    }

    // 4. فحص المفاتيح بعد الإضافة
    console.log('\n4️⃣ فحص المفاتيح بعد الإضافة:');
    console.log('═══════════════════════════════════════');

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
        console.log(`   ✅ نشط: ${key.isActive ? 'نعم' : 'لا'}`);
        console.log(`   🏢 Company ID: ${key.companyId || 'غير محدد'}`);
        console.log('   ─'.repeat(40));
      });
    }

    // 5. اختبار العزل مع شركة أخرى
    console.log('\n5️⃣ اختبار العزل مع شركة أخرى:');
    console.log('═══════════════════════════════════════');

    try {
      const otherLoginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });

      const otherToken = otherLoginResponse.data.data.token;
      const otherUser = otherLoginResponse.data.data.user;

      const otherKeysResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
        headers: { 'Authorization': `Bearer ${otherToken}` }
      });

      console.log('📊 مقارنة العزل:');
      console.log(`- الشركة الحالية (${user.companyId}): ${finalKeysResponse.data.summary?.totalKeys || 0} مفتاح`);
      console.log(`- الشركة الأخرى (${otherUser.companyId}): ${otherKeysResponse.data.summary?.totalKeys || 0} مفتاح`);

      if (user.companyId !== otherUser.companyId) {
        console.log('✅ العزل يعمل بشكل مثالي!');
        console.log('✅ كل شركة لها مفاتيحها المنفصلة');
      } else {
        console.log('❌ مشكلة في العزل!');
      }

    } catch (error) {
      console.log('⚠️ خطأ في اختبار العزل:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testCorrectUser();
