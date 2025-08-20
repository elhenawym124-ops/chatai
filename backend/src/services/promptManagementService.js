/**
 * Prompt Management Service
 * 
 * Handles AI prompt creation, customization, versioning, and performance tracking
 */

class PromptManagementService {
  constructor() {
    this.prompts = new Map(); // Company prompts
    this.promptTemplates = new Map(); // Pre-built templates
    this.promptVersions = new Map(); // Prompt versions
    this.promptPerformance = new Map(); // Performance metrics
    this.promptVariables = new Map(); // Dynamic variables
    this.businessTypes = new Map(); // Business type configurations
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock business types
    const mockBusinessTypes = [
      {
        id: 'BUSINESS001',
        name: 'تجارة إلكترونية',
        code: 'ecommerce',
        description: 'متاجر إلكترونية وبيع المنتجات',
        icon: '🛒',
        color: '#10B981',
        defaultPromptTemplate: 'TEMPLATE001',
        commonVariables: ['company_name', 'product_categories', 'shipping_policy', 'return_policy'],
        samplePrompts: [
          'أنت مساعد ذكي لمتجر إلكتروني متخصص في {product_categories}',
          'مهمتك مساعدة العملاء في اختيار المنتجات المناسبة',
          'كن مهذباً ومفيداً واقترح منتجات بناءً على احتياجات العميل'
        ],
        isActive: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'BUSINESS002',
        name: 'خدمات مالية',
        code: 'financial',
        description: 'بنوك وشركات تأمين وخدمات مالية',
        icon: '💰',
        color: '#3B82F6',
        defaultPromptTemplate: 'TEMPLATE002',
        commonVariables: ['company_name', 'services', 'regulations', 'contact_info'],
        samplePrompts: [
          'أنت مستشار مالي ذكي في {company_name}',
          'قدم معلومات دقيقة عن الخدمات المالية',
          'التزم بالأنظمة المالية ولا تقدم نصائح استثمارية شخصية'
        ],
        isActive: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'BUSINESS003',
        name: 'خدمات طبية',
        code: 'healthcare',
        description: 'مستشفيات وعيادات وخدمات صحية',
        icon: '🏥',
        color: '#EF4444',
        defaultPromptTemplate: 'TEMPLATE003',
        commonVariables: ['clinic_name', 'specialties', 'doctors', 'appointment_system'],
        samplePrompts: [
          'أنت مساعد ذكي في {clinic_name}',
          'ساعد المرضى في حجز المواعيد والاستفسارات العامة',
          'لا تقدم تشخيص طبي أو نصائح علاجية - وجه للطبيب المختص'
        ],
        isActive: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'BUSINESS004',
        name: 'تعليم وتدريب',
        code: 'education',
        description: 'مؤسسات تعليمية ومراكز تدريب',
        icon: '📚',
        color: '#8B5CF6',
        defaultPromptTemplate: 'TEMPLATE004',
        commonVariables: ['institution_name', 'courses', 'instructors', 'enrollment_process'],
        samplePrompts: [
          'أنت مستشار تعليمي في {institution_name}',
          'ساعد الطلاب في اختيار الدورات المناسبة',
          'قدم معلومات عن البرامج التعليمية وعملية التسجيل'
        ],
        isActive: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'BUSINESS005',
        name: 'عقارات',
        code: 'real_estate',
        description: 'شركات عقارية ووساطة عقارية',
        icon: '🏠',
        color: '#F59E0B',
        defaultPromptTemplate: 'TEMPLATE005',
        commonVariables: ['company_name', 'property_types', 'locations', 'services'],
        samplePrompts: [
          'أنت مستشار عقاري في {company_name}',
          'ساعد العملاء في العثور على العقارات المناسبة',
          'قدم معلومات عن الأسعار والمواقع والخدمات المتاحة'
        ],
        isActive: true,
        createdAt: new Date('2024-01-01'),
      }
    ];

    mockBusinessTypes.forEach(type => {
      this.businessTypes.set(type.id, type);
    });

    // Mock prompt templates
    const mockTemplates = [
      {
        id: 'TEMPLATE001',
        name: 'قالب التجارة الإلكترونية الأساسي',
        businessTypeId: 'BUSINESS001',
        businessTypeName: 'تجارة إلكترونية',
        category: 'ecommerce',
        language: 'ar',
        content: `أنت مساعد ذكي لخدمة العملاء في {company_name}، متجر إلكتروني متخصص في {product_categories}.

مهامك الأساسية:
- الترحيب بالعملاء بطريقة مهذبة ومهنية
- مساعدة العملاء في العثور على المنتجات المناسبة
- تقديم معلومات دقيقة عن المنتجات والأسعار
- شرح سياسات الشحن والإرجاع
- توجيه العملاء لإتمام عملية الشراء

قواعد مهمة:
- استخدم اللغة العربية دائماً
- كن مهذباً ومحترماً في جميع الردود
- إذا لم تعرف إجابة سؤال، اطلب من العميل الانتظار للتحدث مع موظف
- لا تقدم معلومات خاطئة عن الأسعار أو توفر المنتجات
- اقترح منتجات بديلة إذا لم يكن المنتج المطلوب متوفراً

معلومات الشركة:
- اسم الشركة: {company_name}
- فئات المنتجات: {product_categories}
- سياسة الشحن: {shipping_policy}
- سياسة الإرجاع: {return_policy}
- ساعات العمل: {working_hours}
- طرق التواصل: {contact_methods}`,
        variables: ['company_name', 'product_categories', 'shipping_policy', 'return_policy', 'working_hours', 'contact_methods'],
        tags: ['تجارة', 'خدمة عملاء', 'مبيعات'],
        isActive: true,
        isPublic: true,
        usageCount: 45,
        rating: 4.7,
        createdBy: 'system',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: 'TEMPLATE002',
        name: 'قالب الخدمات المالية المتقدم',
        businessTypeId: 'BUSINESS002',
        businessTypeName: 'خدمات مالية',
        category: 'financial',
        language: 'ar',
        content: `أنت مستشار مالي ذكي في {company_name}، متخصص في تقديم الخدمات المالية.

مهامك الأساسية:
- تقديم معلومات عن الخدمات المالية المتاحة
- شرح المنتجات المصرفية والاستثمارية
- مساعدة العملاء في فهم الإجراءات والمتطلبات
- توجيه العملاء للقنوات المناسبة لكل خدمة

قواعد صارمة:
- لا تقدم نصائح استثمارية شخصية
- التزم بالأنظمة المالية السعودية
- لا تتعامل مع معلومات مالية حساسة
- وجه العملاء للمختصين للاستشارات المعقدة
- تأكد من هوية العميل قبل تقديم معلومات حساسة

الخدمات المتاحة:
- الخدمات المصرفية: {banking_services}
- المنتجات الاستثمارية: {investment_products}
- خدمات التأمين: {insurance_services}
- القروض والتمويل: {financing_options}

معلومات التواصل:
- رقم خدمة العملاء: {customer_service_number}
- ساعات العمل: {working_hours}
- فروع الشركة: {branch_locations}`,
        variables: ['company_name', 'banking_services', 'investment_products', 'insurance_services', 'financing_options', 'customer_service_number', 'working_hours', 'branch_locations'],
        tags: ['مالية', 'استثمار', 'بنوك'],
        isActive: true,
        isPublic: true,
        usageCount: 23,
        rating: 4.5,
        createdBy: 'system',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-08'),
      },
      {
        id: 'TEMPLATE003',
        name: 'قالب الخدمات الطبية الآمن',
        businessTypeId: 'BUSINESS003',
        businessTypeName: 'خدمات طبية',
        category: 'healthcare',
        language: 'ar',
        content: `أنت مساعد ذكي في {clinic_name}، مختص في تقديم المعلومات العامة والمساعدة في الخدمات الإدارية.

مهامك المحددة:
- مساعدة المرضى في حجز المواعيد
- تقديم معلومات عن الأطباء والتخصصات
- شرح إجراءات المراجعة والفحوصات
- توضيح مواعيد العمل وطرق التواصل

قواعد طبية صارمة:
- لا تقدم أي تشخيص طبي أو نصائح علاجية
- لا تفسر نتائج الفحوصات أو التحاليل
- وجه جميع الاستفسارات الطبية للطبيب المختص
- في حالات الطوارئ، انصح بالتوجه للطوارئ فوراً
- احترم خصوصية المرضى ولا تطلب معلومات طبية حساسة

معلومات العيادة:
- اسم العيادة: {clinic_name}
- التخصصات المتاحة: {medical_specialties}
- الأطباء: {doctors_list}
- مواعيد العمل: {clinic_hours}
- رقم الطوارئ: {emergency_number}
- نظام الحجز: {appointment_system}`,
        variables: ['clinic_name', 'medical_specialties', 'doctors_list', 'clinic_hours', 'emergency_number', 'appointment_system'],
        tags: ['طبي', 'صحة', 'مواعيد'],
        isActive: true,
        isPublic: true,
        usageCount: 18,
        rating: 4.8,
        createdBy: 'system',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-12'),
      }
    ];

    mockTemplates.forEach(template => {
      this.promptTemplates.set(template.id, template);
    });

    // Mock company prompts
    const mockPrompts = [
      {
        id: 'PROMPT001',
        companyId: '1',
        companyName: 'متجر الإلكترونيات المتقدم',
        name: 'برومبت خدمة العملاء الرئيسي',
        templateId: 'TEMPLATE001',
        templateName: 'قالب التجارة الإلكترونية الأساسي',
        businessTypeId: 'BUSINESS001',
        content: `أنت مساعد ذكي لخدمة العملاء في متجر الإلكترونيات المتقدم، متجر إلكتروني متخصص في الإلكترونيات والأجهزة الذكية.

مهامك الأساسية:
- الترحيب بالعملاء بطريقة مهذبة ومهنية
- مساعدة العملاء في العثور على المنتجات المناسبة
- تقديم معلومات دقيقة عن المنتجات والأسعار
- شرح سياسات الشحن والإرجاع
- توجيه العملاء لإتمام عملية الشراء

قواعد مهمة:
- استخدم اللغة العربية دائماً
- كن مهذباً ومحترماً في جميع الردود
- إذا لم تعرف إجابة سؤال، اطلب من العميل الانتظار للتحدث مع موظف
- لا تقدم معلومات خاطئة عن الأسعار أو توفر المنتجات
- اقترح منتجات بديلة إذا لم يكن المنتج المطلوب متوفراً

معلومات الشركة:
- اسم الشركة: متجر الإلكترونيات المتقدم
- فئات المنتجات: لابتوبات، هواتف ذكية، إكسسوارات، أجهزة منزلية ذكية
- سياسة الشحن: شحن مجاني للطلبات أكثر من 200 ريال، التوصيل خلال 1-3 أيام
- سياسة الإرجاع: إمكانية الإرجاع خلال 14 يوم مع الضمان
- ساعات العمل: من 9 صباحاً إلى 9 مساءً
- طرق التواصل: واتساب، مسنجر، هاتف: 920001234`,
        variables: {
          company_name: 'متجر الإلكترونيات المتقدم',
          product_categories: 'لابتوبات، هواتف ذكية، إكسسوارات، أجهزة منزلية ذكية',
          shipping_policy: 'شحن مجاني للطلبات أكثر من 200 ريال، التوصيل خلال 1-3 أيام',
          return_policy: 'إمكانية الإرجاع خلال 14 يوم مع الضمان',
          working_hours: 'من 9 صباحاً إلى 9 مساءً',
          contact_methods: 'واتساب، مسنجر، هاتف: 920001234'
        },
        version: '1.2',
        isActive: true,
        isDefault: true,
        performance: {
          totalUsage: 1250,
          successRate: 87.5,
          averageRating: 4.3,
          responseTime: 850,
          lastUsed: new Date('2024-01-15'),
        },
        createdBy: '1',
        createdByName: 'أحمد المدير',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
      }
    ];

    mockPrompts.forEach(prompt => {
      this.prompts.set(prompt.id, prompt);
    });

    // Mock prompt variables
    const mockVariables = [
      {
        id: 'VAR001',
        name: 'company_name',
        displayName: 'اسم الشركة',
        description: 'الاسم التجاري للشركة أو المتجر',
        type: 'text',
        category: 'company',
        isRequired: true,
        defaultValue: '',
        placeholder: 'مثال: متجر الإلكترونيات المتقدم',
        validation: {
          minLength: 2,
          maxLength: 100,
          pattern: null
        }
      },
      {
        id: 'VAR002',
        name: 'product_categories',
        displayName: 'فئات المنتجات',
        description: 'الفئات الرئيسية للمنتجات أو الخدمات',
        type: 'textarea',
        category: 'business',
        isRequired: true,
        defaultValue: '',
        placeholder: 'مثال: إلكترونيات، ملابس، أجهزة منزلية',
        validation: {
          minLength: 5,
          maxLength: 500,
          pattern: null
        }
      },
      {
        id: 'VAR003',
        name: 'working_hours',
        displayName: 'ساعات العمل',
        description: 'أوقات عمل الشركة أو المتجر',
        type: 'text',
        category: 'contact',
        isRequired: false,
        defaultValue: 'من 9 صباحاً إلى 6 مساءً',
        placeholder: 'مثال: من 9 صباحاً إلى 9 مساءً',
        validation: {
          minLength: 5,
          maxLength: 100,
          pattern: null
        }
      },
      {
        id: 'VAR004',
        name: 'contact_methods',
        displayName: 'طرق التواصل',
        description: 'الطرق المتاحة للتواصل مع الشركة',
        type: 'textarea',
        category: 'contact',
        isRequired: false,
        defaultValue: '',
        placeholder: 'مثال: هاتف: 920001234، واتساب، بريد إلكتروني',
        validation: {
          minLength: 5,
          maxLength: 300,
          pattern: null
        }
      },
      {
        id: 'VAR005',
        name: 'shipping_policy',
        displayName: 'سياسة الشحن',
        description: 'تفاصيل سياسة الشحن والتوصيل',
        type: 'textarea',
        category: 'policies',
        isRequired: false,
        defaultValue: '',
        placeholder: 'مثال: شحن مجاني للطلبات أكثر من 200 ريال',
        validation: {
          minLength: 10,
          maxLength: 500,
          pattern: null
        }
      }
    ];

    mockVariables.forEach(variable => {
      this.promptVariables.set(variable.id, variable);
    });
  }

  /**
   * Create new prompt for company
   */
  async createPrompt(promptData) {
    try {
      const {
        companyId,
        companyName,
        name,
        templateId = null,
        businessTypeId = null,
        content,
        variables = {},
        isDefault = false,
        createdBy,
        createdByName,
      } = promptData;

      // Validate required fields
      if (!companyId || !name || !content) {
        return {
          success: false,
          error: 'البيانات المطلوبة ناقصة'
        };
      }

      // Get template info if provided
      let templateInfo = null;
      if (templateId) {
        templateInfo = this.promptTemplates.get(templateId);
        if (!templateInfo) {
          return {
            success: false,
            error: 'القالب المحدد غير موجود'
          };
        }
      }

      // Process variables in content
      const processedContent = this.processPromptVariables(content, variables);

      const prompt = {
        id: this.generatePromptId(),
        companyId,
        companyName,
        name,
        templateId,
        templateName: templateInfo?.name || null,
        businessTypeId: businessTypeId || templateInfo?.businessTypeId || null,
        content: processedContent,
        originalContent: content,
        variables,
        version: '1.0',
        isActive: true,
        isDefault,
        performance: {
          totalUsage: 0,
          successRate: 0,
          averageRating: 0,
          responseTime: 0,
          lastUsed: null,
        },
        createdBy,
        createdByName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // If this is set as default, deactivate other default prompts
      if (isDefault) {
        this.deactivateOtherDefaults(companyId);
      }

      this.prompts.set(prompt.id, prompt);

      return {
        success: true,
        data: prompt,
        message: 'تم إنشاء البرومبت بنجاح'
      };
    } catch (error) {
      console.error('Error creating prompt:', error);
      return {
        success: false,
        error: 'فشل في إنشاء البرومبت'
      };
    }
  }

  /**
   * Update existing prompt
   */
  async updatePrompt(promptId, updateData) {
    try {
      const prompt = this.prompts.get(promptId);
      
      if (!prompt) {
        return {
          success: false,
          error: 'البرومبت غير موجود'
        };
      }

      // Create new version if content changed
      if (updateData.content && updateData.content !== prompt.originalContent) {
        const versionNumber = parseFloat(prompt.version) + 0.1;
        prompt.version = versionNumber.toFixed(1);
        
        // Store previous version
        this.storePromptVersion(prompt);
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'id') {
          if (key === 'content') {
            prompt.originalContent = updateData[key];
            prompt.content = this.processPromptVariables(updateData[key], prompt.variables);
          } else if (key === 'variables') {
            prompt.variables = { ...prompt.variables, ...updateData[key] };
            prompt.content = this.processPromptVariables(prompt.originalContent, prompt.variables);
          } else {
            prompt[key] = updateData[key];
          }
        }
      });

      prompt.updatedAt = new Date();

      // Handle default prompt change
      if (updateData.isDefault === true) {
        this.deactivateOtherDefaults(prompt.companyId);
      }

      this.prompts.set(promptId, prompt);

      return {
        success: true,
        data: prompt,
        message: 'تم تحديث البرومبت بنجاح'
      };
    } catch (error) {
      console.error('Error updating prompt:', error);
      return {
        success: false,
        error: 'فشل في تحديث البرومبت'
      };
    }
  }

  /**
   * Test prompt with sample input
   */
  async testPrompt(promptId, testInput) {
    try {
      const prompt = this.prompts.get(promptId);
      
      if (!prompt) {
        return {
          success: false,
          error: 'البرومبت غير موجود'
        };
      }

      // Simulate AI response (in production, call actual AI service)
      const testResult = await this.simulateAIResponse(prompt.content, testInput);

      return {
        success: true,
        data: {
          prompt: {
            id: prompt.id,
            name: prompt.name,
            content: prompt.content,
          },
          testInput,
          response: testResult.response,
          responseTime: testResult.responseTime,
          confidence: testResult.confidence,
          suggestions: testResult.suggestions,
        }
      };
    } catch (error) {
      console.error('Error testing prompt:', error);
      return {
        success: false,
        error: 'فشل في اختبار البرومبت'
      };
    }
  }

  /**
   * Get company prompts
   */
  async getCompanyPrompts(companyId) {
    try {
      const companyPrompts = Array.from(this.prompts.values())
        .filter(prompt => prompt.companyId === companyId)
        .sort((a, b) => {
          // Default prompt first, then by update date
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

      return {
        success: true,
        data: companyPrompts
      };
    } catch (error) {
      console.error('Error getting company prompts:', error);
      return {
        success: false,
        error: 'فشل في جلب برومبت الشركة'
      };
    }
  }

  /**
   * Get prompt templates
   */
  async getPromptTemplates(businessTypeId = null) {
    try {
      let templates = Array.from(this.promptTemplates.values())
        .filter(template => template.isActive);

      if (businessTypeId) {
        templates = templates.filter(template => template.businessTypeId === businessTypeId);
      }

      templates.sort((a, b) => b.rating - a.rating);

      return {
        success: true,
        data: templates
      };
    } catch (error) {
      console.error('Error getting prompt templates:', error);
      return {
        success: false,
        error: 'فشل في جلب قوالب البرومبت'
      };
    }
  }

  /**
   * Get business types
   */
  async getBusinessTypes() {
    try {
      const businessTypes = Array.from(this.businessTypes.values())
        .filter(type => type.isActive)
        .sort((a, b) => a.name.localeCompare(b.name));

      return {
        success: true,
        data: businessTypes
      };
    } catch (error) {
      console.error('Error getting business types:', error);
      return {
        success: false,
        error: 'فشل في جلب أنواع الأعمال'
      };
    }
  }

  /**
   * Get prompt variables
   */
  async getPromptVariables(category = null) {
    try {
      let variables = Array.from(this.promptVariables.values());

      if (category) {
        variables = variables.filter(variable => variable.category === category);
      }

      return {
        success: true,
        data: variables
      };
    } catch (error) {
      console.error('Error getting prompt variables:', error);
      return {
        success: false,
        error: 'فشل في جلب متغيرات البرومبت'
      };
    }
  }

  /**
   * Get prompt performance analytics
   */
  async getPromptAnalytics(companyId, period = 'month') {
    try {
      const companyPrompts = Array.from(this.prompts.values())
        .filter(prompt => prompt.companyId === companyId);

      const analytics = {
        totalPrompts: companyPrompts.length,
        activePrompts: companyPrompts.filter(p => p.isActive).length,
        totalUsage: companyPrompts.reduce((sum, p) => sum + p.performance.totalUsage, 0),
        averageSuccessRate: this.calculateAverageSuccessRate(companyPrompts),
        averageRating: this.calculateAverageRating(companyPrompts),
        averageResponseTime: this.calculateAverageResponseTime(companyPrompts),
        topPerformingPrompts: this.getTopPerformingPrompts(companyPrompts, 5),
        usageTrend: this.getUsageTrend(companyPrompts, period),
        performanceComparison: this.getPerformanceComparison(companyPrompts),
      };

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      console.error('Error getting prompt analytics:', error);
      return {
        success: false,
        error: 'فشل في جلب تحليلات البرومبت'
      };
    }
  }

  /**
   * Helper methods
   */
  processPromptVariables(content, variables) {
    let processedContent = content;
    
    Object.keys(variables).forEach(key => {
      const value = variables[key] || `{${key}}`;
      const regex = new RegExp(`{${key}}`, 'g');
      processedContent = processedContent.replace(regex, value);
    });

    return processedContent;
  }

  deactivateOtherDefaults(companyId) {
    Array.from(this.prompts.values())
      .filter(prompt => prompt.companyId === companyId && prompt.isDefault)
      .forEach(prompt => {
        prompt.isDefault = false;
        this.prompts.set(prompt.id, prompt);
      });
  }

  storePromptVersion(prompt) {
    const versionId = `${prompt.id}_v${prompt.version}`;
    const version = {
      id: versionId,
      promptId: prompt.id,
      version: prompt.version,
      content: prompt.content,
      variables: { ...prompt.variables },
      performance: { ...prompt.performance },
      createdAt: new Date(),
    };

    this.promptVersions.set(versionId, version);
  }

  async simulateAIResponse(promptContent, testInput) {
    // Mock AI response simulation
    const responses = [
      'مرحباً بك! كيف يمكنني مساعدتك اليوم؟',
      'شكراً لتواصلك معنا. سأكون سعيداً لمساعدتك.',
      'أهلاً وسهلاً! ما الذي تبحث عنه تحديداً؟',
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    const responseTime = 500 + Math.random() * 1000; // 500-1500ms
    const confidence = 0.7 + Math.random() * 0.3; // 70-100%

    return {
      response,
      responseTime: Math.round(responseTime),
      confidence: Math.round(confidence * 100) / 100,
      suggestions: [
        'يمكن تحسين البرومبت بإضافة المزيد من التفاصيل',
        'النتيجة جيدة ولكن يمكن تحسين الوضوح',
      ],
    };
  }

  calculateAverageSuccessRate(prompts) {
    const validPrompts = prompts.filter(p => p.performance.totalUsage > 0);
    if (validPrompts.length === 0) return 0;

    const totalSuccessRate = validPrompts.reduce((sum, p) => sum + p.performance.successRate, 0);
    return Math.round(totalSuccessRate / validPrompts.length);
  }

  calculateAverageRating(prompts) {
    const validPrompts = prompts.filter(p => p.performance.averageRating > 0);
    if (validPrompts.length === 0) return 0;

    const totalRating = validPrompts.reduce((sum, p) => sum + p.performance.averageRating, 0);
    return Math.round((totalRating / validPrompts.length) * 10) / 10;
  }

  calculateAverageResponseTime(prompts) {
    const validPrompts = prompts.filter(p => p.performance.responseTime > 0);
    if (validPrompts.length === 0) return 0;

    const totalResponseTime = validPrompts.reduce((sum, p) => sum + p.performance.responseTime, 0);
    return Math.round(totalResponseTime / validPrompts.length);
  }

  getTopPerformingPrompts(prompts, limit) {
    return prompts
      .filter(p => p.performance.totalUsage > 0)
      .sort((a, b) => {
        // Sort by success rate, then by rating, then by usage
        if (b.performance.successRate !== a.performance.successRate) {
          return b.performance.successRate - a.performance.successRate;
        }
        if (b.performance.averageRating !== a.performance.averageRating) {
          return b.performance.averageRating - a.performance.averageRating;
        }
        return b.performance.totalUsage - a.performance.totalUsage;
      })
      .slice(0, limit)
      .map(p => ({
        id: p.id,
        name: p.name,
        successRate: p.performance.successRate,
        rating: p.performance.averageRating,
        usage: p.performance.totalUsage,
      }));
  }

  getUsageTrend(prompts, period) {
    // Mock usage trend data
    return [
      { period: 'الأسبوع 1', usage: 120, successRate: 85 },
      { period: 'الأسبوع 2', usage: 145, successRate: 87 },
      { period: 'الأسبوع 3', usage: 160, successRate: 89 },
      { period: 'الأسبوع 4', usage: 180, successRate: 91 },
    ];
  }

  getPerformanceComparison(prompts) {
    // Mock performance comparison
    return {
      thisMonth: { usage: 605, successRate: 88, rating: 4.3 },
      lastMonth: { usage: 520, successRate: 85, rating: 4.1 },
      improvement: { usage: '+16%', successRate: '+3%', rating: '+5%' },
    };
  }

  generatePromptId() {
    return `PROMPT${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new PromptManagementService();
