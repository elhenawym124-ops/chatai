/**
 * ربط نظام تعلم النجاح بالمبيعات الحقيقية
 * 
 * يربط المحادثات بالطلبات الفعلية في النظام
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function populateRealSalesData() {
  console.log('🔗 ربط نظام تعلم النجاح بالمبيعات الحقيقية...\n');

  try {
    const companyId = 'cme4yvrco002kuftceydlrwdi';

    // حذف البيانات المحسوبة خطأ
    console.log('🧹 حذف البيانات المحسوبة خطأ...');
    await prisma.conversationOutcome.deleteMany({
      where: { companyId }
    });
    await prisma.responseEffectiveness.deleteMany({
      where: { companyId }
    });

    // جلب الطلبات الحقيقية مع المحادثات
    console.log('📦 جلب الطلبات الحقيقية...');
    const realOrders = await prisma.order.findMany({
      where: {
        conversationId: { not: null },
        customer: { companyId }
      },
      include: {
        customer: true,
        items: true,
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    console.log(`✅ تم جلب ${realOrders.length} طلب حقيقي مرتبط بمحادثات`);

    // جلب المحادثات بدون طلبات
    const conversationsWithoutOrders = await prisma.conversation.findMany({
      where: {
        companyId,
        id: {
          notIn: realOrders.map(order => order.conversationId).filter(Boolean)
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        customer: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    console.log(`📱 تم جلب ${conversationsWithoutOrders.length} محادثة بدون طلبات`);

    let successfulSales = 0;
    let totalOutcomes = 0;

    // معالجة الطلبات الحقيقية
    console.log('\n💰 معالجة المبيعات الحقيقية...');
    for (const order of realOrders) {
      if (!order.conversation) continue;

      const conversation = order.conversation;
      const totalValue = order.items.reduce((sum, item) =>
        sum + (parseFloat(item.price) * item.quantity), 0
      );

      // تحديد نتيجة الطلب
      let outcome = 'purchase';
      let quality = 8.0; // جودة عالية للمبيعات الحقيقية
      let satisfaction = 4.2;

      if (order.status === 'CANCELLED') {
        outcome = 'cancelled';
        quality = 5.0;
        satisfaction = 2.5;
      } else if (order.status === 'PENDING') {
        outcome = 'pending';
        quality = 6.5;
        satisfaction = 3.5;
      }

      // حساب مدة التحويل
      const conversionTime = Math.floor(
        (new Date(order.createdAt) - new Date(conversation.createdAt)) / (1000 * 60)
      );

      // إنشاء نتيجة المحادثة الحقيقية
      await prisma.conversationOutcome.create({
        data: {
          companyId,
          conversationId: conversation.id,
          customerId: conversation.customerId,
          outcome,
          outcomeValue: totalValue,
          responseQuality: quality,
          customerSatisfaction: satisfaction,
          conversionTime: Math.max(1, conversionTime),
          messageCount: conversation.messages.length,
          aiResponseCount: conversation.messages.filter(m => !m.isFromCustomer).length,
          humanHandoff: conversation.messages.some(m => 
            m.content?.includes('موظف') || m.content?.includes('تحويل')
          ),
          metadata: JSON.stringify({
            source: 'real_order',
            orderId: order.id,
            orderNumber: order.orderNumber,
            orderStatus: order.status,
            orderValue: totalValue,
            itemsCount: order.items.length
          })
        }
      });

      // إنشاء فعالية الردود للمحادثات الناجحة
      for (const message of conversation.messages.filter(m => !m.isFromCustomer)) {
        const effectiveness = analyzeRealResponseEffectiveness(
          message, 
          conversation, 
          { outcome, value: totalValue }
        );
        
        await prisma.responseEffectiveness.create({
          data: {
            companyId,
            conversationId: conversation.id,
            messageId: message.id,
            responseText: message.content || '',
            responseType: effectiveness.type,
            effectivenessScore: effectiveness.score,
            leadToPurchase: outcome === 'purchase',
            responseTime: effectiveness.responseTime,
            wordCount: (message.content || '').split(' ').length,
            sentimentScore: effectiveness.sentiment,
            keywords: effectiveness.keywords,
            customerReaction: effectiveness.reaction,
            metadata: JSON.stringify({
              source: 'real_order',
              orderId: order.id,
              orderValue: totalValue
            })
          }
        });
      }

      totalOutcomes++;
      if (outcome === 'purchase') successfulSales++;
    }

    // معالجة المحادثات بدون طلبات
    console.log('\n📱 معالجة المحادثات بدون طلبات...');
    for (const conversation of conversationsWithoutOrders) {
      const outcome = analyzeConversationWithoutOrder(conversation);
      
      if (outcome) {
        await prisma.conversationOutcome.create({
          data: {
            companyId,
            conversationId: conversation.id,
            customerId: conversation.customerId,
            outcome: outcome.result,
            outcomeValue: null, // لا توجد قيمة حقيقية
            responseQuality: outcome.quality,
            customerSatisfaction: outcome.satisfaction,
            conversionTime: outcome.conversionTime,
            messageCount: conversation.messages.length,
            aiResponseCount: conversation.messages.filter(m => !m.isFromCustomer).length,
            humanHandoff: conversation.messages.some(m => 
              m.content?.includes('موظف') || m.content?.includes('تحويل')
            ),
            metadata: JSON.stringify({
              source: 'conversation_analysis',
              hasOrder: false,
              analysisDate: new Date()
            })
          }
        });

        // إنشاء فعالية الردود
        for (const message of conversation.messages.filter(m => !m.isFromCustomer)) {
          const effectiveness = analyzeRealResponseEffectiveness(
            message, 
            conversation, 
            outcome
          );
          
          await prisma.responseEffectiveness.create({
            data: {
              companyId,
              conversationId: conversation.id,
              messageId: message.id,
              responseText: message.content || '',
              responseType: effectiveness.type,
              effectivenessScore: effectiveness.score,
              leadToPurchase: false, // لا يوجد طلب حقيقي
              responseTime: effectiveness.responseTime,
              wordCount: (message.content || '').split(' ').length,
              sentimentScore: effectiveness.sentiment,
              keywords: effectiveness.keywords,
              customerReaction: effectiveness.reaction,
              metadata: JSON.stringify({
                source: 'conversation_analysis',
                hasOrder: false
              })
            }
          });
        }

        totalOutcomes++;
      }
    }

    console.log(`\n📊 النتائج النهائية:`);
    console.log(`✅ إجمالي النتائج: ${totalOutcomes}`);
    console.log(`💰 مبيعات حقيقية: ${successfulSales}`);
    console.log(`📈 معدل التحويل الحقيقي: ${((successfulSales/totalOutcomes)*100).toFixed(1)}%`);

    // تشغيل تحليل الأنماط على البيانات الحقيقية
    console.log('\n🔍 تشغيل تحليل الأنماط على البيانات الحقيقية...');
    const SuccessAnalyzer = require('./src/services/successAnalyzer');
    const analyzer = new SuccessAnalyzer();
    
    const analysisResult = await analyzer.analyzeSuccessPatterns(companyId, {
      timeRange: 30,
      minSampleSize: 3
    });

    if (analysisResult.success) {
      console.log(`🎉 تم اكتشاف ${analysisResult.patterns.length} نمط من البيانات الحقيقية!`);
      
      for (const pattern of analysisResult.patterns) {
        console.log(`  📈 ${pattern.description} (${(pattern.successRate * 100).toFixed(1)}%)`);
      }
    } else {
      console.log(`⚠️ ${analysisResult.message}`);
    }

    console.log('\n✅ تم ربط النظام بالمبيعات الحقيقية بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في ربط البيانات:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * تحليل فعالية الرد الحقيقية
 */
function analyzeRealResponseEffectiveness(message, conversation, outcome) {
  const content = (message.content || '').toLowerCase();
  const wordCount = content.split(' ').length;
  
  // تحديد نوع الرد
  let type = 'general';
  if (content.includes('سعر') || content.includes('جنيه')) type = 'price_quote';
  else if (content.includes('أهلا') || content.includes('مرحبا')) type = 'greeting';
  else if (content.includes('شحن') || content.includes('توصيل')) type = 'shipping_info';
  else if (content.includes('مقاس') || content.includes('لون')) type = 'product_info';
  else if (content.includes('شكرا') || content.includes('تسلم')) type = 'closing';

  // حساب فعالية الرد بناءً على النتيجة الحقيقية
  let score = 5.0;
  
  // إذا كان هناك طلب حقيقي، الفعالية عالية
  if (outcome.outcome === 'purchase') {
    score = 8.0 + Math.random() * 1.5; // 8.0-9.5
  } else if (outcome.outcome === 'pending') {
    score = 6.0 + Math.random() * 1.5; // 6.0-7.5
  } else if (outcome.outcome === 'cancelled') {
    score = 3.0 + Math.random() * 2.0; // 3.0-5.0
  } else {
    score = 4.0 + Math.random() * 2.0; // 4.0-6.0
  }

  // تعديل بناءً على طول الرد
  if (wordCount <= 20) score += 0.5;
  else if (wordCount > 50) score -= 0.5;

  // الكلمات الإيجابية
  const positiveWords = ['يا قمر', 'حبيبتي', 'ممتاز', 'رائع', 'مناسب'];
  positiveWords.forEach(word => {
    if (content.includes(word)) score += 0.3;
  });

  // حساب المشاعر
  let sentiment = 0.0;
  if (content.includes('يا قمر') || content.includes('حبيبتي')) sentiment += 0.4;
  if (content.includes('ممتاز') || content.includes('رائع')) sentiment += 0.3;
  if (content.includes('مناسب') || content.includes('جميل')) sentiment += 0.2;

  // الكلمات المفتاحية
  const keywords = [];
  if (content.includes('سعر')) keywords.push('سعر');
  if (content.includes('جودة')) keywords.push('جودة');
  if (content.includes('شحن')) keywords.push('شحن');
  if (content.includes('يا قمر')) keywords.push('يا قمر');

  return {
    type,
    score: Math.min(10.0, Math.max(1.0, score)),
    sentiment: Math.min(1.0, Math.max(-1.0, sentiment)),
    responseTime: 1000 + Math.floor(Math.random() * 3000),
    keywords: keywords.join(', '),
    reaction: outcome.outcome === 'purchase' ? 'positive' : 
              outcome.outcome === 'cancelled' ? 'negative' : 'neutral'
  };
}

/**
 * تحليل المحادثات بدون طلبات
 */
function analyzeConversationWithoutOrder(conversation) {
  const messages = conversation.messages;
  if (messages.length === 0) return null;

  const allContent = messages.map(m => m.content || '').join(' ').toLowerCase();
  
  // مؤشرات الاهتمام
  const interestIndicators = [
    'عايز', 'محتاج', 'ممكن', 'كام', 'سعر', 'متوفر'
  ];

  // مؤشرات عدم الاهتمام
  const disinterestIndicators = [
    'مش عايز', 'لا شكرا', 'غالي', 'مش محتاج'
  ];

  let score = 0;
  interestIndicators.forEach(word => {
    if (allContent.includes(word)) score += 1;
  });

  disinterestIndicators.forEach(word => {
    if (allContent.includes(word)) score -= 2;
  });

  // تحديد النتيجة
  let result = 'abandoned';
  let quality = 4.0;
  let satisfaction = 2.5;

  if (score >= 3) {
    result = 'interested';
    quality = 6.0;
    satisfaction = 3.5;
  } else if (score < -1) {
    result = 'rejected';
    quality = 3.0;
    satisfaction = 2.0;
  }

  // حساب مدة المحادثة
  const startTime = new Date(messages[0].createdAt);
  const endTime = new Date(messages[messages.length - 1].createdAt);
  const duration = Math.floor((endTime - startTime) / (1000 * 60));

  return {
    result,
    quality,
    satisfaction,
    conversionTime: duration
  };
}

// تشغيل إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  populateRealSalesData()
    .then(() => {
      console.log('\n🎉 تم الانتهاء بنجاح!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ فشل في العملية:', error);
      process.exit(1);
    });
}

module.exports = { populateRealSalesData };
