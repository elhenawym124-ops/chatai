const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixVeryShortImages() {
  console.log('🔄 إصلاح بصور قصيرة جداً...\n');
  
  try {
    // حذف المنتج الحالي
    console.log('🗑️ حذف المنتج الحالي...');
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    
    // صور قصيرة جداً (3 صور)
    const veryShortImages = [
      'https://picsum.photos/400/400?random=1',
      'https://picsum.photos/400/400?random=2', 
      'https://picsum.photos/400/400?random=3'
    ];
    
    console.log('📸 الصور الجديدة (قصيرة جداً):');
    veryShortImages.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
    
    // الحصول على الشركة
    const company = await prisma.company.findFirst();
    if (!company) {
      console.log('❌ لا توجد شركة');
      return;
    }
    
    // إنشاء منتج جديد
    console.log('\n📦 إنشاء منتج جديد...');
    const newProduct = await prisma.product.create({
      data: {
        name: 'كوتشي حريمي',
        description: 'كوتشي حريمي عالي الجودة',
        price: 150,
        stock: 0,
        images: JSON.stringify(veryShortImages),
        companyId: company.id
      }
    });
    
    // إنشاء المتغيرات
    console.log('🎨 إنشاء متغيرات المنتج...');
    await prisma.productVariant.createMany({
      data: [
        {
          productId: newProduct.id,
          name: 'الابيض',
          type: 'color',
          price: 100,
          stock: 15
        },
        {
          productId: newProduct.id,
          name: 'الاسود',
          type: 'color',
          price: 100,
          stock: 0
        }
      ]
    });
    
    console.log('✅ تم إنشاء المنتج بنجاح!');
    
    // التحقق من النتيجة
    const verifyProduct = await prisma.product.findFirst({
      include: {
        variants: true
      }
    });
    
    console.log('\n🔍 التحقق من النتيجة:');
    console.log('📦 اسم المنتج:', verifyProduct.name);
    console.log('💰 السعر:', verifyProduct.price, 'ج.م');
    console.log('🖼️ الصور:', verifyProduct.images);
    console.log('🎨 المتغيرات:', verifyProduct.variants.length);
    
    // تحليل JSON
    try {
      const parsedImages = JSON.parse(verifyProduct.images);
      console.log('\n📊 تحليل الصور:');
      console.log('عدد الصور:', parsedImages.length);
      parsedImages.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
      console.log('✅ JSON صحيح!');
    } catch (error) {
      console.log('❌ خطأ في تحليل JSON:', error.message);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixVeryShortImages();
