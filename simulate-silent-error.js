// محاكاة خطأ صامت في النظام
const fetch = require('node-fetch');

async function simulateSilentError() {
  console.log('🧪 محاكاة خطأ صامت في النظام...\n');

  try {
    // محاكاة رسالة من عميل تسبب خطأ صامت
    const response = await fetch('http://localhost:3001/webhook/facebook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': 'sha256=test' // توقيع وهمي
      },
      body: JSON.stringify({
        object: 'page',
        entry: [{
          id: 'test-page-silent-error',
          time: Date.now(),
          messaging: [{
            sender: { id: 'test-customer-silent-123' },
            recipient: { id: 'test-page-silent-error' },
            timestamp: Date.now(),
            message: {
              mid: 'test-message-silent-error',
              text: 'اختبار خطأ صامت - هذه الرسالة ستسبب خطأ صامت'
            }
          }]
        }]
      })
    });

    console.log('📤 تم إرسال الرسالة للـ webhook');
    console.log('📊 حالة الرد:', response.status);
    
    if (response.ok) {
      console.log('✅ تم معالجة الرسالة');
    } else {
      console.log('❌ خطأ في معالجة الرسالة');
    }

    // انتظار قليل للسماح للنظام بمعالجة الرسالة
    console.log('\n⏳ انتظار معالجة النظام...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // التحقق من الإشعارات
    console.log('\n🔍 التحقق من الإشعارات...');
    await checkNotifications();

  } catch (error) {
    console.error('❌ خطأ في المحاكاة:', error.message);
  }
}

async function checkNotifications() {
  try {
    // محاولة جلب الإشعارات (بدون token للاختبار)
    const response = await fetch('http://localhost:3001/api/v1/notifications/recent');
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 الإشعارات:', data);
    } else {
      console.log('📄 رد الإشعارات:', response.status);
      const text = await response.text();
      console.log('📄 محتوى الرد:', text);
    }
  } catch (error) {
    console.error('❌ خطأ في جلب الإشعارات:', error.message);
  }
}

// تشغيل المحاكاة
simulateSilentError();
