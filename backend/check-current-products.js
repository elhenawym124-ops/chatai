const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCurrentProducts() {
  console.log('🔍 فحص المنتجات الحالية في قاعدة البيانات...\n');
  
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { 
        id: true, 
        name: true, 
        price: true, 
        createdAt: true,
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            type: true,
            sku: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 عدد المنتجات النشطة: ${products.length}`);
    console.log('==========================================\n');
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.price} ج.م`);
      console.log(`   ID: ${product.id}`);
      console.log(`   تاريخ الإنشاء: ${product.createdAt.toISOString().split('T')[0]}`);
      
      if (product.variants && product.variants.length > 0) {
        console.log(`   المتغيرات (${product.variants.length}):`);
        product.variants.forEach((variant, vIndex) => {
          console.log(`     ${vIndex + 1}. ${variant.name} - ${variant.price} ج.م (${variant.type || 'بدون نوع'}, ${variant.sku || 'بدون SKU'})`);
        });
      } else {
        console.log(`   ⚠️ لا توجد متغيرات`);
      }
      console.log('');
    });
    
    // فحص المنتجات المحذوفة أو غير النشطة
    const inactiveProducts = await prisma.product.findMany({
      where: { isActive: false },
      select: { 
        id: true, 
        name: true, 
        price: true, 
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (inactiveProducts.length > 0) {
      console.log(`\n🚫 المنتجات غير النشطة (${inactiveProducts.length}):`);
      console.log('==========================================');
      inactiveProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ${product.price} ج.م (غير نشط)`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص المنتجات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentProducts();
