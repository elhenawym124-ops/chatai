const { PrismaClient } = require('@prisma/client');

async function testFinalProductSearch() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🎯 Testing Final Product Search Accuracy...\n');
    
    const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
    
    // Test the improved search function
    const testQueries = [
      {
        query: 'كام سعر الكوتشي النايك؟',
        expectedProduct: 'كوتشي رياضي نايك',
        keywords: ['كوتشي', 'نايك']
      },
      {
        query: 'عندكم هاتف ذكي متوفر؟',
        expectedProduct: 'هاتف ذكي متقدم',
        keywords: ['هاتف', 'ذكي']
      },
      {
        query: 'طقم أدوات المطبخ متوفر؟',
        expectedProduct: 'طقم أدوات المطبخ',
        keywords: ['طقم', 'أدوات', 'مطبخ']
      }
    ];
    
    for (const test of testQueries) {
      console.log(`\n❓ Query: "${test.query}"`);
      console.log(`🔍 Keywords: ${test.keywords.join(', ')}`);
      console.log(`🎯 Expected: ${test.expectedProduct}`);
      
      // Get all matching products
      const products = await prisma.product.findMany({
        where: {
          companyId: companyId,
          isActive: true,
          OR: test.keywords.map(keyword => ({
            OR: [
              { name: { contains: keyword } },
              { description: { contains: keyword } },
              { tags: { contains: keyword } }
            ]
          }))
        },
        include: {
          category: true
        }
      });
      
      console.log(`📦 Found ${products.length} matching products:`);
      
      // Score products
      const scoredProducts = products.map(product => {
        let score = 0;
        const productName = product.name.toLowerCase();
        const productDesc = (product.description || '').toLowerCase();
        const productTags = (product.tags || '').toLowerCase();
        
        test.keywords.forEach(keyword => {
          const keywordLower = keyword.toLowerCase();
          
          // Name matches (highest priority)
          if (productName.includes(keywordLower)) {
            score += 10;
            console.log(`   ✅ "${product.name}" - Name match for "${keyword}" (+10)`);
          }
          
          // Description matches
          if (productDesc.includes(keywordLower)) {
            score += 5;
            console.log(`   ✅ "${product.name}" - Description match for "${keyword}" (+5)`);
          }
          
          // Tags matches
          if (productTags.includes(keywordLower)) {
            score += 3;
            console.log(`   ✅ "${product.name}" - Tags match for "${keyword}" (+3)`);
          }
        });
        
        return { product, score };
      });
      
      // Sort by score
      scoredProducts.sort((a, b) => b.score - a.score);
      
      console.log(`\n📊 Scoring Results:`);
      scoredProducts.forEach((item, index) => {
        const isExpected = item.product.name === test.expectedProduct;
        const status = isExpected ? '🎯 EXPECTED' : '❌ NOT EXPECTED';
        console.log(`   ${index + 1}. ${item.product.name} - Score: ${item.score} ${status}`);
      });
      
      const bestMatch = scoredProducts[0];
      const isCorrect = bestMatch.product.name === test.expectedProduct;
      
      console.log(`\n🏆 Best Match: ${bestMatch.product.name} (Score: ${bestMatch.score})`);
      console.log(`✅ Correct Match: ${isCorrect ? 'YES' : 'NO'}`);
      
      if (!isCorrect) {
        console.log(`❌ Expected: ${test.expectedProduct}`);
        console.log(`❌ Got: ${bestMatch.product.name}`);
      }
      
      console.log('─'.repeat(80));
    }
    
    // Test the actual handleSpecificProductQuestion function
    console.log('\n\n🧪 Testing Actual Function...');
    
    // Import the function from server.js
    const { handleSpecificProductQuestion } = require('./server.js');
    
    for (const test of testQueries) {
      console.log(`\n💬 Testing: "${test.query}"`);
      
      try {
        const result = await handleSpecificProductQuestion(test.query, companyId);
        
        if (result) {
          const isCorrect = result.product.name === test.expectedProduct;
          console.log(`✅ Found answer: ${result.answer}`);
          console.log(`🛍️ Product: ${result.product.name}`);
          console.log(`🎯 Correct: ${isCorrect ? 'YES' : 'NO'}`);
          
          if (!isCorrect) {
            console.log(`❌ Expected: ${test.expectedProduct}`);
          }
        } else {
          console.log(`❌ No answer found`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Final Product Search Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Mock function if not available
async function handleSpecificProductQuestion(messageText, companyId) {
  const text = messageText.toLowerCase();
  
  // Extract keywords
  const keywords = [];
  const productTerms = [
    'كوتشي', 'حذاء', 'جزمة', 'نايك', 'اديداس',
    'تيشيرت', 'قميص', 'بلوزة', 'فستان', 'قطني', 'أنيق',
    'بنطلون', 'جينز', 'شورت',
    'لابتوب', 'كمبيوتر', 'موبايل', 'تليفون', 'هاتف', 'ذكي', 'متقدم',
    'ساعة', 'نظارة', 'شنطة', 'محفظة',
    'طقم', 'أدوات', 'مطبخ', 'طبخ'
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
        companyId: companyId,
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
        category: true
      }
    });
    
    await prisma.$disconnect();
    
    if (products.length === 0) {
      return null;
    }
    
    // Score products
    const scoredProducts = products.map(product => {
      let score = 0;
      const productName = product.name.toLowerCase();
      const productDesc = (product.description || '').toLowerCase();
      const productTags = (product.tags || '').toLowerCase();
      
      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        if (productName.includes(keywordLower)) {
          score += 10;
        }
        if (productDesc.includes(keywordLower)) {
          score += 5;
        }
        if (productTags.includes(keywordLower)) {
          score += 3;
        }
      });
      
      return { product, score };
    });
    
    // Sort by score and get best match
    scoredProducts.sort((a, b) => b.score - a.score);
    const bestMatch = scoredProducts[0];
    
    const product = bestMatch.product;
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
    console.error('Error:', error);
    return null;
  }
}

testFinalProductSearch();
