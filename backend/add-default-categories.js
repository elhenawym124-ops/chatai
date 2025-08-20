const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDefaultCategories() {
  console.log('📂 إضافة فئات افتراضية...');
  
  try {
    // الحصول على الشركة الأولى
    const firstCompany = await prisma.company.findFirst();
    if (!firstCompany) {
      console.log('❌ لا توجد شركة في قاعدة البيانات');
      return;
    }
    
    console.log(`🏢 الشركة: ${firstCompany.name} (${firstCompany.id})`);
    
    // فئات افتراضية
    const defaultCategories = [
      {
        name: 'أحذية',
        description: 'جميع أنواع الأحذية',
        companyId: firstCompany.id
      },
      {
        name: 'ملابس',
        description: 'الملابس والأزياء',
        companyId: firstCompany.id
      },
      {
        name: 'إكسسوارات',
        description: 'الإكسسوارات والمجوهرات',
        companyId: firstCompany.id
      },
      {
        name: 'حقائب',
        description: 'الحقائب والمحافظ',
        companyId: firstCompany.id
      },
      {
        name: 'إلكترونيات',
        description: 'الأجهزة الإلكترونية',
        companyId: firstCompany.id
      }
    ];
    
    // إضافة الفئات
    for (const category of defaultCategories) {
      try {
        const existingCategory = await prisma.category.findFirst({
          where: {
            name: category.name,
            companyId: firstCompany.id
          }
        });
        
        if (existingCategory) {
          console.log(`⚠️ الفئة موجودة بالفعل: ${category.name}`);
        } else {
          const newCategory = await prisma.category.create({
            data: category
          });
          console.log(`✅ تم إضافة الفئة: ${newCategory.name} (${newCategory.id})`);
        }
      } catch (error) {
        console.error(`❌ خطأ في إضافة الفئة ${category.name}:`, error.message);
      }
    }
    
    // عرض جميع الفئات
    console.log('\n📋 جميع الفئات الموجودة:');
    const allCategories = await prisma.category.findMany({
      where: { companyId: firstCompany.id },
      orderBy: { name: 'asc' }
    });
    
    allCategories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category.name} - ${category.description}`);
    });
    
    console.log(`\n✅ إجمالي الفئات: ${allCategories.length}`);

  } catch (error) {
    console.error('❌ خطأ في إضافة الفئات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDefaultCategories();
