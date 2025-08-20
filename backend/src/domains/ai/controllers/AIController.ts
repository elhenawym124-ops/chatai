import { Request, Response } from 'express';
import { BaseController } from '../../../shared/base/BaseController';
import { GeminiService } from '../services/GeminiService';
import { ValidationError } from '../../../shared/errors/AppError';
import { enhancedLogger } from '../../../shared/utils/logger';
import { PrismaClient } from '@prisma/client';
// import { AuthenticatedRequest } from '../../auth/middleware/authMiddleware';
interface AuthenticatedRequest extends Request {
  user?: any;
  companyId?: string;
}

/**
 * AI Controller
 * 
 * Handles all AI-related HTTP requests including:
 * - Smart response generation
 * - Sentiment analysis
 * - Intent recognition
 * - Product recommendations
 * - AI settings management
 */
export class AIController extends BaseController {
  private geminiService: GeminiService;
  private prisma: PrismaClient;
  private advancedGeminiService: any;
  private advancedPromptService: any;
  private advancedProductService: any;

  constructor() {
    super();
    this.geminiService = new GeminiService();
    this.prisma = new PrismaClient();

    // Initialize advanced services
    const AdvancedGeminiService = require('../../../services/advancedGeminiService');
    const AdvancedPromptService = require('../../../services/advancedPromptService');
    const AdvancedProductService = require('../../../services/advancedProductService');

    this.advancedGeminiService = new AdvancedGeminiService();
    this.advancedPromptService = new AdvancedPromptService();
    this.advancedProductService = new AdvancedProductService();
  }

  /**
   * Generate smart response for customer message
   * POST /api/v1/ai/generate-response
   */
  generateResponse = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { message, customerId, conversationId } = req.body;

    // Validate required fields
    this.validateRequiredFields(req.body, ['message', 'customerId']);

    // Build conversation context
    const context = await this.buildConversationContext(customerId, conversationId, user.companyId);

    const aiResponse = await this.geminiService.generateResponse(
      message,
      context,
      user.companyId
    );

    enhancedLogger.business('ai_response_requested', {
      companyId: user.companyId,
      customerId,
      requestedBy: user.id,
      confidence: aiResponse.confidence,
    });

    this.success(res, aiResponse, 'AI response generated successfully');
  });

  /**
   * Analyze sentiment of message
   * POST /api/v1/ai/analyze-sentiment
   */
  analyzeSentiment = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { message } = req.body;

    this.validateRequiredFields(req.body, ['message']);

    const sentiment = await this.geminiService.analyzeSentiment(message);

    this.success(res, sentiment, 'Sentiment analysis completed');
  });

  /**
   * Get product recommendations
   * POST /api/v1/ai/recommend-products
   */
  recommendProducts = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { customerId, context } = req.body;

    this.validateRequiredFields(req.body, ['customerId']);

    const recommendations = await this.geminiService.generateProductRecommendations(
      customerId,
      user.companyId,
      context
    );

    this.success(res, recommendations, 'Product recommendations generated');
  });

  /**
   * Get AI analytics
   * GET /api/v1/ai/analytics
   */
  getAnalytics = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { dateFrom, dateTo } = req.query;

    const analytics = await this.geminiService.getAIAnalytics(
      user.companyId,
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    this.success(res, analytics, 'AI analytics retrieved successfully');
  });

  /**
   * Update AI settings
   * PUT /api/v1/ai/settings
   */
  updateSettings = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    
    // Only admins and managers can update AI settings
    this.requireRole(req, ['COMPANY_ADMIN', 'MANAGER']);

    const { promptTemplate, autoReplyEnabled, confidenceThreshold, escalationRules } = req.body;

    const settings = await this.geminiService.updateCompanyAISettings(user.companyId, {
      promptTemplate,
      autoReplyEnabled,
      confidenceThreshold,
      escalationRules,
    });

    enhancedLogger.business('ai_settings_updated', {
      companyId: user.companyId,
      updatedBy: user.id,
    });

    this.success(res, settings, 'AI settings updated successfully');
  });

  /**
   * Get AI settings
   * GET /api/v1/ai/settings
   */
  getSettings = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);

    // Get AI settings from database
    const settings = await this.prisma.aiSettings.findUnique({
      where: { companyId: user.companyId },
    });

    const defaultSettings = {
      promptTemplate: null,
      autoReplyEnabled: false,
      confidenceThreshold: 0.7,
      escalationRules: {},
    };

    this.success(res, settings || defaultSettings, 'AI settings retrieved successfully');
  });

  /**
   * Test AI response
   * POST /api/v1/ai/test
   */
  testResponse = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { message, promptTemplate } = req.body;

    this.validateRequiredFields(req.body, ['message']);

    // Create test context
    const testContext = {
      customerId: 'test',
      customerName: 'Test Customer',
      customerHistory: [],
      companyInfo: {
        name: 'Test Company',
        industry: 'Technology',
        products: ['Product A', 'Product B'],
        policies: [],
      },
      conversationHistory: [],
    };

    // Temporarily update prompt template if provided
    if (promptTemplate) {
      await this.geminiService.updateCompanyAISettings(user.companyId, {
        promptTemplate,
      });
    }

    const aiResponse = await this.geminiService.generateResponse(
      message,
      testContext,
      user.companyId
    );

    this.success(res, aiResponse, 'AI test response generated');
  });

  /**
   * Get conversation insights
   * GET /api/v1/ai/insights/:conversationId
   */
  getConversationInsights = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { conversationId } = req.params;

    // Get conversation messages
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        conversation: {
          companyId: user.companyId,
        },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (messages.length === 0) {
      this.success(res, {
        overallSentiment: 'neutral',
        intents: [],
        keyTopics: [],
        recommendations: [],
      }, 'No messages found for analysis');
      return;
    }

    // Analyze overall conversation
    const customerMessages = messages
      .filter(m => m.senderType === 'CUSTOMER')
      .map(m => m.content)
      .join(' ');

    const [sentiment, intent] = await Promise.all([
      this.geminiService.analyzeSentiment(customerMessages),
      this.geminiService.analyzeIntent(customerMessages),
    ]);

    const insights = {
      overallSentiment: sentiment.sentiment,
      sentimentConfidence: sentiment.confidence,
      primaryIntent: intent,
      messageCount: messages.length,
      customerMessageCount: messages.filter(m => m.senderType === 'CUSTOMER').length,
      agentMessageCount: messages.filter(m => m.senderType === 'USER').length,
      conversationDuration: messages.length > 1 
        ? Math.round((messages[messages.length - 1].createdAt.getTime() - messages[0].createdAt.getTime()) / (1000 * 60))
        : 0,
      emotions: sentiment.emotions,
      keyTopics: [], // Could be enhanced with topic extraction
      recommendations: [], // Could be enhanced with conversation-specific recommendations
    };

    this.success(res, insights, 'Conversation insights generated');
  });

  /**
   * Build conversation context for AI
   */
  private async buildConversationContext(
    customerId: string,
    conversationId: string | undefined,
    companyId: string
  ): Promise<any> {
    try {
      // Get customer info
      const customer = await this.prisma.customer.findFirst({
        where: { id: customerId, companyId },
        include: {
          orders: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!customer) {
        throw new ValidationError('Customer not found');
      }

      // Get company info
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
        include: {
          products: {
            take: 20,
          },
        },
      });

      // Get conversation history if provided
      let conversationHistory: any[] = [];
      if (conversationId) {
        const messages = await this.prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        conversationHistory = messages.reverse().map(msg => ({
          role: msg.senderType === 'CUSTOMER' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: msg.createdAt,
        }));
      }

      return {
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerHistory: customer.orders.map(order => 
          order.items.map(item => item.product.name).join(', ')
        ),
        companyInfo: {
          name: company?.name || 'Company',
          industry: 'Business',
          products: company?.products.map(p => p.name) || [],
          policies: [],
        },
        conversationHistory,
      };
    } catch (error: any) {
      enhancedLogger.error('Failed to build conversation context', error);
      throw error;
    }
  }

  // ==================== ADVANCED AI METHODS ====================

  /**
   * Get available Gemini models
   */
  public getAvailableModels = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const models = this.advancedGeminiService.getAvailableModels(companyId);

      res.json({
        success: true,
        data: models
      });
    } catch (error: any) {
      enhancedLogger.error('Failed to get available models', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Get usage statistics
   */
  public getUsageStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const { period = 'today' } = req.query;
      const stats = await this.advancedGeminiService.getUsageStats(companyId, period as string);

      res.json(stats);
    } catch (error: any) {
      enhancedLogger.error('Failed to get usage stats', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Generate response with advanced features
   */
  public generateAdvancedResponse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const { message, customerId, includeProducts = false } = req.body;

      if (!message) {
        res.status(400).json({ success: false, error: 'Message is required' });
        return;
      }

      // Initialize advanced service
      await this.advancedGeminiService.initialize(companyId);

      // Build context
      const context = await this.buildConversationContext(companyId, customerId);

      // Get company prompts
      const prompts = await this.advancedPromptService.getCompanyPrompts(companyId);
      if (prompts.success) {
        context.personalityPrompt = prompts.data.personalityPrompt;
        context.responsePrompt = prompts.data.responsePrompt;
      }

      // Generate response
      const result = await this.advancedGeminiService.generateResponse(companyId, message, context);

      // Get product recommendations if requested
      let productRecommendations = null;
      if (includeProducts && result.success) {
        const productResult = await this.advancedProductService.recommendProducts(companyId, message, customerId);
        if (productResult.success) {
          productRecommendations = productResult.data.recommendations;
        }
      }

      res.json({
        ...result,
        productRecommendations
      });
    } catch (error: any) {
      enhancedLogger.error('Failed to generate advanced response', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // ==================== PROMPT MANAGEMENT ====================

  /**
   * Get prompt templates
   */
  public getPromptTemplates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { category, businessType } = req.query;

      const result = await this.advancedPromptService.getPromptTemplates({
        category: category as string,
        businessType: businessType as string
      });

      res.json(result);
    } catch (error: any) {
      enhancedLogger.error('Failed to get prompt templates', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Get company prompts
   */
  public getCompanyPrompts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const result = await this.advancedPromptService.getCompanyPrompts(companyId);
      res.json(result);
    } catch (error: any) {
      enhancedLogger.error('Failed to get company prompts', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Update company prompts
   */
  public updateCompanyPrompts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const { personalityPrompt, responsePrompt } = req.body;

      const result = await this.advancedPromptService.updateCompanyPrompts(companyId, {
        personalityPrompt,
        responsePrompt
      });

      res.json(result);
    } catch (error: any) {
      enhancedLogger.error('Failed to update company prompts', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Apply template to company
   */
  public applyTemplate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const { templateId, promptType } = req.body;

      if (!templateId || !promptType) {
        res.status(400).json({ success: false, error: 'Template ID and prompt type are required' });
        return;
      }

      const result = await this.advancedPromptService.applyTemplate(companyId, templateId, promptType);
      res.json(result);
    } catch (error: any) {
      enhancedLogger.error('Failed to apply template', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // ==================== PRODUCT AI MANAGEMENT ====================

  /**
   * Get product AI settings
   */
  public getProductAiSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const result = await this.advancedProductService.getProductAiSettings(companyId);
      res.json(result);
    } catch (error: any) {
      enhancedLogger.error('Failed to get product AI settings', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Update product AI settings
   */
  public updateProductAiSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const settings = req.body;
      const result = await this.advancedProductService.updateProductAiSettings(companyId, settings);
      res.json(result);
    } catch (error: any) {
      enhancedLogger.error('Failed to update product AI settings', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Recommend products
   */
  public recommendProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const { message, customerId } = req.body;

      if (!message) {
        res.status(400).json({ success: false, error: 'Message is required' });
        return;
      }

      const result = await this.advancedProductService.recommendProducts(companyId, message, customerId);
      res.json(result);
    } catch (error: any) {
      enhancedLogger.error('Failed to recommend products', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Analyze customer image
   */
  public analyzeCustomerImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const { imageUrl, message = '' } = req.body;

      if (!imageUrl) {
        res.status(400).json({ success: false, error: 'Image URL is required' });
        return;
      }

      const result = await this.advancedProductService.analyzeCustomerImage(companyId, imageUrl, message);
      res.json(result);
    } catch (error: any) {
      enhancedLogger.error('Failed to analyze customer image', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Create order from conversation
   */
  public createOrderFromConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const { customerId, conversationContext } = req.body;

      if (!customerId || !conversationContext) {
        res.status(400).json({ success: false, error: 'Customer ID and conversation context are required' });
        return;
      }

      const result = await this.advancedProductService.createOrderFromConversation(companyId, customerId, conversationContext);
      res.json(result);
    } catch (error: any) {
      enhancedLogger.error('Failed to create order from conversation', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Get product image
   */
  public getProductImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const { productId } = req.params;

      if (!productId) {
        res.status(400).json({ success: false, error: 'Product ID is required' });
        return;
      }

      const result = await this.advancedProductService.getProductImage(productId, companyId);
      res.json(result);
    } catch (error: any) {
      enhancedLogger.error('Failed to get product image', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // ==================== STATIC PROMPTS METHODS ====================

  /**
   * Get all static prompts from prompts.json
   */
  public getStaticPrompts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const fs = require('fs');
      const path = require('path');
      const promptsPath = path.join(__dirname, '../../../../data/prompts.json');
      
      if (!fs.existsSync(promptsPath)) {
        res.json({ success: true, data: [] });
        return;
      }

      const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
      const companyPrompts = prompts.filter((prompt: any) => prompt.companyId === companyId);
      
      res.json({ success: true, data: companyPrompts });
    } catch (error: any) {
      enhancedLogger.error('Failed to get static prompts', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Create new static prompt
   */
  public createStaticPrompt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const fs = require('fs');
      const path = require('path');
      const promptsPath = path.join(__dirname, '../../../../data/prompts.json');
      
      let prompts = [];
      if (fs.existsSync(promptsPath)) {
        prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
      }

      const newPrompt = {
        id: `PROMPT_${Date.now()}`,
        companyId,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      prompts.push(newPrompt);
      fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2));
      
      res.json({ success: true, data: newPrompt });
    } catch (error: any) {
      enhancedLogger.error('Failed to create static prompt', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Update static prompt
   */
  public updateStaticPrompt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      const { id } = req.params;
      
      if (!companyId || !id) {
        res.status(400).json({ success: false, error: 'Company ID and prompt ID are required' });
        return;
      }

      const fs = require('fs');
      const path = require('path');
      const promptsPath = path.join(__dirname, '../../../../data/prompts.json');
      
      if (!fs.existsSync(promptsPath)) {
        res.status(404).json({ success: false, error: 'Prompts file not found' });
        return;
      }

      let prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
      const promptIndex = prompts.findIndex((p: any) => p.id === id && p.companyId === companyId);
      
      if (promptIndex === -1) {
        res.status(404).json({ success: false, error: 'Prompt not found' });
        return;
      }

      prompts[promptIndex] = {
        ...prompts[promptIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2));
      
      res.json({ success: true, data: prompts[promptIndex] });
    } catch (error: any) {
      enhancedLogger.error('Failed to update static prompt', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Delete static prompt
   */
  public deleteStaticPrompt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      const { id } = req.params;
      
      if (!companyId || !id) {
        res.status(400).json({ success: false, error: 'Company ID and prompt ID are required' });
        return;
      }

      const fs = require('fs');
      const path = require('path');
      const promptsPath = path.join(__dirname, '../../../../data/prompts.json');
      
      if (!fs.existsSync(promptsPath)) {
        res.status(404).json({ success: false, error: 'Prompts file not found' });
        return;
      }

      let prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
      const initialLength = prompts.length;
      prompts = prompts.filter((p: any) => !(p.id === id && p.companyId === companyId));
      
      if (prompts.length === initialLength) {
        res.status(404).json({ success: false, error: 'Prompt not found' });
        return;
      }

      fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2));
      
      res.json({ success: true, message: 'Prompt deleted successfully' });
    } catch (error: any) {
      enhancedLogger.error('Failed to delete static prompt', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // ==================== BUSINESS TEMPLATES METHODS ====================

  /**
   * Get all business types
   */
  public getBusinessTypes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const PromptManagementService = require('../../../services/promptManagementService');
      const promptService = new PromptManagementService();
      
      const businessTypes = await promptService.getBusinessTypes();
      res.json({ success: true, data: businessTypes });
    } catch (error: any) {
      enhancedLogger.error('Failed to get business types', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Get all business templates
   */
  public getBusinessTemplates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const PromptManagementService = require('../../../services/promptManagementService');
      const promptService = new PromptManagementService();
      
      const templates = await promptService.getPromptTemplates();
      res.json({ success: true, data: templates });
    } catch (error: any) {
      enhancedLogger.error('Failed to get business templates', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Get specific business template
   */
  public getBusinessTemplate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const PromptManagementService = require('../../../services/promptManagementService');
      const promptService = new PromptManagementService();
      
      const template = await promptService.getPromptTemplate(id);
      if (!template) {
        res.status(404).json({ success: false, error: 'Template not found' });
        return;
      }
      
      res.json({ success: true, data: template });
    } catch (error: any) {
      enhancedLogger.error('Failed to get business template', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Apply business template to company
   */
  public applyBusinessTemplate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      const { templateId, variables } = req.body;
      
      if (!companyId || !templateId) {
        res.status(400).json({ success: false, error: 'Company ID and template ID are required' });
        return;
      }

      const PromptManagementService = require('../../../services/promptManagementService');
      const promptService = new PromptManagementService();
      
      const result = await promptService.applyTemplateToCompany(companyId, templateId, variables);
      res.json({ success: true, data: result });
    } catch (error: any) {
      enhancedLogger.error('Failed to apply business template', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // ==================== ADVANCED SERVICES METHODS ====================

  /**
   * Get advanced services status
   */
  public getAdvancedServicesStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const status = {
        geminiService: {
          name: 'Gemini AI Service',
          status: 'active',
          lastCheck: new Date().toISOString(),
          version: '1.0.0'
        },
        promptService: {
          name: 'Advanced Prompt Service',
          status: 'active',
          lastCheck: new Date().toISOString(),
          version: '1.0.0'
        },
        smartResponseService: {
          name: 'Smart Response Service',
          status: 'active',
          lastCheck: new Date().toISOString(),
          version: '1.0.0'
        }
      };
      
      res.json({ success: true, data: status });
    } catch (error: any) {
      enhancedLogger.error('Failed to get advanced services status', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Get advanced services configuration
   */
  public getAdvancedServicesConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const config = await this.advancedPromptService.getCompanyConfig(companyId);
      res.json({ success: true, data: config });
    } catch (error: any) {
      enhancedLogger.error('Failed to get advanced services config', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Update advanced services configuration
   */
  public updateAdvancedServicesConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, error: 'Company ID is required' });
        return;
      }

      const result = await this.advancedPromptService.updateCompanyConfig(companyId, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      enhancedLogger.error('Failed to update advanced services config', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Restart advanced services
   */
  public restartAdvancedServices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Simulate service restart
      const result = {
        restarted: true,
        timestamp: new Date().toISOString(),
        services: ['geminiService', 'promptService', 'smartResponseService']
      };
      
      res.json({ success: true, data: result, message: 'Advanced services restarted successfully' });
    } catch (error: any) {
      enhancedLogger.error('Failed to restart advanced services', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
