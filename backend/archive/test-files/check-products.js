const { PrismaClient } = require('@prisma/client');

async function checkProducts() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 فحص قاعدة البيانات...\n');

    // Get all companies
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true,
            categories: true
          }
        }
      }
    });
    
    console.log('📊 الشركات الموجودة:');
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name} (ID: ${company.id})`);
      console.log(`   عدد المنتجات: ${company._count.products}`);
      console.log(`   عدد الفئات: ${company._count.categories}`);
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Get products for "شركة التواصل التجريبية"
    const testCompany = companies.find(c => c.name.includes('التواصل') || c.name.includes('تجريبية'));
    
    if (testCompany) {
      console.log(`🏢 تفاصيل ${testCompany.name}:`);
      console.log(`📦 عدد المنتجات: ${testCompany._count.products}`);
      console.log(`🏷️ عدد الفئات: ${testCompany._count.categories}`);

      // Get categories first
      const categories = await prisma.category.findMany({
        where: {
          companyId: testCompany.id
        },
        include: {
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      console.log('\n🏷️ قائمة الفئات:');
      if (categories.length > 0) {
        categories.forEach((category, index) => {
          console.log(`${index + 1}. ${category.name} (ID: ${category.id})`);
          console.log(`   عدد المنتجات: ${category._count.products}`);
          console.log(`   الوصف: ${category.description || 'لا يوجد'}`);
        });
      } else {
        console.log('   لا توجد فئات');
      }

      // Get detailed products
      const products = await prisma.product.findMany({
        where: {
          companyId: testCompany.id
        },
        include: {
          category: true,
          variants: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log('\n📋 قائمة المنتجات:');
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   SKU: ${product.sku}`);
        console.log(`   السعر: ${product.price} جنيه`);
        console.log(`   الفئة: ${product.category?.name || 'غير محدد'}`);
        console.log(`   المخزون: ${product.stock}`);
        console.log(`   الحالة: ${product.isActive ? 'نشط' : 'غير نشط'}`);
        console.log(`   عدد المتغيرات: ${product.variants?.length || 0}`);
        console.log(`   الصور: ${product.images === '[]' ? 'لا توجد' : 'متوفرة'}`);
      });
      
      // Statistics
      const activeProducts = products.filter(p => p.isActive).length;
      const inactiveProducts = products.filter(p => !p.isActive).length;
      const totalVariants = products.reduce((sum, p) => sum + (p.variants?.length || 0), 0);
      const productsWithImages = products.filter(p => p.images && p.images !== '[]').length;
      
      console.log('\n📈 إحصائيات:');
      console.log(`   المنتجات النشطة: ${activeProducts}`);
      console.log(`   المنتجات غير النشطة: ${inactiveProducts}`);
      console.log(`   إجمالي المتغيرات: ${totalVariants}`);
      console.log(`   المنتجات بصور: ${productsWithImages}`);
      
    } else {
      console.log('❌ لم يتم العثور على شركة التواصل التجريبية');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاستعلام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
