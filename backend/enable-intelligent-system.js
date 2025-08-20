const { PrismaClient } = require('@prisma/client');

/**
 * تفعيل النظام الذكي الجديد
 * يقوم بتحديث إعدادات الشركة لاستخدام النظام الذكي الطبيعي
 */

async function enableIntelligentSystem() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧠 بدء تفعيل النظام الذكي الطبيعي...\n');
    
    // الحصول على جميع الشركات
    const companies = await prisma.company.findMany({
      select: { id: true, name: true }
    });
    
    console.log(`📊 تم العثور على ${companies.length} شركة\n`);
    
    for (const company of companies) {
      console.log(`🏢 معالجة الشركة: ${company.name} (${company.id})`);
      
      // تحديث إعدادات الذكاء الصناعي للنظام الذكي
      const aiSettings = await prisma.aiSettings.upsert({
        where: { companyId: company.id },
        update: {
          // إعدادات النظام الذكي
          autoSuggestProducts: true,  // مفعل لكن بذكاء
          maxSuggestions: 3,          // عدد مناسب
          includeImages: true,        // تضمين صور
          confidenceThreshold: 0.8,   // ثقة عالية
          
          // Prompts ذكية جديدة
          personalityPrompt: `أنت ساره، مساعدة مبيعات ذكية وطبيعية
- تتحدثين بطريقة ودودة ومهنية
- تستخدمين اللغة العامية المصرية
- تفهمين نية العميل قبل اقتراح المنتجات
- لا تقترحي منتجات مع التحيات البسيطة
- تقترحي المنتجات فقط عند الحاجة الفعلية`,

          responsePrompt: `قواعد الرد الذكي:

🧠 تحليل نية العميل:
- تحية بسيطة (مرحبا، السلام عليكم) → رد بالتحية فقط
- طلب منتجات (عايز، أريد، اعرض) → اعرضي المنتجات
- سؤال عن خدمة (شحن، دفع) → أجيبي على السؤال
- شكر ووداع → رد مناسب بدون منتجات

💬 أسلوب المحادثة:
- طبيعي وودود
- مختصر ومفيد
- استخدام الإيموجي بذكاء
- أسئلة تفاعلية مناسبة

🛍️ عرض المنتجات:
- فقط عند الطلب الصريح
- مع الصور والتفاصيل
- أسعار واضحة
- سؤال تفاعلي في النهاية`,

          modelSettings: JSON.stringify({
            systemType: 'intelligent-natural',
            version: '1.0',
            features: {
              intentDetection: true,
              contextAwareness: true,
              naturalConversation: true,
              smartProductSuggestion: true,
              sentimentAnalysis: true,
              conversationMemory: true
            },
            rules: {
              noProductsWithGreetings: true,
              noProductsWithThanks: true,
              onlyWhenRequested: true,
              contextualSuggestions: true
            }
          }),
          
          updatedAt: new Date()
        },
        create: {
          companyId: company.id,
          autoReplyEnabled: true,
          autoSuggestProducts: true,
          maxSuggestions: 3,
          includeImages: true,
          confidenceThreshold: 0.8,
          personalityPrompt: `أنت ساره، مساعدة مبيعات ذكية وطبيعية
- تتحدثين بطريقة ودودة ومهنية
- تستخدمين اللغة العامية المصرية
- تفهمين نية العميل قبل اقتراح المنتجات
- لا تقترحي منتجات مع التحيات البسيطة
- تقترحي المنتجات فقط عند الحاجة الفعلية`,
          responsePrompt: `قواعد الرد الذكي:

🧠 تحليل نية العميل:
- تحية بسيطة (مرحبا، السلام عليكم) → رد بالتحية فقط
- طلب منتجات (عايز، أريد، اعرض) → اعرضي المنتجات
- سؤال عن خدمة (شحن، دفع) → أجيبي على السؤال
- شكر ووداع → رد مناسب بدون منتجات

💬 أسلوب المحادثة:
- طبيعي وودود
- مختصر ومفيد
- استخدام الإيموجي بذكاء
- أسئلة تفاعلية مناسبة

🛍️ عرض المنتجات:
- فقط عند الطلب الصريح
- مع الصور والتفاصيل
- أسعار واضحة
- سؤال تفاعلي في النهاية`,
          escalationRules: '{}',
          modelSettings: JSON.stringify({
            systemType: 'intelligent-natural',
            version: '1.0',
            features: {
              intentDetection: true,
              contextAwareness: true,
              naturalConversation: true,
              smartProductSuggestion: true,
              sentimentAnalysis: true,
              conversationMemory: true
            }
          })
        }
      });
      
      console.log(`   ✅ تم تحديث إعدادات الذكاء الصناعي`);
      console.log(`   🧠 النظام الذكي: مفعل`);
      console.log(`   🎯 اكتشاف النية: مفعل`);
      console.log(`   💬 المحادثة الطبيعية: مفعلة`);
      console.log('');
    }
    
    console.log('\n🎉 تم تفعيل النظام الذكي الطبيعي بنجاح!');
    console.log('\n📋 المميزات الجديدة:');
    console.log('   🧠 تحليل نية العميل الذكي');
    console.log('   💬 محادثة طبيعية وودودة');
    console.log('   🎯 اقتراح منتجات حسب السياق');
    console.log('   🚫 عدم إزعاج العملاء بمنتجات غير مطلوبة');
    console.log('   📊 تحليل المشاعر والسياق');
    console.log('   🧠 ذاكرة محادثة ذكية');
    
    console.log('\n💡 كيفية الاستخدام:');
    console.log('   • النظام سيعمل تلقائياً مع الرسائل الجديدة');
    console.log('   • يمكن اختباره عبر: POST /api/v1/ai/test-intelligent');
    console.log('   • مراقبة الإحصائيات عبر: GET /api/v1/ai/intelligent-analytics');
    console.log('   • استخدام النظام عبر: POST /api/v1/ai/intelligent-response');
    
    console.log('\n🔄 إعادة تشغيل الخادم مطلوبة لتفعيل النظام الجديد');
    
  } catch (error) {
    console.error('❌ خطأ في تفعيل النظام الذكي:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الدالة
enableIntelligentSystem();
