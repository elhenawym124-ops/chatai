const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProductVariants() {
  console.log('🔍 فحص متغيرات المنتج "كوتشي اسكوتش"...\n');
  
  try {
    // البحث عن المنتج
    const product = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'كوتشي اسكوتش'
        }
      },
      include: {
        variants: true,
        category: true
      }
    });
    
    if (!product) {
      console.log('❌ لم يتم العثور على المنتج');
      return;
    }
    
    console.log('📦 معلومات المنتج الأساسية:');
    console.log('================================');
    console.log(`🏷️ الاسم: ${product.name}`);
    console.log(`🆔 المعرف: ${product.id}`);
    console.log(`💰 السعر: ${product.price}`);
    console.log(`📦 المخزون: ${product.stock}`);
    console.log(`📂 الفئة: ${product.category?.name || 'غير محدد'}`);
    console.log(`🖼️ الصور: ${product.images || 'لا توجد'}`);
    console.log(`📝 الوصف: ${product.description?.substring(0, 100)}...`);
    console.log(`✅ نشط: ${product.isActive ? 'نعم' : 'لا'}`);
    
    console.log('\n🎨 متغيرات المنتج في قاعدة البيانات:');
    console.log('=====================================');
    
    if (product.variants && product.variants.length > 0) {
      console.log(`📊 عدد المتغيرات: ${product.variants.length}`);
      
      product.variants.forEach((variant, index) => {
        console.log(`\n${index + 1}. متغير: ${variant.name}`);
        console.log(`   🆔 المعرف: ${variant.id}`);
        console.log(`   🏷️ النوع: ${variant.type}`);
        console.log(`   🏷️ SKU: ${variant.sku}`);
        console.log(`   💰 السعر: ${variant.price}`);
        console.log(`   💰 سعر المقارنة: ${variant.comparePrice || 'غير محدد'}`);
        console.log(`   💰 التكلفة: ${variant.cost || 'غير محدد'}`);
        console.log(`   📦 المخزون: ${variant.stock}`);
        console.log(`   🖼️ الصور: ${variant.images || 'لا توجد'}`);
        console.log(`   ✅ نشط: ${variant.isActive ? 'نعم' : 'لا'}`);
        console.log(`   📊 ترتيب العرض: ${variant.sortOrder}`);
        console.log(`   📅 تاريخ الإنشاء: ${variant.createdAt}`);
        console.log(`   📅 تاريخ التحديث: ${variant.updatedAt}`);
      });
    } else {
      console.log('❌ لا توجد متغيرات في قاعدة البيانات');
    }
    
    // فحص إضافي للمتغيرات
    console.log('\n🔍 فحص إضافي للمتغيرات:');
    console.log('==========================');
    
    const allVariants = await prisma.productVariant.findMany({
      where: {
        productId: product.id
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });
    
    console.log(`📊 إجمالي المتغيرات (استعلام منفصل): ${allVariants.length}`);
    
    if (allVariants.length > 0) {
      allVariants.forEach((variant, index) => {
        console.log(`   ${index + 1}. ${variant.name} (${variant.type}) - ${variant.price} ج.م`);
      });
    }
    
    // إحصائيات
    console.log('\n📊 إحصائيات المتغيرات:');
    console.log('======================');
    
    const activeVariants = allVariants.filter(v => v.isActive);
    const totalStock = allVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const avgPrice = allVariants.length > 0 ? 
      allVariants.reduce((sum, v) => sum + (v.price || 0), 0) / allVariants.length : 0;
    
    console.log(`✅ متغيرات نشطة: ${activeVariants.length} من ${allVariants.length}`);
    console.log(`📦 إجمالي المخزون: ${totalStock}`);
    console.log(`💰 متوسط السعر: ${avgPrice.toFixed(2)} ج.م`);
    
    // أنواع المتغيرات
    const variantTypes = [...new Set(allVariants.map(v => v.type))];
    console.log(`🎨 أنواع المتغيرات: ${variantTypes.join(', ')}`);

  } catch (error) {
    console.error('❌ خطأ في فحص المنتج:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductVariants();
