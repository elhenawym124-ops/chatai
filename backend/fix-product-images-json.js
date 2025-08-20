const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixProductImagesJSON() {
  console.log('🔧 Fixing Product Images JSON Error...\n');
  
  try {
    const products = await prisma.product.findMany();
    
    console.log(`📦 Found ${products.length} products to check`);
    
    for (const product of products) {
      console.log(`\n🔍 Checking product: ${product.name}`);
      
      if (product.images) {
        try {
          const parsed = JSON.parse(product.images);
          console.log(`   ✅ Images JSON is valid (${parsed.length} images)`);
        } catch (error) {
          console.log(`   ❌ Images JSON is corrupted`);
          console.log(`   Error: ${error.message}`);
          console.log(`   Raw data: ${product.images.substring(0, 200)}...`);
          
          // إصلاح JSON المكسور
          console.log(`   🔧 Fixing JSON...`);
          
          const fixedImages = [
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop'
          ];
          
          await prisma.product.update({
            where: { id: product.id },
            data: { 
              images: JSON.stringify(fixedImages)
            }
          });
          
          console.log(`   ✅ Fixed! Added ${fixedImages.length} default images`);
        }
      } else {
        console.log(`   ⚠️ No images field found`);
        
        // إضافة صور افتراضية
        const defaultImages = [
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop'
        ];
        
        await prisma.product.update({
          where: { id: product.id },
          data: { 
            images: JSON.stringify(defaultImages)
          }
        });
        
        console.log(`   ✅ Added default images`);
      }
    }
    
    // التحقق النهائي
    console.log('\n🔍 Final verification...');
    const updatedProducts = await prisma.product.findMany();
    
    let allValid = true;
    for (const product of updatedProducts) {
      try {
        const images = JSON.parse(product.images);
        console.log(`✅ ${product.name}: ${images.length} images`);
      } catch (error) {
        console.log(`❌ ${product.name}: Still has JSON error`);
        allValid = false;
      }
    }
    
    if (allValid) {
      console.log('\n🎉 All product images JSON fixed successfully!');
      console.log('🔄 Please restart the server to reload RAG knowledge base');
    } else {
      console.log('\n⚠️ Some products still have JSON errors');
    }
    
  } catch (error) {
    console.error('❌ Error fixing product images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductImagesJSON();
