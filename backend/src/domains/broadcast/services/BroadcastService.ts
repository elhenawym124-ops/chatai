import { getPrismaClient } from '../../../config/database';
import { FacebookMessengerService } from '../../../services/FacebookMessengerService';
// import { ValidationError, NotFoundError } from '../../../shared/errors/AppError';
// import { enhancedLogger } from '../../../utils/logger';

// Temporary error classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Temporary logger
const enhancedLogger = {
  info: (message: string, data?: any) => console.log('INFO:', message, data),
  error: (message: string, data?: any) => console.error('ERROR:', message, data),
  business: (event: string, data?: any) => console.log('BUSINESS:', event, data)
};

interface CampaignData {
  name: string;
  message: string;
  targetAudience: string;
  scheduledAt?: Date | null;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  includeImages: boolean;
  trackClicks: boolean;
  autoResend: boolean;
  sendNow: boolean;
  images: string[];
  companyId: string;
  createdBy: string;
}

interface CustomerList {
  id: string;
  name: string;
  description: string;
  count: number;
  criteria: any;
}

export class BroadcastService {
  private prisma: any;
  private messengerService: FacebookMessengerService;

  constructor() {
    this.prisma = getPrismaClient();
    this.messengerService = new FacebookMessengerService();
  }

  /**
   * Create a new broadcast campaign
   */
  async createCampaign(campaignData: CampaignData) {
    try {
      // Get recipient count based on target audience
      const recipientCount = await this.getRecipientCount(campaignData.targetAudience, campaignData.companyId);

      // Create campaign in database
      const campaign = await this.prisma.broadcastCampaign.create({
        data: {
          name: campaignData.name,
          message: campaignData.message,
          targetAudience: campaignData.targetAudience,
          scheduledAt: campaignData.scheduledAt,
          tags: JSON.stringify(campaignData.tags),
          priority: campaignData.priority.toUpperCase(),
          includeImages: campaignData.includeImages,
          trackClicks: campaignData.trackClicks,
          autoResend: campaignData.autoResend,
          images: JSON.stringify(campaignData.images),
          recipientCount,
          status: campaignData.sendNow ? 'SENDING' : 'SCHEDULED',
          companyId: campaignData.companyId,
          createdBy: campaignData.createdBy
        }
      });

      enhancedLogger.info('Broadcast campaign created', {
        campaignId: campaign.id,
        companyId: campaignData.companyId,
        recipientCount
      });

      return campaign;
    } catch (error) {
      enhancedLogger.error('Error creating broadcast campaign', error);
      throw error;
    }
  }

  /**
   * Send campaign immediately
   */
  async sendCampaignNow(campaignId: string, companyId: string) {
    try {
      const campaign = await this.prisma.broadcastCampaign.findFirst({
        where: { id: campaignId, companyId }
      });

      if (!campaign) {
        throw new NotFoundError('Campaign not found');
      }

      // Get recipients based on target audience
      const recipients = await this.getRecipients(campaign.targetAudience, companyId);

      // Update campaign status
      await this.prisma.broadcastCampaign.update({
        where: { id: campaignId },
        data: { 
          status: 'sending',
          sentAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Send messages via Facebook Messenger
      const sendResults = await this.sendMessagesViaMessenger(campaign, recipients);

      // Update campaign with send results
      await this.prisma.broadcastCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'sent',
          sentCount: sendResults.successCount,
          deliveredCount: sendResults.successCount,
          failedCount: sendResults.failedCount,
          updatedAt: new Date()
        }
      });

      // Create campaign analytics record
      await this.createCampaignAnalytics(campaignId, sendResults);

      enhancedLogger.business('broadcast_campaign_sent', {
        campaignId,
        companyId,
        recipientCount: recipients.length,
        successCount: sendResults.successCount,
        failedCount: sendResults.failedCount
      });

      return {
        campaignId,
        recipientCount: recipients.length,
        sentCount: sendResults.successCount,
        failedCount: sendResults.failedCount
      };
    } catch (error) {
      enhancedLogger.error('Error sending campaign', error);
      
      // Update campaign status to failed
      await this.prisma.broadcastCampaign.update({
        where: { id: campaignId },
        data: { 
          status: 'failed',
          updatedAt: new Date()
        }
      });

      throw error;
    }
  }

  /**
   * Get single campaign
   */
  async getCampaign(campaignId: string, companyId: string) {
    const campaign = await this.prisma.broadcastCampaign.findFirst({
      where: { id: campaignId, companyId },
      include: {
        creator: {
          select: { firstName: true, lastName: true, email: true }
        },
        analytics: true
      }
    });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    return campaign;
  }

  /**
   * Get campaign analytics for specific campaign
   */
  async getCampaignAnalytics(campaignId: string, companyId: string) {
    const campaign = await this.prisma.broadcastCampaign.findFirst({
      where: { id: campaignId, companyId },
      include: {
        analytics: true
      }
    });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    return campaign.analytics || {
      deliveredCount: campaign.deliveredCount || 0,
      openedCount: campaign.openedCount || 0,
      clickedCount: campaign.clickedCount || 0,
      repliedCount: 0,
      unsubscribedCount: 0,
      failedCount: campaign.failedCount || 0
    };
  }

  /**
   * Get campaigns with pagination
   */
  async getCampaigns(filters: any, pagination: any) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      this.prisma.broadcastCampaign.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdByUser: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      }),
      this.prisma.broadcastCampaign.count({ where: filters })
    ]);

    return {
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get customer lists for targeting
   */
  async getCustomerLists(companyId: string): Promise<CustomerList[]> {
    try {
      // Get active customers in last 24 hours (sent messages)
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activeCustomers24h = await this.prisma.conversation.count({
        where: {
          companyId,
          lastMessageAt: { gte: last24Hours },
          customerPhone: { not: null }
        }
      });

      // Get active customers in last 30 days
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const activeCustomers30d = await this.prisma.conversation.count({
        where: {
          companyId,
          lastMessageAt: { gte: last30Days },
          customerPhone: { not: null }
        }
      });

      // Get all customers
      const allCustomers = await this.prisma.conversation.count({
        where: {
          companyId,
          customerPhone: { not: null }
        }
      });

      // Get high-value customers (based on conversation count or other criteria)
      const highValueCustomers = await this.prisma.conversation.count({
        where: {
          companyId,
          customerPhone: { not: null },
          // Add criteria for high-value customers
        }
      });

      return [
        {
          id: 'active_24h',
          name: 'العملاء النشطين خلال 24 ساعة',
          description: 'العملاء الذين أرسلوا رسائل خلال آخر 24 ساعة',
          count: activeCustomers24h,
          criteria: { type: 'active', lastActivity: '24h' }
        },
        {
          id: 'active_30d',
          name: 'العملاء النشطين',
          description: 'العملاء الذين تفاعلوا خلال آخر 30 يوم',
          count: activeCustomers30d,
          criteria: { type: 'active', lastActivity: '30d' }
        },
        {
          id: 'all',
          name: 'جميع العملاء',
          description: 'جميع العملاء المسجلين في النظام',
          count: allCustomers,
          criteria: { type: 'all' }
        },
        {
          id: 'high_value',
          name: 'العملاء المميزين',
          description: 'العملاء ذوي القيمة العالية',
          count: highValueCustomers,
          criteria: { type: 'high_value' }
        }
      ];
    } catch (error) {
      enhancedLogger.error('Error getting customer lists', error);
      throw error;
    }
  }

  /**
   * Get campaign analytics
   */
  async getAnalytics(companyId: string, period: string) {
    try {
      const periodDays = this.getPeriodDays(period);
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

      const [campaigns, analytics] = await Promise.all([
        this.prisma.broadcastCampaign.findMany({
          where: {
            companyId,
            createdAt: { gte: startDate }
          }
        }),
        this.prisma.broadcastAnalytics.findMany({
          where: {
            campaign: {
              companyId
            },
            createdAt: { gte: startDate }
          },
          include: {
            campaign: true
          }
        })
      ]);

      // Calculate aggregate metrics
      const totalCampaigns = campaigns.length;
      const totalRecipients = campaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0);
      const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
      const totalDelivered = campaigns.reduce((sum, c) => sum + (c.deliveredCount || 0), 0);
      const totalOpened = analytics.reduce((sum, a) => sum + (a.openedCount || 0), 0);
      const totalClicked = analytics.reduce((sum, a) => sum + (a.clickedCount || 0), 0);

      const averageOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const averageClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

      return {
        totalCampaigns,
        totalRecipients,
        averageOpenRate: Math.round(averageOpenRate * 10) / 10,
        averageClickRate: Math.round(averageClickRate * 10) / 10,
        totalRevenue: 0, // Calculate based on your business logic
        bestPerformingTime: '10:00 صباحاً', // Calculate based on analytics
        campaignMetrics: analytics.map(a => ({
          campaignId: a.campaignId,
          campaignName: a.campaign.name,
          sentAt: a.campaign.sentAt,
          recipientCount: a.campaign.recipientCount,
          deliveredCount: a.deliveredCount,
          openedCount: a.openedCount,
          clickedCount: a.clickedCount,
          deliveryRate: a.campaign.recipientCount > 0 ? (a.deliveredCount / a.campaign.recipientCount) * 100 : 0,
          openRate: a.deliveredCount > 0 ? (a.openedCount / a.deliveredCount) * 100 : 0,
          clickRate: a.openedCount > 0 ? (a.clickedCount / a.openedCount) * 100 : 0
        }))
      };
    } catch (error) {
      enhancedLogger.error('Error getting analytics', error);
      throw error;
    }
  }

  /**
   * Send messages via Facebook Messenger
   */
  private async sendMessagesViaMessenger(campaign: any, recipients: any[]) {
    let successCount = 0;
    let failedCount = 0;
    const results = [];

    for (const recipient of recipients) {
      try {
        // Prepare message with images if included
        const messageData: any = {
          text: campaign.message
        };

        if (campaign.includeImages && campaign.images.length > 0) {
          messageData.attachments = campaign.images.map((imageUrl: string) => ({
            type: 'image',
            payload: { url: imageUrl }
          }));
        }

        // Send via Facebook Messenger
        const result = await this.messengerService.sendMessage(
          recipient.messengerUserId,
          messageData,
          campaign.trackClicks
        );

        if (result.success) {
          successCount++;
          results.push({
            recipientId: recipient.id,
            status: 'sent',
            messageId: result.messageId
          });
        } else {
          failedCount++;
          results.push({
            recipientId: recipient.id,
            status: 'failed',
            error: result.error
          });
        }

        // Add delay to respect rate limits
        await this.delay(100); // 100ms delay between messages

      } catch (error) {
        failedCount++;
        results.push({
          recipientId: recipient.id,
          status: 'failed',
          error: error.message
        });
        
        enhancedLogger.error('Error sending message to recipient', {
          recipientId: recipient.id,
          error: error.message
        });
      }
    }

    return { successCount, failedCount, results };
  }

  /**
   * Get recipients based on target audience
   */
  private async getRecipients(targetAudience: string, companyId: string) {
    let whereClause: any = {
      companyId,
      customerPhone: { not: null },
      messengerUserId: { not: null } // Must have Messenger ID
    };

    switch (targetAudience) {
      case 'active_24h':
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        whereClause.lastMessageAt = { gte: last24Hours };
        break;
      case 'active_30d':
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        whereClause.lastMessageAt = { gte: last30Days };
        break;
      case 'all':
        // No additional filters
        break;
      case 'high_value':
        // Add high-value customer criteria
        break;
    }

    return await this.prisma.conversation.findMany({
      where: whereClause,
      select: {
        id: true,
        customerPhone: true,
        customerName: true,
        messengerUserId: true
      }
    });
  }

  /**
   * Get recipient count for target audience
   */
  private async getRecipientCount(targetAudience: string, companyId: string): Promise<number> {
    const recipients = await this.getRecipients(targetAudience, companyId);
    return recipients.length;
  }

  /**
   * Create campaign analytics record
   */
  private async createCampaignAnalytics(campaignId: string, sendResults: any) {
    await this.prisma.broadcastAnalytics.create({
      data: {
        campaignId,
        deliveredCount: sendResults.successCount,
        failedCount: sendResults.failedCount,
        openedCount: 0, // Will be updated when users open messages
        clickedCount: 0, // Will be updated when users click links
        createdAt: new Date()
      }
    });
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId: string, updateData: any, companyId: string) {
    const campaign = await this.prisma.broadcastCampaign.findFirst({
      where: { id: campaignId, companyId }
    });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    if (campaign.status === 'sent') {
      throw new ValidationError('Cannot update sent campaign');
    }

    return await this.prisma.broadcastCampaign.update({
      where: { id: campaignId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Cancel campaign
   */
  async cancelCampaign(campaignId: string, companyId: string) {
    const campaign = await this.prisma.broadcastCampaign.findFirst({
      where: { id: campaignId, companyId }
    });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    if (campaign.status === 'sent') {
      throw new ValidationError('Cannot cancel sent campaign');
    }

    return await this.prisma.broadcastCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    });
  }

  /**
   * Toggle pause campaign
   */
  async togglePauseCampaign(campaignId: string, companyId: string) {
    const campaign = await this.prisma.broadcastCampaign.findFirst({
      where: { id: campaignId, companyId }
    });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    if (campaign.status === 'sent') {
      throw new ValidationError('Cannot pause/resume sent campaign');
    }

    const newStatus = campaign.status === 'scheduled' ? 'paused' : 'scheduled';

    return await this.prisma.broadcastCampaign.update({
      where: { id: campaignId },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Get broadcast settings
   */
  async getSettings(companyId: string) {
    let settings = await this.prisma.broadcastSettings.findFirst({
      where: { companyId }
    });

    if (!settings) {
      // Create default settings
      settings = await this.prisma.broadcastSettings.create({
        data: {
          companyId,
          defaultSendTime: '10:00',
          timezone: 'Asia/Riyadh',
          maxRecipientsPerCampaign: 5000,
          maxCampaignsPerDay: 10,
          enableDeliveryReports: true,
          enableOpenTracking: true,
          enableClickTracking: true,
          messagesPerMinute: 60,
          messagesPerHour: 1000,
          messagesPerDay: 10000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return settings;
  }

  /**
   * Update broadcast settings
   */
  async updateSettings(companyId: string, updateData: any) {
    return await this.prisma.broadcastSettings.upsert({
      where: { companyId },
      update: {
        ...updateData,
        updatedAt: new Date()
      },
      create: {
        companyId,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  /**
   * Helper methods
   */
  private getPeriodDays(period: string): number {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
