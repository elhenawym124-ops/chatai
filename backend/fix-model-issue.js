const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixModelIssue() {
  console.log('🔧 Fixing Model Issue...\n');
  
  try {
    // فحص المفتاح النشط
    const activeKey = await prisma.geminiKey.findFirst({
      where: { isActive: true }
    });
    
    if (activeKey) {
      console.log('📋 Current active key:');
      console.log(`   ID: ${activeKey.id}`);
      console.log(`   Name: ${activeKey.name}`);
      console.log(`   Model: ${activeKey.model}`);
      console.log(`   Usage: ${activeKey.currentUsage}/${activeKey.maxRequests}`);
      
      if (activeKey.model === 'gemini-2.5-flash') {
        console.log('\n❌ Wrong model detected! This model does not exist.');
        console.log('🔧 Fixing to correct model...');
        
        await prisma.geminiKey.update({
          where: { id: activeKey.id },
          data: { model: 'gemini-2.0-flash-exp' }
        });
        
        console.log('✅ Model updated to gemini-2.0-flash-exp');
        
        // التحقق من التحديث
        const updatedKey = await prisma.geminiKey.findFirst({
          where: { isActive: true }
        });
        
        console.log('\n📋 Updated key:');
        console.log(`   Model: ${updatedKey.model}`);
        
      } else {
        console.log('✅ Model is already correct');
      }
    } else {
      console.log('❌ No active key found');
    }
    
  } catch (error) {
    console.error('❌ Error fixing model:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixModelIssue();
