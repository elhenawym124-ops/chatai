const { PrismaClient } = require('@prisma/client');

async function testGeminiGeneralQuestions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Gemini General Product Questions...\n');
    
    const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
    
    // Test general questions that should show available products
    const generalQuestions = [
      'عندكم منتجات إيه؟',
      'إيه المنتجات المتاحة؟',
      'عايز أشوف المنتجات',
      'عندكم إيه في المتجر؟',
      'أريد أعرف المنتجات المتوفرة'
    ];
    
    // First, let's see what products are actually available
    console.log('📦 Available Products in Database:');
    const products = await prisma.product.findMany({
      where: {
        companyId: companyId,
        isActive: true
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Found ${products.length} active products:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه (Stock: ${product.stock})`);
    });
    
    // Test how Gemini responds to general questions
    console.log('\n🤖 Testing Gemini Responses to General Questions...');
    
    const AdvancedGeminiService = require('./src/services/advancedGeminiService');
    const advancedGeminiService = new AdvancedGeminiService();
    
    // Initialize Gemini service
    await advancedGeminiService.initialize(companyId);
    
    for (const question of generalQuestions) {
      console.log(`\n❓ Question: "${question}"`);
      
      try {
        // Build context with available products
        const context = {
          customer: { id: 'test-customer', firstName: 'أحمد' },
          conversationHistory: [],
          availableProducts: products.slice(0, 5), // Pass top 5 products
          companyInfo: {
            name: 'شركة التواصل التجريبية',
            totalProducts: products.length
          }
        };
        
        console.log(`📊 Context provided: ${context.availableProducts.length} products`);
        
        const response = await advancedGeminiService.generateResponse(companyId, question, context);
        
        if (response.success) {
          console.log(`✅ Gemini Response:`);
          console.log(`"${response.response}"`);
          
          // Check if response mentions actual products
          let mentionsProducts = false;
          products.forEach(product => {
            if (response.response.includes(product.name)) {
              mentionsProducts = true;
              console.log(`   ✅ Mentions: ${product.name}`);
            }
          });
          
          if (!mentionsProducts) {
            console.log(`   ❌ Response doesn't mention any actual products`);
          }
          
          console.log(`📊 Model: ${response.modelUsed}, Confidence: ${response.confidence}`);
          console.log(`⏱️ Response Time: ${response.responseTime}ms`);
        } else {
          console.log(`❌ Gemini failed: ${response.error}`);
          console.log(`🔄 Fallback: ${response.fallbackResponse}`);
        }
        
      } catch (error) {
        console.error(`❌ Error with Gemini: ${error.message}`);
      }
      
      console.log('─'.repeat(80));
    }
    
    // Test if the issue is with context passing
    console.log('\n🔧 Testing Context Passing...');
    
    const testContext = {
      customer: { id: 'test', firstName: 'أحمد' },
      conversationHistory: [],
      availableProducts: [
        {
          name: 'كوتشي رياضي نايك',
          price: 299.99,
          stock: 20,
          description: 'كوتشي رياضي عالي الجودة'
        },
        {
          name: 'هاتف ذكي متقدم',
          price: 2999.99,
          stock: 50,
          description: 'هاتف ذكي بمواصفات عالية'
        }
      ]
    };
    
    console.log('📋 Test Context:', JSON.stringify(testContext, null, 2));
    
    const testResponse = await advancedGeminiService.generateResponse(
      companyId, 
      'عندكم منتجات إيه؟', 
      testContext
    );
    
    console.log('\n🧪 Test Response:');
    if (testResponse.success) {
      console.log(`"${testResponse.response}"`);
      
      // Check if it mentions the test products
      const mentionsNike = testResponse.response.includes('نايك');
      const mentionsPhone = testResponse.response.includes('هاتف');
      
      console.log(`✅ Mentions Nike: ${mentionsNike ? 'YES' : 'NO'}`);
      console.log(`✅ Mentions Phone: ${mentionsPhone ? 'YES' : 'NO'}`);
    } else {
      console.log(`❌ Failed: ${testResponse.error}`);
    }
    
    console.log('\n🎉 General Questions Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGeminiGeneralQuestions();
