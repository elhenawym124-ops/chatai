const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixImagesJSON() {
  try {
    console.log('🔧 إصلاح JSON الصور...\n');

    // البحث عن المنتج
    const product = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'كوتشي'
        }
      }
    });

    if (!product) {
      console.log('❌ لم يتم العثور على المنتج');
      return;
    }

    console.log('📦 المنتج:', product.name);
    console.log('🖼️ الصور الحالية (معطوبة):', product.images);

    // الصور الثلاث الصحيحة
    const correctImages = [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop'
    ];

    console.log('\n📸 الصور الجديدة الصحيحة (3 صور):');
    correctImages.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });

    // تحديث المنتج بالصور الصحيحة
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        images: JSON.stringify(correctImages),
        updatedAt: new Date()
      }
    });

    console.log('\n✅ تم تحديث الصور بنجاح!');

    // التحقق من التحديث
    const verifyProduct = await prisma.product.findUnique({
      where: { id: product.id }
    });

    console.log('\n🔍 التحقق من التحديث:');
    console.log('🖼️ الصور بعد التحديث:', verifyProduct.images);

    try {
      const parsedImages = JSON.parse(verifyProduct.images);
      console.log('\n✅ JSON صحيح! الصور المحللة:');
      parsedImages.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
    } catch (error) {
      console.log('❌ خطأ في تحليل JSON:', error.message);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImagesJSON();
