const { PrismaClient } = require('@prisma/client');
const AIAgentService = require('./src/services/aiAgentService');
const SimpleOrderService = require('./src/services/simpleOrderService');

const prisma = new PrismaClient();

async function testImprovedExtraction() {
  try {
    console.log('🧪 اختبار النظام المحسن لاستخراج معلومات الطلبات...\n');
    
    const aiAgent = new AIAgentService();
    const simpleOrderService = new SimpleOrderService();
    
    // محاكاة محادثة حقيقية
    const mockConversation = [
      {
        userMessage: 'عايزه اعرف سعر الكوتشي كام؟',
        aiResponse: 'سعر كوتشي الاسكوتش 349 جنيه. متوفر منه ألوان كتير زي الأسود والبيج والأبيض.'
      },
      {
        userMessage: 'عايزه اسود مقاس 38',
        aiResponse: 'تمام! كوتشي الاسكوتش أسود مقاس 38. السعر 349 جنيه. محافظتك إيه عشان أحسب الشحن؟'
      },
      {
        userMessage: 'القاهرة',
        aiResponse: 'الشحن للقاهرة 50 جنيه. الإجمالي 399 جنيه. تحبي تأكدي الطلب؟'
      },
      {
        userMessage: 'اسمي فاطمة أحمد ورقمي 01012345678',
        aiResponse: 'تمام يا فاطمة! تم تسجيل بياناتك. تحبي تأكدي الطلب؟'
      },
      {
        userMessage: 'أيوه أكد الطلب',
        aiResponse: 'تم تأكيد طلبك بنجاح! سيتم التوصيل خلال 3-5 أيام عمل.'
      }
    ];
    
    console.log('📝 محاكاة المحادثة:');
    mockConversation.forEach((msg, index) => {
      console.log(`${index + 1}. العميل: ${msg.userMessage}`);
      console.log(`   الرد: ${msg.aiResponse.substring(0, 50)}...`);
    });
    
    console.log('\n🔍 استخراج التفاصيل بالنظام المحسن...');
    
    // استخراج التفاصيل
    const extractedDetails = await aiAgent.extractOrderDetailsFromMemory(mockConversation);
    
    console.log('\n✅ التفاصيل المستخرجة:');
    console.log(JSON.stringify(extractedDetails, null, 2));
    
    // إنشاء طلب تجريبي
    console.log('\n🛒 إنشاء طلب تجريبي...');
    
    const orderData = {
      conversationId: 'test-conversation-123',
      customerId: 'test-customer-456',
      companyId: 'test-company-789',
      productName: extractedDetails.productName,
      productColor: extractedDetails.productColor,
      productSize: extractedDetails.productSize,
      productPrice: extractedDetails.productPrice,
      quantity: extractedDetails.quantity,
      customerName: extractedDetails.customerName,
      customerPhone: extractedDetails.customerPhone,
      customerAddress: extractedDetails.customerAddress,
      city: extractedDetails.city,
      notes: extractedDetails.notes,
      confidence: extractedDetails.confidence
    };
    
    const orderResult = await simpleOrderService.createSimpleOrder(orderData);
    
    if (orderResult.success) {
      console.log('✅ تم إنشاء الطلب بنجاح!');
      console.log('📋 تفاصيل الطلب:');
      console.log(`   رقم الطلب: ${orderResult.order.orderNumber}`);
      console.log(`   اسم العميل: ${orderResult.order.customerName}`);
      console.log(`   المنتج: ${orderResult.order.items[0].name}`);
      console.log(`   اللون: ${orderResult.order.items[0].metadata.color}`);
      console.log(`   المقاس: ${orderResult.order.items[0].metadata.size}`);
      console.log(`   السعر: ${orderResult.order.items[0].price} جنيه`);
      console.log(`   الشحن: ${orderResult.order.shipping} جنيه`);
      console.log(`   الإجمالي: ${orderResult.order.total} جنيه`);
      console.log(`   جودة البيانات: ${orderResult.order.metadata.dataQuality.level} (${orderResult.order.metadata.dataQuality.score}%)`);
      
      // حفظ الطلب
      await simpleOrderService.saveOrderToFile(orderResult.order);
      console.log('💾 تم حفظ الطلب في ملف');
      
    } else {
      console.log('❌ فشل في إنشاء الطلب');
    }
    
    console.log('\n🎯 اختبار مقارنة مع النظام القديم...');
    
    // مقارنة مع النظام القديم (محاكاة)
    const oldSystemResult = {
      productName: 'كوتشي حريمي', // افتراضي
      productColor: 'أبيض', // افتراضي
      productSize: '37', // افتراضي
      productPrice: 100, // افتراضي
      customerName: 'عميل جديد', // افتراضي
      customerPhone: '', // فارغ
      city: 'غير محدد' // افتراضي
    };
    
    console.log('\n📊 مقارنة النتائج:');
    console.log('النظام القديم:', oldSystemResult);
    console.log('النظام الجديد:', {
      productName: extractedDetails.productName,
      productColor: extractedDetails.productColor,
      productSize: extractedDetails.productSize,
      productPrice: extractedDetails.productPrice,
      customerName: extractedDetails.customerName,
      customerPhone: extractedDetails.customerPhone,
      city: extractedDetails.city
    });
    
    // حساب التحسن
    let improvements = 0;
    let totalFields = 7;
    
    if (extractedDetails.productName !== 'كوتشي حريمي') improvements++;
    if (extractedDetails.productColor !== 'أبيض') improvements++;
    if (extractedDetails.productSize !== '37') improvements++;
    if (extractedDetails.productPrice !== 100) improvements++;
    if (extractedDetails.customerName && extractedDetails.customerName !== 'عميل جديد') improvements++;
    if (extractedDetails.customerPhone) improvements++;
    if (extractedDetails.city !== 'غير محدد') improvements++;
    
    const improvementPercentage = (improvements / totalFields) * 100;
    console.log(`\n🚀 نسبة التحسن: ${improvementPercentage.toFixed(1)}% (${improvements}/${totalFields} حقول محسنة)`);
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImprovedExtraction();
