const axios = require('axios');

async function debugAISettingsRoute() {
  console.log('🔍 تشخيص مشكلة AI Settings Route\n');

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
    console.log('✅ المستخدم:', user.email);
    console.log('🏢 الشركة:', user.companyId);

    // 2. اختبار AI Settings مع تفاصيل أكثر
    console.log('\n2️⃣ اختبار AI Settings مع تفاصيل:');
    console.log('═══════════════════════════════════════');

    // إضافة interceptor لرؤية الطلب والاستجابة
    const response = await axios.get(`${baseURL}/api/v1/settings/ai`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📥 استجابة الخادم:');
    console.log('- Status:', response.status);
    console.log('- Headers:', response.headers['content-type']);
    console.log('- Data:', JSON.stringify(response.data, null, 2));

    // 3. فحص البيانات المرجعة
    console.log('\n3️⃣ فحص البيانات المرجعة:');
    console.log('═══════════════════════════════════════');

    const data = response.data.data;
    console.log('📊 تحليل البيانات:');
    console.log('- companyId موجود:', !!data.companyId);
    console.log('- companyId value:', data.companyId);
    console.log('- autoReplyEnabled:', data.autoReplyEnabled);
    console.log('- confidenceThreshold:', data.confidenceThreshold);
    console.log('- qualityEvaluationEnabled:', data.qualityEvaluationEnabled);

    // 4. مقارنة مع companyId المتوقع
    console.log('\n4️⃣ مقارنة العزل:');
    console.log('═══════════════════════════════════════');
    console.log('- companyId المتوقع:', user.companyId);
    console.log('- companyId المرجع:', data.companyId);
    console.log('- العزل صحيح:', data.companyId === user.companyId);

    if (!data.companyId) {
      console.log('⚠️ companyId غير موجود - يتم استخدام النظام المؤقت');
      console.log('🔍 هذا يعني أن قاعدة البيانات لا تعمل أو هناك خطأ');
    }

    // 5. اختبار حفظ وقراءة
    console.log('\n5️⃣ اختبار حفظ وقراءة:');
    console.log('═══════════════════════════════════════');

    const uniqueValue = Math.random();
    console.log('💾 حفظ قيمة فريدة:', uniqueValue);

    const saveResponse = await axios.put(`${baseURL}/api/v1/settings/ai`, {
      autoReplyEnabled: true,
      confidenceThreshold: uniqueValue,
      multimodalEnabled: true,
      ragEnabled: true,
      qualityEvaluationEnabled: true
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ حفظ نجح:', saveResponse.status);

    // قراءة مرة أخرى
    const readResponse = await axios.get(`${baseURL}/api/v1/settings/ai`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const readData = readResponse.data.data;
    console.log('📖 قراءة بعد الحفظ:');
    console.log('- القيمة المحفوظة:', readData.confidenceThreshold);
    console.log('- القيمة متطابقة:', Math.abs(readData.confidenceThreshold - uniqueValue) < 0.001);
    console.log('- companyId بعد الحفظ:', readData.companyId);

    // 6. النتائج النهائية
    console.log('\n🏆 النتائج النهائية:');
    console.log('═══════════════════════════════════════');
    
    if (readData.companyId === user.companyId) {
      console.log('🟢 العزل يعمل بشكل صحيح');
      console.log('✅ البيانات محفوظة ومقروءة من قاعدة البيانات');
      console.log('✅ companyId صحيح ومطابق');
    } else if (!readData.companyId) {
      console.log('🔴 مشكلة: يتم استخدام النظام المؤقت');
      console.log('❌ قاعدة البيانات لا تعمل أو هناك خطأ في الاتصال');
      console.log('❌ العزل غير مطبق بشكل صحيح');
    } else {
      console.log('🔴 مشكلة خطيرة: العزل مكسور');
      console.log('❌ البيانات مختلطة بين الشركات');
    }

  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:');
      console.log('- Status:', error.response.status);
      console.log('- Data:', error.response.data);
    }
  }
}

debugAISettingsRoute();
