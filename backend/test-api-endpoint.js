const http = require('http');

async function testApiEndpoint() {
  try {
    console.log('🧪 Testing API endpoint...\n');

    // Use direct database query instead
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const products = await prisma.product.findMany({
      take: 1,
      include: {
        category: true,
        company: true
      }
    });

    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('🔍 Raw product from database:');
      console.log('📝 Name:', firstProduct.name);
      console.log('🏷️ Tags (raw):', firstProduct.tags, '(type:', typeof firstProduct.tags, ')');
      console.log('🖼️ Images (raw):', firstProduct.images, '(type:', typeof firstProduct.images, ')');
      console.log('📏 Dimensions (raw):', firstProduct.dimensions, '(type:', typeof firstProduct.dimensions, ')');

      // Test processing
      console.log('\n🔧 After processing:');

      let processedTags = [];
      try {
        processedTags = firstProduct.tags ? JSON.parse(firstProduct.tags) : [];
        console.log('✅ Tags processed:', processedTags, '(type:', typeof processedTags, ')');
      } catch (error) {
        console.log('❌ Tags processing failed:', error.message);
      }

      let processedImages = [];
      try {
        processedImages = firstProduct.images ? JSON.parse(firstProduct.images) : [];
        console.log('✅ Images processed:', processedImages, '(type:', typeof processedImages, ')');
      } catch (error) {
        console.log('❌ Images processing failed:', error.message);
      }
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Error testing:', error.message);
  }
}

testApiEndpoint();
