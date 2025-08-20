const axios = require('axios');

async function simpleAITest() {
  console.log('🔍 اختبار بسيط لـ AI Settings\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // تسجيل الدخول
    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ تسجيل الدخول نجح');

    // اختبار AI Settings
    const response = await axios.get(`${baseURL}/api/v1/settings/ai`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📥 استجابة AI Settings:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

simpleAITest();
