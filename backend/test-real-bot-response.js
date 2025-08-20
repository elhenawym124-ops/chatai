/**
 * اختبار محاكاة رد حقيقي من البوت لتفعيل نظام التقييم
 */

const aiAgentService = require('./src/services/aiAgentService');

async function testRealBotResponse() {
  console.log('🤖 [TEST] اختبار رد حقيقي من البوت...\n');

  try {
    // محاكاة رد من البوت
    console.log('📝 محاكاة رسالة من عميل...');
    
    const testMessage = 'السلام عليكم، أريد معرفة سعر الحقيبة الجلدية';
    const conversationId = 'test_conv_' + Date.now();
    const customerId = 'test_customer_001';
    const pageId = 'test_page_001';

    console.log(`   📩 الرسالة: "${testMessage}"`);
    console.log(`   🆔 معرف المحادثة: ${conversationId}`);
    
    // إرسال الرسالة للبوت
    console.log('\n🤖 إرسال الرسالة للبوت...');
    
    const response = await aiAgentService.processCustomerMessage(
      testMessage,
      conversationId,
      customerId,
      pageId
    );

    if (response.success) {
      console.log('✅ البوت رد بنجاح!');
      console.log(`   🤖 الرد: "${response.content.substring(0, 100)}..."`);
      console.log(`   📊 النموذج: ${response.model}`);
      console.log(`   🔍 استخدام RAG: ${response.ragDataUsed ? 'نعم' : 'لا'}`);
      console.log(`   ⏱️ وقت المعالجة: ${response.processingTime}ms`);
      console.log(`   🎯 الثقة: ${response.confidence}`);
      
      // انتظار لمعالجة التقييم
      console.log('\n⏳ انتظار معالجة التقييم...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // فحص التقييم
      console.log('\n📊 فحص نتيجة التقييم...');
      
      const qualityMonitor = aiAgentService.qualityMonitor;
      const recentEvaluations = qualityMonitor.getRecentEvaluations(1);
      
      if (recentEvaluations.length > 0) {
        const evaluation = recentEvaluations[0];
        console.log('✅ تم العثور على التقييم!');
        console.log(`   🏆 مستوى الجودة: ${evaluation.qualityLevel}`);
        console.log(`   📊 النقاط:`);
        console.log(`      - الإجمالي: ${evaluation.scores.overall}%`);
        console.log(`      - الملاءمة: ${evaluation.scores.relevance}%`);
        console.log(`      - الدقة: ${evaluation.scores.accuracy}%`);
        console.log(`      - الوضوح: ${evaluation.scores.clarity}%`);
        console.log(`      - الاكتمال: ${evaluation.scores.completeness}%`);
        console.log(`      - استخدام RAG: ${evaluation.scores.ragUsage}%`);
        
        if (evaluation.issues.length > 0) {
          console.log(`   ⚠️ المشاكل: ${evaluation.issues.join(', ')}`);
        }
        
        if (evaluation.recommendations.length > 0) {
          console.log(`   💡 التوصيات: ${evaluation.recommendations.join(', ')}`);
        }
        
        console.log('\n🎉 نظام التقييم الذكي يعمل مع البوت الحقيقي!');
        return true;
        
      } else {
        console.log('⚠️ لم يتم العثور على تقييم - قد يحتاج وقت أكثر');
        
        // محاولة أخرى بعد انتظار أطول
        console.log('⏳ انتظار إضافي...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const laterEvaluations = qualityMonitor.getRecentEvaluations(1);
        if (laterEvaluations.length > 0) {
          console.log('✅ تم العثور على التقييم بعد انتظار إضافي!');
          return true;
        } else {
          console.log('❌ لم يتم العثور على تقييم');
          return false;
        }
      }
      
    } else {
      console.log('❌ فشل البوت في الرد:');
      console.log(`   خطأ: ${response.error || 'غير معروف'}`);
      return false;
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    return false;
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testRealBotResponse()
    .then((success) => {
      if (success) {
        console.log('\n✅ الاختبار نجح - النظام يعمل مع البوت الحقيقي!');
        process.exit(0);
      } else {
        console.log('\n❌ الاختبار فشل - قد تحتاج مراجعة النظام');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 خطأ في الاختبار:', error);
      process.exit(1);
    });
}

module.exports = { testRealBotResponse };
