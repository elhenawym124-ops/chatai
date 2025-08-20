/**
 * إنشاء بيانات تجريبية لتحسين عرض النظام
 * Create Sample Data for Better System Demonstration
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleData() {
  console.log('🎯 إنشاء بيانات تجريبية...\n');

  try {
    const companyId = 'cme4yvrco002kuftceydlrwdi';

    // 1. إنشاء بعض الطلبات التجريبية لحساب ROI
    console.log('📦 إنشاء طلبات تجريبية...');
    
    const sampleOrders = [
      { totalAmount: 349, status: 'completed' },
      { totalAmount: 450, status: 'completed' },
      { totalAmount: 299, status: 'completed' },
      { totalAmount: 520, status: 'completed' },
      { totalAmount: 380, status: 'completed' }
    ];

    for (let i = 0; i < sampleOrders.length; i++) {
      const orderData = sampleOrders[i];
      await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${i + 1}`,
          companyId,
          customerId: 'cme6g4s7j0001ufy4zfu5xsy3', // عميل تجريبي
          subtotal: orderData.totalAmount,
          total: orderData.totalAmount,
          status: orderData.status === 'completed' ? 'DELIVERED' : 'PENDING',
          customerName: 'عميل تجريبي',
          customerPhone: '01234567890',
          city: 'القاهرة',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // آخر 30 يوم
        }
      });
    }

    console.log(`✅ تم إنشاء ${sampleOrders.length} طلب تجريبي`);

    // 2. إنشاء نتائج محادثات إيجابية
    console.log('💬 إنشاء نتائج محادثات...');
    
    const conversationOutcomes = [
      {
        conversationId: 'cme6g4slz0003ufy4fh56z3yv',
        customerId: 'cme6g4s7j0001ufy4zfu5xsy3',
        outcome: 'purchase',
        customerSatisfaction: 5,
        outcomeValue: 349
      },
      {
        conversationId: 'cme6gmdug0024ufy4pb358m8m',
        customerId: 'cme6gmdgu0022ufy4aqa6kpv5',
        outcome: 'resolved',
        customerSatisfaction: 4,
        outcomeValue: 0
      }
    ];

    for (const outcome of conversationOutcomes) {
      await prisma.conversationOutcome.create({
        data: {
          companyId,
          conversationId: outcome.conversationId,
          customerId: outcome.customerId,
          outcome: outcome.outcome,
          customerSatisfaction: outcome.customerSatisfaction,
          outcomeValue: outcome.outcomeValue,
          responseQuality: 8.5,
          messageCount: 5,
          aiResponseCount: 3,
          createdAt: new Date()
        }
      });
    }

    console.log(`✅ تم إنشاء ${conversationOutcomes.length} نتيجة محادثة`);

    // 3. إنشاء المزيد من استخدامات الأنماط
    console.log('🎨 إنشاء استخدامات أنماط إضافية...');
    
    const patternUsages = [
      {
        patternId: 'cme6fqd5l0001ufkkqnjymphw',
        conversationId: 'cme6g4slz0003ufy4fh56z3yv',
        applied: true,
        effectiveness: 0.9
      },
      {
        patternId: 'cme5g6fmq0001ufvkyobvq2bc',
        conversationId: 'cme6gmdug0024ufy4pb358m8m',
        applied: true,
        effectiveness: 0.85
      },
      {
        patternId: 'cme6fqd5l0001ufkkqnjymphw',
        conversationId: 'sample-conv-1',
        applied: true,
        effectiveness: 0.8
      },
      {
        patternId: 'cme5g6fmq0001ufvkyobvq2bc',
        conversationId: 'sample-conv-2',
        applied: true,
        effectiveness: 0.75
      }
    ];

    for (const usage of patternUsages) {
      await prisma.patternUsage.create({
        data: {
          patternId: usage.patternId,
          conversationId: usage.conversationId,
          companyId,
          applied: usage.applied,
          effectiveness: usage.effectiveness,
          customerReaction: 'positive',
          outcomeImpact: 'improved_satisfaction',
          responseTime: Math.floor(Math.random() * 3000) + 1000,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // آخر 7 أيام
        }
      });
    }

    console.log(`✅ تم إنشاء ${patternUsages.length} استخدام نمط إضافي`);

    // 4. إنشاء بيانات تعلم إضافية
    console.log('🧠 إنشاء بيانات تعلم...');
    
    const learningData = [
      {
        userMessage: 'عايز أعرف السعر',
        aiResponse: 'أهلاً بيك! السعر 349 جنيه',
        intent: 'price_inquiry',
        confidence: 0.9
      },
      {
        userMessage: 'هل متوفر؟',
        aiResponse: 'بالطبع متوفر يا فندم!',
        intent: 'availability_check',
        confidence: 0.85
      },
      {
        userMessage: 'عايز أطلب',
        aiResponse: 'ممتاز! هنجهز لك الطلب',
        intent: 'order_intent',
        confidence: 0.95
      }
    ];

    for (const data of learningData) {
      await prisma.learningData.create({
        data: {
          companyId,
          conversationId: `sample-conv-${Math.random().toString(36).substr(2, 9)}`,
          userMessage: data.userMessage,
          aiResponse: data.aiResponse,
          intent: data.intent,
          confidence: data.confidence,
          sentiment: 'positive',
          processingTime: Math.floor(Math.random() * 2000) + 500,
          ragDataUsed: true,
          memoryUsed: false,
          model: 'gemini-2.5-flash',
          type: 'conversation',
          createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) // آخر 14 يوم
        }
      });
    }

    console.log(`✅ تم إنشاء ${learningData.length} سجل تعلم`);

    // 5. تحديث إحصائيات الأداء
    console.log('📊 تحديث إحصائيات الأداء...');
    
    // تشغيل تحديث الأداء للأنماط
    const PatternApplicationService = require('./src/services/patternApplicationService');
    const patternService = new PatternApplicationService();
    
    await patternService.updatePatternPerformance('cme6fqd5l0001ufkkqnjymphw', companyId);
    await patternService.updatePatternPerformance('cme5g6fmq0001ufvkyobvq2bc', companyId);

    console.log('✅ تم تحديث إحصائيات الأداء');

    console.log('\n🎉 تم إنشاء جميع البيانات التجريبية بنجاح!');
    console.log('\n📋 ملخص البيانات المنشأة:');
    console.log(`📦 ${sampleOrders.length} طلب مكتمل`);
    console.log(`💬 ${conversationOutcomes.length} نتيجة محادثة`);
    console.log(`🎨 ${patternUsages.length} استخدام نمط`);
    console.log(`🧠 ${learningData.length} سجل تعلم`);
    console.log('\n🌟 النظام جاهز للعرض مع بيانات غنية!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الدالة
if (require.main === module) {
  createSampleData();
}

module.exports = { createSampleData };
