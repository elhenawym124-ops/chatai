const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPatternApplication() {
  try {
    console.log('🧪 اختبار تطبيق الأنماط...');
    
    const companyId = 'cme8zve740006ufbcre9qzue4';
    
    // 1. فحص الأنماط المعتمدة والنشطة
    const approvedPatterns = await prisma.successPattern.findMany({
      where: {
        companyId: companyId,
        isApproved: true,
        isActive: true
      },
      select: {
        id: true,
        patternType: true,
        description: true,
        successRate: true,
        pattern: true
      },
      orderBy: {
        successRate: 'desc'
      }
    });
    
    console.log(`✅ الأنماط المعتمدة والنشطة: ${approvedPatterns.length}`);
    
    // 2. اختبار خدمة تطبيق الأنماط
    const PatternApplicationService = require('./src/services/patternApplicationService');
    const patternService = new PatternApplicationService();
    
    // جلب الأنماط من الخدمة
    const patternsFromService = await patternService.getApprovedPatterns(companyId);
    console.log(`📋 الأنماط من الخدمة: ${patternsFromService.length}`);
    
    if (patternsFromService.length > 0) {
      console.log('\n📝 الأنماط المحملة من الخدمة:');
      patternsFromService.slice(0, 3).forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern.type}`);
        console.log(`   الوصف: ${pattern.description.substring(0, 80)}...`);
        console.log(`   معدل النجاح: ${pattern.successRate}`);
        console.log('');
      });
    }
    
    // 3. اختبار تطبيق الأنماط على prompt
    console.log('\n🔧 اختبار تطبيق الأنماط على prompt...');
    
    const testPrompt = `أنت محمد، مساعد مبيعات محترف في شركة الحلو.
- تكلم بلغة رسمية ومهنية
- كن بائع صارم ومباشر في التعامل
- سعر الشحن 70 جنيه لجميع المنتجات
- ركز على بيع المنتجات وتقديم المعلومات الدقيقة`;
    
    const messageContext = {
      conversationId: 'test-conversation-' + Date.now(),
      customerMessage: 'عايز كوتشي حريمي لمسه',
      companyId: companyId
    };
    
    try {
      const enhancedPrompt = await patternService.applyPatterns(
        companyId,
        testPrompt,
        messageContext
      );
      
      console.log('✅ تم تطبيق الأنماط بنجاح!');
      console.log(`📏 طول الـ prompt الأصلي: ${testPrompt.length} حرف`);
      console.log(`📏 طول الـ prompt المحسن: ${enhancedPrompt.length} حرف`);
      
      // عرض جزء من الـ prompt المحسن
      const promptPreview = enhancedPrompt.substring(0, 500);
      console.log('\n📄 معاينة الـ prompt المحسن:');
      console.log(promptPreview + '...');
      
      // فحص إذا كانت الأنماط مطبقة
      const hasPatternContent = enhancedPrompt.includes('الأنماط الناجحة') || 
                               enhancedPrompt.includes('نمط') ||
                               enhancedPrompt.includes('استراتيجية');
      
      console.log(`\n🎯 هل تم تطبيق الأنماط: ${hasPatternContent ? 'نعم ✅' : 'لا ❌'}`);
      
    } catch (error) {
      console.error('❌ خطأ في تطبيق الأنماط:', error.message);
    }
    
    // 4. اختبار محاكاة رسالة كاملة
    console.log('\n🤖 اختبار محاكاة رسالة كاملة...');
    
    const aiAgentService = require('./src/services/aiAgentService');
    
    const testMessage = {
      conversationId: 'test-conversation-patterns',
      senderId: '23949903971327041',
      content: 'عايز كوتشي حريمي لمسه مقاس 40',
      attachments: [],
      timestamp: new Date(),
      companyId: companyId,
      customerData: {
        id: 'cme9y5xaf001pufr844p2m8up',
        name: 'مختار محمد',
        phone: '01017854018',
        email: null,
        orderCount: 0,
        companyId: companyId
      }
    };
    
    console.log('📤 إرسال رسالة اختبار للـ AI Agent...');
    
    try {
      const response = await aiAgentService.processCustomerMessage(testMessage);
      
      console.log('✅ رد الـ AI Agent:');
      console.log(`📝 المحتوى: ${response.content.substring(0, 200)}...`);
      console.log(`🎯 النية: ${response.intent}`);
      console.log(`📊 الثقة: ${response.confidence}`);
      console.log(`🔧 النموذج: ${response.model}`);
      
      // فحص إذا كان الرد يحتوي على عناصر من الأنماط
      const responseContent = response.content.toLowerCase();
      const patternElements = [
        'سيد مختار',
        'بالتأكيد',
        'يسعدني',
        'هل تريد',
        'يمكنني مساعدتك',
        'تأكيد الطلب'
      ];
      
      const appliedElements = patternElements.filter(element => 
        responseContent.includes(element.toLowerCase())
      );
      
      console.log(`\n🎯 عناصر الأنماط المطبقة: ${appliedElements.length}/${patternElements.length}`);
      if (appliedElements.length > 0) {
        console.log(`   العناصر: ${appliedElements.join(', ')}`);
      }
      
    } catch (error) {
      console.error('❌ خطأ في الـ AI Agent:', error.message);
    }
    
    // 5. فحص سجلات استخدام الأنماط
    console.log('\n📊 فحص سجلات استخدام الأنماط الجديدة...');
    
    const recentUsage = await prisma.patternUsage.findMany({
      where: {
        companyId: companyId,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // آخر 5 دقائق
        }
      },
      select: {
        patternId: true,
        applied: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📈 سجلات الاستخدام الجديدة: ${recentUsage.length}`);
    
    if (recentUsage.length > 0) {
      console.log('\n📋 آخر استخدامات:');
      recentUsage.forEach((usage, index) => {
        console.log(`${index + 1}. النمط: ${usage.patternId.substring(0, 20)}...`);
        console.log(`   مطبق: ${usage.applied}`);
        console.log(`   الوقت: ${usage.createdAt}`);
        console.log('');
      });
    } else {
      console.log('⚠️ لا توجد سجلات استخدام جديدة');
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPatternApplication();
