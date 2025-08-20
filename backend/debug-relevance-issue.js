/**
 * تشخيص مشكلة انخفاض درجات الملاءمة في نظام التقييم الذكي
 */

const { PrismaClient } = require('@prisma/client');
const aiAgentService = require('./src/services/aiAgentService');

const prisma = new PrismaClient();

async function debugRelevanceIssue() {
  console.log('🔍 [DEBUG] تشخيص مشكلة انخفاض درجات الملاءمة...\n');

  try {
    // الحصول على خدمة التقييم
    const qualityMonitor = aiAgentService.qualityMonitor;
    
    if (!qualityMonitor) {
      console.error('❌ خدمة التقييم غير متاحة');
      return;
    }

    // الحصول على آخر التقييمات ذات الملاءمة المنخفضة
    const recentEvaluations = qualityMonitor.getRecentEvaluations(10);
    const lowRelevanceEvaluations = recentEvaluations.filter(eval => eval.scores.relevance < 60);

    console.log(`📊 إجمالي التقييمات الأخيرة: ${recentEvaluations.length}`);
    console.log(`⚠️ تقييمات بملاءمة منخفضة: ${lowRelevanceEvaluations.length}\n`);

    if (lowRelevanceEvaluations.length === 0) {
      console.log('✅ لا توجد تقييمات بملاءمة منخفضة في البيانات الحديثة');
      return;
    }

    // تحليل كل تقييم منخفض الملاءمة
    console.log('🔍 تحليل التقييمات منخفضة الملاءمة:\n');
    console.log('='.repeat(80));

    for (const [index, evaluation] of lowRelevanceEvaluations.entries()) {
      console.log(`\n${index + 1}. تقييم: ${evaluation.messageId}`);
      console.log(`   📅 التوقيت: ${evaluation.timestamp}`);
      console.log(`   🎯 درجة الملاءمة: ${evaluation.scores.relevance}%`);
      console.log(`   📊 الدرجة الإجمالية: ${evaluation.scores.overall}%`);
      console.log(`   🏷️ مستوى الجودة: ${evaluation.qualityLevel}`);
      
      // محاولة العثور على المحادثة الحقيقية
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: evaluation.conversationId },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 10
            },
            customer: true
          }
        });

        if (conversation) {
          console.log(`   👤 العميل: ${conversation.customer.name}`);
          console.log(`   💬 عدد الرسائل: ${conversation.messages.length}`);
          
          // البحث عن الرسائل حول وقت التقييم
          const evaluationTime = new Date(evaluation.timestamp);
          const relevantMessages = conversation.messages.filter(msg => {
            const msgTime = new Date(msg.createdAt);
            const timeDiff = Math.abs(msgTime - evaluationTime);
            return timeDiff < 5 * 60 * 1000; // خلال 5 دقائق
          });

          if (relevantMessages.length > 0) {
            console.log(`\n   📝 الرسائل ذات الصلة:`);
            relevantMessages.forEach((msg, idx) => {
              const sender = msg.isFromCustomer ? '👤 العميل' : '🤖 البوت';
              const content = msg.content.length > 100 ? 
                msg.content.substring(0, 100) + '...' : 
                msg.content;
              console.log(`      ${idx + 1}. ${sender}: "${content}"`);
            });

            // تحليل السبب المحتمل لانخفاض الملاءمة
            const customerMessages = relevantMessages.filter(msg => msg.isFromCustomer);
            const botMessages = relevantMessages.filter(msg => !msg.isFromCustomer);

            if (customerMessages.length > 0 && botMessages.length > 0) {
              const lastCustomerMsg = customerMessages[0];
              const lastBotMsg = botMessages[0];

              console.log(`\n   🔍 تحليل الملاءمة:`);
              console.log(`      📥 سؤال العميل: "${lastCustomerMsg.content}"`);
              console.log(`      📤 رد البوت: "${lastBotMsg.content.substring(0, 150)}..."`);

              // تحليل الكلمات المفتاحية
              const customerKeywords = extractKeywords(lastCustomerMsg.content);
              const botKeywords = extractKeywords(lastBotMsg.content);
              const commonKeywords = customerKeywords.filter(word => botKeywords.includes(word));

              console.log(`      🔑 كلمات العميل: [${customerKeywords.join(', ')}]`);
              console.log(`      🔑 كلمات البوت: [${botKeywords.join(', ')}]`);
              console.log(`      ✅ كلمات مشتركة: [${commonKeywords.join(', ')}]`);
              console.log(`      📊 نسبة التطابق: ${commonKeywords.length}/${customerKeywords.length} = ${Math.round((commonKeywords.length / customerKeywords.length) * 100)}%`);

              // تحليل نوع السؤال والإجابة
              const questionType = identifyQuestionType(lastCustomerMsg.content);
              const responseType = identifyResponseType(lastBotMsg.content);
              
              console.log(`      ❓ نوع السؤال: ${questionType}`);
              console.log(`      💬 نوع الإجابة: ${responseType}`);
              console.log(`      🎯 تطابق النوع: ${questionType === responseType ? 'نعم ✅' : 'لا ❌'}`);

              // اقتراحات للتحسين
              console.log(`\n   💡 اقتراحات التحسين:`);
              if (commonKeywords.length === 0) {
                console.log(`      - البوت لم يستخدم أي كلمة من سؤال العميل`);
              }
              if (questionType !== responseType) {
                console.log(`      - نوع الإجابة لا يتطابق مع نوع السؤال`);
              }
              if (lastBotMsg.content.length < 20) {
                console.log(`      - الرد قصير جداً وقد يكون غير مفيد`);
              }
            }
          }
        } else {
          console.log(`   ⚠️ لم يتم العثور على المحادثة في قاعدة البيانات`);
        }
      } catch (dbError) {
        console.log(`   ❌ خطأ في الوصول لقاعدة البيانات: ${dbError.message}`);
      }

      console.log(`\n   🚨 المشاكل المكتشفة: [${evaluation.issues.join(', ')}]`);
      console.log(`   📋 التوصيات: [${evaluation.recommendations.join(', ')}]`);
      
      console.log('\n' + '-'.repeat(80));
    }

    // إحصائيات عامة
    console.log(`\n📈 إحصائيات عامة:`);
    const avgRelevance = recentEvaluations.reduce((sum, eval) => sum + eval.scores.relevance, 0) / recentEvaluations.length;
    const avgOverall = recentEvaluations.reduce((sum, eval) => sum + eval.scores.overall, 0) / recentEvaluations.length;
    
    console.log(`   📊 متوسط الملاءمة: ${Math.round(avgRelevance)}%`);
    console.log(`   📊 متوسط الجودة الإجمالية: ${Math.round(avgOverall)}%`);
    
    const relevanceDistribution = {
      excellent: recentEvaluations.filter(e => e.scores.relevance >= 85).length,
      good: recentEvaluations.filter(e => e.scores.relevance >= 70 && e.scores.relevance < 85).length,
      acceptable: recentEvaluations.filter(e => e.scores.relevance >= 60 && e.scores.relevance < 70).length,
      poor: recentEvaluations.filter(e => e.scores.relevance < 60).length
    };

    console.log(`\n   📋 توزيع درجات الملاءمة:`);
    console.log(`      - ممتاز (85%+): ${relevanceDistribution.excellent}`);
    console.log(`      - جيد (70-84%): ${relevanceDistribution.good}`);
    console.log(`      - مقبول (60-69%): ${relevanceDistribution.acceptable}`);
    console.log(`      - ضعيف (<60%): ${relevanceDistribution.poor}`);

    // توصيات عامة
    console.log(`\n💡 توصيات عامة للتحسين:`);
    if (relevanceDistribution.poor > relevanceDistribution.excellent) {
      console.log(`   - نسبة عالية من الردود ضعيفة الملاءمة - يحتاج مراجعة نظام فهم الأسئلة`);
    }
    if (avgRelevance < 70) {
      console.log(`   - متوسط الملاءمة منخفض - يحتاج تحسين خوارزمية تحليل الكلمات المفتاحية`);
    }
    console.log(`   - مراجعة قاعدة المعرفة للتأكد من شمولها لجميع أنواع الأسئلة`);
    console.log(`   - تحسين نظام تصنيف نوع السؤال ونوع الإجابة`);

  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// دوال مساعدة
function extractKeywords(text) {
  return text.toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 10);
}

function identifyQuestionType(message) {
  if (message.includes('كام') || message.includes('سعر') || message.includes('ثمن')) return 'price';
  if (message.includes('متوفر') || message.includes('موجود')) return 'availability';
  if (message.includes('شحن') || message.includes('توصيل')) return 'shipping';
  if (message.includes('مواصفات') || message.includes('تفاصيل')) return 'specifications';
  if (message.includes('مقاس') || message.includes('مقاسات')) return 'sizes';
  if (message.includes('صور') || message.includes('صورة')) return 'images';
  return 'general';
}

function identifyResponseType(response) {
  if (/\d+\s*(جنيه|ريال|درهم)/.test(response)) return 'price';
  if (response.includes('متوفر') || response.includes('موجود')) return 'availability';
  if (response.includes('شحن') || response.includes('توصيل')) return 'shipping';
  if (response.includes('مواصفات') || response.includes('تفاصيل')) return 'specifications';
  if (response.includes('مقاس') || response.includes('مقاسات')) return 'sizes';
  if (response.includes('صور') || response.includes('صورة')) return 'images';
  return 'general';
}

// تشغيل التشخيص
if (require.main === module) {
  debugRelevanceIssue()
    .then(() => {
      console.log('\n✅ انتهى التشخيص');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 خطأ في التشخيص:', error);
      process.exit(1);
    });
}

module.exports = { debugRelevanceIssue };
