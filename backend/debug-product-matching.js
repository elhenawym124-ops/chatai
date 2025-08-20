const { PrismaClient } = require('@prisma/client');

async function debugProductMatching() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 تشخيص مطابقة أسماء المنتجات...\n');
    
    // Get all products
    const products = await prisma.product.findMany({
      where: {
        companyId: 'cmd5c0c9y0000ymzdd7wtv7ib'
      }
    });
    
    console.log(`📦 عدد المنتجات في قاعدة البيانات: ${products.length}\n`);
    
    // Show all product names
    console.log('📋 أسماء المنتجات الموجودة:');
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. "${product.name}"`);
    });
    
    console.log('\n🧪 اختبار مطابقة الأسماء...\n');
    
    // Test some common Gemini responses
    const testRecommendations = [
      { productName: 'كوتشي حريمي' },
      { productName: 'كوتشي رياضي نسائي' },
      { productName: 'كوتشي نايك' },
      { productName: 'كوتشي رياضي' },
      { productName: 'حذاء رياضي' },
      { productName: 'كوتشي' }
    ];
    
    testRecommendations.forEach(rec => {
      console.log(`🔍 اختبار: "${rec.productName}"`);
      
      // Exact match
      let matchingProduct = products.find(p => 
        p.name.toLowerCase() === rec.productName?.toLowerCase()
      );
      
      if (matchingProduct) {
        console.log(`   ✅ مطابقة تامة: "${matchingProduct.name}"`);
        return;
      }
      
      // Partial match
      matchingProduct = products.find(p => 
        p.name.toLowerCase().includes(rec.productName.toLowerCase()) ||
        rec.productName.toLowerCase().includes(p.name.toLowerCase())
      );
      
      if (matchingProduct) {
        console.log(`   ✅ مطابقة جزئية: "${matchingProduct.name}"`);
        return;
      }
      
      // Keyword match
      const keywords = rec.productName.toLowerCase().split(' ');
      matchingProduct = products.find(p => 
        keywords.some(keyword => 
          p.name.toLowerCase().includes(keyword) ||
          (p.description && p.description.toLowerCase().includes(keyword))
        )
      );
      
      if (matchingProduct) {
        console.log(`   ✅ مطابقة بالكلمات المفتاحية: "${matchingProduct.name}"`);
        console.log(`      الكلمات المطابقة: ${keywords.filter(k =>
          matchingProduct.name.toLowerCase().includes(k) ||
          (matchingProduct.description && matchingProduct.description.toLowerCase().includes(k))
        ).join(', ')}`);
        return;
      }
      
      console.log(`   ❌ لا توجد مطابقة`);
    });
    
    console.log('\n🔧 اختبار تحسين المطابقة...\n');
    
    // Test improved matching
    const improvedMatching = (recName, products) => {
      // Clean the recommendation name
      const cleanRecName = recName.toLowerCase().trim();
      
      // Try exact match first
      let match = products.find(p => p.name.toLowerCase() === cleanRecName);
      if (match) return { match, type: 'exact' };
      
      // Try contains match
      match = products.find(p => 
        p.name.toLowerCase().includes(cleanRecName) ||
        cleanRecName.includes(p.name.toLowerCase())
      );
      if (match) return { match, type: 'contains' };
      
      // Try keyword matching with scoring
      const keywords = cleanRecName.split(' ').filter(k => k.length > 2);
      let bestMatch = null;
      let bestScore = 0;
      
      products.forEach(product => {
        let score = 0;
        const productName = product.name.toLowerCase();
        const productDesc = (product.description || '').toLowerCase();
        
        keywords.forEach(keyword => {
          if (productName.includes(keyword)) score += 3;
          if (productDesc.includes(keyword)) score += 1;
        });
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = product;
        }
      });
      
      if (bestScore > 0) {
        return { match: bestMatch, type: 'keyword', score: bestScore };
      }
      
      return { match: null, type: 'none' };
    };
    
    testRecommendations.forEach(rec => {
      console.log(`🔍 تحسين مطابقة: "${rec.productName}"`);
      const result = improvedMatching(rec.productName, products);
      
      if (result.match) {
        console.log(`   ✅ ${result.type} match: "${result.match.name}"`);
        if (result.score) console.log(`      النقاط: ${result.score}`);
      } else {
        console.log(`   ❌ لا توجد مطابقة`);
      }
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProductMatching();
