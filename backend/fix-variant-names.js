const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixVariantNames() {
  console.log('🔧 إصلاح أسماء المتغيرات...\n');
  
  try {
    const product = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'كوتشي اسكوتش'
        }
      },
      include: {
        variants: true
      }
    });
    
    if (!product) {
      console.log('❌ المنتج غير موجود');
      return;
    }
    
    console.log(`📦 المنتج: ${product.name}`);
    console.log(`🎨 عدد المتغيرات: ${product.variants.length}`);
    
    // إصلاح أسماء المتغيرات
    const fixes = [
      {
        oldName: 'الابيض ',  // مع مسافة
        newName: 'أبيض',
        id: null
      },
      {
        oldName: 'بيج',
        newName: 'بيج', // يبقى كما هو
        id: null
      },
      {
        oldName: 'اسود',
        newName: 'أسود',
        id: null
      }
    ];
    
    console.log('\n🔍 المتغيرات الحالية:');
    product.variants.forEach((variant, index) => {
      console.log(`${index + 1}. "${variant.name}" (${variant.id})`);
      
      // البحث عن التطابق
      const fix = fixes.find(f => f.oldName.trim() === variant.name.trim());
      if (fix) {
        fix.id = variant.id;
      }
    });
    
    console.log('\n🔧 التحديثات المطلوبة:');
    for (const fix of fixes) {
      if (fix.id) {
        console.log(`📝 تحديث "${fix.oldName}" إلى "${fix.newName}"`);
        
        try {
          await prisma.productVariant.update({
            where: { id: fix.id },
            data: { name: fix.newName }
          });
          console.log(`✅ تم تحديث ${fix.newName}`);
        } catch (error) {
          console.error(`❌ خطأ في تحديث ${fix.newName}:`, error.message);
        }
      } else {
        console.log(`⚠️ لم يتم العثور على متغير "${fix.oldName}"`);
      }
    }
    
    // التحقق من النتائج
    console.log('\n📊 النتائج بعد التحديث:');
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    updatedProduct.variants.forEach((variant, index) => {
      console.log(`${index + 1}. "${variant.name}" - ${variant.price} ج.م (${variant.stock} قطعة)`);
    });
    
    console.log('\n✅ تم إصلاح أسماء المتغيرات!');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixVariantNames();
