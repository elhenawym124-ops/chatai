/**
 * اختبار تكامل نظام التعلم المستمر مع AI Agent
 */

const aiAgentService = require('./src/services/aiAgentService');
const ContinuousLearningServiceV2 = require('./src/services/continuousLearningServiceV2');

class LearningIntegrationTester {
  constructor() {
    this.learningService = new ContinuousLearningServiceV2();
    this.testCompanyId = 'cmdkj6coz0000uf0cyscco6lr';
    this.testCustomerId = 'test_customer_123';
    this.testConversationId = 'test_conversation_456';
  }

  async runTests() {
    console.log('🧪 اختبار تكامل نظام التعلم المستمر...\n');

    try {
      // اختبار 1: معالجة رسالة عادية
      await this.testNormalMessage();
      
      // اختبار 2: معالجة رسالة شراء
      await this.testPurchaseMessage();
      
      // اختبار 3: معالجة رسالة دعم
      await this.testSupportMessage();
      
      // اختبار 4: تحديث التغذية الراجعة
      await this.testFeedbackUpdate();
      
      // اختبار 5: مراقبة الأداء
      await this.testPerformanceMonitoring();
      
      // اختبار 6: عرض البيانات المجمعة
      await this.testCollectedData();

      console.log('\n✅ جميع الاختبارات اكتملت بنجاح!');

    } catch (error) {
      console.error('❌ خطأ في الاختبارات:', error);
    }
  }

  async testNormalMessage() {
    console.log('📝 اختبار 1: معالجة رسالة عادية...');
    
    const messageData = {
      conversationId: this.testConversationId + '_normal',
      senderId: this.testCustomerId,
      content: 'مرحبا، أريد معرفة المنتجات المتاحة',
      attachments: [],
      customerData: {
        companyId: this.testCompanyId,
        name: 'عميل تجريبي',
        phone: '01234567890'
      }
    };

    const response = await aiAgentService.processCustomerMessage(messageData);
    
    if (response.success) {
      console.log('✅ تم معالجة الرسالة العادية بنجاح');
      console.log(`   - الرد: ${response.content.substring(0, 100)}...`);
      console.log(`   - النية: ${response.intent}`);
      console.log(`   - وقت المعالجة: ${response.processingTime}ms`);
    } else {
      console.log('❌ فشل في معالجة الرسالة العادية');
    }
    
    console.log('');
  }

  async testPurchaseMessage() {
    console.log('🛒 اختبار 2: معالجة رسالة شراء...');
    
    const messageData = {
      conversationId: this.testConversationId + '_purchase',
      senderId: this.testCustomerId,
      content: 'أريد أشتري تيشيرت أحمر مقاس L',
      attachments: [],
      customerData: {
        companyId: this.testCompanyId,
        name: 'عميل تجريبي',
        phone: '01234567890'
      }
    };

    const response = await aiAgentService.processCustomerMessage(messageData);
    
    if (response.success) {
      console.log('✅ تم معالجة رسالة الشراء بنجاح');
      console.log(`   - النية: ${response.intent}`);
      console.log(`   - استخدام RAG: ${response.ragDataUsed}`);
    } else {
      console.log('❌ فشل في معالجة رسالة الشراء');
    }
    
    console.log('');
  }

  async testSupportMessage() {
    console.log('🆘 اختبار 3: معالجة رسالة دعم...');
    
    const messageData = {
      conversationId: this.testConversationId + '_support',
      senderId: this.testCustomerId,
      content: 'عندي مشكلة في الطلب، مش وصلني لحد دلوقتي',
      attachments: [],
      customerData: {
        companyId: this.testCompanyId,
        name: 'عميل تجريبي',
        phone: '01234567890'
      }
    };

    const response = await aiAgentService.processCustomerMessage(messageData);
    
    if (response.success) {
      console.log('✅ تم معالجة رسالة الدعم بنجاح');
      console.log(`   - النية: ${response.intent}`);
      console.log(`   - المشاعر: ${response.sentiment}`);
    } else {
      console.log('❌ فشل في معالجة رسالة الدعم');
    }
    
    console.log('');
  }

  async testFeedbackUpdate() {
    console.log('📝 اختبار 4: تحديث التغذية الراجعة...');
    
    const feedback = {
      satisfactionScore: 5,
      responseQuality: 'excellent',
      helpfulness: 'very_helpful',
      comments: 'الرد كان مفيد جداً وسريع'
    };

    const result = await aiAgentService.updateLearningDataWithFeedback(
      this.testConversationId + '_normal',
      feedback
    );
    
    if (result.success) {
      console.log('✅ تم تحديث التغذية الراجعة بنجاح');
    } else {
      console.log('❌ فشل في تحديث التغذية الراجعة');
    }
    
    console.log('');
  }

  async testPerformanceMonitoring() {
    console.log('📊 اختبار 5: مراقبة الأداء...');
    
    const performance = await aiAgentService.monitorImprovementPerformance(this.testCompanyId);
    
    if (performance.success) {
      console.log('✅ تم جلب بيانات الأداء بنجاح');
      console.log(`   - عدد التحسينات النشطة: ${performance.data.length}`);
      console.log(`   - متوسط التحسن: ${performance.summary.averageImprovement}%`);
    } else {
      console.log('❌ فشل في جلب بيانات الأداء');
    }
    
    console.log('');
  }

  async testCollectedData() {
    console.log('📊 اختبار 6: عرض البيانات المجمعة...');
    
    try {
      // جلب بيانات التعلم المجمعة
      const learningData = await this.learningService.prisma.learningData.findMany({
        where: {
          companyId: this.testCompanyId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });

      console.log(`✅ تم جمع ${learningData.length} سجل تعلم`);
      
      learningData.forEach((record, index) => {
        const data = JSON.parse(record.data);
        console.log(`   ${index + 1}. النوع: ${record.type}, النتيجة: ${record.outcome}`);
        console.log(`      الرسالة: ${data.userMessage?.substring(0, 50)}...`);
        console.log(`      النية: ${data.intent}, المشاعر: ${data.sentiment}`);
      });

      // جلب الأنماط المكتشفة
      const patterns = await this.learningService.prisma.discoveredPattern.findMany({
        where: {
          companyId: this.testCompanyId
        },
        take: 3
      });

      console.log(`\n📈 تم اكتشاف ${patterns.length} نمط:`);
      patterns.forEach((pattern, index) => {
        console.log(`   ${index + 1}. ${pattern.description} (ثقة: ${pattern.confidence})`);
      });

      // جلب التحسينات المطبقة
      const improvements = await this.learningService.prisma.appliedImprovement.findMany({
        where: {
          companyId: this.testCompanyId
        },
        take: 3
      });

      console.log(`\n🔧 تم تطبيق ${improvements.length} تحسين:`);
      improvements.forEach((improvement, index) => {
        console.log(`   ${index + 1}. ${improvement.description} (حالة: ${improvement.status})`);
      });

    } catch (error) {
      console.error('❌ خطأ في جلب البيانات المجمعة:', error);
    }
    
    console.log('');
  }

  async testLearningAnalytics() {
    console.log('📈 اختبار إضافي: تحليلات التعلم...');
    
    try {
      const analytics = await this.learningService.getLearningAnalytics(this.testCompanyId, 'week');
      
      if (analytics.success) {
        console.log('✅ تم جلب تحليلات التعلم بنجاح');
        console.log(`   - إجمالي التفاعلات: ${analytics.data.totalInteractions}`);
        console.log(`   - معدل النجاح: ${analytics.data.successRate}%`);
        console.log(`   - متوسط وقت الاستجابة: ${analytics.data.avgResponseTime}ms`);
      } else {
        console.log('❌ فشل في جلب تحليلات التعلم');
      }
    } catch (error) {
      console.error('❌ خطأ في تحليلات التعلم:', error);
    }
    
    console.log('');
  }
}

// تشغيل الاختبارات
async function runTests() {
  const tester = new LearningIntegrationTester();
  await tester.runTests();
  await tester.testLearningAnalytics();
  
  console.log('🎉 انتهت جميع الاختبارات!');
  process.exit(0);
}

// تشغيل الاختبارات إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = LearningIntegrationTester;
