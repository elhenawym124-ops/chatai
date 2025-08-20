/**
 * إرسال إشعار لشركة الحلو باستخدام simpleMonitor
 */

const { simpleMonitor } = require('./backend/src/services/simpleMonitor');

async function sendHelwaNotification() {
  console.log('🍯 إرسال إشعار لشركة الحلو...');
  
  try {
    // إنشاء خطأ صامت لشركة الحلو
    await simpleMonitor.logError(new Error('اختبار النظام الصامت - شركة الحلو'), {
      customerId: 'customer_helwa_123',
      errorType: 'ai_processing_timeout',
      silent: true,
      companyId: 'cme8zve740006ufbcre9qzue4', // شركة الحلو
      timestamp: new Date().toISOString(),
      source: 'test_notification_helwa',
      details: 'تم تجاوز مهلة معالجة الذكي الاصطناعي - تم إرسال رد افتراضي للعميل'
    });
    
    console.log('✅ تم إرسال إشعار خطأ صامت لشركة الحلو');
    
    // إنشاء خطأ عادي لشركة الحلو
    await simpleMonitor.logError(new Error('تحديث إعدادات الذكي الاصطناعي - شركة الحلو'), {
      customerId: 'system_admin',
      errorType: 'system_update',
      silent: false,
      companyId: 'cme8zve740006ufbcre9qzue4', // شركة الحلو
      timestamp: new Date().toISOString(),
      source: 'ai_settings_update',
      details: 'تم تحديث إعدادات الذكي الاصطناعي بنجاح'
    });
    
    console.log('✅ تم إرسال إشعار تحديث لشركة الحلو');
    
    console.log('\n🎯 تم إرسال إشعارات لشركة الحلو:');
    console.log('1️⃣ 🤐 خطأ صامت (للمطورين فقط)');
    console.log('2️⃣ 🔧 تحديث النظام');
    console.log('\n🔔 الإشعارات ستظهر فقط لمستخدمي شركة الحلو!');
    console.log('🍯 شركة الحلو ID: cme8zve740006ufbcre9qzue4');
    
  } catch (error) {
    console.error('❌ خطأ في إرسال الإشعارات:', error.message);
  }
}

// تشغيل الاختبار
sendHelwaNotification();
