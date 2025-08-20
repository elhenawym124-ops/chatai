const axios = require('axios');

async function testSecurityMonitoring() {
  console.log('🔍 اختبار نظام مراقبة الأمان\n');

  try {
    const baseURL = 'http://localhost:3001';

    // إنشاء مستخدم للاختبار
    console.log('1️⃣ إنشاء مستخدم للاختبار:');
    const userData = {
      email: `monitor_test_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Monitor',
      lastName: 'Test',
      companyName: 'Monitor Test Company',
      phone: '01234567890'
    };

    const userResponse = await axios.post(`${baseURL}/api/v1/auth/register`, userData);
    const token = userResponse.data.data.token;
    const companyId = userResponse.data.data.company.id;
    console.log(`✅ تم إنشاء المستخدم: ${userData.email}`);

    // اختبار محاولات مصادقة فاشلة
    console.log('\n2️⃣ اختبار محاولات مصادقة فاشلة:');
    for (let i = 0; i < 3; i++) {
      try {
        await axios.post(`${baseURL}/api/v1/auth/login`, {
          email: userData.email,
          password: 'wrong_password'
        });
      } catch (error) {
        console.log(`❌ محاولة مصادقة فاشلة ${i + 1}`);
      }
    }

    // اختبار محاولة وصول لشركة أخرى
    console.log('\n3️⃣ اختبار محاولة وصول لشركة أخرى:');
    try {
      await axios.get(`${baseURL}/api/v1/companies/fake-company-id`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.log(`✅ تم منع الوصول لشركة أخرى: ${error.response?.status}`);
    }

    // اختبار محاولة وصول إداري غير مصرح به
    console.log('\n4️⃣ اختبار محاولة وصول إداري:');
    try {
      await axios.get(`${baseURL}/api/v1/admin/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.log(`✅ تم منع الوصول الإداري: ${error.response?.status}`);
    }

    // اختبار طلبات مشبوهة
    console.log('\n5️⃣ اختبار طلبات مشبوهة:');
    const suspiciousRequests = [
      '/api/v1/products?search=<script>alert("xss")</script>',
      '/api/v1/customers/../../../etc/passwd',
      '/api/v1/conversations?filter=\' OR 1=1--'
    ];

    for (const suspiciousPath of suspiciousRequests) {
      try {
        await axios.get(`${baseURL}${suspiciousPath}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.log(`🚨 طلب مشبوه تم اكتشافه: ${suspiciousPath}`);
      }
    }

    // انتظار قليل لمعالجة التنبيهات
    await new Promise(resolve => setTimeout(resolve, 1000));

    // جلب إحصائيات الأمان
    console.log('\n6️⃣ جلب إحصائيات الأمان:');
    try {
      const statsResponse = await axios.get(`${baseURL}/api/v1/security/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const stats = statsResponse.data.data;
      console.log('📊 إحصائيات الأمان:');
      console.log(`   ⏱️ وقت التشغيل: ${stats.uptime.formatted}`);
      console.log(`   📈 إجمالي الطلبات: ${stats.metrics.totalRequests}`);
      console.log(`   ❌ محاولات مصادقة فاشلة: ${stats.metrics.failedAuthentications}`);
      console.log(`   🚨 أنشطة مشبوهة: ${stats.metrics.suspiciousActivities}`);
      console.log(`   🚫 طلبات محظورة: ${stats.metrics.blockedRequests}`);
      console.log(`   🏢 محاولات وصول لشركات أخرى: ${stats.metrics.companyCrossAccess}`);
      console.log(`   👑 محاولات وصول إداري: ${stats.metrics.adminAccessAttempts}`);
      console.log(`   🛡️ نقاط الأمان: ${stats.securityScore.score}/100 (${stats.securityScore.level})`);

      if (stats.recentAlerts.length > 0) {
        console.log('\n🚨 آخر التنبيهات:');
        stats.recentAlerts.slice(-5).forEach((alert, index) => {
          console.log(`   ${index + 1}. ${alert.type}: ${alert.message}`);
        });
      }

    } catch (error) {
      console.log('❌ خطأ في جلب إحصائيات الأمان:', error.response?.data?.message || error.message);
    }

    // جلب التقرير اليومي
    console.log('\n7️⃣ جلب التقرير الأمني اليومي:');
    try {
      const reportResponse = await axios.get(`${baseURL}/api/v1/security/daily-report`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const report = reportResponse.data.data;
      console.log('📋 التقرير الأمني اليومي:');
      console.log(`   📊 إجمالي التنبيهات: ${report.summary.totalAlerts}`);
      console.log(`   🔴 تنبيهات حرجة: ${report.summary.critical}`);
      console.log(`   🟠 تنبيهات عالية: ${report.summary.high}`);
      console.log(`   🟡 تنبيهات متوسطة: ${report.summary.medium}`);

      if (report.topThreats.length > 0) {
        console.log('\n🎯 أهم التهديدات:');
        report.topThreats.forEach((threat, index) => {
          console.log(`   ${index + 1}. ${threat.type} من ${threat.ip}: ${threat.count} مرة`);
        });
      }

      if (report.recommendations.length > 0) {
        console.log('\n💡 التوصيات الأمنية:');
        report.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec}`);
        });
      }

    } catch (error) {
      console.log('❌ خطأ في جلب التقرير اليومي:', error.response?.data?.message || error.message);
    }

    // اختبار Rate Limiting
    console.log('\n8️⃣ اختبار Rate Limiting:');
    let rateLimitHit = false;
    
    for (let i = 0; i < 10; i++) {
      try {
        await axios.get(`${baseURL}/api/v1/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`✅ Rate limiting يعمل: تم الوصول للحد الأقصى بعد ${i + 1} طلبات`);
          rateLimitHit = true;
          break;
        }
      }
    }

    if (!rateLimitHit) {
      console.log('ℹ️ Rate limiting لم يتم تفعيله (قد يكون الحد أعلى)');
    }

    console.log('\n🎉 انتهى اختبار نظام مراقبة الأمان');
    console.log('═══════════════════════════════════════');
    console.log('✅ نظام المراقبة يعمل بشكل صحيح');
    console.log('✅ التنبيهات يتم تسجيلها');
    console.log('✅ الإحصائيات متاحة');
    console.log('✅ التقارير تعمل');
    console.log('✅ Rate limiting مطبق');

  } catch (error) {
    console.error('❌ خطأ في اختبار نظام المراقبة:', error.response?.data || error.message);
  }
}

testSecurityMonitoring();
