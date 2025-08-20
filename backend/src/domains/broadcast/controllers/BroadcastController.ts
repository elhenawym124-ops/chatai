import { Request, Response } from 'express';
import { BaseController } from '../../../shared/base/BaseController';
import { BroadcastService } from '../services/BroadcastService';
import { AuthenticatedRequest } from '../../../types/auth';
import { ValidationError } from '../../../shared/errors/AppError';
import { enhancedLogger } from '../../../utils/logger';

export class BroadcastController extends BaseController {
  private broadcastService: BroadcastService;

  constructor() {
    super();
    this.broadcastService = new BroadcastService();
  }

  /**
   * Create a new broadcast campaign
   * POST /api/v1/broadcast/campaigns
   */
  createCampaign = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const {
      name,
      message,
      targetAudience,
      scheduledAt,
      scheduledTime,
      tags,
      priority,
      includeImages,
      trackClicks,
      autoResend,
      sendNow,
      images
    } = req.body;

    // Validate required fields
    this.validateRequiredFields(req.body, ['name', 'message', 'targetAudience']);

    // Validate scheduling if not sending now
    if (!sendNow) {
      this.validateRequiredFields(req.body, ['scheduledAt', 'scheduledTime']);
      
      const scheduledDateTime = new Date(`${scheduledAt}T${scheduledTime}`);
      const now = new Date();
      const maxDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      if (scheduledDateTime <= now) {
        throw new ValidationError('Scheduled time must be in the future');
      }
      
      if (scheduledDateTime > maxDate) {
        throw new ValidationError('Cannot schedule campaign more than 24 hours in advance');
      }
    }

    const campaignData = {
      name: this.sanitizeInput(name),
      message: this.sanitizeInput(message),
      targetAudience,
      scheduledAt: sendNow ? null : new Date(`${scheduledAt}T${scheduledTime}`),
      tags: tags || [],
      priority: priority || 'medium',
      includeImages: includeImages || false,
      trackClicks: trackClicks !== false,
      autoResend: autoResend || false,
      sendNow: sendNow || false,
      images: images || [],
      companyId: user.companyId,
      createdBy: user.id
    };

    const campaign = await this.broadcastService.createCampaign(campaignData);

    // If sending now, trigger immediate send
    if (sendNow) {
      await this.broadcastService.sendCampaignNow(campaign.id, user.companyId);
    }

    enhancedLogger.business('broadcast_campaign_created', {
      campaignId: campaign.id,
      companyId: user.companyId,
      userId: user.id,
      sendNow,
      recipientCount: campaign.recipientCount
    });

    this.success(res, campaign, 'Campaign created successfully', 201);
  });

  /**
   * Get all campaigns for company
   * GET /api/v1/broadcast/campaigns
   */
  getCampaigns = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const paginationParams = this.getPaginationParams(req);
    const { status, priority } = req.query;

    const filters: any = {
      companyId: user.companyId
    };

    if (status) filters.status = status;
    if (priority) filters.priority = priority;

    const result = await this.broadcastService.getCampaigns(filters, paginationParams);

    this.successWithPagination(res, result.campaigns, result.pagination, 'Campaigns retrieved successfully');
  });

  /**
   * Get campaign analytics
   * GET /api/v1/broadcast/analytics
   */
  getAnalytics = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { period = '30d' } = req.query;

    const analytics = await this.broadcastService.getAnalytics(user.companyId, period as string);

    this.success(res, analytics, 'Analytics retrieved successfully');
  });

  /**
   * Get customer lists for targeting
   * GET /api/v1/broadcast/customer-lists
   */
  getCustomerLists = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);

    const customerLists = await this.broadcastService.getCustomerLists(user.companyId);

    this.success(res, customerLists, 'Customer lists retrieved successfully');
  });

  /**
   * Update campaign (only if not sent)
   * PUT /api/v1/broadcast/campaigns/:id
   */
  updateCampaign = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;

    const campaign = await this.broadcastService.updateCampaign(id, req.body, user.companyId);

    enhancedLogger.business('broadcast_campaign_updated', {
      campaignId: id,
      companyId: user.companyId,
      userId: user.id
    });

    this.success(res, campaign, 'Campaign updated successfully');
  });

  /**
   * Cancel scheduled campaign
   * POST /api/v1/broadcast/campaigns/:id/cancel
   */
  cancelCampaign = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;

    const campaign = await this.broadcastService.cancelCampaign(id, user.companyId);

    enhancedLogger.business('broadcast_campaign_cancelled', {
      campaignId: id,
      companyId: user.companyId,
      userId: user.id
    });

    this.success(res, campaign, 'Campaign cancelled successfully');
  });

  /**
   * Pause/Resume campaign
   * POST /api/v1/broadcast/campaigns/:id/toggle-pause
   */
  togglePauseCampaign = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;

    const campaign = await this.broadcastService.togglePauseCampaign(id, user.companyId);

    enhancedLogger.business('broadcast_campaign_toggled', {
      campaignId: id,
      companyId: user.companyId,
      userId: user.id,
      newStatus: campaign.status
    });

    this.success(res, campaign, `Campaign ${campaign.status === 'paused' ? 'paused' : 'resumed'} successfully`);
  });

  /**
   * Get broadcast settings
   * GET /api/v1/broadcast/settings
   */
  getSettings = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);

    const settings = await this.broadcastService.getSettings(user.companyId);

    this.success(res, settings, 'Broadcast settings retrieved successfully');
  });

  /**
   * Update broadcast settings
   * PUT /api/v1/broadcast/settings
   */
  updateSettings = this.asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = this.getAuthenticatedUser(req);

    const settings = await this.broadcastService.updateSettings(user.companyId, req.body);

    enhancedLogger.business('broadcast_settings_updated', {
      companyId: user.companyId,
      userId: user.id
    });

    this.success(res, settings, 'Broadcast settings updated successfully');
  });
}
