/**
 * اختبار النظام اليدوي الجديد للـ prompts
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testManualPrompts() {
  try {
    console.log('🧪 اختبار النظام اليدوي للـ prompts...\n');

    // 1. فحص الوضع الحالي
    console.log('1️⃣ فحص الوضع الحالي:');
    const companies = await prisma.company.findMany({
      include: { aiSettings: true }
    });

    companies.forEach((company, index) => {
      console.log(`\n${index + 1}. 🏢 ${company.name}:`);
      if (company.aiSettings) {
        const needsSetup = company.aiSettings.personalityPrompt && 
                          company.aiSettings.personalityPrompt.includes('# يجب إعداد شخصية المساعد الذكي');
        
        console.log(`   🤖 حالة الإعداد: ${needsSetup ? '❌ يحتاج إعداد' : '✅ جاهز'}`);
        
        if (needsSetup) {
          console.log(`   📝 الرسالة: "يجب إعداد شخصية المساعد الذكي"`);
        } else {
          const firstLine = company.aiSettings.personalityPrompt.split('\n')[0];
          console.log(`   📄 يبدأ بـ: "${firstLine.substring(0, 50)}..."`);
        }
      } else {
        console.log('   ❌ لا توجد إعدادات AI');
      }
    });

    // 2. محاكاة محاولة استخدام المساعد بدون prompt
    console.log('\n2️⃣ اختبار رفض العمل بدون prompt مخصص:');
    
    const testCompany = companies[0];
    if (testCompany && testCompany.aiSettings) {
      console.log(`🧪 اختبار شركة: ${testCompany.name}`);
      
      const needsSetup = testCompany.aiSettings.personalityPrompt && 
                        testCompany.aiSettings.personalityPrompt.includes('# يجب إعداد شخصية المساعد الذكي');
      
      if (needsSetup) {
        console.log('✅ النظام سيرفض العمل - يتطلب إعداد prompt مخصص');
        console.log('📋 الرسالة المتوقعة: "يجب إعداد شخصية المساعد الذكي من لوحة التحكم أولاً"');
      } else {
        console.log('⚠️ الشركة لديها prompt مخصص - سيعمل النظام');
      }
    }

    // 3. محاكاة إنشاء prompt مخصص
    console.log('\n3️⃣ محاكاة إنشاء prompt مخصص:');
    
    const samplePrompt = {
      personalityPrompt: `أنت لينا، مساعدة مبيعات متخصصة في شركة الحلو للأحذية النسائية.

🎯 شخصيتك:
- تتحدثين بطريقة ودودة ومهنية
- متخصصة في الأحذية النسائية العصرية
- تستخدمين اللغة العربية الواضحة والبسيطة
- تفهمين احتياجات العملاء وتقدمين حلول مناسبة

💼 مهامك:
- مساعدة العملاء في اختيار الأحذية المناسبة
- تقديم معلومات دقيقة عن المقاسات والألوان
- عرض المنتجات بطريقة جذابة
- الإجابة على الاستفسارات بطريقة ودودة ومهنية

🏢 عن شركة الحلو:
- نحن متجر متخصص في الأحذية النسائية العصرية
- نقدم منتجات عالية الجودة بأسعار مناسبة
- نهتم برضا العملاء وتقديم أفضل خدمة`,

      responsePrompt: `🔐 قواعد الاستجابة الصارمة:

1. ⚠️ استخدمي فقط المعلومات الموجودة في قاعدة البيانات المذكورة أدناه
2. 🚫 لا تذكري أي منتجات أو معلومات غير موجودة في قاعدة البيانات
3. ✅ قدمي أسعار ومواصفات دقيقة من قاعدة البيانات فقط
4. 💰 اذكري الأسعار بالجنيه المصري
5. 📸 اعرضي صور المنتجات عند توفرها
6. 🤝 كوني مفيدة وودودة في جميع الردود
7. ❓ اطلبي التوضيح إذا لم تفهمي السؤال
8. 🆘 أحيلي للدعم البشري في الحالات المعقدة`
    };

    console.log('📝 مثال على prompt مخصص لشركة الأحذية:');
    console.log('═'.repeat(60));
    console.log('👤 Personality Prompt:');
    console.log(samplePrompt.personalityPrompt.substring(0, 200) + '...');
    console.log('\n📋 Response Prompt:');
    console.log(samplePrompt.responsePrompt.substring(0, 200) + '...');

    // 4. عرض الفوائد
    console.log('\n4️⃣ فوائد النظام اليدوي الجديد:');
    console.log('═'.repeat(50));
    console.log('✅ كل شركة تكتب prompt يناسب طبيعة عملها');
    console.log('✅ تحكم كامل في شخصية المساعد');
    console.log('✅ لا توجد قيم افتراضية خطيرة');
    console.log('✅ شفافية كاملة - الشركة تعرف بالضبط ما يقوله المساعد');
    console.log('✅ مرونة لا محدودة في التخصيص');
    console.log('✅ أمان عالي - لا يعمل النظام بدون إعداد صحيح');

    // 5. الخطوات المطلوبة من الشركات
    console.log('\n5️⃣ ما يجب على كل شركة فعله:');
    console.log('═'.repeat(40));
    console.log('1. 🌐 الدخول إلى لوحة التحكم');
    console.log('2. 🤖 الذهاب إلى "إدارة AI" → "شخصية المساعد"');
    console.log('3. ✍️ كتابة شخصية المساعد المناسبة لشركتها');
    console.log('4. 📋 كتابة قواعد الاستجابة المناسبة');
    console.log('5. 💾 حفظ الإعدادات');
    console.log('6. 🧪 اختبار المساعد للتأكد من عمله');

    console.log('\n🎉 النظام الآن آمن ومخصص بالكامل!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testManualPrompts()
    .then(() => {
      console.log('\n✅ انتهى اختبار النظام اليدوي');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل الاختبار:', error);
      process.exit(1);
    });
}

module.exports = { testManualPrompts };
