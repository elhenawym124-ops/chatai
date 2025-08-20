/**
 * تحليل عدد الرسائل الكبير في الشركة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeMessageCount() {
  console.log('🔍 تحليل عدد الرسائل الكبير...');
  console.log('='.repeat(60));

  try {
    // 1. فحص إجمالي الرسائل لكل شركة
    console.log('\n📊 إجمالي الرسائل لكل شركة:');
    const messagesByCompany = await prisma.conversation.findMany({
      select: {
        companyId: true,
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    // تجميع الرسائل حسب الشركة
    const companyStats = {};
    for (const conv of messagesByCompany) {
      if (!companyStats[conv.companyId]) {
        companyStats[conv.companyId] = 0;
      }
      companyStats[conv.companyId] += conv._count.messages;
    }

    // ترتيب حسب العدد
    const sortedCompanies = Object.entries(companyStats)
      .sort(([,a], [,b]) => b - a);

    for (const [companyId, count] of sortedCompanies) {
      console.log(`   ${companyId}: ${count.toLocaleString()} رسالة`);
    }

    // 2. فحص الشركة التي لديها أكبر عدد رسائل
    const topCompanyData = sortedCompanies[0];
    const topCompanyId = topCompanyData[0];
    const topCompanyCount = topCompanyData[1];
    console.log(`\n🔍 تحليل الشركة الأكثر نشاطاً: ${topCompanyId}`);
    console.log(`📊 إجمالي الرسائل: ${topCompanyCount.toLocaleString()}`);

    // 3. فحص توزيع الرسائل حسب التاريخ
    console.log('\n📅 توزيع الرسائل حسب التاريخ (آخر 30 يوم):');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const messagesByDate = await prisma.message.findMany({
      where: {
        conversation: {
          companyId: topCompanyId
        },
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        createdAt: true,
        senderId: true,
        content: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // تجميع حسب اليوم
    const dailyCount = {};
    messagesByDate.forEach(msg => {
      const date = msg.createdAt.toISOString().split('T')[0];
      if (!dailyCount[date]) {
        dailyCount[date] = 0;
      }
      dailyCount[date]++;
    });

    Object.entries(dailyCount)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 10)
      .forEach(([date, count]) => {
        console.log(`   ${date}: ${count} رسالة`);
      });

    // 4. فحص أكثر المرسلين نشاطاً
    console.log('\n👥 أكثر المرسلين نشاطاً:');
    const topSenders = await prisma.message.groupBy({
      by: ['senderId'],
      where: {
        conversation: {
          companyId: topCompanyId
        }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    for (const sender of topSenders) {
      console.log(`   ${sender.senderId || 'غير محدد'}: ${sender._count.id} رسالة`);
    }

    // 5. فحص نوع الرسائل
    console.log('\n📝 عينة من الرسائل الحديثة:');
    const recentMessages = await prisma.message.findMany({
      where: {
        conversation: {
          companyId: topCompanyId
        }
      },
      select: {
        content: true,
        senderId: true,
        createdAt: true,
        isFromCustomer: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    recentMessages.forEach((msg, index) => {
      const type = msg.isFromCustomer ? 'عميل' : 'بوت';
      const preview = msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : '');
      console.log(`   ${index + 1}. [${type}] ${preview}`);
    });

    // 6. فحص المحادثات النشطة
    console.log('\n💬 إحصائيات المحادثات:');
    const conversationStats = await prisma.conversation.aggregate({
      where: { companyId: topCompanyId },
      _count: { id: true },
      _avg: { messageCount: true },
      _max: { messageCount: true }
    });

    console.log(`   إجمالي المحادثات: ${conversationStats._count.id}`);
    console.log(`   متوسط الرسائل لكل محادثة: ${Math.round(conversationStats._avg.messageCount || 0)}`);
    console.log(`   أكبر محادثة: ${conversationStats._max.messageCount || 0} رسالة`);

    // 7. فحص المحادثات الأكثر نشاطاً
    console.log('\n🔥 المحادثات الأكثر نشاطاً:');
    const topConversations = await prisma.conversation.findMany({
      where: { companyId: topCompanyId },
      select: {
        id: true,
        customerId: true,
        messageCount: true,
        lastMessageAt: true
      },
      orderBy: { messageCount: 'desc' },
      take: 10
    });

    topConversations.forEach((conv, index) => {
      console.log(`   ${index + 1}. محادثة ${conv.id}: ${conv.messageCount} رسالة (آخر رسالة: ${conv.lastMessageAt})`);
    });

    // 8. فحص الرسائل المكررة أو المشبوهة
    console.log('\n🚨 فحص الرسائل المكررة:');
    const duplicateMessages = await prisma.message.groupBy({
      by: ['content'],
      where: {
        conversation: {
          companyId: topCompanyId
        },
        content: { not: '' }
      },
      _count: { id: true },
      having: {
        id: { _count: { gt: 5 } }
      },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    if (duplicateMessages.length > 0) {
      console.log('   رسائل مكررة مكتشفة:');
      duplicateMessages.forEach((dup, index) => {
        const preview = dup.content.substring(0, 40) + '...';
        console.log(`   ${index + 1}. "${preview}" - ${dup._count.id} مرة`);
      });
    } else {
      console.log('   ✅ لا توجد رسائل مكررة مشبوهة');
    }

    // 9. فحص الرسائل الفارغة أو القصيرة
    console.log('\n📏 فحص جودة الرسائل:');
    const emptyMessages = await prisma.message.count({
      where: {
        conversation: {
          companyId: topCompanyId
        },
        OR: [
          { content: '' },
          { content: null },
          { content: { contains: 'undefined' } },
          { content: { contains: 'null' } }
        ]
      }
    });

    const shortMessages = await prisma.message.count({
      where: {
        conversation: {
          companyId: topCompanyId
        },
        content: { not: null },
        AND: [
          { content: { not: '' } },
          { content: { not: { contains: 'undefined' } } }
        ]
      }
    });

    console.log(`   رسائل فارغة أو معطوبة: ${emptyMessages}`);
    console.log(`   رسائل صحيحة: ${shortMessages}`);

    // 10. تحليل نهائي
    console.log('\n📊 تحليل نهائي:');
    console.log('='.repeat(50));
    
    const messagesPerDay = topCompanyCount / 30; // تقدير يومي
    const messagesPerConversation = topCompanyCount / (conversationStats._count.id || 1);

    console.log(`📈 معدل الرسائل اليومي: ${Math.round(messagesPerDay)} رسالة/يوم`);
    console.log(`💬 معدل الرسائل لكل محادثة: ${Math.round(messagesPerConversation)} رسالة`);

    if (messagesPerDay > 100) {
      console.log('🚨 معدل عالي جداً - قد يكون هناك:');
      console.log('   - نشاط تجاري مكثف');
      console.log('   - رسائل تلقائية أو بوتات');
      console.log('   - مشاكل في النظام تسبب تكرار');
    } else if (messagesPerDay > 50) {
      console.log('⚠️ معدل عالي - نشاط تجاري نشط');
    } else {
      console.log('✅ معدل طبيعي للنشاط التجاري');
    }

    if (duplicateMessages.length > 0) {
      console.log('🚨 يُنصح بفحص الرسائل المكررة وتنظيفها');
    }

    if (emptyMessages > topCompanyCount * 0.1) {
      console.log('🚨 نسبة عالية من الرسائل المعطوبة - يُنصح بالتنظيف');
    }

  } catch (error) {
    console.error('❌ خطأ في تحليل الرسائل:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeMessageCount().catch(console.error);
