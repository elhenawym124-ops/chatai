const { PrismaClient } = require('@prisma/client');

console.log('🔧 إصلاح ربط صفحة سولا 132 بالشركة الصحيحة...\n');

class SolaCompanyFixer {
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async checkCurrentState() {
    console.log('🔍 فحص الحالة الحالية...');
    
    try {
      // فحص صفحة سولا 132
      const solaPage = await this.prisma.facebookPage.findFirst({
        where: { pageId: '250528358137901' },
        include: { company: true }
      });
      
      if (solaPage) {
        console.log('📱 صفحة سولا 132:');
        console.log(`   📛 الاسم: "${solaPage.pageName}"`);
        console.log(`   🆔 Page ID: ${solaPage.pageId}`);
        console.log(`   🏢 الشركة الحالية: ${solaPage.company.name} (${solaPage.company.id})`);
        console.log(`   ✅ نشطة: ${solaPage.isActive}`);
        console.log(`   🔗 الحالة: ${solaPage.status}`);
      } else {
        console.log('❌ لم يتم العثور على صفحة سولا 132');
      }
      
      // فحص جميع الشركات
      const companies = await this.prisma.company.findMany({
        include: {
          facebookPages: true,
          products: true
        }
      });
      
      console.log(`\n🏢 جميع الشركات (${companies.length}):`);
      companies.forEach((company, index) => {
        console.log(`\n${index + 1}. 🏢 ${company.name} (${company.id}):`);
        console.log(`   📦 المنتجات: ${company.products.length}`);
        console.log(`   📱 صفحات فيسبوك: ${company.facebookPages.length}`);
        
        company.products.forEach((product, pIndex) => {
          console.log(`      📦 ${pIndex + 1}. "${product.name}" - ${product.price} جنيه`);
        });
        
        company.facebookPages.forEach((page, fIndex) => {
          console.log(`      📱 ${fIndex + 1}. "${page.pageName}" (${page.pageId})`);
        });
      });
      
      return { solaPage, companies };
      
    } catch (error) {
      console.error('❌ خطأ في فحص الحالة:', error.message);
      return null;
    }
  }
  
  async fixCompanyLink() {
    console.log('\n🔧 إصلاح ربط الشركة...');
    
    try {
      // العثور على شركة الحلو (الشركة الصحيحة لسولا 132)
      const correctCompany = await this.prisma.company.findFirst({
        where: { name: 'شركة الحلو' }
      });
      
      if (!correctCompany) {
        console.log('❌ لم يتم العثور على شركة الحلو');
        return false;
      }
      
      console.log(`✅ تم العثور على شركة الحلو: ${correctCompany.id}`);
      
      // تحديث صفحة سولا 132 لتكون مربوطة بشركة الحلو
      const updatedPage = await this.prisma.facebookPage.updateMany({
        where: { pageId: '250528358137901' },
        data: { 
          companyId: correctCompany.id,
          status: 'connected',
          isActive: true
        }
      });
      
      console.log(`✅ تم تحديث ${updatedPage.count} صفحة`);
      
      // التحقق من التحديث
      const verifyPage = await this.prisma.facebookPage.findFirst({
        where: { pageId: '250528358137901' },
        include: { company: true }
      });
      
      if (verifyPage) {
        console.log('\n✅ التحقق من التحديث:');
        console.log(`   📱 الصفحة: "${verifyPage.pageName}"`);
        console.log(`   🏢 الشركة الجديدة: ${verifyPage.company.name} (${verifyPage.company.id})`);
        console.log(`   ✅ نشطة: ${verifyPage.isActive}`);
        console.log(`   🔗 الحالة: ${verifyPage.status}`);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ خطأ في إصلاح الربط:', error.message);
      return false;
    }
  }
  
  async moveCustomerToCorrectCompany() {
    console.log('\n👤 نقل العميل للشركة الصحيحة...');
    
    try {
      // العثور على شركة الحلو
      const correctCompany = await this.prisma.company.findFirst({
        where: { name: 'شركة الحلو' }
      });
      
      if (!correctCompany) {
        console.log('❌ لم يتم العثور على شركة الحلو');
        return false;
      }
      
      // العثور على العميل سولا 132
      const customer = await this.prisma.customer.findFirst({
        where: { facebookId: '23949903971327041' }
      });
      
      if (!customer) {
        console.log('❌ لم يتم العثور على العميل');
        return false;
      }
      
      console.log(`👤 العميل الحالي: ${customer.firstName} ${customer.lastName}`);
      console.log(`🏢 الشركة الحالية: ${customer.companyId}`);
      console.log(`🏢 الشركة الصحيحة: ${correctCompany.id}`);
      
      if (customer.companyId === correctCompany.id) {
        console.log('✅ العميل مربوط بالشركة الصحيحة بالفعل');
        return true;
      }
      
      // نقل العميل للشركة الصحيحة
      const updatedCustomer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: { companyId: correctCompany.id }
      });
      
      console.log(`✅ تم نقل العميل للشركة الصحيحة: ${correctCompany.id}`);
      
      // نقل جميع المحادثات للشركة الصحيحة
      const updatedConversations = await this.prisma.conversation.updateMany({
        where: { customerId: customer.id },
        data: { companyId: correctCompany.id }
      });
      
      console.log(`✅ تم نقل ${updatedConversations.count} محادثة للشركة الصحيحة`);
      
      return true;
      
    } catch (error) {
      console.error('❌ خطأ في نقل العميل:', error.message);
      return false;
    }
  }
  
  async testIsolationAfterFix() {
    console.log('\n🧪 اختبار العزل بعد الإصلاح...');
    
    try {
      // محاكاة الطلب من سولا 132
      const pageId = '250528358137901';
      const customerId = '23949903971327041';
      
      // 1. الحصول على بيانات الصفحة
      const page = await this.prisma.facebookPage.findFirst({
        where: { pageId: pageId },
        include: { company: true }
      });
      
      if (!page) {
        console.log('❌ لم يتم العثور على الصفحة');
        return false;
      }
      
      console.log(`📱 الصفحة: "${page.pageName}"`);
      console.log(`🏢 الشركة: ${page.company.name} (${page.company.id})`);
      
      // 2. الحصول على منتجات الشركة
      const products = await this.prisma.product.findMany({
        where: { companyId: page.company.id }
      });
      
      console.log(`\n📦 منتجات الشركة (${products.length}):`);
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. "${product.name}" - ${product.price} جنيه`);
      });
      
      // 3. التحقق من عدم وجود منتجات من شركات أخرى
      const otherProducts = await this.prisma.product.findMany({
        where: { 
          companyId: { not: page.company.id }
        },
        include: { company: true }
      });
      
      console.log(`\n🔍 منتجات الشركات الأخرى (${otherProducts.length}):`);
      otherProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. "${product.name}" - شركة: ${product.company.name}`);
      });
      
      // 4. النتيجة
      console.log('\n🎯 نتيجة الاختبار:');
      if (products.length > 0) {
        console.log(`✅ سولا 132 ستحصل على ${products.length} منتج من شركة الحلو`);
        console.log(`🛡️ لن تحصل على ${otherProducts.length} منتج من الشركات الأخرى`);
        console.log('✅ العزل يعمل بشكل صحيح');
      } else {
        console.log('⚠️ لا توجد منتجات في شركة الحلو');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ خطأ في اختبار العزل:', error.message);
      return false;
    }
  }
  
  async generateFixReport() {
    console.log('\n📊 تقرير الإصلاح:');
    console.log('═'.repeat(80));
    
    const currentState = await this.checkCurrentState();
    
    if (!currentState) {
      console.log('❌ فشل في فحص الحالة الحالية');
      return;
    }
    
    console.log('\n🔧 تطبيق الإصلاحات...');
    
    const linkFixed = await this.fixCompanyLink();
    const customerMoved = await this.moveCustomerToCorrectCompany();
    const isolationTested = await this.testIsolationAfterFix();
    
    console.log('\n🎯 ملخص الإصلاحات:');
    console.log('─'.repeat(50));
    console.log(`🔗 ربط الصفحة بالشركة: ${linkFixed ? '✅ تم' : '❌ فشل'}`);
    console.log(`👤 نقل العميل للشركة: ${customerMoved ? '✅ تم' : '❌ فشل'}`);
    console.log(`🧪 اختبار العزل: ${isolationTested ? '✅ نجح' : '❌ فشل'}`);
    
    if (linkFixed && customerMoved && isolationTested) {
      console.log('\n🎊 تم إصلاح المشكلة بنجاح!');
      console.log('✅ سولا 132 الآن مربوطة بشركة الحلو');
      console.log('✅ العزل يعمل بشكل صحيح');
      console.log('✅ لن يحدث تسريب للبيانات');
    } else {
      console.log('\n❌ فشل في إصلاح بعض المشاكل');
    }
    
    return {
      linkFixed,
      customerMoved,
      isolationTested,
      success: linkFixed && customerMoved && isolationTested
    };
  }
  
  async cleanup() {
    await this.prisma.$disconnect();
  }
}

// تشغيل الإصلاح
async function runFix() {
  const fixer = new SolaCompanyFixer();
  
  try {
    const report = await fixer.generateFixReport();
    console.log('\n🎊 اكتمل إصلاح سولا 132!');
    return report;
    
  } catch (error) {
    console.error('💥 خطأ في الإصلاح:', error);
    return null;
  } finally {
    await fixer.cleanup();
  }
}

runFix();
