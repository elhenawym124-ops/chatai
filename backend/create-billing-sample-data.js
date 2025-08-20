const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBillingSampleData() {
  try {
    console.log('🔄 إنشاء بيانات تجريبية لنظام الفواتير والاشتراكات...');

    // Get existing companies
    const companies = await prisma.company.findMany({
      take: 3
    });

    if (companies.length === 0) {
      console.log('❌ لا توجد شركات في قاعدة البيانات');
      return;
    }

    // Create subscriptions for companies
    const subscriptions = [];
    
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      const planTypes = ['BASIC', 'PRO', 'ENTERPRISE'];
      const prices = [2500, 7500, 15000];
      const planType = planTypes[i % planTypes.length];
      const price = prices[i % prices.length];
      
      // Calculate dates
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (30 * (i + 1))); // Different start dates
      
      const nextBillingDate = new Date(startDate);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      
      const subscription = await prisma.subscription.create({
        data: {
          companyId: company.id,
          planType,
          status: i === 0 ? 'ACTIVE' : i === 1 ? 'TRIAL' : 'ACTIVE',
          startDate,
          nextBillingDate,
          billingCycle: 'monthly',
          price,
          currency: 'EGP',
          autoRenew: true,
          trialEndDate: i === 1 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
        }
      });
      
      subscriptions.push(subscription);
      console.log(`✅ تم إنشاء اشتراك ${planType} للشركة: ${company.name}`);
    }

    // Create invoices for subscriptions
    const invoices = [];
    
    for (let i = 0; i < subscriptions.length; i++) {
      const subscription = subscriptions[i];
      const company = companies[i];
      
      // Create multiple invoices for each subscription
      for (let j = 0; j < 3; j++) {
        const issueDate = new Date();
        issueDate.setMonth(issueDate.getMonth() - j);
        
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 30);
        
        const invoiceNumber = `INV-${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-6)}${i}${j}`;
        
        const subtotal = subscription.price;
        const taxAmount = subtotal * 0.14; // 14% VAT
        const totalAmount = subtotal + taxAmount;
        
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber,
            companyId: company.id,
            subscriptionId: subscription.id,
            type: 'SUBSCRIPTION',
            status: j === 0 ? 'PAID' : j === 1 ? 'SENT' : 'DRAFT',
            issueDate,
            dueDate,
            paidDate: j === 0 ? new Date(issueDate.getTime() + 5 * 24 * 60 * 60 * 1000) : null,
            subtotal,
            taxAmount,
            discountAmount: 0,
            totalAmount,
            currency: 'EGP',
            paymentTerms: 'Net 30',
            notes: `فاتورة اشتراك ${subscription.planType} - الشهر ${j + 1}`,
            items: {
              create: [
                {
                  description: `اشتراك ${subscription.planType} - شهري`,
                  quantity: 1,
                  unitPrice: subscription.price,
                  totalPrice: subscription.price
                }
              ]
            }
          }
        });
        
        invoices.push(invoice);
        console.log(`✅ تم إنشاء فاتورة ${invoiceNumber} للشركة: ${company.name}`);
      }
    }

    // Create payments for paid invoices
    const paidInvoices = invoices.filter((_, index) => index % 3 === 0); // Every third invoice is paid
    
    for (let i = 0; i < paidInvoices.length; i++) {
      const invoice = paidInvoices[i];
      const company = companies[i % companies.length];
      
      const paymentNumber = `PAY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-6)}${i}`;
      
      const payment = await prisma.payment.create({
        data: {
          paymentNumber,
          companyId: company.id,
          invoiceId: invoice.id,
          subscriptionId: invoice.subscriptionId,
          amount: invoice.totalAmount,
          currency: 'EGP',
          status: 'COMPLETED',
          method: i % 2 === 0 ? 'BANK_TRANSFER' : 'CREDIT_CARD',
          gateway: i % 2 === 0 ? null : 'stripe',
          transactionId: `TXN_${Date.now()}_${i}`,
          paidAt: new Date(invoice.issueDate.getTime() + 5 * 24 * 60 * 60 * 1000),
          metadata: {
            notes: 'دفعة اشتراك شهري'
          }
        }
      });
      
      console.log(`✅ تم إنشاء مدفوعة ${paymentNumber} للفاتورة: ${invoice.invoiceNumber}`);
    }

    console.log('\n🎉 تم إنشاء جميع البيانات التجريبية بنجاح!');
    console.log(`📊 الإحصائيات:`);
    console.log(`- الاشتراكات: ${subscriptions.length}`);
    console.log(`- الفواتير: ${invoices.length}`);
    console.log(`- المدفوعات: ${paidInvoices.length}`);

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createBillingSampleData();
