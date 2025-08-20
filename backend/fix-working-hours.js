const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixWorkingHours() {
  console.log('🕐 Fixing Working Hours for 24/7 Operation...\n');
  
  try {
    // Get current AI settings
    const currentSettings = await prisma.aiSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (currentSettings) {
      console.log('📋 Current settings:', {
        workingHours: currentSettings.workingHours,
        autoReplyEnabled: currentSettings.autoReplyEnabled
      });

      // Update to 24/7
      const updated = await prisma.aiSettings.update({
        where: { id: currentSettings.id },
        data: {
          workingHours: JSON.stringify({ start: '00:00', end: '23:59' }),
          autoReplyEnabled: true,
          maxRepliesPerCustomer: 10
        }
      });

      console.log('✅ Updated settings:', {
        workingHours: updated.workingHours,
        autoReplyEnabled: updated.autoReplyEnabled,
        maxRepliesPerCustomer: updated.maxRepliesPerCustomer
      });
    } else {
      // Create new settings
      const newSettings = await prisma.aiSettings.create({
        data: {
          workingHours: JSON.stringify({ start: '00:00', end: '23:59' }),
          autoReplyEnabled: true,
          maxRepliesPerCustomer: 10,
          companyId: 'cmd5c0c9y0000ymzdd7wtv7ib'
        }
      });

      console.log('✅ Created new 24/7 settings:', {
        workingHours: newSettings.workingHours,
        autoReplyEnabled: newSettings.autoReplyEnabled
      });
    }
    
    console.log('\n🎉 Working hours set to 24/7!');
    console.log('🔄 Please restart the server to apply changes');
    
  } catch (error) {
    console.error('❌ Error fixing working hours:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixWorkingHours();
