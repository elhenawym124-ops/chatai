/**
 * Escalation Rules Service
 * 
 * Handles intelligent escalation rules for conversations,
 * automatic supervisor assignment, and priority management
 */

class EscalationRulesService {
  constructor() {
    this.escalationRules = new Map(); // Escalation rules
    this.escalationHistory = new Map(); // Escalation history
    this.supervisors = new Map(); // Available supervisors
    this.escalationQueue = new Map(); // Pending escalations
    this.ruleTemplates = new Map(); // Rule templates
    this.initializeMockData();
    this.startEscalationProcessor();
  }

  /**
   * Initialize mock data for escalation rules
   */
  initializeMockData() {
    // Mock escalation rules
    const mockEscalationRules = [
      {
        id: 'RULE001',
        name: 'تصعيد الشكاوى العاجلة',
        description: 'تصعيد فوري للشكاوى عالية الأولوية',
        priority: 'high',
        isActive: true,
        companyId: '1',
        conditions: {
          keywords: ['شكوى', 'مشكلة عاجلة', 'غير راضي', 'إلغاء الطلب'],
          sentiment: 'negative',
          responseTime: null,
          customerType: null,
          messageCount: null,
        },
        actions: {
          escalateTo: 'supervisor',
          priority: 'urgent',
          notifyMethod: 'immediate',
          assignSpecificSupervisor: null,
          addTags: ['شكوى', 'عاجل'],
          sendNotification: true,
        },
        timing: {
          triggerImmediately: true,
          delayMinutes: 0,
          workingHoursOnly: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'RULE002',
        name: 'تصعيد وقت الاستجابة',
        description: 'تصعيد عند تجاوز وقت الاستجابة المحدد',
        priority: 'medium',
        isActive: true,
        companyId: '1',
        conditions: {
          keywords: null,
          sentiment: null,
          responseTime: 30, // minutes
          customerType: null,
          messageCount: null,
        },
        actions: {
          escalateTo: 'supervisor',
          priority: 'normal',
          notifyMethod: 'standard',
          assignSpecificSupervisor: null,
          addTags: ['تأخير استجابة'],
          sendNotification: true,
        },
        timing: {
          triggerImmediately: false,
          delayMinutes: 30,
          workingHoursOnly: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'RULE003',
        name: 'تصعيد عملاء VIP',
        description: 'تصعيد فوري لعملاء VIP',
        priority: 'high',
        isActive: true,
        companyId: '1',
        conditions: {
          keywords: null,
          sentiment: null,
          responseTime: 10, // minutes
          customerType: 'VIP',
          messageCount: null,
        },
        actions: {
          escalateTo: 'senior_supervisor',
          priority: 'urgent',
          notifyMethod: 'immediate',
          assignSpecificSupervisor: 'supervisor1',
          addTags: ['VIP', 'أولوية عالية'],
          sendNotification: true,
        },
        timing: {
          triggerImmediately: false,
          delayMinutes: 10,
          workingHoursOnly: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'RULE004',
        name: 'تصعيد المحادثات المعقدة',
        description: 'تصعيد المحادثات التي تحتوي على رسائل متعددة بدون حل',
        priority: 'medium',
        isActive: true,
        companyId: '1',
        conditions: {
          keywords: null,
          sentiment: 'negative',
          responseTime: null,
          customerType: null,
          messageCount: 5,
        },
        actions: {
          escalateTo: 'specialist',
          priority: 'normal',
          notifyMethod: 'standard',
          assignSpecificSupervisor: null,
          addTags: ['محادثة معقدة'],
          sendNotification: true,
        },
        timing: {
          triggerImmediately: false,
          delayMinutes: 0,
          workingHoursOnly: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockEscalationRules.forEach(rule => {
      this.escalationRules.set(rule.id, rule);
    });

    // Mock supervisors
    const mockSupervisors = [
      {
        id: 'supervisor1',
        name: 'أحمد المدير',
        email: 'ahmed.manager@company.com',
        phone: '+966501234567',
        role: 'senior_supervisor',
        specialties: ['VIP', 'شكاوى'],
        isAvailable: true,
        workingHours: {
          start: '08:00',
          end: '17:00',
          timezone: 'Asia/Riyadh',
        },
        maxConcurrentEscalations: 10,
        currentEscalations: 3,
        companyId: '1',
      },
      {
        id: 'supervisor2',
        name: 'فاطمة المشرفة',
        email: 'fatima.supervisor@company.com',
        phone: '+966507654321',
        role: 'supervisor',
        specialties: ['دعم تقني', 'مبيعات'],
        isAvailable: true,
        workingHours: {
          start: '09:00',
          end: '18:00',
          timezone: 'Asia/Riyadh',
        },
        maxConcurrentEscalations: 15,
        currentEscalations: 7,
        companyId: '1',
      },
      {
        id: 'specialist1',
        name: 'محمد المختص',
        email: 'mohammed.specialist@company.com',
        phone: '+966509876543',
        role: 'specialist',
        specialties: ['مشاكل تقنية', 'منتجات معقدة'],
        isAvailable: true,
        workingHours: {
          start: '10:00',
          end: '19:00',
          timezone: 'Asia/Riyadh',
        },
        maxConcurrentEscalations: 8,
        currentEscalations: 2,
        companyId: '1',
      },
    ];

    mockSupervisors.forEach(supervisor => {
      this.supervisors.set(supervisor.id, supervisor);
    });

    // Mock escalation history
    const mockEscalationHistory = [
      {
        id: 'ESC001',
        conversationId: 'CONV001',
        customerId: '1',
        ruleId: 'RULE001',
        escalatedFrom: 'agent1',
        escalatedTo: 'supervisor1',
        reason: 'شكوى عاجلة من العميل',
        priority: 'urgent',
        status: 'resolved',
        escalatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 30 * 60 * 1000),
        resolutionTime: 90, // minutes
        notes: 'تم حل المشكلة بنجاح',
        companyId: '1',
      },
      {
        id: 'ESC002',
        conversationId: 'CONV002',
        customerId: '2',
        ruleId: 'RULE002',
        escalatedFrom: 'agent2',
        escalatedTo: 'supervisor2',
        reason: 'تجاوز وقت الاستجابة المحدد',
        priority: 'normal',
        status: 'in_progress',
        escalatedAt: new Date(Date.now() - 45 * 60 * 1000),
        resolvedAt: null,
        resolutionTime: null,
        notes: 'قيد المعالجة',
        companyId: '1',
      },
    ];

    mockEscalationHistory.forEach(escalation => {
      this.escalationHistory.set(escalation.id, escalation);
    });

    // Mock rule templates
    const mockRuleTemplates = [
      {
        id: 'TEMPLATE001',
        name: 'قالب تصعيد الشكاوى',
        description: 'قالب جاهز لتصعيد الشكاوى',
        category: 'complaints',
        conditions: {
          keywords: ['شكوى', 'مشكلة', 'غير راضي'],
          sentiment: 'negative',
        },
        actions: {
          escalateTo: 'supervisor',
          priority: 'urgent',
          notifyMethod: 'immediate',
        },
      },
      {
        id: 'TEMPLATE002',
        name: 'قالب تصعيد وقت الاستجابة',
        description: 'قالب لتصعيد تأخير الاستجابة',
        category: 'response_time',
        conditions: {
          responseTime: 30,
        },
        actions: {
          escalateTo: 'supervisor',
          priority: 'normal',
          notifyMethod: 'standard',
        },
      },
    ];

    mockRuleTemplates.forEach(template => {
      this.ruleTemplates.set(template.id, template);
    });
  }

  /**
   * Create escalation rule
   */
  async createEscalationRule(ruleData) {
    try {
      const {
        name,
        description,
        priority,
        conditions,
        actions,
        timing,
        companyId,
      } = ruleData;

      const rule = {
        id: this.generateRuleId(),
        name,
        description,
        priority,
        isActive: true,
        companyId,
        conditions,
        actions,
        timing,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.escalationRules.set(rule.id, rule);

      return {
        success: true,
        data: rule,
        message: 'تم إنشاء قاعدة التصعيد بنجاح'
      };

    } catch (error) {
      console.error('Error creating escalation rule:', error);
      return {
        success: false,
        error: 'فشل في إنشاء قاعدة التصعيد'
      };
    }
  }

  /**
   * Check if conversation should be escalated
   */
  async checkEscalation(conversationData) {
    try {
      const {
        conversationId,
        customerId,
        messages,
        lastResponseTime,
        customerType,
        sentiment,
        agentId,
        companyId,
      } = conversationData;

      const applicableRules = Array.from(this.escalationRules.values())
        .filter(rule => rule.isActive && rule.companyId === companyId)
        .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

      for (const rule of applicableRules) {
        const shouldEscalate = this.evaluateRule(rule, {
          messages,
          lastResponseTime,
          customerType,
          sentiment,
        });

        if (shouldEscalate) {
          const escalation = await this.executeEscalation({
            conversationId,
            customerId,
            ruleId: rule.id,
            escalatedFrom: agentId,
            companyId,
          });

          return {
            success: true,
            escalated: true,
            data: escalation,
            rule: rule,
          };
        }
      }

      return {
        success: true,
        escalated: false,
        message: 'لا توجد قواعد تصعيد مطبقة'
      };

    } catch (error) {
      console.error('Error checking escalation:', error);
      return {
        success: false,
        error: 'فشل في فحص قواعد التصعيد'
      };
    }
  }

  /**
   * Execute escalation
   */
  async executeEscalation(escalationData) {
    try {
      const {
        conversationId,
        customerId,
        ruleId,
        escalatedFrom,
        companyId,
      } = escalationData;

      const rule = this.escalationRules.get(ruleId);
      if (!rule) {
        throw new Error('قاعدة التصعيد غير موجودة');
      }

      // Find appropriate supervisor
      const supervisor = await this.findAvailableSupervisor(rule.actions, companyId);
      if (!supervisor) {
        throw new Error('لا يوجد مشرف متاح للتصعيد');
      }

      const escalation = {
        id: this.generateEscalationId(),
        conversationId,
        customerId,
        ruleId,
        escalatedFrom,
        escalatedTo: supervisor.id,
        reason: rule.description,
        priority: rule.actions.priority,
        status: 'pending',
        escalatedAt: new Date(),
        resolvedAt: null,
        resolutionTime: null,
        notes: '',
        companyId,
      };

      // Store escalation
      this.escalationHistory.set(escalation.id, escalation);

      // Update supervisor's current escalations
      supervisor.currentEscalations += 1;
      this.supervisors.set(supervisor.id, supervisor);

      // Send notification if required
      if (rule.actions.sendNotification) {
        await this.sendEscalationNotification(escalation, supervisor, rule);
      }

      // Add tags if specified
      if (rule.actions.addTags && rule.actions.addTags.length > 0) {
        await this.addConversationTags(conversationId, rule.actions.addTags);
      }

      return escalation;

    } catch (error) {
      console.error('Error executing escalation:', error);
      throw error;
    }
  }

  /**
   * Get escalation rules
   */
  async getEscalationRules(filters = {}) {
    try {
      const { companyId, isActive, priority } = filters;

      let rules = Array.from(this.escalationRules.values());

      // Apply filters
      if (companyId) {
        rules = rules.filter(rule => rule.companyId === companyId);
      }
      if (isActive !== undefined) {
        rules = rules.filter(rule => rule.isActive === isActive);
      }
      if (priority) {
        rules = rules.filter(rule => rule.priority === priority);
      }

      return {
        success: true,
        data: rules
      };

    } catch (error) {
      console.error('Error getting escalation rules:', error);
      return {
        success: false,
        error: 'فشل في جلب قواعد التصعيد'
      };
    }
  }

  /**
   * Get escalation history
   */
  async getEscalationHistory(filters = {}) {
    try {
      const { companyId, status, priority, limit = 50 } = filters;

      let history = Array.from(this.escalationHistory.values());

      // Apply filters
      if (companyId) {
        history = history.filter(esc => esc.companyId === companyId);
      }
      if (status) {
        history = history.filter(esc => esc.status === status);
      }
      if (priority) {
        history = history.filter(esc => esc.priority === priority);
      }

      // Sort by escalation date (newest first)
      history.sort((a, b) => new Date(b.escalatedAt) - new Date(a.escalatedAt));

      // Apply limit
      history = history.slice(0, limit);

      return {
        success: true,
        data: history
      };

    } catch (error) {
      console.error('Error getting escalation history:', error);
      return {
        success: false,
        error: 'فشل في جلب تاريخ التصعيد'
      };
    }
  }

  /**
   * Get escalation statistics
   */
  async getEscalationStats(filters = {}) {
    try {
      const { companyId, period = 'week' } = filters;

      let history = Array.from(this.escalationHistory.values());
      
      if (companyId) {
        history = history.filter(esc => esc.companyId === companyId);
      }

      const stats = {
        total: history.length,
        byStatus: this.countByField(history, 'status'),
        byPriority: this.countByField(history, 'priority'),
        byRule: this.countByField(history, 'ruleId'),
        averageResolutionTime: this.calculateAverageResolutionTime(history),
        escalationRate: this.calculateEscalationRate(history, period),
        trends: this.calculateEscalationTrends(history, period),
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Error getting escalation stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات التصعيد'
      };
    }
  }

  /**
   * Helper methods
   */
  evaluateRule(rule, conversationData) {
    const { conditions } = rule;
    const { messages, lastResponseTime, customerType, sentiment } = conversationData;

    // Check keywords
    if (conditions.keywords && conditions.keywords.length > 0) {
      const hasKeyword = messages.some(message => 
        conditions.keywords.some(keyword => 
          message.content.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      if (!hasKeyword) return false;
    }

    // Check sentiment
    if (conditions.sentiment && sentiment !== conditions.sentiment) {
      return false;
    }

    // Check response time
    if (conditions.responseTime && lastResponseTime < conditions.responseTime) {
      return false;
    }

    // Check customer type
    if (conditions.customerType && customerType !== conditions.customerType) {
      return false;
    }

    // Check message count
    if (conditions.messageCount && messages.length < conditions.messageCount) {
      return false;
    }

    return true;
  }

  async findAvailableSupervisor(actions, companyId) {
    const supervisors = Array.from(this.supervisors.values())
      .filter(supervisor => 
        supervisor.companyId === companyId &&
        supervisor.isAvailable &&
        supervisor.currentEscalations < supervisor.maxConcurrentEscalations
      );

    // If specific supervisor is requested
    if (actions.assignSpecificSupervisor) {
      const specificSupervisor = supervisors.find(s => s.id === actions.assignSpecificSupervisor);
      if (specificSupervisor) return specificSupervisor;
    }

    // Filter by role
    const roleFiltered = supervisors.filter(s => s.role === actions.escalateTo);
    if (roleFiltered.length > 0) {
      // Return supervisor with least current escalations
      return roleFiltered.sort((a, b) => a.currentEscalations - b.currentEscalations)[0];
    }

    // Return any available supervisor
    return supervisors.sort((a, b) => a.currentEscalations - b.currentEscalations)[0];
  }

  async sendEscalationNotification(escalation, supervisor, rule) {
    // Mock notification sending
    console.log(`Escalation notification sent to ${supervisor.name} for escalation ${escalation.id}`);
    
    const notification = {
      type: 'escalation',
      title: `تصعيد جديد: ${rule.name}`,
      message: `تم تصعيد محادثة جديدة إليك بأولوية ${escalation.priority}`,
      recipientId: supervisor.id,
      escalationId: escalation.id,
      priority: escalation.priority,
      timestamp: new Date(),
    };

    return notification;
  }

  async addConversationTags(conversationId, tags) {
    // Mock adding tags to conversation
    console.log(`Adding tags ${tags.join(', ')} to conversation ${conversationId}`);
  }

  getPriorityWeight(priority) {
    const weights = { low: 1, medium: 2, high: 3, urgent: 4 };
    return weights[priority] || 1;
  }

  countByField(items, field) {
    const counts = {};
    items.forEach(item => {
      counts[item[field]] = (counts[item[field]] || 0) + 1;
    });
    return counts;
  }

  calculateAverageResolutionTime(history) {
    const resolved = history.filter(esc => esc.resolutionTime);
    if (resolved.length === 0) return 0;
    
    const total = resolved.reduce((sum, esc) => sum + esc.resolutionTime, 0);
    return total / resolved.length;
  }

  calculateEscalationRate(history, period) {
    // Mock calculation - would need total conversations for actual rate
    return 0.15; // 15% escalation rate
  }

  calculateEscalationTrends(history, period) {
    // Mock trend data
    return [
      { period: 'أسبوع 1', escalations: 12, resolved: 10 },
      { period: 'أسبوع 2', escalations: 15, resolved: 13 },
      { period: 'أسبوع 3', escalations: 18, resolved: 16 },
      { period: 'أسبوع 4', escalations: 14, resolved: 12 },
    ];
  }

  startEscalationProcessor() {
    // Check for pending escalations every minute
    setInterval(() => {
      this.processScheduledEscalations();
    }, 60 * 1000);
  }

  processScheduledEscalations() {
    // Process any scheduled escalations based on timing rules
    const now = new Date();
    
    // This would check for conversations that need escalation based on timing rules
    console.log('Processing scheduled escalations...');
  }

  generateRuleId() {
    return `RULE${Date.now().toString(36).toUpperCase()}`;
  }

  generateEscalationId() {
    return `ESC${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new EscalationRulesService();
