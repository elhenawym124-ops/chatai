const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');

async function testUnifiedSystem() {
  console.log('🔧 اختبار النظام الموحد الجديد...\n');

  try {
    // انتظار تهيئة النظام
    await ragService.ensureInitialized();
    
    console.log('='.repeat(80));
    console.log('🧪 اختبار النظام الموحد');
    console.log('='.repeat(80));
    
    const conversationId = 'test_unified_system';
    const senderId = 'test_customer_unified';
    
    // الاختبار 1: طلب صريح
    console.log('1️⃣ اختبار طلب صريح: "عايز اشوف كوتشي لمسه"');
    
    const test1Message = {
      conversationId,
      senderId,
      content: 'عايز اشوف كوتشي لمسه',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_unified',
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
    
    // فحص الرد النصي
    const hasCorrectText = test1Response.content && 
                          !test1Response.content.includes('غير متوفر') && 
                          !test1Response.content.includes('مش متاحة');
    console.log(`   📝 الرد النصي متسق: ${hasCorrectText ? 'نعم' : 'لا'}`);
    if (!hasCorrectText) {
      console.log(`   ⚠️ الرد: "${test1Response.content?.substring(0, 100)}..."`);
    }
    console.log('');
    
    // انتظار قليل
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // الاختبار 2: طلب منتج آخر مع سياق
    console.log('2️⃣ اختبار طلب منتج آخر: "ابعت ليا صورة الكوتشي التاني"');
    
    const test2Message = {
      conversationId,
      senderId,
      content: 'ابعت ليا صورة الكوتشي التاني',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_unified',
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
      
      // فحص إذا كان منتج مختلف
      const isDifferentProduct = test2Response.images[0].payload?.title?.includes('حريمي');
      console.log(`   🔄 منتج مختلف: ${isDifferentProduct ? 'نعم' : 'لا'}`);
    }
    
    // فحص الرد النصي
    const hasCorrectText2 = test2Response.content && 
                           !test2Response.content.includes('غير متوفر') && 
                           !test2Response.content.includes('مش متاحة');
    console.log(`   📝 الرد النصي متسق: ${hasCorrectText2 ? 'نعم' : 'لا'}`);
    if (!hasCorrectText2) {
      console.log(`   ⚠️ الرد: "${test2Response.content?.substring(0, 100)}..."`);
    }
    console.log('');
    
    // انتظار قليل
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // الاختبار 3: طلب لون محدد
    console.log('3️⃣ اختبار طلب لون محدد: "ابعت ليا صورة الابيض"');
    
    const test3Message = {
      conversationId,
      senderId,
      content: 'ابعت ليا صورة الابيض',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_unified',
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
      
      // فحص فلترة اللون
      const hasColorFilter = test3Response.images[0].payload?.title?.includes('اللون') ||
                             test3Response.images.length === 1;
      console.log(`   🎨 فلترة اللون: ${hasColorFilter ? 'نعم' : 'لا'}`);
    }
    
    // فحص الرد النصي
    const hasCorrectText3 = test3Response.content && 
                           !test3Response.content.includes('غير متوفر') && 
                           !test3Response.content.includes('مش متاحة');
    console.log(`   📝 الرد النصي متسق: ${hasCorrectText3 ? 'نعم' : 'لا'}`);
    console.log('');
    
    console.log('='.repeat(80));
    console.log('📊 تقييم النظام الموحد');
    console.log('='.repeat(80));
    
    const tests = [
      { 
        name: 'طلب صريح', 
        success: test1Response.success && test1Response.images?.length > 0,
        textConsistent: hasCorrectText
      },
      { 
        name: 'طلب منتج آخر', 
        success: test2Response.success && test2Response.images?.length > 0,
        textConsistent: hasCorrectText2
      },
      { 
        name: 'طلب لون محدد', 
        success: test3Response.success && test3Response.images?.length > 0,
        textConsistent: hasCorrectText3
      }
    ];
    
    let successCount = 0;
    let consistentCount = 0;
    
    tests.forEach((test, index) => {
      const status = test.success ? '✅ نجح' : '❌ فشل';
      const consistency = test.textConsistent ? '✅ متسق' : '❌ غير متسق';
      console.log(`${index + 1}. ${test.name}: ${status} | النص: ${consistency}`);
      
      if (test.success) successCount++;
      if (test.textConsistent) consistentCount++;
    });
    
    console.log(`\n🎯 معدل نجاح الوظائف: ${successCount}/${tests.length} (${(successCount/tests.length*100).toFixed(1)}%)`);
    console.log(`📝 معدل اتساق النصوص: ${consistentCount}/${tests.length} (${(consistentCount/tests.length*100).toFixed(1)}%)`);
    
    if (successCount === tests.length && consistentCount === tests.length) {
      console.log('\n🎉 النظام الموحد يعمل بشكل مثالي!');
      console.log('✅ جميع الوظائف تعمل');
      console.log('✅ جميع النصوص متسقة');
      console.log('🚀 النظام جاهز للإنتاج!');
    } else if (successCount === tests.length) {
      console.log('\n⚠️ الوظائف تعمل لكن النصوص تحتاج تحسين');
    } else {
      console.log('\n❌ النظام يحتاج مراجعة');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار النظام الموحد:', error);
  }
}

testUnifiedSystem();
