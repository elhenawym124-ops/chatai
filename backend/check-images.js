const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  console.log('🔍 Checking for invalid image URLs...');
  
  try {
    // فحص صور المنتجات
    console.log('\n📦 Checking product images...');
    const products = await prisma.product.findMany({
      select: { id: true, name: true, images: true }
    });
    
    let invalidProductImages = [];
    
    for (const product of products) {
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          
          images.forEach((img, index) => {
            const isValid = img && 
                           typeof img === 'string' && 
                           img.startsWith('http') && 
                           img.includes('.') && 
                           img.length > 10 &&
                           img !== 'h' && 
                           img !== 't';
            
            if (!isValid) {
              invalidProductImages.push({
                productId: product.id,
                productName: product.name,
                imageIndex: index,
                imageUrl: img
              });
            }
          });
        } catch (error) {
          console.log(`❌ JSON Parse Error for ${product.name}: ${error.message}`);
        }
      }
    }
    
    // فحص صور المتغيرات
    console.log('\n🔧 Checking variant images...');
    const variants = await prisma.productVariant.findMany({
      select: { id: true, name: true, images: true, productId: true }
    });
    
    let invalidVariantImages = [];
    
    for (const variant of variants) {
      if (variant.images) {
        try {
          const images = JSON.parse(variant.images);
          console.log(`   Variant ${variant.name}: ${typeof images} - ${Array.isArray(images) ? 'Array' : 'Not Array'}`);
          console.log(`   Raw images data: ${variant.images}`);

          if (Array.isArray(images)) {
            images.forEach((img, index) => {
              const isValid = img &&
                             typeof img === 'string' &&
                             img.startsWith('http') &&
                             img.includes('.') &&
                             img.length > 10 &&
                             img !== 'h' &&
                             img !== 't';

              console.log(`     Image ${index + 1}: "${img}" - Valid: ${isValid ? '✅' : '❌'}`);

              if (!isValid) {
                invalidVariantImages.push({
                  variantId: variant.id,
                  variantName: variant.name,
                  productId: variant.productId,
                  imageIndex: index,
                  imageUrl: img
                });
              }
            });
          } else {
            console.log(`   ⚠️ Images is not an array for variant ${variant.name}`);
          }
        } catch (error) {
          console.log(`❌ JSON Parse Error for variant ${variant.name}: ${error.message}`);
          console.log(`   Raw data: ${variant.images}`);
        }
      }
    }
    
    // عرض النتائج
    console.log('\n📊 RESULTS:');
    console.log(`❌ Invalid product images found: ${invalidProductImages.length}`);
    console.log(`❌ Invalid variant images found: ${invalidVariantImages.length}`);
    
    if (invalidProductImages.length > 0) {
      console.log('\n🚨 INVALID PRODUCT IMAGES:');
      invalidProductImages.forEach((item, index) => {
        console.log(`${index + 1}. Product: ${item.productName} (${item.productId})`);
        console.log(`   Image ${item.imageIndex + 1}: "${item.imageUrl}"`);
      });
    }
    
    if (invalidVariantImages.length > 0) {
      console.log('\n🚨 INVALID VARIANT IMAGES:');
      invalidVariantImages.forEach((item, index) => {
        console.log(`${index + 1}. Variant: ${item.variantName} (${item.variantId})`);
        console.log(`   Product: ${item.productId}`);
        console.log(`   Image ${item.imageIndex + 1}: "${item.imageUrl}"`);
      });
    }
    
    if (invalidProductImages.length === 0 && invalidVariantImages.length === 0) {
      console.log('✅ All images are valid!');
    }
    
  } catch (error) {
    console.error('❌ Error checking images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
