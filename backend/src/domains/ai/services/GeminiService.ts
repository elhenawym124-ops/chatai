import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { enhancedLogger } from '../../../shared/utils/logger';
import { getPrismaClient } from '../../../config/database';
import { ValidationError } from '../../../shared/errors/AppError';

interface ConversationContext {
  customerId: string;
  customerName: string;
  customerHistory: string[];
  companyInfo: {
    name: string;
    industry: string;
    products: string[];
    policies: string[];
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

interface AIResponse {
  response: string;
  confidence: number;
  intent: string;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  suggestedActions: string[];
  requiresHumanIntervention: boolean;
}

interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  category: string;
}

/**
 * Google Gemini AI Service
 * 
 * Handles all AI-powered features including:
 * - Smart response generation
 * - Intent recognition
 * - Sentiment analysis
 * - Product recommendations
 * - Customer behavior analysis
 */
export class GeminiService {
  private prisma: PrismaClient;
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    this.prisma = getPrismaClient();
    // Initialize without API key - will be loaded dynamically
  }

  /**
   * Get active Gemini API key from database
   */
  private async getActiveGeminiKey(): Promise<{ apiKey: string; model: string } | null> {
    try {
      const activeKey = await this.prisma.geminiKey.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      if (activeKey) {
        return {
          apiKey: activeKey.apiKey,
          model: activeKey.model
        };
      }

      // لا يوجد fallback للـ environment variables
      // جميع مفاتيح Gemini يجب أن تُدار من واجهة الإدارة فقط

      return null;
    } catch (error) {
      console.error('Error getting Gemini key:', error);
      return null;
    }
  }

  /**
   * Generate smart response for customer message
   */
  async generateResponse(
    message: string,
    context: ConversationContext,
    companyId: string
  ): Promise<AIResponse> {
    try {
      // Get active Gemini key from database
      const geminiConfig = await this.getActiveGeminiKey();
      if (!geminiConfig) {
        throw new Error('No active Gemini API key found');
      }

      // Initialize Gemini with database key
      const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
      const model = genAI.getGenerativeModel({ model: geminiConfig.model });

      // Get company-specific prompt template
      const promptTemplate = await this.getCompanyPromptTemplate(companyId);

      // Build context-aware prompt
      const prompt = this.buildPrompt(message, context, promptTemplate);

      // Generate response using Gemini
      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      // Parse AI response
      const aiResponse = this.parseAIResponse(responseText);

      // Analyze intent and entities
      const intent = await this.analyzeIntent(message);
      const entities = await this.extractEntities(message);
      const sentiment = await this.analyzeSentiment(message);

      // Determine if human intervention is needed
      const requiresHumanIntervention = this.shouldEscalateToHuman(
        message,
        aiResponse,
        sentiment,
        context
      );

      // Log AI interaction
      await this.logAIInteraction(companyId, context.customerId, {
        userMessage: message,
        aiResponse: responseText,
        intent,
        sentiment,
        confidence: aiResponse.confidence,
        requiresHumanIntervention,
      });

      enhancedLogger.business('ai_response_generated', {
        companyId,
        customerId: context.customerId,
        intent,
        confidence: aiResponse.confidence,
        requiresHumanIntervention,
      });

      return {
        response: aiResponse.response,
        confidence: aiResponse.confidence,
        intent,
        entities,
        suggestedActions: aiResponse.suggestedActions,
        requiresHumanIntervention,
      };
    } catch (error: any) {
      enhancedLogger.error('Failed to generate AI response', error);
      throw error;
    }
  }

  /**
   * Analyze customer sentiment
   */
  async analyzeSentiment(message: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: string[];
  }> {
    try {
      const prompt = `
        Analyze the sentiment of this customer message and respond in JSON format:
        
        Message: "${message}"
        
        Provide:
        {
          "sentiment": "positive|negative|neutral",
          "confidence": 0.0-1.0,
          "emotions": ["happy", "frustrated", "confused", etc.]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } catch {
        return {
          sentiment: 'neutral',
          confidence: 0.5,
          emotions: [],
        };
      }
    } catch (error: any) {
      enhancedLogger.error('Failed to analyze sentiment', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        emotions: [],
      };
    }
  }

  /**
   * Analyze customer intent
   */
  async analyzeIntent(message: string): Promise<string> {
    try {
      const prompt = `
        Analyze the intent of this customer message. Choose from these categories:
        - inquiry (asking for information)
        - complaint (expressing dissatisfaction)
        - purchase (wanting to buy)
        - support (needing help)
        - compliment (expressing satisfaction)
        - other
        
        Message: "${message}"
        
        Respond with just the category name.
      `;

      const result = await this.model.generateContent(prompt);
      const intent = result.response.text().trim().toLowerCase();
      
      const validIntents = ['inquiry', 'complaint', 'purchase', 'support', 'compliment', 'other'];
      return validIntents.includes(intent) ? intent : 'other';
    } catch (error: any) {
      enhancedLogger.error('Failed to analyze intent', error);
      return 'other';
    }
  }

  /**
   * Extract entities from message
   */
  async extractEntities(message: string): Promise<Array<{
    type: string;
    value: string;
    confidence: number;
  }>> {
    try {
      const prompt = `
        Extract entities from this message and respond in JSON format:
        
        Message: "${message}"
        
        Look for:
        - product_name
        - price
        - quantity
        - date
        - location
        - person_name
        
        Format:
        [
          {
            "type": "product_name",
            "value": "iPhone 15",
            "confidence": 0.9
          }
        ]
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } catch {
        return [];
      }
    } catch (error: any) {
      enhancedLogger.error('Failed to extract entities', error);
      return [];
    }
  }

  /**
   * Generate product recommendations
   */
  async generateProductRecommendations(
    customerId: string,
    companyId: string,
    context?: string
  ): Promise<Array<{
    productId: string;
    productName: string;
    reason: string;
    confidence: number;
  }>> {
    try {
      // Get customer history
      const customer = await this.prisma.customer.findFirst({
        where: { id: customerId, companyId },
        include: {
          orders: {
            include: {
              items: {
                include: {
                  product: true,
                }
              }
            }
          }
        }
      });

      if (!customer) {
        return [];
      }

      // Get company products
      const products = await this.prisma.product.findMany({
        where: { companyId },
        take: 20,
      });

      // Build recommendation prompt
      const customerHistory = customer.orders.map(order => 
        order.items.map(item => item.product.name).join(', ')
      ).join('; ');

      const availableProducts = products.map(p => 
        `${p.name} - ${p.description} - ${p.price} SAR`
      ).join('\n');

      const prompt = `
        Based on customer purchase history and current context, recommend products:
        
        Customer History: ${customerHistory}
        Current Context: ${context || 'General recommendation'}
        
        Available Products:
        ${availableProducts}
        
        Provide 3-5 recommendations in JSON format:
        [
          {
            "productName": "Product Name",
            "reason": "Why this product fits the customer",
            "confidence": 0.0-1.0
          }
        ]
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        const recommendations = JSON.parse(response);
        return recommendations.map((rec: any) => {
          const product = products.find(p => p.name === rec.productName);
          return {
            productId: product?.id || '',
            productName: rec.productName,
            reason: rec.reason,
            confidence: rec.confidence,
          };
        }).filter((rec: any) => rec.productId);
      } catch {
        return [];
      }
    } catch (error: any) {
      enhancedLogger.error('Failed to generate product recommendations', error);
      return [];
    }
  }

  /**
   * Get company-specific prompt template
   */
  private async getCompanyPromptTemplate(companyId: string): Promise<string> {
    try {
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
        include: {
          aiSettings: true,
        }
      });

      if (company?.aiSettings?.promptTemplate) {
        return company.aiSettings.promptTemplate;
      }

      // Default prompt template
      return `
        You are a helpful customer service assistant for ${company?.name || 'our company'}.
        
        Guidelines:
        - Be polite and professional
        - Provide accurate information
        - If you don't know something, say so
        - Offer to connect with a human agent when needed
        - Use Arabic language primarily
        - Keep responses concise but helpful
        
        Customer Context: {context}
        Customer Message: {message}
        
        Respond helpfully and professionally.
      `;
    } catch (error: any) {
      enhancedLogger.error('Failed to get prompt template', error);
      return 'You are a helpful customer service assistant. Respond professionally to: {message}';
    }
  }

  /**
   * Build context-aware prompt
   */
  private buildPrompt(
    message: string,
    context: ConversationContext,
    template: string
  ): string {
    const contextString = `
      Customer: ${context.customerName}
      Company: ${context.companyInfo.name}
      Previous messages: ${context.conversationHistory.slice(-5).map(h => 
        `${h.role}: ${h.content}`
      ).join('\n')}
      Products: ${context.companyInfo.products.join(', ')}
    `;

    return template
      .replace('{context}', contextString)
      .replace('{message}', message)
      .replace('{customer_name}', context.customerName)
      .replace('{company_name}', context.companyInfo.name);
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(response: string): {
    response: string;
    confidence: number;
    suggestedActions: string[];
  } {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return {
        response: parsed.response || response,
        confidence: parsed.confidence || 0.8,
        suggestedActions: parsed.suggestedActions || [],
      };
    } catch {
      // If not JSON, treat as plain text
      return {
        response: response,
        confidence: 0.8,
        suggestedActions: [],
      };
    }
  }

  /**
   * Determine if human intervention is needed
   */
  private shouldEscalateToHuman(
    message: string,
    aiResponse: any,
    sentiment: any,
    context: ConversationContext
  ): boolean {
    // Escalate if sentiment is very negative
    if (sentiment.sentiment === 'negative' && sentiment.confidence > 0.8) {
      return true;
    }

    // Escalate if AI confidence is low
    if (aiResponse.confidence < 0.6) {
      return true;
    }

    // Escalate if customer explicitly asks for human
    const humanKeywords = ['human', 'person', 'manager', 'supervisor', 'إنسان', 'مدير', 'مشرف'];
    if (humanKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      return true;
    }

    // Escalate if conversation is too long without resolution
    if (context.conversationHistory.length > 10) {
      return true;
    }

    return false;
  }

  /**
   * Log AI interaction
   */
  private async logAIInteraction(
    companyId: string,
    customerId: string,
    interaction: any
  ): Promise<void> {
    try {
      await this.prisma.aiInteraction.create({
        data: {
          companyId,
          customerId,
          userMessage: interaction.userMessage,
          aiResponse: interaction.aiResponse,
          intent: interaction.intent,
          sentiment: interaction.sentiment,
          confidence: interaction.confidence,
          requiresHumanIntervention: interaction.requiresHumanIntervention,
          metadata: JSON.stringify(interaction),
        },
      });
    } catch (error: any) {
      enhancedLogger.error('Failed to log AI interaction', error);
    }
  }

  /**
   * Update company AI settings
   */
  async updateCompanyAISettings(
    companyId: string,
    settings: {
      promptTemplate?: string;
      autoReplyEnabled?: boolean;
      confidenceThreshold?: number;
      escalationRules?: any;
    }
  ): Promise<any> {
    try {
      const aiSettings = await this.prisma.aiSettings.upsert({
        where: { companyId },
        update: settings,
        create: {
          companyId,
          ...settings,
        },
      });

      enhancedLogger.business('ai_settings_updated', {
        companyId,
        settings: Object.keys(settings),
      });

      return aiSettings;
    } catch (error: any) {
      enhancedLogger.error('Failed to update AI settings', error);
      throw error;
    }
  }

  /**
   * Get AI analytics for company
   */
  async getAIAnalytics(companyId: string, dateFrom?: Date, dateTo?: Date): Promise<any> {
    try {
      const where: any = { companyId };
      
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const [
        totalInteractions,
        avgConfidence,
        intentDistribution,
        sentimentDistribution,
        escalationRate
      ] = await Promise.all([
        this.prisma.aiInteraction.count({ where }),
        this.prisma.aiInteraction.aggregate({
          where,
          _avg: { confidence: true }
        }),
        this.prisma.aiInteraction.groupBy({
          by: ['intent'],
          where,
          _count: true,
        }),
        this.prisma.aiInteraction.groupBy({
          by: ['sentiment'],
          where,
          _count: true,
        }),
        this.prisma.aiInteraction.count({
          where: { ...where, requiresHumanIntervention: true }
        })
      ]);

      return {
        totalInteractions,
        averageConfidence: avgConfidence._avg.confidence || 0,
        escalationRate: totalInteractions > 0 ? (escalationRate / totalInteractions) * 100 : 0,
        intentDistribution: intentDistribution.map(item => ({
          intent: item.intent,
          count: item._count,
          percentage: totalInteractions > 0 ? (item._count / totalInteractions) * 100 : 0,
        })),
        sentimentDistribution: sentimentDistribution.map(item => ({
          sentiment: item.sentiment,
          count: item._count,
          percentage: totalInteractions > 0 ? (item._count / totalInteractions) * 100 : 0,
        })),
      };
    } catch (error: any) {
      enhancedLogger.error('Failed to get AI analytics', error);
      throw error;
    }
  }
}
