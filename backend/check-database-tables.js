const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseTables() {
  console.log('🔍 فحص الجداول الموجودة في قاعدة البيانات...');
  
  try {
    // عرض جميع الجداول
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    
    console.log('📋 الجداول الموجودة:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    
    // البحث عن جداول AI
    console.log('\n🤖 البحث عن جداول الذكاء الصناعي...');
    const aiTables = tables.filter(table => {
      const tableName = Object.values(table)[0].toLowerCase();
      return tableName.includes('ai') || tableName.includes('settings');
    });
    
    if (aiTables.length > 0) {
      console.log('✅ جداول الذكاء الصناعي الموجودة:');
      aiTables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    } else {
      console.log('❌ لا توجد جداول للذكاء الصناعي');
    }
    
    // فحص جدول الشركات
    console.log('\n🏢 فحص جدول الشركات...');
    try {
      const companies = await prisma.company.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true
        }
      });
      
      console.log(`✅ تم العثور على ${companies.length} شركة:`);
      companies.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company.name} (${company.id})`);
      });
    } catch (error) {
      console.log('❌ خطأ في فحص جدول الشركات:', error.message);
    }

  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseTables();
