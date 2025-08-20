/**
 * 🔍 فحص صور المتغيرات في قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVariantImages() {
  console.log('🔍 فحص صور المتغيرات في قاعدة البيانات\n');
  
  try {
    // فحص جميع المنتجات مع المتغيرات
    const products = await prisma.product.findMany({
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    console.log(`📦 إجمالي المنتجات: ${products.length}\n`);
    
    for (const product of products) {
      console.log(`📦 المنتج: ${product.name}`);
      console.log(`🆔 المعرف: ${product.id}`);
      
      // فحص صور المنتج العامة
      if (product.images) {
        try {
          const productImages = JSON.parse(product.images);
          console.log(`🖼️ صور المنتج العامة: ${productImages.length}`);
          productImages.forEach((url, idx) => {
            console.log(`   ${idx + 1}. ${url.substring(0, 60)}...`);
          });
        } catch (error) {
          console.log(`❌ خطأ في تحليل صور المنتج: ${error.message}`);
        }
      } else {
        console.log(`⚠️ لا توجد صور عامة للمنتج`);
      }
      
      // فحص المتغيرات
      if (product.variants && product.variants.length > 0) {
        console.log(`\n🎨 المتغيرات (${product.variants.length}):`);
        
        for (const variant of product.variants) {
          console.log(`\n   🎨 المتغير: ${variant.name}`);
          console.log(`      🆔 المعرف: ${variant.id}`);
          console.log(`      📝 النوع: ${variant.type}`);
          console.log(`      💰 السعر: ${variant.price || 'غير محدد'}`);
          console.log(`      📊 المخزون: ${variant.stock || 0}`);
          console.log(`      ✅ نشط: ${variant.isActive ? 'نعم' : 'لا'}`);
          
          // فحص صور المتغير
          if (variant.images) {
            try {
              const variantImages = JSON.parse(variant.images);
              if (Array.isArray(variantImages) && variantImages.length > 0) {
                console.log(`      🖼️ صور المتغير: ${variantImages.length}`);
                variantImages.forEach((url, imgIdx) => {
                  console.log(`         ${imgIdx + 1}. ${url.substring(0, 50)}...`);
                });
              } else {
                console.log(`      ⚠️ مصفوفة صور فارغة`);
              }
            } catch (error) {
              console.log(`      ❌ خطأ في تحليل صور المتغير: ${error.message}`);
              console.log(`      📄 البيانات الخام: ${variant.images}`);
            }
          } else {
            console.log(`      ❌ لا توجد صور للمتغير`);
          }
        }
      } else {
        console.log(`⚠️ لا توجد متغيرات`);
      }
      
      console.log(`${'─'.repeat(80)}\n`);
    }
    
    // اختبار البحث المحدد للبيج
    console.log(`\n🎯 اختبار البحث المحدد للبيج:`);
    
    const beigeProducts = await prisma.product.findMany({
      where: {
        variants: {
          some: {
            type: 'color',
            name: { in: ['بيج', 'beige', 'Beige'] },
            isActive: true
          }
        },
        isActive: true
      },
      include: {
        variants: {
          where: {
            type: 'color',
            name: { in: ['بيج', 'beige', 'Beige'] },
            isActive: true
          }
        }
      }
    });
    
    console.log(`📋 منتجات البيج الموجودة: ${beigeProducts.length}`);
    
    for (const product of beigeProducts) {
      console.log(`\n📦 منتج بيج: ${product.name}`);
      
      for (const variant of product.variants) {
        console.log(`   🎨 متغير: ${variant.name}`);
        
        if (variant.images) {
          try {
            const variantImages = JSON.parse(variant.images);
            console.log(`   🖼️ صور المتغير: ${variantImages.length}`);
            variantImages.forEach((url, idx) => {
              console.log(`      ${idx + 1}. ${url}`);
            });
          } catch (error) {
            console.log(`   ❌ خطأ في صور المتغير: ${error.message}`);
          }
        } else {
          console.log(`   ❌ لا توجد صور لمتغير البيج!`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkVariantImages().catch(console.error);
}

module.exports = checkVariantImages;
