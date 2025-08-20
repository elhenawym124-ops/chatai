const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function decodeHtmlEntities(str) {
  return str
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

async function fixImages() {
  console.log('🔧 Fixing corrupted image data...');
  
  try {
    // إصلاح صور المتغيرات
    console.log('\n🔧 Fixing variant images...');
    const variants = await prisma.productVariant.findMany({
      select: { id: true, name: true, images: true }
    });
    
    let fixedCount = 0;
    
    for (const variant of variants) {
      if (variant.images) {
        try {
          // محاولة parse كـ JSON أولاً
          const images = JSON.parse(variant.images);

          if (Array.isArray(images)) {
            console.log(`✅ Variant ${variant.name}: Already valid JSON array`);
            continue;
          } else if (typeof images === 'string') {
            // إذا كان النتيجة string، فهذا يعني أنه يحتاج إصلاح
            console.log(`🔧 Fixing variant ${variant.name}...`);
            console.log(`   Original: ${variant.images}`);
            console.log(`   Parsed as string: ${images}`);

            // فك تشفير HTML entities
            let decodedString = decodeHtmlEntities(images);
            console.log(`   Decoded: ${decodedString}`);

            // تقسيم الروابط بالفاصلة
            let imageUrls = decodedString.split(',').map(url => url.trim()).filter(url => url.length > 0);

            // فلترة الروابط الصالحة فقط
            imageUrls = imageUrls.filter(url => {
              const isValid = url &&
                             typeof url === 'string' &&
                             url.startsWith('http') &&
                             url.includes('.') &&
                             url.length > 10 &&
                             url !== 'h' &&
                             url !== 't';

              if (!isValid) {
                console.log(`   ❌ Filtering out invalid URL: "${url}"`);
              }
              return isValid;
            });

            if (imageUrls.length > 0) {
              // تحديث قاعدة البيانات
              await prisma.productVariant.update({
                where: { id: variant.id },
                data: { images: JSON.stringify(imageUrls) }
              });

              console.log(`   ✅ Fixed! New images: ${JSON.stringify(imageUrls)}`);
              fixedCount++;
            } else {
              console.log(`   ⚠️ No valid images found for variant ${variant.name}`);
            }
          }
        } catch (error) {
          console.log(`❌ Error processing variant ${variant.name}: ${error.message}`);
        }
      }
    }
    
    // إصلاح صور المنتجات إذا لزم الأمر
    console.log('\n🔧 Checking product images...');
    const products = await prisma.product.findMany({
      select: { id: true, name: true, images: true }
    });
    
    for (const product of products) {
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          if (Array.isArray(images)) {
            // فلترة الصور غير الصالحة
            const validImages = images.filter(url => {
              const isValid = url && 
                             typeof url === 'string' && 
                             url.startsWith('http') && 
                             url.includes('.') && 
                             url.length > 10 &&
                             url !== 'h' && 
                             url !== 't';
              
              if (!isValid) {
                console.log(`   ❌ Filtering out invalid product image: "${url}"`);
              }
              return isValid;
            });
            
            if (validImages.length !== images.length) {
              await prisma.product.update({
                where: { id: product.id },
                data: { images: JSON.stringify(validImages) }
              });
              
              console.log(`   🔧 Fixed product ${product.name}: ${images.length} → ${validImages.length} images`);
              fixedCount++;
            } else {
              console.log(`✅ Product ${product.name}: All images are valid`);
            }
          }
        } catch (error) {
          console.log(`❌ Error processing product ${product.name}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} items with corrupted image data`);
    
  } catch (error) {
    console.error('❌ Error fixing images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImages();
