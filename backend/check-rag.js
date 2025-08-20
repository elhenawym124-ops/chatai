const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRAGStatus() {
  console.log('🔍 فحص حالة نظام RAG...\n');
  
  try {
    // فحص المنتجات في قاعدة البيانات
    const dbProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: { 
        id: true, 
        name: true, 
        price: true, 
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`🗄️ المنتجات في قاعدة البيانات: ${dbProducts.length}`);
    console.log('==========================================');
    
    dbProducts.forEach((product, index) => {
      const createdDate = product.createdAt.toISOString().split('T')[0];
      const updatedDate = product.updatedAt.toISOString().split('T')[0];
      
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   السعر: ${product.price} ج.م`);
      console.log(`   تاريخ الإنشاء: ${createdDate}`);
      console.log(`   تاريخ التحديث: ${updatedDate}`);
      
      // فحص إذا كان المنتج جديد (أقل من يوم)
      const isNew = (Date.now() - product.createdAt.getTime()) < (24 * 60 * 60 * 1000);
      const isRecentlyUpdated = (Date.now() - product.updatedAt.getTime()) < (24 * 60 * 60 * 1000);
      
      if (isNew) {
        console.log(`   🆕 منتج جديد!`);
      }
      if (isRecentlyUpdated && !isNew) {
        console.log(`   🔄 تم تحديثه مؤخراً!`);
      }
      console.log('');
    });
    
    // فحص آخر تحديث لـ RAG
    console.log('\n🧠 فحص حالة RAG:');
    console.log('==================');
    
    // محاولة الوصول لـ RAG service
    try {
      const ragService = require('./src/services/ragService');
      
      // انتظار قصير للتهيئة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`📊 عدد العناصر في RAG: ${ragService.knowledgeBase.size}`);
      
      let ragProductCount = 0;
      const ragProducts = [];
      
      for (const [key, item] of ragService.knowledgeBase.entries()) {
        if (item.type === 'product') {
          ragProductCount++;
          ragProducts.push({
            name: item.metadata.name,
            price: item.metadata.price
          });
        }
      }
      
      console.log(`📦 المنتجات في RAG: ${ragProductCount}`);
      
      if (ragProductCount > 0) {
        console.log('\nمنتجات RAG:');
        ragProducts.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} - ${product.price} ج.م`);
        });
      }
      
      // مقارنة
      console.log('\n📊 المقارنة:');
      console.log('=============');
      console.log(`قاعدة البيانات: ${dbProducts.length} منتج`);
      console.log(`RAG: ${ragProductCount} منتج`);
      
      if (ragProductCount !== dbProducts.length) {
        console.log('⚠️ عدم تطابق! RAG يحتاج إلى تحديث');
        
        // البحث عن المنتجات المفقودة
        const dbProductNames = dbProducts.map(p => p.name);
        const ragProductNames = ragProducts.map(p => p.name);
        
        const missingInRAG = dbProductNames.filter(name => !ragProductNames.includes(name));
        const extraInRAG = ragProductNames.filter(name => !dbProductNames.includes(name));
        
        if (missingInRAG.length > 0) {
          console.log('\n❌ منتجات مفقودة من RAG:');
          missingInRAG.forEach(name => console.log(`   - ${name}`));
        }
        
        if (extraInRAG.length > 0) {
          console.log('\n➕ منتجات زائدة في RAG:');
          extraInRAG.forEach(name => console.log(`   - ${name}`));
        }
        
        console.log('\n🔄 لتحديث RAG، استخدم:');
        console.log('curl -X POST http://localhost:3001/api/v1/ai/knowledge-base/update');
        
      } else {
        console.log('✅ RAG محدث ومتطابق مع قاعدة البيانات');
      }
      
    } catch (ragError) {
      console.log('❌ خطأ في الوصول لـ RAG service:', ragError.message);
      console.log('🔄 قد يحتاج الخادم إلى إعادة تشغيل');
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص RAG:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRAGStatus();
