/**
 * فاحص صحة الرسائل - يكتشف ويصلح الرسائل المعطوبة تلقائياً
 */

const { PrismaClient } = require('@prisma/client');
const AttachmentValidator = require('./attachmentValidator');

class MessageHealthChecker {
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  /**
   * فحص شامل لجميع الرسائل في قاعدة البيانات
   */
  async checkAllMessages() {
    console.log('🔍 [HEALTH-CHECK] Starting comprehensive message health check...');
    
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          attachments: {
            not: null
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`📊 [HEALTH-CHECK] Found ${messages.length} messages with attachments`);
      
      const results = {
        total: messages.length,
        healthy: 0,
        broken: 0,
        fixed: 0,
        unfixable: 0,
        details: []
      };
      
      for (const message of messages) {
        const result = await this.checkSingleMessage(message);
        results.details.push(result);
        
        if (result.status === 'healthy') {
          results.healthy++;
        } else if (result.status === 'broken') {
          results.broken++;
        } else if (result.status === 'fixed') {
          results.fixed++;
        } else if (result.status === 'unfixable') {
          results.unfixable++;
        }
      }
      
      console.log('📊 [HEALTH-CHECK] Results:');
      console.log(`   ✅ Healthy: ${results.healthy}`);
      console.log(`   ❌ Broken: ${results.broken}`);
      console.log(`   🔧 Fixed: ${results.fixed}`);
      console.log(`   💀 Unfixable: ${results.unfixable}`);
      
      return results;
      
    } catch (error) {
      console.error('❌ [HEALTH-CHECK] Error:', error.message);
      throw error;
    }
  }
  
  /**
   * فحص رسالة واحدة
   */
  async checkSingleMessage(message) {
    const result = {
      messageId: message.id,
      conversationId: message.conversationId,
      type: message.type,
      status: 'unknown',
      error: null,
      fixed: false
    };
    
    try {
      // فحص صحة JSON
      const validation = AttachmentValidator.validateAttachmentsJSON(message.attachments);
      
      if (validation.isValid) {
        result.status = 'healthy';
        return result;
      }
      
      // الرسالة معطوبة، محاولة الإصلاح
      console.log(`🔧 [HEALTH-CHECK] Fixing broken message: ${message.id}`);
      result.status = 'broken';
      result.error = validation.error;
      
      const fixed = AttachmentValidator.fixBrokenAttachments(
        message.attachments,
        message.content
      );
      
      if (fixed) {
        // تحديث الرسالة في قاعدة البيانات
        await this.prisma.message.update({
          where: { id: message.id },
          data: { 
            attachments: JSON.stringify(fixed),
            metadata: this.updateMetadata(message.metadata, {
              healthCheck: {
                fixedAt: new Date().toISOString(),
                originalError: validation.error,
                autoFixed: true
              }
            })
          }
        });
        
        result.status = 'fixed';
        result.fixed = true;
        console.log(`✅ [HEALTH-CHECK] Fixed message: ${message.id}`);
        
      } else {
        // لا يمكن إصلاحها، حذف المرفقات
        await this.prisma.message.update({
          where: { id: message.id },
          data: { 
            attachments: null,
            metadata: this.updateMetadata(message.metadata, {
              healthCheck: {
                clearedAt: new Date().toISOString(),
                originalError: validation.error,
                reason: 'unfixable_attachments'
              }
            })
          }
        });
        
        result.status = 'unfixable';
        console.log(`🗑️ [HEALTH-CHECK] Cleared unfixable attachments: ${message.id}`);
      }
      
    } catch (error) {
      result.error = error.message;
      console.error(`❌ [HEALTH-CHECK] Error checking message ${message.id}:`, error.message);
    }
    
    return result;
  }
  
  /**
   * تحديث metadata مع الحفاظ على البيانات الموجودة
   */
  updateMetadata(existingMetadata, newData) {
    try {
      const existing = existingMetadata ? JSON.parse(existingMetadata) : {};
      const updated = { ...existing, ...newData };
      return JSON.stringify(updated);
    } catch (error) {
      return JSON.stringify(newData);
    }
  }
  
  /**
   * فحص محادثة محددة
   */
  async checkConversation(conversationId) {
    console.log(`🔍 [HEALTH-CHECK] Checking conversation: ${conversationId}`);
    
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          conversationId: conversationId,
          attachments: {
            not: null
          }
        },
        orderBy: { createdAt: 'asc' }
      });
      
      console.log(`📊 [HEALTH-CHECK] Found ${messages.length} messages with attachments in conversation`);
      
      const results = [];
      
      for (const message of messages) {
        const result = await this.checkSingleMessage(message);
        results.push(result);
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ [HEALTH-CHECK] Error checking conversation:', error.message);
      throw error;
    }
  }
  
  /**
   * إغلاق الاتصال
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = MessageHealthChecker;
