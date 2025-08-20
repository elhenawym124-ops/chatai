const axios = require('axios');

console.log('🔍 اختبار وجود نظام Fallback الخطير...\n');

async function testFallbackExistence() {
  try {
    console.log('🧪 اختبار 1: إرسال رسالة من صفحة غير موجودة...');
    
    const webhookData = {
      object: 'page',
      entry: [{
        id: 'unknown_fake_page_12345',
        time: Date.now(),
        messaging: [{
          sender: { id: 'test_fallback_user' },
          recipient: { id: 'unknown_fake_page_12345' },
          timestamp: Date.now(),
          message: {
            mid: 'test_fallback_message',
            text: 'هل يوجد fallback؟'
          }
        }]
      }]
    };
    
    console.log('📤 إرسال طلب من صفحة غير موجودة...');
    console.log(`📱 Page ID: unknown_fake_page_12345`);
    console.log(`👤 Customer: test_fallback_user`);
    
    const response = await axios.post('http://localhost:3001/webhook', webhookData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`\n📊 Response Status: ${response.status}`);
    console.log(`📝 Response Data: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.status === 200) {
      console.log('🚨 خطر! النظام قبل الطلب من صفحة غير موجودة');
      console.log('🚨 هذا يعني أن Fallback لا يزال موجود!');
      
      // انتظار لمعالجة الرسالة
      console.log('\n⏳ انتظار 3 ثوان لمعالجة الرسالة...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('\n🔍 تحقق من اللوج للبحث عن:');
      console.log('   🚨 "Using default company"');
      console.log('   🚨 "findFirst" للشركة');
      console.log('   🚨 إنشاء عميل في شركة افتراضية');
      
      return { fallbackExists: true, test: 'unknown_page' };
    } else {
      console.log('✅ النظام رفض الطلب - لا يوجد fallback');
      return { fallbackExists: false, test: 'unknown_page' };
    }
    
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.log(`📊 Response Status: ${status}`);
      console.log(`📝 Response Data: ${JSON.stringify(data, null, 2)}`);
      
      if (status === 400 && data.code === 'COMPANY_ID_MISSING') {
        console.log('✅ ممتاز! النظام رفض الطلب بسبب عدم وجود companyId');
        console.log('✅ لا يوجد fallback خطير');
        return { fallbackExists: false, test: 'unknown_page' };
      } else {
        console.log('⚠️ رد غير متوقع');
        return { fallbackExists: 'unknown', test: 'unknown_page' };
      }
    } else {
      console.error(`❌ خطأ في الشبكة: ${error.message}`);
      return { fallbackExists: 'error', test: 'unknown_page' };
    }
  }
}

async function testFallbackInCustomerCreation() {
  try {
    console.log('\n🧪 اختبار 2: إرسال رسالة من عميل جديد لصفحة موجودة...');
    
    const webhookData = {
      object: 'page',
      entry: [{
        id: '250528358137901', // سولا 132 - صفحة موجودة
        time: Date.now(),
        messaging: [{
          sender: { id: 'new_customer_fallback_test' },
          recipient: { id: '250528358137901' },
          timestamp: Date.now(),
          message: {
            mid: 'test_customer_creation',
            text: 'مرحبا، أنا عميل جديد'
          }
        }]
      }]
    };
    
    console.log('📤 إرسال طلب من عميل جديد...');
    console.log(`📱 Page ID: 250528358137901 (سولا 132)`);
    console.log(`👤 Customer: new_customer_fallback_test`);
    
    const response = await axios.post('http://localhost:3001/webhook', webhookData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`\n📊 Response Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ الطلب تم قبوله (هذا طبيعي للصفحة الموجودة)');
      
      // انتظار لمعالجة الرسالة
      console.log('\n⏳ انتظار 3 ثوان لمعالجة الرسالة...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('\n🔍 تحقق من اللوج للبحث عن:');
      console.log('   ✅ "Using company from page: cme8zve740006ufbcre9qzue4" (شركة الحلو)');
      console.log('   🚨 "findFirst" للشركة الافتراضية');
      console.log('   🚨 إنشاء عميل في شركة خاطئة');
      
      return { fallbackExists: 'check_logs', test: 'customer_creation' };
    }
    
  } catch (error) {
    console.error(`❌ خطأ في اختبار إنشاء العميل: ${error.message}`);
    return { fallbackExists: 'error', test: 'customer_creation' };
  }
}

async function generateFallbackReport() {
  console.log('\n📊 تقرير فحص نظام Fallback:');
  console.log('═'.repeat(80));
  
  const test1 = await testFallbackExistence();
  const test2 = await testFallbackInCustomerCreation();
  
  console.log('\n🎯 النتائج النهائية:');
  console.log('─'.repeat(50));
  console.log(`🧪 اختبار الصفحة غير الموجودة: ${test1.fallbackExists ? '🚨 Fallback موجود' : '✅ آمن'}`);
  console.log(`🧪 اختبار إنشاء العميل: ${test2.fallbackExists === 'check_logs' ? '⚠️ تحقق من اللوج' : test2.fallbackExists ? '🚨 Fallback موجود' : '✅ آمن'}`);
  
  const overallSafety = !test1.fallbackExists && test2.fallbackExists !== true;
  
  console.log('\n🏆 التقييم الإجمالي:');
  console.log('═'.repeat(50));
  
  if (overallSafety) {
    console.log('🟢 النظام آمن - لا يوجد fallback خطير');
    console.log('✅ العزل محمي');
    console.log('✅ لا يوجد تسريب للبيانات');
  } else {
    console.log('🔴 خطر! يوجد fallback في النظام');
    console.log('❌ العزل مخترق');
    console.log('❌ يمكن حدوث تسريب للبيانات');
    console.log('\n🔧 يجب إصلاح:');
    console.log('   1. إزالة findFirst() للشركة الافتراضية');
    console.log('   2. رفض إنشاء عملاء بدون companyId صحيح');
    console.log('   3. إزالة جميع أنواع Fallback الخطيرة');
  }
  
  return {
    test1,
    test2,
    overallSafety
  };
}

generateFallbackReport();
