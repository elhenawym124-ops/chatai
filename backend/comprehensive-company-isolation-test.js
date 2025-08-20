const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

console.log('🔬 فحص شامل للعزل بين الشركات - اختبار متقدم...\n');

class CompanyIsolationTester {
  constructor() {
    this.prisma = new PrismaClient();
    this.baseURL = 'http://localhost:3001/api/v1';
    this.testResults = {
      databaseIsolation: [],
      apiIsolation: [],
      crossCompanyAccess: [],
      dataLeakage: [],
      authenticationTests: [],
      summary: {}
    };
    this.companies = [];
    this.testUsers = [];
  }
  
  async initialize() {
    console.log('🔧 تهيئة بيانات الاختبار...');
    
    try {
      // جلب الشركات الموجودة
      this.companies = await this.prisma.company.findMany({
        select: { id: true, name: true },
        take: 3
      });
      
      console.log(`✅ تم العثور على ${this.companies.length} شركة للاختبار:`);
      this.companies.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company.name} (${company.id})`);
      });
      
      // جلب مستخدمين من كل شركة
      for (const company of this.companies) {
        const users = await this.prisma.user.findMany({
          where: { companyId: company.id },
          select: { id: true, email: true, companyId: true },
          take: 2
        });
        
        this.testUsers.push(...users.map(user => ({
          ...user,
          companyName: company.name
        })));
      }
      
      console.log(`✅ تم العثور على ${this.testUsers.length} مستخدم للاختبار\n`);
      
    } catch (error) {
      console.error('❌ خطأ في التهيئة:', error.message);
      throw error;
    }
  }
  
  // اختبار عزل قاعدة البيانات
  async testDatabaseIsolation() {
    console.log('🗄️ اختبار عزل قاعدة البيانات...');
    
    const tables = [
      'message', 'conversation', 'product', 'order', 'customer',
      'notification', 'aiSettings', 'geminiKey', 'inventory'
    ];
    
    for (const table of tables) {
      try {
        console.log(`   📊 فحص جدول ${table}...`);
        
        // فحص إذا كان الجدول يحتوي على companyId
        const tableInfo = await this.prisma.$queryRaw`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = ${table} AND COLUMN_NAME = 'companyId'
        `;
        
        const hasCompanyId = tableInfo.length > 0;
        
        if (hasCompanyId) {
          // فحص البيانات لكل شركة
          for (const company of this.companies) {
            const query = `SELECT COUNT(*) as count FROM ${table} WHERE companyId = ?`;
            const result = await this.prisma.$queryRawUnsafe(query, company.id);
            const count = result[0]?.count || 0;
            
            console.log(`      ${company.name}: ${count} سجل`);
          }
          
          // فحص البيانات بدون companyId (خطر!)
          const orphanQuery = `SELECT COUNT(*) as count FROM ${table} WHERE companyId IS NULL`;
          const orphanResult = await this.prisma.$queryRawUnsafe(orphanQuery);
          const orphanCount = orphanResult[0]?.count || 0;
          
          this.testResults.databaseIsolation.push({
            table,
            hasCompanyId: true,
            orphanRecords: orphanCount,
            status: orphanCount === 0 ? 'SAFE' : 'WARNING',
            message: orphanCount === 0 ? 'جميع السجلات معزولة' : `${orphanCount} سجل بدون companyId`
          });
          
          if (orphanCount > 0) {
            console.log(`      ⚠️  ${orphanCount} سجل بدون companyId`);
          } else {
            console.log(`      ✅ جميع السجلات معزولة`);
          }
        } else {
          this.testResults.databaseIsolation.push({
            table,
            hasCompanyId: false,
            status: 'INFO',
            message: 'الجدول لا يحتوي على companyId (قد يكون جدول مشترك)'
          });
          console.log(`      ℹ️  الجدول لا يحتوي على companyId`);
        }
        
      } catch (error) {
        console.log(`      ❌ خطأ في فحص ${table}: ${error.message}`);
        this.testResults.databaseIsolation.push({
          table,
          status: 'ERROR',
          message: error.message
        });
      }
    }
    
    console.log('');
  }
  
  // اختبار محاولة الوصول عبر الشركات
  async testCrossCompanyAccess() {
    console.log('🔒 اختبار منع الوصول عبر الشركات...');
    
    if (this.companies.length < 2) {
      console.log('   ⚠️  يحتاج شركتين على الأقل للاختبار');
      return;
    }
    
    const company1 = this.companies[0];
    const company2 = this.companies[1];
    
    try {
      // محاولة الوصول لبيانات شركة أخرى
      console.log(`   🧪 محاولة وصول ${company1.name} لبيانات ${company2.name}...`);
      
      // اختبار الرسائل
      const company1Messages = await this.prisma.message.findMany({
        where: { companyId: company1.id },
        take: 5
      });
      
      const company2Messages = await this.prisma.message.findMany({
        where: { companyId: company2.id },
        take: 5
      });
      
      // التحقق من عدم وجود تداخل
      const messageIdsCompany1 = company1Messages.map(m => m.id);
      const messageIdsCompany2 = company2Messages.map(m => m.id);
      const overlap = messageIdsCompany1.filter(id => messageIdsCompany2.includes(id));
      
      this.testResults.crossCompanyAccess.push({
        test: 'Message Isolation',
        company1: company1.name,
        company2: company2.name,
        company1Count: company1Messages.length,
        company2Count: company2Messages.length,
        overlap: overlap.length,
        status: overlap.length === 0 ? 'SAFE' : 'CRITICAL',
        message: overlap.length === 0 ? 'لا يوجد تداخل في الرسائل' : `${overlap.length} رسالة متداخلة!`
      });
      
      console.log(`      ${company1.name}: ${company1Messages.length} رسالة`);
      console.log(`      ${company2.name}: ${company2Messages.length} رسالة`);
      console.log(`      تداخل: ${overlap.length} ${overlap.length === 0 ? '✅' : '❌'}`);
      
      // اختبار المنتجات
      const company1Products = await this.prisma.product.findMany({
        where: { companyId: company1.id },
        take: 5
      });
      
      const company2Products = await this.prisma.product.findMany({
        where: { companyId: company2.id },
        take: 5
      });
      
      const productOverlap = company1Products.filter(p1 => 
        company2Products.some(p2 => p2.id === p1.id)
      );
      
      this.testResults.crossCompanyAccess.push({
        test: 'Product Isolation',
        company1: company1.name,
        company2: company2.name,
        company1Count: company1Products.length,
        company2Count: company2Products.length,
        overlap: productOverlap.length,
        status: productOverlap.length === 0 ? 'SAFE' : 'CRITICAL',
        message: productOverlap.length === 0 ? 'لا يوجد تداخل في المنتجات' : `${productOverlap.length} منتج متداخل!`
      });
      
      console.log(`      منتجات ${company1.name}: ${company1Products.length}`);
      console.log(`      منتجات ${company2.name}: ${company2Products.length}`);
      console.log(`      تداخل المنتجات: ${productOverlap.length} ${productOverlap.length === 0 ? '✅' : '❌'}`);
      
    } catch (error) {
      console.log(`   ❌ خطأ في اختبار الوصول المتقاطع: ${error.message}`);
      this.testResults.crossCompanyAccess.push({
        test: 'Cross Access Test',
        status: 'ERROR',
        message: error.message
      });
    }
    
    console.log('');
  }
  
  // اختبار تسريب البيانات المحتمل
  async testDataLeakage() {
    console.log('💧 اختبار تسريب البيانات المحتمل...');
    
    try {
      // فحص الاستعلامات الخطيرة
      const dangerousQueries = [
        {
          name: 'Messages without companyId filter',
          query: 'SELECT COUNT(*) as count FROM message',
          description: 'رسائل بدون فلتر companyId'
        },
        {
          name: 'Products without companyId filter',
          query: 'SELECT COUNT(*) as count FROM product',
          description: 'منتجات بدون فلتر companyId'
        },
        {
          name: 'Users without companyId filter',
          query: 'SELECT COUNT(*) as count FROM user',
          description: 'مستخدمين بدون فلتر companyId'
        }
      ];
      
      for (const queryTest of dangerousQueries) {
        try {
          const result = await this.prisma.$queryRawUnsafe(queryTest.query);
          const totalCount = result[0]?.count || 0;
          
          console.log(`   📊 ${queryTest.description}: ${totalCount} سجل إجمالي`);
          
          this.testResults.dataLeakage.push({
            test: queryTest.name,
            totalRecords: totalCount,
            status: 'INFO',
            message: `${totalCount} سجل متاح بدون فلتر`
          });
          
        } catch (error) {
          console.log(`   ❌ خطأ في ${queryTest.name}: ${error.message}`);
        }
      }
      
      // فحص البيانات الحساسة
      console.log('   🔍 فحص البيانات الحساسة...');
      
      for (const company of this.companies) {
        // فحص مفاتيح AI
        const aiKeys = await this.prisma.geminiKey.findMany({
          where: { companyId: company.id },
          select: { id: true, isActive: true }
        });
        
        console.log(`      ${company.name}: ${aiKeys.length} مفتاح AI`);
        
        // فحص الإعدادات
        const settings = await this.prisma.aiSettings.findMany({
          where: { companyId: company.id },
          select: { id: true }
        });
        
        console.log(`      ${company.name}: ${settings.length} إعداد AI`);
      }
      
    } catch (error) {
      console.log(`   ❌ خطأ في اختبار تسريب البيانات: ${error.message}`);
    }
    
    console.log('');
  }
  
  // اختبار المصادقة والتفويض
  async testAuthentication() {
    console.log('🔐 اختبار المصادقة والتفويض...');
    
    try {
      // اختبار الوصول بدون token
      console.log('   🧪 اختبار الوصول بدون مصادقة...');
      
      try {
        const response = await axios.get(`${this.baseURL}/messages`, {
          timeout: 5000
        });
        
        this.testResults.authenticationTests.push({
          test: 'No Auth Access',
          status: 'CRITICAL',
          message: 'تم السماح بالوصول بدون مصادقة!',
          response: response.status
        });
        
        console.log('   ❌ خطر! تم السماح بالوصول بدون مصادقة');
        
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.testResults.authenticationTests.push({
            test: 'No Auth Access',
            status: 'SAFE',
            message: 'تم رفض الوصول بدون مصادقة بشكل صحيح',
            response: 401
          });
          
          console.log('   ✅ تم رفض الوصول بدون مصادقة بشكل صحيح');
        } else {
          console.log(`   ⚠️  خطأ في الاختبار: ${error.message}`);
        }
      }
      
      // اختبار token غير صحيح
      console.log('   🧪 اختبار token غير صحيح...');
      
      try {
        const response = await axios.get(`${this.baseURL}/messages`, {
          headers: {
            'Authorization': 'Bearer invalid-token-12345'
          },
          timeout: 5000
        });
        
        this.testResults.authenticationTests.push({
          test: 'Invalid Token',
          status: 'CRITICAL',
          message: 'تم قبول token غير صحيح!',
          response: response.status
        });
        
        console.log('   ❌ خطر! تم قبول token غير صحيح');
        
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.testResults.authenticationTests.push({
            test: 'Invalid Token',
            status: 'SAFE',
            message: 'تم رفض token غير صحيح بشكل صحيح',
            response: 401
          });
          
          console.log('   ✅ تم رفض token غير صحيح بشكل صحيح');
        } else {
          console.log(`   ⚠️  خطأ في الاختبار: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ خطأ في اختبار المصادقة: ${error.message}`);
    }
    
    console.log('');
  }
  
  // إنشاء تقرير شامل
  generateComprehensiveReport() {
    console.log('📊 تقرير شامل للعزل بين الشركات');
    console.log('═'.repeat(80));
    
    // حساب الإحصائيات
    const dbSafeCount = this.testResults.databaseIsolation.filter(t => t.status === 'SAFE').length;
    const dbWarningCount = this.testResults.databaseIsolation.filter(t => t.status === 'WARNING').length;
    const dbErrorCount = this.testResults.databaseIsolation.filter(t => t.status === 'ERROR').length;
    
    const crossAccessSafeCount = this.testResults.crossCompanyAccess.filter(t => t.status === 'SAFE').length;
    const crossAccessCriticalCount = this.testResults.crossCompanyAccess.filter(t => t.status === 'CRITICAL').length;
    
    const authSafeCount = this.testResults.authenticationTests.filter(t => t.status === 'SAFE').length;
    const authCriticalCount = this.testResults.authenticationTests.filter(t => t.status === 'CRITICAL').length;
    
    console.log(`🏢 شركات مختبرة: ${this.companies.length}`);
    console.log(`👥 مستخدمين مختبرين: ${this.testUsers.length}`);
    console.log('');
    
    console.log('🗄️ نتائج عزل قاعدة البيانات:');
    console.log(`   ✅ آمن: ${dbSafeCount}`);
    console.log(`   ⚠️  تحذيرات: ${dbWarningCount}`);
    console.log(`   ❌ أخطاء: ${dbErrorCount}`);
    
    console.log('\n🔒 نتائج الوصول المتقاطع:');
    console.log(`   ✅ آمن: ${crossAccessSafeCount}`);
    console.log(`   ❌ خطير: ${crossAccessCriticalCount}`);
    
    console.log('\n🔐 نتائج المصادقة:');
    console.log(`   ✅ آمن: ${authSafeCount}`);
    console.log(`   ❌ خطير: ${authCriticalCount}`);
    
    // حساب نقاط الأمان الإجمالية
    const totalTests = dbSafeCount + dbWarningCount + crossAccessSafeCount + authSafeCount;
    const safeTests = dbSafeCount + crossAccessSafeCount + authSafeCount;
    const safetyScore = totalTests > 0 ? Math.round((safeTests / totalTests) * 100) : 0;
    
    console.log('\n🎯 التقييم الإجمالي:');
    console.log('─'.repeat(50));
    console.log(`📊 نقاط الأمان: ${safetyScore}%`);
    
    if (safetyScore >= 95) {
      console.log('🟢 العزل مثالي - آمن تماماً للإنتاج');
    } else if (safetyScore >= 85) {
      console.log('🟡 العزل جيد جداً - آمن للإنتاج مع مراقبة');
    } else if (safetyScore >= 70) {
      console.log('🟠 العزل مقبول - يحتاج تحسينات');
    } else {
      console.log('🔴 العزل ضعيف - يحتاج إصلاحات فورية');
    }
    
    // عرض المشاكل الخطيرة
    const criticalIssues = [
      ...this.testResults.crossCompanyAccess.filter(t => t.status === 'CRITICAL'),
      ...this.testResults.authenticationTests.filter(t => t.status === 'CRITICAL')
    ];
    
    if (criticalIssues.length > 0) {
      console.log('\n🚨 مشاكل خطيرة تحتاج إصلاح فوري:');
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.message}`);
      });
    }
    
    this.testResults.summary = {
      companiesTested: this.companies.length,
      usersTested: this.testUsers.length,
      safetyScore,
      criticalIssues: criticalIssues.length,
      recommendation: safetyScore >= 95 ? 'PRODUCTION_READY' : 
                     safetyScore >= 85 ? 'PRODUCTION_WITH_MONITORING' : 
                     safetyScore >= 70 ? 'NEEDS_IMPROVEMENT' : 'NEEDS_IMMEDIATE_FIX'
    };
    
    return this.testResults.summary;
  }
  
  async cleanup() {
    await this.prisma.$disconnect();
  }
}

// تشغيل الاختبار الشامل
async function runComprehensiveIsolationTest() {
  const tester = new CompanyIsolationTester();
  
  try {
    await tester.initialize();
    await tester.testDatabaseIsolation();
    await tester.testCrossCompanyAccess();
    await tester.testDataLeakage();
    await tester.testAuthentication();
    
    const summary = tester.generateComprehensiveReport();
    
    console.log('\n🎊 اكتمل الفحص الشامل للعزل!');
    
    return summary;
    
  } catch (error) {
    console.error('💥 خطأ في الفحص الشامل:', error);
    return null;
  } finally {
    await tester.cleanup();
  }
}

// تشغيل الاختبار
runComprehensiveIsolationTest().then(summary => {
  if (summary) {
    process.exit(summary.recommendation === 'PRODUCTION_READY' ? 0 : 1);
  } else {
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 فشل الاختبار:', error);
  process.exit(1);
});
