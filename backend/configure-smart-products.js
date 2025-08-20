const { PrismaClient } = require('@prisma/client');

/**
 * تكوين اقتراح المنتجات الذكي
 * يقوم بتحديث النظام ليقترح المنتجات فقط عند الحاجة وليس في كل رد
 */

async function configureSmartProductSuggestions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧠 بدء تكوين اقتراح المنتجات الذكي...\n');
    
    // الحصول على جميع الشركات
    const companies = await prisma.company.findMany({
      select: { id: true, name: true }
    });
    
    console.log(`📊 تم العثور على ${companies.length} شركة\n`);
    
    for (const company of companies) {
      console.log(`🏢 معالجة الشركة: ${company.name} (${company.id})`);
      
      // تحديث إعدادات الذكاء الصناعي للاقتراح الذكي
      const aiSettings = await prisma.aiSettings.upsert({
        where: { companyId: company.id },
        update: {
          autoSuggestProducts: true,   // مفعل لكن بشروط
          maxSuggestions: 2,           // عدد قليل من الاقتراحات
          includeImages: true,         // تضمين صور
          confidenceThreshold: 0.8,    // ثقة عالية فقط
          updatedAt: new Date()
        },
        create: {
          companyId: company.id,
          autoReplyEnabled: true,
          autoSuggestProducts: true,
          maxSuggestions: 2,
          includeImages: true,
          confidenceThreshold: 0.8,    // ثقة عالية
          personalityPrompt: null,
          responsePrompt: null,
          escalationRules: '{}',
          modelSettings: JSON.stringify({
            productSuggestionRules: {
              onlyWhenAsked: true,           // فقط عند السؤال
              keywordTriggers: [             // كلمات محددة تفعل الاقتراح
                'منتج', 'منتجات', 'أريد', 'اشتري', 'اعرض',
                'ما عندك', 'ايه اللي عندك', 'شو عندك',
                'أفضل', 'أحسن', 'جديد', 'شائع', 'مشهور'
              ],
              excludeGreetings: true,        // لا تقترح مع التحيات
              excludeQuestions: [            // لا تقترح مع هذه الأسئلة
                'مرحبا', 'السلام عليكم', 'أهلا',
                'كيف الحال', 'شلونك', 'ازيك',
                'شكرا', 'مع السلامة', 'باي'
              ]
            }
          })
        }
      });
      
      console.log(`   ✅ تم تحديث إعدادات الشركة ${company.name}`);
      console.log(`   🧠 اقتراح ذكي: ${aiSettings.autoSuggestProducts ? 'مفعل' : 'معطل'}`);
      console.log(`   🔢 عدد الاقتراحات: ${aiSettings.maxSuggestions}`);
      console.log(`   🎯 مستوى الثقة: ${aiSettings.confidenceThreshold}`);
      console.log('');
    }
    
    // تحديث إعدادات النظام في جدول الشركة
    console.log('🔧 تحديث إعدادات النظام في بيانات الشركة...');

    for (const company of companies) {
      // تحديث إعدادات الشركة لتفعيل النظام الذكي
      await prisma.company.update({
        where: { id: company.id },
        data: {
          settings: JSON.stringify({
            aiSystem: {
              mode: 'hybrid',
              smartSuggestions: true,
              autoSuggestProducts: true,
              useAdvancedTools: true
            }
          })
        }
      });

      console.log(`   ✅ تم تحديث إعدادات الشركة ${company.name}`);
    }
    
    console.log('\n🎉 تم تكوين اقتراح المنتجات الذكي بنجاح!');
    console.log('\n📋 التغييرات المطبقة:');
    console.log('   🧠 اقتراح المنتجات الذكي (فقط عند الحاجة)');
    console.log('   🎯 مستوى ثقة عالي (0.8)');
    console.log('   🔢 عدد اقتراحات قليل (2 منتج)');
    console.log('   ✅ النظام الذكي مفعل');
    console.log('   🚫 لا اقتراحات مع التحيات البسيطة');
    
    console.log('\n💡 الآن سيقترح المنتجات فقط عندما:');
    console.log('   • يسأل العميل عن منتجات صراحة');
    console.log('   • يستخدم كلمات مثل "أريد" أو "اعرض"');
    console.log('   • يطلب الأفضل أو الجديد');
    console.log('   • لن يقترح مع "مرحبا" أو "شكرا"');
    
  } catch (error) {
    console.error('❌ خطأ في تكوين اقتراح المنتجات الذكي:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الدالة
configureSmartProductSuggestions();
