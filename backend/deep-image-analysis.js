const { PrismaClient } = require('@prisma/client');
const aiAgentService = require('./src/services/aiAgentService');

const prisma = new PrismaClient();

async function deepImageAnalysis() {
  console.log('📸 Deep Image System Analysis...\n');
  
  try {
    // 1. فحص الصور في قاعدة البيانات
    console.log('🗄️ Database Image Analysis:');
    const products = await prisma.product.findMany({
      where: { isActive: true }
    });
    
    for (const product of products) {
      console.log(`\n📦 Product: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          console.log(`   ✅ Images: ${images.length} valid URLs`);
          
          images.forEach((img, index) => {
            console.log(`      ${index + 1}. ${img}`);
            
            // فحص صحة الرابط
            const isValidUrl = img.startsWith('http') && img.includes('.');
            const isUnsplash = img.includes('unsplash.com');
            console.log(`         Valid URL: ${isValidUrl ? '✅' : '❌'}`);
            console.log(`         Unsplash: ${isUnsplash ? '✅' : '❌'}`);
          });
        } catch (error) {
          console.log(`   ❌ JSON Parse Error: ${error.message}`);
          console.log(`   Raw data: ${product.images.substring(0, 100)}...`);
        }
      } else {
        console.log(`   ⚠️ No images field`);
      }
    }
    
    // 2. اختبار findRelevantProductImages
    console.log('\n\n🔍 Testing findRelevantProductImages:');
    
    const testMessages = [
      'أريد أن أرى صور كوتشي اسكوتش',
      'ورني صور أديداس',
      'عايز أشوف الكوتشيات',
      'صور المنتجات المتوفرة'
    ];
    
    for (const message of testMessages) {
      console.log(`\n📝 Message: "${message}"`);
      
      try {
        // محاكاة relevantData من RAG
        const mockRelevantData = [
          {
            type: 'product',
            metadata: {
              id: 'test-id',
              name: 'كوتشي اسكوتش',
              price: 310,
              stock: 50,
              images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop']
            }
          }
        ];
        
        const images = await aiAgentService.findRelevantProductImages(message, 'product_inquiry', mockRelevantData);
        
        console.log(`   Found images: ${images.length}`);
        images.forEach((img, index) => {
          console.log(`      ${index + 1}. Type: ${img.type}`);
          console.log(`         URL: ${img.payload?.url}`);
          console.log(`         Title: ${img.title}`);
          console.log(`         Subtitle: ${img.subtitle}`);
        });
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // 3. اختبار البحث المباشر في المنتجات
    console.log('\n\n🔍 Testing searchProductsDirectly:');
    
    const searchMessages = [
      'كوتشي اسكوتش',
      'أديداس',
      'نايك أبيض',
      'حذاء نسائي'
    ];
    
    for (const message of searchMessages) {
      console.log(`\n📝 Search: "${message}"`);
      
      try {
        const products = await aiAgentService.searchProductsDirectly(message);
        console.log(`   Found products: ${products.length}`);
        
        products.forEach((product, index) => {
          console.log(`      ${index + 1}. ${product.name}`);
          console.log(`         Price: ${product.price} EGP`);
          console.log(`         Stock: ${product.stock}`);
          
          try {
            const images = product.images ? JSON.parse(product.images) : [];
            console.log(`         Images: ${images.length}`);
          } catch (error) {
            console.log(`         Images: Error parsing`);
          }
        });
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // 4. اختبار فلترة المنتجات
    console.log('\n\n🎯 Testing filterProductsByRequest:');
    
    const mockProducts = [
      { metadata: { name: 'كوتشي أديداس ستان سميث' } },
      { metadata: { name: 'كوتشي نايك اير فورس 1' } },
      { metadata: { name: 'كوتشي اسكوتش' } },
      { metadata: { name: 'كوتشي بوما سويد' } }
    ];
    
    const filterTests = [
      'أريد صور أديداس',
      'ورني كوتشي نايك',
      'عايز أشوف اسكوتش',
      'صور بوما'
    ];
    
    for (const message of filterTests) {
      console.log(`\n📝 Filter: "${message}"`);
      
      try {
        const filtered = aiAgentService.filterProductsByRequest(message, mockProducts);
        console.log(`   Filtered results: ${filtered.length}`);
        
        filtered.forEach((product, index) => {
          console.log(`      ${index + 1}. ${product.metadata?.name}`);
        });
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // 5. فحص تكامل النظام
    console.log('\n\n🔗 System Integration Test:');
    
    console.log('Testing full flow: Message -> RAG -> Images');
    
    const fullTestMessage = 'أريد أن أرى صور كوتشي أديداس';
    console.log(`Message: "${fullTestMessage}"`);
    
    // محاكاة تدفق كامل
    const ragService = require('./src/services/ragService');
    
    setTimeout(async () => {
      try {
        const relevantData = await ragService.retrieveRelevantData(fullTestMessage, 'product_inquiry', 'test');
        console.log(`RAG Results: ${relevantData.length}`);
        
        const images = await aiAgentService.findRelevantProductImages(fullTestMessage, 'product_inquiry', relevantData);
        console.log(`Final Images: ${images.length}`);
        
        images.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.title} - ${img.payload?.url?.substring(0, 50)}...`);
        });
        
      } catch (error) {
        console.log(`❌ Integration test error: ${error.message}`);
      }
    }, 3000);
    
  } catch (error) {
    console.error('❌ Deep image analysis error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deepImageAnalysis().catch(console.error);
