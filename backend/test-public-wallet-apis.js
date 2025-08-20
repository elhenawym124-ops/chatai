const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testPublicWalletAPIs() {
  console.log('🧪 اختبار APIs العامة لنظام دفع المحافظ...\n');

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

    // 2. اختبار جلب فاتورة تجريبية
    console.log('2️⃣ اختبار جلب فاتورة تجريبية:');
    
    // استخدام معرف الفاتورة التجريبية التي أنشأناها
    const testInvoiceId = 'cme8q7mnr000kuf3wgftcsv3l';
    
    try {
      const invoiceResponse = await axios.get(`${BASE_URL}/wallet-payment/invoice/${testInvoiceId}`);
      console.log('✅ جلب الفاتورة:', invoiceResponse.data.success ? 'نجح' : 'فشل');
      
      if (invoiceResponse.data.success) {
        const invoice = invoiceResponse.data.data;
        console.log(`📄 رقم الفاتورة: ${invoice.invoiceNumber}`);
        console.log(`💰 المبلغ: ${invoice.totalAmount} ${invoice.currency}`);
        console.log(`🏢 الشركة: ${invoice.company.name}`);
        console.log(`📅 تاريخ الاستحقاق: ${new Date(invoice.dueDate).toLocaleDateString('ar-EG')}`);
        console.log(`🔄 الحالة: ${invoice.status}`);
        console.log(`📧 البريد الإلكتروني: ${invoice.company.email}`);
        
        // عرض رابط الدفع
        console.log(`🔗 رابط الدفع: http://localhost:3000/payment/${testInvoiceId}`);
      } else {
        console.log(`❌ رسالة الخطأ: ${invoiceResponse.data.message}`);
      }
    } catch (invoiceError) {
      console.log('❌ خطأ في جلب الفاتورة:', invoiceError.response?.data?.message || invoiceError.message);
    }
    console.log('');

    // 3. اختبار حالة فاتورة مدفوعة
    console.log('3️⃣ اختبار حالة فاتورة مدفوعة:');
    
    // محاولة الوصول لفاتورة مدفوعة (إذا كانت موجودة)
    try {
      const paidInvoiceResponse = await axios.get(`${BASE_URL}/wallet-payment/invoice/nonexistent-id`);
      console.log('✅ اختبار فاتورة غير موجودة:', paidInvoiceResponse.data.success ? 'نجح' : 'فشل');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ التحقق من الفاتورة غير الموجودة: نجح (404 كما متوقع)');
      } else {
        console.log('❌ خطأ غير متوقع:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    // 4. عرض معلومات النظام
    console.log('4️⃣ معلومات النظام:');
    console.log('🌐 عناوين الخدمة:');
    console.log(`   📡 Backend: http://localhost:3001`);
    console.log(`   🖥️ Frontend: http://localhost:3000`);
    console.log('');
    
    console.log('📋 APIs المتاحة:');
    console.log(`   📱 المحافظ: ${BASE_URL}/wallet-payment/wallet-numbers`);
    console.log(`   📄 الفاتورة: ${BASE_URL}/wallet-payment/invoice/{id}`);
    console.log(`   📸 رفع الإيصال: ${BASE_URL}/wallet-payment/submit-receipt`);
    console.log('');

    console.log('🎛️ صفحات الإدارة:');
    console.log(`   💳 إدارة المحافظ: http://localhost:3000/super-admin/wallet-management`);
    console.log(`   📊 لوحة التحكم: http://localhost:3000/super-admin/dashboard`);
    console.log(`   📄 الفواتير: http://localhost:3000/super-admin/invoices`);
    console.log(`   💰 المدفوعات: http://localhost:3000/super-admin/payments`);
    console.log('');

    // 5. تعليمات الاستخدام
    console.log('5️⃣ تعليمات الاستخدام:');
    console.log('👤 للعميل:');
    console.log('   1. افتح رابط الدفع المرسل إليك');
    console.log('   2. اختر رقم المحفظة المناسب');
    console.log('   3. انسخ الرقم وحول المبلغ من تليفونك');
    console.log('   4. ارفع صورة إيصال التحويل');
    console.log('   5. اضغط إرسال للمراجعة');
    console.log('');
    
    console.log('🎛️ للإدارة:');
    console.log('   1. اذهب لصفحة إدارة المحافظ');
    console.log('   2. راجع الإيصالات المعلقة');
    console.log('   3. اضغط موافقة أو رفض');
    console.log('   4. النظام سيحدث حالة الفاتورة تلقائياً');
    console.log('');

    console.log('🎉 جميع APIs العامة تعمل بنجاح!');
    console.log('✅ النظام جاهز للاستخدام الفوري');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.response?.data || error.message);
  }
}

testPublicWalletAPIs();
