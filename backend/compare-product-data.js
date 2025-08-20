async function compareProductData() {
  console.log('🔍 مقارنة بيانات المنتج بين قاعدة البيانات والـ API...\n');
  
  const productId = 'cmdfynvxd0007ufegvkqvnajx';
  
  try {
    // 1. البيانات من API
    console.log('🌐 1. البيانات من API:');
    console.log('===================');
    
    const apiResponse = await fetch(`http://localhost:3001/api/v1/products/${productId}`);
    const apiData = await apiResponse.json();
    
    if (apiData.success) {
      const product = apiData.data;
      console.log(`📦 اسم المنتج: ${product.name}`);
      console.log(`💰 السعر: ${product.price}`);
      console.log(`📦 المخزون: ${product.stock}`);
      console.log(`📂 الفئة: ${product.category?.name || 'غير محدد'}`);
      console.log(`🖼️ الصور: ${product.images ? product.images.substring(0, 100) + '...' : 'لا توجد'}`);
      
      if (product.variants && product.variants.length > 0) {
        console.log(`\n🎨 المتغيرات من API (${product.variants.length}):`);
        product.variants.forEach((variant, index) => {
          console.log(`   ${index + 1}. ${variant.name} (${variant.type})`);
          console.log(`      💰 السعر: ${variant.price}`);
          console.log(`      📦 المخزون: ${variant.stock}`);
          console.log(`      🖼️ الصور: ${variant.images ? variant.images.substring(0, 50) + '...' : 'لا توجد'}`);
          console.log(`      ✅ نشط: ${variant.isActive ? 'نعم' : 'لا'}`);
        });
      } else {
        console.log('\n❌ لا توجد متغيرات في API');
      }
    } else {
      console.log('❌ فشل في جلب البيانات من API');
    }
    
    // 2. البيانات من قاعدة البيانات مباشرة
    console.log('\n🗄️ 2. البيانات من قاعدة البيانات:');
    console.log('===============================');
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const dbProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        },
        category: true
      }
    });
    
    if (dbProduct) {
      console.log(`📦 اسم المنتج: ${dbProduct.name}`);
      console.log(`💰 السعر: ${dbProduct.price}`);
      console.log(`📦 المخزون: ${dbProduct.stock}`);
      console.log(`📂 الفئة: ${dbProduct.category?.name || 'غير محدد'}`);
      console.log(`🖼️ الصور: ${dbProduct.images ? dbProduct.images.substring(0, 100) + '...' : 'لا توجد'}`);
      
      if (dbProduct.variants && dbProduct.variants.length > 0) {
        console.log(`\n🎨 المتغيرات من قاعدة البيانات (${dbProduct.variants.length}):`);
        dbProduct.variants.forEach((variant, index) => {
          console.log(`   ${index + 1}. ${variant.name} (${variant.type})`);
          console.log(`      💰 السعر: ${variant.price}`);
          console.log(`      📦 المخزون: ${variant.stock}`);
          console.log(`      🖼️ الصور: ${variant.images ? variant.images.substring(0, 50) + '...' : 'لا توجد'}`);
          console.log(`      ✅ نشط: ${variant.isActive ? 'نعم' : 'لا'}`);
        });
      } else {
        console.log('\n❌ لا توجد متغيرات في قاعدة البيانات');
      }
    }
    
    // 3. المقارنة
    console.log('\n⚖️ 3. المقارنة:');
    console.log('==============');
    
    if (apiData.success && dbProduct) {
      const apiProduct = apiData.data;
      
      // مقارنة البيانات الأساسية
      console.log('📊 البيانات الأساسية:');
      console.log(`   الاسم: ${apiProduct.name === dbProduct.name ? '✅ متطابق' : '❌ مختلف'}`);
      console.log(`   السعر: ${apiProduct.price === dbProduct.price ? '✅ متطابق' : '❌ مختلف'}`);
      console.log(`   المخزون: ${apiProduct.stock === dbProduct.stock ? '✅ متطابق' : '❌ مختلف'}`);
      
      // مقارنة المتغيرات
      const apiVariantsCount = apiProduct.variants?.length || 0;
      const dbVariantsCount = dbProduct.variants?.length || 0;
      
      console.log(`\n🎨 المتغيرات:`);
      console.log(`   العدد: API=${apiVariantsCount}, DB=${dbVariantsCount} ${apiVariantsCount === dbVariantsCount ? '✅' : '❌'}`);
      
      if (apiVariantsCount > 0 && dbVariantsCount > 0) {
        console.log(`\n📋 تفاصيل المتغيرات:`);
        for (let i = 0; i < Math.max(apiVariantsCount, dbVariantsCount); i++) {
          const apiVariant = apiProduct.variants?.[i];
          const dbVariant = dbProduct.variants?.[i];
          
          if (apiVariant && dbVariant) {
            console.log(`   ${i + 1}. ${apiVariant.name}:`);
            console.log(`      الاسم: ${apiVariant.name === dbVariant.name ? '✅' : '❌'}`);
            console.log(`      السعر: ${apiVariant.price === dbVariant.price ? '✅' : '❌'}`);
            console.log(`      المخزون: ${apiVariant.stock === dbVariant.stock ? '✅' : '❌'}`);
          } else if (apiVariant) {
            console.log(`   ${i + 1}. ${apiVariant.name}: ❌ موجود في API فقط`);
          } else if (dbVariant) {
            console.log(`   ${i + 1}. ${dbVariant.name}: ❌ موجود في قاعدة البيانات فقط`);
          }
        }
      }
    }
    
    await prisma.$disconnect();
    
    console.log('\n🎉 انتهت المقارنة!');

  } catch (error) {
    console.error('❌ خطأ في المقارنة:', error);
  }
}

compareProductData();
