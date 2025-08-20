const { PrismaClient } = require('@prisma/client');

async function testPrismaSchema() {
  const prisma = new PrismaClient();
  
  console.log('🔍 اختبار Prisma Schema...\n');
  
  try {
    // اختبار الجداول الأساسية
    console.log('1. اختبار الجداول الأساسية:');
    
    // اختبار جدول الشركات
    const companies = await prisma.company.findMany({ take: 1 });
    console.log(`   ✅ Company: ${companies.length} سجل`);
    
    // اختبار جدول GeminiKey
    const geminiKeys = await prisma.geminiKey.findMany({ take: 1 });
    console.log(`   ✅ GeminiKey: ${geminiKeys.length} سجل`);
    
    // اختبار جدول GeminiKeyModel
    try {
      const geminiKeyModels = await prisma.geminiKeyModel.findMany({ take: 1 });
      console.log(`   ✅ GeminiKeyModel: ${geminiKeyModels.length} سجل`);
    } catch (error) {
      console.log(`   ❌ GeminiKeyModel: ${error.message}`);
    }
    
    // اختبار الوصول بـ gemini_key_models
    try {
      const geminiKeyModelsRaw = await prisma.gemini_key_models.findMany({ take: 1 });
      console.log(`   ✅ gemini_key_models (raw): ${geminiKeyModelsRaw.length} سجل`);
    } catch (error) {
      console.log(`   ❌ gemini_key_models (raw): ${error.message}`);
    }
    
    console.log('\n2. فحص العلاقات:');
    
    // اختبار العلاقة بين GeminiKey و GeminiKeyModel
    if (geminiKeys.length > 0) {
      try {
        const keyWithModels = await prisma.geminiKey.findFirst({
          include: { models: true }
        });
        console.log(`   ✅ GeminiKey مع models: ${keyWithModels?.models?.length || 0} نموذج`);
      } catch (error) {
        console.log(`   ❌ العلاقة: ${error.message}`);
      }
    }
    
    console.log('\n3. اختبار استعلامات aiAgentService:');
    
    // محاكاة الاستعلام الذي يفشل في aiAgentService
    if (geminiKeys.length > 0) {
      const keyId = geminiKeys[0].id;
      
      try {
        const availableModels = await prisma.geminiKeyModel.findMany({
          where: {
            keyId: keyId,
            isEnabled: true
          },
          orderBy: {
            priority: 'asc'
          }
        });
        console.log(`   ✅ استعلام aiAgentService: ${availableModels.length} نموذج متاح`);
      } catch (error) {
        console.log(`   ❌ استعلام aiAgentService: ${error.message}`);
      }
    }
    
    console.log('\n4. فحص Prisma Client:');
    console.log(`   📊 Prisma version: ${require('@prisma/client/package.json').version}`);
    
    // فحص الـ models المتاحة في Prisma Client
    const availableModels = Object.keys(prisma).filter(key => 
      typeof prisma[key] === 'object' && 
      prisma[key] && 
      typeof prisma[key].findMany === 'function'
    );
    
    console.log(`   📋 Models متاحة: ${availableModels.length}`);
    console.log(`   📝 قائمة Models:`);
    availableModels.forEach(model => {
      console.log(`      - ${model}`);
    });
    
    // البحث عن models تحتوي على gemini
    const geminiModels = availableModels.filter(model => 
      model.toLowerCase().includes('gemini')
    );
    
    console.log(`\n   🔍 Gemini Models: ${geminiModels.join(', ')}`);
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaSchema();
