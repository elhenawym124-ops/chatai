import { Request, Response } from 'express';
import crypto from 'crypto';
import { BaseController } from '../../../shared/base/BaseController';
import { FacebookService } from '../services/FacebookService';
import { ValidationError, UnauthorizedError } from '../../../shared/errors/AppError';
import { enhancedLogger } from '../../../shared/utils/logger';
// Use Express Request

/**
 * Facebook Integration Controller
 * 
 * Handles all Facebook Messenger integration requests including:
 * - Page connection and management
 * - Webhook verification and processing
 * - Message sending
 * - Integration status
 */
export class FacebookController extends BaseController {
  private facebookService: FacebookService;
  private readonly WEBHOOK_VERIFY_TOKEN: string;

  constructor() {
    super();
    this.facebookService = new FacebookService();
    this.WEBHOOK_VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'your-webhook-verify-token';
  }

  /**
   * Get user's Facebook pages
   * GET /api/v1/integrations/facebook/pages
   */
  getPages = this.asyncHandler(async (req: Request, res: Response) => {
    const { userAccessToken } = req.query;

    if (!userAccessToken || typeof userAccessToken !== 'string') {
      throw new ValidationError('User access token is required');
    }

    const pages = await this.facebookService.getUserPages(userAccessToken);

    this.success(res, pages, 'Facebook pages retrieved successfully');
  });

  /**
   * Connect Facebook page
   * POST /api/v1/integrations/facebook/connect
   */
  connectPage = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { pageId, pageAccessToken, pageName } = req.body;

    // Validate required fields
    this.validateRequiredFields(req.body, ['pageId', 'pageAccessToken', 'pageName']);

    const integration = await this.facebookService.connectPage(
      user.companyId,
      pageId,
      pageAccessToken,
      pageName
    );

    enhancedLogger.business('facebook_page_connected', {
      companyId: user.companyId,
      pageId,
      connectedBy: user.id,
    });

    this.success(res, integration, 'Facebook page connected successfully', 201);
  });

  /**
   * Disconnect Facebook page
   * DELETE /api/v1/integrations/facebook/:pageId
   */
  disconnectPage = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { pageId } = req.params;

    await this.facebookService.disconnectPage(user.companyId, pageId);

    enhancedLogger.business('facebook_page_disconnected', {
      companyId: user.companyId,
      pageId,
      disconnectedBy: user.id,
    });

    this.success(res, null, 'Facebook page disconnected successfully');
  });

  /**
   * Get connected pages
   * GET /api/v1/integrations/facebook/connected
   */
  getConnectedPages = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);

    const connectedPages = await this.facebookService.getConnectedPages(user.companyId);

    this.success(res, {
      pages: connectedPages,
      count: connectedPages.length,
    }, 'Connected pages retrieved successfully');
  });

  /**
   * Send message via Facebook
   * POST /api/v1/integrations/facebook/send-message
   */
  sendMessage = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { pageId, recipientId, message, messageType = 'TEXT' } = req.body;

    // Validate required fields
    this.validateRequiredFields(req.body, ['pageId', 'recipientId', 'message']);

    const result = await this.facebookService.sendMessage(
      pageId,
      recipientId,
      message,
      user.companyId,
      messageType
    );

    enhancedLogger.business('facebook_message_sent_via_api', {
      companyId: user.companyId,
      pageId,
      recipientId,
      sentBy: user.id,
      messageType,
    });

    this.success(res, result, 'Message sent successfully');
  });

  /**
   * Webhook verification (GET)
   * GET /api/v1/integrations/facebook/webhook
   */
  verifyWebhook = this.asyncHandler(async (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === 'subscribe' && token === this.WEBHOOK_VERIFY_TOKEN) {
        // Respond with 200 OK and challenge token from the request
        enhancedLogger.info('Facebook webhook verified successfully');
        res.status(200).send(challenge);
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        enhancedLogger.security('facebook_webhook_verification_failed', {
          mode,
          token: token ? 'provided' : 'missing',
        });
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(400);
    }
  });

  /**
   * Webhook handler (POST)
   * POST /api/v1/integrations/facebook/webhook
   */
  handleWebhook = this.asyncHandler(async (req: Request, res: Response) => {
    const body = req.body;

    // Verify webhook signature
    if (!this.verifyWebhookSignature(req)) {
      enhancedLogger.security('facebook_webhook_signature_invalid', {
        headers: req.headers,
      });
      throw new UnauthorizedError('Invalid webhook signature');
    }

    // Process the webhook
    await this.facebookService.processWebhook(body);

    enhancedLogger.info('Facebook webhook processed successfully', {
      object: body.object,
      entriesCount: body.entry?.length || 0,
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  });

  /**
   * Get integration status
   * GET /api/v1/integrations/facebook/status
   */
  getIntegrationStatus = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);

    const connectedPages = await this.facebookService.getConnectedPages(user.companyId);

    const status = {
      isConnected: connectedPages.length > 0,
      connectedPagesCount: connectedPages.length,
      pages: connectedPages,
      webhookUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/integrations/facebook/webhook`,
      verifyToken: this.WEBHOOK_VERIFY_TOKEN,
    };

    this.success(res, status, 'Integration status retrieved successfully');
  });



  /**
   * Test Facebook connection
   * POST /api/v1/integrations/facebook/test
   */
  testConnection = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { pageId, pageAccessToken } = req.body;

    this.validateRequiredFields(req.body, ['pageId', 'pageAccessToken']);

    try {
      const pageInfo = await this.facebookService.getPageInfo(pageId, pageAccessToken);

      this.success(res, {
        isValid: true,
        pageInfo,
        message: 'Facebook connection is valid',
      }, 'Connection test successful');
    } catch (error: any) {
      this.success(res, {
        isValid: false,
        error: error.message,
        message: 'Facebook connection failed',
      }, 'Connection test completed');
    }
  });

  /**
   * Get Facebook app configuration
   * GET /api/v1/integrations/facebook/config
   */
  getAppConfig = this.asyncHandler(async (req: Request, res: Response) => {
    const config = {
      appId: process.env.FACEBOOK_APP_ID,
      webhookUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/integrations/facebook/webhook`,
      verifyToken: this.WEBHOOK_VERIFY_TOKEN,
      requiredPermissions: [
        'pages_manage_metadata',
        'pages_read_engagement',
        'pages_messaging',
        'pages_show_list',
      ],
      webhookFields: [
        'messages',
        'messaging_postbacks',
        'messaging_optins',
        'message_deliveries',
        'message_reads',
      ],
    };

    this.success(res, config, 'App configuration retrieved successfully');
  });

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(req: Request): boolean {
    try {
      const signature = req.headers['x-hub-signature-256'] as string;
      const appSecret = process.env.FACEBOOK_APP_SECRET;

      if (!signature || !appSecret) {
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', appSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      const signatureHash = signature.split('sha256=')[1];

      return crypto.timingSafeEqual(
        Buffer.from(signatureHash, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      enhancedLogger.error('Error verifying webhook signature', error);
      return false;
    }
  }
}
