const { PrismaClient } = require('@prisma/client');

async function testGeminiProductAccess() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Gemini Access to Product Data...\n');
    
    // Test 1: Check if handleSpecificProductQuestion works
    console.log('📝 Test 1: Testing handleSpecificProductQuestion function...');
    
    const testQuestions = [
      'كام سعر الكوتشي النايك؟',
      'عندكم طقم أدوات المطبخ متوفر؟',
      'إيه مواصفات الهاتف الذكي؟',
      'عايز أعرف تفاصيل القميص القطني'
    ];
    
    const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
    
    for (const question of testQuestions) {
      console.log(`\n❓ Question: "${question}"`);
      
      try {
        const specificAnswer = await handleSpecificProductQuestion(question, companyId);
        
        if (specificAnswer) {
          console.log(`✅ Found specific answer:`);
          console.log(`📋 Type: ${specificAnswer.questionType}`);
          console.log(`💬 Answer: "${specificAnswer.answer}"`);
          if (specificAnswer.product) {
            console.log(`🛍️ Product Details:`);
            console.log(`   📝 Name: ${specificAnswer.product.name}`);
            console.log(`   💰 Price: ${specificAnswer.product.price} جنيه`);
            console.log(`   📦 Stock: ${specificAnswer.product.stock} قطعة`);
            console.log(`   📝 Description: ${specificAnswer.product.description || 'N/A'}`);
            console.log(`   🏷️ Tags: ${specificAnswer.product.tags || 'N/A'}`);
            console.log(`   📸 Images: ${specificAnswer.product.images || 'N/A'}`);
          }
        } else {
          console.log(`❌ No specific answer found`);
        }
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
      }
    }
    
    // Test 2: Check database access directly
    console.log('\n\n📊 Test 2: Testing direct database access...');
    
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'كوتشي' } },
          { name: { contains: 'نايك' } }
        ]
      },
      include: {
        category: true,
        company: true
      }
    });
    
    console.log(`✅ Found ${products.length} Nike shoes in database:`);
    products.forEach((product, index) => {
      console.log(`\n🛍️ Product ${index + 1}:`);
      console.log(`   📝 Name: ${product.name}`);
      console.log(`   💰 Price: ${product.price} جنيه`);
      console.log(`   📦 Stock: ${product.stock} قطعة`);
      console.log(`   📝 Description: ${product.description}`);
      console.log(`   🏷️ Category: ${product.category?.name || 'N/A'}`);
      console.log(`   🏢 Company: ${product.company?.name || 'N/A'}`);
      console.log(`   🔢 SKU: ${product.sku}`);
      console.log(`   ✅ Active: ${product.isActive ? 'Yes' : 'No'}`);
      
      // Test JSON fields
      if (product.tags) {
        try {
          const tags = JSON.parse(product.tags);
          console.log(`   🏷️ Tags: ${tags.join(', ')}`);
        } catch (error) {
          console.log(`   🏷️ Tags (raw): ${product.tags}`);
        }
      }
      
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          console.log(`   📸 Images: ${images.length} images`);
        } catch (error) {
          console.log(`   📸 Images (raw): ${product.images}`);
        }
      }
    });
    
    // Test 3: Test Gemini AI service with product context
    console.log('\n\n🤖 Test 3: Testing Gemini AI with product context...');
    
    const AdvancedGeminiService = require('./src/services/advancedGeminiService');
    const advancedGeminiService = new AdvancedGeminiService();
    
    // Initialize Gemini service
    await advancedGeminiService.initialize(companyId);
    
    const testMessages = [
      'كام سعر الكوتشي النايك؟',
      'عندكم هاتف ذكي متوفر؟'
    ];
    
    for (const message of testMessages) {
      console.log(`\n💬 Testing message: "${message}"`);
      
      try {
        // Build context with product information
        const context = {
          customer: { id: 'test-customer', firstName: 'أحمد' },
          conversationHistory: [],
          availableProducts: products.slice(0, 3) // Pass some products as context
        };
        
        const response = await advancedGeminiService.generateResponse(companyId, message, context);
        
        if (response.success) {
          console.log(`✅ Gemini Response: "${response.response}"`);
          console.log(`📊 Model: ${response.modelUsed}, Confidence: ${response.confidence}`);
          console.log(`⏱️ Response Time: ${response.responseTime}ms`);
        } else {
          console.log(`❌ Gemini failed: ${response.error}`);
          console.log(`🔄 Fallback: ${response.fallbackResponse}`);
        }
      } catch (error) {
        console.error(`❌ Error with Gemini: ${error.message}`);
      }
    }
    
    // Test 4: Check if the system can answer specific questions
    console.log('\n\n🎯 Test 4: End-to-end question answering...');
    
    const endToEndTests = [
      {
        question: 'كام سعر الكوتشي النايك؟',
        expectedInfo: ['سعر', 'نايك', 'جنيه']
      },
      {
        question: 'الهاتف الذكي متوفر؟',
        expectedInfo: ['متوفر', 'هاتف', 'قطعة']
      }
    ];
    
    for (const test of endToEndTests) {
      console.log(`\n❓ Question: "${test.question}"`);
      
      // Step 1: Try specific answer first
      const specificAnswer = await handleSpecificProductQuestion(test.question, companyId);
      
      if (specificAnswer) {
        console.log(`✅ Specific answer found: "${specificAnswer.answer}"`);
        
        // Check if answer contains expected information
        const hasExpectedInfo = test.expectedInfo.every(info => 
          specificAnswer.answer.includes(info)
        );
        
        console.log(`📊 Contains expected info: ${hasExpectedInfo ? '✅ YES' : '❌ NO'}`);
        console.log(`🔍 Expected: ${test.expectedInfo.join(', ')}`);
      } else {
        console.log(`❌ No specific answer found`);
        
        // Fallback to Gemini
        try {
          const context = { customer: { id: 'test' }, conversationHistory: [] };
          const geminiResponse = await advancedGeminiService.generateResponse(companyId, test.question, context);
          
          if (geminiResponse.success) {
            console.log(`🤖 Gemini fallback: "${geminiResponse.response}"`);
          } else {
            console.log(`❌ Gemini also failed`);
          }
        } catch (error) {
          console.log(`❌ Gemini error: ${error.message}`);
        }
      }
    }
    
    console.log('\n🎉 Gemini Product Access Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to handle specific product questions
async function handleSpecificProductQuestion(messageText, companyId) {
  const text = messageText.toLowerCase();
  
  // Extract product keywords
  const keywords = [];
  const productTerms = [
    'كوتشي', 'حذاء', 'جزمة', 'نايك', 'اديداس',
    'تيشيرت', 'قميص', 'بلوزة', 'فستان', 'قطني',
    'بنطلون', 'جينز', 'شورت',
    'لابتوب', 'كمبيوتر', 'موبايل', 'تليفون', 'هاتف', 'ذكي',
    'ساعة', 'نظارة', 'شنطة', 'محفظة',
    'طقم', 'أدوات', 'مطبخ'
  ];
  
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
        isActive: true,
        OR: keywords.map(keyword => ({
          OR: [
            { name: { contains: keyword } },
            { description: { contains: keyword } },
            { tags: { contains: keyword } }
          ]
        }))
      },
      include: {
        category: true,
        company: true
      },
      take: 3
    });
    
    await prisma.$disconnect();
    
    if (products.length === 0) {
      return null;
    }
    
    const product = products[0];
    let questionType = 'general';
    let answer = '';
    
    // Determine question type and generate answer
    if (/سعر|كام|بكام|تكلفة|ثمن/.test(text)) {
      questionType = 'price';
      answer = `💰 سعر ${product.name}: ${product.price} جنيه`;
    } else if (/متاح|موجود|في المخزن|متوفر|كمية/.test(text)) {
      questionType = 'availability';
      answer = `📦 حالة التوفر لـ ${product.name}:\n`;
      if (product.stock > 0) {
        answer += `✅ متوفر (${product.stock} قطعة)\n💰 السعر: ${product.price} جنيه`;
      } else {
        answer += `❌ غير متوفر حالياً\n🔔 يمكنك طلب إشعار عند التوفر`;
      }
    } else if (/مواصفات|تفاصيل|معلومات|خصائص|وصف/.test(text)) {
      questionType = 'specifications';
      answer = `📋 تفاصيل ${product.name}:\n`;
      answer += `📝 الوصف: ${product.description || 'منتج عالي الجودة'}\n`;
      answer += `💰 السعر: ${product.price} جنيه\n`;
      answer += `📦 المخزون: ${product.stock} قطعة\n`;
      if (product.category) {
        answer += `🏷️ الفئة: ${product.category.name}`;
      }
    } else {
      answer = `ℹ️ معلومات عن ${product.name}:\n`;
      answer += `📝 ${product.description || 'منتج عالي الجودة'}\n`;
      answer += `💰 السعر: ${product.price} جنيه\n`;
      if (product.stock > 0) {
        answer += `✅ متوفر (${product.stock} قطعة)`;
      } else {
        answer += `❌ غير متوفر حالياً`;
      }
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

testGeminiProductAccess();
