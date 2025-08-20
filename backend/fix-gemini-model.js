const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixGeminiModel() {
  console.log('🔧 Fixing Gemini Model Configuration...\n');
  
  try {
    // الحصول على المفتاح النشط
    const activeKey = await prisma.geminiKey.findFirst({
      where: { isActive: true }
    });
    
    if (!activeKey) {
      console.log('❌ No active key found');
      return;
    }
    
    console.log('📋 Current active key:');
    console.log(`   Name: ${activeKey.name}`);
    console.log(`   Model: ${activeKey.model}`);
    console.log(`   Usage: ${activeKey.currentUsage || 0}/${activeKey.maxRequestsPerDay || 50}`);
    
    // النماذج المتاحة مع حصصها
    const availableModels = {
      'gemini-1.5-flash': {
        name: 'Gemini 1.5 Flash',
        freeQuota: 15, // 15 requests per minute, 1500 per day
        description: 'Fast and efficient for most tasks'
      },
      'gemini-1.5-pro': {
        name: 'Gemini 1.5 Pro', 
        freeQuota: 2, // 2 requests per minute, 50 per day
        description: 'More capable but slower'
      },
      'gemini-pro': {
        name: 'Gemini Pro',
        freeQuota: 60, // 60 requests per minute
        description: 'Legacy model with good quota'
      }
    };
    
    console.log('\n📊 Available models:');
    Object.entries(availableModels).forEach(([model, info], index) => {
      console.log(`${index + 1}. ${model}`);
      console.log(`   Name: ${info.name}`);
      console.log(`   Free Quota: ${info.freeQuota} requests/minute`);
      console.log(`   Description: ${info.description}`);
      console.log('');
    });
    
    // تحديث النموذج إلى gemini-1.5-flash (أفضل حصة)
    const newModel = 'gemini-1.5-flash';
    const newQuota = 1500; // حصة يومية أعلى
    
    console.log(`🔄 Updating model to: ${newModel}`);
    console.log(`📈 Updating daily quota to: ${newQuota}`);
    
    await prisma.geminiKey.update({
      where: { id: activeKey.id },
      data: {
        model: newModel,
        maxRequestsPerDay: newQuota,
        currentUsage: 0, // إعادة تعيين العداد
        name: `Gemini 1.5 Flash - Updated (Vision Enabled)`
      }
    });
    
    console.log('✅ Model updated successfully!');
    
    // التحقق من التحديث
    const updatedKey = await prisma.geminiKey.findFirst({
      where: { isActive: true }
    });
    
    console.log('\n📋 Updated key details:');
    console.log(`   Name: ${updatedKey.name}`);
    console.log(`   Model: ${updatedKey.model}`);
    console.log(`   Usage: ${updatedKey.currentUsage}/${updatedKey.maxRequestsPerDay}`);
    console.log(`   Remaining: ${updatedKey.maxRequestsPerDay - updatedKey.currentUsage}`);
    
    console.log('\n🎉 Configuration fixed!');
    console.log('🔄 Please restart the server to apply changes');
    
  } catch (error) {
    console.error('❌ Error fixing model:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixGeminiModel();
