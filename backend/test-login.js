const axios = require('axios');

async function testLogin() {
  console.log('🔐 اختبار تسجيل الدخول...\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // اختبار تسجيل الدخول
    console.log('1️⃣ محاولة تسجيل الدخول:');
    console.log('═══════════════════════════════════════');

    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    console.log('✅ تسجيل الدخول نجح!');
    console.log('📊 استجابة تسجيل الدخول:', {
      success: loginResponse.data.success,
      user: loginResponse.data.data.user.email,
      companyId: loginResponse.data.data.user.companyId,
      tokenLength: loginResponse.data.data.token.length
    });

    const token = loginResponse.data.data.token;

    // اختبار /auth/me
    console.log('\n2️⃣ اختبار /auth/me:');
    console.log('═══════════════════════════════════════');

    const meResponse = await axios.get(`${baseURL}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ /auth/me يعمل بشكل صحيح!');
    console.log('📊 بيانات المستخدم:', {
      email: meResponse.data.data.email,
      companyId: meResponse.data.data.companyId,
      role: meResponse.data.data.role
    });

    // اختبار Facebook APIs
    console.log('\n3️⃣ اختبار Facebook APIs مع Token:');
    console.log('═══════════════════════════════════════');

    const facebookResponse = await axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Facebook API يعمل مع Token!');
    console.log('📊 Facebook Pages:', {
      success: facebookResponse.data.success,
      companyId: facebookResponse.data.companyId,
      pagesCount: facebookResponse.data.pages?.length || 0
    });

    console.log('\n🎉 جميع APIs تعمل بشكل صحيح!');
    console.log('💡 المشكلة في Frontend - المستخدم يحتاج لتسجيل الدخول');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', {
        status: error.response.status,
        data: error.response.data
      });
    }
  }
}

testLogin();
