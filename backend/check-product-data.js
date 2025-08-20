const { PrismaClient } = require('@prisma/client');

async function checkProductData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking product data structure...\n');
    
    // Check for default products first
    const defaultProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'افتراضي' } },
          { name: { contains: 'مميز' } },
          { tags: { contains: 'افتراضي' } }
        ]
      },
      select: {
        id: true,
        name: true,
        tags: true,
        images: true,
        dimensions: true
      }
    });

    console.log(`🎯 Found ${defaultProducts.length} default products\n`);

    const products = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        tags: true,
        images: true,
        dimensions: true
      }
    });
    
    products.forEach((product, index) => {
      console.log(`📦 Product ${index + 1}: ${product.name}`);
      console.log(`🏷️ Tags: "${product.tags}" (type: ${typeof product.tags})`);
      console.log(`🖼️ Images: "${product.images}" (type: ${typeof product.images})`);
      console.log(`📏 Dimensions: "${product.dimensions}" (type: ${typeof product.dimensions})`);
      
      // Test JSON parsing
      try {
        if (product.tags) {
          const parsedTags = JSON.parse(product.tags);
          console.log(`✅ Tags parsed successfully:`, parsedTags);
        }
      } catch (error) {
        console.log(`❌ Tags parsing failed:`, error.message);
        console.log(`🔧 Tags content:`, product.tags);
      }
      
      try {
        if (product.images) {
          const parsedImages = JSON.parse(product.images);
          console.log(`✅ Images parsed successfully:`, parsedImages);
        }
      } catch (error) {
        console.log(`❌ Images parsing failed:`, error.message);
      }
      
      try {
        if (product.dimensions) {
          const parsedDimensions = JSON.parse(product.dimensions);
          console.log(`✅ Dimensions parsed successfully:`, parsedDimensions);
        }
      } catch (error) {
        console.log(`❌ Dimensions parsing failed:`, error.message);
      }
      
      console.log('─'.repeat(50));
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductData();
