/**
 * خدمة الدردشة الذكية الطبيعية
 */

const memoryService = require('./memoryService');
const aiAgentService = require('./aiAgentService');

class IntelligentChatService {
  constructor() {
    this.conversationMemory = new Map(); // ذاكرة محلية للمحادثات
    this.systemAnalytics = {
      totalRequests: 0,
      successfulResponses: 0,
      failedResponses: 0,
      averageResponseTime: 0,
      startTime: new Date()
    };
  }

  /**
   * توليد رد ذكي وطبيعي
   */
  async generateIntelligentResponse(message, conversationHistory = [], companyId, customerId) {
    const startTime = Date.now();
    this.systemAnalytics.totalRequests++;

    try {
      console.log('🧠 [IntelligentChat] Processing intelligent response...');
      console.log(`📝 Message: "${message}"`);
      console.log(`🏢 Company: ${companyId}`);
      console.log(`👤 Customer: ${customerId}`);

      // التحقق من المعاملات المطلوبة
      if (!companyId) {
        throw new Error('companyId is required for memory isolation');
      }

      // إنشاء معرف محادثة فريد
      const conversationId = `intelligent_${companyId}_${customerId}_${Date.now()}`;

      // تحضير بيانات الرسالة
      const messageData = {
        conversationId,
        senderId: customerId,
        companyId,
        content: message,
        customerData: {
          id: customerId,
          name: `Customer ${customerId}`,
          isReturning: conversationHistory.length > 0
        }
      };

      // استخدام aiAgentService لمعالجة الرسالة
      const response = await aiAgentService.processCustomerMessage(messageData);

      // حفظ في الذاكرة المحلية
      this.saveToLocalMemory(customerId, companyId, {
        message,
        response: response.content,
        timestamp: new Date(),
        conversationId
      });

      // تحديث الإحصائيات
      const processingTime = Date.now() - startTime;
      this.updateAnalytics(true, processingTime);

      console.log('✅ [IntelligentChat] Response generated successfully');

      return {
        success: true,
        content: response.content,
        intent: response.intent || 'general_inquiry',
        sentiment: response.sentiment || 'neutral',
        processingTime,
        conversationId,
        memoryUsed: true,
        systemInfo: {
          service: 'IntelligentChatService',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ [IntelligentChat] Error generating response:', error);
      
      // تحديث الإحصائيات
      const processingTime = Date.now() - startTime;
      this.updateAnalytics(false, processingTime);

      return {
        success: false,
        error: error.message,
        content: 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.',
        processingTime,
        systemInfo: {
          service: 'IntelligentChatService',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * الحصول على ذاكرة المحادثة
   */
  async getConversationMemory(customerId, companyId, limit = 10) {
    try {
      // ✅ التحقق من وجود companyId للعزل الأمني
      if (!companyId) {
        throw new Error('companyId is required for memory isolation');
      }

      console.log(`🧠 [IntelligentChat] Getting conversation memory for customer ${customerId} in company ${companyId}`);

      // محاولة الحصول على الذاكرة من memoryService
      const conversationId = `intelligent_${companyId}_${customerId}`;
      const memory = await memoryService.getConversationMemory(
        conversationId,
        customerId,
        limit,
        companyId // ✅ إضافة companyId للعزل الأمني
      );

      // إذا لم توجد ذاكرة في قاعدة البيانات، جرب الذاكرة المحلية
      if (!memory || memory.length === 0) {
        const localMemoryKey = `${companyId}_${customerId}`;
        const localMemory = this.conversationMemory.get(localMemoryKey) || [];
        
        console.log(`🧠 [IntelligentChat] Found ${localMemory.length} local memory entries`);
        return localMemory.slice(-limit);
      }

      console.log(`🧠 [IntelligentChat] Found ${memory.length} memory entries from database`);
      return memory;

    } catch (error) {
      console.error('❌ [IntelligentChat] Error getting conversation memory:', error);
      return [];
    }
  }

  /**
   * حفظ في الذاكرة المحلية
   */
  saveToLocalMemory(customerId, companyId, interaction) {
    try {
      const memoryKey = `${companyId}_${customerId}`;
      
      if (!this.conversationMemory.has(memoryKey)) {
        this.conversationMemory.set(memoryKey, []);
      }

      const memory = this.conversationMemory.get(memoryKey);
      memory.push(interaction);

      // الاحتفاظ بآخر 20 تفاعل فقط
      if (memory.length > 20) {
        memory.shift();
      }

      console.log(`💾 [IntelligentChat] Saved interaction to local memory for ${memoryKey}`);

    } catch (error) {
      console.error('❌ [IntelligentChat] Error saving to local memory:', error);
    }
  }

  /**
   * تنظيف الذاكرة
   */
  cleanupMemory() {
    try {
      console.log('🧹 [IntelligentChat] Cleaning up memory...');
      
      const beforeSize = this.conversationMemory.size;
      
      // تنظيف الذاكرة القديمة (أكثر من ساعة)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      for (const [key, memory] of this.conversationMemory.entries()) {
        const filteredMemory = memory.filter(interaction => 
          new Date(interaction.timestamp).getTime() > oneHourAgo
        );
        
        if (filteredMemory.length === 0) {
          this.conversationMemory.delete(key);
        } else {
          this.conversationMemory.set(key, filteredMemory);
        }
      }

      const afterSize = this.conversationMemory.size;
      console.log(`🧹 [IntelligentChat] Cleaned up memory: ${beforeSize} -> ${afterSize} conversations`);

    } catch (error) {
      console.error('❌ [IntelligentChat] Error cleaning up memory:', error);
    }
  }

  /**
   * تحديث الإحصائيات
   */
  updateAnalytics(success, processingTime) {
    try {
      if (success) {
        this.systemAnalytics.successfulResponses++;
      } else {
        this.systemAnalytics.failedResponses++;
      }

      // حساب متوسط وقت الاستجابة
      const totalResponses = this.systemAnalytics.successfulResponses + this.systemAnalytics.failedResponses;
      this.systemAnalytics.averageResponseTime = 
        ((this.systemAnalytics.averageResponseTime * (totalResponses - 1)) + processingTime) / totalResponses;

    } catch (error) {
      console.error('❌ [IntelligentChat] Error updating analytics:', error);
    }
  }

  /**
   * الحصول على إحصائيات النظام
   */
  getSystemAnalytics() {
    try {
      const uptime = Date.now() - this.systemAnalytics.startTime.getTime();
      const successRate = this.systemAnalytics.totalRequests > 0 
        ? (this.systemAnalytics.successfulResponses / this.systemAnalytics.totalRequests) * 100 
        : 0;

      return {
        ...this.systemAnalytics,
        uptime: Math.round(uptime / 1000), // بالثواني
        successRate: Math.round(successRate * 100) / 100, // نسبة النجاح
        memorySize: this.conversationMemory.size,
        averageResponseTime: Math.round(this.systemAnalytics.averageResponseTime),
        status: 'active',
        version: '1.0.0'
      };

    } catch (error) {
      console.error('❌ [IntelligentChat] Error getting analytics:', error);
      return {
        error: error.message,
        status: 'error'
      };
    }
  }

  /**
   * اختبار النظام
   */
  async testSystem(companyId) {
    try {
      console.log('🧪 [IntelligentChat] Testing system...');

      const testMessage = 'مرحبا، أريد اختبار النظام';
      const testCustomerId = `test_${Date.now()}`;

      const response = await this.generateIntelligentResponse(
        testMessage,
        [],
        companyId,
        testCustomerId
      );

      return {
        success: true,
        testResult: response,
        systemStatus: 'operational',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ [IntelligentChat] System test failed:', error);
      return {
        success: false,
        error: error.message,
        systemStatus: 'error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = IntelligentChatService;
