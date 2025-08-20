// إنشاء إشعارات تجريبية مباشرة في قاعدة البيانات
const fetch = require('node-fetch');

async function createTestNotifications() {
  console.log('🔔 إنشاء إشعارات تجريبية مباشرة...\n');

  const notifications = [
    {
      type: 'error',
      title: '🤐 خطأ صامت: نفاد حصة Gemini API',
      message: 'تم استنفاد حصة Gemini API للشركة - العميل لم يرى هذا الخطأ',
      metadata: {
        silent: true,
        errorType: 'quota_exceeded',
        customerId: 'customer-123',
        companyId: 'cme8oj1fo000cufdcg2fquia9',
        source: 'gemini_api'
      }
    },
    {
      type: 'error',
      title: '🤐 خطأ صامت: فشل في الاتصال بقاعدة البيانات',
      message: 'فشل مؤقت في الاتصال بقاعدة البيانات - تم الإصلاح تلقائياً',
      metadata: {
        silent: true,
        errorType: 'database_connection',
        customerId: 'customer-456',
        companyId: 'cme8oj1fo000cufdcg2fquia9',
        source: 'database_system'
      }
    },
    {
      type: 'warning',
      title: '⚠️ تحذير: استهلاك عالي للـ API',
      message: 'تم استهلاك 90% من حصة API اليومية',
      metadata: {
        apiUsage: '90%',
        companyId: 'cme8oj1fo000cufdcg2fquia9',
        source: 'monitoring_system'
      }
    },
    {
      type: 'info',
      title: 'ℹ️ تحديث النظام',
      message: 'تم تحديث نظام الإشعارات الصامتة بنجاح',
      metadata: {
        version: '1.0.0',
        companyId: 'cme8oj1fo000cufdcg2fquia9',
        source: 'system_update'
      }
    },
    {
      type: 'success',
      title: '✅ نجح النظام الصامت',
      message: 'تم إخفاء 15 خطأ عن العملاء اليوم بنجاح',
      metadata: {
        hiddenErrors: 15,
        companyId: 'cme8oj1fo000cufdcg2fquia9',
        source: 'silent_system'
      }
    }
  ];

  try {
    for (const notification of notifications) {
      console.log(`📤 إنشاء: ${notification.title}`);
      
      const response = await fetch('http://localhost:3001/api/v1/notifications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ تم إنشاء الإشعار: ${data.notification?.id || 'unknown'}`);
      } else {
        const errorText = await response.text();
        console.log(`❌ فشل في إنشاء الإشعار: ${response.status} - ${errorText}`);
      }
    }

    console.log('\n🎉 تم إنشاء جميع الإشعارات التجريبية!');
    console.log('🔔 سجل دخول في الموقع لرؤيتها في الجرس');
    console.log('📊 تحقق من لوحة المراقبة أيضاً');

  } catch (error) {
    console.error('❌ خطأ في إنشاء الإشعارات:', error.message);
  }
}

// تشغيل الدالة
createTestNotifications();
