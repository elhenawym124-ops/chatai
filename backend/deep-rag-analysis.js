const { PrismaClient } = require('@prisma/client');
const ragService = require('./src/services/ragService');

const prisma = new PrismaClient();

async function deepRAGAnalysis() {
  console.log('🔍 Deep RAG Analysis...\n');
  
  try {
    // 1. فحص قاعدة البيانات مباشرة
    console.log('📊 Database Analysis:');
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        variants: { where: { isActive: true } }
      }
    });
    
    console.log(`   📦 Products in DB: ${products.length}`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`);
      console.log(`      Category: ${product.category?.name || 'None'}`);
      console.log(`      Price: ${product.price} EGP`);
      console.log(`      Stock: ${product.stock}`);
      console.log(`      Variants: ${product.variants?.length || 0}`);
      
      // فحص الصور
      try {
        const images = product.images ? JSON.parse(product.images) : [];
        console.log(`      Images: ${images.length} (${images.length > 0 ? 'Valid JSON' : 'No images'})`);
      } catch (error) {
        console.log(`      Images: ERROR - ${error.message}`);
      }
      
      console.log(`      Description length: ${product.description?.length || 0} chars`);
      console.log('');
    });
    
    // 2. فحص RAG Knowledge Base
    console.log('🧠 RAG Knowledge Base Analysis:');
    
    // الوصول لـ knowledge base مباشرة
    const knowledgeBase = ragService.knowledgeBase;
    console.log(`   📚 Total items in knowledge base: ${knowledgeBase.size}`);
    
    let productCount = 0;
    let faqCount = 0;
    let policyCount = 0;
    
    for (const [key, item] of knowledgeBase.entries()) {
      if (item.type === 'product') productCount++;
      else if (item.type === 'faq') faqCount++;
      else if (item.type === 'policy') policyCount++;
    }
    
    console.log(`   📦 Products in KB: ${productCount}`);
    console.log(`   ❓ FAQs in KB: ${faqCount}`);
    console.log(`   📋 Policies in KB: ${policyCount}`);
    
    // 3. فحص محتوى المنتجات في KB
    console.log('\n📝 Product Content Analysis:');
    let productIndex = 0;
    for (const [key, item] of knowledgeBase.entries()) {
      if (item.type === 'product' && productIndex < 3) {
        productIndex++;
        console.log(`   Product ${productIndex}:`);
        console.log(`      Key: ${key}`);
        console.log(`      Content length: ${item.content.length} chars`);
        console.log(`      Content preview: ${item.content.substring(0, 200)}...`);
        console.log(`      Metadata: ${JSON.stringify(item.metadata, null, 2)}`);
        console.log('');
      }
    }
    
    // 4. اختبار البحث المباشر
    console.log('🔍 Direct Search Testing:');
    const testTerms = ['كوتشي', 'اسكوتش', 'أديداس', 'نايك', 'حذاء'];
    
    for (const term of testTerms) {
      console.log(`   Testing term: "${term}"`);
      
      let foundCount = 0;
      for (const [key, item] of knowledgeBase.entries()) {
        if (item.type === 'product') {
          const content = item.content.toLowerCase();
          if (content.includes(term.toLowerCase())) {
            foundCount++;
          }
        }
      }
      
      console.log(`      Found in ${foundCount} products`);
    }
    
    // 5. اختبار calculateRelevanceScore
    console.log('\n🎯 Scoring Algorithm Test:');
    const sampleContent = 'كوتشي اسكوتش عملي ومريح للاستخدام اليومي';
    const searchTerms = ['كوتشي', 'اسكوتش'];
    
    console.log(`   Sample content: "${sampleContent}"`);
    console.log(`   Search terms: ${JSON.stringify(searchTerms)}`);
    
    const score = ragService.calculateRelevanceScore(sampleContent, searchTerms);
    console.log(`   Calculated score: ${score}`);
    
    // 6. فحص نظام الصور
    console.log('\n📸 Image System Analysis:');
    
    for (const product of products.slice(0, 3)) {
      console.log(`   Product: ${product.name}`);
      
      try {
        const images = product.images ? JSON.parse(product.images) : [];
        console.log(`      Images count: ${images.length}`);
        
        if (images.length > 0) {
          images.forEach((img, index) => {
            console.log(`         ${index + 1}. ${img}`);
            // فحص صحة الرابط
            const isValidUrl = img.startsWith('http') && img.includes('.');
            console.log(`            Valid URL: ${isValidUrl ? '✅' : '❌'}`);
          });
        }
      } catch (error) {
        console.log(`      ❌ Image parsing error: ${error.message}`);
      }
    }
    
    return {
      dbProducts: products.length,
      kbProducts: productCount,
      kbTotal: knowledgeBase.size,
      hasImageIssues: products.some(p => {
        try {
          if (p.images) JSON.parse(p.images);
          return false;
        } catch {
          return true;
        }
      })
    };
    
  } catch (error) {
    console.error('❌ Deep analysis error:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

deepRAGAnalysis()
  .then(results => {
    if (results) {
      console.log('\n📊 Analysis Summary:');
      console.log(`   Database Products: ${results.dbProducts}`);
      console.log(`   Knowledge Base Products: ${results.kbProducts}`);
      console.log(`   Total KB Items: ${results.kbTotal}`);
      console.log(`   Image Issues: ${results.hasImageIssues ? '❌ Yes' : '✅ No'}`);
      
      console.log('\n🎯 Issues Identified:');
      if (results.dbProducts !== results.kbProducts) {
        console.log('   ❌ Mismatch between DB and KB product counts');
      }
      if (results.kbProducts === 0) {
        console.log('   ❌ No products loaded in knowledge base');
      }
      if (results.hasImageIssues) {
        console.log('   ❌ Image JSON parsing issues detected');
      }
    }
  })
  .catch(console.error);
