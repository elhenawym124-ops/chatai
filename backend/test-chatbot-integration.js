const { PrismaClient } = require('@prisma/client');

async function testChatbotIntegration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🤖 Testing Chatbot Integration with Product Data...\n');
    
    // Import the actual functions from server.js
    const { 
      analyzeMessageIntent, 
      handleSpecificProductQuestion,
      shouldSuggestProducts,
      formatProductSuggestions
    } = require('./server.js');
    
    // Test scenarios
    const testScenarios = [
      {
        message: 'كام سعر الكوتشي النايك؟',
        expectedType: 'specific_answer',
        description: 'Price inquiry for Nike shoes'
      },
      {
        message: 'عندكم طقم أدوات المطبخ متوفر؟',
        expectedType: 'specific_answer', 
        description: 'Availability inquiry for kitchen set'
      },
      {
        message: 'إيه مواصفات الهاتف الذكي؟',
        expectedType: 'specific_answer',
        description: 'Specifications inquiry for smartphone'
      },
      {
        message: 'أريد كوتشي رياضي',
        expectedType: 'product_suggestions',
        description: 'General product inquiry'
      },
      {
        message: 'مرحبا، عايز أشتري حاجة',
        expectedType: 'product_suggestions',
        description: 'Greeting with shopping intent'
      }
    ];
    
    const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
    
    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      console.log(`\n📝 Test ${i + 1}: ${scenario.description}`);
      console.log(`💬 Message: "${scenario.message}"`);
      
      try {
        // Step 1: Analyze message intent
        const messageIntent = await analyzeMessageIntent(scenario.message);
        console.log(`🎯 Intent: ${messageIntent.intent} (confidence: ${messageIntent.confidence})`);
        
        // Step 2: Check for specific product questions
        const specificAnswer = await handleSpecificProductQuestion(scenario.message, companyId);
        
        if (specificAnswer) {
          console.log(`✅ Specific Answer Found:`);
          console.log(`📋 Type: ${specificAnswer.questionType}`);
          console.log(`💬 Answer: "${specificAnswer.answer}"`);
          if (specificAnswer.product) {
            console.log(`🛍️ Product: ${specificAnswer.product.name} - ${specificAnswer.product.price} جنيه`);
          }
          console.log(`📊 Expected: ${scenario.expectedType}, Got: specific_answer`);
          console.log(scenario.expectedType === 'specific_answer' ? '✅ PASSED' : '❌ FAILED');
        } else {
          console.log(`ℹ️ No specific answer found`);
          
          // Step 3: Check if should suggest products
          const conversationContext = {
            hasSpecificAnswer: false,
            foundRequestedProduct: false,
            customerSatisfied: false,
            isHelpRequest: false,
            messageCount: 1,
            hasProductInquiry: messageIntent.intent === 'product_inquiry',
            customerSeemsLost: false,
            recentlyProvidedSuggestions: false
          };
          
          const shouldSuggest = shouldSuggestProducts(messageIntent, scenario.message, conversationContext);
          console.log(`🤔 Should suggest products: ${shouldSuggest ? 'YES' : 'NO'}`);
          
          if (shouldSuggest) {
            // Test product recommendation service
            const AdvancedProductService = require('./src/services/advancedProductService');
            const advancedProductService = new AdvancedProductService();
            
            const productResult = await advancedProductService.recommendProducts(companyId, scenario.message, 'test-customer');
            
            if (productResult.success && productResult.data.recommendations.length > 0) {
              console.log(`✅ Product Suggestions Found:`);
              console.log(`📦 Count: ${productResult.data.recommendations.length}`);
              productResult.data.recommendations.forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه`);
              });
              
              const suggestionText = formatProductSuggestions(productResult.data.recommendations, messageIntent);
              console.log(`💬 Formatted suggestion: "${suggestionText.substring(0, 100)}..."`);
              
              console.log(`📊 Expected: ${scenario.expectedType}, Got: product_suggestions`);
              console.log(scenario.expectedType === 'product_suggestions' ? '✅ PASSED' : '❌ FAILED');
            } else {
              console.log(`❌ No product suggestions found`);
              console.log(`📊 Expected: ${scenario.expectedType}, Got: no_suggestions`);
              console.log('❌ FAILED');
            }
          } else {
            console.log(`📊 Expected: ${scenario.expectedType}, Got: no_suggestions`);
            console.log(scenario.expectedType === 'no_suggestions' ? '✅ PASSED' : '❌ FAILED');
          }
        }
        
      } catch (error) {
        console.error(`❌ Error in test ${i + 1}:`, error.message);
      }
      
      console.log('─'.repeat(80));
    }
    
    // Test advanced product service directly
    console.log('\n\n🔧 Testing Advanced Product Service Directly...');
    
    const AdvancedProductService = require('./src/services/advancedProductService');
    const advancedProductService = new AdvancedProductService();
    
    const testQueries = [
      'كوتشي نايك',
      'هاتف ذكي', 
      'طقم مطبخ',
      'قميص قطني'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      try {
        const result = await advancedProductService.recommendProducts(companyId, query, 'test-customer');
        
        if (result.success) {
          console.log(`✅ Success: Found ${result.data.recommendations.length} recommendations`);
          result.data.recommendations.forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه (confidence: ${product.confidence})`);
          });
        } else {
          console.log(`❌ Failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Chatbot Integration Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Mock functions if they're not available from server.js
async function analyzeMessageIntent(messageText) {
  const text = messageText.toLowerCase();
  
  const productPatterns = [
    /أريد|عايز|محتاج|ابحث عن|عندكم|متوفر/,
    /سعر|كام|بكام|تكلفة|ثمن/,
    /مواصفات|تفاصيل|معلومات عن|خصائص/
  ];
  
  const greetingPatterns = [
    /مرحبا|أهلا|السلام عليكم|صباح|مساء|هاي|hello/
  ];

  let intent = 'general';
  let confidence = 0.5;
  
  if (productPatterns.some(pattern => pattern.test(text))) {
    intent = 'product_inquiry';
    confidence = 0.8;
  } else if (greetingPatterns.some(pattern => pattern.test(text))) {
    intent = 'greeting';
    confidence = 0.9;
  }
  
  return { intent, confidence, originalText: messageText };
}

async function handleSpecificProductQuestion(messageText, companyId) {
  const text = messageText.toLowerCase();
  
  // Extract product keywords
  const keywords = [];
  const productTerms = ['كوتشي', 'نايك', 'طقم', 'مطبخ', 'هاتف', 'ذكي', 'قميص', 'قطني'];
  
  productTerms.forEach(term => {
    if (text.includes(term)) {
      keywords.push(term);
    }
  });
  
  if (keywords.length === 0) {
    return null;
  }
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const products = await prisma.product.findMany({
      where: {
        OR: keywords.map(keyword => ({
          OR: [
            { name: { contains: keyword } },
            { description: { contains: keyword } },
            { tags: { contains: keyword } }
          ]
        }))
      },
      take: 1
    });
    
    await prisma.$disconnect();
    
    if (products.length === 0) {
      return null;
    }
    
    const product = products[0];
    let questionType = 'general';
    let answer = '';
    
    if (/سعر|كام|بكام/.test(text)) {
      questionType = 'price';
      answer = `💰 سعر ${product.name}: ${product.price} جنيه`;
    } else if (/متاح|موجود|متوفر/.test(text)) {
      questionType = 'availability';
      answer = `📦 ${product.name}: ${product.stock > 0 ? `✅ متوفر (${product.stock} قطعة)` : '❌ غير متوفر'}`;
    } else if (/مواصفات|تفاصيل/.test(text)) {
      questionType = 'specifications';
      answer = `📋 تفاصيل ${product.name}:\n📝 ${product.description || 'منتج عالي الجودة'}\n💰 السعر: ${product.price} جنيه`;
    } else {
      answer = `ℹ️ ${product.name} - ${product.price} جنيه - ${product.stock > 0 ? 'متوفر' : 'غير متوفر'}`;
    }
    
    return {
      answer,
      product,
      questionType,
      hasSpecificInfo: true
    };
    
  } catch (error) {
    console.error('Error in handleSpecificProductQuestion:', error);
    return null;
  }
}

function shouldSuggestProducts(messageIntent, messageText, conversationContext = {}) {
  const { intent, confidence } = messageIntent;
  
  if (intent === 'product_inquiry' && confidence > 0.7) {
    return !conversationContext.foundRequestedProduct;
  }
  
  if (intent === 'greeting') {
    const hasShoppingIntent = /أريد|عايز|محتاج|شراء|تسوق/.test(messageText.toLowerCase());
    return hasShoppingIntent;
  }
  
  return false;
}

function formatProductSuggestions(suggestions, messageIntent) {
  if (!suggestions || suggestions.length === 0) {
    return '';
  }
  
  let header = '\n\n🛍️ منتجات قد تهمك:\n';
  let suggestionText = header;
  
  suggestions.slice(0, 2).forEach((product, index) => {
    suggestionText += `${index + 1}. ${product.name} - ${product.price} جنيه\n`;
  });
  
  return suggestionText;
}

testChatbotIntegration();
