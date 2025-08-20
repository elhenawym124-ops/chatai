const { PrismaClient } = require('@prisma/client');

console.log('🔍 فحص شركة سولا 132 - تحديد الشركة الصحيحة...\n');

class SolaCompanyChecker {
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async findSolaCompany() {
    console.log('🏢 البحث عن شركة سولا 132...');
    
    try {
      // البحث في صفحات الفيسبوك
      const facebookPages = await this.prisma.facebookPage.findMany({
        where: {
          pageId: '250528358137901' // من اللوج
        },
        include: {
          company: true
        }
      });
      
      console.log(`📱 صفحات فيسبوك بـ Page ID 250528358137901: ${facebookPages.length}`);
      
      if (facebookPages.length > 0) {
        const page = facebookPages[0];
        console.log(`✅ تم العثور على الصفحة:`);
        console.log(`   📛 اسم الصفحة: "${page.pageName}"`);
        console.log(`   🆔 Page ID: ${page.pageId}`);
        console.log(`   🏢 الشركة: ${page.company.name} (${page.company.id})`);
        console.log(`   ✅ نشطة: ${page.isActive}`);
        
        return page.company;
      }
      
      // البحث في المحادثات
      console.log('\n💬 البحث في المحادثات...');
      const conversations = await this.prisma.conversation.findMany({
        where: {
          id: 'cme9y5y7t001rufr85z7y3if4' // من اللوج
        },
        include: {
          customer: true,
          company: true
        }
      });
      
      if (conversations.length > 0) {
        const conv = conversations[0];
        console.log(`✅ تم العثور على المحادثة:`);
        console.log(`   🆔 ID: ${conv.id}`);
        console.log(`   👤 العميل: ${conv.customer.firstName} ${conv.customer.lastName}`);
        console.log(`   📱 Facebook ID: ${conv.customer.facebookId}`);
        console.log(`   🏢 الشركة: ${conv.company.name} (${conv.company.id})`);
        
        return conv.company;
      }
      
      console.log('❌ لم يتم العثور على شركة سولا 132');
      return null;
      
    } catch (error) {
      console.error('❌ خطأ في البحث:', error.message);
      return null;
    }
  }
  
  async analyzeCompanyProducts(companyId) {
    console.log(`\n📦 تحليل منتجات الشركة: ${companyId}`);
    
    try {
      const products = await this.prisma.product.findMany({
        where: { companyId: companyId },
        include: {
          company: true
        }
      });
      
      console.log(`📦 عدد المنتجات: ${products.length}`);
      
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. 📦 "${product.name}"`);
        console.log(`   💰 السعر: ${product.price} جنيه`);
        console.log(`   📝 الوصف: "${product.description || 'بدون وصف'}"`);
        console.log(`   📦 المخزون: ${product.stock}`);
        console.log(`   🏷️ العلامات: "${product.tags || 'بدون علامات'}"`);
        console.log(`   🆔 Product ID: ${product.id}`);
        console.log(`   🏢 الشركة: ${product.company.name}`);
      });
      
      return products;
      
    } catch (error) {
      console.error('❌ خطأ في تحليل المنتجات:', error.message);
      return [];
    }
  }
  
  async checkOtherCompanies() {
    console.log('\n🔍 فحص الشركات الأخرى...');
    
    try {
      const companies = await this.prisma.company.findMany({
        include: {
          products: true,
          facebookPages: true
        }
      });
      
      console.log(`🏢 إجمالي الشركات: ${companies.length}`);
      
      companies.forEach((company, index) => {
        console.log(`\n${index + 1}. 🏢 ${company.name} (${company.id}):`);
        console.log(`   📦 المنتجات: ${company.products.length}`);
        console.log(`   📱 صفحات فيسبوك: ${company.facebookPages.length}`);
        
        // عرض المنتجات
        company.products.forEach((product, pIndex) => {
          console.log(`      ${pIndex + 1}. "${product.name}" - ${product.price} جنيه`);
        });
        
        // عرض صفحات فيسبوك
        company.facebookPages.forEach((page, fIndex) => {
          console.log(`      FB${fIndex + 1}. "${page.pageName}" (${page.pageId})`);
        });
      });
      
      return companies;
      
    } catch (error) {
      console.error('❌ خطأ في فحص الشركات:', error.message);
      return [];
    }
  }
  
  async verifyIsolation() {
    console.log('\n🔒 التحقق من العزل...');
    
    try {
      // الشركة من اللوج
      const logCompanyId = 'cme8oj1fo000cufdcg2fquia9';
      
      console.log(`🔍 فحص العزل للشركة: ${logCompanyId}`);
      
      // منتجات الشركة من اللوج
      const logCompanyProducts = await this.prisma.product.findMany({
        where: { companyId: logCompanyId }
      });
      
      console.log(`📦 منتجات الشركة ${logCompanyId}: ${logCompanyProducts.length}`);
      
      logCompanyProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. "${product.name}" - ${product.price} جنيه`);
      });
      
      // منتجات الشركات الأخرى
      const otherProducts = await this.prisma.product.findMany({
        where: { 
          companyId: { not: logCompanyId }
        },
        include: {
          company: true
        }
      });
      
      console.log(`\n📦 منتجات الشركات الأخرى: ${otherProducts.length}`);
      
      otherProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. "${product.name}" - شركة: ${product.company.name}`);
      });
      
      // التحقق من التسريب
      console.log('\n🕵️ فحص التسريب المحتمل...');
      
      const suspiciousProducts = otherProducts.filter(product => 
        product.name.includes('الشركة الأولى') || 
        product.name.includes('منتج الشركة')
      );
      
      if (suspiciousProducts.length > 0) {
        console.log(`🚨 تم العثور على ${suspiciousProducts.length} منتج مشبوه:`);
        suspiciousProducts.forEach((product, index) => {
          console.log(`   ${index + 1}. "${product.name}" في شركة: ${product.company.name}`);
        });
      } else {
        console.log('✅ لا يوجد تسريب - العزل يعمل بشكل صحيح');
      }
      
      return {
        logCompanyProducts,
        otherProducts,
        suspiciousProducts
      };
      
    } catch (error) {
      console.error('❌ خطأ في التحقق من العزل:', error.message);
      return null;
    }
  }
  
  async generateFinalReport() {
    console.log('\n📊 التقرير النهائي:');
    console.log('═'.repeat(80));
    
    const solaCompany = await this.findSolaCompany();
    const allCompanies = await this.checkOtherCompanies();
    const isolationCheck = await this.verifyIsolation();
    
    console.log('\n🎯 النتائج الرئيسية:');
    console.log('─'.repeat(50));
    
    if (solaCompany) {
      console.log(`📱 سولا 132 تنتمي لشركة: ${solaCompany.name} (${solaCompany.id})`);
      
      const solaProducts = await this.analyzeCompanyProducts(solaCompany.id);
      
      console.log(`\n📦 منتجات شركة سولا 132:`);
      solaProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. "${product.name}" - ${product.price} جنيه`);
      });
    }
    
    console.log('\n🔒 تحليل العزل:');
    if (isolationCheck) {
      console.log(`✅ منتجات الشركة الحالية: ${isolationCheck.logCompanyProducts.length}`);
      console.log(`🛡️ منتجات الشركات الأخرى: ${isolationCheck.otherProducts.length}`);
      console.log(`🚨 منتجات مشبوهة: ${isolationCheck.suspiciousProducts.length}`);
      
      if (isolationCheck.suspiciousProducts.length === 0) {
        console.log('✅ العزل يعمل بشكل مثالي - لا يوجد تسريب');
      } else {
        console.log('❌ تم اكتشاف تسريب محتمل');
      }
    }
    
    console.log('\n🎯 الخلاصة النهائية:');
    console.log('   1. تم تحديد شركة سولا 132');
    console.log('   2. تم تحليل منتجات جميع الشركات');
    console.log('   3. تم التحقق من العزل');
    console.log('   4. تم فحص التسريب المحتمل');
    
    return {
      solaCompany,
      allCompanies,
      isolationCheck
    };
  }
  
  async cleanup() {
    await this.prisma.$disconnect();
  }
}

// تشغيل الفحص
async function runSolaCheck() {
  const checker = new SolaCompanyChecker();
  
  try {
    const report = await checker.generateFinalReport();
    console.log('\n🎊 اكتمل فحص سولا 132!');
    return report;
    
  } catch (error) {
    console.error('💥 خطأ في الفحص:', error);
    return null;
  } finally {
    await checker.cleanup();
  }
}

runSolaCheck();
