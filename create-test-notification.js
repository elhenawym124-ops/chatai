/**
 * إنشاء إشعار تجريبي مباشرة في قاعدة البيانات
 * Create test notification directly in database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestNotification() {
  console.log('🧪 إنشاء إشعار تجريبي...');
  
  try {
    // إنشاء إشعار خطأ صامت
    const silentErrorNotification = await prisma.notification.create({
      data: {
        type: 'ERROR',
        title: '🤐 خطأ صامت في النظام',
        message: 'تم اكتشاف خطأ صامت في معالجة الرسائل - العميل: test-customer-123',
        metadata: {
          silent: true,
          errorType: 'ai_processing_error',
          customerId: 'test-customer-123',
          companyId: 'cme8oj1fo000cufdcg2fquia9',
          source: 'silent_error_system',
          timestamp: new Date().toISOString()
        },
        isRead: false
      }
    });
    
    console.log('✅ تم إنشاء إشعار الخطأ الصامت:', silentErrorNotification.id);
    
    // إنشاء إشعار نجاح
    const successNotification = await prisma.notification.create({
      data: {
        type: 'SUCCESS',
        title: '✅ تم إصلاح مشاكل العزل',
        message: 'تم إصلاح جميع مشاكل العزل بنجاح: pageCache، companyId، autoPattern',
        metadata: {
          silent: false,
          source: 'system_maintenance',
          fixes: ['pageCache', 'companyId', 'autoPattern'],
          timestamp: new Date().toISOString()
        },
        isRead: false
      }
    });
    
    console.log('✅ تم إنشاء إشعار النجاح:', successNotification.id);
    
    // إنشاء إشعار تحذير
    const warningNotification = await prisma.notification.create({
      data: {
        type: 'WARNING',
        title: '⚠️ تحذير: استخدام مرتفع للـ API',
        message: 'تم تجاوز 80% من حد استخدام Gemini API للشركة',
        metadata: {
          silent: false,
          source: 'api_monitoring',
          usage: '80%',
          limit: '500000',
          companyId: 'cme8oj1fo000cufdcg2fquia9',
          timestamp: new Date().toISOString()
        },
        isRead: false
      }
    });
    
    console.log('✅ تم إنشاء إشعار التحذير:', warningNotification.id);
    
    console.log('\n🎯 تم إنشاء 3 إشعارات تجريبية:');
    console.log('1️⃣ خطأ صامت');
    console.log('2️⃣ نجاح الإصلاح');
    console.log('3️⃣ تحذير استخدام API');
    console.log('\n🔔 تحقق من الجرس في الواجهة لرؤية الإشعارات!');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الإشعارات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبار
createTestNotification();
