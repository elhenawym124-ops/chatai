/**
 * سكريبت فحص صحة الرسائل
 * يمكن تشغيله يدوياً أو كمهمة دورية
 */

const MessageHealthChecker = require('../utils/messageHealthChecker');

async function runHealthCheck() {
  const checker = new MessageHealthChecker();
  
  try {
    console.log('🚀 [HEALTH-CHECK] Starting message health check...');
    console.log('⏰ [HEALTH-CHECK] Time:', new Date().toISOString());
    
    const results = await checker.checkAllMessages();
    
    console.log('\n📊 [HEALTH-CHECK] Final Summary:');
    console.log('================================');
    console.log(`📨 Total messages checked: ${results.total}`);
    console.log(`✅ Healthy messages: ${results.healthy}`);
    console.log(`❌ Broken messages: ${results.broken}`);
    console.log(`🔧 Fixed messages: ${results.fixed}`);
    console.log(`💀 Unfixable messages: ${results.unfixable}`);
    
    if (results.fixed > 0) {
      console.log(`\n🎉 Successfully fixed ${results.fixed} broken messages!`);
    }
    
    if (results.broken > 0) {
      console.log(`\n⚠️ Warning: ${results.broken} messages still have issues`);
    }
    
    // إحصائيات مفصلة
    if (results.details.length > 0) {
      console.log('\n📋 [HEALTH-CHECK] Detailed Results:');
      console.log('===================================');
      
      const brokenMessages = results.details.filter(d => d.status === 'broken');
      const fixedMessages = results.details.filter(d => d.status === 'fixed');
      const unfixableMessages = results.details.filter(d => d.status === 'unfixable');
      
      if (fixedMessages.length > 0) {
        console.log(`\n🔧 Fixed Messages (${fixedMessages.length}):`);
        fixedMessages.forEach(msg => {
          console.log(`   - ${msg.messageId} in conversation ${msg.conversationId}`);
        });
      }
      
      if (unfixableMessages.length > 0) {
        console.log(`\n💀 Unfixable Messages (${unfixableMessages.length}):`);
        unfixableMessages.forEach(msg => {
          console.log(`   - ${msg.messageId} in conversation ${msg.conversationId}: ${msg.error}`);
        });
      }
      
      if (brokenMessages.length > 0) {
        console.log(`\n❌ Still Broken Messages (${brokenMessages.length}):`);
        brokenMessages.forEach(msg => {
          console.log(`   - ${msg.messageId} in conversation ${msg.conversationId}: ${msg.error}`);
        });
      }
    }
    
    console.log('\n✅ [HEALTH-CHECK] Health check completed successfully!');
    
  } catch (error) {
    console.error('❌ [HEALTH-CHECK] Health check failed:', error.message);
    process.exit(1);
  } finally {
    await checker.disconnect();
  }
}

// تشغيل الفحص إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runHealthCheck();
}

module.exports = { runHealthCheck };
