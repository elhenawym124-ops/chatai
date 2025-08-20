import axios from 'axios';
import { enhancedLogger } from '../utils/logger';

interface MessengerMessage {
  text?: string;
  attachments?: Array<{
    type: 'image' | 'video' | 'audio' | 'file';
    payload: {
      url: string;
      is_reusable?: boolean;
    };
  }>;
}

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class FacebookMessengerService {
  private pageAccessToken: string;
  private apiVersion: string = 'v18.0';
  private baseUrl: string;

  constructor() {
    this.pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    
    if (!this.pageAccessToken) {
      enhancedLogger.warn('Facebook Page Access Token not configured');
    }
  }

  /**
   * Send message to a user via Facebook Messenger
   */
  async sendMessage(
    recipientId: string, 
    message: MessengerMessage, 
    trackClicks: boolean = true
  ): Promise<SendMessageResult> {
    try {
      if (!this.pageAccessToken) {
        throw new Error('Facebook Page Access Token not configured');
      }

      const messageData: any = {
        recipient: {
          id: recipientId
        },
        message: {}
      };

      // Add text message
      if (message.text) {
        messageData.message.text = message.text;
      }

      // Add attachments (images, etc.)
      if (message.attachments && message.attachments.length > 0) {
        if (message.attachments.length === 1) {
          messageData.message.attachment = message.attachments[0];
        } else {
          // For multiple attachments, send as template
          messageData.message.attachment = {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: message.attachments.map((attachment, index) => ({
                title: `صورة ${index + 1}`,
                image_url: attachment.payload.url
              }))
            }
          };
        }
      }

      // Add quick replies for tracking if needed
      if (trackClicks) {
        messageData.message.quick_replies = [
          {
            content_type: 'text',
            title: '👍 أعجبني',
            payload: 'BROADCAST_LIKE'
          },
          {
            content_type: 'text',
            title: '📞 تواصل معنا',
            payload: 'BROADCAST_CONTACT'
          }
        ];
      }

      const response = await axios.post(
        `${this.baseUrl}/me/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.pageAccessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        }
      );

      if (response.data && response.data.message_id) {
        enhancedLogger.info('Message sent successfully via Messenger', {
          recipientId,
          messageId: response.data.message_id
        });

        return {
          success: true,
          messageId: response.data.message_id
        };
      } else {
        throw new Error('Invalid response from Facebook API');
      }

    } catch (error: any) {
      enhancedLogger.error('Error sending Messenger message', {
        recipientId,
        error: error.message,
        response: error.response?.data
      });

      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Send broadcast message to multiple recipients
   */
  async sendBroadcastMessage(
    recipientIds: string[],
    message: MessengerMessage,
    trackClicks: boolean = true
  ): Promise<{
    successCount: number;
    failedCount: number;
    results: Array<{ recipientId: string; success: boolean; messageId?: string; error?: string }>;
  }> {
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    // Send messages with rate limiting
    for (let i = 0; i < recipientIds.length; i++) {
      const recipientId = recipientIds[i];
      
      try {
        const result = await this.sendMessage(recipientId, message, trackClicks);
        
        if (result.success) {
          successCount++;
          results.push({
            recipientId,
            success: true,
            messageId: result.messageId
          });
        } else {
          failedCount++;
          results.push({
            recipientId,
            success: false,
            error: result.error
          });
        }

        // Rate limiting: 600 messages per minute (10 per second)
        if (i < recipientIds.length - 1) {
          await this.delay(100); // 100ms delay between messages
        }

      } catch (error: any) {
        failedCount++;
        results.push({
          recipientId,
          success: false,
          error: error.message
        });
      }
    }

    enhancedLogger.business('broadcast_messages_sent', {
      totalRecipients: recipientIds.length,
      successCount,
      failedCount
    });

    return { successCount, failedCount, results };
  }

  /**
   * Get user profile information
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      if (!this.pageAccessToken) {
        throw new Error('Facebook Page Access Token not configured');
      }

      const response = await axios.get(
        `${this.baseUrl}/${userId}`,
        {
          params: {
            fields: 'first_name,last_name,profile_pic,locale,timezone,gender',
            access_token: this.pageAccessToken
          },
          timeout: 5000
        }
      );

      return response.data;
    } catch (error: any) {
      enhancedLogger.error('Error getting user profile', {
        userId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Set up webhook for receiving messages and tracking
   */
  async setupWebhook(webhookUrl: string, verifyToken: string): Promise<boolean> {
    try {
      if (!this.pageAccessToken) {
        throw new Error('Facebook Page Access Token not configured');
      }

      const response = await axios.post(
        `${this.baseUrl}/me/subscribed_apps`,
        {
          subscribed_fields: [
            'messages',
            'messaging_postbacks',
            'messaging_optins',
            'message_deliveries',
            'message_reads'
          ].join(',')
        },
        {
          headers: {
            'Authorization': `Bearer ${this.pageAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      enhancedLogger.info('Webhook setup completed', {
        webhookUrl,
        response: response.data
      });

      return true;
    } catch (error: any) {
      enhancedLogger.error('Error setting up webhook', {
        error: error.message,
        response: error.response?.data
      });
      return false;
    }
  }

  /**
   * Handle webhook events (message delivery, read receipts, etc.)
   */
  async handleWebhookEvent(event: any): Promise<void> {
    try {
      if (event.object === 'page') {
        for (const entry of event.entry) {
          if (entry.messaging) {
            for (const messagingEvent of entry.messaging) {
              await this.processMessagingEvent(messagingEvent);
            }
          }
        }
      }
    } catch (error: any) {
      enhancedLogger.error('Error handling webhook event', {
        error: error.message,
        event
      });
    }
  }

  /**
   * Process individual messaging events
   */
  private async processMessagingEvent(event: any): Promise<void> {
    const senderId = event.sender?.id;
    const recipientId = event.recipient?.id;
    const timestamp = event.timestamp;

    // Handle message delivery
    if (event.delivery) {
      await this.handleMessageDelivery(event.delivery, senderId);
    }

    // Handle message read
    if (event.read) {
      await this.handleMessageRead(event.read, senderId);
    }

    // Handle postback (button clicks)
    if (event.postback) {
      await this.handlePostback(event.postback, senderId);
    }

    // Handle quick reply
    if (event.message?.quick_reply) {
      await this.handleQuickReply(event.message.quick_reply, senderId);
    }

    // Handle regular message (for tracking engagement)
    if (event.message && !event.message.quick_reply) {
      await this.handleIncomingMessage(event.message, senderId);
    }
  }

  /**
   * Handle message delivery confirmation
   */
  private async handleMessageDelivery(delivery: any, senderId: string): Promise<void> {
    try {
      // Update broadcast analytics for delivered messages
      const messageIds = delivery.mids || [];
      
      for (const messageId of messageIds) {
        // Update delivery status in database
        // This would connect to your broadcast analytics
        enhancedLogger.info('Message delivered', {
          messageId,
          senderId,
          deliveredAt: new Date(delivery.watermark)
        });
      }
    } catch (error: any) {
      enhancedLogger.error('Error handling message delivery', error);
    }
  }

  /**
   * Handle message read confirmation
   */
  private async handleMessageRead(read: any, senderId: string): Promise<void> {
    try {
      // Update broadcast analytics for read messages
      enhancedLogger.info('Message read', {
        senderId,
        readAt: new Date(read.watermark)
      });

      // Update open rate in broadcast analytics
      // This would connect to your broadcast analytics database
    } catch (error: any) {
      enhancedLogger.error('Error handling message read', error);
    }
  }

  /**
   * Handle postback (button clicks)
   */
  private async handlePostback(postback: any, senderId: string): Promise<void> {
    try {
      const payload = postback.payload;
      
      enhancedLogger.info('Postback received', {
        senderId,
        payload,
        title: postback.title
      });

      // Track click events for broadcast analytics
      if (payload.startsWith('BROADCAST_')) {
        // Update click rate in broadcast analytics
        // This would connect to your broadcast analytics database
      }
    } catch (error: any) {
      enhancedLogger.error('Error handling postback', error);
    }
  }

  /**
   * Handle quick reply
   */
  private async handleQuickReply(quickReply: any, senderId: string): Promise<void> {
    try {
      const payload = quickReply.payload;
      
      enhancedLogger.info('Quick reply received', {
        senderId,
        payload
      });

      // Track engagement for broadcast analytics
      if (payload.startsWith('BROADCAST_')) {
        // Update engagement metrics
        // This would connect to your broadcast analytics database
      }
    } catch (error: any) {
      enhancedLogger.error('Error handling quick reply', error);
    }
  }

  /**
   * Handle incoming message (for engagement tracking)
   */
  private async handleIncomingMessage(message: any, senderId: string): Promise<void> {
    try {
      enhancedLogger.info('Incoming message received', {
        senderId,
        messageId: message.mid,
        text: message.text?.substring(0, 100) // Log first 100 chars only
      });

      // Update last activity for customer segmentation
      // This would update the conversation record in your database
    } catch (error: any) {
      enhancedLogger.error('Error handling incoming message', error);
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const appSecret = process.env.FACEBOOK_APP_SECRET || '';
      
      if (!appSecret) {
        enhancedLogger.warn('Facebook App Secret not configured');
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha1', appSecret)
        .update(payload)
        .digest('hex');

      return signature === `sha1=${expectedSignature}`;
    } catch (error: any) {
      enhancedLogger.error('Error validating webhook signature', error);
      return false;
    }
  }

  /**
   * Get page information
   */
  async getPageInfo(): Promise<any> {
    try {
      if (!this.pageAccessToken) {
        throw new Error('Facebook Page Access Token not configured');
      }

      const response = await axios.get(
        `${this.baseUrl}/me`,
        {
          params: {
            fields: 'name,id,category,about,phone,emails,website',
            access_token: this.pageAccessToken
          }
        }
      );

      return response.data;
    } catch (error: any) {
      enhancedLogger.error('Error getting page info', error);
      return null;
    }
  }

  /**
   * Helper method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return !!this.pageAccessToken;
  }

  /**
   * Get configuration status
   */
  getConfigurationStatus(): {
    configured: boolean;
    hasPageToken: boolean;
    hasAppSecret: boolean;
  } {
    return {
      configured: this.isConfigured(),
      hasPageToken: !!this.pageAccessToken,
      hasAppSecret: !!process.env.FACEBOOK_APP_SECRET
    };
  }
}
