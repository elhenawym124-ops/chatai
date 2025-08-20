const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestPaymentLink() {
  console.log('🔗 إنشاء رابط دفع تجريبي...\n');

  try {
    // البحث عن فاتورة غير مدفوعة
    const unpaidInvoice = await prisma.invoice.findFirst({
      where: {
        status: {
          not: 'PAID'
        }
      },
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

    if (!unpaidInvoice) {
      console.log('⚠️ لا توجد فواتير غير مدفوعة');
      
      // إنشاء فاتورة تجريبية
      console.log('📄 إنشاء فاتورة تجريبية...');
      
      const company = await prisma.company.findFirst();
      if (!company) {
        console.log('❌ لا توجد شركات في النظام');
        return;
      }

      const testInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-TEST-${Date.now()}`,
          companyId: company.id,
          status: 'PENDING',
          type: 'SUBSCRIPTION',
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // أسبوع من الآن
          subtotal: 5000,
          taxAmount: 750,
          discountAmount: 0,
          totalAmount: 5750,
          currency: 'EGP',
          notes: 'فاتورة تجريبية لاختبار نظام الدفع بالمحافظ',
          paymentTerms: 'Net 7'
        },
        include: {
          company: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      console.log('✅ تم إنشاء فاتورة تجريبية');
      console.log(`📄 رقم الفاتورة: ${testInvoice.invoiceNumber}`);
      console.log(`🏢 الشركة: ${testInvoice.company.name}`);
      console.log(`💰 المبلغ: ${testInvoice.totalAmount} ${testInvoice.currency}`);
      console.log(`📅 تاريخ الاستحقاق: ${testInvoice.dueDate.toLocaleDateString('ar-EG')}`);
      console.log('');

      // إنشاء رابط الدفع
      const paymentUrl = `http://localhost:3000/payment/${testInvoice.id}`;
      console.log('🔗 رابط الدفع التجريبي:');
      console.log(`${paymentUrl}`);
      console.log('');
      console.log('📋 تعليمات الاختبار:');
      console.log('1. افتح الرابط أعلاه في المتصفح');
      console.log('2. اختر رقم محفظة من القائمة');
      console.log('3. انسخ الرقم وقم بتحويل وهمي');
      console.log('4. ارفع صورة إيصال (أي صورة للاختبار)');
      console.log('5. اضغط إرسال للمراجعة');
      console.log('6. اذهب لصفحة الإدارة لمراجعة الإيصال');
      console.log('');
      console.log('🎛️ رابط صفحة الإدارة:');
      console.log('http://localhost:3000/super-admin/wallet-management');

    } else {
      console.log('✅ تم العثور على فاتورة غير مدفوعة');
      console.log(`📄 رقم الفاتورة: ${unpaidInvoice.invoiceNumber}`);
      console.log(`🏢 الشركة: ${unpaidInvoice.company.name}`);
      console.log(`💰 المبلغ: ${unpaidInvoice.totalAmount} ${unpaidInvoice.currency}`);
      console.log(`📅 تاريخ الاستحقاق: ${unpaidInvoice.dueDate.toLocaleDateString('ar-EG')}`);
      console.log(`🔄 الحالة: ${unpaidInvoice.status}`);
      console.log('');

      // إنشاء رابط الدفع
      const paymentUrl = `http://localhost:3000/payment/${unpaidInvoice.id}`;
      console.log('🔗 رابط الدفع:');
      console.log(`${paymentUrl}`);
      console.log('');
      console.log('📋 تعليمات الاختبار:');
      console.log('1. افتح الرابط أعلاه في المتصفح');
      console.log('2. اختر رقم محفظة من القائمة');
      console.log('3. انسخ الرقم وقم بتحويل وهمي');
      console.log('4. ارفع صورة إيصال (أي صورة للاختبار)');
      console.log('5. اضغط إرسال للمراجعة');
      console.log('6. اذهب لصفحة الإدارة لمراجعة الإيصال');
      console.log('');
      console.log('🎛️ رابط صفحة الإدارة:');
      console.log('http://localhost:3000/super-admin/wallet-management');
    }

    console.log('');
    console.log('💳 أرقام المحافظ المتاحة:');
    
    const walletNumbers = await prisma.walletNumber.findMany({
      where: { isActive: true }
    });

    walletNumbers.forEach(wallet => {
      console.log(`   ${wallet.icon} ${wallet.name}: ${wallet.number}`);
    });

    console.log('');
    console.log('🎉 رابط الدفع جاهز للاختبار!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء رابط الدفع:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPaymentLink();
