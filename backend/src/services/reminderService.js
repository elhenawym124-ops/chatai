/**
 * Reminder Service
 * 
 * Handles scheduled reminders for customer follow-ups,
 * task management, and automated notifications
 */

class ReminderService {
  constructor() {
    this.reminders = new Map(); // Active reminders
    this.reminderHistory = new Map(); // Reminder history
    this.reminderTemplates = new Map(); // Reminder templates
    this.scheduledJobs = new Map(); // Scheduled jobs
    this.reminderTypes = new Map(); // Reminder types configuration
    this.initializeMockData();
    this.startReminderProcessor();
  }

  /**
   * Initialize mock data and reminder types
   */
  initializeMockData() {
    // Mock reminder types
    const mockReminderTypes = [
      {
        id: 'FOLLOW_UP',
        name: 'متابعة العميل',
        description: 'تذكير بمتابعة العميل',
        defaultTemplate: 'حان وقت متابعة العميل {customerName}',
        category: 'customer',
        priority: 'medium',
        canSnooze: true,
        maxSnooze: 3,
        autoComplete: false,
      },
      {
        id: 'QUOTE_FOLLOW_UP',
        name: 'متابعة عرض السعر',
        description: 'تذكير بمتابعة عرض السعر المرسل',
        defaultTemplate: 'تذكير: متابعة عرض السعر للعميل {customerName} - المبلغ: {amount}',
        category: 'sales',
        priority: 'high',
        canSnooze: true,
        maxSnooze: 2,
        autoComplete: false,
      },
      {
        id: 'PAYMENT_REMINDER',
        name: 'تذكير بالدفع',
        description: 'تذكير العميل بالدفع المستحق',
        defaultTemplate: 'تذكير: دفعة مستحقة للعميل {customerName} - المبلغ: {amount}',
        category: 'finance',
        priority: 'high',
        canSnooze: false,
        maxSnooze: 0,
        autoComplete: false,
      },
      {
        id: 'TASK_REMINDER',
        name: 'تذكير بالمهمة',
        description: 'تذكير بإنجاز مهمة محددة',
        defaultTemplate: 'تذكير: مهمة "{taskTitle}" مستحقة',
        category: 'task',
        priority: 'medium',
        canSnooze: true,
        maxSnooze: 5,
        autoComplete: false,
      },
      {
        id: 'APPOINTMENT_REMINDER',
        name: 'تذكير بالموعد',
        description: 'تذكير بموعد مع العميل',
        defaultTemplate: 'تذكير: موعد مع {customerName} في {appointmentTime}',
        category: 'appointment',
        priority: 'high',
        canSnooze: false,
        maxSnooze: 0,
        autoComplete: true,
      },
    ];

    mockReminderTypes.forEach(type => {
      this.reminderTypes.set(type.id, type);
    });

    // Mock active reminders
    const mockReminders = [
      {
        id: 'REM001',
        title: 'متابعة العميل أحمد محمد',
        description: 'متابعة العميل بخصوص استفسار اللابتوب',
        type: 'FOLLOW_UP',
        priority: 'medium',
        status: 'pending',
        companyId: '1',
        userId: '1',
        customerId: '1',
        relatedEntity: {
          type: 'conversation',
          id: 'CONV001',
        },
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        createdAt: new Date(),
        updatedAt: new Date(),
        snoozeCount: 0,
        maxSnooze: 3,
        canSnooze: true,
        autoComplete: false,
        metadata: {
          customerName: 'أحمد محمد',
          conversationTopic: 'استفسار عن لابتوب',
          lastInteraction: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      {
        id: 'REM002',
        title: 'متابعة عرض السعر - فاطمة علي',
        description: 'متابعة عرض السعر المرسل للعميلة فاطمة علي',
        type: 'QUOTE_FOLLOW_UP',
        priority: 'high',
        status: 'pending',
        companyId: '1',
        userId: '1',
        customerId: '2',
        relatedEntity: {
          type: 'quote',
          id: 'QUOTE001',
        },
        scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        snoozeCount: 1,
        maxSnooze: 2,
        canSnooze: true,
        autoComplete: false,
        metadata: {
          customerName: 'فاطمة علي',
          amount: 2500,
          quoteSentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      {
        id: 'REM003',
        title: 'موعد مع خالد أحمد',
        description: 'موعد استشارة مع العميل خالد أحمد',
        type: 'APPOINTMENT_REMINDER',
        priority: 'high',
        status: 'pending',
        companyId: '1',
        userId: '1',
        customerId: '3',
        relatedEntity: {
          type: 'appointment',
          id: 'APP001',
        },
        scheduledTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
        updatedAt: new Date(),
        snoozeCount: 0,
        maxSnooze: 0,
        canSnooze: false,
        autoComplete: true,
        metadata: {
          customerName: 'خالد أحمد',
          appointmentTime: new Date(Date.now() + 60 * 60 * 1000),
          appointmentType: 'استشارة',
        },
      },
    ];

    mockReminders.forEach(reminder => {
      this.reminders.set(reminder.id, reminder);
    });

    // Mock reminder templates
    const mockTemplates = [
      {
        id: 'TEMP001',
        name: 'متابعة عميل عادية',
        type: 'FOLLOW_UP',
        subject: 'تذكير: متابعة العميل {customerName}',
        body: 'حان وقت متابعة العميل {customerName} بخصوص {topic}. آخر تفاعل كان في {lastInteraction}.',
        variables: ['customerName', 'topic', 'lastInteraction'],
        isDefault: true,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'TEMP002',
        name: 'متابعة عرض سعر',
        type: 'QUOTE_FOLLOW_UP',
        subject: 'تذكير: متابعة عرض السعر - {customerName}',
        body: 'تذكير بمتابعة عرض السعر المرسل للعميل {customerName} بمبلغ {amount} ريال. تم الإرسال في {quoteSentDate}.',
        variables: ['customerName', 'amount', 'quoteSentDate'],
        isDefault: true,
        companyId: '1',
        createdAt: new Date(),
      },
    ];

    mockTemplates.forEach(template => {
      this.reminderTemplates.set(template.id, template);
    });
  }

  /**
   * Create a new reminder
   */
  async createReminder(reminderData) {
    try {
      const {
        title,
        description,
        type,
        priority = 'medium',
        companyId,
        userId,
        customerId,
        relatedEntity,
        scheduledTime,
        metadata = {},
      } = reminderData;

      const reminderType = this.reminderTypes.get(type);
      if (!reminderType) {
        return {
          success: false,
          error: 'نوع التذكير غير صالح'
        };
      }

      const reminder = {
        id: this.generateReminderId(),
        title,
        description,
        type,
        priority,
        status: 'pending',
        companyId,
        userId,
        customerId,
        relatedEntity,
        scheduledTime: new Date(scheduledTime),
        createdAt: new Date(),
        updatedAt: new Date(),
        snoozeCount: 0,
        maxSnooze: reminderType.maxSnooze,
        canSnooze: reminderType.canSnooze,
        autoComplete: reminderType.autoComplete,
        metadata,
      };

      // Store reminder
      this.reminders.set(reminder.id, reminder);

      // Schedule the reminder
      this.scheduleReminder(reminder);

      return {
        success: true,
        data: reminder,
        message: 'تم إنشاء التذكير بنجاح'
      };

    } catch (error) {
      console.error('Error creating reminder:', error);
      return {
        success: false,
        error: 'فشل في إنشاء التذكير'
      };
    }
  }

  /**
   * Get reminders for a user/company
   */
  async getReminders(filters = {}) {
    try {
      const {
        companyId,
        userId,
        customerId,
        status,
        type,
        priority,
        startDate,
        endDate,
        limit = 50,
        offset = 0,
      } = filters;

      let reminders = Array.from(this.reminders.values());

      // Apply filters
      if (companyId) {
        reminders = reminders.filter(r => r.companyId === companyId);
      }
      if (userId) {
        reminders = reminders.filter(r => r.userId === userId);
      }
      if (customerId) {
        reminders = reminders.filter(r => r.customerId === customerId);
      }
      if (status) {
        reminders = reminders.filter(r => r.status === status);
      }
      if (type) {
        reminders = reminders.filter(r => r.type === type);
      }
      if (priority) {
        reminders = reminders.filter(r => r.priority === priority);
      }
      if (startDate) {
        reminders = reminders.filter(r => new Date(r.scheduledTime) >= new Date(startDate));
      }
      if (endDate) {
        reminders = reminders.filter(r => new Date(r.scheduledTime) <= new Date(endDate));
      }

      // Sort by scheduled time
      reminders.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

      // Apply pagination
      const total = reminders.length;
      reminders = reminders.slice(offset, offset + limit);

      return {
        success: true,
        data: {
          reminders,
          total,
          limit,
          offset,
        }
      };

    } catch (error) {
      console.error('Error getting reminders:', error);
      return {
        success: false,
        error: 'فشل في جلب التذكيرات'
      };
    }
  }

  /**
   * Update reminder status
   */
  async updateReminderStatus(reminderId, status, notes = '') {
    try {
      const reminder = this.reminders.get(reminderId);
      if (!reminder) {
        return {
          success: false,
          error: 'التذكير غير موجود'
        };
      }

      const oldStatus = reminder.status;
      reminder.status = status;
      reminder.updatedAt = new Date();

      if (status === 'completed' || status === 'dismissed') {
        // Add to history
        this.reminderHistory.set(reminderId, {
          ...reminder,
          completedAt: new Date(),
          notes,
        });

        // Remove from active reminders
        this.reminders.delete(reminderId);

        // Cancel scheduled job
        this.cancelScheduledJob(reminderId);
      }

      this.reminders.set(reminderId, reminder);

      return {
        success: true,
        data: reminder,
        message: `تم تحديث حالة التذكير من ${oldStatus} إلى ${status}`
      };

    } catch (error) {
      console.error('Error updating reminder status:', error);
      return {
        success: false,
        error: 'فشل في تحديث حالة التذكير'
      };
    }
  }

  /**
   * Snooze a reminder
   */
  async snoozeReminder(reminderId, snoozeMinutes) {
    try {
      const reminder = this.reminders.get(reminderId);
      if (!reminder) {
        return {
          success: false,
          error: 'التذكير غير موجود'
        };
      }

      if (!reminder.canSnooze) {
        return {
          success: false,
          error: 'لا يمكن تأجيل هذا النوع من التذكيرات'
        };
      }

      if (reminder.snoozeCount >= reminder.maxSnooze) {
        return {
          success: false,
          error: `تم الوصول للحد الأقصى من التأجيل (${reminder.maxSnooze})`
        };
      }

      // Update scheduled time
      const newScheduledTime = new Date(Date.now() + snoozeMinutes * 60 * 1000);
      reminder.scheduledTime = newScheduledTime;
      reminder.snoozeCount += 1;
      reminder.updatedAt = new Date();

      // Reschedule the reminder
      this.cancelScheduledJob(reminderId);
      this.scheduleReminder(reminder);

      this.reminders.set(reminderId, reminder);

      return {
        success: true,
        data: reminder,
        message: `تم تأجيل التذكير لمدة ${snoozeMinutes} دقيقة`
      };

    } catch (error) {
      console.error('Error snoozing reminder:', error);
      return {
        success: false,
        error: 'فشل في تأجيل التذكير'
      };
    }
  }

  /**
   * Get reminder statistics
   */
  async getReminderStats(filters = {}) {
    try {
      const { companyId, userId, period = 'week' } = filters;

      let reminders = Array.from(this.reminders.values());
      let history = Array.from(this.reminderHistory.values());

      // Apply filters
      if (companyId) {
        reminders = reminders.filter(r => r.companyId === companyId);
        history = history.filter(r => r.companyId === companyId);
      }
      if (userId) {
        reminders = reminders.filter(r => r.userId === userId);
        history = history.filter(r => r.userId === userId);
      }

      const stats = {
        active: {
          total: reminders.length,
          pending: reminders.filter(r => r.status === 'pending').length,
          overdue: reminders.filter(r => new Date(r.scheduledTime) < new Date()).length,
          byPriority: this.countByField(reminders, 'priority'),
          byType: this.countByField(reminders, 'type'),
        },
        completed: {
          total: history.length,
          thisWeek: history.filter(r => this.isWithinPeriod(r.completedAt, 'week')).length,
          thisMonth: history.filter(r => this.isWithinPeriod(r.completedAt, 'month')).length,
          byType: this.countByField(history, 'type'),
        },
        performance: {
          completionRate: history.length / (reminders.length + history.length),
          averageSnoozeCount: this.calculateAverageSnooze(history),
          onTimeCompletion: history.filter(r => 
            new Date(r.completedAt) <= new Date(r.scheduledTime)
          ).length / history.length,
        },
        trends: this.calculateReminderTrends(history, period),
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Error getting reminder stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات التذكيرات'
      };
    }
  }

  /**
   * Schedule a reminder for processing
   */
  scheduleReminder(reminder) {
    const delay = new Date(reminder.scheduledTime) - new Date();
    
    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        this.processReminder(reminder.id);
      }, delay);

      this.scheduledJobs.set(reminder.id, timeoutId);
    } else {
      // Already overdue, process immediately
      this.processReminder(reminder.id);
    }
  }

  /**
   * Process a reminder when it's due
   */
  async processReminder(reminderId) {
    try {
      const reminder = this.reminders.get(reminderId);
      if (!reminder || reminder.status !== 'pending') {
        return;
      }

      // Update status to triggered
      reminder.status = 'triggered';
      reminder.triggeredAt = new Date();

      // Send notification (integrate with notification service)
      await this.sendReminderNotification(reminder);

      // Auto-complete if configured
      if (reminder.autoComplete) {
        setTimeout(() => {
          this.updateReminderStatus(reminderId, 'completed', 'Auto-completed');
        }, 5 * 60 * 1000); // Auto-complete after 5 minutes
      }

      this.reminders.set(reminderId, reminder);

    } catch (error) {
      console.error('Error processing reminder:', error);
    }
  }

  /**
   * Send reminder notification
   */
  async sendReminderNotification(reminder) {
    // This would integrate with the notification service
    console.log(`Reminder notification: ${reminder.title}`);
    
    // Mock notification sending
    const notification = {
      type: 'reminder',
      title: reminder.title,
      message: reminder.description,
      userId: reminder.userId,
      priority: reminder.priority,
      data: {
        reminderId: reminder.id,
        reminderType: reminder.type,
        customerId: reminder.customerId,
        relatedEntity: reminder.relatedEntity,
      },
    };

    // Send via notification service (would be actual implementation)
    return notification;
  }

  /**
   * Cancel a scheduled job
   */
  cancelScheduledJob(reminderId) {
    const timeoutId = this.scheduledJobs.get(reminderId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledJobs.delete(reminderId);
    }
  }

  /**
   * Start the reminder processor
   */
  startReminderProcessor() {
    // Check for overdue reminders every minute
    setInterval(() => {
      this.processOverdueReminders();
    }, 60 * 1000);
  }

  /**
   * Process overdue reminders
   */
  processOverdueReminders() {
    const now = new Date();
    
    Array.from(this.reminders.values()).forEach(reminder => {
      if (reminder.status === 'pending' && new Date(reminder.scheduledTime) <= now) {
        this.processReminder(reminder.id);
      }
    });
  }

  /**
   * Helper methods
   */
  countByField(items, field) {
    const counts = {};
    items.forEach(item => {
      counts[item[field]] = (counts[item[field]] || 0) + 1;
    });
    return counts;
  }

  isWithinPeriod(date, period) {
    const now = new Date();
    const itemDate = new Date(date);
    
    switch (period) {
      case 'week':
        return (now - itemDate) <= 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return (now - itemDate) <= 30 * 24 * 60 * 60 * 1000;
      default:
        return false;
    }
  }

  calculateAverageSnooze(reminders) {
    if (reminders.length === 0) return 0;
    const totalSnooze = reminders.reduce((sum, r) => sum + (r.snoozeCount || 0), 0);
    return totalSnooze / reminders.length;
  }

  calculateReminderTrends(history, period) {
    // Mock trend calculation
    return [
      { period: 'أسبوع 1', created: 15, completed: 12, overdue: 2 },
      { period: 'أسبوع 2', created: 18, completed: 16, overdue: 1 },
      { period: 'أسبوع 3', created: 22, completed: 20, overdue: 3 },
      { period: 'أسبوع 4', created: 20, completed: 18, overdue: 1 },
    ];
  }

  generateReminderId() {
    return `REM${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new ReminderService();
