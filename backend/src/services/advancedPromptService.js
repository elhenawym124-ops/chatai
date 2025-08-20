/**
 * Advanced Prompt Management Service
 * 
 * Handles personality prompts, response prompts, and template management
 */

const { PrismaClient } = require('@prisma/client');

class AdvancedPromptService {
  constructor() {
    this.prisma = new PrismaClient();
    
    // Pre-built prompt templates
    this.defaultTemplates = [
      {
        id: 'personality_friendly',
        name: 'شخصية ودودة ومساعدة',
        category: 'personality',
        businessType: 'general',
        description: 'شخصية ودودة ومتفهمة للعملاء',
        content: 'أنت مساعد ذكي ودود ومتفهم. تتعامل مع العملاء بلطف واحترام، وتسعى دائماً لمساعدتهم وحل مشاكلهم. تستخدم لغة بسيطة وواضحة، وتظهر التعاطف مع مشاعر العملاء.',
        variables: [],
        tags: ['ودود', 'مساعد', 'متفهم'],
        rating: 4.8,
        usageCount: 150
      },
      {
        id: 'personality_professional',
        name: 'شخصية مهنية ومتخصصة',
        category: 'personality',
        businessType: 'business',
        description: 'شخصية مهنية تركز على الكفاءة والدقة',
        content: 'أنت مساعد مهني متخصص. تقدم إجابات دقيقة ومفصلة، وتركز على الحلول العملية. تستخدم لغة مهنية واضحة، وتحرص على تقديم المعلومات الصحيحة والمفيدة.',
        variables: [],
        tags: ['مهني', 'دقيق', 'متخصص'],
        rating: 4.6,
        usageCount: 89
      },
      {
        id: 'personality_sales',
        name: 'شخصية مبيعات متحمسة',
        category: 'personality',
        businessType: 'ecommerce',
        description: 'شخصية متحمسة تركز على المبيعات والإقناع',
        content: 'أنت مساعد مبيعات متحمس وخبير في المنتجات. تساعد العملاء في اتخاذ قرارات الشراء الصحيحة، وتقدم عروض مقنعة ومفيدة. تركز على فوائد المنتجات وتجيب على جميع الاستفسارات بحماس.',
        variables: [],
        tags: ['مبيعات', 'متحمس', 'مقنع'],
        rating: 4.7,
        usageCount: 203
      },
      {
        id: 'personality_corporate',
        name: 'شخصية مهنية وموثوقة',
        category: 'personality',
        businessType: 'business',
        description: 'شخصية مهنية للشركات الكبيرة',
        content: 'أنت مساعد مهني وموثوق. تتحدث بطريقة رسمية ومهنية، وتقدم معلومات دقيقة ومفصلة. تحافظ على الطابع المهني في جميع التفاعلات وتركز على تقديم حلول عملية وفعالة.',
        variables: [],
        tags: ['مهني', 'موثوق', 'رسمي'],
        rating: 4.6,
        usageCount: 89
      },
      {
        id: 'personality_marketing',
        name: 'شخصية مبيعات متحمسة',
        category: 'personality',
        businessType: 'ecommerce',
        description: 'شخصية متحمسة للمبيعات والتسويق',
        content: 'أنت مساعد مبيعات متحمس ومقنع. تركز على إبراز فوائد المنتجات والخدمات، وتساعد العملاء في اتخاذ قرارات الشراء. تستخدم تقنيات البيع الناعم وتبني الثقة مع العملاء.',
        variables: [],
        tags: ['مبيعات', 'متحمس', 'مقنع'],
        rating: 4.7,
        usageCount: 203
      },
      {
        id: 'response_helpful',
        name: 'أسلوب رد مفيد ومفصل',
        category: 'response',
        businessType: 'general',
        description: 'أسلوب رد يركز على تقديم معلومات مفيدة',
        content: 'اجعل ردودك مفيدة ومفصلة. قدم معلومات واضحة وخطوات عملية. إذا لم تعرف الإجابة، اعترف بذلك واقترح بدائل. استخدم أمثلة عند الحاجة واختتم بسؤال للتأكد من فهم العميل.',
        variables: [],
        tags: ['مفيد', 'مفصل', 'واضح'],
        rating: 4.9,
        usageCount: 178
      },
      {
        id: 'response_quick',
        name: 'أسلوب رد سريع ومختصر',
        category: 'response',
        businessType: 'support',
        description: 'أسلوب رد سريع للدعم الفني',
        content: 'اجعل ردودك مختصرة ومباشرة. ركز على النقاط الأساسية فقط. قدم الحل بأقل عدد من الكلمات. استخدم نقاط أو قوائم عند الحاجة. تجنب التفاصيل غير الضرورية.',
        variables: [],
        tags: ['سريع', 'مختصر', 'مباشر'],
        rating: 4.5,
        usageCount: 134
      },
      {
        id: 'response_product_focused',
        name: 'أسلوب رد يركز على المنتجات',
        category: 'response',
        businessType: 'ecommerce',
        description: 'أسلوب رد يركز على اقتراح المنتجات',
        content: 'في ردودك، ركز على ربط احتياجات العميل بالمنتجات المناسبة. اقترح منتجات محددة عندما يكون ذلك مناسباً. اذكر المميزات والفوائد. قدم مقارنات بين المنتجات إذا طلب العميل. اختتم بدعوة لاتخاذ إجراء.',
        variables: ['defaultProduct', 'topProducts'],
        tags: ['منتجات', 'اقتراحات', 'مبيعات'],
        rating: 4.8,
        usageCount: 267
      },
      {
        id: 'response_order_creation',
        name: 'أسلوب رد لإنشاء الطلبات',
        category: 'response',
        businessType: 'ecommerce',
        description: 'أسلوب رد يساعد في إنشاء الطلبات',
        content: 'عندما يريد العميل إنشاء طلب، اتبع هذه الخطوات:\n1. تأكد من فهم المنتج المطلوب\n2. اسأل عن الكمية المطلوبة\n3. تأكد من معلومات التوصيل\n4. اعرض ملخص الطلب للتأكيد\n5. قم بإنشاء الطلب وقدم رقم المتابعة\n\nاستخدم لغة واضحة ومشجعة، وتأكد من جمع جميع المعلومات المطلوبة قبل إتمام الطلب.',
        variables: ['customerName', 'deliveryAddress', 'phoneNumber'],
        tags: ['طلبات', 'شراء', 'توصيل'],
        rating: 4.9,
        usageCount: 156
      },
      {
        id: 'response_image_analysis',
        name: 'أسلوب رد لتحليل الصور',
        category: 'response',
        businessType: 'ecommerce',
        description: 'أسلوب رد عند تحليل صور العملاء',
        content: 'عندما يرسل العميل صورة:\n1. احلل الصورة بعناية\n2. حدد المنتج أو العنصر في الصورة\n3. ابحث عن منتجات مشابهة في متجرنا\n4. اقترح البدائل المتاحة مع الأسعار\n5. اعرض صور المنتجات المقترحة\n\nكن دقيقاً في التحليل ومفيداً في الاقتراحات. إذا لم تجد منتجات مشابهة، اقترح منتجات من نفس الفئة.',
        variables: ['availableProducts', 'productImages'],
        tags: ['صور', 'تحليل', 'اقتراحات'],
        rating: 4.7,
        usageCount: 89
      },
      {
        id: 'personality_support',
        name: 'شخصية دعم فني متخصص',
        category: 'personality',
        businessType: 'support',
        description: 'شخصية متخصصة في الدعم الفني',
        content: 'أنت مساعد دعم فني متخصص وصبور. تتعامل مع المشاكل التقنية بهدوء ومنهجية. تقدم حلول خطوة بخطوة، وتتأكد من فهم العميل لكل خطوة. تستخدم لغة بسيطة لشرح المفاهيم التقنية المعقدة.',
        variables: [],
        tags: ['دعم فني', 'صبور', 'منهجي'],
        rating: 4.8,
        usageCount: 112
      }
    ];
  }

  /**
   * Get all prompt templates
   */
  async getPromptTemplates(filters = {}) {
    try {
      let templates = [...this.defaultTemplates];

      // Apply filters
      if (filters.category) {
        templates = templates.filter(t => t.category === filters.category);
      }
      
      if (filters.businessType) {
        templates = templates.filter(t => t.businessType === filters.businessType || t.businessType === 'general');
      }

      // Sort by rating and usage
      templates.sort((a, b) => (b.rating * b.usageCount) - (a.rating * a.usageCount));

      return {
        success: true,
        data: templates
      };
    } catch (error) {
      console.error('Error getting prompt templates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get company's custom prompts
   */
  async getCompanyPrompts(companyId) {
    try {
      // Validate companyId
      if (!companyId) {
        return {
          success: false,
          error: 'Company ID is required'
        };
      }

      // First, verify that the company exists
      const company = await this.prisma.company.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        return {
          success: false,
          error: `Company with ID ${companyId} not found`
        };
      }

      // Try to load from AISettings table first, fallback to Company table
      let aiSettings = null;
      try {
        console.log('Looking for AI settings for company:', companyId);
        aiSettings = await this.prisma.aiSettings.findFirst({
          where: { companyId }
        });
        console.log('Found AI settings:', aiSettings);
      } catch (e) {
        console.log('AISettings table not found, trying Company table...', e.message);
      }

      // Fallback to Company table if AISettings not found
      if (!aiSettings) {
        return {
          success: true,
          data: {
            personalityPrompt: company.personalityPrompt || null,
            responsePrompt: company.responsePrompt || null,
            hasCustomPrompts: !!(company.personalityPrompt || company.responsePrompt)
          }
        };
      }

      // Create mock prompts array for compatibility with frontend
      const prompts = [];

      if (aiSettings.personalityPrompt) {
        prompts.push({
          id: 'PROMPT001',
          companyId: companyId,
          name: 'برومبت الشخصية',
          type: 'personality',
          prompt: aiSettings.personalityPrompt,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      if (aiSettings.responsePrompt) {
        prompts.push({
          id: 'PROMPT002',
          companyId: companyId,
          name: 'برومبت الردود',
          type: 'response',
          prompt: aiSettings.responsePrompt,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Add some default prompts if none exist
      if (prompts.length === 0) {
        prompts.push(
          {
            id: 'PROMPT001',
            companyId: companyId,
            name: 'خدمة العملاء الأساسية',
            type: 'customer_service',
            prompt: 'أنت مساعد ذكي ودود لخدمة العملاء. تتعامل مع العملاء بلطف واحترام، وتسعى دائماً لمساعدتهم وحل مشاكلهم.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'PROMPT002',
            companyId: companyId,
            name: 'تحليل المشاعر',
            type: 'sentiment_analysis',
            prompt: 'حلل مشاعر العميل في الرسالة التالية وحدد نبرة الرد المناسبة.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'PROMPT003',
            companyId: companyId,
            name: 'اقتراح المنتجات',
            type: 'product_suggestion',
            prompt: 'بناءً على رسالة العميل، اقترح المنتجات المناسبة من الكتالوج المتاح.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
      }

      // 🔧 FIX: Return the prompts directly in data object for proper access
      console.log('🔧 Using AISettings prompts:', {
        personalityPrompt: aiSettings.personalityPrompt,
        responsePrompt: aiSettings.responsePrompt
      });

      return {
        success: true,
        data: {
          personalityPrompt: aiSettings.personalityPrompt || null,
          responsePrompt: aiSettings.responsePrompt || null,
          hasCustomPrompts: !!(aiSettings.personalityPrompt || aiSettings.responsePrompt),
          prompts: prompts
        },
        // Keep these for backward compatibility
        personalityPrompt: aiSettings.personalityPrompt,
        responsePrompt: aiSettings.responsePrompt,
        hasCustomPrompts: !!(aiSettings.personalityPrompt || aiSettings.responsePrompt),
        updatedAt: aiSettings.updatedAt
      };
    } catch (error) {
      console.error('Error getting company prompts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update company prompts
   */
  async updateCompanyPrompts(companyId, prompts) {
    try {
      const { personalityPrompt, responsePrompt } = prompts;

      // First, verify that the company exists
      const company = await this.prisma.company.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        throw new Error(`Company with ID ${companyId} not found`);
      }

      // Try to update AISettings table first, fallback to Company table
      let aiSettings = null;
      try {
        aiSettings = await this.prisma.aiSettings.upsert({
          where: { companyId },
          update: {
            personalityPrompt: personalityPrompt || null,
            responsePrompt: responsePrompt || null,
            updatedAt: new Date()
          },
          create: {
            companyId,
            personalityPrompt: personalityPrompt || null,
            responsePrompt: responsePrompt || null,
            autoReplyEnabled: false,
            confidenceThreshold: 0.7
          }
        });
      } catch (e) {
        console.log('AISettings upsert failed, trying alternative approach...', e.message);

        // Try to find existing record first
        const existingSettings = await this.prisma.aiSettings.findUnique({
          where: { companyId }
        });

        if (existingSettings) {
          // Update existing record
          aiSettings = await this.prisma.aiSettings.update({
            where: { companyId },
            data: {
              personalityPrompt: personalityPrompt || null,
              responsePrompt: responsePrompt || null,
              updatedAt: new Date()
            }
          });
        } else {
          // Create new record
          aiSettings = await this.prisma.aiSettings.create({
            data: {
              companyId,
              personalityPrompt: personalityPrompt || null,
              responsePrompt: responsePrompt || null,
              autoReplyEnabled: false,
              confidenceThreshold: 0.7
            }
          });
        }
      }

      return {
        success: true,
        data: {
          personalityPrompt: aiSettings.personalityPrompt,
          responsePrompt: aiSettings.responsePrompt,
          updatedAt: aiSettings.updatedAt
        },
        message: 'تم تحديث البرومبت بنجاح'
      };
    } catch (error) {
      console.error('Error updating company prompts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Apply template to company
   */
  async applyTemplate(companyId, templateId, promptType) {
    try {
      const template = this.defaultTemplates.find(t => t.id === templateId);
      
      if (!template) {
        return {
          success: false,
          error: 'القالب غير موجود'
        };
      }

      if (template.category !== promptType) {
        return {
          success: false,
          error: 'نوع القالب لا يتطابق مع النوع المطلوب'
        };
      }

      // Get current settings
      const currentPrompts = await this.getCompanyPrompts(companyId);
      
      const updateData = {};
      if (promptType === 'personality') {
        updateData.personalityPrompt = template.content;
        updateData.responsePrompt = currentPrompts.data.responsePrompt;
      } else if (promptType === 'response') {
        updateData.personalityPrompt = currentPrompts.data.personalityPrompt;
        updateData.responsePrompt = template.content;
      }

      const result = await this.updateCompanyPrompts(companyId, updateData);
      
      if (result.success) {
        // Update template usage count (in production, save to database)
        const templateIndex = this.defaultTemplates.findIndex(t => t.id === templateId);
        if (templateIndex !== -1) {
          this.defaultTemplates[templateIndex].usageCount += 1;
        }
      }

      return result;
    } catch (error) {
      console.error('Error applying template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test prompt with sample message
   */
  async testPrompt(companyId, promptType, promptContent, testMessage) {
    try {
      // This would integrate with the AdvancedGeminiService
      const AdvancedGeminiService = require('./advancedGeminiService');
      const geminiService = new AdvancedGeminiService();
      
      await geminiService.initialize(companyId);

      const context = {};
      if (promptType === 'personality') {
        context.personalityPrompt = promptContent;
      } else if (promptType === 'response') {
        context.responsePrompt = promptContent;
      }

      const result = await geminiService.generateResponse(companyId, testMessage, context);

      return {
        success: result.success,
        data: {
          response: result.response,
          modelUsed: result.modelUsed,
          responseTime: result.responseTime,
          confidence: result.confidence
        }
      };
    } catch (error) {
      console.error('Error testing prompt:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get prompt suggestions based on business type
   */
  getPromptSuggestions(businessType = 'general') {
    const suggestions = {
      ecommerce: {
        personality: [
          'أنت مساعد مبيعات ودود يساعد العملاء في العثور على المنتجات المناسبة',
          'أنت خبير في المنتجات وتقدم نصائح شخصية لكل عميل',
          'أنت مساعد تسوق ذكي يفهم احتياجات العملاء ويقترح الحلول المناسبة'
        ],
        response: [
          'اقترح منتجات مناسبة واذكر أسعارها ومميزاتها',
          'قدم مقارنات بين المنتجات واشرح الفروقات',
          'اربط احتياجات العميل بالمنتجات المتاحة واقترح بدائل'
        ]
      },
      support: {
        personality: [
          'أنت مساعد دعم فني محترف يحل المشاكل بسرعة وكفاءة',
          'أنت خبير تقني صبور يشرح الحلول بطريقة بسيطة',
          'أنت مساعد دعم ودود يتفهم إحباط العملاء ويساعدهم'
        ],
        response: [
          'قدم حلول خطوة بخطوة واضحة ومفصلة',
          'اشرح المشكلة والحل بطريقة بسيطة يفهمها الجميع',
          'قدم حلول سريعة واقترح طرق منع المشكلة مستقبلاً'
        ]
      },
      general: {
        personality: [
          'أنت مساعد ذكي ودود يساعد العملاء في جميع استفساراتهم',
          'أنت مساعد محترف ومتفهم يقدم خدمة عملاء ممتازة',
          'أنت مساعد مفيد وصبور يسعى لحل جميع مشاكل العملاء'
        ],
        response: [
          'قدم إجابات شاملة ومفيدة واسأل إذا كان العميل يحتاج مساعدة إضافية',
          'كن واضح ومباشر في ردودك واستخدم أمثلة عند الحاجة',
          'اظهر التعاطف مع العميل وقدم حلول عملية وقابلة للتطبيق'
        ]
      }
    };

    return suggestions[businessType] || suggestions.general;
  }

  /**
   * Analyze prompt effectiveness
   */
  async analyzePromptEffectiveness(companyId, period = 'week') {
    try {
      // This would analyze AI interactions to measure prompt effectiveness
      // For now, return mock data
      
      return {
        success: true,
        data: {
          period,
          totalInteractions: 156,
          successRate: 0.87,
          averageConfidence: 0.82,
          customerSatisfaction: 4.3,
          commonIssues: [
            'العميل لم يفهم الرد',
            'الرد لم يكن مناسب للسياق',
            'احتاج تدخل بشري'
          ],
          suggestions: [
            'تحسين وضوح الردود',
            'إضافة المزيد من الأمثلة',
            'تخصيص الردود أكثر حسب نوع الاستفسار'
          ]
        }
      };
    } catch (error) {
      console.error('Error analyzing prompt effectiveness:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AdvancedPromptService;
