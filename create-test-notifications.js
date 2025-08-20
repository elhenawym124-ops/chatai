const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestNotifications() {
  console.log('🔔 إنشاء إشعارات تجريبية...\n');

  try {
    // إنشاء إشعارات تجريبية مختلفة
    const notifications = [
      {
        type: 'ERROR',
        title: '🤐 خطأ صامت في النظام',
        message: 'تم استنفاد حصة Gemini API - العميل لم يرى هذا الخطأ',
        metadata: {
          silent: true,
          errorType: 'quota_exceeded',
          customerId: 'customer-123',
          source: 'gemini_api'
        }
      },
      {
        type: 'WARNING',
        title: '⚠️ تحذير: استهلاك عالي للـ API',
        message: 'تم استهلاك 90% من حصة API اليومية',
        metadata: {
          apiUsage: '90%',
          source: 'monitoring_system'
        }
      },
      {
        type: 'INFO',
        title: 'ℹ️ تحديث النظام',
        message: 'تم تحديث نظام الإشعارات الصامتة بنجاح',
        metadata: {
          version: '1.0.0',
          source: 'system_update'
        }
      },
      {
        type: 'SUCCESS',
        title: '✅ نجح النظام الصامت',
        message: 'تم إخفاء 15 خطأ عن العملاء اليوم بنجاح',
        metadata: {
          hiddenErrors: 15,
          source: 'silent_system'
        }
      },
      {
        type: 'ERROR',
        title: '🤐 خطأ قاعدة بيانات صامت',
        message: 'فشل مؤقت في الاتصال بقاعدة البيانات - تم الإصلاح تلقائياً',
        metadata: {
          silent: true,
          errorType: 'database_connection',
          customerId: 'customer-456',
          source: 'database_system'
        }
      }
    ];

    // إنشاء الإشعارات
    for (const notification of notifications) {
      await prisma.notification.create({
        data: {
          ...notification,
          read: Math.random() > 0.5, // بعض الإشعارات مقروءة وبعضها لا
          createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // خلال آخر 24 ساعة
        }
      });
      
      console.log(`✅ تم إنشاء: ${notification.title}`);
    }

    console.log('\n🎉 تم إنشاء جميع الإشعارات التجريبية بنجاح!');
    console.log('🔔 يمكنك الآن رؤيتها في الجرس');
    console.log('📊 تحقق من لوحة المراقبة أيضاً');

  } catch (error) {
    console.error('❌ خطأ في إنشاء الإشعارات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الدالة
createTestNotifications();
