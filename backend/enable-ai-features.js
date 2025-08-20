const { PrismaClient } = require('@prisma/client');

async function enableAIFeatures() {
  const prisma = new PrismaClient();
  
  try {
    console.log('⚙️ Enabling AI Features...\n');
    
    const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
    
    // Check current AI settings
    let aiSettings = await prisma.aiSettings.findFirst({
      where: { companyId: companyId }
    });
    
    if (aiSettings) {
      console.log('📊 Current AI Settings:');
      console.log(`🤖 Auto Reply: ${aiSettings.autoReplyEnabled ? 'Enabled' : 'Disabled'}`);
      console.log(`🛍️ Auto Suggest Products: ${aiSettings.autoSuggestProducts ? 'Enabled' : 'Disabled'}`);
      console.log(`📊 Max Suggestions: ${aiSettings.maxSuggestions || 'Not set'}`);
      console.log(`🎯 Default Product ID: ${aiSettings.defaultProductId || 'Not set'}`);
      
      // Update settings to enable all features
      const updatedSettings = await prisma.aiSettings.update({
        where: { id: aiSettings.id },
        data: {
          autoReplyEnabled: true,
          autoSuggestProducts: true,
          maxSuggestions: 3,
          includeImages: true,
          confidenceThreshold: 0.7
        }
      });
      
      console.log('\n✅ AI Settings Updated:');
      console.log(`🤖 Auto Reply: ${updatedSettings.autoReplyEnabled ? 'Enabled' : 'Disabled'}`);
      console.log(`🛍️ Auto Suggest Products: ${updatedSettings.autoSuggestProducts ? 'Enabled' : 'Disabled'}`);
      console.log(`📊 Max Suggestions: ${updatedSettings.maxSuggestions}`);
      console.log(`🖼️ Include Images: ${updatedSettings.includeImages ? 'Enabled' : 'Disabled'}`);
      console.log(`🎯 Confidence Threshold: ${updatedSettings.confidenceThreshold}`);
      
    } else {
      console.log('❌ No AI settings found, creating new ones...');
      
      const newSettings = await prisma.aiSettings.create({
        data: {
          companyId: companyId,
          autoReplyEnabled: true,
          autoSuggestProducts: true,
          maxSuggestions: 3,
          includeImages: true,
          confidenceThreshold: 0.7
        }
      });
      
      console.log('✅ New AI Settings Created:');
      console.log(`🤖 Auto Reply: ${newSettings.autoReplyEnabled ? 'Enabled' : 'Disabled'}`);
      console.log(`🛍️ Auto Suggest Products: ${newSettings.autoSuggestProducts ? 'Enabled' : 'Disabled'}`);
      console.log(`📊 Max Suggestions: ${newSettings.maxSuggestions}`);
    }
    
    // Test the settings
    console.log('\n🧪 Testing AI Features...');
    
    const AdvancedProductService = require('./src/services/advancedProductService');
    const advancedProductService = new AdvancedProductService();
    
    const testResult = await advancedProductService.recommendProducts(companyId, 'كوتشي نايك', 'test-customer');
    
    if (testResult.success) {
      console.log(`✅ Product recommendations working: Found ${testResult.data.recommendations.length} products`);
      testResult.data.recommendations.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه`);
      });
    } else {
      console.log(`❌ Product recommendations failed: ${testResult.error}`);
    }
    
    console.log('\n🎉 AI Features Configuration Complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enableAIFeatures();
