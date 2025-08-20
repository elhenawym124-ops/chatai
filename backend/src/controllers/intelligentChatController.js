/**
 * Controller للدردشة الذكية الطبيعية
 */

const IntelligentChatService = require('../services/intelligentChatService');

class IntelligentChatController {
  constructor() {
    this.intelligentChatService = new IntelligentChatService();
    
    // حفظ المرجع العام للتنظيف
    global.intelligentChatService = this.intelligentChatService;
  }

  /**
   * توليد رد ذكي وطبيعي
   * POST /api/v1/ai/intelligent-response
   */
  async generateIntelligentResponse(req, res) {
    try {
      const { message, companyId, customerId, conversationHistory = [] } = req.body;

      // التحقق من البيانات المطلوبة
      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'الرسالة مطلوبة'
        });
      }

      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'معرف الشركة مطلوب'
        });
      }

      console.log('🚀 طلب رد ذكي جديد...');
      console.log(`💬 الرسالة: "${message}"`);
      console.log(`🏢 الشركة: ${companyId}`);
      console.log(`👤 العميل: ${customerId || 'غير محدد'}`);

      // توليد الرد الذكي
      const result = await this.intelligentChatService.generateIntelligentResponse(
        message,
        conversationHistory,
        companyId,
        customerId || `anonymous_${Date.now()}`
      );

      // إضافة معلومات إضافية للاستجابة
      const response = {
        ...result,
        timestamp: new Date().toISOString(),
        requestId: `intelligent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        systemVersion: 'intelligent-chat-v1.0'
      };

      console.log('✅ تم إرجاع الرد الذكي بنجاح');
      res.json(response);

    } catch (error) {
      console.error('❌ خطأ في controller الدردشة الذكية:', error);
      
      res.status(500).json({
        success: false,
        error: 'حدث خطأ في النظام',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * الحصول على إحصائيات النظام
   * GET /api/v1/ai/intelligent-analytics
   */
  async getSystemAnalytics(req, res) {
    try {
      const analytics = this.intelligentChatService.getSystemAnalytics();
      
      res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ خطأ في جلب الإحصائيات:', error);
      
      res.status(500).json({
        success: false,
        error: 'حدث خطأ في جلب الإحصائيات',
        details: error.message
      });
    }
  }

  /**
   * الحصول على ذاكرة محادثة عميل
   * GET /api/v1/ai/conversation-memory/:customerId
   */
  async getConversationMemory(req, res) {
    try {
      const { customerId } = req.params;
      const { companyId } = req.query; // ✅ إضافة companyId من query parameters

      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'معرف العميل مطلوب'
        });
      }

      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'معرف الشركة مطلوب للعزل الأمني'
        });
      }

      const memory = this.intelligentChatService.getConversationMemory(customerId, companyId);
      
      res.json({
        success: true,
        data: {
          customerId,
          conversationHistory: memory,
          messageCount: memory.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ خطأ في جلب ذاكرة المحادثة:', error);
      
      res.status(500).json({
        success: false,
        error: 'حدث خطأ في جلب ذاكرة المحادثة',
        details: error.message
      });
    }
  }

  /**
   * تنظيف الذاكرة يدوياً
   * POST /api/v1/ai/cleanup-memory
   */
  async cleanupMemory(req, res) {
    try {
      console.log('🧹 بدء تنظيف الذاكرة يدوياً...');
      
      this.intelligentChatService.cleanupMemory();
      
      const analytics = this.intelligentChatService.getSystemAnalytics();
      
      res.json({
        success: true,
        message: 'تم تنظيف الذاكرة بنجاح',
        data: analytics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ خطأ في تنظيف الذاكرة:', error);
      
      res.status(500).json({
        success: false,
        error: 'حدث خطأ في تنظيف الذاكرة',
        details: error.message
      });
    }
  }

  /**
   * اختبار النظام الذكي
   * POST /api/v1/ai/test-intelligent
   */
  async testIntelligentSystem(req, res) {
    try {
      const testMessages = [
        'مرحبا',
        'عايز كوتشي',
        'كام سعر الشحن؟',
        'شكرا'
      ];

      const testCompanyId = req.body.companyId || 'test-company';
      const testCustomerId = `test_${Date.now()}`;
      
      console.log('🧪 بدء اختبار النظام الذكي...');
      
      const results = [];
      
      for (let i = 0; i < testMessages.length; i++) {
        const message = testMessages[i];
        console.log(`\n📝 اختبار ${i + 1}: "${message}"`);
        
        const result = await this.intelligentChatService.generateIntelligentResponse(
          message,
          [], // تاريخ محادثة فارغ لكل اختبار
          testCompanyId,
          testCustomerId
        );
        
        results.push({
          testNumber: i + 1,
          message,
          response: result.data?.response,
          conversationType: result.data?.conversationType,
          hasProducts: result.data?.hasProducts,
          confidence: result.data?.confidence,
          success: result.success
        });
        
        // انتظار قصير بين الاختبارات
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('✅ انتهى اختبار النظام الذكي');
      
      res.json({
        success: true,
        message: 'تم اختبار النظام الذكي بنجاح',
        data: {
          testResults: results,
          systemAnalytics: this.intelligentChatService.getSystemAnalytics()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ خطأ في اختبار النظام:', error);
      
      res.status(500).json({
        success: false,
        error: 'حدث خطأ في اختبار النظام',
        details: error.message
      });
    }
  }

  /**
   * إغلاق النظام
   */
  async shutdown() {
    console.log('🔄 إغلاق controller الدردشة الذكية...');
    await this.intelligentChatService.shutdown();
    console.log('✅ تم إغلاق controller الدردشة الذكية');
  }
}

module.exports = IntelligentChatController;
