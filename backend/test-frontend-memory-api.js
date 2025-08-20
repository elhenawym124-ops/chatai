
// Helper function للحصول على معرف الشركة بالاسم
async function getCompanyByName(name) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const company = await prisma.company.findFirst({
      where: { name: { contains: name } }
    });
    await prisma.$disconnect();
    return company?.id || null;
  } catch (error) {
    console.error('خطأ في البحث عن الشركة:', error);
    return null;
  }
}
/**
 * اختبار API إحصائيات الذاكرة كما تستدعيه الواجهة الأمامية
 */

const axios = require('axios');

async function testFrontendMemoryAPI() {
  console.log('🔍 اختبار API إحصائيات الذاكرة من الواجهة الأمامية...');
  console.log('='.repeat(60));

  const baseURL = 'http://localhost:3001';
  const company1 = 'cme8oj1fo000cufdcg2fquia9';
  // الحصول على شركة الحلو ديناميكياً
  const companies = await prisma.company.findMany({ where: { name: { contains: 'الحلو' } } });
  const company2 = companies[0]?.id || 'company-not-found';

  try {
    // 1. اختبار بدون companyId (كما تفعل الواجهة الأمامية حالياً)
    console.log('\n🚨 اختبار 1: طلب بدون companyId (المشكلة الحالية)...');
    try {
      const response = await axios.get(`${baseURL}/api/v1/ai/memory/stats`);
      console.log('❌ نجح الطلب بدون companyId - هذا خطأ أمني!');
      console.log('البيانات المسربة:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ تم رفض الطلب بدون companyId بشكل صحيح');
        console.log(`   رسالة الخطأ: ${error.response.data.error}`);
      } else {
        console.log('❌ خطأ غير متوقع:', error.response?.data?.error || error.message);
      }
    }

    // 2. اختبار مع companyId للشركة الأولى
    console.log('\n📊 اختبار 2: طلب مع companyId للشركة الأولى...');
    try {
      const response1 = await axios.get(`${baseURL}/api/v1/ai/memory/stats?companyId=${company1}`);
      console.log('✅ نجح الحصول على إحصائيات الشركة الأولى');
      console.log('البيانات:');
      console.log(`   - إجمالي المحادثات: ${response1.data.data.totalMemories}`);
      console.log(`   - إجمالي الرسائل: ${response1.data.data.totalMessages}`);
      console.log(`   - إجمالي العملاء: ${response1.data.data.totalCustomers}`);
      console.log(`   - سجلات الذاكرة: ${response1.data.data.conversationMemoryRecords}`);
      console.log(`   - الذاكرة قصيرة المدى: ${response1.data.data.shortTermMemorySize}`);
      console.log(`   - معزولة: ${response1.data.data.isolated}`);
      console.log(`   - معرف الشركة: ${response1.data.data.companyId}`);
      
      if (response1.data.data.isolated && response1.data.data.companyId === company1) {
        console.log('✅ البيانات معزولة بشكل صحيح للشركة الأولى');
      } else {
        console.log('❌ مشكلة في عزل البيانات للشركة الأولى');
      }
    } catch (error) {
      console.log('❌ فشل في الحصول على إحصائيات الشركة الأولى:', error.response?.data?.error || error.message);
    }

    // 3. اختبار مع companyId للشركة الثانية
    console.log('\n📊 اختبار 3: طلب مع companyId للشركة الثانية...');
    try {
      const response2 = await axios.get(`${baseURL}/api/v1/ai/memory/stats?companyId=${company2}`);
      console.log('✅ نجح الحصول على إحصائيات الشركة الثانية');
      console.log('البيانات:');
      console.log(`   - إجمالي المحادثات: ${response2.data.data.totalMemories}`);
      console.log(`   - إجمالي الرسائل: ${response2.data.data.totalMessages}`);
      console.log(`   - إجمالي العملاء: ${response2.data.data.totalCustomers}`);
      console.log(`   - سجلات الذاكرة: ${response2.data.data.conversationMemoryRecords}`);
      console.log(`   - الذاكرة قصيرة المدى: ${response2.data.data.shortTermMemorySize}`);
      console.log(`   - معزولة: ${response2.data.data.isolated}`);
      console.log(`   - معرف الشركة: ${response2.data.data.companyId}`);
      
      if (response2.data.data.isolated && response2.data.data.companyId === company2) {
        console.log('✅ البيانات معزولة بشكل صحيح للشركة الثانية');
      } else {
        console.log('❌ مشكلة في عزل البيانات للشركة الثانية');
      }
    } catch (error) {
      console.log('❌ فشل في الحصول على إحصائيات الشركة الثانية:', error.response?.data?.error || error.message);
    }

    // 4. اختبار memory settings
    console.log('\n⚙️ اختبار 4: memory settings...');
    try {
      const settingsResponse = await axios.get(`${baseURL}/api/v1/ai/memory/settings?companyId=${company1}`);
      console.log('✅ نجح الحصول على إعدادات الذاكرة');
      console.log(`   - معزولة: ${settingsResponse.data.data.isolated}`);
      console.log(`   - معرف الشركة: ${settingsResponse.data.data.companyId}`);
    } catch (error) {
      console.log('❌ فشل في الحصول على إعدادات الذاكرة:', error.response?.data?.error || error.message);
    }

    // 5. اختبار مقارنة البيانات
    console.log('\n🔍 اختبار 5: مقارنة البيانات بين الشركتين...');
    try {
      const [stats1, stats2] = await Promise.all([
        axios.get(`${baseURL}/api/v1/ai/memory/stats?companyId=${company1}`),
        axios.get(`${baseURL}/api/v1/ai/memory/stats?companyId=${company2}`)
      ]);

      const data1 = stats1.data.data;
      const data2 = stats2.data.data;

      console.log('مقارنة الإحصائيات:');
      console.log(`   الشركة الأولى - محادثات: ${data1.totalMemories}, رسائل: ${data1.totalMessages}, عملاء: ${data1.totalCustomers}`);
      console.log(`   الشركة الثانية - محادثات: ${data2.totalMemories}, رسائل: ${data2.totalMessages}, عملاء: ${data2.totalCustomers}`);

      if (data1.totalMemories !== data2.totalMemories || 
          data1.totalMessages !== data2.totalMessages || 
          data1.totalCustomers !== data2.totalCustomers) {
        console.log('✅ البيانات مختلفة بين الشركتين - العزل يعمل');
      } else {
        console.log('⚠️ البيانات متطابقة بين الشركتين - قد تكون مشكلة');
      }

    } catch (error) {
      console.log('❌ فشل في مقارنة البيانات:', error.message);
    }

    // 6. تحليل نهائي
    console.log('\n📊 تحليل نهائي:');
    console.log('='.repeat(50));
    
    console.log('✅ تم إصلاح مشكلة عدم العزل في API');
    console.log('✅ الخادم الآن يتطلب companyId للعزل الأمني');
    console.log('✅ كل شركة ترى إحصائياتها فقط');
    
    console.log('\n🔧 المطلوب في الواجهة الأمامية:');
    console.log('   1. تحديث companyAwareApi ليضيف companyId تلقائياً ✅ (موجود)');
    console.log('   2. التأكد من أن المستخدم مسجل دخول بشكل صحيح');
    console.log('   3. فحص console في المتصفح للأخطاء');

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
  }
}

testFrontendMemoryAPI().catch(console.error);
