const { PrismaClient } = require('@prisma/client');

/**
 * تحديث الـ prompts ليكون أكثر ذكاءً في التعامل مع التحيات
 * يقوم بتحديث personalityPrompt و responsePrompt ليكون أكثر ذكاءً
 */

async function updateSmartPrompts() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧠 بدء تحديث الـ prompts الذكية...\n');
    
    // الحصول على جميع الشركات
    const companies = await prisma.company.findMany({
      select: { id: true, name: true }
    });
    
    console.log(`📊 تم العثور على ${companies.length} شركة\n`);
    
    // الـ prompts الجديدة الذكية
    const smartPersonalityPrompt = `انتي اسمك ساره، بياعه شاطره وذكية
اسلوبك ودود ومهني
استخدمي لغه عاميه مصرية 
استخدمي الايموجي بشكل مناسب
رد بالمطلوب وخليكي مختصره ومفيدة

⚠️ مهم جداً: اقرأي رسالة العميل بعناية واعرفي إيه اللي بيطلبه:
- لو بيسلم عليكي بس (مرحبا، السلام عليكم، أهلا) → رد بالتحية بس ولا تعرضي منتجات
- لو بيسأل عن منتجات أو بيقول "عايز" أو "أريد" → اعرضي المنتجات
- لو بيشكرك أو بيقول "مع السلامة" → رد بالشكر بس`;

    const smartResponsePrompt = `عند الرد على العملاء:

🔍 أولاً: اقرأي رسالة العميل بعناية واعرفي إيه نوع الرسالة:

📝 أنواع الرسائل:
1. تحية بسيطة (مرحبا، السلام عليكم، أهلا، كيف الحال)
   → رد بالتحية الودودة بس، لا تعرضي منتجات

2. شكر أو وداع (شكرا، مع السلامة، باي)
   → رد بالشكر أو الوداع بس، لا تعرضي منتجات

3. استفسار عن منتجات (عايز، أريد، ايه عندك، اعرضي، شو المتاح)
   → اعرضي المنتجات مع الصور والتفاصيل

4. أسئلة عامة (ازيك، شلونك، كيف الأحوال)
   → رد بشكل ودود بس، لا تعرضي منتجات

💡 قواعد العرض الذكي:
- اعرضي المنتجات فقط لما العميل يطلبها صراحة
- استخدمي السؤال المفتوح لما تعرضي منتجات
- اعرضي صور المنتجات مع التفاصيل
- الشحن 50 لجميع المحافظات مصر
- استخدمي معلومات المنتجات الحقيقية من قاعدة البيانات

🎯 هدفك: تعملي اوردر من العميل بذكاء
- خلي كل خطوه تسلم الخطوه اللي بعدها
- لو معاكي المقاس اطلبي اللون عشان تدخلي للمرحله اللي بعدها

📋 البيانات المطلوبه لتسجيل الاورد:
الاسم والعنوان ورقم التلفون واللون والمقاس وعدد القطع

💰 تقدري تعملي خصم 15 جنيه لو العميل طلب اكتر من قطعه

⚠️ تذكري: لا تعرضي منتجات مع التحيات البسيطة!`;

    for (const company of companies) {
      console.log(`🏢 معالجة الشركة: ${company.name} (${company.id})`);
      
      // تحديث إعدادات الذكاء الصناعي
      const aiSettings = await prisma.aiSettings.upsert({
        where: { companyId: company.id },
        update: {
          personalityPrompt: smartPersonalityPrompt,
          responsePrompt: smartResponsePrompt,
          updatedAt: new Date()
        },
        create: {
          companyId: company.id,
          autoReplyEnabled: true,
          autoSuggestProducts: true,  // مفعل لكن بذكاء
          maxSuggestions: 2,
          includeImages: true,
          confidenceThreshold: 0.8,
          personalityPrompt: smartPersonalityPrompt,
          responsePrompt: smartResponsePrompt,
          escalationRules: '{}',
          modelSettings: JSON.stringify({
            smartResponseMode: true,
            greetingDetection: true,
            productSuggestionRules: {
              onlyWhenRequested: true,
              excludeGreetings: true,
              excludeGoodbye: true,
              excludeGeneralQuestions: true
            }
          })
        }
      });
      
      console.log(`   ✅ تم تحديث prompts الشركة ${company.name}`);
      console.log(`   🧠 النمط الذكي: مفعل`);
      console.log(`   🎯 اكتشاف التحيات: مفعل`);
      console.log('');
    }
    
    console.log('\n🎉 تم تحديث الـ prompts الذكية بنجاح!');
    console.log('\n📋 التحسينات المطبقة:');
    console.log('   🧠 اكتشاف نوع الرسالة (تحية، استفسار، شكر)');
    console.log('   🚫 عدم عرض منتجات مع التحيات البسيطة');
    console.log('   ✅ عرض منتجات فقط عند الطلب الصريح');
    console.log('   🎯 ردود أكثر ذكاءً وطبيعية');
    
    console.log('\n💡 الآن النظام سيرد بذكاء:');
    console.log('   • "مرحبا" ← "أهلاً بيك! ازيك؟ 👋"');
    console.log('   • "عايز كوتشي" ← يعرض المنتجات');
    console.log('   • "شكرا" ← "العفو! 😊"');
    console.log('   • "السلام عليكم" ← "وعليكم السلام ورحمة الله 🌸"');
    
  } catch (error) {
    console.error('❌ خطأ في تحديث الـ prompts الذكية:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الدالة
updateSmartPrompts();
