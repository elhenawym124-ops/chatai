const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function disableWorkingHours() {
  console.log('🚫 Disabling Working Hours Check...\n');
  
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
      
      // Set working hours to disabled state
      const disabledWorkingHours = JSON.stringify({ 
        disabled: true, 
        start: 'DISABLED', 
        end: 'DISABLED',
        note: 'Working hours check is disabled - AI works 24/7'
      });
      
      const updated = await prisma.aiSettings.update({
        where: { id: currentSettings.id },
        data: {
          workingHours: disabledWorkingHours,
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
      // Create new settings with disabled working hours
      const disabledWorkingHours = JSON.stringify({ 
        disabled: true, 
        start: 'DISABLED', 
        end: 'DISABLED',
        note: 'Working hours check is disabled - AI works 24/7'
      });
      
      const newSettings = await prisma.aiSettings.create({
        data: {
          workingHours: disabledWorkingHours,
          autoReplyEnabled: true,
          maxRepliesPerCustomer: 10,
          companyId: 'cmd5c0c9y0000ymzdd7wtv7ib'
        }
      });
      
      console.log('✅ Created new settings with disabled working hours:', {
        workingHours: newSettings.workingHours,
        autoReplyEnabled: newSettings.autoReplyEnabled
      });
    }
    
    console.log('\n🎉 Working hours check DISABLED!');
    console.log('🤖 AI will now work 24/7 without time restrictions');
    console.log('🔄 Please restart the server to apply changes');
    console.log('');
    console.log('📋 To re-enable working hours later, use:');
    console.log('   {"start": "09:00", "end": "18:00"}');
    
  } catch (error) {
    console.error('❌ Error disabling working hours:', error);
  } finally {
    await prisma.$disconnect();
  }
}

disableWorkingHours();
