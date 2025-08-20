const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRealVariants() {
  console.log('🔍 فحص الألوان الحقيقية في قاعدة البيانات...\n');
  
  try {
    const product = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'كوتشي اسكوتش'
        }
      },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    if (!product) {
      console.log('❌ المنتج غير موجود');
      return;
    }
    
    console.log(`📦 المنتج: ${product.name}`);
    console.log(`🆔 المعرف: ${product.id}`);
    
    if (product.variants && product.variants.length > 0) {
      console.log(`\n🎨 المتغيرات الحقيقية (${product.variants.length}):`);
      
      product.variants.forEach((variant, index) => {
        console.log(`\n${index + 1}. الاسم الحقيقي: "${variant.name}"`);
        console.log(`   🎨 النوع: ${variant.type}`);
        console.log(`   💰 السعر: ${variant.price}`);
        console.log(`   📦 المخزون: ${variant.stock}`);
        console.log(`   🆔 المعرف: ${variant.id}`);
        console.log(`   🏷️ SKU: ${variant.sku}`);
        console.log(`   ✅ نشط: ${variant.isActive}`);
        
        // فحص الاسم بالتفصيل
        console.log(`   📝 الاسم (hex): ${Buffer.from(variant.name, 'utf8').toString('hex')}`);
        console.log(`   📝 الاسم (length): ${variant.name.length} حرف`);
      });
      
      // مقارنة مع ما يظهر في RAG
      console.log('\n🧠 مقارنة مع RAG:');
      console.log('==================');
      
      const ragService = require('./src/services/ragService');
      await ragService.initializeKnowledgeBase();
      
      const results = await ragService.retrieveRelevantData(
        'كوتشي اسكوتش ألوان',
        'product_inquiry',
        'test'
      );
      
      if (results && results.length > 0) {
        console.log('📄 محتوى RAG:');
        console.log(results[0].content);
        
        if (results[0].metadata && results[0].metadata.variants) {
          console.log('\n🎨 متغيرات RAG:');
          results[0].metadata.variants.forEach((variant, index) => {
            console.log(`   ${index + 1}. "${variant.name}" - ${variant.price} ج.م`);
          });
        }
      }
      
    } else {
      console.log('\n❌ لا توجد متغيرات');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRealVariants();
