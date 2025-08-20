const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addWorkingHoursEnabled() {
  console.log('🔧 Adding workingHoursEnabled field...\n');
  
  try {
    // Add the column if it doesn't exist
    console.log('📝 Adding workingHoursEnabled column...');
    await prisma.$executeRaw`
      ALTER TABLE ai_settings 
      ADD COLUMN IF NOT EXISTS workingHoursEnabled BOOLEAN DEFAULT TRUE
    `;
    
    console.log('✅ Column added successfully');
    
    // Update existing records to have workingHoursEnabled = false (disabled by default)
    console.log('🔄 Setting workingHoursEnabled to FALSE for all existing records...');
    const updateResult = await prisma.aiSettings.updateMany({
      data: {
        workingHoursEnabled: false
      }
    });
    
    console.log(`✅ Updated ${updateResult.count} records`);
    
    // Verify the change
    console.log('🔍 Verifying changes...');
    const settings = await prisma.aiSettings.findMany({
      select: {
        id: true,
        workingHoursEnabled: true,
        workingHours: true,
        autoReplyEnabled: true
      }
    });
    
    console.log('📊 Current settings:');
    settings.forEach((setting, index) => {
      console.log(`${index + 1}. ID: ${setting.id}`);
      console.log(`   workingHoursEnabled: ${setting.workingHoursEnabled}`);
      console.log(`   workingHours: ${setting.workingHours}`);
      console.log(`   autoReplyEnabled: ${setting.autoReplyEnabled}`);
      console.log('');
    });
    
    console.log('🎉 Working hours can now be disabled!');
    console.log('📋 To disable working hours check:');
    console.log('   - Set workingHoursEnabled = false in database');
    console.log('   - Or use the API endpoint to update settings');
    console.log('   - Restart the server to apply changes');
    
  } catch (error) {
    console.error('❌ Error adding workingHoursEnabled field:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addWorkingHoursEnabled();
