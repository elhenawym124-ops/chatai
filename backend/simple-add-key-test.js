const axios = require('axios');

async function simpleAddKeyTest() {
  console.log('🔍 اختبار بسيط لإضافة مفتاح...');

  try {
    // تسجيل الدخول
    const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ تسجيل الدخول نجح');

    // إضافة مفتاح تجريبي
    const addKeyResponse = await axios.post('http://localhost:3001/api/v1/ai/gemini-keys', {
      name: 'مفتاح تجريبي',
      apiKey: 'AIzaSyTest_Key_For_Testing_123456789',
      description: 'مفتاح للاختبار'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ تم إضافة المفتاح:', addKeyResponse.data);

  } catch (error) {
    console.log('❌ خطأ:', error.response?.data || error.message);
  }
}

simpleAddKeyTest();
