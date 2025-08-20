const { PrismaClient } = require('@prisma/client');

async function testCategory() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 اختبار إنشاء فئة جديدة...\n');
    
    const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib'; // شركة التواصل التجريبية
    
    // إنشاء فئة جديدة
    const newCategory = await prisma.category.create({
      data: {
        name: 'فئة اختبار من الكود',
        description: 'فئة تم إنشاؤها لاختبار الوظائف',
        companyId: companyId
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    console.log('✅ تم إنشاء الفئة بنجاح:');
    console.log(`   ID: ${newCategory.id}`);
    console.log(`   الاسم: ${newCategory.name}`);
    console.log(`   الوصف: ${newCategory.description}`);
    console.log(`   عدد المنتجات: ${newCategory._count.products}`);
    
    // عرض جميع الفئات
    console.log('\n📋 جميع الفئات بعد الإضافة:');
    const allCategories = await prisma.category.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat._count.products} منتج)`);
    });
    
    console.log(`\n📊 إجمالي الفئات: ${allCategories.length}`);
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategory();
