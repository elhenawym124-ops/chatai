const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMemoryTable() {
  console.log('🔧 إنشاء جدول conversation_memory...');
  
  try {
    // محاولة إنشاء الجدول باستخدام SQL مباشر
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS conversation_memory (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        conversationId VARCHAR(191) NOT NULL,
        senderId VARCHAR(191) NOT NULL,
        userMessage TEXT NOT NULL,
        aiResponse TEXT NOT NULL,
        intent VARCHAR(191),
        sentiment VARCHAR(191),
        timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        metadata TEXT,
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
        conversationId: 'test-conv-id',
        senderId: 'test-sender',
        userMessage: 'اختبار',
        aiResponse: 'رد اختبار',
        intent: 'test',
        sentiment: 'neutral'
      }
    });
    
    console.log('✅ اختبار الجدول نجح:', testRecord.id);
    
    // حذف السجل التجريبي
    await prisma.conversationMemory.delete({
      where: { id: testRecord.id }
    });
    
    console.log('✅ تم حذف السجل التجريبي');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الجدول:', error);
    
    // محاولة بديلة - إنشاء الجدول بطريقة مختلفة
    try {
      console.log('🔄 محاولة بديلة...');
      
      await prisma.$executeRaw`
        CREATE TABLE conversation_memory (
          id VARCHAR(191) NOT NULL,
          conversationId VARCHAR(191) NOT NULL,
          senderId VARCHAR(191) NOT NULL,
          userMessage LONGTEXT NOT NULL,
          aiResponse LONGTEXT NOT NULL,
          intent VARCHAR(191) NULL,
          sentiment VARCHAR(191) NULL,
          timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          metadata LONGTEXT NULL,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id)
        )
      `;
      
      console.log('✅ الجدول تم إنشاؤه بالطريقة البديلة!');
      
    } catch (altError) {
      console.error('❌ فشل في الطريقة البديلة أيضاً:', altError);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createMemoryTable();
