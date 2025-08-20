const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixModelSimple() {
  console.log('🔧 Fixing Gemini Model (Simple Update)...\n');
  
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
    
    // تحديث النموذج فقط
    const newModel = 'gemini-1.5-flash';
    
    console.log(`🔄 Updating model from "${activeKey.model}" to "${newModel}"`);
    
    await prisma.geminiKey.update({
      where: { id: activeKey.id },
      data: {
        model: newModel,
        name: `Gemini 1.5 Flash - Fixed (Vision Enabled)`
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
    console.log(`   Active: ${updatedKey.isActive}`);
    
    console.log('\n🎉 Model fixed!');
    console.log('🔄 Please restart the server to apply changes');
    console.log('');
    console.log('📊 Gemini 1.5 Flash quotas:');
    console.log('   • Free tier: 15 requests per minute');
    console.log('   • Free tier: 1,500 requests per day');
    console.log('   • Much higher than the previous 50/day limit');
    
  } catch (error) {
    console.error('❌ Error fixing model:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixModelSimple();
