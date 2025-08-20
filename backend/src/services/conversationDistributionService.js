/**
 * Conversation Distribution Service
 * 
 * Handles automatic distribution of conversations to team members,
 * load balancing, skill-based routing, and workload management
 */

class ConversationDistributionService {
  constructor() {
    this.agents = new Map(); // Available agents
    this.distributionRules = new Map(); // Distribution rules
    this.workloadTracker = new Map(); // Agent workload tracking
    this.skillMatrix = new Map(); // Agent skills matrix
    this.distributionQueue = new Map(); // Pending distributions
    this.distributionHistory = new Map(); // Distribution history
    this.initializeMockData();
    this.startDistributionProcessor();
  }

  /**
   * Initialize mock data for conversation distribution
   */
  initializeMockData() {
    // Mock agents
    const mockAgents = [
      {
        id: 'agent1',
        name: 'أحمد محمد',
        email: 'ahmed@company.com',
        status: 'available',
        skills: ['دعم_تقني', 'مبيعات', 'عام'],
        languages: ['ar', 'en'],
        maxConcurrentChats: 8,
        currentChats: 3,
        workingHours: {
          start: '09:00',
          end: '17:00',
          timezone: 'Asia/Riyadh',
          workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
        },
        performance: {
          averageResponseTime: 2.5, // minutes
          customerSatisfaction: 4.3,
          resolutionRate: 0.89,
          totalConversations: 1250,
        },
        preferences: {
          customerTypes: ['regular', 'new'],
          conversationTypes: ['support', 'sales'],
        },
        companyId: '1',
        isActive: true,
        lastActivity: new Date(),
      },
      {
        id: 'agent2',
        name: 'فاطمة أحمد',
        email: 'fatima@company.com',
        status: 'available',
        skills: ['مبيعات', 'vip_support', 'عام'],
        languages: ['ar'],
        maxConcurrentChats: 6,
        currentChats: 2,
        workingHours: {
          start: '10:00',
          end: '18:00',
          timezone: 'Asia/Riyadh',
          workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
        },
        performance: {
          averageResponseTime: 1.8,
          customerSatisfaction: 4.6,
          resolutionRate: 0.94,
          totalConversations: 890,
        },
        preferences: {
          customerTypes: ['vip', 'regular'],
          conversationTypes: ['sales', 'complaints'],
        },
        companyId: '1',
        isActive: true,
        lastActivity: new Date(),
      },
      {
        id: 'agent3',
        name: 'محمد علي',
        email: 'mohammed@company.com',
        status: 'busy',
        skills: ['دعم_تقني', 'مشاكل_معقدة', 'عام'],
        languages: ['ar', 'en'],
        maxConcurrentChats: 5,
        currentChats: 5,
        workingHours: {
          start: '08:00',
          end: '16:00',
          timezone: 'Asia/Riyadh',
          workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
        },
        performance: {
          averageResponseTime: 3.2,
          customerSatisfaction: 4.1,
          resolutionRate: 0.92,
          totalConversations: 675,
        },
        preferences: {
          customerTypes: ['regular'],
          conversationTypes: ['support', 'technical'],
        },
        companyId: '1',
        isActive: true,
        lastActivity: new Date(),
      },
    ];

    mockAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
      this.workloadTracker.set(agent.id, {
        currentLoad: agent.currentChats,
        maxLoad: agent.maxConcurrentChats,
        utilizationRate: agent.currentChats / agent.maxConcurrentChats,
        lastAssignment: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
      });
    });

    // Mock distribution rules
    const mockDistributionRules = [
      {
        id: 'RULE001',
        name: 'توزيع عملاء VIP',
        description: 'توزيع عملاء VIP على أفضل الموظفين',
        priority: 'high',
        isActive: true,
        companyId: '1',
        conditions: {
          customerType: 'vip',
          conversationType: null,
          urgency: null,
          language: null,
        },
        routing: {
          method: 'skill_based',
          requiredSkills: ['vip_support'],
          preferredAgents: ['agent2'],
          fallbackMethod: 'round_robin',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'RULE002',
        name: 'توزيع الدعم التقني',
        description: 'توزيع استفسارات الدعم التقني على المختصين',
        priority: 'medium',
        isActive: true,
        companyId: '1',
        conditions: {
          customerType: null,
          conversationType: 'technical_support',
          urgency: null,
          language: null,
        },
        routing: {
          method: 'skill_based',
          requiredSkills: ['دعم_تقني'],
          preferredAgents: [],
          fallbackMethod: 'least_busy',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'RULE003',
        name: 'التوزيع العام',
        description: 'قاعدة التوزيع الافتراضية لجميع المحادثات',
        priority: 'low',
        isActive: true,
        companyId: '1',
        conditions: {
          customerType: null,
          conversationType: null,
          urgency: null,
          language: null,
        },
        routing: {
          method: 'round_robin',
          requiredSkills: [],
          preferredAgents: [],
          fallbackMethod: 'random',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockDistributionRules.forEach(rule => {
      this.distributionRules.set(rule.id, rule);
    });

    // Mock distribution history
    const mockDistributionHistory = [
      {
        id: 'DIST001',
        conversationId: 'CONV001',
        customerId: '1',
        assignedTo: 'agent1',
        assignedBy: 'system',
        assignmentMethod: 'skill_based',
        ruleId: 'RULE002',
        assignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'active',
        responseTime: 1.5, // minutes
        companyId: '1',
      },
      {
        id: 'DIST002',
        conversationId: 'CONV002',
        customerId: '2',
        assignedTo: 'agent2',
        assignedBy: 'system',
        assignmentMethod: 'vip_routing',
        ruleId: 'RULE001',
        assignedAt: new Date(Date.now() - 45 * 60 * 1000),
        status: 'active',
        responseTime: 0.8,
        companyId: '1',
      },
    ];

    mockDistributionHistory.forEach(distribution => {
      this.distributionHistory.set(distribution.id, distribution);
    });
  }

  /**
   * Distribute conversation to agent
   */
  async distributeConversation(conversationData) {
    try {
      const {
        conversationId,
        customerId,
        customerType,
        conversationType,
        urgency,
        language,
        companyId,
      } = conversationData;

      // Find matching distribution rule
      const rule = this.findMatchingRule({
        customerType,
        conversationType,
        urgency,
        language,
        companyId,
      });

      // Find best agent based on rule
      const agent = await this.findBestAgent(rule, conversationData);

      if (!agent) {
        return {
          success: false,
          error: 'لا يوجد موظف متاح للتوزيع'
        };
      }

      // Assign conversation to agent
      const assignment = await this.assignConversation(conversationId, agent, rule);

      // Update agent workload
      this.updateAgentWorkload(agent.id, 1);

      return {
        success: true,
        data: assignment,
        message: `تم توزيع المحادثة على ${agent.name}`
      };

    } catch (error) {
      console.error('Error distributing conversation:', error);
      return {
        success: false,
        error: 'فشل في توزيع المحادثة'
      };
    }
  }

  /**
   * Find matching distribution rule
   */
  findMatchingRule(criteria) {
    const { customerType, conversationType, urgency, language, companyId } = criteria;

    const rules = Array.from(this.distributionRules.values())
      .filter(rule => rule.isActive && rule.companyId === companyId)
      .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

    for (const rule of rules) {
      const conditions = rule.conditions;
      
      // Check if rule matches criteria
      if (conditions.customerType && conditions.customerType !== customerType) continue;
      if (conditions.conversationType && conditions.conversationType !== conversationType) continue;
      if (conditions.urgency && conditions.urgency !== urgency) continue;
      if (conditions.language && conditions.language !== language) continue;

      return rule;
    }

    // Return default rule if no specific rule matches
    return rules.find(rule => 
      !rule.conditions.customerType && 
      !rule.conditions.conversationType &&
      !rule.conditions.urgency &&
      !rule.conditions.language
    );
  }

  /**
   * Find best agent based on rule
   */
  async findBestAgent(rule, conversationData) {
    const { companyId } = conversationData;
    
    // Get available agents
    let availableAgents = Array.from(this.agents.values())
      .filter(agent => 
        agent.companyId === companyId &&
        agent.isActive &&
        agent.status === 'available' &&
        agent.currentChats < agent.maxConcurrentChats &&
        this.isAgentInWorkingHours(agent)
      );

    if (availableAgents.length === 0) {
      return null;
    }

    const routing = rule.routing;

    switch (routing.method) {
      case 'skill_based':
        return this.findSkillBasedAgent(availableAgents, routing.requiredSkills, routing.fallbackMethod);
      
      case 'round_robin':
        return this.findRoundRobinAgent(availableAgents);
      
      case 'least_busy':
        return this.findLeastBusyAgent(availableAgents);
      
      case 'performance_based':
        return this.findPerformanceBasedAgent(availableAgents);
      
      case 'random':
        return this.findRandomAgent(availableAgents);
      
      default:
        return this.findLeastBusyAgent(availableAgents);
    }
  }

  /**
   * Find agent based on skills
   */
  findSkillBasedAgent(agents, requiredSkills, fallbackMethod) {
    if (!requiredSkills || requiredSkills.length === 0) {
      return this.findAgentByMethod(agents, fallbackMethod);
    }

    // Filter agents with required skills
    const skilledAgents = agents.filter(agent => 
      requiredSkills.every(skill => agent.skills.includes(skill))
    );

    if (skilledAgents.length > 0) {
      return this.findLeastBusyAgent(skilledAgents);
    }

    // Fallback to other method if no skilled agents available
    return this.findAgentByMethod(agents, fallbackMethod);
  }

  /**
   * Find agent using round robin
   */
  findRoundRobinAgent(agents) {
    // Sort by last assignment time
    return agents.sort((a, b) => {
      const workloadA = this.workloadTracker.get(a.id);
      const workloadB = this.workloadTracker.get(b.id);
      return workloadA.lastAssignment - workloadB.lastAssignment;
    })[0];
  }

  /**
   * Find least busy agent
   */
  findLeastBusyAgent(agents) {
    return agents.sort((a, b) => {
      const workloadA = this.workloadTracker.get(a.id);
      const workloadB = this.workloadTracker.get(b.id);
      return workloadA.utilizationRate - workloadB.utilizationRate;
    })[0];
  }

  /**
   * Find agent based on performance
   */
  findPerformanceBasedAgent(agents) {
    return agents.sort((a, b) => {
      const scoreA = this.calculatePerformanceScore(a);
      const scoreB = this.calculatePerformanceScore(b);
      return scoreB - scoreA;
    })[0];
  }

  /**
   * Find random agent
   */
  findRandomAgent(agents) {
    return agents[Math.floor(Math.random() * agents.length)];
  }

  /**
   * Assign conversation to agent
   */
  async assignConversation(conversationId, agent, rule) {
    const assignment = {
      id: this.generateDistributionId(),
      conversationId,
      assignedTo: agent.id,
      assignedBy: 'system',
      assignmentMethod: rule.routing.method,
      ruleId: rule.id,
      assignedAt: new Date(),
      status: 'active',
      responseTime: null,
      companyId: agent.companyId,
    };

    this.distributionHistory.set(assignment.id, assignment);

    // Send notification to agent
    await this.notifyAgent(agent, assignment);

    return assignment;
  }

  /**
   * Update agent workload
   */
  updateAgentWorkload(agentId, change) {
    const agent = this.agents.get(agentId);
    const workload = this.workloadTracker.get(agentId);

    if (agent && workload) {
      agent.currentChats += change;
      workload.currentLoad = agent.currentChats;
      workload.utilizationRate = agent.currentChats / agent.maxConcurrentChats;
      workload.lastAssignment = new Date();

      this.agents.set(agentId, agent);
      this.workloadTracker.set(agentId, workload);
    }
  }

  /**
   * Get distribution statistics
   */
  async getDistributionStats(filters = {}) {
    try {
      const { companyId, period = 'week' } = filters;

      let history = Array.from(this.distributionHistory.values());
      
      if (companyId) {
        history = history.filter(h => h.companyId === companyId);
      }

      const stats = {
        total: history.length,
        byAgent: this.countByField(history, 'assignedTo'),
        byMethod: this.countByField(history, 'assignmentMethod'),
        byRule: this.countByField(history, 'ruleId'),
        averageResponseTime: this.calculateAverageResponseTime(history),
        agentUtilization: this.calculateAgentUtilization(),
        distributionEfficiency: this.calculateDistributionEfficiency(history),
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Error getting distribution stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات التوزيع'
      };
    }
  }

  /**
   * Get agent workload
   */
  async getAgentWorkload(filters = {}) {
    try {
      const { companyId, agentId } = filters;

      let agents = Array.from(this.agents.values());
      
      if (companyId) {
        agents = agents.filter(agent => agent.companyId === companyId);
      }
      if (agentId) {
        agents = agents.filter(agent => agent.id === agentId);
      }

      const workloadData = agents.map(agent => {
        const workload = this.workloadTracker.get(agent.id);
        return {
          agentId: agent.id,
          agentName: agent.name,
          currentChats: agent.currentChats,
          maxChats: agent.maxConcurrentChats,
          utilizationRate: workload.utilizationRate,
          status: agent.status,
          performance: agent.performance,
          lastActivity: agent.lastActivity,
        };
      });

      return {
        success: true,
        data: workloadData
      };

    } catch (error) {
      console.error('Error getting agent workload:', error);
      return {
        success: false,
        error: 'فشل في جلب أحمال العمل'
      };
    }
  }

  /**
   * Helper methods
   */
  findAgentByMethod(agents, method) {
    switch (method) {
      case 'least_busy':
        return this.findLeastBusyAgent(agents);
      case 'round_robin':
        return this.findRoundRobinAgent(agents);
      case 'performance_based':
        return this.findPerformanceBasedAgent(agents);
      case 'random':
        return this.findRandomAgent(agents);
      default:
        return this.findLeastBusyAgent(agents);
    }
  }

  isAgentInWorkingHours(agent) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().slice(0, 5);

    const workingHours = agent.workingHours;
    
    // Check if current day is a working day
    if (!workingHours.workingDays.includes(currentDay)) {
      return false;
    }

    // Check if current time is within working hours
    return currentTime >= workingHours.start && currentTime <= workingHours.end;
  }

  calculatePerformanceScore(agent) {
    const performance = agent.performance;
    
    // Weighted performance score
    const responseTimeScore = Math.max(0, 10 - performance.averageResponseTime); // Lower is better
    const satisfactionScore = performance.customerSatisfaction * 2; // Scale to 10
    const resolutionScore = performance.resolutionRate * 10; // Scale to 10
    
    return (responseTimeScore + satisfactionScore + resolutionScore) / 3;
  }

  async notifyAgent(agent, assignment) {
    // Mock notification
    console.log(`Notifying agent ${agent.name} about new conversation assignment: ${assignment.conversationId}`);
  }

  countByField(items, field) {
    const counts = {};
    items.forEach(item => {
      counts[item[field]] = (counts[item[field]] || 0) + 1;
    });
    return counts;
  }

  calculateAverageResponseTime(history) {
    const withResponseTime = history.filter(h => h.responseTime);
    if (withResponseTime.length === 0) return 0;
    
    const total = withResponseTime.reduce((sum, h) => sum + h.responseTime, 0);
    return total / withResponseTime.length;
  }

  calculateAgentUtilization() {
    const utilization = {};
    this.workloadTracker.forEach((workload, agentId) => {
      const agent = this.agents.get(agentId);
      utilization[agent.name] = {
        utilizationRate: workload.utilizationRate,
        currentLoad: workload.currentLoad,
        maxLoad: workload.maxLoad,
      };
    });
    return utilization;
  }

  calculateDistributionEfficiency(history) {
    // Mock efficiency calculation
    return {
      averageAssignmentTime: 0.5, // minutes
      successfulAssignments: history.length,
      failedAssignments: 0,
      efficiency: 0.98,
    };
  }

  getPriorityWeight(priority) {
    const weights = { low: 1, medium: 2, high: 3, urgent: 4 };
    return weights[priority] || 1;
  }

  startDistributionProcessor() {
    // Process pending distributions every 30 seconds
    setInterval(() => {
      this.processPendingDistributions();
    }, 30 * 1000);
  }

  processPendingDistributions() {
    // Process any pending conversation distributions
    console.log('Processing pending conversation distributions...');
  }

  generateDistributionId() {
    return `DIST${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new ConversationDistributionService();
