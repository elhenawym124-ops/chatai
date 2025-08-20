const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testDirectOrderCreation() {
  console.log('🛒 اختبار إنشاء طلب مباشر...\n');

  try {
    // 1. إنشاء طلب بسيط مباشرة
    console.log('📝 إنشاء طلب بسيط...');
    const simpleOrderData = {
      conversationId: 'test-direct-order-123',
      customerId: 'test-customer-456',
      companyId: 'cmdkj6coz0000uf0cyscco6lr',
      productName: 'كوتشي حريمي',
      productColor: 'أبيض',
      productSize: '37',
      productPrice: 150,
      quantity: 1,
      customerName: 'فاطمة أحمد',
      customerPhone: '01234567890',
      city: 'القاهرة',
      notes: 'طلب تجريبي من الاختبار'
    };

    const simpleOrderResponse = await axios.post(`${BASE_URL}/api/v1/orders-new/create-simple`, simpleOrderData);
    
    if (simpleOrderResponse.data.success) {
      console.log('✅ تم إنشاء الطلب البسيط بنجاح!');
      console.log(`📋 رقم الطلب: ${simpleOrderResponse.data.data.orderNumber}`);
      console.log(`💰 المبلغ الإجمالي: ${simpleOrderResponse.data.data.total} جنيه`);
      console.log(`👤 العميل: ${simpleOrderResponse.data.data.customerName}`);
      console.log(`📱 الهاتف: ${simpleOrderResponse.data.data.customerPhone}`);
      console.log(`🏙️ المدينة: ${simpleOrderResponse.data.data.shippingAddress.city}`);
    } else {
      console.log('❌ فشل في إنشاء الطلب البسيط:', simpleOrderResponse.data.message);
    }

    console.log('\n' + '─'.repeat(60) + '\n');

    // 2. إنشاء طلب في قاعدة البيانات
    console.log('📝 إنشاء طلب في قاعدة البيانات...');
    const dbOrderData = {
      conversationId: 'test-db-order-789',
      customerId: 'cmdlrcd28003sufvk3e6h7plr', // عميل موجود
      companyId: 'cmdkj6coz0000uf0cyscco6lr',
      productName: 'كوتشي حريمي',
      productColor: 'أحمر',
      productSize: '38',
      productPrice: 150,
      quantity: 1,
      customerName: 'مريم محمد',
      customerPhone: '01098765432',
      city: 'الإسكندرية',
      notes: 'طلب من قاعدة البيانات'
    };

    const dbOrderResponse = await axios.post(`${BASE_URL}/api/v1/orders-new/create`, dbOrderData);
    
    if (dbOrderResponse.data.success) {
      console.log('✅ تم إنشاء الطلب في قاعدة البيانات بنجاح!');
      console.log(`📋 رقم الطلب: ${dbOrderResponse.data.data.orderNumber}`);
      console.log(`💰 المبلغ الإجمالي: ${dbOrderResponse.data.data.total} ${dbOrderResponse.data.data.currency}`);
      console.log(`👤 العميل: ${dbOrderResponse.data.data.customer?.firstName || 'غير محدد'}`);
      console.log(`📱 الهاتف: ${dbOrderResponse.data.data.customerPhone || 'غير محدد'}`);
      console.log(`🏙️ المدينة: ${dbOrderResponse.data.data.city || 'غير محدد'}`);
      console.log(`📅 تاريخ الإنشاء: ${new Date(dbOrderResponse.data.data.createdAt).toLocaleString('ar-EG')}`);
    } else {
      console.log('❌ فشل في إنشاء الطلب في قاعدة البيانات:', dbOrderResponse.data.message);
    }

    console.log('\n' + '─'.repeat(60) + '\n');

    // 3. فحص جميع الطلبات
    console.log('📊 فحص جميع الطلبات...');
    
    try {
      const ordersResponse = await axios.get(`${BASE_URL}/api/v1/orders-new`);
      if (ordersResponse.data.success) {
        console.log(`✅ تم العثور على ${ordersResponse.data.data.length} طلب في قاعدة البيانات:`);

        ordersResponse.data.data.slice(0, 3).forEach((order, index) => {
          console.log(`\n${index + 1}. طلب رقم: ${order.orderNumber || 'غير محدد'}`);
          console.log(`   العميل: ${order.customerName || order.customer?.firstName || 'غير محدد'}`);
          console.log(`   المبلغ: ${order.total} ${order.currency || 'جنيه'}`);
          console.log(`   الحالة: ${order.status}`);
          console.log(`   التاريخ: ${new Date(order.createdAt).toLocaleString('ar-EG')}`);
        });

        if (ordersResponse.data.data.length > 3) {
          console.log(`\n... و ${ordersResponse.data.data.length - 3} طلب آخر`);
        }
      }
    } catch (error) {
      console.log('⚠️ لا يمكن الوصول لطلبات قاعدة البيانات');
    }

    try {
      const simpleOrdersResponse = await axios.get(`${BASE_URL}/api/v1/orders-new/simple`);
      if (simpleOrdersResponse.data.success) {
        console.log(`\n✅ تم العثور على ${simpleOrdersResponse.data.data.length} طلب بسيط:`);
        
        simpleOrdersResponse.data.data.slice(0, 3).forEach((order, index) => {
          console.log(`\n${index + 1}. طلب رقم: ${order.orderNumber}`);
          console.log(`   العميل: ${order.customerName}`);
          console.log(`   المنتج: ${order.items[0]?.name || 'غير محدد'}`);
          console.log(`   المبلغ: ${order.total} جنيه`);
          console.log(`   الحالة: ${order.status}`);
        });
        
        if (simpleOrdersResponse.data.data.length > 3) {
          console.log(`\n... و ${simpleOrdersResponse.data.data.length - 3} طلب آخر`);
        }
      }
    } catch (error) {
      console.log('⚠️ لا يمكن الوصول للطلبات البسيطة');
    }

    console.log('\n' + '─'.repeat(60) + '\n');

    // 4. اختبار تحديث حالة طلب
    if (simpleOrderResponse.data.success) {
      console.log('🔄 اختبار تحديث حالة الطلب...');
      const orderNumber = simpleOrderResponse.data.data.orderNumber;
      
      try {
        const updateResponse = await axios.patch(`${BASE_URL}/api/v1/orders-new/${orderNumber}/status`, {
          status: 'CONFIRMED',
          notes: 'تم تأكيد الطلب من الاختبار'
        });
        
        if (updateResponse.data.success) {
          console.log(`✅ تم تحديث حالة الطلب ${orderNumber} إلى CONFIRMED`);
        } else {
          console.log(`❌ فشل في تحديث حالة الطلب: ${updateResponse.data.message}`);
        }
      } catch (error) {
        console.log('⚠️ لا يمكن تحديث حالة الطلب (قد يكون endpoint غير متاح)');
      }
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار إنشاء الطلبات:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testDirectOrderCreation();
