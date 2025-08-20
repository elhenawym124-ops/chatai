const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRealImages() {
  try {
    console.log('📸 اختبار الصور الحقيقية...\n');
    
    // 1. فحص المنتج في قاعدة البيانات
    console.log('1️⃣ فحص المنتج في قاعدة البيانات:');
    console.log('='.repeat(50));
    
    const products = await prisma.product.findMany({
      include: {
        variants: true
      }
    });
    
    console.log(`عدد المنتجات: ${products.length}`);
    
    products.forEach((product, index) => {
      console.log(`\nمنتج ${index + 1}:`);
      console.log('ID:', product.id);
      console.log('الاسم:', product.name);
      console.log('الصور (JSON):', product.images);
      console.log('رابط الصورة:', product.imageUrl);
      
      if (product.variants && product.variants.length > 0) {
        console.log('المتغيرات:');
        product.variants.forEach((variant, vIndex) => {
          console.log(`  ${vIndex + 1}. ${variant.color}: ${variant.imageUrl || 'لا توجد صورة'}`);
        });
      }
    });
    
    // 2. فحص RAG
    console.log('\n2️⃣ فحص RAG:');
    console.log('='.repeat(50));
    
    await ragService.ensureInitialized();
    
    const ragResults = await ragService.retrieveRelevantData('عايز أشوف صور الكوتشي', 'product_inquiry');
    
    console.log(`عدد نتائج RAG: ${ragResults.length}`);
    
    ragResults.forEach((item, index) => {
      console.log(`\nنتيجة RAG ${index + 1}:`);
      console.log('النوع:', item.type);
      console.log('المحتوى:', item.content.substring(0, 100) + '...');
      console.log('البيانات الوصفية:', JSON.stringify(item.metadata, null, 2));
    });
    
    // 3. اختبار استخراج الصور
    console.log('\n3️⃣ اختبار استخراج الصور:');
    console.log('='.repeat(50));
    
    const testData = {
      conversationId: 'test-real-images',
      senderId: 'test-user-real-images',
      content: 'عايز أشوف صور الكوتشي',
      customerData: {
        id: 'test-user-real-images',
        name: 'مختبر الصور الحقيقية',
        phone: '01234567890',
        orderCount: 0
      }
    };
    
    const response = await aiAgentService.processCustomerMessage(testData);
    
    console.log('نجح المعالجة:', response.success);
    console.log('عدد الصور:', response.images ? response.images.length : 0);
    
    if (response.images && response.images.length > 0) {
      console.log('\n📸 الصور المستخرجة:');
      response.images.forEach((image, index) => {
        console.log(`صورة ${index + 1}:`);
        console.log('  الرابط:', image.payload.url);
        console.log('  العنوان:', image.payload.title);
        console.log('  نوع الرابط:', image.payload.url.includes('unsplash') ? 'Unsplash (افتراضي)' : 
                     image.payload.url.includes('placeholder') ? 'Placeholder (قديم)' : 'حقيقي');
      });
    }
    
    console.log('\nالرد:', response.content);
    
  } catch (error) {
    console.error('❌ خطأ في اختبار الصور الحقيقية:', error.message);
    console.error('التفاصيل:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testRealImages();
