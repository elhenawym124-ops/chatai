const AdvancedGeminiWithTools = require('../services/advancedGeminiWithTools');

/**
 * Controller للذكاء الصناعي المتقدم مع Function Calling
 */
class AdvancedAiController {
  constructor() {
    this.geminiService = new AdvancedGeminiWithTools();
  }

  /**
   * توليد رد ذكي مع استخدام الأدوات
   */
  async generateAdvancedResponse(req, res) {
    try {
      const { message, conversationHistory = [], companyId } = req.body;

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

      console.log(`🤖 طلب رد متقدم من الشركة: ${companyId}`);
      console.log(`💬 الرسالة: "${message}"`);

      // توليد الرد
      const result = await this.geminiService.generateResponseWithTools(
        message,
        conversationHistory,
        companyId
      );

      // إضافة معلومات إضافية للاستجابة
      const response = {
        ...result,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      if (result.success) {
        console.log(`✅ تم توليد الرد بنجاح`);
        console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
        
        res.json(response);
      } else {
        console.log(`❌ فشل في توليد الرد: ${result.error}`);
        res.status(500).json(response);
      }

    } catch (error) {
      console.error('❌ خطأ في Controller:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ داخلي في الخادم',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * اختبار الأدوات المتاحة
   */
  async testTools(req, res) {
    try {
      const { companyId } = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'معرف الشركة مطلوب'
        });
      }

      console.log(`🧪 اختبار الأدوات للشركة: ${companyId}`);

      const result = await this.geminiService.testTools(companyId);

      res.json({
        ...result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ خطأ في اختبار الأدوات:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في اختبار الأدوات',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * الحصول على معلومات الأدوات المتاحة
   */
  async getAvailableTools(req, res) {
    try {
      const { getToolsByType } = require('../services/geminiToolsService');
      
      const tools = getToolsByType('all');
      
      // استخراج معلومات الأدوات
      const toolsInfo = tools[0].function_declarations.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: Object.keys(tool.parameters.properties || {}),
        required: tool.parameters.required || []
      }));

      res.json({
        success: true,
        data: {
          totalTools: toolsInfo.length,
          tools: toolsInfo
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ خطأ في جلب معلومات الأدوات:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب معلومات الأدوات',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * إحصائيات استخدام الأدوات
   */
  async getToolsStats(req, res) {
    try {
      // هذه دالة مستقبلية لتتبع استخدام الأدوات
      // يمكن إضافة قاعدة بيانات لتتبع الاستخدام
      
      res.json({
        success: true,
        data: {
          message: 'إحصائيات الأدوات ستكون متاحة قريباً',
          features: [
            'تتبع عدد استخدام كل أداة',
            'قياس أوقات الاستجابة',
            'تحليل أنماط الاستخدام',
            'تحسين الأداء'
          ]
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات الأدوات:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب الإحصائيات',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * تنظيف الموارد
   */
  async cleanup() {
    try {
      await this.geminiService.disconnect();
      console.log('✅ تم تنظيف موارد AdvancedAiController');
    } catch (error) {
      console.error('❌ خطأ في تنظيف الموارد:', error);
    }
  }
}

module.exports = AdvancedAiController;
