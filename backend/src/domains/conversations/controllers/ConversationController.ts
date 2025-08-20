import { Request, Response } from 'express';
import { BaseController } from '../../../shared/base/BaseController';
// import { ConversationService } from '../services/ConversationService';
import { ValidationError } from '../../../shared/errors/AppError';
import { enhancedLogger } from '../../../shared/utils/logger';
// import { AuthenticatedRequest } from '../../auth/middleware/authMiddleware';

interface AuthenticatedRequest extends Request {
  user?: any;
  companyId?: string;
}

/**
 * Conversation Controller
 * 
 * Handles all conversation-related HTTP requests including:
 * - Conversation CRUD operations
 * - Message management
 * - Conversation assignment
 * - Real-time updates
 */
export class ConversationController extends BaseController {
  private conversationService: ConversationService;

  constructor() {
    super();
    this.conversationService = new ConversationService();
  }

  /**
   * Get all conversations with pagination and filtering
   * GET /api/v1/conversations
   */
  getConversations = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const paginationParams = this.getPaginationParams(req);
    const filterParams = this.getFilterParams(req);

    // Add company filter
    const filters = {
      ...filterParams,
      companyId: user.companyId,
      // Agents can only see their assigned conversations
      ...(user.role === 'AGENT' && { assignedTo: user.id }),
    };

    const conversations = await this.conversationService.getConversations(filters, paginationParams);
    const total = await this.conversationService.getConversationsCount(filters);

    this.successWithPagination(
      res,
      conversations,
      {
        page: paginationParams.page || 1,
        limit: paginationParams.limit || 10,
        total,
      },
      'Conversations retrieved successfully'
    );
  });

  /**
   * Get conversation by ID
   * GET /api/v1/conversations/:id
   */
  getConversation = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;

    const conversation = await this.conversationService.getConversationById(id, user.companyId, user.id);

    this.success(res, conversation, 'Conversation retrieved successfully');
  });

  /**
   * Create new conversation
   * POST /api/v1/conversations
   */
  createConversation = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { customerId, title, channel, priority, tags } = req.body;

    // Validate required fields
    this.validateRequiredFields(req.body, ['customerId', 'channel']);

    const conversationData = {
      customerId,
      title: title ? this.sanitizeInput(title) : undefined,
      channel,
      priority: priority || 'NORMAL',
      tags: tags ? JSON.stringify(tags) : undefined,
      companyId: user.companyId,
      createdBy: user.id,
    };

    const conversation = await this.conversationService.createConversation(conversationData);

    enhancedLogger.business('conversation_created', {
      conversationId: conversation.id,
      customerId,
      companyId: user.companyId,
      createdBy: user.id,
    });

    this.success(res, conversation, 'Conversation created successfully', 201);
  });

  /**
   * Update conversation
   * PUT /api/v1/conversations/:id
   */
  updateConversation = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;
    const { title, status, priority, tags, assignedTo } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title ? this.sanitizeInput(title) : null;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const conversation = await this.conversationService.updateConversation(id, updateData, user.companyId);

    enhancedLogger.business('conversation_updated', {
      conversationId: id,
      companyId: user.companyId,
      updatedBy: user.id,
      updatedFields: Object.keys(updateData),
    });

    this.success(res, conversation, 'Conversation updated successfully');
  });

  /**
   * Close conversation
   * POST /api/v1/conversations/:id/close
   */
  closeConversation = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;

    const conversation = await this.conversationService.closeConversation(id, user.companyId, user.id);

    enhancedLogger.business('conversation_closed', {
      conversationId: id,
      companyId: user.companyId,
      closedBy: user.id,
    });

    this.success(res, conversation, 'Conversation closed successfully');
  });

  /**
   * Assign conversation to agent
   * POST /api/v1/conversations/:id/assign
   */
  assignConversation = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;
    const { agentId } = req.body;

    // Only managers and admins can assign conversations
    this.requireRole(req, ['COMPANY_ADMIN', 'MANAGER']);

    this.validateRequiredFields(req.body, ['agentId']);

    const conversation = await this.conversationService.assignConversation(id, agentId, user.companyId);

    enhancedLogger.business('conversation_assigned', {
      conversationId: id,
      agentId,
      companyId: user.companyId,
      assignedBy: user.id,
    });

    this.success(res, conversation, 'Conversation assigned successfully');
  });

  /**
   * Get conversation messages
   * GET /api/v1/conversations/:id/messages
   */
  getMessages = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;
    const paginationParams = this.getPaginationParams(req);

    const messages = await this.conversationService.getMessages(id, user.companyId, paginationParams);

    this.success(res, messages, 'Messages retrieved successfully');
  });

  /**
   * Send message
   * POST /api/v1/conversations/:id/messages
   */
  sendMessage = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;
    const { content, type, attachments } = req.body;

    this.validateRequiredFields(req.body, ['content']);

    const messageData = {
      content: this.sanitizeInput(content),
      type: type || 'TEXT',
      attachments: attachments ? JSON.stringify(attachments) : undefined,
      conversationId: id,
      senderId: user.id,
    };

    const message = await this.conversationService.sendMessage(messageData, user.companyId);

    enhancedLogger.business('message_sent', {
      messageId: message.id,
      conversationId: id,
      senderId: user.id,
      type: messageData.type,
    });

    this.success(res, message, 'Message sent successfully', 201);
  });

  /**
   * Mark conversation as read
   * POST /api/v1/conversations/:id/read
   */
  markAsRead = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;

    await this.conversationService.markAsRead(id, user.id, user.companyId);

    this.success(res, null, 'Conversation marked as read');
  });

  /**
   * Get conversation statistics
   * GET /api/v1/conversations/stats
   */
  getConversationStats = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);

    const stats = await this.conversationService.getConversationStats(user.companyId, user.id, user.role);

    this.success(res, stats, 'Conversation statistics retrieved successfully');
  });

  /**
   * Get unread conversations count
   * GET /api/v1/conversations/unread-count
   */
  getUnreadCount = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);

    const count = await this.conversationService.getUnreadCount(user.companyId, user.id, user.role);

    this.success(res, { count }, 'Unread count retrieved successfully');
  });

  /**
   * Search conversations
   * GET /api/v1/conversations/search
   */
  searchConversations = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      throw new ValidationError('Search query is required');
    }

    const searchQuery = this.sanitizeInput(q);
    const conversations = await this.conversationService.searchConversations(searchQuery, user.companyId, user.id, user.role);

    this.success(res, conversations, 'Search results retrieved successfully');
  });

  /**
   * Get conversation templates
   * GET /api/v1/conversations/templates
   */
  getTemplates = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);

    const templates = await this.conversationService.getMessageTemplates(user.companyId);

    this.success(res, templates, 'Message templates retrieved successfully');
  });

  /**
   * Create message template
   * POST /api/v1/conversations/templates
   */
  createTemplate = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { name, content, category, variables } = req.body;

    // Only managers and admins can create templates
    this.requireRole(req, ['COMPANY_ADMIN', 'MANAGER']);

    this.validateRequiredFields(req.body, ['name', 'content']);

    const templateData = {
      name: this.sanitizeInput(name),
      content: this.sanitizeInput(content),
      category: category ? this.sanitizeInput(category) : undefined,
      variables: variables ? JSON.stringify(variables) : undefined,
      companyId: user.companyId,
      createdBy: user.id,
    };

    const template = await this.conversationService.createMessageTemplate(templateData);

    enhancedLogger.business('message_template_created', {
      templateId: template.id,
      companyId: user.companyId,
      createdBy: user.id,
    });

    this.success(res, template, 'Message template created successfully', 201);
  });
}
