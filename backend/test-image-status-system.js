const ragService = require('./src/services/ragService');
const { ImageHelper } = require('./src/services/ragService');

async function testImageStatusSystem() {
  console.log('🧪 اختبار نظام Image Status الجديد...\n');

  try {
    // انتظار تهيئة النظام
    await ragService.ensureInitialized();
    
    console.log('='.repeat(60));
    console.log('📊 1. اختبار ImageHelper Functions');
    console.log('='.repeat(60));
    
    // اختبار ImageHelper مع صور صحيحة
    const validImages = [
      'https://files.easy-orders.net/1723118623321827276.jpg',
      'https://files.easy-orders.net/1723118614817495098.jpg'
    ];
    
    const validResult = ImageHelper.getImageStatus(validImages);
    console.log('✅ اختبار صور صحيحة:');
    console.log(`   Status: ${validResult.status}`);
    console.log(`   Count: ${validResult.count}`);
    console.log(`   Has Images: ${validResult.hasImages}`);
    console.log(`   Valid Images: ${validResult.validImages.length}`);
    
    // اختبار ImageHelper مع صور فارغة
    const emptyResult = ImageHelper.getImageStatus([]);
    console.log('\n❌ اختبار صور فارغة:');
    console.log(`   Status: ${emptyResult.status}`);
    console.log(`   Count: ${emptyResult.count}`);
    console.log(`   Has Images: ${emptyResult.hasImages}`);
    
    // اختبار ImageHelper مع صور غير صحيحة
    const invalidImages = ['invalid-url', '', null, 'not-a-url'];
    const invalidResult = ImageHelper.getImageStatus(invalidImages);
    console.log('\n⚠️ اختبار صور غير صحيحة:');
    console.log(`   Status: ${invalidResult.status}`);
    console.log(`   Count: ${invalidResult.count}`);
    console.log(`   Has Images: ${invalidResult.hasImages}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('📦 2. اختبار RAG Knowledge Base');
    console.log('='.repeat(60));
    
    // إحصائيات النظام
    const stats = ragService.getStats();
    console.log('📊 إحصائيات قاعدة المعرفة:');
    console.log(`   📦 إجمالي العناصر: ${stats.total}`);
    console.log(`   📦 المنتجات: ${stats.byType.product || 0}`);
    console.log(`   ❓ الأسئلة الشائعة: ${stats.byType.faq || 0}`);
    console.log(`   📋 السياسات: ${stats.byType.policy || 0}`);
    
    // اختبار البحث عن المنتجات مع Image Status
    console.log('\n🔍 اختبار البحث مع Image Status:');
    const searchResults = await ragService.retrieveRelevantData('كوتشي', 'product_inquiry', 'test_customer');
    
    console.log(`📊 عدد النتائج: ${searchResults.length}`);
    
    searchResults.forEach((result, index) => {
      if (result.type === 'product' && result.metadata) {
        console.log(`\n📦 منتج ${index + 1}: ${result.metadata.name || 'غير محدد'}`);
        console.log(`   💰 السعر: ${result.metadata.price || 'غير محدد'} جنيه`);
        
        // اختبار البيانات الجديدة
        console.log(`   📸 Image Status: ${result.metadata.imageStatus || 'غير محدد'}`);
        console.log(`   📊 Image Count: ${result.metadata.imageCount || 0}`);
        console.log(`   ✅ Has Valid Images: ${result.metadata.hasValidImages || false}`);
        
        // مقارنة مع البيانات القديمة
        const oldImageCount = result.metadata.images?.length || 0;
        const newImageCount = result.metadata.imageCount || 0;
        
        if (oldImageCount === newImageCount) {
          console.log(`   ✅ تطابق عدد الصور: ${oldImageCount} = ${newImageCount}`);
        } else {
          console.log(`   ⚠️ عدم تطابق عدد الصور: ${oldImageCount} ≠ ${newImageCount}`);
        }
        
        // اختبار جودة الصور
        if (result.metadata.images) {
          const imageQuality = ImageHelper.getImageQualityInfo(result.metadata.images);
          console.log(`   🎯 جودة الصور: ${imageQuality.quality}`);
          console.log(`   📋 مكتملة: ${imageQuality.isComplete ? 'نعم' : 'لا'}`);
          console.log(`   📈 تحتاج المزيد: ${imageQuality.needsMore ? 'نعم' : 'لا'}`);
        }
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🧠 3. اختبار التوافق مع النظام القديم');
    console.log('='.repeat(60));
    
    // اختبار أن النظام الجديد لا يكسر الوظائف القديمة
    let compatibilityIssues = 0;
    
    searchResults.forEach((result, index) => {
      if (result.type === 'product' && result.metadata) {
        // فحص وجود الحقول القديمة
        if (!result.metadata.images) {
          console.log(`❌ منتج ${index + 1}: مفقود حقل images`);
          compatibilityIssues++;
        }
        
        if (!result.metadata.name) {
          console.log(`❌ منتج ${index + 1}: مفقود حقل name`);
          compatibilityIssues++;
        }
        
        if (!result.metadata.price) {
          console.log(`❌ منتج ${index + 1}: مفقود حقل price`);
          compatibilityIssues++;
        }
        
        // فحص وجود الحقول الجديدة
        if (result.metadata.imageStatus === undefined) {
          console.log(`⚠️ منتج ${index + 1}: مفقود حقل imageStatus الجديد`);
        }
        
        if (result.metadata.imageCount === undefined) {
          console.log(`⚠️ منتج ${index + 1}: مفقود حقل imageCount الجديد`);
        }
        
        if (result.metadata.hasValidImages === undefined) {
          console.log(`⚠️ منتج ${index + 1}: مفقود حقل hasValidImages الجديد`);
        }
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 4. نتائج الاختبار النهائية');
    console.log('='.repeat(60));
    
    console.log(`📊 إجمالي المنتجات المختبرة: ${searchResults.filter(r => r.type === 'product').length}`);
    console.log(`❌ مشاكل التوافق: ${compatibilityIssues}`);
    
    // تقييم النجاح
    const productCount = searchResults.filter(r => r.type === 'product').length;
    const hasImageStatus = searchResults.filter(r => r.type === 'product' && r.metadata?.imageStatus).length;
    const hasImageCount = searchResults.filter(r => r.type === 'product' && r.metadata?.imageCount !== undefined).length;
    const hasValidImages = searchResults.filter(r => r.type === 'product' && r.metadata?.hasValidImages !== undefined).length;
    
    console.log(`\n✅ المنتجات مع imageStatus: ${hasImageStatus}/${productCount}`);
    console.log(`✅ المنتجات مع imageCount: ${hasImageCount}/${productCount}`);
    console.log(`✅ المنتجات مع hasValidImages: ${hasValidImages}/${productCount}`);
    
    const successRate = ((hasImageStatus + hasImageCount + hasValidImages) / (productCount * 3)) * 100;
    
    console.log(`\n🎯 معدل نجاح النظام الجديد: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 90) {
      console.log('🎉 النظام يعمل بشكل ممتاز!');
    } else if (successRate >= 70) {
      console.log('✅ النظام يعمل بشكل جيد');
    } else {
      console.log('⚠️ النظام يحتاج تحسينات');
    }
    
    if (compatibilityIssues === 0) {
      console.log('✅ لا توجد مشاكل في التوافق مع النظام القديم');
    } else {
      console.log(`⚠️ ${compatibilityIssues} مشكلة في التوافق تحتاج إصلاح`);
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار النظام:', error);
  }
}

testImageStatusSystem();
