const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllTestData() {
  try {
    console.log('🔍 فحص جميع البيانات التجريبية في النظام...\n');

    // 1. فحص الشركات التجريبية
    console.log('1️⃣ فحص الشركات التجريبية:');
    console.log('═'.repeat(50));
    
    const testCompanies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: 'تجريبي' } },
          { name: { contains: 'test' } },
          { name: { contains: 'Test' } },
          { name: { contains: 'demo' } },
          { name: { contains: 'Demo' } },
          { email: { contains: 'test' } },
          { email: { contains: 'example' } },
          { email: { contains: 'demo' } },
          { id: 'test-company-id' }
        ]
      },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            conversations: true,
            products: true,
            orders: true
          }
        }
      }
    });

    console.log(`📊 عدد الشركات التجريبية: ${testCompanies.length}\n`);

    testCompanies.forEach((company, index) => {
      console.log(`${index + 1}. 🏢 ${company.name}`);
      console.log(`   🆔 ID: ${company.id}`);
      console.log(`   📧 الإيميل: ${company.email}`);
      console.log(`   📅 تاريخ الإنشاء: ${company.createdAt.toLocaleString('ar-EG')}`);
      console.log(`   👥 المستخدمين: ${company._count.users}`);
      console.log(`   👤 العملاء: ${company._count.customers}`);
      console.log(`   💬 المحادثات: ${company._count.conversations}`);
      console.log(`   📦 المنتجات: ${company._count.products}`);
      console.log(`   🛒 الطلبات: ${company._count.orders}`);
      console.log('   ' + '─'.repeat(40));
    });

    // 2. فحص العملاء التجريبيين
    console.log('\n2️⃣ فحص العملاء التجريبيين:');
    console.log('═'.repeat(50));
    
    const testCustomers = await prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: 'تجريبي' } },
          { lastName: { contains: 'تجريبي' } },
          { firstName: { contains: 'test' } },
          { lastName: { contains: 'test' } },
          { firstName: { contains: 'Test' } },
          { lastName: { contains: 'Test' } },
          { email: { contains: 'test' } },
          { email: { contains: 'example' } },
          { email: { contains: 'demo' } },
          { phone: { contains: '111111' } },
          { phone: { contains: '123456' } },
          { phone: '01111111111' },
          { phone: '01234567890' },
          { phone: '01234567891' }
        ]
      },
      include: {
        company: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            conversations: true
          }
        }
      }
    });

    console.log(`📊 عدد العملاء التجريبيين: ${testCustomers.length}\n`);

    testCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. 👤 ${customer.firstName} ${customer.lastName}`);
      console.log(`   🆔 ID: ${customer.id}`);
      console.log(`   📧 الإيميل: ${customer.email || 'غير محدد'}`);
      console.log(`   📱 الهاتف: ${customer.phone || 'غير محدد'}`);
      console.log(`   🏢 الشركة: ${customer.company?.name || 'غير محدد'}`);
      console.log(`   💬 المحادثات: ${customer._count.conversations}`);
      console.log(`   📅 تاريخ الإنشاء: ${customer.createdAt.toLocaleString('ar-EG')}`);
      console.log('   ' + '─'.repeat(40));
    });

    // 3. فحص المحادثات التجريبية
    console.log('\n3️⃣ فحص المحادثات التجريبية:');
    console.log('═'.repeat(50));
    
    const testConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { companyId: { in: testCompanies.map(c => c.id) } },
          { customerId: { in: testCustomers.map(c => c.id) } }
        ]
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        company: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    console.log(`📊 عدد المحادثات التجريبية: ${testConversations.length}\n`);

    testConversations.forEach((conv, index) => {
      const customerName = `${conv.customer.firstName} ${conv.customer.lastName}`;
      console.log(`${index + 1}. 💬 المحادثة ${conv.id}`);
      console.log(`   👤 العميل: ${customerName}`);
      console.log(`   🏢 الشركة: ${conv.company?.name || 'غير محدد'}`);
      console.log(`   📡 القناة: ${conv.channel}`);
      console.log(`   📝 عدد الرسائل: ${conv._count.messages}`);
      console.log(`   📅 تاريخ الإنشاء: ${conv.createdAt.toLocaleString('ar-EG')}`);
      console.log('   ' + '─'.repeat(40));
    });

    // 4. فحص الرسائل التجريبية
    console.log('\n4️⃣ فحص الرسائل التجريبية:');
    console.log('═'.repeat(50));
    
    const testMessages = await prisma.message.findMany({
      where: {
        OR: [
          { content: { contains: 'اختبار' } },
          { content: { contains: 'test' } },
          { content: { contains: 'تجريب' } },
          { content: { contains: 'demo' } },
          { conversationId: { in: testConversations.map(c => c.id) } }
        ]
      },
      take: 20,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 عدد الرسائل التجريبية (آخر 20): ${testMessages.length}\n`);

    testMessages.forEach((msg, index) => {
      const preview = msg.content.substring(0, 80);
      console.log(`${index + 1}. 📝 ${preview}${msg.content.length > 80 ? '...' : ''}`);
      console.log(`   💬 المحادثة: ${msg.conversationId}`);
      console.log(`   👥 من: ${msg.isFromCustomer ? 'العميل' : 'النظام'}`);
      console.log(`   📅 التاريخ: ${msg.createdAt.toLocaleString('ar-EG')}`);
      console.log('   ' + '─'.repeat(40));
    });

    // 5. ملخص شامل
    console.log('\n📊 ملخص شامل للبيانات التجريبية:');
    console.log('═'.repeat(60));
    console.log(`🏢 الشركات التجريبية: ${testCompanies.length}`);
    console.log(`👤 العملاء التجريبيين: ${testCustomers.length}`);
    console.log(`💬 المحادثات التجريبية: ${testConversations.length}`);
    console.log(`📝 الرسائل التجريبية: ${testMessages.length}`);

    const totalTestData = testCompanies.length + testCustomers.length + testConversations.length + testMessages.length;
    
    if (totalTestData > 0) {
      console.log('\n⚠️ تحذير: يوجد بيانات تجريبية في النظام');
      console.log('💡 التوصيات:');
      console.log('   1. حذف البيانات التجريبية من بيئة الإنتاج');
      console.log('   2. نقل البيانات التجريبية إلى بيئة اختبار منفصلة');
      console.log('   3. استخدام قاعدة بيانات منفصلة للاختبار');
      console.log('   4. تنظيف البيانات بشكل دوري');
    } else {
      console.log('\n✅ النظام نظيف من البيانات التجريبية');
    }

  } catch (error) {
    console.error('❌ خطأ في فحص البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
checkAllTestData();
