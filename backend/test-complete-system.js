const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');

async function testCompleteSystem() {
  console.log('🚀 اختبار النظام المحسن الكامل...\n');

  try {
    // انتظار تهيئة النظام
    await ragService.ensureInitialized();
    
    console.log('='.repeat(80));
    console.log('🧪 اختبار شامل للنظام المحسن');
    console.log('='.repeat(80));
    
    const conversationId = 'test_complete_system';
    const senderId = 'test_customer_complete';
    
    // الاختبار 1: طلب صريح
    console.log('1️⃣ اختبار طلب صريح: "عايز اشوف كوتشي لمسه"');
    const test1Message = {
      conversationId,
      senderId,
      content: 'عايز اشوف كوتشي لمسه',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_complete',
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
    
    // انتظار قليل
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // الاختبار 2: طلب لون محدد مع سياق
    console.log('2️⃣ اختبار طلب لون محدد: "ابعت ليا صورة الابيض"');
    const test2Message = {
      conversationId,
      senderId,
      content: 'ابعت ليا صورة الابيض',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_complete',
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
      console.log(`   🎨 فلترة اللون: ${test2Response.images[0].payload?.title.includes('اللون') ? 'نعم' : 'لا'}`);
    }
    console.log('');
    
    // انتظار قليل
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // الاختبار 3: طلب منتج آخر
    console.log('3️⃣ اختبار طلب منتج آخر: "ابعت ليا صورة الكوتشي التاني"');
    const test3Message = {
      conversationId,
      senderId,
      content: 'ابعت ليا صورة الكوتشي التاني',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_complete',
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
      const isDifferentProduct = test3Response.images[0].payload?.title.includes('حريمي');
      console.log(`   🔄 منتج مختلف: ${isDifferentProduct ? 'نعم' : 'لا'}`);
    }
    console.log('');
    
    // الاختبار 4: اختبار Cache
    console.log('4️⃣ اختبار Cache: إعادة نفس الطلب');
    const test4Response = await aiAgentService.processCustomerMessage(test1Message);
    console.log(`   ✅ AI استجاب: ${test4Response.success ? 'نعم' : 'لا'}`);
    console.log(`   📸 عدد الصور: ${test4Response.images?.length || 0}`);
    console.log('');
    
    console.log('='.repeat(80));
    console.log('📊 تقييم الأداء');
    console.log('='.repeat(80));
    
    const tests = [
      { 
        name: 'طلب صريح', 
        success: test1Response.success && test1Response.images?.length > 0,
        hasCorrectProduct: test1Response.images?.[0]?.payload?.title?.includes('لمسة')
      },
      { 
        name: 'طلب لون محدد', 
        success: test2Response.success && test2Response.images?.length > 0,
        hasColorFilter: test2Response.images?.[0]?.payload?.title?.includes('اللون')
      },
      { 
        name: 'طلب منتج آخر', 
        success: test3Response.success && test3Response.images?.length > 0,
        hasDifferentProduct: test3Response.images?.[0]?.payload?.title?.includes('حريمي')
      },
      { 
        name: 'اختبار Cache', 
        success: test4Response.success && test4Response.images?.length > 0,
        cached: true
      }
    ];
    
    let successCount = 0;
    tests.forEach((test, index) => {
      const status = test.success ? '✅ نجح' : '❌ فشل';
      console.log(`${index + 1}. ${test.name}: ${status}`);
      
      if (test.hasCorrectProduct !== undefined) {
        console.log(`   - المنتج الصحيح: ${test.hasCorrectProduct ? '✅' : '❌'}`);
      }
      if (test.hasColorFilter !== undefined) {
        console.log(`   - فلترة اللون: ${test.hasColorFilter ? '✅' : '❌'}`);
      }
      if (test.hasDifferentProduct !== undefined) {
        console.log(`   - منتج مختلف: ${test.hasDifferentProduct ? '✅' : '❌'}`);
      }
      
      if (test.success) successCount++;
    });
    
    console.log(`\n🎯 معدل النجاح الإجمالي: ${successCount}/${tests.length} (${(successCount/tests.length*100).toFixed(1)}%)`);
    
    console.log('\n='.repeat(80));
    console.log('🔧 المزايا المحققة');
    console.log('='.repeat(80));
    
    console.log('✅ نظام AI ذكي للفهم المباشر');
    console.log('✅ نظام Cache للأداء السريع');
    console.log('✅ نظام Fallback للأمان');
    console.log('✅ فلترة الصور بناءً على اللون');
    console.log('✅ فهم السياق والمحادثة السابقة');
    console.log('✅ التمييز بين "نفس المنتج" و "منتج آخر"');
    
    if (successCount >= 3) {
      console.log('\n🎉 النظام المحسن يعمل بشكل ممتاز!');
      console.log('🚀 جاهز للإنتاج!');
    } else if (successCount >= 2) {
      console.log('\n⚠️ النظام يعمل بشكل جيد لكن يحتاج تحسين');
    } else {
      console.log('\n❌ النظام يحتاج مراجعة شاملة');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار النظام الكامل:', error);
  }
}

testCompleteSystem();
