const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllProducts() {
  console.log('🔍 فحص جميع المنتجات والألوان في قاعدة البيانات...\n');
  
  try {
    // فحص جميع المنتجات
    const products = await prisma.product.findMany({
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    console.log(`📦 إجمالي المنتجات: ${products.length}\n`);
    
    if (products.length === 0) {
      console.log('❌ لا توجد منتجات في قاعدة البيانات');
      return;
    }
    
    // فحص كل منتج
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`${i + 1}. 📦 المنتج: ${product.name}`);
      console.log(`   🆔 المعرف: ${product.id}`);
      console.log(`   💰 السعر: ${product.price} ج.م`);
      console.log(`   📊 المخزون: ${product.stock}`);
      console.log(`   ✅ نشط: ${product.isActive ? 'نعم' : 'لا'}`);
      
      // فحص الصور
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          console.log(`   🖼️ عدد الصور: ${images.length}`);
          images.forEach((url, idx) => {
            console.log(`      ${idx + 1}. ${url.substring(0, 60)}...`);
          });
        } catch (error) {
          console.log(`   ❌ خطأ في تحليل الصور: ${error.message}`);
        }
      } else {
        console.log(`   ⚠️ لا توجد صور`);
      }
      
      // فحص المتغيرات (الألوان)
      if (product.variants && product.variants.length > 0) {
        console.log(`   🎨 المتغيرات (${product.variants.length}):`);
        product.variants.forEach((variant, idx) => {
          console.log(`      ${idx + 1}. النوع: ${variant.type}`);
          console.log(`         القيمة: ${variant.value}`);
          console.log(`         السعر الإضافي: ${variant.priceModifier || 0} ج.م`);
          console.log(`         المخزون: ${variant.stock || 0}`);
          console.log(`         نشط: ${variant.isActive ? 'نعم' : 'لا'}`);
          
          // فحص صور المتغير
          if (variant.images) {
            try {
              const variantImages = JSON.parse(variant.images);
              console.log(`         🖼️ صور المتغير: ${variantImages.length}`);
              variantImages.forEach((url, imgIdx) => {
                console.log(`            ${imgIdx + 1}. ${url.substring(0, 50)}...`);
              });
            } catch (error) {
              console.log(`         ❌ خطأ في تحليل صور المتغير: ${error.message}`);
            }
          } else {
            console.log(`         ⚠️ لا توجد صور للمتغير`);
          }
        });
      } else {
        console.log(`   ⚠️ لا توجد متغيرات (ألوان)`);
      }
      
      console.log(`${'─'.repeat(80)}\n`);
    }
    
    // إحصائيات الألوان
    console.log('\n🎨 إحصائيات الألوان:');
    const colorStats = {};
    
    for (const product of products) {
      if (product.variants) {
        for (const variant of product.variants) {
          if (variant.type === 'color') {
            const color = variant.value;
            colorStats[color] = (colorStats[color] || 0) + 1;
          }
        }
      }
    }
    
    if (Object.keys(colorStats).length > 0) {
      console.log('الألوان المتاحة:');
      Object.entries(colorStats).forEach(([color, count]) => {
        console.log(`  🎨 ${color}: ${count} منتج`);
      });
    } else {
      console.log('❌ لا توجد ألوان محددة في المتغيرات');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkAllProducts().catch(console.error);
}

module.exports = checkAllProducts;
