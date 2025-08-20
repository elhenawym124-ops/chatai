/**
 * مسح الـ prompts التلقائية وإجبار الشركات على كتابة prompts مخصصة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAutoPrompts() {
  try {
    console.log('🧹 بدء مسح الـ prompts التلقائية...\n');

    // 1. عرض الوضع الحالي
    console.log('1️⃣ فحص الوضع الحالي:');
    const companies = await prisma.company.findMany({
      include: { aiSettings: true }
    });

    console.log(`📊 إجمالي الشركات: ${companies.length}`);
    
    companies.forEach((company, index) => {
      console.log(`\n${index + 1}. 🏢 ${company.name}:`);
      if (company.aiSettings) {
        const hasPersonality = company.aiSettings.personalityPrompt && 
                              company.aiSettings.personalityPrompt.trim() !== '';
        const hasResponse = company.aiSettings.responsePrompt && 
                           company.aiSettings.responsePrompt.trim() !== '';
        
        console.log(`   👤 Personality Prompt: ${hasPersonality ? '✅ موجود' : '❌ فارغ'}`);
        console.log(`   📝 Response Prompt: ${hasResponse ? '✅ موجود' : '❌ فارغ'}`);
        
        if (hasPersonality) {
          const firstLine = company.aiSettings.personalityPrompt.split('\n')[0];
          console.log(`   📄 يبدأ بـ: "${firstLine.substring(0, 50)}..."`);
        }
      } else {
        console.log('   ❌ لا توجد إعدادات AI');
      }
    });

    // 2. مسح الـ prompts التلقائية
    console.log('\n2️⃣ مسح الـ prompts التلقائية:');
    
    const result = await prisma.aiSettings.updateMany({
      data: {
        personalityPrompt: null,
        responsePrompt: null,
        updatedAt: new Date()
      }
    });

    console.log(`✅ تم مسح prompts من ${result.count} إعداد AI`);

    // 3. إضافة رسائل توضيحية
    console.log('\n3️⃣ إضافة رسائل توضيحية:');
    
    for (const company of companies) {
      if (company.aiSettings) {
        await prisma.aiSettings.update({
          where: { companyId: company.id },
          data: {
            personalityPrompt: `# يجب إعداد شخصية المساعد الذكي

يرجى كتابة شخصية المساعد الذكي الخاص بشركتك هنا.

مثال:
أنت [اسم المساعد]، مساعدة مبيعات متخصصة في [اسم الشركة].

أسلوبك:
- ودود ومهني
- متخصص في [نوع المنتجات]
- يستخدم اللغة العربية الواضحة

مهامك:
- مساعدة العملاء في اختيار المنتجات
- تقديم معلومات دقيقة عن الأسعار
- الإجابة على الاستفسارات بطريقة مفيدة`,
            
            responsePrompt: `# قواعد الاستجابة

يرجى كتابة قواعد الاستجابة الخاصة بشركتك هنا.

مثال:
1. استخدم فقط المعلومات الموجودة في قاعدة البيانات
2. لا تذكر منتجات غير متوفرة
3. اذكر الأسعار بعملة [العملة]
4. كن مفيداً وودوداً في جميع الردود`,
            
            updatedAt: new Date()
          }
        });
        
        console.log(`✅ تم إضافة رسالة توضيحية للشركة: ${company.name}`);
      }
    }

    // 4. عرض النتائج النهائية
    console.log('\n4️⃣ النتائج النهائية:');
    console.log('═'.repeat(50));
    console.log('✅ تم مسح جميع الـ prompts التلقائية');
    console.log('✅ تم إضافة رسائل توضيحية لجميع الشركات');
    console.log('✅ النظام الآن يتطلب prompts يدوية من كل شركة');
    
    console.log('\n📋 ما يجب على كل شركة فعله:');
    console.log('1. الدخول إلى لوحة التحكم');
    console.log('2. الذهاب إلى إعدادات المساعد الذكي');
    console.log('3. كتابة شخصية المساعد المناسبة لشركتها');
    console.log('4. كتابة قواعد الاستجابة المناسبة');
    console.log('5. حفظ الإعدادات');

    console.log('\n⚠️ تحذير مهم:');
    console.log('المساعد الذكي لن يعمل حتى تقوم كل شركة بإعداد prompts مخصصة!');

  } catch (error) {
    console.error('❌ خطأ في مسح الـ prompts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل المسح
if (require.main === module) {
  clearAutoPrompts()
    .then(() => {
      console.log('\n✅ انتهى مسح الـ prompts التلقائية');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل مسح الـ prompts:', error);
      process.exit(1);
    });
}

module.exports = { clearAutoPrompts };
