const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentImages() {
  console.log('🔍 فحص الصور الحالية في قاعدة البيانات...\n');
  
  try {
    const product = await prisma.product.findFirst();
    
    if (product) {
      console.log('📦 المنتج:', product.name);
      console.log('🖼️ حقل الصور الخام:', product.images);
      console.log('📅 آخر تحديث:', product.updatedAt);
      
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          console.log('\n📸 الصور المحللة:');
          images.forEach((url, index) => {
            console.log(`  ${index + 1}. ${url}`);
            
            if (url.includes('easy-orders.net')) {
              console.log('    ❌ صورة قديمة من easy-orders.net');
            } else if (url.includes('unsplash.com')) {
              console.log('    ✅ صورة محدثة من unsplash.com');
            }
          });
          
          console.log('\n🔍 مقارنة مع الصور المرسلة في اللوج:');
          const logImages = [
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop'
          ];
          
          console.log('📊 الصور في قاعدة البيانات:', images.length);
          console.log('📊 الصور في اللوج:', logImages.length);
          
          const match = JSON.stringify(images.sort()) === JSON.stringify(logImages.sort());
          console.log('🔍 التطابق:', match ? '✅ متطابقة' : '❌ مختلفة');
          
          if (!match) {
            console.log('\n🚨 الاختلافات:');
            console.log('قاعدة البيانات:', images);
            console.log('اللوج:', logImages);
          }
          
        } catch (error) {
          console.log('❌ خطأ في تحليل JSON:', error.message);
        }
      }
    } else {
      console.log('❌ لا يوجد منتج');
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentImages();
