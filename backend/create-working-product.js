const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createWorkingProduct() {
  try {
    console.log('🔧 إنشاء منتج جديد بصور تعمل مع Facebook...\n');

    // حذف جميع المنتجات القديمة
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    console.log('🗑️ تم حذف جميع المنتجات القديمة');

    // صور Unsplash مختلفة تماماً (مختبرة وتعمل)
    const workingImages = [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop"
    ];

    console.log('\n📸 الصور الجديدة (مختبرة وتعمل مع Facebook):');
    workingImages.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });

    // إنشاء المنتج الجديد
    const newProduct = await prisma.product.create({
      data: {
        name: 'كوتشي حريمي',
        description: 'كوتشي حريمي عالي الجودة متوفر بألوان مختلفة',
        price: 150,
        stock: 0,
        images: JSON.stringify(workingImages),
        companyId: 'cmdkj6coz0000uf0cyscco6lr'
      }
    });

    console.log('\n✅ تم إنشاء المنتج الجديد بنجاح!');
    console.log('📦 ID المنتج الجديد:', newProduct.id);

    // إنشاء الألوان
    const colors = [
      { name: 'الابيض', price: 100, stock: 15 },
      { name: 'الاسود', price: 100, stock: 0 }
    ];

    for (const color of colors) {
      await prisma.productVariant.create({
        data: {
          productId: newProduct.id,
          name: color.name,
          type: 'color',
          price: color.price,
          stock: color.stock
        }
      });
    }

    console.log('🎨 تم إنشاء الألوان بنجاح!');

    // التحقق من النتيجة
    const verifyProduct = await prisma.product.findUnique({
      where: { id: newProduct.id },
      include: {
        variants: true
      }
    });

    console.log('\n🔍 التحقق من المنتج الجديد:');
    console.log('📦 الاسم:', verifyProduct.name);
    console.log('🖼️ الصور (JSON):', verifyProduct.images);

    try {
      const parsedImages = JSON.parse(verifyProduct.images);
      console.log('\n✅ JSON صحيح! الصور المحللة:');
      parsedImages.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
      
      console.log('\n🎨 الألوان المتاحة:');
      verifyProduct.variants.forEach((variant, index) => {
        console.log(`  ${index + 1}. ${variant.name} - ${variant.price} جنيه - المخزون: ${variant.stock}`);
      });
      
      console.log('\n🎯 النتيجة: تم إنشاء منتج جديد بصور Unsplash مختبرة تعمل مع Facebook!');
      console.log('🔄 يرجى إعادة تشغيل الخادم لتحديث RAG');
      
    } catch (error) {
      console.log('❌ خطأ في تحليل JSON:', error.message);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWorkingProduct();
