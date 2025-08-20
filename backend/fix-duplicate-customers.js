const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDuplicateCustomers() {
  console.log('🔧 إصلاح العملاء المكررين...\n');

  try {
    // 1. فحص العملاء المكررين
    console.log('1️⃣ فحص العملاء المكررين:');
    console.log('═══════════════════════════════════════');

    const allCustomers = await prisma.customer.findMany({
      include: {
        conversations: {
          include: {
            messages: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`📊 إجمالي العملاء: ${allCustomers.length}`);

    // تجميع العملاء حسب facebookId
    const customersByFacebookId = {};
    allCustomers.forEach(customer => {
      if (customer.facebookId) {
        if (!customersByFacebookId[customer.facebookId]) {
          customersByFacebookId[customer.facebookId] = [];
        }
        customersByFacebookId[customer.facebookId].push(customer);
      }
    });

    // العثور على المكررين
    const duplicates = Object.entries(customersByFacebookId).filter(([facebookId, customers]) => customers.length > 1);

    console.log(`🔍 عملاء مكررين: ${duplicates.length}`);

    if (duplicates.length === 0) {
      console.log('✅ لا توجد عملاء مكررين');
      return;
    }

    // 2. عرض المكررين
    console.log('\n2️⃣ تفاصيل العملاء المكررين:');
    console.log('═══════════════════════════════════════');

    for (const [facebookId, customers] of duplicates) {
      console.log(`\n👤 Facebook ID: ${facebookId}`);
      console.log(`   📊 عدد النسخ: ${customers.length}`);
      
      customers.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.firstName} ${customer.lastName} (${customer.id})`);
        console.log(`      🏢 الشركة: ${customer.companyId}`);
        console.log(`      💬 المحادثات: ${customer.conversations.length}`);
        console.log(`      📅 تاريخ الإنشاء: ${customer.createdAt.toISOString()}`);
        
        const totalMessages = customer.conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
        console.log(`      📨 إجمالي الرسائل: ${totalMessages}`);
      });
    }

    // 3. إصلاح المكررين
    console.log('\n3️⃣ إصلاح العملاء المكررين:');
    console.log('═══════════════════════════════════════');

    for (const [facebookId, customers] of duplicates) {
      console.log(`\n🔧 إصلاح Facebook ID: ${facebookId}`);
      
      // ترتيب العملاء حسب عدد المحادثات والرسائل (الأكثر نشاطاً أولاً)
      const sortedCustomers = customers.sort((a, b) => {
        const aMessages = a.conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
        const bMessages = b.conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
        
        if (aMessages !== bMessages) return bMessages - aMessages; // الأكثر رسائل أولاً
        if (a.conversations.length !== b.conversations.length) return b.conversations.length - a.conversations.length; // الأكثر محادثات أولاً
        return new Date(a.createdAt) - new Date(b.createdAt); // الأقدم أولاً
      });

      const mainCustomer = sortedCustomers[0];
      const duplicateCustomers = sortedCustomers.slice(1);

      console.log(`   ✅ العميل الرئيسي: ${mainCustomer.firstName} ${mainCustomer.lastName} (${mainCustomer.id})`);
      console.log(`   🗑️ سيتم حذف: ${duplicateCustomers.length} نسخة مكررة`);

      // حذف العملاء المكررين
      for (const duplicateCustomer of duplicateCustomers) {
        console.log(`   🗑️ حذف: ${duplicateCustomer.firstName} ${duplicateCustomer.lastName} (${duplicateCustomer.id})`);
        
        // حذف المحادثات والرسائل المرتبطة
        for (const conversation of duplicateCustomer.conversations) {
          // حذف الرسائل
          await prisma.message.deleteMany({
            where: { conversationId: conversation.id }
          });
          
          // حذف المحادثة
          await prisma.conversation.delete({
            where: { id: conversation.id }
          });
        }
        
        // حذف العميل
        await prisma.customer.delete({
          where: { id: duplicateCustomer.id }
        });
        
        console.log(`   ✅ تم حذف العميل والمحادثات المرتبطة`);
      }
    }

    // 4. التحقق من النتائج
    console.log('\n4️⃣ التحقق من النتائج:');
    console.log('═══════════════════════════════════════');

    const finalCustomers = await prisma.customer.findMany();
    console.log(`📊 إجمالي العملاء بعد الإصلاح: ${finalCustomers.length}`);

    // فحص المكررين مرة أخرى
    const finalCustomersByFacebookId = {};
    finalCustomers.forEach(customer => {
      if (customer.facebookId) {
        if (!finalCustomersByFacebookId[customer.facebookId]) {
          finalCustomersByFacebookId[customer.facebookId] = [];
        }
        finalCustomersByFacebookId[customer.facebookId].push(customer);
      }
    });

    const finalDuplicates = Object.entries(finalCustomersByFacebookId).filter(([facebookId, customers]) => customers.length > 1);
    
    if (finalDuplicates.length === 0) {
      console.log('✅ تم إصلاح جميع العملاء المكررين بنجاح');
    } else {
      console.log(`⚠️ لا يزال هناك ${finalDuplicates.length} عميل مكرر`);
    }

    // 5. إحصائيات نهائية
    console.log('\n5️⃣ إحصائيات نهائية:');
    console.log('═══════════════════════════════════════');

    const customersByCompany = await prisma.customer.groupBy({
      by: ['companyId'],
      _count: {
        id: true
      }
    });

    console.log('📊 العملاء حسب الشركة:');
    for (const group of customersByCompany) {
      const company = await prisma.company.findUnique({
        where: { id: group.companyId },
        select: { name: true }
      });
      
      console.log(`   🏢 ${company?.name || 'غير محدد'} (${group.companyId}): ${group._count.id} عميل`);
    }

  } catch (error) {
    console.error('❌ خطأ في إصلاح العملاء المكررين:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateCustomers();
