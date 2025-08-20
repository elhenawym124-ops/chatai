const axios = require('axios');

async function testNewRateLimits() {
  console.log('🔧 اختبار إعدادات Rate Limiting الجديدة\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // اختبار Health Check أولاً
    console.log('1️⃣ اختبار Health Check:');
    const health = await axios.get(`${baseURL}/health`);
    console.log(`✅ الخادم يعمل - البيئة: ${health.data.environment}`);
    console.log(`🛡️ نقاط الأمان: ${health.data.security?.score}/100`);

    // اختبار Rate Limiting الجديد
    console.log('\n2️⃣ اختبار Rate Limiting الجديد:');
    console.log('محاولة تسجيل دخول متعددة...');
    
    let attempts = 0;
    let rateLimitHit = false;
    let lastError = null;

    // محاولة حتى 25 مرة أو حتى نصل للحد
    for (let i = 1; i <= 25; i++) {
      try {
        await axios.post(`${baseURL}/api/v1/auth/login`, {
          email: 'test@example.com',
          password: 'wrongpassword'
        });
        
        console.log(`✅ محاولة ${i}: نجحت (غير متوقع)`);
        attempts++;
        
      } catch (error) {
        attempts++;
        
        if (error.response?.status === 429) {
          console.log(`🚫 محاولة ${i}: تم الوصول للحد الأقصى!`);
          console.log(`📊 الرسالة: ${error.response.data.message}`);
          rateLimitHit = true;
          lastError = error.response.data;
          break;
        } else if (error.response?.status === 401) {
          console.log(`🔐 محاولة ${i}: مصادقة فاشلة (متوقع)`);
        } else {
          console.log(`⚠️ محاولة ${i}: خطأ غير متوقع (${error.response?.status})`);
        }
      }
      
      // انتظار قصير بين المحاولات
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // تحليل النتائج
    console.log('\n📊 تحليل النتائج:');
    console.log('═══════════════════════════════════════');
    
    if (rateLimitHit) {
      console.log(`✅ Rate Limiting يعمل بشكل صحيح`);
      console.log(`📈 عدد المحاولات قبل الحظر: ${attempts}`);
      console.log(`⏱️ الرسالة: ${lastError.message}`);
      
      // تحديد نوع الإعدادات بناءً على عدد المحاولات
      if (attempts <= 5) {
        console.log('🔴 إعدادات إنتاج (مشددة): 3-5 محاولات');
      } else if (attempts <= 15) {
        console.log('🟡 إعدادات عادية: 10-15 محاولة');
      } else {
        console.log('🟢 إعدادات تطوير (مرنة): 15+ محاولة');
      }
    } else {
      console.log(`⚠️ لم يتم الوصول للحد بعد ${attempts} محاولة`);
      console.log('قد يكون الحد أعلى من المتوقع أو معطل');
    }

    // اختبار انتظار انتهاء الحظر
    if (rateLimitHit) {
      console.log('\n3️⃣ اختبار انتظار انتهاء الحظر:');
      console.log('انتظار 10 ثوانٍ ثم محاولة مرة أخرى...');
      
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      try {
        await axios.post(`${baseURL}/api/v1/auth/login`, {
          email: 'test2@example.com',
          password: 'wrongpassword'
        });
        console.log('✅ المحاولة نجحت بعد الانتظار');
      } catch (error) {
        if (error.response?.status === 429) {
          console.log('🚫 ما زال محظور - الحظر لم ينته بعد');
        } else if (error.response?.status === 401) {
          console.log('✅ الحظر انتهى - مصادقة فاشلة عادية');
        }
      }
    }

    // اختبار endpoints أخرى
    console.log('\n4️⃣ اختبار Rate Limiting على APIs أخرى:');
    
    try {
      // اختبار API عادي
      for (let i = 0; i < 5; i++) {
        try {
          await axios.get(`${baseURL}/api/v1/products`);
        } catch (error) {
          if (error.response?.status === 429) {
            console.log(`🚫 API Rate limiting فعال بعد ${i + 1} محاولات`);
            break;
          } else if (error.response?.status === 401) {
            console.log(`🔐 API محمي بالمصادقة (متوقع)`);
            break;
          }
        }
      }
    } catch (error) {
      console.log('⚠️ خطأ في اختبار API rate limiting');
    }

    console.log('\n🎉 انتهى اختبار Rate Limiting الجديد');
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testNewRateLimits();
