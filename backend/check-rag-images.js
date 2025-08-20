const { PrismaClient } = require('@prisma/client');
const RAGService = require('./src/services/ragService');

const prisma = new PrismaClient();

async function checkRAGImages() {
  console.log('🔍 فحص الصور في قاعدة البيانات و RAG...\n');
  
  try {
    // 1. فحص قاعدة البيانات
    console.log('📊 === قاعدة البيانات ===');
    const product = await prisma.product.findFirst();
    
    if (product) {
      console.log('📦 المنتج:', product.name);
      console.log('💰 السعر:', product.price, 'ج.م');
      console.log('🖼️ حقل الصور الخام:', product.images);
      
      if (product.images) {
        try {
          const dbImages = JSON.parse(product.images);
          console.log('📸 الصور في قاعدة البيانات:');
          dbImages.forEach((url, index) => {
            console.log(`  ${index + 1}. ${url}`);
          });
        } catch (error) {
          console.log('❌ خطأ في تحليل JSON:', error.message);
        }
      } else {
        console.log('⚠️ لا توجد صور في قاعدة البيانات');
      }
    }
    
    console.log('\n📊 === RAG System ===');
    
    // 2. فحص RAG
    const ragService = new RAGService();
    await ragService.initializeKnowledgeBase();
    
    // البحث عن المنتج في RAG
    const ragData = await ragService.retrieveData('كوتشي', 'product_inquiry');
    
    console.log('🔍 عدد النتائج في RAG:', ragData.length);
    
    ragData.forEach((item, index) => {
      if (item.type === 'product') {
        console.log(`\n📦 منتج RAG ${index + 1}:`);
        console.log('  الاسم:', item.metadata?.name || 'غير محدد');
        console.log('  السعر:', item.metadata?.price || 'غير محدد');
        console.log('  الصور:', item.metadata?.images || 'لا توجد');
        
        if (item.metadata?.images && Array.isArray(item.metadata.images)) {
          console.log('📸 صور RAG:');
          item.metadata.images.forEach((url, imgIndex) => {
            console.log(`    ${imgIndex + 1}. ${url}`);
          });
        }
      }
    });
    
    // 3. مقارنة الصور
    console.log('\n🔍 === المقارنة ===');
    if (product && product.images) {
      const dbImages = JSON.parse(product.images);
      const ragProduct = ragData.find(item => item.type === 'product');
      
      if (ragProduct && ragProduct.metadata?.images) {
        const ragImages = ragProduct.metadata.images;
        
        console.log('📊 مقارنة الصور:');
        console.log('  قاعدة البيانات:', dbImages.length, 'صور');
        console.log('  RAG:', ragImages.length, 'صور');
        
        const imagesMatch = JSON.stringify(dbImages.sort()) === JSON.stringify(ragImages.sort());
        console.log('  التطابق:', imagesMatch ? '✅ متطابقة' : '❌ مختلفة');
        
        if (!imagesMatch) {
          console.log('\n🚨 الاختلافات:');
          console.log('  قاعدة البيانات:', dbImages);
          console.log('  RAG:', ragImages);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRAGImages();
