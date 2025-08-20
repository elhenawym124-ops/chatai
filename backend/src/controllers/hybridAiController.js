const HybridAiService = require('../services/hybridAiService');
const { PrismaClient } = require('@prisma/client');

/**
 * Controller للنظام الهجين الذي يجمع بين النظام القديم والجديد
 */
class HybridAiController {
  constructor() {
    this.hybridService = new HybridAiService();
    this.prisma = new PrismaClient();
  }

  /**
   * توليد رد ذكي باستخدام النظام المناسب
   */
  async generateHybridResponse(req, res) {
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

      // جلب إعدادات الذكاء الصناعي من قاعدة البيانات
      const aiSettings = await this.getAiSettings(companyId);

      console.log(`🔀 طلب رد هجين من الشركة: ${companyId}`);
      console.log(`💬 الرسالة: "${message}"`);
      console.log(`⚙️ النظام المتقدم مفعل: ${aiSettings?.useAdvancedTools ? 'نعم' : 'لا'}`);

      // توليد الرد
      const result = await this.hybridService.generateResponse(
        message,
        conversationHistory,
        companyId,
        aiSettings
      );

      // إضافة معلومات إضافية للاستجابة
      const response = {
        ...result,
        timestamp: new Date().toISOString(),
        requestId: `hybrid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      if (result.success) {
        console.log(`✅ تم توليد الرد بنجاح باستخدام النظام: ${result.data.systemType}`);
        console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
        
        res.json(response);
      } else {
        console.log(`❌ فشل في توليد الرد: ${result.error}`);
        res.status(500).json(response);
      }

    } catch (error) {
      console.error('❌ خطأ في HybridAiController:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ داخلي في الخادم',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * تفعيل النظام المتقدم لشركة
   */
  async enableAdvancedSystem(req, res) {
    try {
      const { companyId } = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'معرف الشركة مطلوب'
        });
      }

      console.log(`🚀 تفعيل النظام المتقدم للشركة: ${companyId}`);

      const result = await this.hybridService.enableAdvancedSystem(companyId);

      res.json({
        ...result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ خطأ في تفعيل النظام المتقدم:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في تفعيل النظام المتقدم',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * إلغاء تفعيل النظام المتقدم لشركة
   */
  async disableAdvancedSystem(req, res) {
    try {
      const { companyId } = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'معرف الشركة مطلوب'
        });
      }

      console.log(`📱 إلغاء تفعيل النظام المتقدم للشركة: ${companyId}`);

      const result = await this.hybridService.disableAdvancedSystem(companyId);

      res.json({
        ...result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ خطأ في إلغاء تفعيل النظام المتقدم:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في إلغاء تفعيل النظام المتقدم',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * الحصول على حالة النظام للشركة
   */
  async getSystemStatus(req, res) {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'معرف الشركة مطلوب'
        });
      }

      // جلب إعدادات الشركة
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const aiSettings = await prisma.aiSettings.findUnique({
        where: { companyId }
      });

      await prisma.$disconnect();

      // التحقق من الإعدادات المؤقتة
      const tempAdvancedSetting = global.advancedSystemSettings?.[companyId] || false;

      const systemStatus = {
        companyId,
        hasAiSettings: !!aiSettings,
        useAdvancedTools: tempAdvancedSetting,
        autoReplyEnabled: aiSettings?.autoReplyEnabled || false,
        autoSuggestProducts: aiSettings?.autoSuggestProducts || false,
        systemType: tempAdvancedSetting ? 'advanced' : 'traditional'
      };

      res.json({
        success: true,
        data: systemStatus,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ خطأ في جلب حالة النظام:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب حالة النظام',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * الحصول على إحصائيات النظام
   */
  async getSystemStats(req, res) {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'معرف الشركة مطلوب'
        });
      }

      const result = await this.hybridService.getSystemStats(companyId);

      res.json({
        ...result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات النظام:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب الإحصائيات',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * اختبار النظام الهجين
   */
  async testHybridSystem(req, res) {
    try {
      const { companyId, testMessage = 'اختبار النظام الهجين' } = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'معرف الشركة مطلوب'
        });
      }

      console.log(`🧪 اختبار النظام الهجين للشركة: ${companyId}`);

      // اختبار النظام التقليدي
      const traditionalResult = await this.hybridService.useTraditionalSystem(
        testMessage,
        [],
        companyId,
        { useAdvancedTools: false }
      );

      // اختبار النظام المتقدم
      let advancedResult;
      try {
        advancedResult = await this.hybridService.useAdvancedSystem(
          testMessage,
          [],
          companyId
        );
      } catch (error) {
        advancedResult = {
          success: false,
          error: error.message,
          data: { systemType: 'advanced' }
        };
      }

      res.json({
        success: true,
        data: {
          traditionalSystem: {
            working: traditionalResult.success,
            responseTime: traditionalResult.data?.responseTime || 0,
            systemType: traditionalResult.data?.systemType
          },
          advancedSystem: {
            working: advancedResult.success,
            responseTime: advancedResult.data?.responseTime || 0,
            systemType: advancedResult.data?.systemType,
            hasToolCalls: advancedResult.data?.hasToolCalls || false
          },
          recommendation: advancedResult.success ? 'advanced' : 'traditional'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ خطأ في اختبار النظام الهجين:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في اختبار النظام',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * جلب إعدادات الذكاء الصناعي للشركة
   */
  async getAiSettings(companyId) {
    try {
      const systemConfig = await this.prisma.systemConfig.findUnique({
        where: { companyId }
      });

      if (systemConfig) {
        console.log('🔍 إعدادات النظام من قاعدة البيانات:', {
          systemMode: systemConfig.systemMode,
          advancedEnabled: systemConfig.advancedEnabled,
          settings: systemConfig.settings
        });

        return {
          useAdvancedTools: systemConfig.systemMode === 'advanced' && systemConfig.advancedEnabled,
          autoReplyEnabled: systemConfig.settings?.autoReplyEnabled !== false,
          autoSuggestProducts: systemConfig.settings?.autoSuggestProducts !== false
        };
      }

      // إعدادات افتراضية
      return {
        useAdvancedTools: false,
        autoReplyEnabled: true,
        autoSuggestProducts: true
      };
    } catch (error) {
      console.error('❌ خطأ في جلب إعدادات الذكاء الصناعي:', error);
      return {
        useAdvancedTools: false,
        autoReplyEnabled: true,
        autoSuggestProducts: true
      };
    }
  }

  /**
   * تنظيف الموارد
   */
  async cleanup() {
    try {
      await this.hybridService.disconnect();
      await this.prisma.$disconnect();
      console.log('✅ تم تنظيف موارد HybridAiController');
    } catch (error) {
      console.error('❌ خطأ في تنظيف الموارد:', error);
    }
  }
}

module.exports = HybridAiController;
