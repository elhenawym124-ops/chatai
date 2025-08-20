/**
 * فحص إعدادات AI الحقيقية في قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRealAISettings() {
  console.log('🔍 فحص إعدادات AI الحقيقية...');
  console.log('='.repeat(60));

  try {
    // 1. فحص صفحة Swan-store
    const swanPage = await prisma.facebookPage.findFirst({
      where: { pageId: '675323792321557' },
      include: { company: true }
    });

    if (!swanPage) {
      console.log('❌ لم يتم العثور على صفحة Swan-store');
      return;
    }

    console.log(`✅ صفحة Swan-store موجودة:`);
    console.log(`   اسم الصفحة: ${swanPage.pageName}`);
    console.log(`   الشركة: ${swanPage.company.name} (${swanPage.companyId})`);
    console.log(`   نشط: ${swanPage.isActive}`);

    // 2. فحص إعدادات AI للشركة
    const aiSettings = await prisma.aiSettings.findUnique({
      where: { companyId: swanPage.companyId }
    });

    console.log(`\n⚙️ إعدادات AI للشركة:`);
    if (aiSettings) {
      console.log(`   ✅ إعدادات AI موجودة:`);
      console.log(`   - aiEnabled: ${aiSettings.aiEnabled}`);
      console.log(`   - autoResponse: ${aiSettings.autoResponse}`);
      console.log(`   - autoReplyEnabled: ${aiSettings.autoReplyEnabled}`);
      console.log(`   - workingHoursEnabled: ${aiSettings.workingHoursEnabled}`);
      console.log(`   - maxRepliesPerCustomer: ${aiSettings.maxRepliesPerCustomer}`);
      console.log(`   - multimodalEnabled: ${aiSettings.multimodalEnabled}`);
      console.log(`   - ragEnabled: ${aiSettings.ragEnabled}`);
      console.log(`   - model: ${aiSettings.model}`);
      console.log(`   - workingHours: ${aiSettings.workingHours}`);
    } else {
      console.log(`   ❌ لا توجد إعدادات AI للشركة`);
    }

    // 3. فحص مفاتيح Gemini
    const geminiKeys = await prisma.geminiKey.findMany({
      where: { companyId: swanPage.companyId }
    });

    console.log(`\n🔑 مفاتيح Gemini للشركة (${geminiKeys.length}):`);
    geminiKeys.forEach((key, index) => {
      console.log(`   ${index + 1}. ${key.keyName || 'بدون اسم'}`);
      console.log(`      نشط: ${key.isActive}`);
      console.log(`      النموذج: ${key.model}`);
      console.log(`      المفتاح: ${key.apiKey.substring(0, 20)}...`);
      console.log(`      تاريخ الإنشاء: ${key.createdAt}`);
    });

    // 4. اختبار الإعدادات كما يراها النظام
    console.log(`\n🧪 اختبار الإعدادات كما يراها النظام:`);
    
    // محاكاة ما يحدث في aiAgentService.getSettings()
    const testSettings = {
      isEnabled: aiSettings?.autoReplyEnabled || false,
      workingHours: aiSettings?.workingHours ? JSON.parse(aiSettings.workingHours) : { start: '09:00', end: '18:00' },
      workingHoursEnabled: aiSettings?.workingHoursEnabled || false,
      maxRepliesPerCustomer: aiSettings?.maxRepliesPerCustomer || 5,
      multimodalEnabled: aiSettings?.multimodalEnabled || true,
      ragEnabled: aiSettings?.ragEnabled || true,
      learningEnabled: true
    };

    console.log(`   النظام يرى الإعدادات كالتالي:`);
    console.log(`   - isEnabled: ${testSettings.isEnabled} ⚠️`);
    console.log(`   - workingHoursEnabled: ${testSettings.workingHoursEnabled}`);
    console.log(`   - maxRepliesPerCustomer: ${testSettings.maxRepliesPerCustomer}`);
    console.log(`   - multimodalEnabled: ${testSettings.multimodalEnabled}`);
    console.log(`   - ragEnabled: ${testSettings.ragEnabled}`);

    // 5. تحليل المشكلة
    console.log(`\n🔍 تحليل المشكلة:`);
    
    const issues = [];
    
    if (!swanPage.isActive) {
      issues.push('❌ الصفحة غير نشطة');
    }
    
    if (!aiSettings) {
      issues.push('❌ لا توجد إعدادات AI للشركة');
    } else {
      if (!aiSettings.autoReplyEnabled) {
        issues.push('❌ autoReplyEnabled = false (هذا هو السبب الرئيسي!)');
      }
      if (!aiSettings.aiEnabled) {
        issues.push('❌ aiEnabled = false');
      }
      if (!aiSettings.autoResponse) {
        issues.push('❌ autoResponse = false');
      }
    }
    
    const activeKeys = geminiKeys.filter(k => k.isActive);
    if (activeKeys.length === 0) {
      issues.push('❌ لا توجد مفاتيح Gemini نشطة');
    }

    if (issues.length > 0) {
      console.log(`\n🚨 المشاكل المكتشفة:`);
      issues.forEach(issue => console.log(`   ${issue}`));
      
      console.log(`\n💡 الحل المطلوب:`);
      if (!aiSettings) {
        console.log(`   1. إنشاء إعدادات AI للشركة`);
      } else {
        if (!aiSettings.autoReplyEnabled) {
          console.log(`   1. تفعيل autoReplyEnabled`);
        }
        if (!aiSettings.aiEnabled) {
          console.log(`   2. تفعيل aiEnabled`);
        }
        if (!aiSettings.autoResponse) {
          console.log(`   3. تفعيل autoResponse`);
        }
      }
      if (!swanPage.isActive) {
        console.log(`   4. تفعيل الصفحة`);
      }
      if (activeKeys.length === 0) {
        console.log(`   5. تفعيل مفتاح Gemini`);
      }
    } else {
      console.log(`   ✅ جميع الإعدادات صحيحة`);
    }

    // 6. فحص آخر رسالة للتأكد
    const lastMessage = await prisma.message.findFirst({
      where: {
        conversation: {
          companyId: swanPage.companyId
        },
        isFromCustomer: true
      },
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: {
          include: { customer: true }
        }
      }
    });

    if (lastMessage) {
      console.log(`\n📨 آخر رسالة من عميل:`);
      console.log(`   التاريخ: ${lastMessage.createdAt}`);
      console.log(`   المحتوى: ${lastMessage.content.substring(0, 50)}...`);
      console.log(`   العميل: ${lastMessage.conversation.customer.facebookId}`);
      
      // فحص إذا كان هناك رد
      const botReply = await prisma.message.findFirst({
        where: {
          conversationId: lastMessage.conversationId,
          isFromCustomer: false,
          createdAt: { gt: lastMessage.createdAt }
        }
      });
      
      console.log(`   رد البوت: ${botReply ? 'موجود' : 'غير موجود ❌'}`);
    }

  } catch (error) {
    console.error('❌ خطأ في فحص الإعدادات:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
checkRealAISettings().catch(console.error);
