/**
 * Task and Project Management Service
 * 
 * Handles task creation, project management, and team collaboration
 */

class TaskService {
  constructor() {
    this.tasks = new Map(); // Task storage
    this.projects = new Map(); // Project storage
    this.comments = new Map(); // Task comments
    this.timeTracking = new Map(); // Time tracking entries
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock projects
    const mockProjects = [
      {
        id: 'PROJ001',
        name: 'تطوير منصة التجارة الإلكترونية',
        description: 'مشروع تطوير منصة شاملة للتجارة الإلكترونية',
        status: 'active',
        priority: 'high',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        budget: 500000,
        spentBudget: 125000,
        progress: 35,
        managerId: '1',
        managerName: 'أحمد المدير',
        teamMembers: ['1', '2', '3'],
        tags: ['تطوير', 'تجارة إلكترونية', 'ويب'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'PROJ002',
        name: 'حملة تسويقية رقمية',
        description: 'حملة تسويقية شاملة عبر وسائل التواصل الاجتماعي',
        status: 'planning',
        priority: 'medium',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-30'),
        budget: 150000,
        spentBudget: 0,
        progress: 10,
        managerId: '2',
        managerName: 'سارة المستشارة',
        teamMembers: ['2', '4', '5'],
        tags: ['تسويق', 'رقمي', 'حملة'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12'),
      }
    ];

    mockProjects.forEach(project => {
      this.projects.set(project.id, project);
    });

    // Mock tasks
    const mockTasks = [
      {
        id: 'TASK001',
        projectId: 'PROJ001',
        projectName: 'تطوير منصة التجارة الإلكترونية',
        title: 'تصميم واجهة المستخدم الرئيسية',
        description: 'تصميم وتطوير الصفحة الرئيسية للمنصة',
        status: 'in_progress',
        priority: 'high',
        type: 'design',
        assignedTo: '2',
        assignedToName: 'سارة المستشارة',
        createdBy: '1',
        createdByName: 'أحمد المدير',
        dueDate: new Date('2024-01-25'),
        estimatedHours: 40,
        actualHours: 25,
        progress: 60,
        tags: ['UI', 'تصميم', 'صفحة رئيسية'],
        dependencies: [],
        attachments: [],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'TASK002',
        projectId: 'PROJ001',
        projectName: 'تطوير منصة التجارة الإلكترونية',
        title: 'تطوير نظام إدارة المنتجات',
        description: 'برمجة وتطوير نظام إدارة المنتجات والمخزون',
        status: 'pending',
        priority: 'high',
        type: 'development',
        assignedTo: '3',
        assignedToName: 'محمد المطور',
        createdBy: '1',
        createdByName: 'أحمد المدير',
        dueDate: new Date('2024-02-15'),
        estimatedHours: 80,
        actualHours: 0,
        progress: 0,
        tags: ['برمجة', 'منتجات', 'مخزون'],
        dependencies: ['TASK001'],
        attachments: [],
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
      },
      {
        id: 'TASK003',
        projectId: 'PROJ002',
        projectName: 'حملة تسويقية رقمية',
        title: 'إنشاء محتوى وسائل التواصل',
        description: 'إنشاء محتوى إبداعي لمنصات التواصل الاجتماعي',
        status: 'completed',
        priority: 'medium',
        type: 'content',
        assignedTo: '4',
        assignedToName: 'فاطمة المحتوى',
        createdBy: '2',
        createdByName: 'سارة المستشارة',
        dueDate: new Date('2024-01-20'),
        estimatedHours: 30,
        actualHours: 28,
        progress: 100,
        tags: ['محتوى', 'تسويق', 'إبداع'],
        dependencies: [],
        attachments: ['content_plan.pdf', 'social_media_templates.zip'],
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-18'),
      }
    ];

    mockTasks.forEach(task => {
      this.tasks.set(task.id, task);
    });

    // Mock comments
    const mockComments = [
      {
        id: 'COMMENT001',
        taskId: 'TASK001',
        userId: '1',
        userName: 'أحمد المدير',
        content: 'يرجى التركيز على تجربة المستخدم في التصميم',
        createdAt: new Date('2024-01-12'),
      },
      {
        id: 'COMMENT002',
        taskId: 'TASK001',
        userId: '2',
        userName: 'سارة المستشارة',
        content: 'تم الانتهاء من التصميم الأولي، في انتظار المراجعة',
        createdAt: new Date('2024-01-14'),
      }
    ];

    mockComments.forEach(comment => {
      this.comments.set(comment.id, comment);
    });
  }

  /**
   * Create new project
   */
  async createProject(projectData) {
    try {
      const project = {
        id: this.generateProjectId(),
        name: projectData.name,
        description: projectData.description,
        status: 'planning',
        priority: projectData.priority || 'medium',
        startDate: new Date(projectData.startDate),
        endDate: new Date(projectData.endDate),
        budget: projectData.budget || 0,
        spentBudget: 0,
        progress: 0,
        managerId: projectData.managerId,
        managerName: projectData.managerName,
        teamMembers: projectData.teamMembers || [],
        tags: projectData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.projects.set(project.id, project);

      return {
        success: true,
        data: project,
        message: 'تم إنشاء المشروع بنجاح'
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return {
        success: false,
        error: 'فشل في إنشاء المشروع'
      };
    }
  }

  /**
   * Create new task
   */
  async createTask(taskData) {
    try {
      const project = this.projects.get(taskData.projectId);
      if (!project) {
        return {
          success: false,
          error: 'المشروع غير موجود'
        };
      }

      const task = {
        id: this.generateTaskId(),
        projectId: taskData.projectId,
        projectName: project.name,
        title: taskData.title,
        description: taskData.description,
        status: 'pending',
        priority: taskData.priority || 'medium',
        type: taskData.type || 'general',
        assignedTo: taskData.assignedTo,
        assignedToName: taskData.assignedToName,
        createdBy: taskData.createdBy,
        createdByName: taskData.createdByName,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        estimatedHours: taskData.estimatedHours || 0,
        actualHours: 0,
        progress: 0,
        tags: taskData.tags || [],
        dependencies: taskData.dependencies || [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.tasks.set(task.id, task);

      return {
        success: true,
        data: task,
        message: 'تم إنشاء المهمة بنجاح'
      };
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        success: false,
        error: 'فشل في إنشاء المهمة'
      };
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId, status, progress = null) {
    try {
      const task = this.tasks.get(taskId);
      
      if (!task) {
        return {
          success: false,
          error: 'المهمة غير موجودة'
        };
      }

      task.status = status;
      if (progress !== null) {
        task.progress = Math.min(100, Math.max(0, progress));
      }
      
      // Auto-set progress based on status
      if (status === 'completed') {
        task.progress = 100;
      } else if (status === 'in_progress' && task.progress === 0) {
        task.progress = 10;
      }

      task.updatedAt = new Date();
      this.tasks.set(taskId, task);

      // Update project progress
      this.updateProjectProgress(task.projectId);

      return {
        success: true,
        data: task,
        message: 'تم تحديث حالة المهمة'
      };
    } catch (error) {
      console.error('Error updating task status:', error);
      return {
        success: false,
        error: 'فشل في تحديث حالة المهمة'
      };
    }
  }

  /**
   * Add comment to task
   */
  async addTaskComment(taskId, userId, userName, content) {
    try {
      const task = this.tasks.get(taskId);
      
      if (!task) {
        return {
          success: false,
          error: 'المهمة غير موجودة'
        };
      }

      const comment = {
        id: this.generateCommentId(),
        taskId,
        userId,
        userName,
        content,
        createdAt: new Date(),
      };

      this.comments.set(comment.id, comment);

      return {
        success: true,
        data: comment,
        message: 'تم إضافة التعليق'
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      return {
        success: false,
        error: 'فشل في إضافة التعليق'
      };
    }
  }

  /**
   * Track time for task
   */
  async trackTime(taskId, userId, hours, description = '') {
    try {
      const task = this.tasks.get(taskId);
      
      if (!task) {
        return {
          success: false,
          error: 'المهمة غير موجودة'
        };
      }

      const timeEntry = {
        id: this.generateTimeEntryId(),
        taskId,
        userId,
        hours,
        description,
        date: new Date(),
      };

      this.timeTracking.set(timeEntry.id, timeEntry);

      // Update task actual hours
      task.actualHours += hours;
      task.updatedAt = new Date();
      this.tasks.set(taskId, task);

      return {
        success: true,
        data: timeEntry,
        message: 'تم تسجيل الوقت'
      };
    } catch (error) {
      console.error('Error tracking time:', error);
      return {
        success: false,
        error: 'فشل في تسجيل الوقت'
      };
    }
  }

  /**
   * Get projects
   */
  async getProjects(filters = {}) {
    try {
      let projects = Array.from(this.projects.values());

      // Apply filters
      if (filters.status) {
        projects = projects.filter(project => project.status === filters.status);
      }

      if (filters.managerId) {
        projects = projects.filter(project => project.managerId === filters.managerId);
      }

      if (filters.priority) {
        projects = projects.filter(project => project.priority === filters.priority);
      }

      // Sort by creation date (newest first)
      projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        success: true,
        data: projects
      };
    } catch (error) {
      console.error('Error getting projects:', error);
      return {
        success: false,
        error: 'فشل في جلب المشاريع'
      };
    }
  }

  /**
   * Get tasks
   */
  async getTasks(filters = {}) {
    try {
      let tasks = Array.from(this.tasks.values());

      // Apply filters
      if (filters.projectId) {
        tasks = tasks.filter(task => task.projectId === filters.projectId);
      }

      if (filters.assignedTo) {
        tasks = tasks.filter(task => task.assignedTo === filters.assignedTo);
      }

      if (filters.status) {
        tasks = tasks.filter(task => task.status === filters.status);
      }

      if (filters.priority) {
        tasks = tasks.filter(task => task.priority === filters.priority);
      }

      // Sort by due date and priority
      tasks.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      return {
        success: true,
        data: tasks
      };
    } catch (error) {
      console.error('Error getting tasks:', error);
      return {
        success: false,
        error: 'فشل في جلب المهام'
      };
    }
  }

  /**
   * Get task comments
   */
  async getTaskComments(taskId) {
    try {
      const comments = Array.from(this.comments.values())
        .filter(comment => comment.taskId === taskId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      return {
        success: true,
        data: comments
      };
    } catch (error) {
      console.error('Error getting task comments:', error);
      return {
        success: false,
        error: 'فشل في جلب التعليقات'
      };
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats() {
    try {
      const projects = Array.from(this.projects.values());
      const tasks = Array.from(this.tasks.values());

      const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        overdueTasks: tasks.filter(t => 
          t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
        ).length,
        totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
        spentBudget: projects.reduce((sum, p) => sum + p.spentBudget, 0),
        averageProgress: projects.length > 0 ? 
          projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0,
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting project stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات المشاريع'
      };
    }
  }

  /**
   * Helper methods
   */
  updateProjectProgress(projectId) {
    const project = this.projects.get(projectId);
    if (!project) return;

    const projectTasks = Array.from(this.tasks.values())
      .filter(task => task.projectId === projectId);

    if (projectTasks.length === 0) return;

    const totalProgress = projectTasks.reduce((sum, task) => sum + task.progress, 0);
    project.progress = Math.round(totalProgress / projectTasks.length);
    project.updatedAt = new Date();

    // Update project status based on progress
    if (project.progress === 100) {
      project.status = 'completed';
    } else if (project.progress > 0) {
      project.status = 'active';
    }

    this.projects.set(projectId, project);
  }

  generateProjectId() {
    return `PROJ${Date.now().toString(36).toUpperCase()}`;
  }

  generateTaskId() {
    return `TASK${Date.now().toString(36).toUpperCase()}`;
  }

  generateCommentId() {
    return `COMMENT${Date.now().toString(36).toUpperCase()}`;
  }

  generateTimeEntryId() {
    return `TIME${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new TaskService();
