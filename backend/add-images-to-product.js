const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addImagesToProduct() {
  console.log('📸 Adding images to existing product...\n');
  
  try {
    // الحصول على المنتج الحالي
    const product = await prisma.product.findFirst();
    
    if (!product) {
      console.log('❌ No product found');
      return;
    }
    
    console.log(`📦 Found product: ${product.name}`);
    console.log(`💰 Price: ${product.price} ج.م`);
    console.log(`🖼️ Current images: ${product.images || 'None'}`);
    
    // صور جميلة للكوتشي الحريمي
    const productImages = [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&crop=center'
    ];
    
    // تحديث المنتج بالصور
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        images: JSON.stringify(productImages)
      }
    });
    
    console.log(`✅ Successfully added ${productImages.length} images to product`);
    console.log(`📸 Images:`, productImages);
    
    // تحديث RAG بالبيانات الجديدة
    console.log('\n🔄 Updating RAG with new product data...');
    
    // إعادة تحميل RAG
    const response = await fetch('http://localhost:3001/api/v1/ai/knowledge-base/update', {
      method: 'POST'
    });
    
    if (response.ok) {
      console.log('✅ RAG updated successfully');
    } else {
      console.log('⚠️ Failed to update RAG');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addImagesToProduct();
