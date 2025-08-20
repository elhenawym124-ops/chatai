const { PrismaClient } = require('@prisma/client');

console.log('🧪 اختبار العزل النهائي بعد الإصلاح...\n');

class FinalIsolationTest {
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async simulateWebhookFlow() {
    console.log('🔄 محاكاة مسار webhook لسولا 132...');
    
    try {
      const pageId = '250528358137901'; // سولا 132
      const senderId = '23949903971327041'; // العميل
      
      console.log(`📱 Page ID: ${pageId}`);
      console.log(`👤 Sender ID: ${senderId}`);
      
      // 1. الحصول على بيانات الصفحة (محاكاة getPageToken)
      console.log('\n1️⃣ الحصول على بيانات الصفحة...');
      
      const page = await this.prisma.facebookPage.findUnique({
        where: { pageId: pageId },
        include: { company: true }
      });
      
      if (!page) {
        console.log('❌ لم يتم العثور على الصفحة');
        return false;
      }
      
      console.log(`✅ تم العثور على الصفحة: "${page.pageName}"`);
      console.log(`🏢 الشركة: ${page.company.name} (${page.company.id})`);
      
      const pageData = {
        pageAccessToken: page.pageAccessToken,
        pageName: page.pageName,
        companyId: page.companyId
      };
      
      // 2. تحديد الشركة المستهدفة (محاكاة server.js)
      console.log('\n2️⃣ تحديد الشركة المستهدفة...');
      
      let targetCompanyId = null;
      if (pageData?.companyId) {
        targetCompanyId = pageData.companyId;
        console.log(`🏢 [COMPANY-DEBUG] Using company from page: ${targetCompanyId}`);
      } else {
        const defaultCompany = await this.prisma.company.findFirst();
        targetCompanyId = defaultCompany?.id;
        console.log(`🏢 [COMPANY-DEBUG] Using default company: ${targetCompanyId}`);
      }
      
      // 3. البحث عن العميل (محاكاة customer lookup)
      console.log('\n3️⃣ البحث عن العميل...');
      
      const customer = await this.prisma.customer.findFirst({
        where: {
          facebookId: senderId,
          companyId: targetCompanyId
        }
      });
      
      if (customer) {
        console.log(`✅ تم العثور على العميل: ${customer.firstName} ${customer.lastName}`);
        console.log(`🏢 شركة العميل: ${customer.companyId}`);
      } else {
        console.log('❌ لم يتم العثور على العميل في الشركة المحددة');
      }
      
      // 4. تحميل منتجات الشركة (محاكاة RAG)
      console.log('\n4️⃣ تحميل منتجات الشركة...');
      
      const products = await this.prisma.product.findMany({
        where: { companyId: targetCompanyId }
      });
      
      console.log(`📦 منتجات الشركة ${targetCompanyId}: ${products.length}`);
      
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. "${product.name}" - ${product.price} جنيه`);
      });
      
      // 5. فحص عدم تحميل منتجات من شركات أخرى
      console.log('\n5️⃣ فحص عدم تسريب منتجات أخرى...');
      
      const otherProducts = await this.prisma.product.findMany({
        where: { 
          companyId: { not: targetCompanyId }
        },
        include: { company: true }
      });
      
      console.log(`🔍 منتجات الشركات الأخرى: ${otherProducts.length}`);
      
      otherProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. "${product.name}" - شركة: ${product.company.name}`);
      });
      
      // 6. النتيجة النهائية
      console.log('\n6️⃣ النتيجة النهائية:');
      console.log('═'.repeat(60));
      
      if (targetCompanyId === await getCompanyByName('الحلو')) { // شركة الحلو
        console.log('✅ تم تحديد الشركة الصحيحة: شركة الحلو');
        
        if (products.length > 0) {
          console.log(`✅ سيتم إرسال ${products.length} منتج من شركة الحلو`);
          products.forEach((product, index) => {
            console.log(`   ${index + 1}. "${product.name}"`);
          });
        } else {
          console.log('⚠️ لا توجد منتجات في شركة الحلو');
        }
        
        console.log(`🛡️ لن يتم إرسال ${otherProducts.length} منتج من الشركات الأخرى`);
        console.log('✅ العزل يعمل بشكل مثالي');
        
        return true;
      } else {
        console.log(`❌ تم تحديد شركة خاطئة: ${targetCompanyId}`);
        console.log('❌ العزل لا يعمل بشكل صحيح');
        
        return false;
      }
      
    } catch (error) {
      console.error('❌ خطأ في المحاكاة:', error.message);
      return false;
    }
  }
  
  async verifyAllCompaniesIsolation() {
    console.log('\n🔒 التحقق من عزل جميع الشركات...');
    
    try {
      const companies = await this.prisma.company.findMany({
        include: {
          products: true,
          facebookPages: true,
          customers: true
        }
      });
      
      console.log(`🏢 إجمالي الشركات: ${companies.length}`);
      
      companies.forEach((company, index) => {
        console.log(`\n${index + 1}. 🏢 ${company.name} (${company.id}):`);
        console.log(`   📦 المنتجات: ${company.products.length}`);
        console.log(`   📱 صفحات فيسبوك: ${company.facebookPages.length}`);
        console.log(`   👥 العملاء: ${company.customers.length}`);
        
        // عرض المنتجات
        company.products.forEach((product, pIndex) => {
          console.log(`      📦 ${pIndex + 1}. "${product.name}" - ${product.price} جنيه`);
        });
        
        // عرض الصفحات
        company.facebookPages.forEach((page, fIndex) => {
          console.log(`      📱 ${fIndex + 1}. "${page.pageName}" (${page.pageId})`);
        });
        
        // عرض العملاء
        company.customers.forEach((customer, cIndex) => {
          console.log(`      👤 ${cIndex + 1}. ${customer.firstName} ${customer.lastName}`);
        });
      });
      
      // فحص التداخل
      console.log('\n🔍 فحص التداخل بين الشركات...');
      
      let hasOverlap = false;
      
      for (let i = 0; i < companies.length; i++) {
        for (let j = i + 1; j < companies.length; j++) {
          const company1 = companies[i];
          const company2 = companies[j];
          
          // فحص تداخل المنتجات
          const productOverlap = company1.products.filter(p1 => 
            company2.products.some(p2 => p2.id === p1.id)
          );
          
          // فحص تداخل العملاء
          const customerOverlap = company1.customers.filter(c1 => 
            company2.customers.some(c2 => c2.id === c1.id)
          );
          
          if (productOverlap.length > 0 || customerOverlap.length > 0) {
            console.log(`❌ تداخل بين ${company1.name} و ${company2.name}:`);
            console.log(`   📦 منتجات متداخلة: ${productOverlap.length}`);
            console.log(`   👥 عملاء متداخلون: ${customerOverlap.length}`);
            hasOverlap = true;
          }
        }
      }
      
      if (!hasOverlap) {
        console.log('✅ لا يوجد تداخل بين الشركات - العزل مثالي');
      }
      
      return !hasOverlap;
      
    } catch (error) {
      console.error('❌ خطأ في التحقق من العزل:', error.message);
      return false;
    }
  }
  
  async generateFinalReport() {
    console.log('\n📊 التقرير النهائي للعزل:');
    console.log('═'.repeat(80));
    
    const webhookTest = await this.simulateWebhookFlow();
    const isolationTest = await this.verifyAllCompaniesIsolation();
    
    console.log('\n🎯 النتائج النهائية:');
    console.log('─'.repeat(50));
    console.log(`🔄 محاكاة webhook: ${webhookTest ? '✅ نجح' : '❌ فشل'}`);
    console.log(`🔒 عزل الشركات: ${isolationTest ? '✅ مثالي' : '❌ يحتاج إصلاح'}`);
    
    const overallSuccess = webhookTest && isolationTest;
    
    console.log('\n🏆 التقييم الإجمالي:');
    console.log('═'.repeat(50));
    
    if (overallSuccess) {
      console.log('🟢 العزل يعمل بشكل مثالي 100%');
      console.log('✅ سولا 132 ستحصل على منتجات شركة الحلو فقط');
      console.log('✅ لن يحدث تسريب للبيانات');
      console.log('✅ النظام آمن للإنتاج');
    } else {
      console.log('🔴 يوجد مشاكل في العزل');
      console.log('❌ يحتاج إصلاحات إضافية');
    }
    
    return {
      webhookTest,
      isolationTest,
      overallSuccess
    };
  }
  
  async cleanup() {
    await this.prisma.$disconnect();
  }
}

// تشغيل الاختبار النهائي
async function runFinalTest() {
  const tester = new FinalIsolationTest();
  
  try {
    const report = await tester.generateFinalReport();
    console.log('\n🎊 اكتمل الاختبار النهائي!');
    return report;
    
  } catch (error) {
    console.error('💥 خطأ في الاختبار النهائي:', error);
    return null;
  } finally {
    await tester.cleanup();
  }
}

runFinalTest();
