const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function enableWorkingHours() {
  console.log('🕐 Enabling Working Hours Check...\n');
  
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
      
      // Set working hours to normal business hours
      const normalWorkingHours = JSON.stringify({ 
        start: '09:00', 
        end: '18:00',
        note: 'Normal business hours - AI works only during these hours'
      });
      
      const updated = await prisma.aiSettings.update({
        where: { id: currentSettings.id },
        data: {
          workingHours: normalWorkingHours,
          autoReplyEnabled: true,
          maxRepliesPerCustomer: 5
        }
      });
      
      console.log('✅ Updated settings:', {
        workingHours: updated.workingHours,
        autoReplyEnabled: updated.autoReplyEnabled,
        maxRepliesPerCustomer: updated.maxRepliesPerCustomer
      });
    } else {
      // Create new settings with normal working hours
      const normalWorkingHours = JSON.stringify({ 
        start: '09:00', 
        end: '18:00',
        note: 'Normal business hours - AI works only during these hours'
      });
      
      const newSettings = await prisma.aiSettings.create({
        data: {
          workingHours: normalWorkingHours,
          autoReplyEnabled: true,
          maxRepliesPerCustomer: 5,
          companyId: 'cmd5c0c9y0000ymzdd7wtv7ib'
        }
      });
      
      console.log('✅ Created new settings with normal working hours:', {
        workingHours: newSettings.workingHours,
        autoReplyEnabled: newSettings.autoReplyEnabled
      });
    }
    
    console.log('\n🎉 Working hours check ENABLED!');
    console.log('🕘 AI will now work only from 09:00 to 18:00');
    console.log('🔄 Please restart the server to apply changes');
    console.log('');
    console.log('📋 To disable working hours again, use:');
    console.log('   node disable-working-hours.js');
    
  } catch (error) {
    console.error('❌ Error enabling working hours:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enableWorkingHours();
