const axios = require('axios');

async function testAddGeminiKey() {
  console.log('🔍 اختبار إضافة مفتاح Gemini...\n');

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

    // 2. اختبار إضافة مفتاح جديد
    console.log('\n2️⃣ اختبار إضافة مفتاح جديد:');
    console.log('═══════════════════════════════════════');

    try {
      const addKeyResponse = await axios.post(`${baseURL}/api/v1/ai/gemini-keys`, {
        name: 'مفتاح تجريبي جديد',
        apiKey: 'AIzaSyDummy_Test_Key_For_Testing_12345678901234567890123456789012345',
        description: 'مفتاح تجريبي للاختبار'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('✅ تم إضافة المفتاح بنجاح');
      console.log('📊 استجابة الخادم:', addKeyResponse.data);

    } catch (error) {
      console.log('❌ خطأ في إضافة المفتاح:');
      console.log('- Status:', error.response?.status);
      console.log('- Status Text:', error.response?.statusText);
      console.log('- Error Data:', error.response?.data);
      console.log('- Error Message:', error.message);
      
      if (error.response?.data?.error) {
        console.log('- Server Error:', error.response.data.error);
      }
    }

    // 3. اختبار جلب المفاتيح الحالية
    console.log('\n3️⃣ اختبار جلب المفاتيح الحالية:');
    console.log('═══════════════════════════════════════');

    try {
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

    } catch (error) {
      console.log('❌ خطأ في جلب المفاتيح:');
      console.log('- Status:', error.response?.status);
      console.log('- Error Data:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testAddGeminiKey();
