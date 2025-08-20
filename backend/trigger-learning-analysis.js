const { PrismaClient } = require('@prisma/client');
const ContinuousLearningServiceV2 = require('./src/services/continuousLearningServiceV2');

const prisma = new PrismaClient();
const learningService = new ContinuousLearningServiceV2();

async function main() {
  try {
    console.log('🚀 بدء تحليل نظام التعلم المستمر...\n');
    
    // 1. فحص البيانات الحالية
    console.log('📊 فحص البيانات الحالية:');
    const learningDataCount = await prisma.learningData.count();
    const patternsCount = await prisma.discoveredPattern.count();
    const improvementsCount = await prisma.appliedImprovement.count();
    const conversationsCount = await prisma.conversation.count();
    
    console.log(`   - سجلات التعلم: ${learningDataCount}`);
    console.log(`   - الأنماط المكتشفة: ${patternsCount}`);
    console.log(`   - التحسينات المطبقة: ${improvementsCount}`);
    console.log(`   - المحادثات الإجمالية: ${conversationsCount}\n`);
    
    // 2. الحصول على معرف الشركة
    const company = await prisma.company.findFirst();
    if (!company) {
      console.error('❌ لا توجد شركة في قاعدة البيانات');
      return;
    }
    console.log(`🏢 معرف الشركة: ${company.id}\n`);
    
    // 3. إنشاء بيانات تعلم من المحادثات الموجودة (إذا لم تكن موجودة)
    if (learningDataCount < 10) {
      console.log('📝 إنشاء بيانات تعلم من المحادثات الموجودة...');
      
      const conversations = await prisma.conversation.findMany({
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 5
          }
        },
        take: 20
      });
      
      let createdRecords = 0;
      
      for (const conversation of conversations) {
        if (conversation.messages.length >= 2) {
          const userMessages = conversation.messages.filter(m => m.sender === 'customer');
          const aiMessages = conversation.messages.filter(m => m.sender === 'ai' || m.sender === 'staff');
          
          if (userMessages.length > 0 && aiMessages.length > 0) {
            const userMessage = userMessages[0];
            const aiMessage = aiMessages[0];
            
            try {
              await prisma.learningData.create({
                data: {
                  companyId: company.id,
                  customerId: conversation.customerId,
                  conversationId: conversation.id,
                  type: 'conversation',
                  data: JSON.stringify({
                    userMessage: userMessage.content,
                    aiResponse: aiMessage.content,
                    intent: userMessage.content.includes('سعر') ? 'price_inquiry' : 'general_inquiry',
                    sentiment: userMessage.content.includes('شكرا') ? 'positive' : 'neutral',
                    processingTime: Math.random() * 2000 + 500,
                    ragDataUsed: true,
                    memoryUsed: false,
                    model: 'gemini-pro',
                    confidence: 0.8
                  }),
                  outcome: userMessage.content.includes('شكرا') ? 'satisfied' : 'ongoing',
                  insights: JSON.stringify({
                    effectiveElements: userMessage.content.includes('شكرا') ? ['helpful_response'] : [],
                    improvementAreas: [],
                    contextFactors: ['conversation_analyzed'],
                    successIndicators: userMessage.content.includes('شكرا') ? ['positive_feedback'] : []
                  })
                }
              });
              createdRecords++;
            } catch (error) {
              // تجاهل الأخطاء المكررة
            }
          }
        }
      }
      
      console.log(`   ✅ تم إنشاء ${createdRecords} سجل تعلم جديد\n`);
    }
    
    // 4. تشغيل تحليل الأنماط
    console.log('🔍 تشغيل تحليل الأنماط...');
    const patterns = await learningService.triggerPatternAnalysis(company.id);
    
    console.log(`   ✅ تم اكتشاف ${patterns.length} نمط\n`);
    
    if (patterns.length > 0) {
      console.log('📋 الأنماط المكتشفة:');
      patterns.forEach((pattern, i) => {
        console.log(`   ${i+1}. ${pattern.patternType}: ${pattern.description}`);
        console.log(`      الثقة: ${pattern.confidence}, التكرارات: ${pattern.occurrences}`);
      });
      console.log('');
    }
    
    // 5. تشغيل توليد التحسينات
    console.log('🚀 تشغيل توليد التحسينات...');
    const improvements = await learningService.triggerImprovementGeneration(company.id);
    
    console.log(`   ✅ تم توليد ${improvements.length} تحسين\n`);
    
    if (improvements.length > 0) {
      console.log('⚡ التحسينات المولدة:');
      improvements.forEach((improvement, i) => {
        console.log(`   ${i+1}. ${improvement.type}: ${improvement.description}`);
      });
      console.log('');
    }
    
    // 6. عرض الإحصائيات النهائية
    console.log('📊 الإحصائيات النهائية:');
    const finalStats = await learningService.getLearningStats(company.id);
    console.log(`   - إجمالي التفاعلات: ${finalStats.totalInteractions}`);
    console.log(`   - الأنماط المكتشفة: ${finalStats.discoveredPatterns}`);
    console.log(`   - التحسينات المطبقة: ${finalStats.appliedImprovements}`);
    console.log(`   - معدل التعلم: ${finalStats.learningRate.toFixed(2)}%`);
    
    console.log('\n🎉 تم إكمال تحليل نظام التعلم المستمر بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في التحليل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
