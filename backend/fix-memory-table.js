const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMemoryTable() {
  console.log('🔧 Fixing conversation memory table...\n');
  
  try {
    // Drop and recreate the table with correct schema
    console.log('🗑️ Dropping existing table...');
    await prisma.$executeRaw`DROP TABLE IF EXISTS conversation_memory`;
    
    console.log('🆕 Creating new table with correct schema...');
    await prisma.$executeRaw`
      CREATE TABLE conversation_memory (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        conversationId VARCHAR(191) NOT NULL,
        senderId VARCHAR(191) NOT NULL,
        userMessage LONGTEXT NOT NULL,
        aiResponse LONGTEXT NOT NULL,
        intent VARCHAR(191) NULL,
        sentiment VARCHAR(191) NULL,
        timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        metadata LONGTEXT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX idx_conversation_memory_conversationId (conversationId),
        INDEX idx_conversation_memory_senderId (senderId),
        INDEX idx_conversation_memory_timestamp (timestamp)
      )
    `;
    
    console.log('✅ Table created successfully!');
    
    // Test the table
    console.log('🧪 Testing table...');
    const testRecord = await prisma.conversationMemory.create({
      data: {
        conversationId: 'test-conv-id',
        senderId: 'test-sender',
        userMessage: 'اختبار الذاكرة',
        aiResponse: 'رد اختبار الذاكرة',
        intent: 'test',
        sentiment: 'neutral'
      }
    });
    
    console.log('✅ Test record created:', testRecord.id);
    
    // Retrieve the test record
    const retrieved = await prisma.conversationMemory.findUnique({
      where: { id: testRecord.id }
    });
    
    console.log('✅ Test record retrieved successfully');
    
    // Clean up test record
    await prisma.conversationMemory.delete({
      where: { id: testRecord.id }
    });
    
    console.log('✅ Test record cleaned up');
    console.log('\n🎉 Memory table is now ready!');
    
  } catch (error) {
    console.error('❌ Error fixing memory table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMemoryTable();
