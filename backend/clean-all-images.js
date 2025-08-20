const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // فحص أن الرابط يبدأ بـ http أو https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }

  // فحص أن الرابط يحتوي على نقطة (domain)
  if (!url.includes('.')) {
    return false;
  }

  // فحص أن الرابط ليس مجرد حرف واحد أو قصير جداً
  if (url.length < 10) {
    return false;
  }

  // فحص أن الرابط لا يحتوي على أحرف غريبة فقط
  if (url === 'h' || url === 't' || url.length === 1) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

async function cleanAllImages() {
  console.log('🧹 تنظيف جميع الصور المعطوبة...\n');
  
  try {
    let totalFixed = 0;
    
    // تنظيف صور المنتجات
    console.log('📦 تنظيف صور المنتجات...');
    const products = await prisma.product.findMany({
      select: { id: true, name: true, images: true }
    });
    
    for (const product of products) {
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          
          if (Array.isArray(images)) {
            const originalCount = images.length;
            const validImages = images.filter(url => isValidImageUrl(url));
            
            if (validImages.length !== originalCount) {
              await prisma.product.update({
                where: { id: product.id },
                data: { images: JSON.stringify(validImages) }
              });
              
              console.log(`🔧 ${product.name}: ${originalCount} → ${validImages.length} صور`);
              totalFixed++;
            } else {
              console.log(`✅ ${product.name}: جميع الصور صالحة (${validImages.length})`);
            }
          }
        } catch (error) {
          console.log(`❌ خطأ في معالجة ${product.name}: ${error.message}`);
        }
      }
    }
    
    // تنظيف صور المتغيرات
    console.log('\n🔧 تنظيف صور المتغيرات...');
    const variants = await prisma.productVariant.findMany({
      select: { id: true, name: true, images: true }
    });
    
    for (const variant of variants) {
      if (variant.images) {
        try {
          let images = JSON.parse(variant.images);
          
          // إذا كان string، نحوله إلى array
          if (typeof images === 'string') {
            console.log(`🔄 تحويل صور المتغير ${variant.name} من string إلى array`);
            
            // فك تشفير HTML entities إذا لزم الأمر
            images = images
              .replace(/&#x2F;/g, '/')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#x27;/g, "'");
            
            // تقسيم بالفاصلة
            images = images.split(',').map(url => url.trim()).filter(url => url.length > 0);
          }
          
          if (Array.isArray(images)) {
            const originalCount = images.length;
            const validImages = images.filter(url => isValidImageUrl(url));
            
            if (validImages.length !== originalCount || typeof JSON.parse(variant.images) === 'string') {
              await prisma.productVariant.update({
                where: { id: variant.id },
                data: { images: JSON.stringify(validImages) }
              });
              
              console.log(`🔧 ${variant.name}: ${originalCount} → ${validImages.length} صور`);
              totalFixed++;
            } else {
              console.log(`✅ ${variant.name}: جميع الصور صالحة (${validImages.length})`);
            }
          } else {
            console.log(`⚠️ ${variant.name}: نوع بيانات غير متوقع`);
          }
        } catch (error) {
          console.log(`❌ خطأ في معالجة المتغير ${variant.name}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n🎉 تم الانتهاء! تم إصلاح ${totalFixed} عنصر`);
    
    // فحص نهائي
    console.log('\n🔍 فحص نهائي...');
    
    const finalProducts = await prisma.product.findMany({
      select: { name: true, images: true }
    });
    
    let invalidFound = false;
    
    for (const product of finalProducts) {
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          if (Array.isArray(images)) {
            const invalidImages = images.filter(url => !isValidImageUrl(url));
            if (invalidImages.length > 0) {
              console.log(`❌ ${product.name} لا يزال يحتوي على صور غير صالحة:`, invalidImages);
              invalidFound = true;
            }
          }
        } catch (error) {
          console.log(`❌ خطأ في فحص ${product.name}`);
          invalidFound = true;
        }
      }
    }
    
    const finalVariants = await prisma.productVariant.findMany({
      select: { name: true, images: true }
    });
    
    for (const variant of finalVariants) {
      if (variant.images) {
        try {
          const images = JSON.parse(variant.images);
          if (Array.isArray(images)) {
            const invalidImages = images.filter(url => !isValidImageUrl(url));
            if (invalidImages.length > 0) {
              console.log(`❌ المتغير ${variant.name} لا يزال يحتوي على صور غير صالحة:`, invalidImages);
              invalidFound = true;
            }
          }
        } catch (error) {
          console.log(`❌ خطأ في فحص المتغير ${variant.name}`);
          invalidFound = true;
        }
      }
    }
    
    if (!invalidFound) {
      console.log('✅ جميع الصور نظيفة وصالحة!');
    }
    
  } catch (error) {
    console.error('❌ خطأ في تنظيف الصور:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAllImages();
