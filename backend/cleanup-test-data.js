const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

// إنشاء واجهة للتفاعل مع المستخدم
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// دالة للسؤال
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function cleanupTestData() {
  try {
    console.log('🧹 بدء عملية تنظيف البيانات التجريبية...\n');
    
    // 1. تحديد الشركات التجريبية
    console.log('1️⃣ تحديد الشركات التجريبية...');
    const testCompanies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: 'تجريبي' } },
          { name: { contains: 'test' } },
          { name: { contains: 'Test' } },
          { name: { contains: 'demo' } },
          { name: { contains: 'Demo' } },
          { name: { contains: 'اختبار' } },
          { name: { contains: 'مخترقة' } },
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
            orders: true,
            facebookPages: true
          }
        }
      }
    });

    console.log(`📊 تم العثور على ${testCompanies.length} شركة تجريبية\n`);

    if (testCompanies.length === 0) {
      console.log('✅ لا توجد شركات تجريبية للحذف');
      return;
    }

    // عرض الشركات التي سيتم حذفها
    console.log('🏢 الشركات التي سيتم حذفها:');
    console.log('═'.repeat(60));
    testCompanies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`);
      console.log(`   📧 ${company.email}`);
      console.log(`   👥 المستخدمين: ${company._count.users}`);
      console.log(`   👤 العملاء: ${company._count.customers}`);
      console.log(`   💬 المحادثات: ${company._count.conversations}`);
      console.log(`   📦 المنتجات: ${company._count.products}`);
      console.log(`   🛒 الطلبات: ${company._count.orders}`);
      console.log(`   📄 صفحات فيسبوك: ${company._count.facebookPages}`);
      console.log('   ' + '─'.repeat(40));
    });

    // طلب التأكيد من المستخدم
    console.log('\n⚠️ تحذير: هذه العملية لا يمكن التراجع عنها!');
    const confirmation = await askQuestion('هل تريد المتابعة؟ اكتب "نعم" للتأكيد: ');
    
    if (confirmation.toLowerCase() !== 'نعم' && confirmation.toLowerCase() !== 'yes') {
      console.log('❌ تم إلغاء العملية');
      rl.close();
      return;
    }

    console.log('\n🚀 بدء عملية الحذف...\n');

    // إحصائيات الحذف
    let deletedStats = {
      companies: 0,
      users: 0,
      customers: 0,
      conversations: 0,
      messages: 0,
      products: 0,
      orders: 0,
      facebookPages: 0,
      geminiKeys: 0,
      learningData: 0,
      aiInteractions: 0
    };

    // حذف البيانات لكل شركة تجريبية
    for (const company of testCompanies) {
      console.log(`🗑️ حذف بيانات شركة: ${company.name}`);
      
      try {
        // بدء معاملة قاعدة البيانات
        await prisma.$transaction(async (tx) => {
          
          // 1. حذف الرسائل
          const deletedMessages = await tx.message.deleteMany({
            where: {
              conversation: {
                companyId: company.id
              }
            }
          });
          deletedStats.messages += deletedMessages.count;
          console.log(`   📝 حذف ${deletedMessages.count} رسالة`);

          // 2. حذف المحادثات
          const deletedConversations = await tx.conversation.deleteMany({
            where: { companyId: company.id }
          });
          deletedStats.conversations += deletedConversations.count;
          console.log(`   💬 حذف ${deletedConversations.count} محادثة`);

          // 3. حذف العملاء
          const deletedCustomers = await tx.customer.deleteMany({
            where: { companyId: company.id }
          });
          deletedStats.customers += deletedCustomers.count;
          console.log(`   👤 حذف ${deletedCustomers.count} عميل`);

          // 4. حذف المنتجات
          const deletedProducts = await tx.product.deleteMany({
            where: { companyId: company.id }
          });
          deletedStats.products += deletedProducts.count;
          console.log(`   📦 حذف ${deletedProducts.count} منتج`);

          // 5. حذف الطلبات
          const deletedOrders = await tx.order.deleteMany({
            where: { companyId: company.id }
          });
          deletedStats.orders += deletedOrders.count;
          console.log(`   🛒 حذف ${deletedOrders.count} طلب`);

          // 6. حذف صفحات فيسبوك
          const deletedFacebookPages = await tx.facebookPage.deleteMany({
            where: { companyId: company.id }
          });
          deletedStats.facebookPages += deletedFacebookPages.count;
          console.log(`   📄 حذف ${deletedFacebookPages.count} صفحة فيسبوك`);

          // 7. حذف مفاتيح Gemini
          const deletedGeminiKeys = await tx.geminiKey.deleteMany({
            where: { companyId: company.id }
          });
          deletedStats.geminiKeys += deletedGeminiKeys.count;
          console.log(`   🔑 حذف ${deletedGeminiKeys.count} مفتاح Gemini`);

          // 8. حذف بيانات التعلم
          const deletedLearningData = await tx.learningData.deleteMany({
            where: { companyId: company.id }
          });
          deletedStats.learningData += deletedLearningData.count;
          console.log(`   🧠 حذف ${deletedLearningData.count} سجل تعلم`);

          // 9. حذف تفاعلات AI
          const deletedAiInteractions = await tx.aiInteraction.deleteMany({
            where: { companyId: company.id }
          });
          deletedStats.aiInteractions += deletedAiInteractions.count;
          console.log(`   🤖 حذف ${deletedAiInteractions.count} تفاعل AI`);

          // 10. حذف المستخدمين
          const deletedUsers = await tx.user.deleteMany({
            where: { companyId: company.id }
          });
          deletedStats.users += deletedUsers.count;
          console.log(`   👥 حذف ${deletedUsers.count} مستخدم`);

          // 11. أخيراً حذف الشركة
          await tx.company.delete({
            where: { id: company.id }
          });
          deletedStats.companies += 1;
          console.log(`   🏢 حذف الشركة: ${company.name}`);
        });

        console.log(`   ✅ تم حذف جميع بيانات شركة "${company.name}" بنجاح\n`);

      } catch (error) {
        console.error(`   ❌ خطأ في حذف شركة "${company.name}":`, error.message);
      }
    }

    // عرض الإحصائيات النهائية
    console.log('\n📊 إحصائيات التنظيف النهائية:');
    console.log('═'.repeat(50));
    console.log(`🏢 الشركات المحذوفة: ${deletedStats.companies}`);
    console.log(`👥 المستخدمين المحذوفين: ${deletedStats.users}`);
    console.log(`👤 العملاء المحذوفين: ${deletedStats.customers}`);
    console.log(`💬 المحادثات المحذوفة: ${deletedStats.conversations}`);
    console.log(`📝 الرسائل المحذوفة: ${deletedStats.messages}`);
    console.log(`📦 المنتجات المحذوفة: ${deletedStats.products}`);
    console.log(`🛒 الطلبات المحذوفة: ${deletedStats.orders}`);
    console.log(`📄 صفحات فيسبوك المحذوفة: ${deletedStats.facebookPages}`);
    console.log(`🔑 مفاتيح Gemini المحذوفة: ${deletedStats.geminiKeys}`);
    console.log(`🧠 بيانات التعلم المحذوفة: ${deletedStats.learningData}`);
    console.log(`🤖 تفاعلات AI المحذوفة: ${deletedStats.aiInteractions}`);

    console.log('\n✅ تم تنظيف النظام من البيانات التجريبية بنجاح!');
    console.log('💡 يُنصح بإعادة تشغيل الخوادم لضمان تحديث الذاكرة المؤقتة');

  } catch (error) {
    console.error('❌ خطأ في عملية التنظيف:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
cleanupTestData();
