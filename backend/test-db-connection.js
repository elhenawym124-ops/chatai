const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 اختبار الاتصال بقاعدة البيانات...');
    console.log('🔗 URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    // اختبار الاتصال
    await prisma.$connect();
    console.log('✅ الاتصال بقاعدة البيانات نجح!');
    
    // اختبار استعلام بسيط
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ استعلام الاختبار نجح:', result);
    
    // فحص الجداول الموجودة
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log(`📊 الجداول الموجودة: ${tables.length} جدول`);
    
    // البحث عن جدول conversation_memory
    const memoryTable = tables.find(t => Object.values(t)[0] === 'conversation_memory');
    if (memoryTable) {
      console.log('✅ جدول conversation_memory موجود');
      
      // فحص بنية الجدول
      const structure = await prisma.$queryRaw`DESCRIBE conversation_memory`;
      console.log('📋 بنية الجدول:');
      structure.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type}`);
      });
      
    } else {
      console.log('❌ جدول conversation_memory غير موجود');
      console.log('📋 الجداول الموجودة:');
      tables.slice(0, 10).forEach((table, i) => {
        console.log(`   ${i+1}. ${Object.values(table)[0]}`);
      });
      
      // محاولة إنشاء الجدول
      console.log('\n🔧 محاولة إنشاء جدول conversation_memory...');
      await createMemoryTable();
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
    console.error('📋 كود الخطأ:', error.code);
    
    if (error.code === 'P1001') {
      console.log('💡 الحل المقترح: تحقق من:');
      console.log('   1. اتصال الإنترنت');
      console.log('   2. عنوان قاعدة البيانات');
      console.log('   3. بيانات الاعتماد');
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function createMemoryTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS conversation_memory (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        conversationId VARCHAR(191) NOT NULL,
        senderId VARCHAR(191) NOT NULL,
        userMessage LONGTEXT NOT NULL,
        aiResponse LONGTEXT NOT NULL,
        intent VARCHAR(191),
        sentiment VARCHAR(191),
        timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        metadata LONGTEXT,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        INDEX idx_conversation_memory_conversationId (conversationId),
        INDEX idx_conversation_memory_senderId (senderId),
        INDEX idx_conversation_memory_timestamp (timestamp)
      )
    `;
    
    console.log('✅ جدول conversation_memory تم إنشاؤه بنجاح!');
    
    // اختبار الجدول
    const testRecord = await prisma.conversationMemory.create({
      data: {
        conversationId: 'test-conv',
        senderId: 'test-sender',
        userMessage: 'اختبار',
        aiResponse: 'رد اختبار'
      }
    });
    
    console.log('✅ اختبار الجدول نجح:', testRecord.id);
    
    // حذف السجل التجريبي
    await prisma.conversationMemory.delete({
      where: { id: testRecord.id }
    });
    
    console.log('✅ تم حذف السجل التجريبي');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الجدول:', error.message);
  }
}

testConnection();
