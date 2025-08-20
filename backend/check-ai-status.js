const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function checkAIStatus() {
  try {
    console.log('🤖 فحص حالة الذكاء الاصطناعي...\n');

    // 1. فحص مفاتيح Gemini في قاعدة البيانات
    console.log('1️⃣ فحص مفاتيح Gemini:');
    console.log('═'.repeat(50));
    
    const geminiKeys = await prisma.geminiKey.findMany({
      include: {
        company: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (geminiKeys.length === 0) {
      console.log('❌ لا توجد مفاتيح Gemini في النظام');
    } else {
      console.log(`📊 إجمالي مفاتيح Gemini: ${geminiKeys.length}\n`);
      
      for (let i = 0; i < geminiKeys.length; i++) {
        const key = geminiKeys[i];
        console.log(`${i + 1}. 🔑 مفتاح ${key.keyId}`);
        console.log(`   🏢 الشركة: ${key.company?.name || 'غير محدد'}`);
        console.log(`   📧 الإيميل: ${key.company?.email || 'غير محدد'}`);
        console.log(`   🤖 النموذج: ${key.model}`);
        console.log(`   ✅ نشط: ${key.isActive ? 'نعم' : 'لا'}`);
        console.log(`   📅 تاريخ الإنشاء: ${key.createdAt.toLocaleString('ar-EG')}`);
        
        // اختبار المفتاح
        if (key.isActive) {
          console.log(`   🧪 اختبار المفتاح...`);
          try {
            const testResponse = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/${key.model}:generateContent?key=${key.apiKey}`,
              {
                contents: [{
                  parts: [{
                    text: 'مرحبا'
                  }]
                }]
              },
              {
                headers: {
                  'Content-Type': 'application/json'
                },
                timeout: 10000
              }
            );
            
            if (testResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
              console.log(`   ✅ المفتاح يعمل بشكل صحيح`);
            } else {
              console.log(`   ⚠️ المفتاح يعمل لكن الاستجابة غير متوقعة`);
            }
          } catch (error) {
            console.log(`   ❌ المفتاح لا يعمل: ${error.message}`);
          }
        }
        
        console.log('   ' + '─'.repeat(40));
      }
    }

    // 2. فحص إعدادات AI للشركات
    console.log('\n2️⃣ فحص إعدادات AI للشركات:');
    console.log('═'.repeat(50));
    
    const aiSettings = await prisma.aiSettings.findMany({
      include: {
        company: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (aiSettings.length === 0) {
      console.log('❌ لا توجد إعدادات AI للشركات');
    } else {
      console.log(`📊 إجمالي إعدادات AI: ${aiSettings.length}\n`);
      
      aiSettings.forEach((setting, index) => {
        console.log(`${index + 1}. ⚙️ إعدادات شركة: ${setting.company?.name || 'غير محدد'}`);
        console.log(`   📧 الإيميل: ${setting.company?.email || 'غير محدد'}`);
        console.log(`   🤖 الرد التلقائي: ${setting.autoReplyEnabled ? 'مفعل' : 'معطل'}`);
        console.log(`   📊 عتبة الثقة: ${setting.confidenceThreshold}`);
        console.log(`   ⏱️ أقصى تأخير: ${setting.maxResponseDelay} ثانية`);
        console.log(`   🧠 النموذج: ${setting.model}`);
        console.log(`   🌡️ درجة الحرارة: ${setting.temperature}`);
        console.log(`   📝 أقصى رموز: ${setting.maxTokens}`);
        console.log(`   📅 آخر تحديث: ${setting.updatedAt.toLocaleString('ar-EG')}`);
        console.log('   ' + '─'.repeat(40));
      });
    }

    // 3. فحص آخر تفاعلات AI
    console.log('\n3️⃣ فحص آخر تفاعلات AI:');
    console.log('═'.repeat(50));
    
    const recentInteractions = await prisma.aiInteraction.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        company: {
          select: {
            name: true
          }
        },
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (recentInteractions.length === 0) {
      console.log('❌ لا توجد تفاعلات AI حديثة');
    } else {
      console.log(`📊 آخر ${recentInteractions.length} تفاعلات AI:\n`);
      
      recentInteractions.forEach((interaction, index) => {
        const customerName = `${interaction.customer?.firstName || ''} ${interaction.customer?.lastName || ''}`.trim() || 'غير محدد';
        console.log(`${index + 1}. 🤖 تفاعل AI`);
        console.log(`   🏢 الشركة: ${interaction.company?.name || 'غير محدد'}`);
        console.log(`   👤 العميل: ${customerName}`);
        console.log(`   💬 رسالة العميل: "${interaction.userMessage.substring(0, 50)}..."`);
        console.log(`   🤖 رد AI: "${interaction.aiResponse.substring(0, 50)}..."`);
        console.log(`   🎯 النية: ${interaction.intent || 'غير محدد'}`);
        console.log(`   😊 المشاعر: ${interaction.sentiment || 'غير محدد'}`);
        console.log(`   📊 الثقة: ${interaction.confidence || 'غير محدد'}`);
        console.log(`   🚨 يحتاج تدخل بشري: ${interaction.requiresHumanIntervention ? 'نعم' : 'لا'}`);
        console.log(`   📅 التاريخ: ${interaction.createdAt.toLocaleString('ar-EG')}`);
        console.log('   ' + '─'.repeat(40));
      });
    }

    // 4. فحص الرسائل الحديثة بدون رد AI
    console.log('\n4️⃣ فحص الرسائل بدون رد AI:');
    console.log('═'.repeat(50));
    
    const messagesWithoutAI = await prisma.message.findMany({
      where: {
        isFromCustomer: true,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
        }
      },
      include: {
        conversation: {
          include: {
            company: {
              select: {
                name: true
              }
            },
            customer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`📊 رسائل العملاء في آخر 24 ساعة: ${messagesWithoutAI.length}\n`);
    
    if (messagesWithoutAI.length > 0) {
      messagesWithoutAI.forEach((message, index) => {
        const customerName = `${message.conversation.customer?.firstName || ''} ${message.conversation.customer?.lastName || ''}`.trim() || 'غير محدد';
        console.log(`${index + 1}. 📝 رسالة عميل`);
        console.log(`   🏢 الشركة: ${message.conversation.company?.name || 'غير محدد'}`);
        console.log(`   👤 العميل: ${customerName}`);
        console.log(`   💬 المحتوى: "${message.content.substring(0, 80)}..."`);
        console.log(`   📅 التاريخ: ${message.createdAt.toLocaleString('ar-EG')}`);
        console.log('   ' + '─'.repeat(40));
      });
    }

    // 5. ملخص الحالة
    console.log('\n📊 ملخص حالة الذكاء الاصطناعي:');
    console.log('═'.repeat(60));
    
    const activeGeminiKeys = geminiKeys.filter(k => k.isActive).length;
    const enabledAISettings = aiSettings.filter(s => s.autoReplyEnabled).length;
    const recentAIActivity = recentInteractions.length;
    
    console.log(`🔑 مفاتيح Gemini النشطة: ${activeGeminiKeys}/${geminiKeys.length}`);
    console.log(`⚙️ إعدادات AI المفعلة: ${enabledAISettings}/${aiSettings.length}`);
    console.log(`🤖 تفاعلات AI حديثة: ${recentAIActivity}`);
    console.log(`📝 رسائل عملاء حديثة: ${messagesWithoutAI.length}`);

    if (activeGeminiKeys === 0) {
      console.log('\n❌ مشكلة: لا توجد مفاتيح Gemini نشطة');
    } else if (enabledAISettings === 0) {
      console.log('\n⚠️ تحذير: لا توجد إعدادات AI مفعلة للشركات');
    } else if (recentAIActivity === 0 && messagesWithoutAI.length > 0) {
      console.log('\n⚠️ مشكلة محتملة: يوجد رسائل عملاء لكن لا توجد تفاعلات AI');
    } else {
      console.log('\n✅ الذكاء الاصطناعي يعمل بشكل طبيعي');
    }

  } catch (error) {
    console.error('❌ خطأ في فحص الذكاء الاصطناعي:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريپت
checkAIStatus();
