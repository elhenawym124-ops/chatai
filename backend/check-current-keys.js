const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentKeys() {
  console.log('🔍 Checking current Gemini keys...\n');
  
  try {
    const keys = await prisma.geminiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    if (keys.length === 0) {
      console.log('❌ No Gemini keys found in database');
      return;
    }
    
    console.log('📋 Current keys in database:');
    keys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name}`);
      console.log(`   Model: ${key.model}`);
      console.log(`   Active: ${key.isActive}`);
      console.log(`   Usage: ${key.currentUsage || 0}/${key.maxRequestsPerDay || 50}`);
      console.log(`   API Key: ${key.apiKey.substring(0, 20)}...`);
      console.log(`   Created: ${key.createdAt}`);
      console.log('');
    });
    
    // فحص المفتاح النشط
    const activeKey = keys.find(key => key.isActive);
    if (activeKey) {
      console.log('✅ Active key details:');
      console.log(`   Name: ${activeKey.name}`);
      console.log(`   Model: ${activeKey.model}`);
      console.log(`   Current Usage: ${activeKey.currentUsage || 0}`);
      console.log(`   Max Requests: ${activeKey.maxRequestsPerDay || 50}`);
      console.log(`   Remaining: ${(activeKey.maxRequestsPerDay || 50) - (activeKey.currentUsage || 0)}`);
      
      if ((activeKey.currentUsage || 0) >= (activeKey.maxRequestsPerDay || 50)) {
        console.log('⚠️ WARNING: Active key has exceeded quota!');
      }
    } else {
      console.log('❌ No active key found!');
    }
    
  } catch (error) {
    console.error('❌ Error checking keys:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentKeys();
