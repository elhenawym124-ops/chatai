const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFakeConversations() {
  console.log('🔍 فحص المحادثات الوهمية في قاعدة البيانات...\n');

  try {
    // 1. فحص جميع المحادثات
    console.log('1️⃣ فحص جميع المحادثات:');
    console.log('═══════════════════════════════════════');

    const allConversations = await prisma.conversation.findMany({
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 إجمالي المحادثات: ${allConversations.length}`);

    // 2. تحليل المحادثات حسب الشركة
    console.log('\n2️⃣ تحليل المحادثات حسب الشركة:');
    console.log('═══════════════════════════════════════');

    const conversationsByCompany = {};
    allConversations.forEach(conv => {
      const companyId = conv.companyId;
      if (!conversationsByCompany[companyId]) {
        conversationsByCompany[companyId] = [];
      }
      conversationsByCompany[companyId].push(conv);
    });

    for (const [companyId, conversations] of Object.entries(conversationsByCompany)) {
      console.log(`🏢 شركة ${companyId}: ${conversations.length} محادثة`);
      
      conversations.slice(0, 5).forEach((conv, index) => {
        console.log(`  ${index + 1}. ${conv.customer.name} - ${conv.messages.length} رسالة - ${conv.createdAt.toISOString()}`);
      });
      
      if (conversations.length > 5) {
        console.log(`  ... و ${conversations.length - 5} محادثة أخرى`);
      }
    }

    // 3. فحص العملاء الوهميين
    console.log('\n3️⃣ فحص العملاء الوهميين:');
    console.log('═══════════════════════════════════════');

    const allCustomers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`👥 إجمالي العملاء: ${allCustomers.length}`);

    const fakeCustomers = allCustomers.filter(customer =>
      (customer.name && customer.name.includes('فاطمة علي')) ||
      (customer.name && customer.name.includes('أحمد محمد')) ||
      (customer.email && customer.email.includes('facebook_')) ||
      customer.phone === '' ||
      (customer.name && customer.name.match(/^\d+\s*$/)) // أرقام فقط
    );

    console.log(`🤖 عملاء وهميون محتملون: ${fakeCustomers.length}`);

    fakeCustomers.slice(0, 10).forEach((customer, index) => {
      console.log(`  ${index + 1}. ${customer.name} - ${customer.email} - ${customer.phone} - شركة: ${customer.companyId}`);
    });

    // 4. فحص الرسائل الوهمية
    console.log('\n4️⃣ فحص الرسائل الوهمية:');
    console.log('═══════════════════════════════════════');

    const recentMessages = await prisma.message.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: {
          include: {
            customer: true
          }
        }
      }
    });

    console.log(`📨 آخر ${recentMessages.length} رسالة:`);

    recentMessages.forEach((message, index) => {
      const customerName = message.conversation.customer.name;
      const content = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
      const isFromCustomer = message.isFromCustomer;
      const sender = isFromCustomer ? 'عميل' : 'بوت';
      
      console.log(`  ${index + 1}. [${sender}] ${customerName}: "${content}" - ${message.createdAt.toISOString()}`);
    });

    // 5. فحص مصادر البيانات
    console.log('\n5️⃣ فحص مصادر البيانات:');
    console.log('═══════════════════════════════════════');

    // فحص إذا كانت هناك بيانات تجريبية
    const testDataSources = [
      'seed.js',
      'createTestData.js',
      'mockData.js',
      'sampleData.js'
    ];

    console.log('🔍 البحث عن ملفات البيانات التجريبية...');

    // 6. إحصائيات مفصلة
    console.log('\n6️⃣ إحصائيات مفصلة:');
    console.log('═══════════════════════════════════════');

    const stats = {
      totalConversations: allConversations.length,
      totalCustomers: allCustomers.length,
      totalMessages: await prisma.message.count(),
      companiesWithData: Object.keys(conversationsByCompany).length,
      fakeCustomersCount: fakeCustomers.length
    };

    console.log('📊 الإحصائيات:');
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    // 7. توصيات التنظيف
    console.log('\n7️⃣ توصيات التنظيف:');
    console.log('═══════════════════════════════════════');

    if (fakeCustomers.length > 0) {
      console.log('🧹 يُنصح بحذف العملاء الوهميين التالية:');
      fakeCustomers.slice(0, 5).forEach((customer, index) => {
        console.log(`  ${index + 1}. ${customer.name} (${customer.id})`);
      });
      
      if (fakeCustomers.length > 5) {
        console.log(`  ... و ${fakeCustomers.length - 5} عميل وهمي آخر`);
      }
    }

    // 8. فحص البيانات الحديثة
    console.log('\n8️⃣ فحص البيانات الحديثة:');
    console.log('═══════════════════════════════════════');

    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const recentConversations = await prisma.conversation.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    });

    const recentMessagesCount = await prisma.message.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    });

    console.log(`📅 محادثات آخر 24 ساعة: ${recentConversations}`);
    console.log(`📨 رسائل آخر 24 ساعة: ${recentMessagesCount}`);

  } catch (error) {
    console.error('❌ خطأ في فحص المحادثات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFakeConversations();
