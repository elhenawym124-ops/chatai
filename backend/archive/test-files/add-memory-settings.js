const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMemorySettingsColumn() {
  console.log('🔧 Adding memorySettings column to ai_settings table...');
  
  try {
    // Check if column already exists
    const result = await prisma.$queryRaw`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'ai_settings' 
      AND COLUMN_NAME = 'memorySettings'
    `;
    
    if (result.length > 0) {
      console.log('✅ memorySettings column already exists');
      return;
    }
    
    // Add the column
    await prisma.$executeRaw`
      ALTER TABLE ai_settings 
      ADD COLUMN memorySettings TEXT NULL
    `;
    
    console.log('✅ Successfully added memorySettings column');
    
    // Add default memory settings for existing companies
    const companies = await prisma.company.findMany();
    
    for (const company of companies) {
      const defaultMemorySettings = {
        conversationMemoryLimit: 3,
        memoryType: 'recent',
        memoryDuration: 24,
        enableContextualMemory: true
      };
      
      await prisma.aiSettings.upsert({
        where: { companyId: company.id },
        update: {
          memorySettings: JSON.stringify(defaultMemorySettings)
        },
        create: {
          companyId: company.id,
          memorySettings: JSON.stringify(defaultMemorySettings),
          autoReplyEnabled: false,
          confidenceThreshold: 0.7
        }
      });
      
      console.log(`✅ Added default memory settings for company: ${company.name}`);
    }
    
  } catch (error) {
    console.error('❌ Error adding memorySettings column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addMemorySettingsColumn();
}

module.exports = { addMemorySettingsColumn };
