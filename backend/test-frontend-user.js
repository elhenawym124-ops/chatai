const axios = require('axios');

async function testFrontendUser() {
  console.log('🔍 اختبار المستخدم من Frontend...\n');

  const baseURL = 'http://localhost:3001';
  const realApiKey = 'AIzaSyDfva6184QKvdAMRey3Pp6oKdFHdpxrr-U';
  
  try {
    // 1. تسجيل الدخول بنفس المستخدم من Frontend
    console.log('1️⃣ تسجيل الدخول بمستخدم Frontend:');
    console.log('═══════════════════════════════════════');

    // هذا هو Company ID الذي يظهر في Frontend logs
    const frontendCompanyId = 'cme94iuhd001wuficyc0we6l9';
    
    // البحث عن المستخدم بهذا Company ID
    console.log('🔍 البحث عن مستخدم بـ Company ID:', frontendCompanyId);

    // محاولة تسجيل الدخول بمستخدمين مختلفين
    const users = [
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'company1@test.com', password: 'password123' },
      { email: 'company2@test.com', password: 'password123' }
    ];

    let correctUser = null;
    let correctToken = null;

    for (const user of users) {
      try {
        const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, user);
        const userData = loginResponse.data.data.user;
        const token = loginResponse.data.data.token;
        
        console.log(`👤 ${user.email} - Company ID: ${userData.companyId}`);
        
        if (userData.companyId === frontendCompanyId) {
          correctUser = userData;
          correctToken = token;
          console.log('✅ وجدت المستخدم الصحيح!');
          break;
        }
      } catch (error) {
        console.log(`❌ فشل تسجيل الدخول لـ ${user.email}`);
      }
    }

    if (!correctUser) {
      console.log('❌ لم يتم العثور على المستخدم الصحيح');
      return;
    }

    // 2. اختبار جلب المفاتيح الحالية
    console.log('\n2️⃣ اختبار جلب المفاتيح الحالية:');
    console.log('═══════════════════════════════════════');

    try {
      const keysResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
        headers: { 'Authorization': `Bearer ${correctToken}` }
      });

      console.log('✅ تم جلب المفاتيح بنجاح');
      console.log('📊 عدد المفاتيح:', keysResponse.data.summary?.totalKeys || 0);
      console.log('🏢 Company ID:', keysResponse.data.companyId);

    } catch (error) {
      console.log('❌ خطأ في جلب المفاتيح:', error.response?.data);
    }

    // 3. اختبار إضافة مفتاح جديد
    console.log('\n3️⃣ اختبار إضافة مفتاح جديد:');
    console.log('═══════════════════════════════════════');

    try {
      console.log('🔑 إضافة مفتاح جديد...');

      const addKeyResponse = await axios.post(`${baseURL}/api/v1/ai/gemini-keys`, {
        name: 'مفتاح من Frontend Test',
        apiKey: realApiKey,
        description: 'مفتاح تجريبي من Frontend'
      }, {
        headers: { 'Authorization': `Bearer ${correctToken}` }
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

    try {
      const finalKeysResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`, {
        headers: { 'Authorization': `Bearer ${correctToken}` }
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
          console.log('   ─'.repeat(40));
        });
      }

    } catch (error) {
      console.log('❌ خطأ في جلب المفاتيح النهائية:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testFrontendUser();
