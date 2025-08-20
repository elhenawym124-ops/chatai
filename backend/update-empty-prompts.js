const DynamicPromptService = require('./src/services/dynamicPromptService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * سكريبت لتحديث الـ Prompts الفارغة بـ prompts مخصصة
 */

async function updateEmptyPrompts() {
  try {
    console.log('🚀 بدء تحديث الـ Prompts الفارغة...\n');

    const promptService = new DynamicPromptService();

    // البحث عن الشركات التي لديها إعدادات AI لكن بدون prompts مخصصة
    console.log('🔍 البحث عن الشركات التي تحتاج تحديث prompts...');
    
    const companiesWithEmptyPrompts = await prisma.company.findMany({
      where: {
        aiSettings: {
          OR: [
            { personalityPrompt: null },
            { personalityPrompt: '' },
            { responsePrompt: null },
            { responsePrompt: '' }
          ]
        }
      },
      include: {
        aiSettings: true
      }
    });

    if (companiesWithEmptyPrompts.length === 0) {
      console.log('✅ جميع الشركات لديها prompts مخصصة');
      return { success: true, updated: 0 };
    }

    console.log(`📋 وجدت ${companiesWithEmptyPrompts.length} شركة تحتاج تحديث prompts\n`);

    const results = [];
    for (const company of companiesWithEmptyPrompts) {
      console.log(`🏢 معالجة شركة: ${company.name}`);
      
      try {
        // توليد اسم المساعد
        const assistantName = promptService.generateAssistantName(company.name);
        
        // إنشاء الـ prompts
        const personalityPrompt = promptService.generatePersonalityPrompt(company, assistantName);
        const responsePrompt = promptService.generateResponsePrompt(company);
        
        // تحديث إعدادات AI
        await prisma.aiSettings.update({
          where: { companyId: company.id },
          data: {
            personalityPrompt,
            responsePrompt,
            updatedAt: new Date()
          }
        });

        console.log(`   ✅ تم تحديث prompts للشركة: ${company.name}`);
        console.log(`   👤 اسم المساعد: ${assistantName}`);
        console.log(`   🎯 نوع العمل المكتشف: ${promptService.detectBusinessType(company)}\n`);

        results.push({
          success: true,
          companyId: company.id,
          companyName: company.name,
          assistantName,
          businessType: promptService.detectBusinessType(company)
        });

      } catch (error) {
        console.error(`   ❌ خطأ في تحديث prompts للشركة ${company.name}:`, error.message);
        results.push({
          success: false,
          companyId: company.id,
          companyName: company.name,
          error: error.message
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`📊 النتائج:`);
    console.log(`✅ نجح: ${successful} شركة`);
    console.log(`❌ فشل: ${failed} شركة`);

    // عرض تفاصيل الشركات المحدثة
    if (successful > 0) {
      console.log('\n🎉 الشركات المحدثة:');
      console.log('═'.repeat(50));
      
      results.filter(r => r.success).forEach(result => {
        console.log(`🏢 ${result.companyName}:`);
        console.log(`   👤 المساعد: ${result.assistantName}`);
        console.log(`   🎯 نوع العمل: ${result.businessType}`);
        console.log('');
      });
    }

    return {
      success: true,
      updated: successful,
      failed: failed,
      results
    };

  } catch (error) {
    console.error('❌ خطأ في السكريبت:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
if (require.main === module) {
  updateEmptyPrompts()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ انتهى تحديث الـ Prompts بنجاح!');
        if (result.updated > 0) {
          console.log(`🎯 تم تحديث ${result.updated} شركة بـ prompts مخصصة`);
        }
      } else {
        console.error('\n❌ فشل في تحديث الـ Prompts:', result.error);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل السكريبت:', error);
      process.exit(1);
    });
}

module.exports = { updateEmptyPrompts };
