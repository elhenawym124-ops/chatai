import axios, { AxiosInstance } from 'axios';
import { PrismaClient } from '@prisma/client';
import { enhancedLogger } from '../../../shared/utils/logger';
import { getPrismaClient } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  tasks: string[];
}

interface FacebookMessage {
  id: string;
  created_time: string;
  from: {
    id: string;
    name: string;
  };
  to: {
    data: Array<{
      id: string;
      name: string;
    }>;
  };
  message: string;
  attachments?: {
    data: Array<{
      type: string;
      payload: {
        url: string;
      };
    }>;
  };
}

interface WebhookEntry {
  id: string;
  time: number;
  messaging: Array<{
    sender: { id: string };
    recipient: { id: string };
    timestamp: number;
    message?: {
      mid: string;
      text: string;
      attachments?: Array<{
        type: string;
        payload: {
          url: string;
        };
      }>;
    };
    delivery?: {
      mids: string[];
      watermark: number;
    };
    read?: {
      watermark: number;
    };
  }>;
}

/**
 * Facebook Messenger Integration Service
 * 
 * Handles all Facebook Graph API interactions including:
 * - Page management and authentication
 * - Sending and receiving messages
 * - Webhook handling
 * - Media attachments
 */
export class FacebookService {
  private prisma: PrismaClient;
  private graphAPI: AxiosInstance;
  private readonly GRAPH_API_VERSION = 'v18.0';
  private readonly GRAPH_API_BASE_URL = `https://graph.facebook.com/${this.GRAPH_API_VERSION}`;

  constructor() {
    this.prisma = getPrismaClient();
    this.graphAPI = axios.create({
      baseURL: this.GRAPH_API_BASE_URL,
      timeout: 10000,
    });
  }

  /**
   * Get user's Facebook pages
   */
  async getUserPages(userAccessToken: string): Promise<FacebookPage[]> {
    try {
      const response = await this.graphAPI.get('/me/accounts', {
        params: {
          access_token: userAccessToken,
          fields: 'id,name,access_token,category,tasks',
        },
      });

      enhancedLogger.info('Retrieved Facebook pages', {
        pagesCount: response.data.data.length,
      });

      return response.data.data;
    } catch (error: any) {
      enhancedLogger.error('Failed to get Facebook pages', error);
      throw new Error('Failed to retrieve Facebook pages');
    }
  }

  /**
   * Connect Facebook page to company
   */
  async connectPage(companyId: string, pageId: string, pageAccessToken: string, pageName: string): Promise<any> {
    try {
      // Verify page access token
      const pageInfo = await this.getPageInfo(pageId, pageAccessToken);

      // Save to FacebookPage table
      const facebookPage = await this.prisma.facebookPage.upsert({
        where: {
          pageId: pageId,
        },
        update: {
          pageAccessToken: pageAccessToken,
          pageName: pageInfo.name,
          companyId: companyId,
          status: 'connected',
          connectedAt: new Date(),
        },
        create: {
          pageId: pageId,
          pageAccessToken: pageAccessToken,
          pageName: pageInfo.name,
          companyId: companyId,
          status: 'connected',
          connectedAt: new Date(),
        },
      });

      // Also save to integrations table for backward compatibility
      const integration = await this.prisma.integration.upsert({
        where: {
          companyId_platform_externalId: {
            companyId,
            platform: 'FACEBOOK',
            externalId: pageId,
          },
        },
        update: {
          accessToken: pageAccessToken,
          settings: JSON.stringify({
            pageName: pageInfo.name,
            category: pageInfo.category,
            connectedAt: new Date().toISOString(),
          }),
          status: 'ACTIVE',
        },
        create: {
          companyId,
          platform: 'FACEBOOK',
          externalId: pageId,
          accessToken: pageAccessToken,
          name: pageInfo.name,
          type: 'SOCIAL_MEDIA',
          config: JSON.stringify({
            pageName: pageInfo.name,
            category: pageInfo.category,
            connectedAt: new Date().toISOString(),
          }),
          settings: JSON.stringify({
            pageName: pageInfo.name,
            category: pageInfo.category,
            connectedAt: new Date().toISOString(),
          }),
          status: 'ACTIVE',
        } as any,
      });

      // Subscribe to page webhooks
      await this.subscribeToWebhooks(pageId, pageAccessToken);

      enhancedLogger.business('facebook_page_connected', {
        companyId,
        pageId,
        pageName: pageInfo.name,
      });

      return {
        ...facebookPage,
        integration,
      };
    } catch (error: any) {
      enhancedLogger.error('Failed to connect Facebook page', error);
      throw error;
    }
  }

  /**
   * Get page information
   */
  async getPageInfo(pageId: string, pageAccessToken: string): Promise<any> {
    try {
      // If pageId is 'me', get page info from the token
      const endpoint = pageId === 'me' ? '/me' : `/${pageId}`;

      const response = await this.graphAPI.get(endpoint, {
        params: {
          access_token: pageAccessToken,
          fields: 'id,name,category,picture',
        },
      });

      return response.data;
    } catch (error: any) {
      enhancedLogger.error('Failed to get page info', error);
      throw new Error('Failed to get page information');
    }
  }

  /**
   * Subscribe to page webhooks
   */
  async subscribeToWebhooks(pageId: string, pageAccessToken: string): Promise<void> {
    try {
      await this.graphAPI.post(`/${pageId}/subscribed_apps`, {
        access_token: pageAccessToken,
        subscribed_fields: 'messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads,message_attachments',
      });

      enhancedLogger.info('Subscribed to Facebook webhooks', { pageId });
    } catch (error: any) {
      enhancedLogger.error('Failed to subscribe to webhooks', error);
      throw new Error('Failed to subscribe to webhooks');
    }
  }

  /**
   * Send message to Facebook user
   */
  async sendMessage(
    pageId: string,
    recipientId: string,
    message: string,
    companyId: string,
    messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'
  ): Promise<any> {
    try {
      // Get page access token from FacebookPage table first
      let facebookPage = await this.prisma.facebookPage.findFirst({
        where: {
          pageId,
          companyId,
          status: 'connected',
        },
      });

      let accessToken: string;

      if (facebookPage) {
        accessToken = facebookPage.pageAccessToken;
      } else {
        // Fallback to integrations table
        const integration = await this.prisma.integration.findFirst({
          where: {
            companyId,
            platform: 'FACEBOOK',
            externalId: pageId,
            status: 'ACTIVE',
          },
        });

        if (!integration) {
          throw new NotFoundError('Facebook page integration not found');
        }

        accessToken = integration.accessToken!;
      }

      const messageData: any = {
        recipient: { id: recipientId },
        message: {},
      };

      if (messageType === 'TEXT') {
        messageData.message.text = message;
      } else if (messageType === 'IMAGE') {
        messageData.message.attachment = {
          type: 'image',
          payload: { url: message },
        };
      } else if (messageType === 'FILE') {
        messageData.message.attachment = {
          type: 'file',
          payload: { url: message },
        };
      }

      const response = await this.graphAPI.post(`/${pageId}/messages`, messageData, {
        params: {
          access_token: accessToken,
        },
      });

      enhancedLogger.business('facebook_message_sent', {
        pageId,
        recipientId,
        messageId: response.data.message_id,
        messageType,
      });

      return response.data;
    } catch (error: any) {
      enhancedLogger.error('Failed to send Facebook message', error);
      throw error;
    }
  }

  /**
   * Process incoming webhook
   */
  async processWebhook(webhookData: any): Promise<void> {
    try {
      if (webhookData.object !== 'page') {
        return;
      }

      for (const entry of webhookData.entry) {
        await this.processWebhookEntry(entry);
      }
    } catch (error: any) {
      enhancedLogger.error('Failed to process webhook', error);
      throw error;
    }
  }

  /**
   * Process single webhook entry
   */
  private async processWebhookEntry(entry: WebhookEntry): Promise<void> {
    try {
      const pageId = entry.id;

      // Find Facebook page first
      let facebookPage = await this.prisma.facebookPage.findFirst({
        where: {
          pageId,
          status: 'connected',
        },
        include: {
          company: true,
        },
      });

      let integration: any = null;

      if (facebookPage) {
        integration = {
          companyId: facebookPage.companyId,
          accessToken: facebookPage.pageAccessToken,
          company: facebookPage.company,
        };
      } else {
        // Fallback to integrations table
        integration = await this.prisma.integration.findFirst({
          where: {
            platform: 'FACEBOOK',
            externalId: pageId,
            status: 'ACTIVE',
          },
          include: {
            company: true,
          },
        });
      }

      if (!integration) {
        enhancedLogger.warn('No integration found for page', { pageId });
        return;
      }

      for (const messaging of entry.messaging) {
        if (messaging.message) {
          await this.processIncomingMessage(messaging, integration);
        } else if (messaging.delivery) {
          await this.processDeliveryReceipt(messaging, integration);
        } else if (messaging.read) {
          await this.processReadReceipt(messaging, integration);
        }
      }
    } catch (error: any) {
      enhancedLogger.error('Failed to process webhook entry', error);
    }
  }

  /**
   * Process incoming message
   */
  private async processIncomingMessage(messaging: any, integration: any): Promise<void> {
    try {
      const senderId = messaging.sender.id;
      const messageText = messaging.message.text || '';
      const messageId = messaging.message.mid;
      const timestamp = new Date(messaging.timestamp);

      // Find or create customer
      let customer = await this.prisma.customer.findFirst({
        where: {
          companyId: integration.companyId,
          facebookId: senderId,
        },
      });

      if (!customer) {
        // Get user info from Facebook
        const userInfo = await this.getUserInfo(senderId, integration.accessToken);
        
        customer = await this.prisma.customer.create({
          data: {
            firstName: userInfo.first_name || 'Facebook',
            lastName: userInfo.last_name || 'User',
            facebookId: senderId,
            companyId: integration.companyId,
            source: 'facebook',
            status: 'LEAD',
          } as any,
        });
      }

      // Find or create conversation
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          companyId: integration.companyId,
          // participants: {
          //   some: {
          //     customerId: customer.id,
          //   },
          // },
          channel: 'FACEBOOK',
          // status: { not: 'CLOSED' },
        } as any,
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            title: `Facebook - ${customer.firstName} ${customer.lastName}`,
            channel: 'FACEBOOK',
            status: 'OPEN',
            priority: 1,
            companyId: integration.companyId,
            // participants: {
            //   create: {
            //     customerId: customer.id,
            //     role: 'CUSTOMER',
            //   },
            // },
          } as any,
        });
      }

      // Create message
      await this.prisma.message.create({
        data: {
          content: messageText,
          type: 'TEXT',
          // direction: 'INBOUND',
          // externalId: messageId,
          conversationId: conversation.id,
          senderId: customer.id,
          senderType: 'CUSTOMER',
          metadata: JSON.stringify({
            platform: 'facebook',
            timestamp: messaging.timestamp,
            attachments: messaging.message.attachments || [],
          }),
        } as any,
      });

      // Update conversation timestamp
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: timestamp },
      });

      enhancedLogger.business('facebook_message_received', {
        customerId: customer.id,
        conversationId: conversation.id,
        messageId,
        companyId: integration.companyId,
      });
    } catch (error: any) {
      enhancedLogger.error('Failed to process incoming message', error);
    }
  }

  /**
   * Process delivery receipt
   */
  private async processDeliveryReceipt(messaging: any, integration: any): Promise<void> {
    try {
      const messageIds = messaging.delivery.mids;
      
      for (const messageId of messageIds) {
        await this.prisma.message.updateMany({
          where: {
            // externalId: messageId,
            conversation: {
              companyId: integration.companyId,
            },
          } as any,
          data: {
            // status: 'DELIVERED',
          } as any,
        });
      }

      enhancedLogger.info('Processed delivery receipts', {
        messageIds,
        companyId: integration.companyId,
      });
    } catch (error: any) {
      enhancedLogger.error('Failed to process delivery receipt', error);
    }
  }

  /**
   * Process read receipt
   */
  private async processReadReceipt(messaging: any, integration: any): Promise<void> {
    try {
      const watermark = messaging.read.watermark;
      
      await this.prisma.message.updateMany({
        where: {
          conversation: {
            companyId: integration.companyId,
          },
          createdAt: {
            lte: new Date(watermark),
          },
          // direction: 'OUTBOUND',
          // status: { not: 'READ' },
        } as any,
        data: {
          // status: 'READ',
        } as any,
      });

      enhancedLogger.info('Processed read receipt', {
        watermark,
        companyId: integration.companyId,
      });
    } catch (error: any) {
      enhancedLogger.error('Failed to process read receipt', error);
    }
  }

  /**
   * Get user information from Facebook
   */
  private async getUserInfo(userId: string, pageAccessToken: string): Promise<any> {
    try {
      const response = await this.graphAPI.get(`/${userId}`, {
        params: {
          access_token: pageAccessToken,
          fields: 'first_name,last_name,profile_pic',
        },
      });

      return response.data;
    } catch (error: any) {
      enhancedLogger.error('Failed to get user info', error);
      return {
        first_name: 'Facebook',
        last_name: 'User',
      };
    }
  }

  /**
   * Disconnect Facebook page
   */
  async disconnectPage(companyId: string, pageId: string): Promise<void> {
    try {
      await this.prisma.integration.updateMany({
        where: {
          companyId,
          platform: 'FACEBOOK',
          externalId: pageId,
        },
        data: {
          status: 'INACTIVE',
        },
      });

      enhancedLogger.business('facebook_page_disconnected', {
        companyId,
        pageId,
      });
    } catch (error: any) {
      enhancedLogger.error('Failed to disconnect Facebook page', error);
      throw error;
    }
  }

  /**
   * Get connected pages for company
   */
  async getConnectedPages(companyId: string): Promise<any[]> {
    try {
      // Get from FacebookPage table first
      const facebookPages = await this.prisma.facebookPage.findMany({
        where: {
          companyId,
          status: 'connected',
        },
        include: {
          company: true,
        },
      });

      if (facebookPages.length > 0) {
        return facebookPages.map(page => ({
          pageId: page.pageId,
          pageName: page.pageName,
          pageAccessToken: page.pageAccessToken,
          status: page.status,
          connectedAt: page.connectedAt,
        }));
      }

      // Fallback to integrations table for backward compatibility
      const integrations = await this.prisma.integration.findMany({
        where: {
          companyId,
          platform: 'FACEBOOK',
          status: 'ACTIVE',
        },
      });

      return integrations.map(integration => ({
        pageId: integration.externalId,
        pageName: integration.settings ? JSON.parse(integration.settings).pageName : 'Unknown',
        pageAccessToken: integration.accessToken,
        status: integration.status,
        connectedAt: integration.createdAt,
      }));
    } catch (error: any) {
      enhancedLogger.error('Failed to get connected pages', error);
      throw error;
    }
  }
}
