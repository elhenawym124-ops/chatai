/**
 * فحص عميق لمشاكل العزل في إدارة الذاكرة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkIsolationIssues() {
  console.log('🔍 فحص مشاكل العزل في قاعدة البيانات...');
  
  try {
    // فحص توزيع البيانات حسب الشركات
    const companyDistribution = await prisma.conversationMemory.groupBy({
      by: ['companyId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    console.log('📊 توزيع البيانات حسب الشركات:');
    for (const dist of companyDistribution) {
      console.log(`   ${dist.companyId}: ${dist._count.id} سجل`);
    }

    // جلب جميع السجلات للتحليل
    const allRecords = await prisma.conversationMemory.findMany({
      select: { 
        senderId: true, 
        companyId: true, 
        conversationId: true,
        userMessage: true, 
        timestamp: true 
      }
    });

    console.log(`\n📊 إجمالي السجلات: ${allRecords.length}`);

    // فحص المرسلين المشتركين بين الشركات
    console.log('\n🔍 فحص المرسلين المشتركين...');
    const sendersByCompany = {};
    
    for (const record of allRecords) {
      if (!sendersByCompany[record.senderId]) {
        sendersByCompany[record.senderId] = new Set();
      }
      sendersByCompany[record.senderId].add(record.companyId);
    }

    // البحث عن المرسلين المشتركين
    const sharedSenders = [];
    for (const [senderId, companies] of Object.entries(sendersByCompany)) {
      if (companies.size > 1) {
        sharedSenders.push({
          senderId,
          companies: Array.from(companies)
        });
      }
    }

    if (sharedSenders.length > 0) {
      console.log('🚨 مرسلين مشتركين بين شركات:');
      for (const sender of sharedSenders) {
        console.log(`   ${sender.senderId}: ${sender.companies.join(', ')}`);
        
        // عرض عينة من الرسائل لكل شركة
        for (const companyId of sender.companies) {
          const sampleMessage = allRecords.find(r => 
            r.senderId === sender.senderId && r.companyId === companyId
          );
          if (sampleMessage) {
            console.log(`     - [${companyId}] ${sampleMessage.userMessage.substring(0, 40)}...`);
          }
        }
        console.log('');
      }
    } else {
      console.log('✅ لا توجد مرسلين مشتركين بين الشركات');
    }

    // فحص المحادثات المشتركة
    console.log('\n🔍 فحص المحادثات المشتركة...');
    const conversationsByCompany = {};
    
    for (const record of allRecords) {
      if (!conversationsByCompany[record.conversationId]) {
        conversationsByCompany[record.conversationId] = new Set();
      }
      conversationsByCompany[record.conversationId].add(record.companyId);
    }

    const sharedConversations = [];
    for (const [convId, companies] of Object.entries(conversationsByCompany)) {
      if (companies.size > 1) {
        sharedConversations.push({
          conversationId: convId,
          companies: Array.from(companies)
        });
      }
    }

    if (sharedConversations.length > 0) {
      console.log('🚨 محادثات مشتركة بين شركات:');
      for (const conv of sharedConversations) {
        console.log(`   ${conv.conversationId}: ${conv.companies.join(', ')}`);
        
        // عرض تفاصيل المحادثة
        const convRecords = allRecords.filter(r => r.conversationId === conv.conversationId);
        for (const record of convRecords.slice(0, 3)) {
          console.log(`     - [${record.companyId}] ${record.userMessage.substring(0, 40)}...`);
        }
        console.log('');
      }
    } else {
      console.log('✅ لا توجد محادثات مشتركة بين الشركات');
    }

    // فحص أحدث النشاطات
    console.log('\n🔍 فحص أحدث النشاطات...');
    const recentRecords = await prisma.conversationMemory.findMany({
      select: { 
        senderId: true, 
        companyId: true, 
        userMessage: true, 
        timestamp: true 
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    console.log('📝 آخر 10 تفاعلات:');
    for (const record of recentRecords) {
      console.log(`   [${record.companyId}] ${record.senderId}: ${record.userMessage.substring(0, 40)}...`);
    }

    // تحليل نهائي
    console.log('\n📊 تحليل نهائي:');
    console.log(`   - إجمالي المرسلين: ${Object.keys(sendersByCompany).length}`);
    console.log(`   - مرسلين مشتركين: ${sharedSenders.length}`);
    console.log(`   - إجمالي المحادثات: ${Object.keys(conversationsByCompany).length}`);
    console.log(`   - محادثات مشتركة: ${sharedConversations.length}`);

    if (sharedSenders.length > 0 || sharedConversations.length > 0) {
      console.log('\n🚨 تم اكتشاف مشاكل في العزل!');
      console.log('❌ النظام غير آمن - يحتاج إصلاح فوري');
      
      // اقتراح الحلول
      console.log('\n🔧 الحلول المقترحة:');
      if (sharedSenders.length > 0) {
        console.log('   1. إصلاح المرسلين المشتركين - إضافة companyId لمعرفات المرسلين');
      }
      if (sharedConversations.length > 0) {
        console.log('   2. إصلاح المحادثات المشتركة - إضافة companyId لمعرفات المحادثات');
      }
    } else {
      console.log('\n✅ العزل مطبق بشكل صحيح');
      console.log('✅ النظام آمن ومعزول');
    }

  } catch (error) {
    console.error('❌ خطأ في فحص العزل:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkIsolationIssues().catch(console.error);
