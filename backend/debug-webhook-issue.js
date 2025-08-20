const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugWebhookIssue() {
  console.log('🔍 تشخيص مشكلة الـ webhook...');
  console.log('========================================');

  try {
    // 1. فحص جميع الصفحات المتصلة
    console.log('📄 الصفحات المتصلة:');
    const pages = await prisma.facebookPage.findMany({
      include: { company: true }
    });

    for (const page of pages) {
      console.log(`\n📄 ${page.pageName} (${page.pageId})`);
      console.log(`   الشركة: ${page.company?.name || 'غير محددة'}`);
      console.log(`   الحالة: ${page.status}`);
      console.log(`   Access Token: ${page.pageAccessToken.substring(0, 20)}...`);
      console.log(`   تاريخ الربط: ${page.connectedAt}`);
    }

    // 2. فحص الرسائل الأخيرة من كل صفحة
    console.log('\n💬 آخر الرسائل لكل صفحة:');
    
    for (const page of pages) {
      const conversations = await prisma.conversation.findMany({
        where: {
          channel: 'FACEBOOK',
          companyId: page.companyId
        },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 3
      });

      console.log(`\n📄 صفحة ${page.pageName}:`);
      if (conversations.length === 0) {
        console.log('   ❌ لا توجد محادثات');
      } else {
        for (const conv of conversations) {
          const lastMessage = conv.messages[0];
          if (lastMessage) {
            const time = new Date(lastMessage.createdAt).toLocaleString('ar-EG');
            console.log(`   💬 ${time}: ${lastMessage.content.substring(0, 50)}...`);
          }
        }
      }
    }

    // 3. فحص الرسائل من آخر دقيقة
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
    console.log(`\n⏰ الرسائل من آخر دقيقة (بعد ${oneMinuteAgo.toLocaleString('ar-EG')}):`);
    
    const veryRecentMessages = await prisma.message.findMany({
      where: {
        createdAt: {
          gte: oneMinuteAgo
        }
      },
      include: {
        conversation: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (veryRecentMessages.length === 0) {
      console.log('❌ لا توجد رسائل جديدة في آخر دقيقة');
    } else {
      console.log(`✅ تم العثور على ${veryRecentMessages.length} رسالة جديدة:`);
      for (const msg of veryRecentMessages) {
        const time = new Date(msg.createdAt).toLocaleString('ar-EG');
        const customer = msg.conversation?.customer?.name || 'غير محدد';
        console.log(`   ${time} - ${customer}: ${msg.content}`);
      }
    }

    // 4. اقتراحات للحل
    console.log('\n💡 اقتراحات للحل:');
    console.log('1. تأكد من أنك ترسل لإحدى هذه الصفحات:');
    for (const page of pages) {
      console.log(`   - ${page.pageName} (${page.pageId})`);
    }
    
    console.log('\n2. تأكد من أن الرسالة تحتوي على نص وليست مجرد emoji أو صورة');
    console.log('3. تأكد من أن الصفحة لديها access token صحيح');
    console.log('4. جرب إرسال رسالة نصية بسيطة مثل "مرحبا"');

  } catch (error) {
    console.error('❌ خطأ في تشخيص المشكلة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
debugWebhookIssue();
