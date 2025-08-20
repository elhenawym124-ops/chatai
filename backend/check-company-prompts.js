const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCompanyPrompts() {
  try {
    console.log('🔍 فحص إعدادات شركة الحلو...\n');
    
    // 1. فحص بيانات الشركة
    const company = await prisma.company.findUnique({
      where: { id: await getCompanyByName('الحلو') },
      include: {
        aiSettings: true,
        facebookPages: true
      }
    });
    
    if (!company) {
      console.log('❌ لم يتم العثور على الشركة');
      return;
    }
    
    console.log('🏢 بيانات الشركة:');
    console.log(`   الاسم: ${company.name}`);
    console.log(`   النوع: ${company.businessType || 'غير محدد'}`);
    console.log(`   ID: ${company.id}`);
    
    console.log('\n📱 الصفحات المربوطة:');
    company.facebookPages.forEach(page => {
      console.log(`   - ${page.pageName} (${page.pageId})`);
    });
    
    // 2. فحص إعدادات AI
    console.log('\n⚙️ إعدادات AI:');
    if (company.aiSettings && company.aiSettings.length > 0) {
      const ai = company.aiSettings[0];
      console.log('   ✅ إعدادات AI موجودة');
      console.log(`   🤖 autoReplyEnabled: ${ai.autoReplyEnabled}`);
      console.log(`   📊 confidenceThreshold: ${ai.confidenceThreshold}`);
      
      console.log('\n👤 personalityPrompt:');
      if (ai.personalityPrompt) {
        console.log('   ✅ موجود');
        console.log('   📝 المحتوى:');
        console.log(`   "${ai.personalityPrompt}"`);
      } else {
        console.log('   ❌ غير موجود');
      }
      
      console.log('\n📝 responsePrompt:');
      if (ai.responsePrompt) {
        console.log('   ✅ موجود');
        console.log('   📝 المحتوى:');
        console.log(`   "${ai.responsePrompt}"`);
      } else {
        console.log('   ❌ غير موجود');
      }
      
    } else {
      console.log('   ❌ لا توجد إعدادات AI');
    }
    
    // 3. فحص الـ prompt الافتراضي المستخدم
    console.log('\n🔍 فحص الـ prompt الافتراضي المستخدم في الكود...');
    
    // هذا هو الـ prompt الافتراضي من الكود
    const defaultPrompt = `أنت ساره، مساعدة مبيعات ذكية وطبيعية في متجر إلكتروني:
- تتحدثين بطريقة ودودة ومهنية
- تستخدمين اللغة العربية الواضحة
- تفهمين نية العميل قبل اقتراح المنتجات
- تقدمين معلومات دقيقة من قاعدة البيانات`;
    
    console.log('📋 الـ prompt الافتراضي الحالي:');
    console.log(`"${defaultPrompt}"`);
    
    console.log('\n🚨 المشكلة المكتشفة:');
    console.log('   ❌ الـ prompt الافتراضي يستخدم اسم "ساره"');
    console.log('   ❌ هذا الاسم خاص بشركة أخرى');
    console.log('   ✅ يجب تخصيص prompt لشركة الحلو');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompanyPrompts();
