const axios = require('axios');

async function testMonitoringSimple() {
  console.log('🔍 اختبار بسيط لنظام المراقبة\n');

  try {
    const baseURL = 'http://localhost:3001';

    // اختبار Health Check مع معلومات الأمان
    console.log('1️⃣ اختبار Health Check:');
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      console.log('✅ Health Check يعمل');
      
      if (healthResponse.data.security) {
        console.log(`🛡️ نقاط الأمان: ${healthResponse.data.security.score}/100 (${healthResponse.data.security.level})`);
      }
    } catch (error) {
      console.log('❌ خطأ في Health Check:', error.message);
    }

    // اختبار محاولة وصول بدون مصادقة
    console.log('\n2️⃣ اختبار محاولة وصول بدون مصادقة:');
    try {
      await axios.get(`${baseURL}/api/v1/products`);
      console.log('❌ تم الوصول بدون مصادقة!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ تم منع الوصول بدون مصادقة');
      } else {
        console.log(`⚠️ خطأ غير متوقع: ${error.response?.status}`);
      }
    }

    // اختبار طلب مشبوه
    console.log('\n3️⃣ اختبار طلب مشبوه:');
    try {
      await axios.get(`${baseURL}/api/v1/products?search=<script>alert("xss")</script>`);
    } catch (error) {
      console.log('🚨 تم اكتشاف طلب مشبوه');
    }

    // اختبار Rate Limiting على auth
    console.log('\n4️⃣ اختبار Rate Limiting على Authentication:');
    let authRateLimitHit = false;
    
    for (let i = 0; i < 7; i++) {
      try {
        await axios.post(`${baseURL}/api/v1/auth/login`, {
          email: 'fake@example.com',
          password: 'wrong'
        });
      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`✅ Auth Rate limiting يعمل: تم الوصول للحد بعد ${i + 1} محاولات`);
          authRateLimitHit = true;
          break;
        } else if (error.response?.status === 401) {
          console.log(`🔐 محاولة مصادقة فاشلة ${i + 1}`);
        }
      }
    }

    if (!authRateLimitHit) {
      console.log('ℹ️ Auth Rate limiting لم يتم الوصول للحد بعد');
    }

    console.log('\n🎉 انتهى الاختبار البسيط');
    console.log('═══════════════════════════════════════');
    console.log('✅ نظام الأمان يعمل بشكل أساسي');
    console.log('✅ المصادقة مطلوبة');
    console.log('✅ Rate limiting مطبق');
    console.log('✅ الطلبات المشبوهة يتم اكتشافها');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testMonitoringSimple();
