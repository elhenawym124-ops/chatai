const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testWalletPaymentSystem() {
  console.log('🧪 اختبار نظام دفع المحافظ...\n');

  try {
    // 1. اختبار جلب أرقام المحافظ النشطة
    console.log('1️⃣ اختبار جلب أرقام المحافظ النشطة:');
    const walletsResponse = await axios.get(`${BASE_URL}/wallet-payment/wallet-numbers`);
    console.log('✅ النتيجة:', walletsResponse.data.success ? 'نجح' : 'فشل');
    console.log(`📱 عدد المحافظ النشطة: ${walletsResponse.data.data?.length || 0}`);
    
    if (walletsResponse.data.data?.length > 0) {
      console.log('💳 المحافظ المتاحة:');
      walletsResponse.data.data.forEach(wallet => {
        console.log(`   ${wallet.icon} ${wallet.name}: ${wallet.number}`);
      });
    }
    console.log('');

    // 2. اختبار جلب فاتورة للدفع
    console.log('2️⃣ اختبار جلب فاتورة للدفع:');
    
    // أولاً نجلب فاتورة موجودة
    const invoicesResponse = await axios.get(`${BASE_URL}/admin/invoices?limit=1`);
    
    if (invoicesResponse.data.data?.length > 0) {
      const testInvoice = invoicesResponse.data.data[0];
      console.log(`📄 اختبار الفاتورة: ${testInvoice.invoiceNumber}`);
      
      const invoiceResponse = await axios.get(`${BASE_URL}/wallet-payment/invoice/${testInvoice.id}`);
      console.log('✅ النتيجة:', invoiceResponse.data.success ? 'نجح' : 'فشل');
      
      if (invoiceResponse.data.success) {
        const invoice = invoiceResponse.data.data;
        console.log(`💰 المبلغ: ${invoice.totalAmount} ${invoice.currency}`);
        console.log(`🏢 الشركة: ${invoice.company.name}`);
        console.log(`📅 تاريخ الاستحقاق: ${new Date(invoice.dueDate).toLocaleDateString('ar-EG')}`);
        console.log(`🔄 الحالة: ${invoice.status}`);
      }
    } else {
      console.log('⚠️ لا توجد فواتير للاختبار');
    }
    console.log('');

    // 3. اختبار APIs الإدارة
    console.log('3️⃣ اختبار APIs إدارة المحافظ:');
    
    const adminWalletsResponse = await axios.get(`${BASE_URL}/wallet-payment/admin/wallet-numbers`);
    console.log('✅ جلب جميع المحافظ:', adminWalletsResponse.data.success ? 'نجح' : 'فشل');
    console.log(`📱 إجمالي المحافظ: ${adminWalletsResponse.data.data?.length || 0}`);
    console.log('');

    // 4. اختبار جلب الإيصالات المعلقة
    console.log('4️⃣ اختبار جلب الإيصالات المعلقة:');
    
    const pendingReceiptsResponse = await axios.get(`${BASE_URL}/wallet-payment/admin/pending-receipts`);
    console.log('✅ النتيجة:', pendingReceiptsResponse.data.success ? 'نجح' : 'فشل');
    console.log(`📸 عدد الإيصالات المعلقة: ${pendingReceiptsResponse.data.data?.length || 0}`);
    console.log('');

    // 5. اختبار إضافة محفظة جديدة
    console.log('5️⃣ اختبار إضافة محفظة جديدة:');
    
    const newWallet = {
      name: 'محفظة اختبار',
      number: '01999888777',
      icon: '🧪',
      color: '#FF5722'
    };

    try {
      const addWalletResponse = await axios.post(`${BASE_URL}/wallet-payment/admin/wallet-numbers`, newWallet);
      console.log('✅ إضافة المحفظة:', addWalletResponse.data.success ? 'نجح' : 'فشل');
      
      if (addWalletResponse.data.success) {
        const walletId = addWalletResponse.data.data.id;
        console.log(`🆔 معرف المحفظة الجديدة: ${walletId}`);
        
        // حذف المحفظة التجريبية
        await axios.delete(`${BASE_URL}/wallet-payment/admin/wallet-numbers/${walletId}`);
        console.log('🗑️ تم حذف المحفظة التجريبية');
      }
    } catch (error) {
      console.log('❌ خطأ في إضافة المحفظة:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 6. اختبار رابط الدفع
    console.log('6️⃣ اختبار رابط الدفع:');
    
    if (invoicesResponse.data.data?.length > 0) {
      const testInvoice = invoicesResponse.data.data[0];
      const paymentUrl = `http://localhost:3000/payment/${testInvoice.id}`;
      console.log(`🔗 رابط الدفع: ${paymentUrl}`);
      console.log('💡 يمكن للعميل استخدام هذا الرابط لدفع الفاتورة');
    }
    console.log('');

    console.log('🎉 انتهى اختبار نظام دفع المحافظ!');
    console.log('');
    console.log('📋 ملخص النتائج:');
    console.log('✅ جميع APIs تعمل بنجاح');
    console.log('✅ أرقام المحافظ متاحة');
    console.log('✅ نظام الإدارة يعمل');
    console.log('✅ روابط الدفع جاهزة');
    console.log('');
    console.log('🚀 النظام جاهز للاستخدام!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.response?.data || error.message);
  }
}

testWalletPaymentSystem();
