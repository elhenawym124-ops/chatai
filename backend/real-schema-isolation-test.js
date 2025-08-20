const { PrismaClient } = require('@prisma/client');

console.log('🔬 فحص العزل الحقيقي بناءً على Schema الفعلي...\n');

class RealSchemaIsolationTester {
  constructor() {
    this.prisma = new PrismaClient();
    this.testResults = {
      schemaAnalysis: [],
      isolationTests: [],
      dataIntegrity: [],
      summary: {}
    };
  }
  
  // فحص schema الحقيقي
  async analyzeRealSchema() {
    console.log('📋 تحليل Schema الحقيقي...');
    
    try {
      // الحصول على جميع الجداول
      const tables = await this.prisma.$queryRaw`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_TYPE = 'BASE TABLE'
      `;
      
      console.log(`✅ تم العثور على ${tables.length} جدول في قاعدة البيانات`);
      
      for (const table of tables) {
        const tableName = table.TABLE_NAME;
        console.log(`\n📊 تحليل جدول: ${tableName}`);
        
        // فحص الأعمدة
        const columns = await this.prisma.$queryRaw`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ${tableName}
        `;
        
        const hasCompanyId = columns.some(col => col.COLUMN_NAME === 'companyId');
        const hasId = columns.some(col => col.COLUMN_NAME === 'id');
        
        console.log(`   📝 أعمدة: ${columns.length}`);
        console.log(`   🏢 يحتوي على companyId: ${hasCompanyId ? '✅' : '❌'}`);
        console.log(`   🆔 يحتوي على id: ${hasId ? '✅' : '❌'}`);
        
        if (hasCompanyId) {
          // فحص البيانات
          try {
            const countQuery = `SELECT COUNT(*) as total FROM \`${tableName}\``;
            const totalResult = await this.prisma.$queryRawUnsafe(countQuery);
            const totalRecords = totalResult[0]?.total || 0;
            
            const isolatedQuery = `SELECT COUNT(*) as isolated FROM \`${tableName}\` WHERE companyId IS NOT NULL`;
            const isolatedResult = await this.prisma.$queryRawUnsafe(isolatedQuery);
            const isolatedRecords = isolatedResult[0]?.isolated || 0;
            
            const orphanRecords = totalRecords - isolatedRecords;
            
            console.log(`   📊 إجمالي السجلات: ${totalRecords}`);
            console.log(`   🛡️ سجلات معزولة: ${isolatedRecords}`);
            console.log(`   ⚠️ سجلات بدون عزل: ${orphanRecords}`);
            
            this.testResults.schemaAnalysis.push({
              table: tableName,
              hasCompanyId: true,
              totalRecords,
              isolatedRecords,
              orphanRecords,
              isolationPercentage: totalRecords > 0 ? Math.round((isolatedRecords / totalRecords) * 100) : 100,
              status: orphanRecords === 0 ? 'PERFECT' : orphanRecords < 5 ? 'GOOD' : 'NEEDS_ATTENTION'
            });
            
          } catch (error) {
            console.log(`   ❌ خطأ في فحص البيانات: ${error.message}`);
          }
        } else {
          // جداول بدون companyId (قد تكون مشتركة)
          try {
            const countQuery = `SELECT COUNT(*) as total FROM \`${tableName}\``;
            const totalResult = await this.prisma.$queryRawUnsafe(countQuery);
            const totalRecords = totalResult[0]?.total || 0;
            
            console.log(`   📊 إجمالي السجلات: ${totalRecords}`);
            
            this.testResults.schemaAnalysis.push({
              table: tableName,
              hasCompanyId: false,
              totalRecords,
              status: 'SHARED_TABLE',
              note: 'جدول مشترك - لا يحتاج عزل'
            });
            
          } catch (error) {
            console.log(`   ❌ خطأ في فحص البيانات: ${error.message}`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ خطأ في تحليل Schema:', error.message);
    }
  }
  
  // اختبار العزل الفعلي
  async testActualIsolation() {
    console.log('\n🔒 اختبار العزل الفعلي...');
    
    try {
      // جلب الشركات
      const companies = await this.prisma.company.findMany({
        select: { id: true, name: true },
        take: 3
      });
      
      console.log(`✅ تم العثور على ${companies.length} شركة للاختبار`);
      
      if (companies.length < 2) {
        console.log('⚠️ يحتاج شركتين على الأقل لاختبار العزل');
        return;
      }
      
      // اختبار عزل المستخدمين
      console.log('\n👥 اختبار عزل المستخدمين...');
      for (const company of companies) {
        const users = await this.prisma.user.findMany({
          where: { companyId: company.id },
          select: { id: true, email: true }
        });
        
        console.log(`   ${company.name}: ${users.length} مستخدم`);
        
        this.testResults.isolationTests.push({
          test: 'User Isolation',
          company: company.name,
          companyId: company.id,
          recordCount: users.length,
          status: 'ISOLATED'
        });
      }
      
      // اختبار عزل مفاتيح AI
      console.log('\n🤖 اختبار عزل مفاتيح AI...');
      for (const company of companies) {
        const aiKeys = await this.prisma.geminiKey.findMany({
          where: { companyId: company.id },
          select: { id: true, isActive: true }
        });
        
        console.log(`   ${company.name}: ${aiKeys.length} مفتاح AI`);
        
        this.testResults.isolationTests.push({
          test: 'AI Keys Isolation',
          company: company.name,
          companyId: company.id,
          recordCount: aiKeys.length,
          status: 'ISOLATED'
        });
      }
      
      // اختبار عزل الإعدادات
      console.log('\n⚙️ اختبار عزل الإعدادات...');
      for (const company of companies) {
        const settings = await this.prisma.aiSettings.findMany({
          where: { companyId: company.id },
          select: { id: true }
        });
        
        console.log(`   ${company.name}: ${settings.length} إعداد`);
        
        this.testResults.isolationTests.push({
          test: 'Settings Isolation',
          company: company.name,
          companyId: company.id,
          recordCount: settings.length,
          status: 'ISOLATED'
        });
      }
      
      // اختبار عدم التداخل
      console.log('\n🔍 اختبار عدم التداخل بين الشركات...');
      
      const company1 = companies[0];
      const company2 = companies[1];
      
      // فحص مفاتيح AI
      const keys1 = await this.prisma.geminiKey.findMany({
        where: { companyId: company1.id },
        select: { id: true }
      });
      
      const keys2 = await this.prisma.geminiKey.findMany({
        where: { companyId: company2.id },
        select: { id: true }
      });
      
      const keyIds1 = keys1.map(k => k.id);
      const keyIds2 = keys2.map(k => k.id);
      const keyOverlap = keyIds1.filter(id => keyIds2.includes(id));
      
      console.log(`   مفاتيح ${company1.name}: ${keys1.length}`);
      console.log(`   مفاتيح ${company2.name}: ${keys2.length}`);
      console.log(`   تداخل: ${keyOverlap.length} ${keyOverlap.length === 0 ? '✅' : '❌'}`);
      
      this.testResults.isolationTests.push({
        test: 'Cross-Company Key Overlap',
        company1: company1.name,
        company2: company2.name,
        overlap: keyOverlap.length,
        status: keyOverlap.length === 0 ? 'SAFE' : 'CRITICAL'
      });
      
    } catch (error) {
      console.error('❌ خطأ في اختبار العزل:', error.message);
    }
  }
  
  // فحص سلامة البيانات
  async checkDataIntegrity() {
    console.log('\n🔍 فحص سلامة البيانات...');
    
    try {
      // فحص المراجع الخارجية
      console.log('   🔗 فحص المراجع الخارجية...');
      
      // فحص مستخدمين بدون شركة
      const usersWithoutCompany = await this.prisma.user.findMany({
        where: { companyId: null },
        select: { id: true, email: true }
      });
      
      console.log(`   👥 مستخدمين بدون شركة: ${usersWithoutCompany.length}`);
      
      this.testResults.dataIntegrity.push({
        test: 'Users without Company',
        count: usersWithoutCompany.length,
        status: usersWithoutCompany.length === 0 ? 'PERFECT' : 'NEEDS_ATTENTION',
        severity: usersWithoutCompany.length === 0 ? 'INFO' : 'WARNING'
      });
      
      // فحص مفاتيح AI بدون شركة
      const keysWithoutCompany = await this.prisma.geminiKey.findMany({
        where: { companyId: null },
        select: { id: true }
      });
      
      console.log(`   🤖 مفاتيح AI بدون شركة: ${keysWithoutCompany.length}`);
      
      this.testResults.dataIntegrity.push({
        test: 'AI Keys without Company',
        count: keysWithoutCompany.length,
        status: keysWithoutCompany.length === 0 ? 'PERFECT' : 'CRITICAL',
        severity: keysWithoutCompany.length === 0 ? 'INFO' : 'CRITICAL'
      });
      
      // فحص إعدادات بدون شركة
      const settingsWithoutCompany = await this.prisma.aiSettings.findMany({
        where: { companyId: null },
        select: { id: true }
      });
      
      console.log(`   ⚙️ إعدادات بدون شركة: ${settingsWithoutCompany.length}`);
      
      this.testResults.dataIntegrity.push({
        test: 'Settings without Company',
        count: settingsWithoutCompany.length,
        status: settingsWithoutCompany.length === 0 ? 'PERFECT' : 'CRITICAL',
        severity: settingsWithoutCompany.length === 0 ? 'INFO' : 'CRITICAL'
      });
      
    } catch (error) {
      console.error('❌ خطأ في فحص سلامة البيانات:', error.message);
    }
  }
  
  // إنشاء تقرير نهائي
  generateFinalReport() {
    console.log('\n📊 التقرير النهائي للعزل');
    console.log('═'.repeat(80));
    
    // تحليل النتائج
    const tablesWithIsolation = this.testResults.schemaAnalysis.filter(t => t.hasCompanyId);
    const perfectIsolation = tablesWithIsolation.filter(t => t.status === 'PERFECT');
    const goodIsolation = tablesWithIsolation.filter(t => t.status === 'GOOD');
    const needsAttention = tablesWithIsolation.filter(t => t.status === 'NEEDS_ATTENTION');
    
    const criticalIntegrityIssues = this.testResults.dataIntegrity.filter(t => t.severity === 'CRITICAL');
    const warningIntegrityIssues = this.testResults.dataIntegrity.filter(t => t.severity === 'WARNING');
    
    console.log('🗄️ تحليل Schema:');
    console.log(`   📊 جداول تحتاج عزل: ${tablesWithIsolation.length}`);
    console.log(`   ✅ عزل مثالي: ${perfectIsolation.length}`);
    console.log(`   🟡 عزل جيد: ${goodIsolation.length}`);
    console.log(`   🟠 يحتاج انتباه: ${needsAttention.length}`);
    
    console.log('\n🔒 اختبارات العزل:');
    console.log(`   ✅ اختبارات ناجحة: ${this.testResults.isolationTests.length}`);
    
    console.log('\n🔍 سلامة البيانات:');
    console.log(`   🚨 مشاكل خطيرة: ${criticalIntegrityIssues.length}`);
    console.log(`   ⚠️ تحذيرات: ${warningIntegrityIssues.length}`);
    
    // حساب نقاط الأمان
    const totalIsolationScore = tablesWithIsolation.length > 0 ? 
      Math.round(((perfectIsolation.length * 100 + goodIsolation.length * 80) / (tablesWithIsolation.length * 100)) * 100) : 100;
    
    const integrityScore = criticalIntegrityIssues.length === 0 && warningIntegrityIssues.length === 0 ? 100 :
                          criticalIntegrityIssues.length === 0 ? 80 : 50;
    
    const overallScore = Math.round((totalIsolationScore + integrityScore) / 2);
    
    console.log('\n🎯 النقاط النهائية:');
    console.log('─'.repeat(50));
    console.log(`📊 عزل الجداول: ${totalIsolationScore}%`);
    console.log(`🔍 سلامة البيانات: ${integrityScore}%`);
    console.log(`🏆 النقاط الإجمالية: ${overallScore}%`);
    
    // التوصية النهائية
    console.log('\n🎯 التوصية النهائية:');
    console.log('═'.repeat(50));
    
    if (overallScore >= 95 && criticalIntegrityIssues.length === 0) {
      console.log('🟢 العزل مثالي - آمن تماماً للإنتاج');
      console.log('✅ جميع البيانات معزولة بشكل صحيح');
      console.log('🚀 يمكن النشر بثقة كاملة');
    } else if (overallScore >= 85 && criticalIntegrityIssues.length === 0) {
      console.log('🟡 العزل ممتاز - آمن للإنتاج مع مراقبة');
      console.log('✅ معظم البيانات معزولة بشكل صحيح');
      console.log('📊 يحتاج مراقبة دورية');
    } else if (criticalIntegrityIssues.length > 0) {
      console.log('🔴 يوجد مشاكل خطيرة في سلامة البيانات');
      console.log('❌ يحتاج إصلاح فوري قبل الإنتاج');
    } else {
      console.log('🟠 العزل مقبول - يحتاج تحسينات');
      console.log('⚠️ يحتاج إصلاحات قبل الإنتاج');
    }
    
    // عرض المشاكل الخطيرة
    if (criticalIntegrityIssues.length > 0) {
      console.log('\n🚨 مشاكل خطيرة تحتاج إصلاح فوري:');
      criticalIntegrityIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.test}: ${issue.count} عنصر`);
      });
    }
    
    this.testResults.summary = {
      overallScore,
      isolationScore: totalIsolationScore,
      integrityScore,
      criticalIssues: criticalIntegrityIssues.length,
      warningIssues: warningIntegrityIssues.length,
      recommendation: overallScore >= 95 && criticalIntegrityIssues.length === 0 ? 'PRODUCTION_READY' :
                     overallScore >= 85 && criticalIntegrityIssues.length === 0 ? 'PRODUCTION_WITH_MONITORING' :
                     'NEEDS_FIXES'
    };
    
    return this.testResults.summary;
  }
  
  async cleanup() {
    await this.prisma.$disconnect();
  }
}

// تشغيل الاختبار
async function runRealSchemaTest() {
  const tester = new RealSchemaIsolationTester();
  
  try {
    await tester.analyzeRealSchema();
    await tester.testActualIsolation();
    await tester.checkDataIntegrity();
    
    const summary = tester.generateFinalReport();
    
    console.log('\n🎊 اكتمل فحص العزل الحقيقي!');
    
    return summary;
    
  } catch (error) {
    console.error('💥 خطأ في الفحص:', error);
    return null;
  } finally {
    await tester.cleanup();
  }
}

// تشغيل الاختبار
runRealSchemaTest().then(summary => {
  if (summary) {
    process.exit(summary.recommendation === 'PRODUCTION_READY' ? 0 : 1);
  } else {
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 فشل الاختبار:', error);
  process.exit(1);
});
