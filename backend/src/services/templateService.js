/**
 * Response Templates Service
 * 
 * Handles quick response templates, canned responses, and message templates
 */

class TemplateService {
  constructor() {
    this.templates = new Map(); // Response templates
    this.categories = new Map(); // Template categories
    this.variables = new Map(); // Template variables
    this.usage = new Map(); // Template usage statistics
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock template categories
    const mockCategories = [
      {
        id: 'CAT001',
        name: 'ترحيب وتحية',
        description: 'قوالب الترحيب والتحية للعملاء',
        color: '#10B981',
        icon: '👋',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'CAT002',
        name: 'معلومات المنتجات',
        description: 'قوالب للرد على استفسارات المنتجات',
        color: '#3B82F6',
        icon: '📦',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'CAT003',
        name: 'الطلبات والشحن',
        description: 'قوالب متعلقة بالطلبات والشحن',
        color: '#F59E0B',
        icon: '🚚',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'CAT004',
        name: 'الدعم الفني',
        description: 'قوالب للدعم الفني وحل المشاكل',
        color: '#EF4444',
        icon: '🔧',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'CAT005',
        name: 'إنهاء المحادثة',
        description: 'قوالب لإنهاء المحادثات بطريقة مهذبة',
        color: '#8B5CF6',
        icon: '👋',
        isActive: true,
        sortOrder: 5,
        createdAt: new Date('2024-01-01'),
      }
    ];

    mockCategories.forEach(category => {
      this.categories.set(category.id, category);
    });

    // Mock response templates
    const mockTemplates = [
      {
        id: 'TEMP001',
        name: 'ترحيب عام',
        categoryId: 'CAT001',
        categoryName: 'ترحيب وتحية',
        content: 'مرحباً بك في {company_name}! 👋\nكيف يمكنني مساعدتك اليوم؟',
        variables: ['company_name'],
        tags: ['ترحيب', 'عام'],
        language: 'ar',
        isActive: true,
        isPublic: true,
        companyId: '1',
        createdBy: '1',
        createdByName: 'أحمد المدير',
        usageCount: 156,
        lastUsed: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: 'TEMP002',
        name: 'ترحيب مسائي',
        categoryId: 'CAT001',
        categoryName: 'ترحيب وتحية',
        content: 'مساء الخير! 🌙\nأهلاً وسهلاً بك في {company_name}.\nكيف يمكنني خدمتك هذا المساء؟',
        variables: ['company_name'],
        tags: ['ترحيب', 'مساء'],
        language: 'ar',
        isActive: true,
        isPublic: true,
        companyId: '1',
        createdBy: '1',
        createdByName: 'أحمد المدير',
        usageCount: 89,
        lastUsed: new Date('2024-01-14'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-05'),
      },
      {
        id: 'TEMP003',
        name: 'استفسار عن منتج',
        categoryId: 'CAT002',
        categoryName: 'معلومات المنتجات',
        content: 'شكراً لاستفسارك عن {product_name}! 📦\n\nالسعر: {price} ريال\nالتوفر: {availability}\n\nهل تحتاج معلومات إضافية أو تود إتمام الطلب؟',
        variables: ['product_name', 'price', 'availability'],
        tags: ['منتج', 'سعر', 'توفر'],
        language: 'ar',
        isActive: true,
        isPublic: true,
        companyId: '1',
        createdBy: '1',
        createdByName: 'أحمد المدير',
        usageCount: 234,
        lastUsed: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-08'),
      },
      {
        id: 'TEMP004',
        name: 'منتج غير متوفر',
        categoryId: 'CAT002',
        categoryName: 'معلومات المنتجات',
        content: 'نعتذر، {product_name} غير متوفر حالياً. 😔\n\nلكن يمكنني اقتراح بدائل ممتازة:\n• {alternative_1}\n• {alternative_2}\n\nأو يمكنك تسجيل اهتمامك وسنخبرك عند توفره.',
        variables: ['product_name', 'alternative_1', 'alternative_2'],
        tags: ['منتج', 'غير متوفر', 'بدائل'],
        language: 'ar',
        isActive: true,
        isPublic: true,
        companyId: '1',
        createdBy: '1',
        createdByName: 'أحمد المدير',
        usageCount: 67,
        lastUsed: new Date('2024-01-13'),
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-12'),
      },
      {
        id: 'TEMP005',
        name: 'تأكيد الطلب',
        categoryId: 'CAT003',
        categoryName: 'الطلبات والشحن',
        content: 'تم تأكيد طلبك بنجاح! ✅\n\nرقم الطلب: {order_number}\nالمبلغ الإجمالي: {total_amount} ريال\nوقت التسليم المتوقع: {delivery_time}\n\nسنرسل لك رابط التتبع قريباً.',
        variables: ['order_number', 'total_amount', 'delivery_time'],
        tags: ['طلب', 'تأكيد', 'شحن'],
        language: 'ar',
        isActive: true,
        isPublic: true,
        companyId: '1',
        createdBy: '1',
        createdByName: 'أحمد المدير',
        usageCount: 145,
        lastUsed: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-07'),
      },
      {
        id: 'TEMP006',
        name: 'تتبع الطلب',
        categoryId: 'CAT003',
        categoryName: 'الطلبات والشحن',
        content: 'معلومات طلبك رقم {order_number}: 📦\n\nالحالة: {order_status}\nالموقع الحالي: {current_location}\nالتسليم المتوقع: {expected_delivery}\n\nرابط التتبع: {tracking_link}',
        variables: ['order_number', 'order_status', 'current_location', 'expected_delivery', 'tracking_link'],
        tags: ['طلب', 'تتبع', 'شحن'],
        language: 'ar',
        isActive: true,
        isPublic: true,
        companyId: '1',
        createdBy: '1',
        createdByName: 'أحمد المدير',
        usageCount: 98,
        lastUsed: new Date('2024-01-14'),
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-09'),
      },
      {
        id: 'TEMP007',
        name: 'مشكلة تقنية',
        categoryId: 'CAT004',
        categoryName: 'الدعم الفني',
        content: 'أعتذر عن المشكلة التي تواجهها. 🔧\n\nلحل هذه المشكلة، يرجى:\n1. {step_1}\n2. {step_2}\n3. {step_3}\n\nإذا استمرت المشكلة، سأحولك لفريق الدعم الفني المختص.',
        variables: ['step_1', 'step_2', 'step_3'],
        tags: ['دعم', 'مشكلة', 'حل'],
        language: 'ar',
        isActive: true,
        isPublic: true,
        companyId: '1',
        createdBy: '2',
        createdByName: 'سارة المستشارة',
        usageCount: 76,
        lastUsed: new Date('2024-01-13'),
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-11'),
      },
      {
        id: 'TEMP008',
        name: 'تحويل للمختص',
        categoryId: 'CAT004',
        categoryName: 'الدعم الفني',
        content: 'سأقوم بتحويل استفسارك للفريق المختص. 👨‍💻\n\nسيتواصل معك أحد المختصين خلال {response_time} دقيقة.\n\nشكراً لصبرك وتفهمك.',
        variables: ['response_time'],
        tags: ['تحويل', 'مختص', 'انتظار'],
        language: 'ar',
        isActive: true,
        isPublic: true,
        companyId: '1',
        createdBy: '1',
        createdByName: 'أحمد المدير',
        usageCount: 123,
        lastUsed: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-06'),
      },
      {
        id: 'TEMP009',
        name: 'إنهاء مهذب',
        categoryId: 'CAT005',
        categoryName: 'إنهاء المحادثة',
        content: 'شكراً لتواصلك معنا! 🙏\n\nنتمنى أن نكون قد ساعدناك.\nلا تتردد في التواصل معنا مرة أخرى إذا احتجت أي مساعدة.\n\nنتمنى لك يوماً سعيداً! ✨',
        variables: [],
        tags: ['إنهاء', 'شكر', 'وداع'],
        language: 'ar',
        isActive: true,
        isPublic: true,
        companyId: '1',
        createdBy: '1',
        createdByName: 'أحمد المدير',
        usageCount: 189,
        lastUsed: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-04'),
      },
      {
        id: 'TEMP010',
        name: 'إنهاء مع تقييم',
        categoryId: 'CAT005',
        categoryName: 'إنهاء المحادثة',
        content: 'تم حل مشكلتك بنجاح! ✅\n\nهل يمكنك تقييم خدمتنا من 1 إلى 5؟ ⭐\nرأيك مهم جداً لتحسين خدماتنا.\n\nشكراً لك ونتمنى لك يوماً رائعاً! 🌟',
        variables: [],
        tags: ['إنهاء', 'تقييم', 'رضا'],
        language: 'ar',
        isActive: true,
        isPublic: true,
        companyId: '1',
        createdBy: '1',
        createdByName: 'أحمد المدير',
        usageCount: 134,
        lastUsed: new Date('2024-01-14'),
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-08'),
      }
    ];

    mockTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    // Mock template variables
    const mockVariables = [
      {
        id: 'VAR001',
        name: 'company_name',
        displayName: 'اسم الشركة',
        description: 'اسم الشركة أو المتجر',
        type: 'text',
        defaultValue: 'متجرنا',
        isRequired: false,
        category: 'company',
      },
      {
        id: 'VAR002',
        name: 'customer_name',
        displayName: 'اسم العميل',
        description: 'اسم العميل الحالي',
        type: 'text',
        defaultValue: 'عزيزي العميل',
        isRequired: false,
        category: 'customer',
      },
      {
        id: 'VAR003',
        name: 'product_name',
        displayName: 'اسم المنتج',
        description: 'اسم المنتج المستفسر عنه',
        type: 'text',
        defaultValue: 'المنتج',
        isRequired: true,
        category: 'product',
      },
      {
        id: 'VAR004',
        name: 'price',
        displayName: 'السعر',
        description: 'سعر المنتج',
        type: 'number',
        defaultValue: '0',
        isRequired: true,
        category: 'product',
      },
      {
        id: 'VAR005',
        name: 'order_number',
        displayName: 'رقم الطلب',
        description: 'رقم الطلب الفريد',
        type: 'text',
        defaultValue: '#12345',
        isRequired: true,
        category: 'order',
      }
    ];

    mockVariables.forEach(variable => {
      this.variables.set(variable.id, variable);
    });
  }

  /**
   * Create new template
   */
  async createTemplate(templateData) {
    try {
      const {
        name,
        categoryId,
        content,
        variables = [],
        tags = [],
        language = 'ar',
        isPublic = true,
        companyId,
        createdBy,
        createdByName,
      } = templateData;

      // Validate category
      const category = this.categories.get(categoryId);
      if (!category) {
        return {
          success: false,
          error: 'التصنيف غير موجود'
        };
      }

      // Extract variables from content
      const extractedVariables = this.extractVariables(content);

      const template = {
        id: this.generateTemplateId(),
        name,
        categoryId,
        categoryName: category.name,
        content,
        variables: [...new Set([...variables, ...extractedVariables])],
        tags,
        language,
        isActive: true,
        isPublic,
        companyId,
        createdBy,
        createdByName,
        usageCount: 0,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.templates.set(template.id, template);

      return {
        success: true,
        data: template,
        message: 'تم إنشاء القالب بنجاح'
      };
    } catch (error) {
      console.error('Error creating template:', error);
      return {
        success: false,
        error: 'فشل في إنشاء القالب'
      };
    }
  }

  /**
   * Update template
   */
  async updateTemplate(templateId, updateData) {
    try {
      const template = this.templates.get(templateId);
      
      if (!template) {
        return {
          success: false,
          error: 'القالب غير موجود'
        };
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          template[key] = updateData[key];
        }
      });

      // Re-extract variables if content changed
      if (updateData.content) {
        template.variables = this.extractVariables(updateData.content);
      }

      template.updatedAt = new Date();
      this.templates.set(templateId, template);

      return {
        success: true,
        data: template,
        message: 'تم تحديث القالب بنجاح'
      };
    } catch (error) {
      console.error('Error updating template:', error);
      return {
        success: false,
        error: 'فشل في تحديث القالب'
      };
    }
  }

  /**
   * Use template with variables
   */
  async useTemplate(templateId, variableValues = {}) {
    try {
      const template = this.templates.get(templateId);
      
      if (!template) {
        return {
          success: false,
          error: 'القالب غير موجود'
        };
      }

      if (!template.isActive) {
        return {
          success: false,
          error: 'القالب غير نشط'
        };
      }

      // Replace variables in content
      let processedContent = template.content;
      
      template.variables.forEach(variable => {
        const value = variableValues[variable] || `{${variable}}`;
        const regex = new RegExp(`{${variable}}`, 'g');
        processedContent = processedContent.replace(regex, value);
      });

      // Update usage statistics
      template.usageCount++;
      template.lastUsed = new Date();
      this.templates.set(templateId, template);

      return {
        success: true,
        data: {
          originalContent: template.content,
          processedContent,
          variables: template.variables,
          usedVariables: variableValues,
          template: {
            id: template.id,
            name: template.name,
            category: template.categoryName,
          }
        }
      };
    } catch (error) {
      console.error('Error using template:', error);
      return {
        success: false,
        error: 'فشل في استخدام القالب'
      };
    }
  }

  /**
   * Get templates
   */
  async getTemplates(filters = {}) {
    try {
      let templates = Array.from(this.templates.values());

      // Apply filters
      if (filters.categoryId) {
        templates = templates.filter(t => t.categoryId === filters.categoryId);
      }

      if (filters.companyId) {
        templates = templates.filter(t => t.companyId === filters.companyId || t.isPublic);
      }

      if (filters.language) {
        templates = templates.filter(t => t.language === filters.language);
      }

      if (filters.isActive !== undefined) {
        templates = templates.filter(t => t.isActive === filters.isActive);
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        templates = templates.filter(t => 
          t.name.toLowerCase().includes(searchTerm) ||
          t.content.toLowerCase().includes(searchTerm) ||
          t.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Sort templates
      const sortBy = filters.sortBy || 'usage';
      switch (sortBy) {
        case 'usage':
          templates.sort((a, b) => b.usageCount - a.usageCount);
          break;
        case 'name':
          templates.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'recent':
          templates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          break;
        case 'category':
          templates.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
          break;
      }

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedTemplates = templates.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedTemplates,
        pagination: {
          page,
          limit,
          total: templates.length,
          pages: Math.ceil(templates.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting templates:', error);
      return {
        success: false,
        error: 'فشل في جلب القوالب'
      };
    }
  }

  /**
   * Get template categories
   */
  async getCategories() {
    try {
      const categories = Array.from(this.categories.values())
        .filter(category => category.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      return {
        success: true,
        data: categories
      };
    } catch (error) {
      console.error('Error getting categories:', error);
      return {
        success: false,
        error: 'فشل في جلب التصنيفات'
      };
    }
  }

  /**
   * Get template variables
   */
  async getVariables(category = null) {
    try {
      let variables = Array.from(this.variables.values());

      if (category) {
        variables = variables.filter(v => v.category === category);
      }

      return {
        success: true,
        data: variables
      };
    } catch (error) {
      console.error('Error getting variables:', error);
      return {
        success: false,
        error: 'فشل في جلب المتغيرات'
      };
    }
  }

  /**
   * Get template statistics
   */
  async getTemplateStats(companyId = null) {
    try {
      let templates = Array.from(this.templates.values());
      
      if (companyId) {
        templates = templates.filter(t => t.companyId === companyId || t.isPublic);
      }

      const stats = {
        totalTemplates: templates.length,
        activeTemplates: templates.filter(t => t.isActive).length,
        publicTemplates: templates.filter(t => t.isPublic).length,
        privateTemplates: templates.filter(t => !t.isPublic).length,
        totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
        averageUsage: templates.length > 0 ? 
          Math.round(templates.reduce((sum, t) => sum + t.usageCount, 0) / templates.length) : 0,
        categoryDistribution: this.getCategoryDistribution(templates),
        topTemplates: templates
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, 10)
          .map(t => ({
            id: t.id,
            name: t.name,
            category: t.categoryName,
            usageCount: t.usageCount,
            lastUsed: t.lastUsed,
          })),
        recentTemplates: templates
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(t => ({
            id: t.id,
            name: t.name,
            category: t.categoryName,
            createdAt: t.createdAt,
            createdBy: t.createdByName,
          })),
        languageDistribution: this.getLanguageDistribution(templates),
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting template stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات القوالب'
      };
    }
  }

  /**
   * Helper methods
   */
  extractVariables(content) {
    const variableRegex = /{([^}]+)}/g;
    const variables = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      variables.push(match[1]);
    }

    return [...new Set(variables)]; // Remove duplicates
  }

  getCategoryDistribution(templates) {
    const distribution = {};
    templates.forEach(template => {
      distribution[template.categoryName] = (distribution[template.categoryName] || 0) + 1;
    });
    return distribution;
  }

  getLanguageDistribution(templates) {
    const distribution = {};
    templates.forEach(template => {
      distribution[template.language] = (distribution[template.language] || 0) + 1;
    });
    return distribution;
  }

  generateTemplateId() {
    return `TEMP${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new TemplateService();
