const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fix3Images() {
  console.log('🔄 إصلاح الصور الثلاث...\n');
  
  try {
    const product = await prisma.product.findFirst();
    
    if (!product) {
      console.log('❌ لا يوجد منتج');
      return;
    }
    
    console.log('📦 المنتج:', product.name);
    console.log('🖼️ الصور الحالية (معطوبة):', product.images);
    
    // الصور الثلاث الصحيحة
    const correctImages = [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&crop=center'
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
    const verifyProduct = await prisma.product.findFirst();
    console.log('\n🔍 التحقق من التحديث:');
    console.log('🖼️ الصور بعد التحديث:', verifyProduct.images);
    
    // تحليل JSON للتأكد
    try {
      const parsedImages = JSON.parse(verifyProduct.images);
      console.log('\n📊 تحليل JSON:');
      console.log('عدد الصور:', parsedImages.length);
      parsedImages.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
    } catch (error) {
      console.log('❌ خطأ في تحليل JSON:', error.message);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fix3Images();
