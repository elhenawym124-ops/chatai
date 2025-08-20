const { PrismaClient } = require('@prisma/client');

async function testVariantsSimple() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Product Variants - Simple Test...\n');
    
    const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
    
    // Get products with variants
    const productsWithVariants = await prisma.product.findMany({
      where: {
        companyId: companyId,
        isActive: true,
        variants: {
          some: {}
        }
      },
      include: {
        variants: true
      }
    });
    
    console.log(`✅ Found ${productsWithVariants.length} products with variants:`);
    
    productsWithVariants.forEach((product, index) => {
      console.log(`\n🛍️ Product ${index + 1}: ${product.name}`);
      console.log(`   💰 Price: ${product.price} جنيه`);
      console.log(`   📦 Stock: ${product.stock} قطعة`);
      console.log(`   🎨 Variants: ${product.variants.length} variants`);
      
      product.variants.forEach((variant, vIndex) => {
        console.log(`      ${vIndex + 1}. ${variant.name}: ${variant.value} (Stock: ${variant.stock || 0})`);
      });
    });
    
    // Test specific variant question
    console.log('\n\n🧪 Testing Specific Variant Question...');
    
    const testQuestion = 'الكوتشي النايك متوفر بإيه ألوان؟';
    console.log(`❓ Question: "${testQuestion}"`);
    
    // Test handleSpecificProductQuestion
    try {
      const { handleSpecificProductQuestion } = require('./server.js');
      
      const result = await handleSpecificProductQuestion(testQuestion, companyId);
      
      if (result) {
        console.log(`✅ Found answer: "${result.answer}"`);
        console.log(`📋 Question type: ${result.questionType}`);
        console.log(`🛍️ Product: ${result.product.name}`);
        
        if (result.product.variants) {
          console.log(`🎨 Product has ${result.product.variants.length} variants`);
        }
      } else {
        console.log(`❌ No answer found`);
      }
    } catch (error) {
      console.log(`❌ Error testing function: ${error.message}`);
    }
    
    // Test Gemini with variants
    console.log('\n\n🤖 Testing Gemini with Variants...');
    
    try {
      const AdvancedGeminiService = require('./src/services/advancedGeminiService');
      const advancedGeminiService = new AdvancedGeminiService();
      
      await advancedGeminiService.initialize(companyId);
      
      const context = {
        customer: { id: 'test-customer', firstName: 'أحمد' },
        conversationHistory: [],
        availableProducts: productsWithVariants
      };
      
      const response = await advancedGeminiService.generateResponse(companyId, testQuestion, context);
      
      if (response.success) {
        console.log(`✅ Gemini Response: "${response.response}"`);
        
        // Check if mentions specific colors
        const mentionsColors = /أبيض|أسود|أحمر|أزرق/.test(response.response);
        console.log(`🎨 Mentions specific colors: ${mentionsColors ? 'YES' : 'NO'}`);
      } else {
        console.log(`❌ Gemini failed: ${response.error}`);
      }
    } catch (error) {
      console.log(`❌ Gemini error: ${error.message}`);
    }
    
    console.log('\n🎉 Simple Variants Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVariantsSimple();
