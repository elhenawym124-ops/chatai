// اختبار إنشاء إشعار صامت مباشرة
const fetch = require('node-fetch');

async function testSilentNotification() {
  console.log('🧪 اختبار إنشاء إشعار صامت...\n');

  try {
    // إنشاء إشعار صامت مباشرة
    const response = await fetch('http://localhost:3001/api/v1/notifications/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // سنحتاج token صحيح
      },
      body: JSON.stringify({
        type: 'error',
        title: '🤐 اختبار خطأ صامت مباشر',
        message: 'هذا خطأ صامت تم إنشاؤه للاختبار - العميل لا يراه',
        metadata: {
          silent: true,
          errorType: 'test_direct_silent_error',
          customerId: 'test-customer-direct-123',
          source: 'direct_test_system',
          timestamp: new Date().toISOString()
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ تم إنشاء الإشعار الصامت بنجاح!');
      console.log('📊 البيانات:', data);
    } else {
      console.log('❌ فشل في إنشاء الإشعار:', response.status);
      const errorText = await response.text();
      console.log('📄 الرد:', errorText);
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

// تشغيل الاختبار
testSilentNotification();
