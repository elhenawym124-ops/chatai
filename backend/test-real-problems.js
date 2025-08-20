const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');

async function testRealProblems() {
  console.log('🔍 اختبار المشاكل الحقيقية...\n');

  try {
    // انتظار تهيئة النظام
    await ragService.ensureInitialized();
    
    console.log('='.repeat(80));
    console.log('🧪 اختبار المشاكل الحقيقية');
    console.log('='.repeat(80));
    
    const conversationId = 'test_real_problems';
    const senderId = 'test_customer_real';
    
    // الاختبار 1: طلب صريح (يجب أن يعمل)
    console.log('1️⃣ اختبار طلب صريح: "عايز اشوف كوتشي لمسه"');
    
    const test1Message = {
      conversationId,
      senderId,
      content: 'عايز اشوف كوتشي لمسه',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_real',
        name: 'Test Customer',
        phone: '',
        email: 'test@example.com',
        orderCount: 0
      }
    };
    
    const test1Response = await aiAgentService.processCustomerMessage(test1Message);
    console.log(`   ✅ AI استجاب: ${test1Response.success ? 'نعم' : 'لا'}`);
    console.log(`   📸 عدد الصور: ${test1Response.images?.length || 0}`);
    if (test1Response.images && test1Response.images.length > 0) {
      console.log(`   🎯 المنتج: ${test1Response.images[0].payload?.title}`);
    }
    console.log('');
    
    // انتظار قليل لحفظ الذاكرة
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // الاختبار 2: طلب غامض مع سياق (المشكلة الحقيقية)
    console.log('2️⃣ اختبار طلب غامض: "ابعت ليا صورة الابيض"');
    
    const test2Message = {
      conversationId,
      senderId,
      content: 'ابعت ليا صورة الابيض',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_real',
        name: 'Test Customer',
        phone: '',
        email: 'test@example.com',
        orderCount: 0
      }
    };
    
    const test2Response = await aiAgentService.processCustomerMessage(test2Message);
    console.log(`   ✅ AI استجاب: ${test2Response.success ? 'نعم' : 'لا'}`);
    console.log(`   📸 عدد الصور: ${test2Response.images?.length || 0}`);
    if (test2Response.images && test2Response.images.length > 0) {
      console.log(`   🎯 المنتج: ${test2Response.images[0].payload?.title}`);
      
      // فحص إذا كان نفس المنتج من الطلب الأول
      const sameProduct = test2Response.images[0].payload?.title?.includes('لمسة');
      console.log(`   🧠 نفس المنتج من السياق: ${sameProduct ? 'نعم' : 'لا'}`);
      
      // فحص فلترة اللون
      const colorFiltered = test2Response.images.length === 1;
      console.log(`   🎨 تم فلترة اللون: ${colorFiltered ? 'نعم' : 'لا'}`);
    }
    console.log('');
    
    // انتظار قليل
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // الاختبار 3: طلب منتج آخر (المشكلة الأساسية)
    console.log('3️⃣ اختبار طلب منتج آخر: "ابعت ليا صورة الكوتشي التاني"');
    
    const test3Message = {
      conversationId,
      senderId,
      content: 'ابعت ليا صورة الكوتشي التاني',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_real',
        name: 'Test Customer',
        phone: '',
        email: 'test@example.com',
        orderCount: 0
      }
    };
    
    const test3Response = await aiAgentService.processCustomerMessage(test3Message);
    console.log(`   ✅ AI استجاب: ${test3Response.success ? 'نعم' : 'لا'}`);
    console.log(`   📸 عدد الصور: ${test3Response.images?.length || 0}`);
    if (test3Response.images && test3Response.images.length > 0) {
      console.log(`   🎯 المنتج: ${test3Response.images[0].payload?.title}`);
      
      // فحص إذا كان منتج مختلف
      const differentProduct = test3Response.images[0].payload?.title?.includes('حريمي');
      console.log(`   🔄 منتج مختلف: ${differentProduct ? 'نعم' : 'لا'}`);
    }
    console.log('');
    
    console.log('='.repeat(80));
    console.log('📊 تحليل النتائج');
    console.log('='.repeat(80));
    
    const test1Success = test1Response.success && test1Response.images?.length > 0;
    const test2Success = test2Response.success && test2Response.images?.length > 0 && 
                        test2Response.images[0].payload?.title?.includes('لمسة');
    const test3Success = test3Response.success && test3Response.images?.length > 0 && 
                        test3Response.images[0].payload?.title?.includes('حريمي');
    
    console.log(`1️⃣ طلب صريح: ${test1Success ? '✅ نجح' : '❌ فشل'}`);
    console.log(`2️⃣ طلب غامض مع سياق: ${test2Success ? '✅ نجح' : '❌ فشل'}`);
    console.log(`3️⃣ طلب منتج آخر: ${test3Success ? '✅ نجح' : '❌ فشل'}`);
    
    const successCount = [test1Success, test2Success, test3Success].filter(Boolean).length;
    console.log(`\n🎯 معدل النجاح: ${successCount}/3 (${(successCount/3*100).toFixed(1)}%)`);
    
    if (successCount === 3) {
      console.log('🎉 جميع المشاكل تم حلها!');
    } else {
      console.log('⚠️ لا تزال هناك مشاكل تحتاج حل:');
      if (!test1Success) console.log('   - الطلب الصريح لا يعمل');
      if (!test2Success) console.log('   - فهم السياق لا يعمل');
      if (!test3Success) console.log('   - فهم "التاني" لا يعمل');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار المشاكل الحقيقية:', error);
  }
}

testRealProblems();
