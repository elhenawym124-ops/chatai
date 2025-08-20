const { PrismaClient } = require('@prisma/client');

async function fixProductData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing product data...\n');
    
    // Get all products
    const products = await prisma.product.findMany();
    
    let fixedCount = 0;
    
    for (const product of products) {
      let needsUpdate = false;
      const updateData = {};
      
      // Fix tags field
      if (product.tags === null) {
        updateData.tags = JSON.stringify([]);
        needsUpdate = true;
        console.log(`🏷️ Fixing tags for: ${product.name}`);
      } else if (product.tags && typeof product.tags === 'string') {
        try {
          JSON.parse(product.tags);
          // Already valid JSON
        } catch (error) {
          // Convert string to JSON array
          const tagsArray = product.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
          updateData.tags = JSON.stringify(tagsArray);
          needsUpdate = true;
          console.log(`🏷️ Converting tags to JSON for: ${product.name}`);
        }
      }
      
      // Fix images field
      if (product.images === null) {
        updateData.images = JSON.stringify([]);
        needsUpdate = true;
        console.log(`🖼️ Fixing images for: ${product.name}`);
      } else if (product.images && typeof product.images === 'string') {
        try {
          JSON.parse(product.images);
          // Already valid JSON
        } catch (error) {
          // Convert to empty array if invalid
          updateData.images = JSON.stringify([]);
          needsUpdate = true;
          console.log(`🖼️ Fixing invalid images JSON for: ${product.name}`);
        }
      }
      
      // Fix dimensions field
      if (product.dimensions && typeof product.dimensions === 'string') {
        try {
          JSON.parse(product.dimensions);
          // Already valid JSON
        } catch (error) {
          // Set to null if invalid
          updateData.dimensions = null;
          needsUpdate = true;
          console.log(`📏 Fixing invalid dimensions JSON for: ${product.name}`);
        }
      }
      
      // Update if needed
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updateData
        });
        fixedCount++;
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} products`);
    
    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const verifyProducts = await prisma.product.findMany({
      take: 3,
      select: {
        name: true,
        tags: true,
        images: true,
        dimensions: true
      }
    });
    
    verifyProducts.forEach((product, index) => {
      console.log(`\n📦 Product ${index + 1}: ${product.name}`);
      
      // Test tags
      try {
        const tags = product.tags ? JSON.parse(product.tags) : [];
        console.log(`✅ Tags: ${JSON.stringify(tags)}`);
      } catch (error) {
        console.log(`❌ Tags still invalid: ${product.tags}`);
      }
      
      // Test images
      try {
        const images = product.images ? JSON.parse(product.images) : [];
        console.log(`✅ Images: ${JSON.stringify(images)}`);
      } catch (error) {
        console.log(`❌ Images still invalid: ${product.images}`);
      }
      
      // Test dimensions
      try {
        const dimensions = product.dimensions ? JSON.parse(product.dimensions) : null;
        console.log(`✅ Dimensions: ${JSON.stringify(dimensions)}`);
      } catch (error) {
        console.log(`❌ Dimensions still invalid: ${product.dimensions}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductData();
