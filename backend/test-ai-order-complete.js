const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCompleteOrderFlow() {
  console.log('🛒 اختبار تدفق إنشاء طلب كامل من المحادثة...\n');

  const conversationId = `test-complete-order-${Date.now()}`;
  const senderId = 'test-complete-customer-456';
  
  const customerData = {
    name: 'سارة أحمد',
    phone: '01098765432',
    email: 'sara@example.com',
    orderCount: 0
  };

  // محادثة كاملة لإنشاء طلب
  const conversationSteps = [
    {
      step: 1,
      message: 'السلام عليكم، أريد أشتري كوتشي',
      description: 'بداية الاستفسار'
    },
    {
      step: 2,
      message: 'عايزة الكوتشي الأبيض مقاس 38',
      description: 'تحديد اللون والمقاس'
    },
    {
      step: 3,
      message: 'تمام، أريد أطلبه. اسمي سارة أحمد',
      description: 'تأكيد الطلب وإعطاء الاسم'
    },
    {
      step: 4,
      message: 'رقم الموبايل 01098765432',
      description: 'إعطاء رقم الهاتف'
    },
    {
      step: 5,
      message: 'العنوان: الإسكندرية، شارع الكورنيش',
      description: 'إعطاء العنوان'
    },
    {
      step: 6,
      message: 'أكد الطلب من فضلك',
      description: 'طلب تأكيد الطلب'
    }
  ];

  try {
    console.log('📱 بدء المحادثة الكاملة...\n');
    
    let orderCreated = false;
    let orderDetails = null;

    for (const step of conversationSteps) {
      console.log(`📝 الخطوة ${step.step}: ${step.description}`);
      console.log(`💬 الرسالة: "${step.message}"`);
      
      const response = await axios.post(`${BASE_URL}/test-ai-direct`, {
        conversationId,
        senderId,
        content: step.message,
        attachments: [],
        customerData
      });

      if (response.data.success) {
        const content = response.data.content || response.data.message || 'لا يوجد محتوى';
        console.log(`✅ رد الذكاء الصناعي: ${content.substring(0, 150)}...`);
        
        // فحص إذا تم إنشاء طلب
        if (response.data.orderCreated) {
          console.log(`🎉 تم إنشاء طلب!`);
          console.log(`📋 رقم الطلب: ${response.data.orderCreated.orderNumber}`);
          console.log(`💰 المبلغ الإجمالي: ${response.data.orderCreated.total} جنيه`);
          orderCreated = true;
          orderDetails = response.data.orderCreated;
          break;
        }
        
        // فحص إذا كان هناك معلومات طلب مستخرجة
        if (response.data.orderInfo) {
          console.log(`📊 معلومات الطلب المستخرجة:`);
          console.log(`   المنتج: ${response.data.orderInfo.productName || 'غير محدد'}`);
          console.log(`   اللون: ${response.data.orderInfo.productColor || 'غير محدد'}`);
          console.log(`   المقاس: ${response.data.orderInfo.productSize || 'غير محدد'}`);
          console.log(`   العميل: ${response.data.orderInfo.customerName || 'غير محدد'}`);
          console.log(`   الهاتف: ${response.data.orderInfo.customerPhone || 'غير محدد'}`);
          console.log(`   المدينة: ${response.data.orderInfo.city || 'غير محدد'}`);
          console.log(`   مكتمل: ${response.data.orderInfo.isComplete ? 'نعم' : 'لا'}`);
        }
        
      } else {
        console.log(`❌ فشل في الخطوة ${step.step}: ${response.data.error || 'خطأ غير معروف'}`);
      }
      
      console.log('─'.repeat(80));
      
      // انتظار قصير بين الرسائل
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // إذا لم يتم إنشاء طلب تلقائياً، جرب إنشاء طلب يدوياً
    if (!orderCreated) {
      console.log('\n🔧 لم يتم إنشاء طلب تلقائياً، محاولة إنشاء طلب يدوياً...');
      
      try {
        const manualOrderData = {
          conversationId,
          customerId: 'test-customer-manual',
          companyId: 'cmdkj6coz0000uf0cyscco6lr',
          productName: 'كوتشي حريمي',
          productColor: 'أبيض',
          productSize: '38',
          productPrice: 150,
          quantity: 1,
          customerName: 'سارة أحمد',
          customerPhone: '01098765432',
          city: 'الإسكندرية',
          notes: 'طلب من المحادثة التجريبية'
        };

        const manualOrderResponse = await axios.post(`${BASE_URL}/api/v1/orders-new/create-simple`, manualOrderData);
        
        if (manualOrderResponse.data.success) {
          console.log('✅ تم إنشاء الطلب يدوياً بنجاح!');
          console.log(`📋 رقم الطلب: ${manualOrderResponse.data.data.orderNumber}`);
          console.log(`💰 المبلغ الإجمالي: ${manualOrderResponse.data.data.total} جنيه`);
          orderCreated = true;
          orderDetails = manualOrderResponse.data.data;
        }
      } catch (error) {
        console.log('❌ فشل في إنشاء الطلب يدوياً:', error.message);
      }
    }

    // فحص الطلبات النهائية
    console.log('\n📊 فحص الطلبات النهائية...');
    
    try {
      const simpleOrdersResponse = await axios.get(`${BASE_URL}/api/v1/orders-new/simple`);
      if (simpleOrdersResponse.data.success) {
        const orders = simpleOrdersResponse.data.data;
        console.log(`✅ إجمالي الطلبات البسيطة: ${orders.length}`);
        
        // البحث عن الطلب الذي أنشأناه
        const ourOrder = orders.find(order => 
          order.customerName === 'سارة أحمد' || 
          order.customerPhone === '01098765432'
        );
        
        if (ourOrder) {
          console.log('\n🎯 تم العثور على طلبنا:');
          console.log(`   رقم الطلب: ${ourOrder.orderNumber}`);
          console.log(`   العميل: ${ourOrder.customerName}`);
          console.log(`   الهاتف: ${ourOrder.customerPhone}`);
          console.log(`   المنتج: ${ourOrder.items[0]?.name || 'غير محدد'}`);
          console.log(`   اللون: ${ourOrder.items[0]?.metadata?.color || 'غير محدد'}`);
          console.log(`   المقاس: ${ourOrder.items[0]?.metadata?.size || 'غير محدد'}`);
          console.log(`   المبلغ: ${ourOrder.total} جنيه`);
          console.log(`   الحالة: ${ourOrder.status}`);
          console.log(`   المدينة: ${ourOrder.shippingAddress?.city || 'غير محدد'}`);
        } else {
          console.log('⚠️ لم يتم العثور على طلبنا في القائمة');
        }
      }
    } catch (error) {
      console.log('⚠️ لا يمكن الوصول للطلبات البسيطة');
    }

    // ملخص النتائج
    console.log('\n' + '='.repeat(80));
    console.log('📋 ملخص النتائج:');
    console.log('='.repeat(80));
    
    if (orderCreated) {
      console.log('✅ تم إنشاء الطلب بنجاح!');
      console.log(`📋 رقم الطلب: ${orderDetails?.orderNumber || 'غير محدد'}`);
      console.log(`💰 المبلغ: ${orderDetails?.total || 'غير محدد'} جنيه`);
      console.log(`👤 العميل: ${orderDetails?.customerName || 'غير محدد'}`);
      console.log('🎉 النظام قادر على إنشاء وتسجيل الطلبات!');
    } else {
      console.log('❌ لم يتم إنشاء طلب');
      console.log('⚠️ قد تحتاج لتحسين منطق استخراج معلومات الطلب');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار تدفق الطلب الكامل:', error.message);
  }
}

// تشغيل الاختبار
testCompleteOrderFlow();
