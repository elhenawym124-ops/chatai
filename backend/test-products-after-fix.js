const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProductsAfterFix() {
  try {
    console.log('🔍 اختبار المنتجات بعد إصلاح الخطأ...');
    
    // اختبار البحث عن المنتجات مع whereClause
    const companyId = 'cme8zve740006ufbcre9qzue4';
    
    const whereClause = {
      companyId: companyId,
      isActive: true,
      stock: { gt: 0 }
    };
    
    console.log('🔍 whereClause:', JSON.stringify(whereClause, null, 2));
    
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        variants: {
          where: { isActive: true }
        }
      }
    });
    
    console.log('✅ عدد المنتجات الموجودة:', products.length);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - نشط: ${product.isActive}`);
      console.log(`   - المخزون: ${product.stock}`);
      console.log(`   - السعر: ${product.price}`);
      console.log(`   - عدد المتغيرات: ${product.variants.length}`);
      console.log('');
    });
    
    if (products.length === 0) {
      console.log('❌ لا توجد منتجات متاحة!');
      
      // فحص المنتجات بدون شروط
      const allProducts = await prisma.product.findMany({
        where: { companyId: companyId },
        select: {
          id: true,
          name: true,
          isActive: true,
          stock: true,
          price: true
        }
      });
      
      console.log('🔍 جميع المنتجات للشركة (بدون شروط):');
      allProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   - نشط: ${product.isActive}`);
        console.log(`   - المخزون: ${product.stock}`);
        console.log(`   - السعر: ${product.price}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductsAfterFix();
