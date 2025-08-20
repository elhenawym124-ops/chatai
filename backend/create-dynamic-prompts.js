const DynamicPromptService = require('./src/services/dynamicPromptService');

/**
 * سكريبت لإنشاء إعدادات AI مخصصة لجميع الشركات
 */

async function createDynamicPrompts() {
  try {
    console.log('🚀 بدء إنشاء الـ Prompts الديناميكية...\n');

    const promptService = new DynamicPromptService();

    // إنشاء إعدادات للشركات التي لا تملك إعدادات
    const result = await promptService.createMissingAISettings();

    if (result.success) {
      console.log('\n🎉 تم إنشاء الـ Prompts الديناميكية بنجاح!');
      
      if (result.created > 0) {
        console.log(`✅ تم إنشاء إعدادات لـ ${result.created} شركة`);
      }
      
      if (result.failed > 0) {
        console.log(`⚠️ فشل في إنشاء إعدادات لـ ${result.failed} شركة`);
      }
    } else {
      console.error('❌ فشل في إنشاء الـ Prompts:', result.error);
    }

  } catch (error) {
    console.error('❌ خطأ في السكريبت:', error);
    process.exit(1);
  }
}

// تشغيل السكريبت
if (require.main === module) {
  createDynamicPrompts()
    .then(() => {
      console.log('\n✅ انتهى إنشاء الـ Prompts الديناميكية');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل السكريبت:', error);
      process.exit(1);
    });
}

module.exports = { createDynamicPrompts };
