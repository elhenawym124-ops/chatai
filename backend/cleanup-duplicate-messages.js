/**
 * أداة تنظيف الرسائل المكررة والفارغة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicateMessages() {
  console.log('🧹 بدء تنظيف الرسائل المكررة والفارغة...');
  console.log('='.repeat(60));

  try {
    // 1. حذف رسائل الخطأ المتكررة مباشرة
    console.log('\n🚨 حذف رسائل الخطأ المتكررة...');
    const errorMessages = [
      'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.',
      'عذراً، الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً.',
      'أعتذر، هناك ضغط على الخدمة الآن. يمكنك إعادة المحاولة بعد قليل.',
      'عذراً للإزعاج، النظام يواجه ضغط مؤقت. يرجى المحاولة بعد دقائق قليلة.'
    ];

    let totalErrorMessagesRemoved = 0;

    for (const errorMessage of errorMessages) {
      // عد الرسائل من هذا النوع
      const count = await prisma.message.count({
        where: { content: errorMessage }
      });

      if (count > 5) {
        // الاحتفاظ بـ 5 رسائل فقط من كل نوع خطأ وحذف الباقي
        const messagesToKeep = await prisma.message.findMany({
          where: { content: errorMessage },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true }
        });

        const keepIds = messagesToKeep.map(msg => msg.id);

        const deleteResult = await prisma.message.deleteMany({
          where: {
            content: errorMessage,
            id: { notIn: keepIds }
          }
        });

        console.log(`   🗑️ حذف ${deleteResult.count} رسالة خطأ مكررة: "${errorMessage.substring(0, 30)}..."`);
        totalErrorMessagesRemoved += deleteResult.count;
      }
    }

    let totalDuplicatesRemoved = totalErrorMessagesRemoved;

    // 2. حذف الرسائل الفارغة
    console.log('\n🗑️ حذف الرسائل الفارغة...');

    // حذف الرسائل الفارغة فقط
    const emptyResult1 = await prisma.message.deleteMany({
      where: { content: '' }
    });

    const emptyResult2 = await prisma.message.deleteMany({
      where: { content: { contains: 'undefined' } }
    });

    const totalEmptyRemoved = emptyResult1.count + emptyResult2.count;
    console.log(`✅ تم حذف ${totalEmptyRemoved} رسالة فارغة`);

    // 3. تحديث آخر رسالة في المحادثات
    console.log('\n🔄 تحديث المحادثات...');
    const conversations = await prisma.conversation.findMany({
      select: { id: true }
    });

    let updatedConversations = 0;
    for (const conversation of conversations) {
      // الحصول على آخر رسالة في المحادثة
      const lastMessage = await prisma.message.findFirst({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, content: true }
      });

      if (lastMessage) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: lastMessage.createdAt,
            lastMessagePreview: lastMessage.content.substring(0, 100)
          }
        });
        updatedConversations++;
      }
    }

    // 4. إحصائيات نهائية
    console.log('\n📊 تقرير التنظيف النهائي:');
    console.log('='.repeat(50));
    console.log(`🗑️ رسائل خطأ مكررة محذوفة: ${totalErrorMessagesRemoved.toLocaleString()}`);
    console.log(`🗑️ رسائل فارغة محذوفة: ${totalEmptyRemoved.toLocaleString()}`);
    console.log(`🔄 محادثات محدثة: ${updatedConversations.toLocaleString()}`);

    const totalRemoved = totalErrorMessagesRemoved + totalEmptyRemoved;
    console.log(`\n🎉 إجمالي الرسائل المحذوفة: ${totalRemoved.toLocaleString()}`);

    // 5. إحصائيات ما بعد التنظيف
    console.log('\n📈 إحصائيات ما بعد التنظيف:');
    const totalMessages = await prisma.message.count();
    const totalConversations = await prisma.conversation.count();

    console.log(`📊 إجمالي الرسائل المتبقية: ${totalMessages.toLocaleString()}`);
    console.log(`💬 إجمالي المحادثات: ${totalConversations.toLocaleString()}`);
    console.log(`📊 متوسط الرسائل لكل محادثة: ${Math.round(totalMessages / (totalConversations || 1))}`);

    console.log('\n✅ تم الانتهاء من تنظيف قاعدة البيانات بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في تنظيف الرسائل:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التنظيف
cleanupDuplicateMessages().catch(console.error);
