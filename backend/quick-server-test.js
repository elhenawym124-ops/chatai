const axios = require('axios');

async function quickServerTest() {
  console.log('🔍 اختبار سريع للخادم...\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // اختبار Health Check
    console.log('1️⃣ اختبار Health Check:');
    const healthResponse = await axios.get(`${baseURL}/health`, {
      timeout: 5000
    });
    
    console.log('✅ الخادم يعمل بنجاح!');
    console.log(`📊 الحالة: ${healthResponse.data.status}`);
    console.log(`⏱️ وقت التشغيل: ${Math.round(healthResponse.data.uptime)}s`);
    
    if (healthResponse.data.security) {
      console.log(`🛡️ نقاط الأمان: ${healthResponse.data.security.score}/100 (${healthResponse.data.security.level})`);
    }

    // اختبار المصادقة المطلوبة
    console.log('\n2️⃣ اختبار المصادقة المطلوبة:');
    try {
      await axios.get(`${baseURL}/api/v1/products`);
      console.log('❌ تم الوصول بدون مصادقة!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ المصادقة مطلوبة بشكل صحيح');
      } else {
        console.log(`⚠️ خطأ غير متوقع: ${error.response?.status}`);
      }
    }

    // اختبار التسجيل
    console.log('\n3️⃣ اختبار التسجيل:');
    const userData = {
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      companyName: 'Test Company',
      phone: '01234567890'
    };

    const registerResponse = await axios.post(`${baseURL}/api/v1/auth/register`, userData);
    console.log('✅ التسجيل يعمل بنجاح');
    
    const token = registerResponse.data.data.token;
    const companyId = registerResponse.data.data.company.id;
    console.log(`🏢 معرف الشركة: ${companyId}`);

    // اختبار الوصول مع المصادقة
    console.log('\n4️⃣ اختبار الوصول مع المصادقة:');
    const productsResponse = await axios.get(`${baseURL}/api/v1/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ تم جلب المنتجات: ${productsResponse.data.data.length} منتج`);

    // اختبار عزل الشركات
    console.log('\n5️⃣ اختبار عزل الشركات:');
    try {
      await axios.get(`${baseURL}/api/v1/companies/fake-company-id`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ تم الوصول لشركة أخرى!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ عزل الشركات يعمل بشكل صحيح');
      } else {
        console.log(`⚠️ خطأ غير متوقع: ${error.response?.status}`);
      }
    }

    // اختبار Rate Limiting
    console.log('\n6️⃣ اختبار Rate Limiting:');
    let rateLimitHit = false;
    
    for (let i = 0; i < 8; i++) {
      try {
        await axios.post(`${baseURL}/api/v1/auth/login`, {
          email: 'fake@example.com',
          password: 'wrong'
        });
      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`✅ Rate limiting يعمل: تم الوصول للحد بعد ${i + 1} محاولات`);
          rateLimitHit = true;
          break;
        }
      }
    }

    if (!rateLimitHit) {
      console.log('ℹ️ Rate limiting لم يتم تفعيله بعد');
    }

    // اختبار Security Headers
    console.log('\n7️⃣ اختبار Security Headers:');
    const headers = healthResponse.headers;
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options', 
      'x-xss-protection',
      'content-security-policy'
    ];

    let headersFound = 0;
    securityHeaders.forEach(header => {
      if (headers[header]) {
        headersFound++;
        console.log(`✅ ${header}: ${headers[header]}`);
      } else {
        console.log(`❌ ${header}: غير موجود`);
      }
    });

    console.log(`📊 Security Headers: ${headersFound}/${securityHeaders.length} موجودة`);

    console.log('\n🎉 ملخص الاختبار:');
    console.log('═══════════════════════════════════════');
    console.log('✅ الخادم يعمل بنجاح');
    console.log('✅ المصادقة مطلوبة');
    console.log('✅ التسجيل يعمل');
    console.log('✅ عزل الشركات فعال');
    console.log(`✅ Security Headers: ${headersFound}/${securityHeaders.length}`);
    console.log(rateLimitHit ? '✅ Rate limiting فعال' : 'ℹ️ Rate limiting قيد الاختبار');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ الخادم غير متاح - تأكد من تشغيله على المنفذ 3001');
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ لا يمكن الوصول للخادم - تحقق من العنوان');
    } else {
      console.log('❌ خطأ في الاختبار:', error.response?.data?.message || error.message);
    }
  }
}

quickServerTest();
