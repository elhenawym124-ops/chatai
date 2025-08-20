const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function manageWorkingHours() {
  console.log('🕐 Working Hours Management Tool\n');
  
  try {
    // Get current settings
    const currentSettings = await prisma.aiSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (currentSettings && currentSettings.workingHours) {
      const workingHours = JSON.parse(currentSettings.workingHours);
      console.log('📋 Current working hours settings:');
      
      if (workingHours.disabled || workingHours.start === 'DISABLED') {
        console.log('   Status: ❌ DISABLED (AI works 24/7)');
      } else {
        console.log(`   Status: ✅ ENABLED (${workingHours.start} - ${workingHours.end})`);
      }
      console.log('');
    } else {
      console.log('📋 No working hours settings found\n');
    }
    
    console.log('Choose an option:');
    console.log('1. Disable working hours (AI works 24/7)');
    console.log('2. Enable working hours (9:00 - 18:00)');
    console.log('3. Set custom working hours');
    console.log('4. View current status');
    console.log('5. Exit');
    console.log('');
    
    const choice = await askQuestion('Enter your choice (1-5): ');
    
    switch (choice) {
      case '1':
        await disableWorkingHours();
        break;
      case '2':
        await enableNormalHours();
        break;
      case '3':
        await setCustomHours();
        break;
      case '4':
        await viewStatus();
        break;
      case '5':
        console.log('👋 Goodbye!');
        break;
      default:
        console.log('❌ Invalid choice');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

async function disableWorkingHours() {
  console.log('\n🚫 Disabling working hours...');
  
  const disabledWorkingHours = JSON.stringify({ 
    disabled: true, 
    start: 'DISABLED', 
    end: 'DISABLED',
    note: 'Working hours check is disabled - AI works 24/7'
  });
  
  await updateWorkingHours(disabledWorkingHours);
  console.log('✅ Working hours DISABLED - AI now works 24/7');
}

async function enableNormalHours() {
  console.log('\n🕘 Enabling normal working hours (9:00 - 18:00)...');
  
  const normalWorkingHours = JSON.stringify({ 
    start: '09:00', 
    end: '18:00',
    note: 'Normal business hours - AI works only during these hours'
  });
  
  await updateWorkingHours(normalWorkingHours);
  console.log('✅ Working hours ENABLED - AI works 9:00 to 18:00');
}

async function setCustomHours() {
  console.log('\n⚙️ Setting custom working hours...');
  
  const startTime = await askQuestion('Enter start time (HH:MM format, e.g., 08:00): ');
  const endTime = await askQuestion('Enter end time (HH:MM format, e.g., 20:00): ');
  
  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    console.log('❌ Invalid time format. Please use HH:MM format.');
    return;
  }
  
  const customWorkingHours = JSON.stringify({ 
    start: startTime, 
    end: endTime,
    note: `Custom working hours - AI works from ${startTime} to ${endTime}`
  });
  
  await updateWorkingHours(customWorkingHours);
  console.log(`✅ Custom working hours set: ${startTime} to ${endTime}`);
}

async function updateWorkingHours(workingHoursJson) {
  const currentSettings = await prisma.aiSettings.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  
  if (currentSettings) {
    await prisma.aiSettings.update({
      where: { id: currentSettings.id },
      data: {
        workingHours: workingHoursJson,
        autoReplyEnabled: true
      }
    });
  } else {
    await prisma.aiSettings.create({
      data: {
        workingHours: workingHoursJson,
        autoReplyEnabled: true,
        maxRepliesPerCustomer: 5,
        companyId: 'cmd5c0c9y0000ymzdd7wtv7ib'
      }
    });
  }
  
  console.log('🔄 Please restart the server to apply changes');
}

async function viewStatus() {
  console.log('\n📊 Current Working Hours Status:');
  
  const currentSettings = await prisma.aiSettings.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  
  if (currentSettings && currentSettings.workingHours) {
    const workingHours = JSON.parse(currentSettings.workingHours);
    
    if (workingHours.disabled || workingHours.start === 'DISABLED') {
      console.log('   Status: ❌ DISABLED');
      console.log('   AI Response: Works 24/7');
    } else {
      console.log('   Status: ✅ ENABLED');
      console.log(`   Working Hours: ${workingHours.start} - ${workingHours.end}`);
      console.log('   AI Response: Only during working hours');
    }
    
    console.log(`   Auto Reply: ${currentSettings.autoReplyEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   Max Replies: ${currentSettings.maxRepliesPerCustomer}`);
  } else {
    console.log('   Status: ⚠️ NOT CONFIGURED');
  }
}

manageWorkingHours();
