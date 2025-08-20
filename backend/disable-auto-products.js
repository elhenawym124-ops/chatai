const { PrismaClient } = require('@prisma/client');

/**
 * إيقاف اقتراح المنتجات التلقائي
 * يقوم بتحديث إعدادات الذكاء الصناعي لإيقاف اقتراح المنتجات في كل رد
 */

async function disableAutoProductSuggestions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 بدء إيقاف اقتراح المنتجات التلقائي...\n');
    
    // الحصول على جميع الشركات
    const companies = await prisma.company.findMany({
      select: { id: true, name: true }
    });
    
    console.log(`📊 تم العثور على ${companies.length} شركة\n`);
    
    for (const company of companies) {
      console.log(`🏢 معالجة الشركة: ${company.name} (${company.id})`);
      
      // تحديث أو إنشاء إعدادات الذكاء الصناعي
      const aiSettings = await prisma.aiSettings.upsert({
        where: { companyId: company.id },
        update: {
          autoSuggestProducts: false,  // إيقاف اقتراح المنتجات
          maxSuggestions: 0,           // عدم اقتراح أي منتجات
          includeImages: false,        // عدم تضمين صور
          updatedAt: new Date()
        },
        create: {
          companyId: company.id,
          autoReplyEnabled: true,      // الرد التلقائي مفعل
          autoSuggestProducts: false,  // اقتراح المنتجات معطل
          maxSuggestions: 0,
          includeImages: false,
          confidenceThreshold: 0.7,
          personalityPrompt: null,
          responsePrompt: null,
          escalationRules: '{}',
          modelSettings: '{}'
        }
      });
      
      console.log(`   ✅ تم تحديث إعدادات الشركة ${company.name}`);
      console.log(`   📦 اقتراح المنتجات: ${aiSettings.autoSuggestProducts ? 'مفعل' : 'معطل'}`);
      console.log(`   🔢 عدد الاقتراحات: ${aiSettings.maxSuggestions}`);
      console.log('');
    }
    
    // تحديث إعدادات النظام العامة
    console.log('🔧 تحديث إعدادات النظام العامة...');
    
    for (const company of companies) {
      await prisma.systemConfig.upsert({
        where: { companyId: company.id },
        update: {
          settings: {
            autoReplyEnabled: true,
            autoSuggestProducts: false,  // إيقاف اقتراح المنتجات
            useAdvancedTools: false      // إيقاف الأدوات المتقدمة
          },
          updatedAt: new Date()
        },
        create: {
          companyId: company.id,
          systemMode: 'traditional',
          traditionalEnabled: true,
          advancedEnabled: false,
          hybridEnabled: true,
          currentSystem: 'traditional',
          settings: {
            autoReplyEnabled: true,
            autoSuggestProducts: false,
            useAdvancedTools: false
          }
        }
      });
      
      console.log(`   ✅ تم تحديث إعدادات النظام للشركة ${company.name}`);
    }
    
    console.log('\n🎉 تم إيقاف اقتراح المنتجات التلقائي بنجاح!');
    console.log('\n📋 التغييرات المطبقة:');
    console.log('   ❌ إيقاف اقتراح المنتجات التلقائي');
    console.log('   ❌ إيقاف تضمين صور المنتجات');
    console.log('   ❌ إيقاف الأدوات المتقدمة');
    console.log('   ✅ الرد التلقائي لا يزال مفعل');
    console.log('   ✅ النظام التقليدي مفعل');
    
    console.log('\n💡 ملاحظة: يمكنك إعادة تفعيل اقتراح المنتجات لاحقاً من لوحة التحكم');
    
  } catch (error) {
    console.error('❌ خطأ في إيقاف اقتراح المنتجات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الدالة
disableAutoProductSuggestions();
