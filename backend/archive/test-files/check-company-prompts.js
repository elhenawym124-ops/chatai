const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCompanyPrompts() {
  console.log('🔍 فحص عميق لبرونت الشركة...\n');
  
  try {
    const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
    
    // 1. فحص بيانات الشركة من قاعدة البيانات
    console.log('1️⃣ بيانات الشركة من قاعدة البيانات:');
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (company) {
      console.log('   الاسم:', company.name);
      console.log('   personalityPrompt:', company.personalityPrompt || 'غير موجود');
      console.log('   responsePrompt:', company.responsePrompt || 'غير موجود');
      console.log('   taskPrompt:', company.taskPrompt || 'غير موجود');
      console.log('   businessType:', company.businessType);
    } else {
      console.log('   ❌ الشركة غير موجودة في قاعدة البيانات');
    }
    
    // 2. فحص AISettings
    console.log('\n2️⃣ فحص AISettings:');
    try {
      const aiSettings = await prisma.aiSettings.findFirst({
        where: { companyId }
      });
      
      if (aiSettings) {
        console.log('   personalityPrompt:', aiSettings.personalityPrompt || 'غير موجود');
        console.log('   responsePrompt:', aiSettings.responsePrompt || 'غير موجود');
        console.log('   autoReplyEnabled:', aiSettings.autoReplyEnabled);
        console.log('   primaryModel:', aiSettings.primaryModel);
      } else {
        console.log('   ❌ لا توجد إعدادات AI للشركة');
      }
    } catch (error) {
      console.log('   ⚠️ جدول AISettings غير موجود:', error.message);
    }
    
    // 3. اختبار advancedPromptService
    console.log('\n3️⃣ اختبار advancedPromptService:');
    const AdvancedPromptService = require('./src/services/advancedPromptService');
    const promptService = new AdvancedPromptService();
    
    const promptsResult = await promptService.getCompanyPrompts(companyId);
    console.log('   النتيجة:', promptsResult.success ? 'نجح' : 'فشل');

    if (promptsResult.success) {
      console.log('   personalityPrompt:', promptsResult.data.personalityPrompt || 'غير موجود');
      console.log('   responsePrompt:', promptsResult.data.responsePrompt || 'غير موجود');
      console.log('   hasCustomPrompts:', promptsResult.data.hasCustomPrompts);

      // 🔧 Test the fix
      console.log('\n   🔧 اختبار الإصلاح:');
      console.log('   personalityPrompt من data:', promptsResult.data.personalityPrompt);
      console.log('   responsePrompt من data:', promptsResult.data.responsePrompt);
    } else {
      console.log('   خطأ:', promptsResult.error);
    }
    
    // 4. محاكاة buildPrompt
    console.log('\n4️⃣ محاكاة buildPrompt:');
    const AdvancedGeminiService = require('./src/services/advancedGeminiService');
    const geminiService = new AdvancedGeminiService();
    
    const context = {
      personalityPrompt: promptsResult.success ? promptsResult.data.personalityPrompt : '',
      responsePrompt: promptsResult.success ? promptsResult.data.responsePrompt : '',
      companyInfo: {
        name: company?.name || 'سولا 132'
      },
      customerInfo: {
        name: 'Facebook User'
      }
    };
    
    const testMessage = 'انت اسمك ايه';
    const builtPrompt = geminiService.buildPrompt(testMessage, context);
    
    console.log('   البرونت المبني:');
    console.log('   ================');
    console.log(builtPrompt);
    console.log('   ================');
    
    // 5. فحص ملف companies.json
    console.log('\n5️⃣ فحص ملف companies.json:');
    const fs = require('fs');
    const path = require('path');
    
    try {
      const companiesFile = path.join(__dirname, 'data', 'companies.json');
      if (fs.existsSync(companiesFile)) {
        const companiesData = JSON.parse(fs.readFileSync(companiesFile, 'utf8'));
        console.log('   الملف موجود، عدد الشركات:', companiesData.length);
        
        const solaCompany = companiesData.find(([id, data]) => id === companyId);
        if (solaCompany) {
          console.log('   بيانات سولا 132 من الملف:');
          console.log('   الاسم:', solaCompany[1].name);
          console.log('   personalityPrompt:', solaCompany[1].personalityPrompt);
          console.log('   taskPrompt:', solaCompany[1].taskPrompt);
        }
      } else {
        console.log('   ❌ ملف companies.json غير موجود');
      }
    } catch (error) {
      console.log('   خطأ في قراءة الملف:', error.message);
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompanyPrompts();
