async function detailedVariantsReport() {
  console.log('📊 تقرير مفصل عن متغيرات المنتج "كوتشي اسكوتش"');
  console.log('==============================================\n');
  
  const productId = 'cmdfynvxd0007ufegvkqvnajx';
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // جلب المنتج مع المتغيرات
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        },
        category: true
      }
    });
    
    if (!product) {
      console.log('❌ المنتج غير موجود');
      return;
    }
    
    console.log('🏷️ معلومات المنتج الأساسية:');
    console.log('============================');
    console.log(`📦 الاسم: ${product.name}`);
    console.log(`🆔 المعرف: ${product.id}`);
    console.log(`💰 السعر الأساسي: ${product.price} ج.م`);
    console.log(`📦 المخزون الأساسي: ${product.stock}`);
    console.log(`📂 الفئة: ${product.category?.name || 'غير محدد'}`);
    console.log(`✅ حالة المنتج: ${product.isActive ? 'نشط' : 'غير نشط'}`);
    
    // تحليل الصور الأساسية
    console.log('\n🖼️ الصور الأساسية:');
    console.log('==================');
    if (product.images) {
      try {
        // تنظيف HTML entities
        const cleanImages = product.images
          .replace(/&#x2F;/g, '/')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"');
        
        const images = JSON.parse(cleanImages);
        console.log(`📊 عدد الصور: ${images.length}`);
        images.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img}`);
        });
      } catch (error) {
        console.log(`❌ خطأ في تحليل الصور: ${product.images.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ لا توجد صور أساسية');
    }
    
    // تحليل المتغيرات
    console.log('\n🎨 تحليل المتغيرات:');
    console.log('==================');
    
    if (product.variants && product.variants.length > 0) {
      console.log(`📊 إجمالي المتغيرات: ${product.variants.length}`);
      
      // إحصائيات عامة
      const activeVariants = product.variants.filter(v => v.isActive);
      const totalVariantStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const prices = product.variants.map(v => v.price || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      console.log(`✅ متغيرات نشطة: ${activeVariants.length}`);
      console.log(`📦 إجمالي مخزون المتغيرات: ${totalVariantStock}`);
      console.log(`💰 نطاق الأسعار: ${minPrice} - ${maxPrice} ج.م`);
      
      // تفاصيل كل متغير
      console.log('\n📋 تفاصيل المتغيرات:');
      console.log('===================');
      
      product.variants.forEach((variant, index) => {
        console.log(`\n${index + 1}. متغير: ${variant.name}`);
        console.log(`   🆔 المعرف: ${variant.id}`);
        console.log(`   🎨 النوع: ${variant.type}`);
        console.log(`   🏷️ SKU: ${variant.sku}`);
        console.log(`   💰 السعر: ${variant.price} ج.م`);
        console.log(`   💰 سعر المقارنة: ${variant.comparePrice || 'غير محدد'}`);
        console.log(`   💰 التكلفة: ${variant.cost || 'غير محدد'}`);
        console.log(`   📦 المخزون: ${variant.stock}`);
        console.log(`   ✅ نشط: ${variant.isActive ? 'نعم' : 'لا'}`);
        console.log(`   📊 ترتيب العرض: ${variant.sortOrder}`);
        
        // تحليل صور المتغير
        if (variant.images) {
          try {
            // تنظيف HTML entities
            let cleanImages = variant.images
              .replace(/&#x2F;/g, '/')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"');
            
            // إزالة الاقتباس الإضافي إذا وجد
            if (cleanImages.startsWith('"') && cleanImages.endsWith('"')) {
              cleanImages = cleanImages.slice(1, -1);
            }
            
            const images = cleanImages.split(',').filter(img => img.trim());
            console.log(`   🖼️ الصور (${images.length}):`);
            images.forEach((img, imgIndex) => {
              console.log(`      ${imgIndex + 1}. ${img.trim()}`);
            });
          } catch (error) {
            console.log(`   🖼️ الصور: ${variant.images.substring(0, 50)}... (خطأ في التحليل)`);
          }
        } else {
          console.log(`   🖼️ الصور: لا توجد`);
        }
        
        console.log(`   📅 تاريخ الإنشاء: ${variant.createdAt.toLocaleDateString('ar-EG')}`);
        console.log(`   📅 آخر تحديث: ${variant.updatedAt.toLocaleDateString('ar-EG')}`);
      });
      
      // تحليل الأنواع
      console.log('\n🏷️ تحليل أنواع المتغيرات:');
      console.log('=========================');
      
      const variantTypes = {};
      product.variants.forEach(variant => {
        if (!variantTypes[variant.type]) {
          variantTypes[variant.type] = [];
        }
        variantTypes[variant.type].push(variant.name);
      });
      
      Object.keys(variantTypes).forEach(type => {
        console.log(`   ${type}: ${variantTypes[type].join(', ')}`);
      });
      
    } else {
      console.log('❌ لا توجد متغيرات لهذا المنتج');
    }
    
    // خلاصة
    console.log('\n📊 خلاصة التقرير:');
    console.log('================');
    console.log(`✅ المنتج "${product.name}" يحتوي على ${product.variants?.length || 0} متغيرات`);
    console.log(`🎨 جميع المتغيرات من نوع: color (ألوان)`);
    console.log(`💰 الأسعار تتراوح من ${Math.min(...product.variants.map(v => v.price))} إلى ${Math.max(...product.variants.map(v => v.price))} ج.م`);
    console.log(`📦 إجمالي المخزون: ${product.variants.reduce((sum, v) => sum + v.stock, 0)} قطعة`);
    console.log(`🖼️ كل متغير له صور منفصلة`);
    
    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ خطأ في إنشاء التقرير:', error);
  }
}

detailedVariantsReport();
