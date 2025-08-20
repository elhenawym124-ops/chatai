const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showCurrentPrompts() {
  try {
    console.log('📋 الـ Prompts المحفوظة حالياً للشركات:');
    console.log('═'.repeat(60));
    
    const companies = await prisma.company.findMany({
      include: { aiSettings: true }
    });
    
    companies.forEach((company, index) => {
      console.log(`\n${index + 1}. 🏢 ${company.name}:`);
      console.log(`   📧 البريد: ${company.email}`);
      console.log(`   💰 العملة: ${company.currency}`);
      
      if (company.aiSettings) {
        console.log('   🤖 إعدادات AI: ✅ موجودة');
        
        if (company.aiSettings.personalityPrompt) {
          console.log('   👤 Personality Prompt: ✅ موجود');
          
          // عرض أول سطرين من الـ prompt
          const lines = company.aiSettings.personalityPrompt.split('\n');
          console.log(`   📄 يبدأ بـ: "${lines[0]}"`);
          if (lines[1]) {
            console.log(`   📄 السطر الثاني: "${lines[1]}"`);
          }
        } else {
          console.log('   👤 Personality Prompt: ❌ غير موجود');
        }
        
        if (company.aiSettings.responsePrompt) {
          console.log('   📝 Response Prompt: ✅ موجود');
        } else {
          console.log('   📝 Response Prompt: ❌ غير موجود');
        }
        
      } else {
        console.log('   🤖 إعدادات AI: ❌ غير موجودة');
      }
    });
    
    console.log('\n📊 ملخص:');
    console.log('═'.repeat(30));
    console.log(`🏢 إجمالي الشركات: ${companies.length}`);
    
    const companiesWithAI = companies.filter(c => c.aiSettings);
    console.log(`🤖 شركات لديها AI: ${companiesWithAI.length}`);
    
    const companiesWithPrompts = companies.filter(c => 
      c.aiSettings && c.aiSettings.personalityPrompt
    );
    console.log(`📝 شركات لديها prompts: ${companiesWithPrompts.length}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
if (require.main === module) {
  showCurrentPrompts()
    .then(() => {
      console.log('\n✅ انتهى عرض الـ prompts');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل:', error);
      process.exit(1);
    });
}

module.exports = { showCurrentPrompts };
