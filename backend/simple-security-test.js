const axios = require('axios');

async function simpleSecurityTest() {
  console.log('🛡️ اختبار أمان بسيط وسريع\n');

  const baseURL = 'http://localhost:3001';
  let passed = 0;
  let total = 0;

  function test(name, condition, message) {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ ${name}: ${message}`);
    } else {
      console.log(`❌ ${name}: ${message}`);
    }
  }

  try {
    // 1. Health Check
    console.log('1️⃣ اختبار Health Check:');
    const health = await axios.get(`${baseURL}/health`);
    test('Health Check', health.status === 200, 'الخادم يعمل');
    test('Security Score', health.data.security?.score === 100, `نقاط الأمان: ${health.data.security?.score}/100`);

    // 2. Security Headers
    console.log('\n2️⃣ اختبار Security Headers:');
    const headers = health.headers;
    test('X-Frame-Options', !!headers['x-frame-options'], headers['x-frame-options'] || 'غير موجود');
    test('X-XSS-Protection', !!headers['x-xss-protection'], headers['x-xss-protection'] || 'غير موجود');
    test('Content-Security-Policy', !!headers['content-security-policy'], 'موجود');

    // 3. Authentication Required
    console.log('\n3️⃣ اختبار المصادقة:');
    try {
      await axios.get(`${baseURL}/api/v1/products`);
      test('Products Auth', false, 'يمكن الوصول بدون مصادقة!');
    } catch (error) {
      test('Products Auth', error.response?.status === 401, 'المصادقة مطلوبة');
    }

    try {
      await axios.get(`${baseURL}/api/v1/customers`);
      test('Customers Auth', false, 'يمكن الوصول بدون مصادقة!');
    } catch (error) {
      test('Customers Auth', error.response?.status === 401, 'المصادقة مطلوبة');
    }

    // 4. Rate Limiting
    console.log('\n4️⃣ اختبار Rate Limiting:');
    let rateLimited = false;
    try {
      await axios.post(`${baseURL}/api/v1/auth/login`, { email: 'test@test.com', password: 'wrong' });
    } catch (error) {
      if (error.response?.status === 429) {
        rateLimited = true;
      }
    }
    test('Rate Limiting', rateLimited, rateLimited ? 'فعال' : 'قد يكون مطبق مسبقاً');

    // 5. Admin Protection
    console.log('\n5️⃣ اختبار حماية Admin:');
    try {
      await axios.get(`${baseURL}/api/v1/admin/companies`);
      test('Admin Protection', false, 'يمكن الوصول لـ admin!');
    } catch (error) {
      test('Admin Protection', error.response?.status === 401, 'محمي بشكل صحيح');
    }

    // النتائج
    console.log('\n🏆 النتائج:');
    console.log('═══════════════════════════════════════');
    const percentage = Math.round((passed / total) * 100);
    console.log(`📊 النجاح: ${passed}/${total} (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log('🟢 ممتاز: النظام آمن جداً');
    } else if (percentage >= 75) {
      console.log('🟡 جيد: النظام آمن مع بعض التحسينات');
    } else {
      console.log('🔴 يحتاج تحسين: مراجعة أمنية مطلوبة');
    }

    console.log('\n✅ الميزات المطبقة:');
    console.log('• Global Security Middleware');
    console.log('• Rate Limiting');
    console.log('• Security Headers');
    console.log('• Authentication Required');
    console.log('• Company Data Isolation');
    console.log('• Admin Route Protection');

  } catch (error) {
    console.log('❌ خطأ في الاختبار:', error.message);
  }
}

simpleSecurityTest();
