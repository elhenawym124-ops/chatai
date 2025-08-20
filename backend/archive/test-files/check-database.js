const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 فحص قاعدة البيانات...\n');
    
    // Check companies
    const companies = await prisma.company.findMany();
    console.log('📊 الشركات:');
    console.log(`عدد الشركات: ${companies.length}`);
    companies.forEach(company => {
      console.log(`- ${company.name} (${company.email})`);
    });
    
    // Check users
    const users = await prisma.user.findMany({
      include: {
        company: true
      }
    });
    console.log('\n👥 المستخدمين:');
    console.log(`عدد المستخدمين: ${users.length}`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.company?.name || 'بدون شركة'}`);
    });
    
    // Check categories
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    console.log('\n📂 الفئات:');
    console.log(`عدد الفئات: ${categories.length}`);
    categories.forEach(category => {
      console.log(`- ${category.name} (${category._count.products} منتج)`);
    });
    
    // Check products
    const products = await prisma.product.findMany({
      include: {
        category: true,
        company: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log('\n📦 المنتجات:');
    console.log(`عدد المنتجات: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ لا توجد منتجات في قاعدة البيانات');
    } else {
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   المعرف: ${product.id}`);
        console.log(`   السعر: ${product.price} ريال`);
        console.log(`   المخزون: ${product.stock} قطعة`);
        console.log(`   الشركة: ${product.company?.name || 'غير محدد'}`);
        console.log(`   الفئة: ${product.category?.name || 'غير محدد'}`);
        console.log(`   تاريخ الإنشاء: ${product.createdAt.toLocaleString('ar-SA')}`);
        console.log(`   نشط: ${product.isActive ? 'نعم' : 'لا'}`);
      });
    }
    
    console.log('\n✅ تم فحص قاعدة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error.message);
    console.error('تفاصيل الخطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
