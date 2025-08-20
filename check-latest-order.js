const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkLatestOrder() {
  try {
    console.log('🔍 فحص آخر أوردر تم إنشاؤه...');
    
    const latestOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        conversation: true
      }
    });
    
    if (latestOrder) {
      console.log('📦 آخر أوردر:');
      console.log('   رقم الأوردر:', latestOrder.orderNumber);
      console.log('   معرف الشركة:', latestOrder.companyId);
      console.log('   اسم العميل:', latestOrder.customerName);
      console.log('   الهاتف:', latestOrder.customerPhone);
      console.log('   المجموع:', latestOrder.total, 'جنيه');
      console.log('   تاريخ الإنشاء:', latestOrder.createdAt);
      console.log('   الحالة:', latestOrder.status);
      
      // فحص الشركة
      const company = await prisma.company.findUnique({
        where: { id: latestOrder.companyId }
      });
      
      if (company) {
        console.log('🏢 الشركة:', company.name);
      } else {
        console.log('❌ الشركة غير موجودة!');
      }
      
      // فحص آخر 3 أوردرات للمقارنة
      console.log('\n📊 آخر 3 أوردرات:');
      const recentOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          orderNumber: true,
          companyId: true,
          customerName: true,
          total: true,
          createdAt: true
        }
      });
      
      recentOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber} - شركة: ${order.companyId} - ${order.total} جنيه`);
      });
      
    } else {
      console.log('❌ لا توجد أوردرات في قاعدة البيانات');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestOrder();
