const fetch = require('node-fetch');

async function testOrdersAPI() {
  try {
    console.log('🛒 اختبار API الطلبات...\n');
    
    // اختبار 1: جلب جميع الطلبات البسيطة
    console.log('1️⃣ جلب جميع الطلبات البسيطة:');
    const response = await fetch('http://localhost:3001/api/v1/orders-new/simple');
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ تم جلب ${result.data.length} طلب`);
      
      if (result.data.length > 0) {
        console.log('\n📋 أول 5 طلبات:');
        result.data.slice(0, 5).forEach((order, index) => {
          console.log(`${index + 1}. ${order.orderNumber}`);
          console.log(`   العميل: ${order.customerName}`);
          console.log(`   المنتج: ${order.items[0]?.name || 'غير محدد'}`);
          console.log(`   المجموع: ${order.total} جنيه`);
          console.log(`   الحالة: ${order.status}`);
          console.log(`   التاريخ: ${new Date(order.createdAt).toLocaleString('ar-EG')}`);
          console.log('   ---');
        });
        
        // تحليل الطلبات
        console.log('\n📊 تحليل الطلبات:');
        
        // حسب الحالة
        const statusCounts = {};
        result.data.forEach(order => {
          statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });
        console.log('حسب الحالة:', statusCounts);
        
        // حسب المصدر
        const sourceCounts = {};
        result.data.forEach(order => {
          const source = order.items[0]?.metadata?.source || 'unknown';
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });
        console.log('حسب المصدر:', sourceCounts);
        
        // إجمالي المبيعات
        const totalSales = result.data.reduce((sum, order) => sum + order.total, 0);
        console.log(`إجمالي المبيعات: ${totalSales} جنيه`);
        
        // متوسط قيمة الطلب
        const avgOrderValue = totalSales / result.data.length;
        console.log(`متوسط قيمة الطلب: ${avgOrderValue.toFixed(2)} جنيه`);
        
        // الطلبات من الذكاء الاصطناعي
        const aiOrders = result.data.filter(order => 
          order.items[0]?.metadata?.source === 'ai_agent'
        );
        console.log(`طلبات الذكاء الاصطناعي: ${aiOrders.length} من ${result.data.length} (${((aiOrders.length / result.data.length) * 100).toFixed(1)}%)`);
        
      } else {
        console.log('❌ لا توجد طلبات');
      }
    } else {
      console.log('❌ فشل في جلب الطلبات:', result.message);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testOrdersAPI();
