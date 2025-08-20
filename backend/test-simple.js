const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNewSystem() {
  console.log('Testing new Gemini system...\n');
  
  try {
    // Test 1: Show all keys and models
    console.log('Test 1: Show all keys and models');
    const keys = await prisma.geminiKey.findMany({
      orderBy: { priority: 'asc' }
    });
    
    console.log(`Total keys: ${keys.length}`);
    
    for (const key of keys) {
      console.log(`\nKey: ${key.name} (priority: ${key.priority})`);
      console.log(`  API Key: ${key.apiKey.substring(0, 20)}...`);
      console.log(`  Active: ${key.isActive ? 'Yes' : 'No'}`);
      
      // Show models for this key
      const models = await prisma.$queryRaw`
        SELECT * FROM \`gemini_key_models\` 
        WHERE \`keyId\` = ${key.id} 
        ORDER BY \`priority\` ASC
      `;
      
      console.log(`  Models: ${models.length}`);
      models.forEach((model, index) => {
        const usage = JSON.parse(model.usage);
        const percentage = ((usage.used || 0) / (usage.limit || 1)) * 100;
        console.log(`    ${index + 1}. ${model.model} - ${usage.used}/${usage.limit} (${percentage.toFixed(1)}%) ${model.isEnabled ? 'Enabled' : 'Disabled'}`);
      });
    }
    
    const totalModels = await prisma.$queryRaw`SELECT COUNT(*) as count FROM \`gemini_key_models\``;
    console.log(`\nTotal models available: ${totalModels[0].count}`);
    
    // Test 2: Test finding best model in active key
    console.log('\n' + '='.repeat(50));
    console.log('Test 2: Find best model in active key');
    
    const activeKey = await prisma.geminiKey.findFirst({
      where: { isActive: true },
      orderBy: { priority: 'asc' }
    });
    
    if (activeKey) {
      console.log(`Active key: ${activeKey.name}`);
      
      const availableModels = await prisma.$queryRaw`
        SELECT * FROM \`gemini_key_models\` 
        WHERE \`keyId\` = ${activeKey.id} 
        AND \`isEnabled\` = true
        ORDER BY \`priority\` ASC
      `;
      
      console.log(`Available models in active key: ${availableModels.length}`);
      
      for (const modelRecord of availableModels) {
        const usage = JSON.parse(modelRecord.usage);
        const currentUsage = usage.used || 0;
        const maxRequests = usage.limit || 1000000;
        
        console.log(`Checking ${modelRecord.model}: ${currentUsage}/${maxRequests}`);
        
        if (currentUsage < maxRequests) {
          console.log(`  -> Available model: ${modelRecord.model}`);
          break;
        } else {
          console.log(`  -> Model exceeded limit`);
        }
      }
    } else {
      console.log('No active key found');
    }
    
    // Test 3: Simulate usage update
    console.log('\n' + '='.repeat(50));
    console.log('Test 3: Simulate usage update');
    
    const firstModel = await prisma.$queryRaw`
      SELECT km.* FROM \`gemini_key_models\` km
      JOIN \`gemini_keys\` k ON km.keyId = k.id
      WHERE k.isActive = true AND km.isEnabled = true
      ORDER BY km.priority ASC
      LIMIT 1
    `;
    
    if (firstModel && firstModel.length > 0) {
      const model = firstModel[0];
      const usage = JSON.parse(model.usage);
      
      console.log(`Current model: ${model.model}`);
      console.log(`Current usage: ${usage.used}/${usage.limit}`);
      
      // Simulate usage increment
      const newUsage = {
        ...usage,
        used: (usage.used || 0) + 1,
        lastUpdated: new Date().toISOString()
      };
      
      await prisma.$executeRaw`
        UPDATE \`gemini_key_models\` 
        SET 
          \`usage\` = ${JSON.stringify(newUsage)},
          \`lastUsed\` = NOW(),
          \`updatedAt\` = NOW()
        WHERE \`id\` = ${model.id}
      `;
      
      console.log(`Updated usage: ${newUsage.used}/${usage.limit}`);
      
      // Reset for next test
      await prisma.$executeRaw`
        UPDATE \`gemini_key_models\` 
        SET \`usage\` = ${JSON.stringify(usage)}
        WHERE \`id\` = ${model.id}
      `;
      
      console.log('Usage reset for next test');
      
    } else {
      console.log('No model found for testing');
    }
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testNewSystem();
