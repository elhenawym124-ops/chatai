const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testFinalOrderCreation() {
  console.log('🎯 اختبار إنشاء الطلب النهائي...\n');

  try {
    // 1. إنشاء طلب بسيط مباشرة
    console.log('📝 إنشاء طلب بسيط مباشرة...');
    const orderData = {
      conversationId: `final-test-${Date.now()}`,
      customerId: 'final-test-customer',
      companyId: 'cmdkj6coz0000uf0cyscco6lr',
      productName: 'كوتشي حريمي',
      productColor: 'أبيض',
      productSize: '40',
      productPrice: 150,
      quantity: 1,
      customerName: 'عميل نهائي',
      customerPhone: '01555666777',
      city: 'القاهرة',
      notes: 'طلب اختبار نهائي'
    };

    const response = await axios.post(`${BASE_URL}/api/v1/orders-new/create-simple`, orderData);
    
    if (response.data.success) {
      console.log('✅ تم إنشاء الطلب بنجاح!');
      console.log(`📋 رقم الطلب: ${response.data.data.orderNumber}`);
      console.log(`💰 المبلغ الإجمالي: ${response.data.data.total} جنيه`);
      console.log(`👤 العميل: ${response.data.data.customerName}`);
      console.log(`📱 الهاتف: ${response.data.data.customerPhone}`);
      console.log(`🏙️ المدينة: ${response.data.data.shippingAddress.city}`);
      console.log(`📅 تاريخ الإنشاء: ${new Date(response.data.data.createdAt).toLocaleString('ar-EG')}`);
      
      // 2. فحص الطلب المحفوظ
      console.log('\n📊 فحص الطلب المحفوظ...');
      const orderNumber = response.data.data.orderNumber;
      
      try {
        const allOrdersResponse = await axios.get(`${BASE_URL}/api/v1/orders-new/simple`);
        if (allOrdersResponse.data.success) {
          const orders = allOrdersResponse.data.data;
          const ourOrder = orders.find(order => order.orderNumber === orderNumber);
          
          if (ourOrder) {
            console.log('✅ تم العثور على الطلب في النظام:');
            console.log(`   رقم الطلب: ${ourOrder.orderNumber}`);
            console.log(`   العميل: ${ourOrder.customerName}`);
            console.log(`   المنتج: ${ourOrder.items[0]?.name}`);
            console.log(`   اللون: ${ourOrder.items[0]?.metadata?.color}`);
            console.log(`   المقاس: ${ourOrder.items[0]?.metadata?.size}`);
            console.log(`   المبلغ: ${ourOrder.total} جنيه`);
            console.log(`   الحالة: ${ourOrder.status}`);
          } else {
            console.log('❌ لم يتم العثور على الطلب في النظام');
          }
        }
      } catch (error) {
        console.log('⚠️ خطأ في فحص الطلبات:', error.message);
      }
      
      // 3. اختبار تحديث حالة الطلب
      console.log('\n🔄 اختبار تحديث حالة الطلب...');
      try {
        const updateResponse = await axios.patch(`${BASE_URL}/api/v1/orders-new/${orderNumber}/status`, {
          status: 'CONFIRMED',
          notes: 'تم تأكيد الطلب من الاختبار النهائي'
        });
        
        if (updateResponse.data.success) {
          console.log(`✅ تم تحديث حالة الطلب إلى CONFIRMED`);
        } else {
          console.log(`❌ فشل في تحديث حالة الطلب: ${updateResponse.data.message}`);
        }
      } catch (error) {
        console.log('⚠️ خطأ في تحديث حالة الطلب:', error.message);
      }
      
    } else {
      console.log('❌ فشل في إنشاء الطلب:', response.data.message);
    }

    // 4. إحصائيات نهائية
    console.log('\n📈 إحصائيات النظام النهائية...');
    
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/v1/orders-new/simple`);
      if (statsResponse.data.success) {
        const orders = statsResponse.data.data;
        console.log(`✅ إجمالي الطلبات في النظام: ${orders.length}`);
        
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        });
        
        console.log(`📅 طلبات اليوم: ${todayOrders.length}`);
        
        const totalValue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        console.log(`💰 إجمالي قيمة الطلبات: ${totalValue} جنيه`);
        
        const statusCounts = orders.reduce((counts, order) => {
          counts[order.status] = (counts[order.status] || 0) + 1;
          return counts;
        }, {});
        
        console.log('📊 توزيع حالات الطلبات:');
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`   ${status}: ${count} طلب`);
        });
      }
    } catch (error) {
      console.log('⚠️ خطأ في جلب الإحصائيات:', error.message);
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار إنشاء الطلب النهائي:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testFinalOrderCreation();
