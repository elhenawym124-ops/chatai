/**
 * Enhanced Conversation Management Service
 * 
 * Handles conversation classification, status management, and intelligent routing
 */

class ConversationService {
  constructor() {
    this.conversations = new Map(); // Conversation storage
    this.categories = new Map(); // Conversation categories
    this.tags = new Map(); // Conversation tags
    this.templates = new Map(); // Response templates
    this.responseStats = new Map(); // Response time statistics
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock conversation categories
    const mockCategories = [
      {
        id: 'CAT001',
        name: 'استفسارات عامة',
        description: 'أسئلة عامة حول المنتجات والخدمات',
        color: '#3B82F6',
        priority: 'medium',
        autoAssign: true,
        assignToTeam: 'general_support',
        isActive: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'CAT002',
        name: 'مشاكل تقنية',
        description: 'مشاكل في الموقع أو التطبيق',
        color: '#EF4444',
        priority: 'high',
        autoAssign: true,
        assignToTeam: 'technical_support',
        isActive: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'CAT003',
        name: 'طلبات شراء',
        description: 'استفسارات حول المنتجات ونوايا الشراء',
        color: '#10B981',
        priority: 'high',
        autoAssign: true,
        assignToTeam: 'sales',
        isActive: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'CAT004',
        name: 'شكاوى',
        description: 'شكاوى العملاء ومشاكل الخدمة',
        color: '#F59E0B',
        priority: 'urgent',
        autoAssign: true,
        assignToTeam: 'customer_service',
        isActive: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'CAT005',
        name: 'طلبات إرجاع',
        description: 'طلبات إرجاع أو استبدال المنتجات',
        color: '#8B5CF6',
        priority: 'medium',
        autoAssign: true,
        assignToTeam: 'returns',
        isActive: true,
        createdAt: new Date('2024-01-01'),
      }
    ];

    mockCategories.forEach(category => {
      this.categories.set(category.id, category);
    });

    // Mock conversations with enhanced data
    const mockConversations = [
      {
        id: 'CONV001',
        customerId: '1',
        customerName: 'أحمد محمد',
        customerPhone: '+966501234567',
        platform: 'messenger',
        status: 'active',
        priority: 'medium',
        categoryId: 'CAT001',
        categoryName: 'استفسارات عامة',
        tags: ['منتج', 'سعر'],
        assignedTo: '1',
        assignedToName: 'أحمد المدير',
        lastMessage: 'كم سعر اللابتوب؟',
        lastMessageAt: new Date('2024-01-15T14:30:00'),
        responseTime: 120, // seconds
        isAIHandled: false,
        sentiment: 'neutral',
        intent: 'inquiry',
        urgency: 'medium',
        createdAt: new Date('2024-01-15T14:25:00'),
        updatedAt: new Date('2024-01-15T14:30:00'),
        messages: [
          {
            id: 'MSG001',
            senderId: '1',
            senderType: 'customer',
            text: 'مرحباً، أريد السؤال عن اللابتوبات المتاحة',
            timestamp: new Date('2024-01-15T14:25:00'),
            isRead: true,
          },
          {
            id: 'MSG002',
            senderId: '1',
            senderType: 'agent',
            text: 'مرحباً بك! لدينا مجموعة متنوعة من اللابتوبات. ما نوع الاستخدام المطلوب؟',
            timestamp: new Date('2024-01-15T14:27:00'),
            isRead: true,
          },
          {
            id: 'MSG003',
            senderId: '1',
            senderType: 'customer',
            text: 'للعمل المكتبي والتصميم',
            timestamp: new Date('2024-01-15T14:28:00'),
            isRead: true,
          },
          {
            id: 'MSG004',
            senderId: '1',
            senderType: 'customer',
            text: 'كم سعر اللابتوب؟',
            timestamp: new Date('2024-01-15T14:30:00'),
            isRead: false,
          }
        ],
      },
      {
        id: 'CONV002',
        customerId: '2',
        customerName: 'سارة أحمد',
        customerPhone: '+966507654321',
        platform: 'whatsapp',
        status: 'pending',
        priority: 'high',
        categoryId: 'CAT002',
        categoryName: 'مشاكل تقنية',
        tags: ['موقع', 'خطأ', 'دفع'],
        assignedTo: null,
        assignedToName: null,
        lastMessage: 'لا أستطيع إكمال عملية الدفع',
        lastMessageAt: new Date('2024-01-15T15:45:00'),
        responseTime: null,
        isAIHandled: false,
        sentiment: 'negative',
        intent: 'complaint',
        urgency: 'high',
        createdAt: new Date('2024-01-15T15:45:00'),
        updatedAt: new Date('2024-01-15T15:45:00'),
        messages: [
          {
            id: 'MSG005',
            senderId: '2',
            senderType: 'customer',
            text: 'لا أستطيع إكمال عملية الدفع، يظهر لي خطأ',
            timestamp: new Date('2024-01-15T15:45:00'),
            isRead: false,
          }
        ],
      }
    ];

    mockConversations.forEach(conversation => {
      this.conversations.set(conversation.id, conversation);
    });

    // Mock response templates
    const mockTemplates = [
      {
        id: 'TEMP001',
        name: 'ترحيب عام',
        category: 'greeting',
        text: 'مرحباً بك في {company_name}! كيف يمكنني مساعدتك اليوم؟',
        variables: ['company_name'],
        isActive: true,
        usageCount: 156,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'TEMP002',
        name: 'استفسار عن المنتج',
        category: 'product_inquiry',
        text: 'شكراً لاستفسارك عن {product_name}. السعر هو {price} ريال. هل تحتاج معلومات إضافية؟',
        variables: ['product_name', 'price'],
        isActive: true,
        usageCount: 89,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'TEMP003',
        name: 'اعتذار عن التأخير',
        category: 'apology',
        text: 'نعتذر عن التأخير في الرد. نحن نعمل على حل مشكلتك بأسرع وقت ممكن.',
        variables: [],
        isActive: true,
        usageCount: 45,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'TEMP004',
        name: 'تحويل للفريق التقني',
        category: 'escalation',
        text: 'سأقوم بتحويل استفسارك للفريق التقني المختص. سيتواصلون معك خلال 15 دقيقة.',
        variables: [],
        isActive: true,
        usageCount: 67,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'TEMP005',
        name: 'إنهاء المحادثة',
        category: 'closing',
        text: 'شكراً لتواصلك معنا! نتمنى أن نكون قد ساعدناك. لا تتردد في التواصل معنا مرة أخرى.',
        variables: [],
        isActive: true,
        usageCount: 234,
        createdAt: new Date('2024-01-01'),
      }
    ];

    mockTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Classify conversation automatically
   */
  async classifyConversation(conversationId, messageText) {
    try {
      const conversation = this.conversations.get(conversationId);
      
      if (!conversation) {
        return {
          success: false,
          error: 'المحادثة غير موجودة'
        };
      }

      // Use AI for classification (mock implementation)
      const classification = await this.performAIClassification(messageText);

      // Update conversation with classification
      conversation.categoryId = classification.categoryId;
      conversation.categoryName = classification.categoryName;
      conversation.tags = classification.tags;
      conversation.priority = classification.priority;
      conversation.sentiment = classification.sentiment;
      conversation.intent = classification.intent;
      conversation.urgency = classification.urgency;
      conversation.updatedAt = new Date();

      // Auto-assign if enabled
      const category = this.categories.get(classification.categoryId);
      if (category && category.autoAssign && !conversation.assignedTo) {
        conversation.assignedTo = this.getAvailableAgent(category.assignToTeam);
        conversation.assignedToName = this.getAgentName(conversation.assignedTo);
      }

      this.conversations.set(conversationId, conversation);

      return {
        success: true,
        data: {
          categoryId: classification.categoryId,
          categoryName: classification.categoryName,
          tags: classification.tags,
          priority: classification.priority,
          sentiment: classification.sentiment,
          assignedTo: conversation.assignedTo,
        },
        message: 'تم تصنيف المحادثة بنجاح'
      };
    } catch (error) {
      console.error('Error classifying conversation:', error);
      return {
        success: false,
        error: 'فشل في تصنيف المحادثة'
      };
    }
  }

  /**
   * Update conversation status
   */
  async updateConversationStatus(conversationId, status, notes = '') {
    try {
      const conversation = this.conversations.get(conversationId);
      
      if (!conversation) {
        return {
          success: false,
          error: 'المحادثة غير موجودة'
        };
      }

      const oldStatus = conversation.status;
      conversation.status = status;
      conversation.updatedAt = new Date();

      // Add status change to conversation history
      if (notes) {
        conversation.messages.push({
          id: this.generateMessageId(),
          senderId: 'system',
          senderType: 'system',
          text: `تم تغيير حالة المحادثة من "${oldStatus}" إلى "${status}". ملاحظات: ${notes}`,
          timestamp: new Date(),
          isRead: true,
        });
      }

      this.conversations.set(conversationId, conversation);

      return {
        success: true,
        data: conversation,
        message: 'تم تحديث حالة المحادثة'
      };
    } catch (error) {
      console.error('Error updating conversation status:', error);
      return {
        success: false,
        error: 'فشل في تحديث حالة المحادثة'
      };
    }
  }

  /**
   * Assign conversation to agent
   */
  async assignConversation(conversationId, agentId, agentName) {
    try {
      const conversation = this.conversations.get(conversationId);
      
      if (!conversation) {
        return {
          success: false,
          error: 'المحادثة غير موجودة'
        };
      }

      conversation.assignedTo = agentId;
      conversation.assignedToName = agentName;
      conversation.updatedAt = new Date();

      // Add assignment message
      conversation.messages.push({
        id: this.generateMessageId(),
        senderId: 'system',
        senderType: 'system',
        text: `تم تعيين المحادثة للموظف: ${agentName}`,
        timestamp: new Date(),
        isRead: true,
      });

      this.conversations.set(conversationId, conversation);

      return {
        success: true,
        data: conversation,
        message: 'تم تعيين المحادثة بنجاح'
      };
    } catch (error) {
      console.error('Error assigning conversation:', error);
      return {
        success: false,
        error: 'فشل في تعيين المحادثة'
      };
    }
  }

  /**
   * Get response templates
   */
  async getResponseTemplates(category = null) {
    try {
      let templates = Array.from(this.templates.values());

      if (category) {
        templates = templates.filter(template => template.category === category);
      }

      templates = templates.filter(template => template.isActive);
      templates.sort((a, b) => b.usageCount - a.usageCount);

      return {
        success: true,
        data: templates
      };
    } catch (error) {
      console.error('Error getting response templates:', error);
      return {
        success: false,
        error: 'فشل في جلب قوالب الردود'
      };
    }
  }

  /**
   * Use response template
   */
  async useResponseTemplate(templateId, variables = {}) {
    try {
      const template = this.templates.get(templateId);
      
      if (!template) {
        return {
          success: false,
          error: 'القالب غير موجود'
        };
      }

      let responseText = template.text;

      // Replace variables
      template.variables.forEach(variable => {
        const value = variables[variable] || `{${variable}}`;
        responseText = responseText.replace(new RegExp(`{${variable}}`, 'g'), value);
      });

      // Increment usage count
      template.usageCount++;
      this.templates.set(templateId, template);

      return {
        success: true,
        data: {
          text: responseText,
          template: template,
        }
      };
    } catch (error) {
      console.error('Error using response template:', error);
      return {
        success: false,
        error: 'فشل في استخدام القالب'
      };
    }
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats() {
    try {
      const conversations = Array.from(this.conversations.values());
      
      const stats = {
        total: conversations.length,
        active: conversations.filter(c => c.status === 'active').length,
        pending: conversations.filter(c => c.status === 'pending').length,
        resolved: conversations.filter(c => c.status === 'resolved').length,
        closed: conversations.filter(c => c.status === 'closed').length,
        averageResponseTime: this.calculateAverageResponseTime(conversations),
        categoryDistribution: this.getCategoryDistribution(conversations),
        sentimentDistribution: this.getSentimentDistribution(conversations),
        priorityDistribution: this.getPriorityDistribution(conversations),
        platformDistribution: this.getPlatformDistribution(conversations),
        assignmentStats: this.getAssignmentStats(conversations),
        hourlyDistribution: this.getHourlyDistribution(conversations),
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات المحادثات'
      };
    }
  }

  /**
   * Get conversations with filters
   */
  async getConversations(filters = {}) {
    try {
      let conversations = Array.from(this.conversations.values());

      // Apply filters
      if (filters.status) {
        conversations = conversations.filter(c => c.status === filters.status);
      }

      if (filters.categoryId) {
        conversations = conversations.filter(c => c.categoryId === filters.categoryId);
      }

      if (filters.assignedTo) {
        conversations = conversations.filter(c => c.assignedTo === filters.assignedTo);
      }

      if (filters.priority) {
        conversations = conversations.filter(c => c.priority === filters.priority);
      }

      if (filters.platform) {
        conversations = conversations.filter(c => c.platform === filters.platform);
      }

      if (filters.sentiment) {
        conversations = conversations.filter(c => c.sentiment === filters.sentiment);
      }

      // Sort by last message time (newest first)
      conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedConversations = conversations.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedConversations,
        pagination: {
          page,
          limit,
          total: conversations.length,
          pages: Math.ceil(conversations.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting conversations:', error);
      return {
        success: false,
        error: 'فشل في جلب المحادثات'
      };
    }
  }

  /**
   * Helper methods
   */
  async performAIClassification(messageText) {
    // Mock AI classification - in production, integrate with Gemini
    const keywords = messageText.toLowerCase();
    
    if (keywords.includes('خطأ') || keywords.includes('مشكلة') || keywords.includes('لا يعمل')) {
      return {
        categoryId: 'CAT002',
        categoryName: 'مشاكل تقنية',
        tags: ['مشكلة', 'تقني'],
        priority: 'high',
        sentiment: 'negative',
        intent: 'complaint',
        urgency: 'high',
      };
    }

    if (keywords.includes('شراء') || keywords.includes('سعر') || keywords.includes('منتج')) {
      return {
        categoryId: 'CAT003',
        categoryName: 'طلبات شراء',
        tags: ['شراء', 'منتج'],
        priority: 'high',
        sentiment: 'positive',
        intent: 'purchase',
        urgency: 'medium',
      };
    }

    if (keywords.includes('شكوى') || keywords.includes('غاضب') || keywords.includes('مستاء')) {
      return {
        categoryId: 'CAT004',
        categoryName: 'شكاوى',
        tags: ['شكوى', 'خدمة'],
        priority: 'urgent',
        sentiment: 'negative',
        intent: 'complaint',
        urgency: 'high',
      };
    }

    if (keywords.includes('إرجاع') || keywords.includes('استبدال') || keywords.includes('مرتجع')) {
      return {
        categoryId: 'CAT005',
        categoryName: 'طلبات إرجاع',
        tags: ['إرجاع', 'استبدال'],
        priority: 'medium',
        sentiment: 'neutral',
        intent: 'return',
        urgency: 'medium',
      };
    }

    // Default classification
    return {
      categoryId: 'CAT001',
      categoryName: 'استفسارات عامة',
      tags: ['عام', 'استفسار'],
      priority: 'medium',
      sentiment: 'neutral',
      intent: 'inquiry',
      urgency: 'medium',
    };
  }

  getAvailableAgent(team) {
    // Mock agent assignment
    const agents = {
      general_support: '1',
      technical_support: '2',
      sales: '1',
      customer_service: '1',
      returns: '2',
    };
    
    return agents[team] || '1';
  }

  getAgentName(agentId) {
    const agents = {
      '1': 'أحمد المدير',
      '2': 'سارة المستشارة',
    };
    
    return agents[agentId] || 'موظف خدمة العملاء';
  }

  calculateAverageResponseTime(conversations) {
    const responseTimes = conversations
      .filter(c => c.responseTime)
      .map(c => c.responseTime);
    
    if (responseTimes.length === 0) return 0;
    
    return Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length);
  }

  getCategoryDistribution(conversations) {
    const distribution = {};
    conversations.forEach(c => {
      distribution[c.categoryName] = (distribution[c.categoryName] || 0) + 1;
    });
    return distribution;
  }

  getSentimentDistribution(conversations) {
    const distribution = {};
    conversations.forEach(c => {
      distribution[c.sentiment] = (distribution[c.sentiment] || 0) + 1;
    });
    return distribution;
  }

  getPriorityDistribution(conversations) {
    const distribution = {};
    conversations.forEach(c => {
      distribution[c.priority] = (distribution[c.priority] || 0) + 1;
    });
    return distribution;
  }

  getPlatformDistribution(conversations) {
    const distribution = {};
    conversations.forEach(c => {
      distribution[c.platform] = (distribution[c.platform] || 0) + 1;
    });
    return distribution;
  }

  getAssignmentStats(conversations) {
    const assigned = conversations.filter(c => c.assignedTo).length;
    const unassigned = conversations.length - assigned;
    
    return {
      assigned,
      unassigned,
      assignmentRate: conversations.length > 0 ? (assigned / conversations.length * 100).toFixed(1) : 0,
    };
  }

  getHourlyDistribution(conversations) {
    const distribution = {};
    conversations.forEach(c => {
      const hour = new Date(c.createdAt).getHours();
      distribution[hour] = (distribution[hour] || 0) + 1;
    });
    return distribution;
  }

  generateMessageId() {
    return `MSG${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new ConversationService();
