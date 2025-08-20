const axios = require('axios');

async function createProductWithVariants() {
  console.log('🎨 إضافة متغيرات للمنتج الموجود...');

  try {
    // استخدام المنتج الموجود
    const productId = 'cmdd3xa7m000312c7m8a9um21';
    console.log('📦 استخدام المنتج الموجود:', productId);

    // 2. إنشاء المتغيرات
    const variants = [
      {
        name: 'أبيض',
        type: 'color',
        sku: 'NIKE-WHITE-001',
        price: 299.99,
        stock: 15,
        isActive: true,
        sortOrder: 0,
        metadata: { hexColor: '#FFFFFF', colorCode: 'WHITE' }
      },
      {
        name: 'أسود',
        type: 'color',
        sku: 'NIKE-BLACK-001',
        price: 319.99,
        stock: 10,
        isActive: true,
        sortOrder: 1,
        metadata: { hexColor: '#000000', colorCode: 'BLACK' }
      },
      {
        name: 'أحمر',
        type: 'color',
        sku: 'NIKE-RED-001',
        price: 329.99,
        stock: 5,
        isActive: true,
        sortOrder: 2,
        metadata: { hexColor: '#FF0000', colorCode: 'RED' }
      },
      {
        name: 'أزرق',
        type: 'color',
        sku: 'NIKE-BLUE-001',
        price: 309.99,
        stock: 8,
        isActive: true,
        sortOrder: 3,
        metadata: { hexColor: '#0000FF', colorCode: 'BLUE' }
      }
    ];

    console.log('🎨 إنشاء المتغيرات...');
    for (const variant of variants) {
      try {
        const variantResponse = await axios.post(
          `http://localhost:3001/api/v1/products/${productId}/variants`,
          variant,
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (variantResponse.data.success) {
          console.log(`✅ تم إنشاء متغير "${variant.name}" بنجاح`);
        } else {
          console.log(`❌ فشل في إنشاء متغير "${variant.name}": ${variantResponse.data.error}`);
        }
      } catch (variantError) {
        console.log(`❌ خطأ في إنشاء متغير "${variant.name}": ${variantError.message}`);
      }
    }

    // 3. جلب المنتج مع المتغيرات للتأكد
    console.log('🔍 جلب المنتج مع المتغيرات...');
    const getProductResponse = await axios.get(`http://localhost:3001/api/v1/products/${productId}`);
    
    if (getProductResponse.data.success) {
      const product = getProductResponse.data.data;
      console.log('📊 تفاصيل المنتج:');
      console.log('- الاسم:', product.name);
      console.log('- السعر الأساسي:', product.price, 'ريال');
      console.log('- عدد المتغيرات:', product.variants?.length || 0);
      
      if (product.variants && product.variants.length > 0) {
        console.log('🎨 المتغيرات:');
        product.variants.forEach((variant, index) => {
          console.log(`  ${index + 1}. ${variant.name} - ${variant.price} ريال - ${variant.stock} قطعة - SKU: ${variant.sku}`);
        });
      }
      
      console.log('\n🎉 تم إنشاء المنتج والمتغيرات بنجاح!');
      console.log('🔗 يمكنك الآن عرض المنتج على: http://localhost:3000/products/' + productId);
    }

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

createProductWithVariants();
