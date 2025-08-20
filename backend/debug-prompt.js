const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');

async function debugPromptGeneration() {
  try {
    console.log('🔍 فحص شامل للنظام...\n');
    
    // 1. فحص RAG
    console.log('1️⃣ فحص RAG:');
    console.log('='.repeat(50));
    
    const query = 'عايز اعرف المنتجات المتوفره';
    console.log('الاستعلام:', query);
    
    const ragResults = await ragService.retrieveRelevantData(query);
    console.log('عدد النتائج:', ragResults.length);
    
    ragResults.forEach((item, index) => {
      console.log(`\nالنتيجة ${index + 1}:`);
      console.log('النوع:', item.type);
      console.log('المحتوى:', item.content);
      console.log('النقاط:', item.score);
    });
    
    // 2. فحص الـ prompt
    console.log('\n\n2️⃣ فحص الـ Prompt:');
    console.log('='.repeat(50));
    
    const customerData = {
      name: 'Test User',
      phone: '01234567890',
      orderCount: 0
    };
    
    const companyPrompts = {
      hasCustomPrompts: false
    };
    
    const prompt = await aiAgentService.buildAdvancedPrompt(
      query,
      customerData,
      companyPrompts,
      ragResults
    );
    
    console.log('الـ Prompt المولد:');
    console.log('-'.repeat(80));
    console.log(prompt);
    console.log('-'.repeat(80));
    
    // 3. فحص إعدادات الشركة
    console.log('\n\n3️⃣ فحص إعدادات الشركة:');
    console.log('='.repeat(50));
    
    const companySettings = await aiAgentService.getCompanyPrompts('cmdkj6coz0000uf0cyscco6lr');
    console.log('إعدادات الشركة:', JSON.stringify(companySettings, null, 2));
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error('التفاصيل:', error.stack);
  }
}

debugPromptGeneration();
