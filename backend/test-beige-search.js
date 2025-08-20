/**
 * 🎯 اختبار البحث المحدث للبيج
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBeigeSearch() {
  console.log('🎯 اختبار البحث المحدث للبيج\n');
  
  try {
    // محاكاة الكود الجديد
    const colorVariants = {
      'ابيض': ['أبيض', 'ابيض', 'الابيض', 'الأبيض', 'white', 'White'],
      'اسود': ['أسود', 'اسود', 'الاسود', 'الأسود', 'black', 'Black'],
      'احمر': ['أحمر', 'احمر', 'الاحمر', 'الأحمر', 'red', 'Red'],
      'ازرق': ['أزرق', 'ازرق', 'الازرق', 'الأزرق', 'blue', 'Blue'],
      'اخضر': ['أخضر', 'اخضر', 'الاخضر', 'الأخضر', 'green', 'Green'],
      'اصفر': ['أصفر', 'اصفر', 'الاصفر', 'الأصفر', 'yellow', 'Yellow'],
      'بني': ['بني', 'البني', 'brown', 'Brown'],
      'رمادي': ['رمادي', 'الرمادي', 'gray', 'grey', 'Gray', 'Grey'],
      'بيج': ['بيج', 'البيج', 'beige', 'Beige']
    };
    
    const requestedColor = 'بيج';
    const searchTerms = colorVariants[requestedColor] || [requestedColor];
    
    console.log(`🔍 البحث عن اللون: ${requestedColor}`);
    console.log(`📋 مصطلحات البحث: ${JSON.stringify(searchTerms)}`);
    
    // اختبار البحث الجديد
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerms[0] } },
          { name: { contains: searchTerms[1] } },
          { description: { contains: searchTerms[0] } },
          { description: { contains: searchTerms[1] } },
          // البحث في المتغيرات
          {
            variants: {
              some: {
                type: 'color',
                name: { in: searchTerms },
                isActive: true
              }
            }
          }
        ],
        isActive: true
      },
      include: {
        variants: {
          where: {
            type: 'color',
            name: { in: searchTerms },
            isActive: true
          }
        }
      },
      take: 3
    });
    
    console.log(`\n✅ منتجات موجودة: ${products.length}`);
    
    for (const product of products) {
      console.log(`\n📦 المنتج: ${product.name}`);
      console.log(`🎨 متغيرات مطابقة: ${product.variants.length}`);
      
      for (const variant of product.variants) {
        console.log(`   🎨 المتغير: ${variant.name}`);
        
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
          console.log(`   ❌ لا توجد صور للمتغير`);
        }
      }
    }
    
    // اختبار محاكاة الكود الكامل
    console.log(`\n🔄 محاكاة معالجة الصور:`);
    
    const colorImages = [];
    
    for (const product of products) {
      // فحص المتغيرات أولاً (أولوية للألوان المحددة)
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          if (variant.images) {
            try {
              const variantImages = JSON.parse(variant.images);
              if (Array.isArray(variantImages) && variantImages.length > 0) {
                variantImages.forEach((imageUrl) => {
                  colorImages.push({
                    type: 'image',
                    payload: {
                      url: imageUrl,
                      title: `${product.name} - اللون ${variant.name}`
                    }
                  });
                });
              }
            } catch (parseError) {
              console.log(`⚠️ [DB-COLOR-SEARCH] Failed to parse variant images for ${product.name}`);
            }
          }
        }
      }
      
      // إذا لم نجد صور في المتغيرات، فحص صور المنتج العامة
      if (colorImages.length === 0) {
        if (product.images) {
          try {
            const parsedImages = JSON.parse(product.images);
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
              parsedImages.forEach((imageUrl, index) => {
                colorImages.push({
                  type: 'image',
                  payload: {
                    url: imageUrl,
                    title: `${product.name} - اللون ${requestedColor}`
                  }
                });
              });
            }
          } catch (parseError) {
            console.log(`⚠️ [DB-COLOR-SEARCH] Failed to parse images for ${product.name}`);
          }
        }
      }
    }
    
    console.log(`\n📸 إجمالي الصور المعالجة: ${colorImages.length}`);
    
    colorImages.forEach((img, idx) => {
      console.log(`   ${idx + 1}. ${img.payload.title}`);
      console.log(`      URL: ${img.payload.url.substring(0, 60)}...`);
    });
    
    if (colorImages.length > 0) {
      console.log(`\n🎉 النتيجة: ممتاز! تم العثور على صور المتغير الصحيحة`);
    } else {
      console.log(`\n❌ النتيجة: لم يتم العثور على صور`);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testBeigeSearch().catch(console.error);
}

module.exports = testBeigeSearch;
