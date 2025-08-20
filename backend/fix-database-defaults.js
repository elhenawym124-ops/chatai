const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * إصلاح قاعدة البيانات - إزالة القيم الافتراضية الخطيرة
 * 
 * هذا السكريبت يقوم بـ:
 * 1. إزالة القيم الافتراضية الخطيرة من ConversationMemory
 * 2. توحيد العملات في جميع الجداول
 * 3. التأكد من سلامة البيانات الموجودة
 */

async function fixDatabaseDefaults() {
  try {
    console.log('🚀 بدء إصلاح قاعدة البيانات...\n');

    // 1. فحص البيانات الحالية
    console.log('1️⃣ فحص البيانات الحالية...');
    
    const memoryCount = await prisma.conversationMemory.count();
    const companiesCount = await prisma.company.count();
    const ordersCount = await prisma.order.count();
    
    console.log(`📊 إحصائيات البيانات الحالية:`);
    console.log(`   - ذاكرة المحادثات: ${memoryCount} سجل`);
    console.log(`   - الشركات: ${companiesCount} شركة`);
    console.log(`   - الطلبات: ${ordersCount} طلب`);

    // 2. فحص سجلات ConversationMemory بدون companyId صحيح
    console.log('\n2️⃣ فحص سجلات ذاكرة المحادثات...');

    // فحص جميع السجلات أولاً
    const allMemories = await prisma.conversationMemory.findMany({
      select: {
        id: true,
        conversationId: true,
        companyId: true
      }
    });

    const invalidMemories = allMemories.filter(memory =>
      !memory.companyId ||
      memory.companyId === '' ||
      memory.companyId === 'undefined' ||
      memory.companyId === 'null'
    );

    if (invalidMemories.length > 0) {
      console.log(`⚠️ وجدت ${invalidMemories.length} سجل بـ companyId غير صحيح`);
      
      // محاولة إصلاح السجلات بناءً على conversationId
      for (const memory of invalidMemories) {
        try {
          // البحث عن المحادثة المرتبطة
          const conversation = await prisma.conversation.findUnique({
            where: { id: memory.conversationId },
            select: { companyId: true }
          });

          if (conversation && conversation.companyId) {
            await prisma.conversationMemory.update({
              where: { id: memory.id },
              data: { companyId: conversation.companyId }
            });
            console.log(`✅ تم إصلاح سجل ذاكرة: ${memory.id}`);
          } else {
            console.log(`❌ لا يمكن إصلاح سجل ذاكرة: ${memory.id} - محادثة غير موجودة`);
          }
        } catch (error) {
          console.error(`❌ خطأ في إصلاح سجل ${memory.id}:`, error.message);
        }
      }
    } else {
      console.log('✅ جميع سجلات ذاكرة المحادثات تحتوي على companyId صحيح');
    }

    // 3. فحص وتوحيد العملات
    console.log('\n3️⃣ توحيد العملات...');
    
    // تحديث الطلبات التي تستخدم SAR إلى EGP
    const sarOrders = await prisma.order.count({
      where: { currency: 'SAR' }
    });

    if (sarOrders > 0) {
      console.log(`🔄 تحديث ${sarOrders} طلب من SAR إلى EGP...`);
      
      const updateResult = await prisma.order.updateMany({
        where: { currency: 'SAR' },
        data: { currency: 'EGP' }
      });
      
      console.log(`✅ تم تحديث ${updateResult.count} طلب`);
    } else {
      console.log('✅ جميع الطلبات تستخدم العملة الصحيحة');
    }

    // 4. فحص الشركات
    console.log('\n4️⃣ فحص إعدادات الشركات...');
    
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        currency: true,
        aiSettings: {
          select: {
            id: true,
            personalityPrompt: true,
            responsePrompt: true
          }
        }
      }
    });

    console.log('\n📋 تقرير الشركات:');
    for (const company of companies) {
      console.log(`🏢 ${company.name} (${company.id}):`);
      console.log(`   💰 العملة: ${company.currency}`);
      console.log(`   🤖 إعدادات AI: ${company.aiSettings ? 'موجودة' : 'غير موجودة'}`);
      
      if (company.aiSettings) {
        console.log(`   👤 Personality Prompt: ${company.aiSettings.personalityPrompt ? 'موجود' : 'غير موجود'}`);
        console.log(`   📝 Response Prompt: ${company.aiSettings.responsePrompt ? 'موجود' : 'غير موجود'}`);
      }
    }

    // 5. إنشاء تقرير نهائي
    console.log('\n📊 التقرير النهائي:');
    console.log('═'.repeat(50));
    
    const finalStats = {
      totalMemories: await prisma.conversationMemory.count(),
      totalCompanies: await prisma.company.count(),
      totalOrders: await prisma.order.count(),
      companiesWithAI: await prisma.company.count({
        where: { aiSettings: { isNot: null } }
      }),
      companiesWithoutAI: await prisma.company.count({
        where: { aiSettings: null }
      })
    };

    console.log(`✅ إجمالي سجلات ذاكرة المحادثات: ${finalStats.totalMemories}`);
    console.log(`✅ إجمالي الشركات: ${finalStats.totalCompanies}`);
    console.log(`✅ إجمالي الطلبات: ${finalStats.totalOrders}`);
    console.log(`🤖 شركات لديها إعدادات AI: ${finalStats.companiesWithAI}`);
    console.log(`⚠️ شركات بدون إعدادات AI: ${finalStats.companiesWithoutAI}`);

    if (finalStats.companiesWithoutAI > 0) {
      console.log('\n🚨 تحذير: يوجد شركات بدون إعدادات AI - ستحتاج إنشاء إعدادات مخصصة لها');
    }

    console.log('\n🎉 تم إصلاح قاعدة البيانات بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إصلاح قاعدة البيانات:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
if (require.main === module) {
  fixDatabaseDefaults()
    .then(() => {
      console.log('✅ انتهى إصلاح قاعدة البيانات');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل إصلاح قاعدة البيانات:', error);
      process.exit(1);
    });
}

module.exports = { fixDatabaseDefaults };
