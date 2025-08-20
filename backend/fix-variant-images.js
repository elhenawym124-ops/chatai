const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixVariantImages() {
  console.log('🔧 Fixing Variant Images JSON...\n');
  
  try {
    const variants = await prisma.productVariant.findMany({
      where: { isActive: true },
      include: { product: true }
    });
    
    console.log(`🔄 Found ${variants.length} variants to check`);
    
    for (const variant of variants) {
      console.log(`\n📋 Variant: ${variant.name} (Product: ${variant.product.name})`);
      
      if (variant.images) {
        try {
          // محاولة parse الـ JSON
          const images = JSON.parse(variant.images);
          console.log(`   ✅ JSON is valid (${images.length} images)`);
        } catch (error) {
          console.log(`   ❌ JSON Error: ${error.message}`);
          console.log(`   Raw data: ${variant.images.substring(0, 100)}...`);
          
          // محاولة إصلاح HTML encoding
          let fixedImages = variant.images;
          
          // إصلاح HTML entities
          fixedImages = fixedImages
            .replace(/&quot;/g, '"')
            .replace(/&#x2F;/g, '/')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
          
          try {
            const parsedImages = JSON.parse(fixedImages);
            console.log(`   🔧 Fixed! Found ${parsedImages.length} images`);
            
            // تحديث في قاعدة البيانات
            await prisma.productVariant.update({
              where: { id: variant.id },
              data: { images: fixedImages }
            });
            
            console.log(`   ✅ Updated in database`);
          } catch (secondError) {
            console.log(`   ❌ Still can't fix: ${secondError.message}`);
            
            // إنشاء JSON جديد بصور افتراضية
            const defaultImages = [
              'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
              'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop'
            ];
            
            await prisma.productVariant.update({
              where: { id: variant.id },
              data: { images: JSON.stringify(defaultImages) }
            });
            
            console.log(`   🔄 Set default images`);
          }
        }
      } else {
        console.log(`   ⚠️ No images field`);
        
        // إضافة صور افتراضية
        const defaultImages = [
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop'
        ];
        
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { images: JSON.stringify(defaultImages) }
        });
        
        console.log(`   ✅ Added default images`);
      }
    }
    
    console.log('\n🎉 Variant images fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing variant images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixVariantImages();
