const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addBackupGeminiKeys() {
  console.log('🔑 Adding Backup Gemini Keys to Handle Quota Limits...\n');
  
  try {
    // الحصول على الشركة
    const company = await prisma.company.findFirst();
    if (!company) {
      console.log('❌ No company found');
      return;
    }
    
    // إضافة مفاتيح احتياطية (يمكنك إضافة مفاتيح حقيقية هنا)
    const backupKeys = [
      {
        name: 'Gemini Backup Key 1',
        apiKey: 'YOUR_BACKUP_API_KEY_1', // استبدل بمفتاح حقيقي
        model: 'gemini-1.5-flash',
        isActive: false, // سيتم تفعيله عند الحاجة
        maxRequestsPerDay: 50,
        currentUsage: 0
      },
      {
        name: 'Gemini Backup Key 2', 
        apiKey: 'YOUR_BACKUP_API_KEY_2', // استبدل بمفتاح حقيقي
        model: 'gemini-1.5-flash',
        isActive: false,
        maxRequestsPerDay: 50,
        currentUsage: 0
      }
    ];
    
    // فحص المفاتيح الحالية
    const currentKeys = await prisma.geminiKey.findMany({
      where: { companyId: company.id }
    });
    
    console.log(`📋 Current keys: ${currentKeys.length}`);
    currentKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name} - Active: ${key.isActive} - Usage: ${key.currentUsage || 0}/${key.maxRequestsPerDay || 50}`);
    });
    
    // إضافة المفاتيح الاحتياطية
    console.log('\n🔄 Adding backup keys...');
    for (const keyData of backupKeys) {
      try {
        const existingKey = await prisma.geminiKey.findFirst({
          where: { 
            name: keyData.name,
            companyId: company.id 
          }
        });
        
        if (!existingKey) {
          await prisma.geminiKey.create({
            data: {
              ...keyData,
              companyId: company.id
            }
          });
          console.log(`✅ Added backup key: ${keyData.name}`);
        } else {
          console.log(`⚠️ Key already exists: ${keyData.name}`);
        }
      } catch (error) {
        console.log(`❌ Error adding key ${keyData.name}:`, error.message);
      }
    }
    
    console.log('\n💡 Quota Management Strategy:');
    console.log('1. Monitor daily usage for each key');
    console.log('2. Auto-switch to backup keys when quota exceeded');
    console.log('3. Reset usage counters daily');
    console.log('4. Consider upgrading to paid plan for higher limits');
    
    console.log('\n📊 Recommended Actions:');
    console.log('🔑 Get additional Gemini API keys from different Google accounts');
    console.log('💳 Consider upgrading to Gemini Pro for higher quotas');
    console.log('⚡ Implement key rotation system');
    console.log('📈 Monitor usage patterns to optimize requests');
    
  } catch (error) {
    console.error('❌ Error adding backup keys:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBackupGeminiKeys();
