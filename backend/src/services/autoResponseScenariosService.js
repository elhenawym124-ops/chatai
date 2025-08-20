/**
 * Auto Response Scenarios Service
 * 
 * Handles advanced automated response scenarios,
 * conversation flows, and intelligent response routing
 */

class AutoResponseScenariosService {
  constructor() {
    this.scenarios = new Map(); // Response scenarios
    this.conversationFlows = new Map(); // Conversation flows
    this.responseRules = new Map(); // Response rules
    this.scenarioHistory = new Map(); // Scenario execution history
    this.flowTemplates = new Map(); // Flow templates
    this.contextStore = new Map(); // Conversation context
    this.initializeMockData();
  }

  /**
   * Initialize mock data for auto response scenarios
   */
  initializeMockData() {
    // Mock response scenarios
    const mockScenarios = [
      {
        id: 'SCENARIO001',
        name: 'سيناريو الاستعلام عن الطلبات',
        description: 'سيناريو تلقائي للرد على استعلامات حالة الطلبات',
        isActive: true,
        priority: 'high',
        companyId: '1',
        triggers: {
          keywords: ['طلب', 'طلبي', 'حالة الطلب', 'أين طلبي', 'تتبع'],
          intent: 'order_inquiry',
          sentiment: null,
          customerType: null,
        },
        conditions: {
          workingHours: true,
          customerHasOrders: true,
          maxDailyUse: 10,
        },
        flow: {
          steps: [
            {
              id: 'step1',
              type: 'message',
              content: 'مرحباً! سأساعدك في تتبع طلبك 📦',
              delay: 0,
            },
            {
              id: 'step2',
              type: 'action',
              action: 'fetch_customer_orders',
              params: {},
            },
            {
              id: 'step3',
              type: 'condition',
              condition: 'has_recent_orders',
              trueStep: 'step4',
              falseStep: 'step6',
            },
            {
              id: 'step4',
              type: 'message',
              content: 'إليك آخر طلباتك:\n{{recent_orders}}',
              delay: 1000,
            },
            {
              id: 'step5',
              type: 'message',
              content: 'هل تريد تفاصيل أكثر عن أي طلب؟',
              delay: 500,
              options: ['نعم', 'لا', 'تحدث مع موظف'],
            },
            {
              id: 'step6',
              type: 'message',
              content: 'لا يوجد لديك طلبات حديثة. هل تريد تصفح منتجاتنا؟',
              delay: 1000,
              options: ['نعم', 'لا'],
            },
          ],
        },
        fallback: {
          escalateToHuman: true,
          message: 'سأقوم بتحويلك إلى أحد موظفينا للمساعدة',
        },
        analytics: {
          usageCount: 245,
          successRate: 0.87,
          averageSteps: 3.2,
          customerSatisfaction: 4.1,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'SCENARIO002',
        name: 'سيناريو دعم المنتجات',
        description: 'سيناريو للمساعدة في اختيار المنتجات وتقديم المعلومات',
        isActive: true,
        priority: 'medium',
        companyId: '1',
        triggers: {
          keywords: ['منتج', 'مواصفات', 'سعر', 'متوفر', 'اختيار'],
          intent: 'product_inquiry',
          sentiment: null,
          customerType: null,
        },
        conditions: {
          workingHours: false,
          customerHasOrders: false,
          maxDailyUse: 20,
        },
        flow: {
          steps: [
            {
              id: 'step1',
              type: 'message',
              content: 'مرحباً! سأساعدك في العثور على المنتج المناسب 🛍️',
              delay: 0,
            },
            {
              id: 'step2',
              type: 'question',
              content: 'ما نوع المنتج الذي تبحث عنه؟',
              options: ['إلكترونيات', 'أزياء', 'منزل وحديقة', 'كتب', 'أخرى'],
              variable: 'product_category',
            },
            {
              id: 'step3',
              type: 'action',
              action: 'search_products',
              params: {
                category: '{{product_category}}',
                limit: 5,
              },
            },
            {
              id: 'step4',
              type: 'message',
              content: 'إليك أفضل المنتجات في فئة {{product_category}}:\n{{product_results}}',
              delay: 1500,
            },
            {
              id: 'step5',
              type: 'question',
              content: 'هل تريد معلومات أكثر عن أي منتج؟',
              options: ['نعم', 'لا', 'أريد فئة أخرى'],
              variable: 'next_action',
            },
          ],
        },
        fallback: {
          escalateToHuman: false,
          message: 'يمكنك تصفح موقعنا أو التحدث مع أحد موظفينا',
        },
        analytics: {
          usageCount: 189,
          successRate: 0.73,
          averageSteps: 4.1,
          customerSatisfaction: 3.9,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'SCENARIO003',
        name: 'سيناريو الشكاوى والمشاكل',
        description: 'سيناريو للتعامل مع الشكاوى وحل المشاكل',
        isActive: true,
        priority: 'high',
        companyId: '1',
        triggers: {
          keywords: ['شكوى', 'مشكلة', 'غير راضي', 'سيء', 'خطأ'],
          intent: 'complaint',
          sentiment: 'negative',
          customerType: null,
        },
        conditions: {
          workingHours: true,
          customerHasOrders: true,
          maxDailyUse: 5,
        },
        flow: {
          steps: [
            {
              id: 'step1',
              type: 'message',
              content: 'أعتذر عن أي إزعاج. سأساعدك في حل المشكلة فوراً 🙏',
              delay: 0,
            },
            {
              id: 'step2',
              type: 'question',
              content: 'ما نوع المشكلة التي تواجهها؟',
              options: ['مشكلة في المنتج', 'مشكلة في التوصيل', 'مشكلة في الدفع', 'أخرى'],
              variable: 'problem_type',
            },
            {
              id: 'step3',
              type: 'message',
              content: 'شكراً لك. سأقوم بتسجيل شكواك وتحويلك إلى المختص',
              delay: 1000,
            },
            {
              id: 'step4',
              type: 'action',
              action: 'create_complaint_ticket',
              params: {
                type: '{{problem_type}}',
                priority: 'high',
              },
            },
            {
              id: 'step5',
              type: 'escalate',
              department: 'customer_service',
              priority: 'urgent',
              message: 'تم تحويلك إلى فريق خدمة العملاء للمساعدة الفورية',
            },
          ],
        },
        fallback: {
          escalateToHuman: true,
          message: 'سأقوم بتحويلك فوراً إلى مدير خدمة العملاء',
        },
        analytics: {
          usageCount: 67,
          successRate: 0.95,
          averageSteps: 2.8,
          customerSatisfaction: 4.3,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockScenarios.forEach(scenario => {
      this.scenarios.set(scenario.id, scenario);
    });

    // Mock conversation flows
    const mockConversationFlows = [
      {
        id: 'FLOW001',
        conversationId: 'CONV001',
        scenarioId: 'SCENARIO001',
        currentStep: 'step3',
        context: {
          customer_id: '1',
          recent_orders: [
            { id: 'ORD001', status: 'shipped', total: 250 },
            { id: 'ORD002', status: 'delivered', total: 180 },
          ],
          product_category: null,
        },
        history: [
          { step: 'step1', timestamp: new Date(Date.now() - 5000), completed: true },
          { step: 'step2', timestamp: new Date(Date.now() - 3000), completed: true },
        ],
        status: 'active',
        startedAt: new Date(Date.now() - 10000),
        lastActivity: new Date(Date.now() - 1000),
        companyId: '1',
      },
    ];

    mockConversationFlows.forEach(flow => {
      this.conversationFlows.set(flow.id, flow);
    });

    // Mock flow templates
    const mockFlowTemplates = [
      {
        id: 'TEMPLATE001',
        name: 'قالب الاستعلام الأساسي',
        description: 'قالب أساسي للاستعلامات العامة',
        category: 'inquiry',
        steps: [
          {
            id: 'step1',
            type: 'message',
            content: 'مرحباً! كيف يمكنني مساعدتك؟',
            delay: 0,
          },
          {
            id: 'step2',
            type: 'question',
            content: 'ما نوع المساعدة التي تحتاجها؟',
            options: ['معلومات عن المنتجات', 'حالة الطلب', 'دعم تقني', 'أخرى'],
            variable: 'help_type',
          },
          {
            id: 'step3',
            type: 'route',
            routes: {
              'معلومات عن المنتجات': 'SCENARIO002',
              'حالة الطلب': 'SCENARIO001',
              'دعم تقني': 'escalate_technical',
              'أخرى': 'escalate_general',
            },
          },
        ],
        companyId: '1',
      },
    ];

    mockFlowTemplates.forEach(template => {
      this.flowTemplates.set(template.id, template);
    });
  }

  /**
   * Create response scenario
   */
  async createScenario(scenarioData) {
    try {
      const {
        name,
        description,
        triggers,
        conditions,
        flow,
        fallback,
        companyId,
      } = scenarioData;

      const scenario = {
        id: this.generateScenarioId(),
        name,
        description,
        isActive: true,
        priority: 'medium',
        companyId,
        triggers,
        conditions,
        flow,
        fallback,
        analytics: {
          usageCount: 0,
          successRate: 0,
          averageSteps: 0,
          customerSatisfaction: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.scenarios.set(scenario.id, scenario);

      return {
        success: true,
        data: scenario,
        message: 'تم إنشاء السيناريو بنجاح'
      };

    } catch (error) {
      console.error('Error creating scenario:', error);
      return {
        success: false,
        error: 'فشل في إنشاء السيناريو'
      };
    }
  }

  /**
   * Process incoming message for auto response
   */
  async processMessage(messageData) {
    try {
      const {
        conversationId,
        customerId,
        message,
        intent,
        sentiment,
        companyId,
      } = messageData;

      // Check if there's an active flow for this conversation
      let activeFlow = Array.from(this.conversationFlows.values())
        .find(flow => flow.conversationId === conversationId && flow.status === 'active');

      if (activeFlow) {
        // Continue existing flow
        return await this.continueFlow(activeFlow, messageData);
      } else {
        // Find matching scenario
        const matchingScenario = await this.findMatchingScenario(messageData);
        
        if (matchingScenario) {
          // Start new flow
          return await this.startNewFlow(matchingScenario, messageData);
        } else {
          return {
            success: false,
            shouldRespond: false,
            message: 'لا يوجد سيناريو مطابق'
          };
        }
      }

    } catch (error) {
      console.error('Error processing message:', error);
      return {
        success: false,
        error: 'فشل في معالجة الرسالة'
      };
    }
  }

  /**
   * Find matching scenario
   */
  async findMatchingScenario(messageData) {
    const { message, intent, sentiment, customerId, companyId } = messageData;
    
    const scenarios = Array.from(this.scenarios.values())
      .filter(scenario => scenario.isActive && scenario.companyId === companyId)
      .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

    for (const scenario of scenarios) {
      const matches = await this.checkScenarioMatch(scenario, messageData);
      if (matches) {
        return scenario;
      }
    }

    return null;
  }

  /**
   * Check if scenario matches message
   */
  async checkScenarioMatch(scenario, messageData) {
    const { message, intent, sentiment, customerId } = messageData;
    const { triggers, conditions } = scenario;

    // Check keyword triggers
    if (triggers.keywords && triggers.keywords.length > 0) {
      const hasKeyword = triggers.keywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }

    // Check intent
    if (triggers.intent && intent !== triggers.intent) {
      return false;
    }

    // Check sentiment
    if (triggers.sentiment && sentiment !== triggers.sentiment) {
      return false;
    }

    // Check conditions
    if (conditions.workingHours && !this.isWorkingHours()) {
      return false;
    }

    if (conditions.customerHasOrders) {
      const hasOrders = await this.customerHasOrders(customerId);
      if (!hasOrders) return false;
    }

    // Check daily usage limit
    if (conditions.maxDailyUse) {
      const todayUsage = await this.getTodayUsage(scenario.id, customerId);
      if (todayUsage >= conditions.maxDailyUse) return false;
    }

    return true;
  }

  /**
   * Start new conversation flow
   */
  async startNewFlow(scenario, messageData) {
    try {
      const { conversationId, customerId, companyId } = messageData;

      const flow = {
        id: this.generateFlowId(),
        conversationId,
        scenarioId: scenario.id,
        currentStep: scenario.flow.steps[0].id,
        context: {
          customer_id: customerId,
        },
        history: [],
        status: 'active',
        startedAt: new Date(),
        lastActivity: new Date(),
        companyId,
      };

      this.conversationFlows.set(flow.id, flow);

      // Execute first step
      const response = await this.executeStep(scenario.flow.steps[0], flow, scenario);

      return {
        success: true,
        shouldRespond: true,
        response,
        flow,
      };

    } catch (error) {
      console.error('Error starting new flow:', error);
      throw error;
    }
  }

  /**
   * Continue existing flow
   */
  async continueFlow(flow, messageData) {
    try {
      const scenario = this.scenarios.get(flow.scenarioId);
      if (!scenario) {
        throw new Error('السيناريو غير موجود');
      }

      const currentStep = scenario.flow.steps.find(step => step.id === flow.currentStep);
      if (!currentStep) {
        throw new Error('الخطوة الحالية غير موجودة');
      }

      // Process user input if step expects it
      if (currentStep.type === 'question' && currentStep.variable) {
        flow.context[currentStep.variable] = messageData.message;
      }

      // Mark current step as completed
      flow.history.push({
        step: flow.currentStep,
        timestamp: new Date(),
        completed: true,
        userInput: messageData.message,
      });

      // Find next step
      const nextStep = this.findNextStep(currentStep, scenario.flow.steps, flow.context);
      
      if (nextStep) {
        flow.currentStep = nextStep.id;
        flow.lastActivity = new Date();
        this.conversationFlows.set(flow.id, flow);

        const response = await this.executeStep(nextStep, flow, scenario);

        return {
          success: true,
          shouldRespond: true,
          response,
          flow,
        };
      } else {
        // Flow completed
        flow.status = 'completed';
        flow.completedAt = new Date();
        this.conversationFlows.set(flow.id, flow);

        return {
          success: true,
          shouldRespond: false,
          message: 'تم إكمال السيناريو',
          flow,
        };
      }

    } catch (error) {
      console.error('Error continuing flow:', error);
      throw error;
    }
  }

  /**
   * Execute flow step
   */
  async executeStep(step, flow, scenario) {
    try {
      switch (step.type) {
        case 'message':
          return await this.executeMessageStep(step, flow);
        
        case 'question':
          return await this.executeQuestionStep(step, flow);
        
        case 'action':
          return await this.executeActionStep(step, flow);
        
        case 'condition':
          return await this.executeConditionStep(step, flow, scenario);
        
        case 'escalate':
          return await this.executeEscalateStep(step, flow);
        
        case 'route':
          return await this.executeRouteStep(step, flow);
        
        default:
          throw new Error(`نوع خطوة غير مدعوم: ${step.type}`);
      }

    } catch (error) {
      console.error('Error executing step:', error);
      throw error;
    }
  }

  /**
   * Execute message step
   */
  async executeMessageStep(step, flow) {
    let content = step.content;
    
    // Replace variables with context values
    Object.keys(flow.context).forEach(key => {
      content = content.replace(`{{${key}}}`, flow.context[key] || '');
    });

    return {
      type: 'message',
      content,
      delay: step.delay || 0,
      options: step.options || null,
    };
  }

  /**
   * Execute question step
   */
  async executeQuestionStep(step, flow) {
    let content = step.content;
    
    // Replace variables
    Object.keys(flow.context).forEach(key => {
      content = content.replace(`{{${key}}}`, flow.context[key] || '');
    });

    return {
      type: 'question',
      content,
      options: step.options,
      expectsInput: true,
    };
  }

  /**
   * Execute action step
   */
  async executeActionStep(step, flow) {
    const { action, params } = step;
    
    switch (action) {
      case 'fetch_customer_orders':
        const orders = await this.fetchCustomerOrders(flow.context.customer_id);
        flow.context.recent_orders = orders;
        break;
      
      case 'search_products':
        const products = await this.searchProducts(params, flow.context);
        flow.context.product_results = products;
        break;
      
      case 'create_complaint_ticket':
        const ticket = await this.createComplaintTicket(params, flow.context);
        flow.context.ticket_id = ticket.id;
        break;
    }

    this.conversationFlows.set(flow.id, flow);

    return {
      type: 'action_completed',
      action,
      silent: true, // Don't send message to user
    };
  }

  /**
   * Helper methods
   */
  findNextStep(currentStep, allSteps, context) {
    const currentIndex = allSteps.findIndex(step => step.id === currentStep.id);
    
    if (currentStep.type === 'condition') {
      const conditionResult = this.evaluateCondition(currentStep.condition, context);
      const nextStepId = conditionResult ? currentStep.trueStep : currentStep.falseStep;
      return allSteps.find(step => step.id === nextStepId);
    }

    // Return next step in sequence
    if (currentIndex < allSteps.length - 1) {
      return allSteps[currentIndex + 1];
    }

    return null;
  }

  evaluateCondition(condition, context) {
    switch (condition) {
      case 'has_recent_orders':
        return context.recent_orders && context.recent_orders.length > 0;
      default:
        return false;
    }
  }

  async fetchCustomerOrders(customerId) {
    // Mock order fetching
    return [
      { id: 'ORD001', status: 'shipped', total: 250, date: '2024-01-15' },
      { id: 'ORD002', status: 'delivered', total: 180, date: '2024-01-10' },
    ];
  }

  async searchProducts(params, context) {
    // Mock product search
    return `• لابتوب HP - 2500 ريال\n• ماوس لاسلكي - 150 ريال\n• كيبورد ميكانيكي - 300 ريال`;
  }

  async createComplaintTicket(params, context) {
    // Mock ticket creation
    return { id: 'TICKET001', status: 'open' };
  }

  async customerHasOrders(customerId) {
    // Mock check
    return true;
  }

  isWorkingHours() {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 9 && hour <= 18;
  }

  async getTodayUsage(scenarioId, customerId) {
    // Mock usage check
    return 2;
  }

  getPriorityWeight(priority) {
    const weights = { low: 1, medium: 2, high: 3, urgent: 4 };
    return weights[priority] || 1;
  }

  generateScenarioId() {
    return `SCENARIO${Date.now().toString(36).toUpperCase()}`;
  }

  generateFlowId() {
    return `FLOW${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new AutoResponseScenariosService();
