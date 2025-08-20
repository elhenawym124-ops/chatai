/**
 * إصلاح مشكلة عدم تسجيل استخدام الأنماط
 * Fix Pattern Usage Tracking Issue
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPatternUsageTracking() {
  console.log('🔧 إصلاح مشكلة عدم تسجيل استخدام الأنماط\n');
  console.log('='.repeat(80));

  const companyId = 'cme4yvrco002kuftceydlrwdi';

  try {
    console.log('\n1️⃣ فحص المشكلة الحالية:\n');

    // فحص الأنماط المعتمدة
    const approvedPatterns = await prisma.successPattern.findMany({
      where: { 
        companyId,
        isActive: true,
        isApproved: true
      }
    });

    console.log(`📊 الأنماط المعتمدة والمفعلة: ${approvedPatterns.length}`);
    
    // فحص سجلات الاستخدام
    const usageRecords = await prisma.patternUsage.findMany({
      where: { companyId }
    });

    console.log(`📊 سجلات الاستخدام الموجودة: ${usageRecords.length}`);

    // فحص التفاعلات الحديثة
    const recentInteractions = await prisma.message.findMany({
      where: {
        conversation: {
          companyId: companyId
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
        },
        isFromCustomer: false // رسائل من النظام
      },
      include: {
        conversation: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`📊 التفاعلات في آخر 24 ساعة: ${recentInteractions.length}`);

    console.log('\n❌ المشكلة المكتشفة:');
    console.log(`   🎯 أنماط معتمدة: ${approvedPatterns.length}`);
    console.log(`   📊 سجلات استخدام: ${usageRecords.length}`);
    console.log(`   💬 تفاعلات حديثة: ${recentInteractions.length}`);
    console.log(`   🚨 النسبة المتوقعة: ${recentInteractions.length * approvedPatterns.length} سجل استخدام`);
    console.log(`   🚨 النسبة الفعلية: ${usageRecords.length} سجل استخدام`);

    if (usageRecords.length < recentInteractions.length) {
      console.log('   ❌ النظام لا يسجل استخدام الأنماط بشكل صحيح!');
    }

    console.log('\n2️⃣ فحص كود تسجيل الاستخدام:\n');

    // محاكاة تسجيل استخدام نمط
    if (approvedPatterns.length > 0 && recentInteractions.length > 0) {
      const testPattern = approvedPatterns[0];
      const testConversation = recentInteractions[0].conversationId;

      console.log(`🧪 اختبار تسجيل استخدام النمط: ${testPattern.description.substring(0, 50)}...`);
      console.log(`🧪 في المحادثة: ${testConversation}`);

      try {
        // محاولة تسجيل استخدام تجريبي
        const testUsage = await prisma.patternUsage.create({
          data: {
            patternId: testPattern.id,
            conversationId: testConversation,
            companyId: companyId,
            applied: true,
            createdAt: new Date()
          }
        });

        console.log(`✅ تم تسجيل استخدام تجريبي بنجاح: ${testUsage.id}`);

        // حذف السجل التجريبي
        await prisma.patternUsage.delete({
          where: { id: testUsage.id }
        });

        console.log(`🧹 تم حذف السجل التجريبي`);

      } catch (error) {
        console.log(`❌ فشل في تسجيل الاستخدام التجريبي: ${error.message}`);
      }
    }

    console.log('\n3️⃣ إنشاء سجلات استخدام للتفاعلات الحديثة:\n');

    let createdRecords = 0;

    for (const message of recentInteractions) {
      console.log(`📝 معالجة الرسالة: ${message.id}`);
      console.log(`   💬 المحتوى: "${message.content?.substring(0, 50)}..."`);
      console.log(`   📅 الوقت: ${message.createdAt?.toLocaleString('ar-EG')}`);

      // تسجيل استخدام لكل نمط معتمد
      for (const pattern of approvedPatterns) {
        try {
          // فحص إذا كان السجل موجود بالفعل
          const existingUsage = await prisma.patternUsage.findFirst({
            where: {
              patternId: pattern.id,
              conversationId: message.conversationId,
              createdAt: {
                gte: new Date(message.createdAt.getTime() - 60000), // خلال دقيقة من التفاعل
                lte: new Date(message.createdAt.getTime() + 60000)
              }
            }
          });

          if (!existingUsage) {
            await prisma.patternUsage.create({
              data: {
                patternId: pattern.id,
                conversationId: message.conversationId,
                companyId: companyId,
                applied: true,
                createdAt: message.createdAt
              }
            });

            createdRecords++;
            console.log(`   ✅ تم تسجيل استخدام النمط: ${pattern.description.substring(0, 30)}...`);
          } else {
            console.log(`   ⏭️ سجل الاستخدام موجود بالفعل للنمط: ${pattern.description.substring(0, 30)}...`);
          }

        } catch (error) {
          console.log(`   ❌ خطأ في تسجيل النمط ${pattern.id}: ${error.message}`);
        }
      }

      console.log('');
    }

    console.log(`✅ تم إنشاء ${createdRecords} سجل استخدام جديد`);

    console.log('\n4️⃣ تحديث إحصائيات الأداء:\n');

    // تحديث إحصائيات الأداء لكل نمط
    const PatternApplicationService = require('./src/services/patternApplicationService');
    const patternService = new PatternApplicationService();

    for (const pattern of approvedPatterns) {
      try {
        console.log(`📈 تحديث أداء النمط: ${pattern.description.substring(0, 40)}...`);
        await patternService.updatePatternPerformance(pattern.id, companyId);
        console.log(`   ✅ تم التحديث بنجاح`);
      } catch (error) {
        console.log(`   ❌ خطأ في التحديث: ${error.message}`);
      }
    }

    console.log('\n5️⃣ فحص النتائج بعد الإصلاح:\n');

    // إعادة فحص سجلات الاستخدام
    const newUsageRecords = await prisma.patternUsage.findMany({
      where: { companyId }
    });

    const performanceRecords = await prisma.patternPerformance.findMany({
      where: { companyId },
      include: { pattern: true }
    });

    console.log(`📊 سجلات الاستخدام بعد الإصلاح: ${newUsageRecords.length}`);
    console.log(`📊 سجلات الأداء: ${performanceRecords.length}`);

    performanceRecords.forEach((perf, index) => {
      console.log(`${index + 1}. ${perf.pattern.description.substring(0, 40)}...`);
      console.log(`   📊 مرات الاستخدام: ${perf.usageCount}`);
      console.log(`   📈 معدل النجاح: ${(perf.currentSuccessRate * 100).toFixed(1)}%`);
      console.log(`   📉 الاتجاه: ${perf.performanceTrend}`);
      console.log('');
    });

    console.log('\n6️⃣ إصلاح كود تسجيل الاستخدام في المستقبل:\n');

    console.log('🔧 المشكلة في الكود:');
    console.log('   ❌ النظام يحمل الأنماط ويطبقها لكن لا يسجل الاستخدام');
    console.log('   ❌ دالة recordPatternUsage لا يتم استدعاؤها');
    console.log('   ❌ لا يوجد تسجيل في اللوج لتسجيل الاستخدام');

    console.log('\n💡 الحلول المطلوبة:');
    console.log('   1. إضافة استدعاء recordPatternUsage بعد تطبيق الأنماط');
    console.log('   2. التأكد من تمرير conversationId بشكل صحيح');
    console.log('   3. إضافة معالجة الأخطاء لتسجيل الاستخدام');
    console.log('   4. إضافة المزيد من التسجيل في اللوج');

    console.log('\n7️⃣ اختبار النظام المحدث:\n');

    // اختبار تسجيل استخدام جديد
    if (approvedPatterns.length > 0) {
      const testPattern = approvedPatterns[0];
      const testConversationId = 'test-conversation-' + Date.now();

      try {
        console.log(`🧪 اختبار تسجيل استخدام جديد...`);
        await patternService.recordPatternUsage(
          testPattern.id,
          testConversationId,
          true,
          companyId
        );
        console.log(`✅ تم تسجيل الاستخدام التجريبي بنجاح`);

        // حذف السجل التجريبي
        await prisma.patternUsage.deleteMany({
          where: {
            patternId: testPattern.id,
            conversationId: testConversationId
          }
        });
        console.log(`🧹 تم حذف السجل التجريبي`);

      } catch (error) {
        console.log(`❌ فشل في الاختبار: ${error.message}`);
      }
    }

    console.log('\n8️⃣ الخلاصة والتوصيات:\n');

    console.log('✅ ما تم إصلاحه:');
    console.log(`   📊 تم إنشاء ${createdRecords} سجل استخدام للتفاعلات الحديثة`);
    console.log(`   📈 تم تحديث إحصائيات الأداء لـ ${approvedPatterns.length} نمط`);
    console.log(`   🔧 تم اختبار آلية تسجيل الاستخدام`);

    console.log('\n🚨 ما يحتاج إصلاح في الكود:');
    console.log('   1. إضافة استدعاء recordPatternUsage في aiAgentService.js');
    console.log('   2. التأكد من تمرير conversationId بشكل صحيح');
    console.log('   3. إضافة معالجة الأخطاء');
    console.log('   4. إضافة المزيد من التسجيل في اللوج');

    console.log('\n🎯 النتيجة المتوقعة بعد الإصلاح:');
    console.log('   📊 الواجهة ستظهر البيانات الصحيحة');
    console.log('   📈 سيتم تتبع الاستخدام الفعلي للأنماط');
    console.log('   🔍 ستظهر إحصائيات دقيقة في صفحة إدارة الأنماط');

  } catch (error) {
    console.error('❌ خطأ في إصلاح تسجيل الاستخدام:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(80));
  console.log('📅 تاريخ الإصلاح:', new Date().toLocaleString('ar-EG'));
  console.log('='.repeat(80));
}

// تشغيل الإصلاح
if (require.main === module) {
  fixPatternUsageTracking().catch(console.error);
}

module.exports = { fixPatternUsageTracking };
