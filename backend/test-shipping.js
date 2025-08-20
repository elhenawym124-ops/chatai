const { PrismaClient } = require('@prisma/client');
const ragService = require('./src/services/ragService');
const aiAgentService = require('./src/services/aiAgentService');

const prisma = new PrismaClient();

async function testShippingSystem() {
  try {
    console.log('🚚 فحص نظام الشحن...\n');
    
    // 1. فحص قاعدة البيانات
    console.log('1️⃣ فحص قاعدة البيانات:');
    console.log('='.repeat(50));
    
    // فحص الأسئلة الشائعة
    const faqs = await prisma.fAQ.findMany();
    console.log('عدد الأسئلة الشائعة:', faqs.length);
    
    let shippingFAQs = 0;
    faqs.forEach((faq, index) => {
      const hasShipping = faq.question.includes('شحن') || faq.answer.includes('شحن') || 
                         faq.question.includes('توصيل') || faq.answer.includes('توصيل');
      
      if (hasShipping) {
        shippingFAQs++;
        console.log(`\n🚚 سؤال شحن ${shippingFAQs}:`);
        console.log('السؤال:', faq.question);
        console.log('الإجابة:', faq.answer);
      }
    });
    
    // فحص السياسات
    const policies = await prisma.companyPolicy.findMany();
    console.log('\nعدد السياسات:', policies.length);
    
    let shippingPolicies = 0;
    policies.forEach((policy, index) => {
      const hasShipping = policy.content.includes('شحن') || policy.content.includes('توصيل');
      
      if (hasShipping) {
        shippingPolicies++;
        console.log(`\n🚚 سياسة شحن ${shippingPolicies}:`);
        console.log('النوع:', policy.type);
        console.log('العنوان:', policy.title);
        console.log('المحتوى:', policy.content);
      }
    });
    
    console.log(`\n📊 ملخص قاعدة البيانات:`);
    console.log(`- أسئلة شائعة عن الشحن: ${shippingFAQs}`);
    console.log(`- سياسات شحن: ${shippingPolicies}`);
    
    // 2. فحص RAG
    console.log('\n2️⃣ فحص RAG:');
    console.log('='.repeat(50));
    
    await ragService.ensureInitialized();
    
    const shippingQueries = [
      'ايه تكلفة الشحن؟',
      'كام الشحن؟',
      'الشحن بكام؟',
      'معلومات عن التوصيل'
    ];
    
    for (const query of shippingQueries) {
      console.log(`\n🔍 اختبار: "${query}"`);
      
      const intent = aiAgentService.analyzeIntent(query);
      console.log('النية المكتشفة:', intent);
      
      const ragResults = await ragService.retrieveRelevantData(query, intent);
      console.log('عدد نتائج RAG:', ragResults.length);
      
      ragResults.forEach((result, index) => {
        console.log(`نتيجة ${index + 1}: ${result.type} - ${result.content.substring(0, 100)}...`);
      });
    }
    
    // 3. اختبار رد كامل
    console.log('\n3️⃣ اختبار رد كامل:');
    console.log('='.repeat(50));
    
    const testData = {
      conversationId: 'test-shipping',
      senderId: 'test-user-shipping',
      content: 'ايه تكلفة الشحن؟',
      customerData: {
        id: 'test-user-shipping',
        name: 'مختبر الشحن',
        phone: '01234567890',
        orderCount: 0
      }
    };
    
    const response = await aiAgentService.processCustomerMessage(testData);
    
    console.log('نجح المعالجة:', response.success);
    console.log('النية:', response.intent);
    console.log('استخدم RAG:', response.ragDataUsed);
    console.log('الرد:', response.content);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error('التفاصيل:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testShippingSystem();
