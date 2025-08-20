const { PrismaClient } = require('@prisma/client');

async function testProductAccess() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Product Data Access for Chatbot...\n');
    
    // Test 1: Get all products with full details
    console.log('📦 Test 1: Getting all products with full details...');
    const products = await prisma.product.findMany({
      include: {
        category: true,
        company: true,
        variants: true
      }
    });
    
    console.log(`✅ Found ${products.length} products in database\n`);
    
    // Test 2: Analyze each product's data completeness
    console.log('📊 Test 2: Analyzing data completeness...');
    
    products.forEach((product, index) => {
      console.log(`\n🛍️ Product ${index + 1}: ${product.name}`);
      console.log(`📝 Description: ${product.description ? '✅ Available' : '❌ Missing'}`);
      console.log(`💰 Price: ${product.price ? `✅ ${product.price} جنيه` : '❌ Missing'}`);
      console.log(`📦 Stock: ${product.stock !== null ? `✅ ${product.stock} قطعة` : '❌ Missing'}`);
      console.log(`🏷️ Category: ${product.category?.name ? `✅ ${product.category.name}` : '❌ Missing'}`);
      console.log(`🏢 Company: ${product.company?.name ? `✅ ${product.company.name}` : '❌ Missing'}`);
      console.log(`📸 Images: ${product.images ? '✅ Available' : '❌ Missing'}`);
      console.log(`🏷️ Tags: ${product.tags ? '✅ Available' : '❌ Missing'}`);
      console.log(`📏 Dimensions: ${product.dimensions ? '✅ Available' : '❌ Missing'}`);
      console.log(`⚖️ Weight: ${product.weight ? `✅ ${product.weight}` : '❌ Missing'}`);
      console.log(`🔢 SKU: ${product.sku ? `✅ ${product.sku}` : '❌ Missing'}`);
      console.log(`✅ Active: ${product.isActive ? '✅ Yes' : '❌ No'}`);
      
      // Test JSON parsing
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          console.log(`📸 Images parsed: ${images.length} images`);
        } catch (error) {
          console.log(`❌ Images parsing failed: ${error.message}`);
        }
      }
      
      if (product.tags) {
        try {
          const tags = JSON.parse(product.tags);
          console.log(`🏷️ Tags parsed: ${tags.join(', ')}`);
        } catch (error) {
          console.log(`❌ Tags parsing failed: ${error.message}`);
        }
      }
    });
    
    // Test 3: Simulate chatbot queries
    console.log('\n\n🤖 Test 3: Simulating Chatbot Queries...');
    
    const testQueries = [
      'كام سعر الكوتشي النايك؟',
      'عندكم طقم أدوات المطبخ متوفر؟',
      'إيه مواصفات الهاتف الذكي؟',
      'عايز أعرف تفاصيل القميص القطني'
    ];
    
    for (const query of testQueries) {
      console.log(`\n❓ Query: "${query}"`);
      
      // Extract product keywords from query
      const keywords = extractProductKeywords(query.toLowerCase());
      console.log(`🔍 Extracted keywords: ${keywords.join(', ')}`);
      
      if (keywords.length > 0) {
        // Search for matching products
        const matchingProducts = await prisma.product.findMany({
          where: {
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
        
        if (matchingProducts.length > 0) {
          console.log(`✅ Found ${matchingProducts.length} matching products:`);
          matchingProducts.forEach(product => {
            console.log(`   📦 ${product.name} - ${product.price} جنيه (Stock: ${product.stock})`);
          });
          
          // Test specific question answering
          const questionType = determineQuestionType(query.toLowerCase());
          const answer = generateSpecificAnswer(matchingProducts[0], questionType, query);
          console.log(`🤖 Generated Answer: ${answer}`);
        } else {
          console.log(`❌ No matching products found`);
        }
      } else {
        console.log(`❌ No keywords extracted`);
      }
    }
    
    // Test 4: Check default product
    console.log('\n\n🎯 Test 4: Checking Default Product...');
    const defaultProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { name: { contains: 'افتراضي' } },
          { name: { contains: 'مميز' } },
          { tags: { contains: 'افتراضي' } }
        ]
      }
    });
    
    if (defaultProduct) {
      console.log(`✅ Default product found: ${defaultProduct.name}`);
      console.log(`💰 Price: ${defaultProduct.price} جنيه`);
      console.log(`📦 Stock: ${defaultProduct.stock} قطعة`);
    } else {
      console.log(`❌ No default product found`);
    }
    
    // Test 5: Check AI Settings
    console.log('\n\n⚙️ Test 5: Checking AI Settings...');
    const aiSettings = await prisma.aiSettings.findFirst({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' }
    });
    
    if (aiSettings) {
      console.log(`✅ AI Settings found`);
      console.log(`🤖 Auto Reply: ${aiSettings.autoReplyEnabled ? 'Enabled' : 'Disabled'}`);
      console.log(`🛍️ Auto Suggest Products: ${aiSettings.autoSuggestProducts ? 'Enabled' : 'Disabled'}`);
      console.log(`📊 Max Suggestions: ${aiSettings.maxSuggestions || 'Not set'}`);
      console.log(`🎯 Default Product ID: ${aiSettings.defaultProductId || 'Not set'}`);
    } else {
      console.log(`❌ No AI settings found`);
    }
    
    console.log('\n🎉 Product Access Test Complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions
function extractProductKeywords(text) {
  const keywords = [];
  
  const productTerms = [
    'كوتشي', 'حذاء', 'جزمة', 'نايك', 'اديداس',
    'تيشيرت', 'قميص', 'بلوزة', 'فستان', 'قطني',
    'بنطلون', 'جينز', 'شورت',
    'لابتوب', 'كمبيوتر', 'موبايل', 'تليفون', 'هاتف', 'ذكي',
    'ساعة', 'نظارة', 'شنطة', 'محفظة',
    'طقم', 'أدوات', 'مطبخ', 'طبخ'
  ];
  
  productTerms.forEach(term => {
    if (text.includes(term)) {
      keywords.push(term);
    }
  });
  
  return keywords;
}

function determineQuestionType(text) {
  if (/سعر|كام|بكام|تكلفة|ثمن/.test(text)) {
    return 'price';
  }
  if (/مواصفات|تفاصيل|معلومات|خصائص|وصف/.test(text)) {
    return 'specifications';
  }
  if (/متاح|موجود|في المخزن|متوفر|كمية/.test(text)) {
    return 'availability';
  }
  if (/لون|ألوان|مقاس|مقاسات|حجم/.test(text)) {
    return 'variants';
  }
  return 'general';
}

function generateSpecificAnswer(product, questionType, originalMessage) {
  let answer = '';
  
  switch (questionType) {
    case 'price':
      answer = `💰 سعر ${product.name}: ${product.price} جنيه`;
      break;
    case 'specifications':
      answer = `📋 تفاصيل ${product.name}:\n📝 ${product.description || 'منتج عالي الجودة'}\n💰 السعر: ${product.price} جنيه`;
      break;
    case 'availability':
      answer = `📦 ${product.name}: ${product.stock > 0 ? `✅ متوفر (${product.stock} قطعة)` : '❌ غير متوفر'}`;
      break;
    default:
      answer = `ℹ️ ${product.name} - ${product.price} جنيه - ${product.stock > 0 ? 'متوفر' : 'غير متوفر'}`;
  }
  
  return answer;
}

testProductAccess();
