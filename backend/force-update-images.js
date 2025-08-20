const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function forceUpdateImages() {
  console.log('🔄 إجبار تحديث صور المنتج...\n');
  
  try {
    // الحصول على المنتج
    const product = await prisma.product.findFirst();
    
    if (!product) {
      console.log('❌ لا يوجد منتج');
      return;
    }
    
    console.log('📦 المنتج:', product.name);
    console.log('🖼️ الصور القديمة:', product.images);
    
    // الصور الجديدة من Unsplash (نفس الصور التي أرسلها النظام)
    const correctImages = [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop'
    ];
    
    // تحديث المنتج بالقوة
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        images: JSON.stringify(correctImages),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ تم تحديث الصور بنجاح!');
    console.log('📸 الصور الجديدة:');
    correctImages.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
    
    // التحقق من التحديث
    const verifyProduct = await prisma.product.findFirst();
    console.log('\n🔍 التحقق من التحديث:');
    console.log('🖼️ الصور المحدثة:', verifyProduct.images);
    
    // تحديث RAG
    console.log('\n🔄 تحديث RAG...');
    const response = await fetch('http://localhost:3001/api/v1/ai/knowledge-base/update', {
      method: 'POST'
    });
    
    if (response.ok) {
      console.log('✅ تم تحديث RAG بنجاح');
    } else {
      console.log('⚠️ فشل في تحديث RAG');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

forceUpdateImages();
