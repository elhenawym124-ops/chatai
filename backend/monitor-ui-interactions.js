const { PrismaClient } = require('@prisma/client');

async function monitorUIInteractions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('👀 Monitoring UI Interactions for Product Edit Page...\n');
    
    const productId = 'cmde4snz7003puf4swmfv9qa1';
    
    console.log(`📦 Monitoring product: ${productId}`);
    console.log(`🔗 Edit page: http://localhost:3000/products/${productId}/edit`);
    console.log(`\n🎯 Instructions for testing:`);
    console.log(`1. Open the edit page in your browser`);
    console.log(`2. Try adding images using the URL input`);
    console.log(`3. Try adding new variants`);
    console.log(`4. Try editing existing variants`);
    console.log(`5. Try deleting variants`);
    console.log(`6. Try saving the form`);
    console.log(`\n📊 Current state before testing:`);
    
    // Get initial state
    let currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });
    
    console.log(`   Name: ${currentProduct.name}`);
    console.log(`   Price: ${currentProduct.price} جنيه`);
    console.log(`   Stock: ${currentProduct.stock}`);
    
    let imageCount = 0;
    try {
      const images = currentProduct.images ? JSON.parse(currentProduct.images) : [];
      imageCount = images.length;
      console.log(`   Images: ${imageCount} images`);
    } catch (e) {
      console.log(`   Images: Could not parse`);
    }
    
    console.log(`   Variants: ${currentProduct.variants.length} variants`);
    currentProduct.variants.forEach((variant, index) => {
      console.log(`      ${index + 1}. ${variant.name} (${variant.type}) - Stock: ${variant.stock}`);
    });
    
    console.log(`\n🔄 Monitoring changes every 5 seconds...`);
    console.log(`   Press Ctrl+C to stop monitoring\n`);
    
    let previousState = JSON.stringify({
      name: currentProduct.name,
      price: currentProduct.price,
      stock: currentProduct.stock,
      images: currentProduct.images,
      variantCount: currentProduct.variants.length,
      variants: currentProduct.variants.map(v => ({
        id: v.id,
        name: v.name,
        stock: v.stock,
        price: v.price,
        images: v.images
      }))
    });
    
    let checkCount = 0;
    
    const monitorInterval = setInterval(async () => {
      try {
        checkCount++;
        
        const updatedProduct = await prisma.product.findUnique({
          where: { id: productId },
          include: { variants: true }
        });
        
        const currentState = JSON.stringify({
          name: updatedProduct.name,
          price: updatedProduct.price,
          stock: updatedProduct.stock,
          images: updatedProduct.images,
          variantCount: updatedProduct.variants.length,
          variants: updatedProduct.variants.map(v => ({
            id: v.id,
            name: v.name,
            stock: v.stock,
            price: v.price,
            images: v.images
          }))
        });
        
        if (currentState !== previousState) {
          console.log(`\n🔔 CHANGE DETECTED at ${new Date().toLocaleTimeString()}:`);
          
          // Check what changed
          const prev = JSON.parse(previousState);
          const curr = JSON.parse(currentState);
          
          if (prev.name !== curr.name) {
            console.log(`   📝 Name changed: "${prev.name}" → "${curr.name}"`);
          }
          
          if (prev.price !== curr.price) {
            console.log(`   💰 Price changed: ${prev.price} → ${curr.price} جنيه`);
          }
          
          if (prev.stock !== curr.stock) {
            console.log(`   📦 Stock changed: ${prev.stock} → ${curr.stock}`);
          }
          
          if (prev.images !== curr.images) {
            console.log(`   🖼️ Images changed:`);
            try {
              const prevImages = prev.images ? JSON.parse(prev.images) : [];
              const currImages = curr.images ? JSON.parse(curr.images) : [];
              console.log(`      Previous: ${prevImages.length} images`);
              console.log(`      Current: ${currImages.length} images`);
              
              // Show added images
              const addedImages = currImages.filter(img => !prevImages.includes(img));
              if (addedImages.length > 0) {
                console.log(`      ➕ Added images:`);
                addedImages.forEach((img, index) => {
                  console.log(`         ${index + 1}. ${img}`);
                });
              }
              
              // Show removed images
              const removedImages = prevImages.filter(img => !currImages.includes(img));
              if (removedImages.length > 0) {
                console.log(`      ➖ Removed images:`);
                removedImages.forEach((img, index) => {
                  console.log(`         ${index + 1}. ${img}`);
                });
              }
            } catch (e) {
              console.log(`      Could not parse image changes`);
            }
          }
          
          if (prev.variantCount !== curr.variantCount) {
            console.log(`   🎨 Variant count changed: ${prev.variantCount} → ${curr.variantCount}`);
          }
          
          // Check variant changes
          const prevVariantIds = prev.variants.map(v => v.id);
          const currVariantIds = curr.variants.map(v => v.id);
          
          // New variants
          const newVariants = curr.variants.filter(v => !prevVariantIds.includes(v.id));
          if (newVariants.length > 0) {
            console.log(`   ➕ New variants:`);
            newVariants.forEach(variant => {
              console.log(`      - ${variant.name} (${variant.id})`);
            });
          }
          
          // Deleted variants
          const deletedVariants = prev.variants.filter(v => !currVariantIds.includes(v.id));
          if (deletedVariants.length > 0) {
            console.log(`   ➖ Deleted variants:`);
            deletedVariants.forEach(variant => {
              console.log(`      - ${variant.name} (${variant.id})`);
            });
          }
          
          // Updated variants
          curr.variants.forEach(currVariant => {
            const prevVariant = prev.variants.find(v => v.id === currVariant.id);
            if (prevVariant) {
              const changes = [];
              if (prevVariant.name !== currVariant.name) {
                changes.push(`name: "${prevVariant.name}" → "${currVariant.name}"`);
              }
              if (prevVariant.stock !== currVariant.stock) {
                changes.push(`stock: ${prevVariant.stock} → ${currVariant.stock}`);
              }
              if (prevVariant.price !== currVariant.price) {
                changes.push(`price: ${prevVariant.price} → ${currVariant.price}`);
              }
              if (prevVariant.images !== currVariant.images) {
                changes.push(`images updated`);
              }
              
              if (changes.length > 0) {
                console.log(`   ✏️ Updated variant "${currVariant.name}":`);
                changes.forEach(change => {
                  console.log(`      - ${change}`);
                });
              }
            }
          });
          
          previousState = currentState;
        } else {
          // Show periodic status
          if (checkCount % 12 === 0) { // Every minute
            console.log(`⏰ ${new Date().toLocaleTimeString()} - No changes detected (${Math.floor(checkCount/12)} min)`);
          }
        }
        
      } catch (error) {
        console.error('❌ Error during monitoring:', error);
      }
    }, 5000); // Check every 5 seconds
    
    // Handle Ctrl+C
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Stopping monitor...');
      clearInterval(monitorInterval);
      
      // Show final state
      const finalProduct = await prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true }
      });
      
      console.log('\n📊 Final state:');
      console.log(`   Name: ${finalProduct.name}`);
      console.log(`   Price: ${finalProduct.price} جنيه`);
      console.log(`   Stock: ${finalProduct.stock}`);
      
      try {
        const images = finalProduct.images ? JSON.parse(finalProduct.images) : [];
        console.log(`   Images: ${images.length} images`);
      } catch (e) {
        console.log(`   Images: Could not parse`);
      }
      
      console.log(`   Variants: ${finalProduct.variants.length} variants`);
      
      await prisma.$disconnect();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Monitor failed:', error);
    await prisma.$disconnect();
  }
}

monitorUIInteractions();
