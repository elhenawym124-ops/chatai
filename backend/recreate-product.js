const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function recreateProduct() {
  console.log('🔄 إعادة إنشاء المنتج بالصور الصحيحة...\n');
  
  try {
    // حذف المنتج الحالي
    console.log('🗑️ حذف المنتج الحالي...');
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    
    // الصور الثلاث الصحيحة
    const correctImages = [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&crop=center'
    ];
    
    console.log('📸 الصور الجديدة:');
    correctImages.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
    
    // الحصول على الشركة الأولى
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
        images: JSON.stringify(correctImages),
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
    } catch (error) {
      console.log('❌ خطأ في تحليل JSON:', error.message);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

recreateProduct();
