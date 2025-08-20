const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addAITestMessages() {
  try {
    console.log('🤖 إضافة رسائل اختبار من الذكاء الصناعي...');

    // البحث عن المحادثة المحددة
    const conversationId = 'cmehrqu48009ruff8ec01mk8p';
    
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true }
    });

    if (!conversation) {
      console.log('❌ المحادثة غير موجودة');
      return;
    }

    console.log(`📞 المحادثة موجودة: ${conversation.id}`);
    console.log(`📨 عدد الرسائل الحالية: ${conversation.messages.length}`);

    // إضافة رسائل اختبار من الذكاء الصناعي
    const aiTestMessages = [
      {
        content: 'مرحباً! أنا مساعد ذكي وأسعد بخدمتك. كيف يمكنني مساعدتك اليوم؟ 🤖',
        metadata: {
          isAIGenerated: true,
          aiModel: 'gemini-1.5-flash',
          confidence: 0.95,
          intent: 'greeting',
          sentiment: 'positive',
          responseTime: 1200,
          tokensUsed: 45,
          usedAdvancedService: true,
          timestamp: new Date().toISOString()
        }
      },
      {
        content: 'بناءً على استفسارك، يمكنني أن أقترح عليك منتجاتنا المميزة التي تناسب احتياجاتك. هل تود معرفة المزيد؟ 🛍️',
        metadata: {
          isAIGenerated: true,
          aiModel: 'gemini-1.5-flash',
          confidence: 0.88,
          intent: 'product_recommendation',
          sentiment: 'helpful',
          responseTime: 1800,
          tokensUsed: 67,
          usedAdvancedService: true,
          hasProductSuggestions: true,
          timestamp: new Date().toISOString()
        }
      },
      {
        content: 'شكراً لك على تواصلك معنا! إذا كان لديك أي استفسارات أخرى، لا تتردد في السؤال. أنا هنا لمساعدتك دائماً! ✨',
        metadata: {
          isAIGenerated: true,
          aiModel: 'gemini-1.5-flash',
          confidence: 0.92,
          intent: 'closing',
          sentiment: 'positive',
          responseTime: 950,
          tokensUsed: 38,
          usedAdvancedService: true,
          timestamp: new Date().toISOString()
        }
      }
    ];

    // إضافة الرسائل واحدة تلو الأخرى
    for (let i = 0; i < aiTestMessages.length; i++) {
      const msgData = aiTestMessages[i];
      
      const newMessage = await prisma.message.create({
        data: {
          conversationId: conversationId,
          content: msgData.content,
          type: 'TEXT',
          isFromCustomer: false,
          metadata: JSON.stringify(msgData.metadata),
          createdAt: new Date(Date.now() + (i * 60000)) // فاصل دقيقة بين كل رسالة
        }
      });

      console.log(`✅ تم إضافة رسالة AI ${i + 1}: ${newMessage.id}`);
      console.log(`   📄 المحتوى: "${msgData.content.substring(0, 50)}..."`);
      console.log(`   🤖 الثقة: ${msgData.metadata.confidence}`);
      console.log(`   🎯 النية: ${msgData.metadata.intent}`);
    }

    // تحديث آخر رسالة في المحادثة
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: aiTestMessages[aiTestMessages.length - 1].content.substring(0, 100)
      }
    });

    console.log('\n🎉 تم إضافة جميع رسائل الذكاء الصناعي بنجاح!');
    console.log('🔄 حدث الصفحة الآن لترى التمييز بين الرسائل');

  } catch (error) {
    console.error('❌ خطأ في إضافة رسائل الذكاء الصناعي:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAITestMessages();
