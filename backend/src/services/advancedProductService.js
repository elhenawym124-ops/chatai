/**
 * Advanced Product AI Service
 * 
 * Handles product recommendations, image analysis, and order creation
 */

const { getSharedPrismaClient } = require('./sharedDatabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AdvancedProductService {
  constructor() {
    this.prisma = getSharedPrismaClient();
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  }

  /**
   * Find the best matching product for a given name
   */
  findBestProductMatch(recName, products) {
    if (!recName || !products || products.length === 0) return null;

    const cleanRecName = recName.toLowerCase().trim();

    // Try exact match first
    let match = products.find(p => p.name.toLowerCase() === cleanRecName);
    if (match) return match;

    // Try contains match
    match = products.find(p =>
      p.name.toLowerCase().includes(cleanRecName) ||
      cleanRecName.includes(p.name.toLowerCase())
    );
    if (match) return match;

    // Try keyword matching with scoring
    const keywords = cleanRecName.split(' ').filter(k => k.length > 2);
    let bestMatch = null;
    let bestScore = 0;

    products.forEach(product => {
      let score = 0;
      const productName = product.name.toLowerCase();
      const productDesc = (product.description || '').toLowerCase();

      keywords.forEach(keyword => {
        if (productName.includes(keyword)) score += 3;
        if (productDesc.includes(keyword)) score += 1;
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = product;
      }
    });

    // Only return if we have a reasonable score
    return bestScore > 0 ? bestMatch : null;
  }

  /**
   * Get AI settings for products
   */
  async getProductAiSettings(companyId) {
    try {
      const aiSettings = await this.prisma.aiSettings.findUnique({
        where: { companyId },
        include: {
          company: {
            include: {
              products: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });

      if (!aiSettings) {
        return {
          success: false,
          error: 'إعدادات الذكاء الاصطناعي غير موجودة'
        };
      }

      const defaultProduct = aiSettings.defaultProductId 
        ? aiSettings.company.products.find(p => p.id === aiSettings.defaultProductId)
        : null;

      return {
        success: true,
        data: {
          defaultProductId: aiSettings.defaultProductId,
          defaultProduct,
          autoSuggestProducts: aiSettings.autoSuggestProducts,
          maxSuggestions: aiSettings.maxSuggestions,
          includeImages: aiSettings.includeImages,
          autoCreateOrders: aiSettings.autoCreateOrders,
          products: aiSettings.company.products
        }
      };
    } catch (error) {
      console.error('Error getting product AI settings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update product AI settings
   */
  async updateProductAiSettings(companyId, settings) {
    try {
      const {
        defaultProductId,
        autoSuggestProducts,
        maxSuggestions,
        includeImages,
        autoCreateOrders
      } = settings;

      // Check if company exists first
      const company = await this.prisma.company.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        return {
          success: false,
          error: 'الشركة غير موجودة'
        };
      }

      const aiSettings = await this.prisma.aiSettings.upsert({
        where: { companyId },
        update: {
          defaultProductId: defaultProductId || null,
          autoSuggestProducts: autoSuggestProducts !== undefined ? autoSuggestProducts : true,
          maxSuggestions: maxSuggestions || 3,
          includeImages: includeImages !== undefined ? includeImages : true,
          autoCreateOrders: autoCreateOrders !== undefined ? autoCreateOrders : false,
          updatedAt: new Date()
        },
        create: {
          companyId,
          defaultProductId: defaultProductId || null,
          autoSuggestProducts: autoSuggestProducts !== undefined ? autoSuggestProducts : true,
          maxSuggestions: maxSuggestions || 3,
          includeImages: includeImages !== undefined ? includeImages : true,
          autoCreateOrders: autoCreateOrders !== undefined ? autoCreateOrders : false,
          autoReplyEnabled: false,
          confidenceThreshold: 0.7,
          personalityPrompt: null,
          responsePrompt: null,
          escalationRules: '{}',
          modelSettings: '{}'
        }
      });

      return {
        success: true,
        data: aiSettings,
        message: 'تم تحديث إعدادات المنتجات بنجاح'
      };
    } catch (error) {
      console.error('Error updating product AI settings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Recommend products based on customer message
   */
  async recommendProducts(companyId, customerMessage, customerId = null) {
    try {
      console.log('🔍 Starting product recommendation for:', customerMessage);

      const settings = await this.getProductAiSettings(companyId);

      if (!settings.success || !settings.data.autoSuggestProducts) {
        console.log('⚠️ Product suggestions disabled');
        return {
          success: false,
          error: 'اقتراح المنتجات غير مفعل'
        };
      }

      const { products, maxSuggestions, defaultProduct } = settings.data;

      if (!products || products.length === 0) {
        console.log('⚠️ No products available');
        return {
          success: false,
          error: 'لا توجد منتجات متاحة'
        };
      }

      console.log(`📦 Found ${products.length} products to analyze`);

      // Get customer history if available
      let customerHistory = '';
      if (customerId) {
        const customer = await this.prisma.customer.findUnique({
          where: { id: customerId },
          include: {
            orders: {
              include: {
                items: {
                  include: {
                    product: true
                  }
                }
              },
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          }
        });

        if (customer && customer.orders.length > 0) {
          const purchasedProducts = customer.orders
            .flatMap(order => order.items)
            .map(item => item.product?.name || 'منتج غير معروف');
          customerHistory = `المنتجات التي اشتراها العميل سابقاً: ${purchasedProducts.join(', ')}`;
        }
      }

      // Build AI prompt for product recommendation
      const prompt = `
أنت خبير في اقتراح المنتجات. بناءً على رسالة العميل التالية، اقترح أفضل المنتجات المناسبة من القائمة المتاحة.

رسالة العميل: "${customerMessage}"

${customerHistory}

المنتجات المتاحة:
${products.map(p => `- ${p.name}: ${p.description || 'لا يوجد وصف'} - السعر: ${p.price} جنيه`).join('\n')}

${defaultProduct ? `المنتج الافتراضي (اقترحه إذا لم تكن متأكد): ${defaultProduct.name}` : ''}

اقترح حتى ${maxSuggestions} منتجات مناسبة واشرح سبب الاقتراح لكل منتج.
اجعل ردك في صيغة JSON كالتالي:
{
  "recommendations": [
    {
      "productName": "اسم المنتج",
      "reason": "سبب الاقتراح",
      "confidence": 0.8
    }
  ]
}
`;

      // Check if Gemini API is available using source manager
      let recommendations = [];

      try {
        // Get active API key from source manager
        const GeminiSourceManager = require('./geminiSourceManager');
        const geminiSourceManager = new GeminiSourceManager();
        const activeApiKey = await geminiSourceManager.getActiveApiKey(companyId);

        if (!activeApiKey) {
          console.log('⚠️ No active Gemini API key found, using fallback...');
          throw new Error('No active Gemini API key');
        }

        console.log('🔑 Using active Gemini API key from source manager');

        // Initialize Gemini with the active key
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(activeApiKey);

        // Get AI recommendation
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Parse AI response - remove markdown formatting
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
        }
        if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
        }

        const parsed = JSON.parse(cleanResponse);
        recommendations = parsed.recommendations || [];

        console.log(`✅ Gemini API returned ${recommendations.length} recommendations`);

        // Fix product name mapping - ensure consistent naming
        recommendations = recommendations.map(rec => {
          // Handle both 'name' and 'productName' properties
          const productName = rec.productName || rec.name;

          if (!productName) {
            return {
              ...rec,
              productName: 'منتج غير محدد',
              productId: null,
              price: rec.price || null,
              stock: null
            };
          }

          // Return with consistent naming
          return {
            ...rec,
            productName: productName,
            productId: rec.id || rec.productId || null,
            price: rec.price || null,
            stock: rec.stock || null,
            reason: rec.reason || 'لا يوجد سبب محدد',
            confidence: rec.confidence || 0.5
          };
        });

        console.log(`✅ Mapped ${recommendations.filter(r => r.matchingProduct).length} recommendations to actual products`);

      } catch (aiError) {
        console.log('⚠️ Gemini API failed:', aiError.message);
        console.log('⚠️ Using fallback recommendations...');

        // Fallback: smart keyword matching
        const keywords = customerMessage.toLowerCase();
        const fallbackRecs = [];

        // Simple keyword matching
        products.forEach(product => {
          const productName = product.name.toLowerCase();
          const productDesc = (product.description || '').toLowerCase();

          let score = 0;

          // Check for direct matches
          if (keywords.includes('لابتوب') && (productName.includes('لابتوب') || productName.includes('laptop'))) {
            score += 0.8;
          }
          if (keywords.includes('هاتف') && (productName.includes('هاتف') || productName.includes('phone'))) {
            score += 0.8;
          }
          if (keywords.includes('ألعاب') && (productName.includes('gaming') || productDesc.includes('ألعاب'))) {
            score += 0.6;
          }

          if (score > 0.5) {
            fallbackRecs.push({
              productName: product.name,
              reason: 'مناسب لطلبك',
              confidence: score
            });
          }
        });

        // If no matches, suggest default or popular products
        if (fallbackRecs.length === 0) {
          if (defaultProduct) {
            fallbackRecs.push({
              productName: defaultProduct.name,
              reason: 'المنتج الافتراضي المقترح',
              confidence: 0.6
            });
          } else {
            // Suggest first few products
            products.slice(0, 2).forEach(product => {
              fallbackRecs.push({
                productName: product.name,
                reason: 'منتج مميز',
                confidence: 0.5
              });
            });
          }
        }

        recommendations = fallbackRecs;
      }

      // Match recommendations with actual products
      const matchedProducts = recommendations
        .map(rec => {
          // Try to find matching product using improved matching
          const product = this.findBestProductMatch(rec.productName, products);

          if (product) {
            return {
              id: product.id,
              name: product.name,
              productName: product.name, // Add this for consistency
              description: product.description,
              price: product.price,
              image: product.image,
              reason: rec.reason,
              confidence: rec.confidence || 0.7
            };
          } else {
            // Keep the recommendation even if no exact product match
            return {
              id: null,
              name: rec.productName,
              productName: rec.productName,
              description: rec.productName,
              price: null,
              image: null,
              reason: rec.reason,
              confidence: rec.confidence || 0.7,
              isGenerated: true
            };
          }
        })
        .slice(0, maxSuggestions);

      // If no matches found and default product exists, include it
      if (matchedProducts.length === 0 && defaultProduct) {
        console.log('🎯 No matches found, using default product:', defaultProduct.name);
        matchedProducts.push({
          id: defaultProduct.id,
          name: defaultProduct.name,
          description: defaultProduct.description,
          price: defaultProduct.price,
          image: defaultProduct.image,
          reason: 'منتج مقترح من المتجر',
          confidence: 0.6,
          isDefault: true
        });
      }

      // If still no products, try to find popular/featured products
      if (matchedProducts.length === 0) {
        console.log('🔍 No products found, looking for popular products...');
        const popularProducts = products
          .filter(p => p.isFeatured || p.isActive)
          .sort((a, b) => (b.stock || 0) - (a.stock || 0))
          .slice(0, 2);

        popularProducts.forEach(product => {
          matchedProducts.push({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            reason: 'منتج مميز من المتجر',
            confidence: 0.5,
            isPopular: true
          });
        });
      }

      return {
        success: true,
        data: {
          recommendations: matchedProducts,
          includeImages: settings.data.includeImages,
          totalProducts: products.length,
          hasDefaultProduct: matchedProducts.some(p => p.isDefault),
          hasPopularProducts: matchedProducts.some(p => p.isPopular),
          message: matchedProducts.length > 0
            ? `تم العثور على ${matchedProducts.length} منتج مناسب`
            : 'لم يتم العثور على منتجات مناسبة'
        }
      };

    } catch (error) {
      console.error('Error recommending products:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze image sent by customer
   */
  async analyzeCustomerImage(companyId, imageUrl, customerMessage = '') {
    try {
      const settings = await this.getProductAiSettings(companyId);
      
      if (!settings.success) {
        return settings;
      }

      const { products } = settings.data;

      // Build prompt for image analysis
      const prompt = `
أنت خبير في تحليل الصور والمنتجات. حلل الصورة المرفقة وحدد:
1. ما هو المنتج أو الشيء الموجود في الصورة؟
2. هل يوجد منتج مشابه في قائمة منتجاتنا؟
3. ما هي المواصفات التي يمكن استنتاجها من الصورة؟

${customerMessage ? `رسالة العميل: "${customerMessage}"` : ''}

منتجاتنا المتاحة:
${products.map(p => `- ${p.name}: ${p.description || 'لا يوجد وصف'}`).join('\n')}

اجعل ردك في صيغة JSON كالتالي:
{
  "description": "وصف ما في الصورة",
  "matchingProducts": ["اسماء المنتجات المشابهة"],
  "specifications": ["المواصفات المستنتجة"],
  "confidence": 0.8,
  "recommendation": "نصيحة للعميل"
}
`;

      // Analyze image with Gemini Vision
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const imagePart = {
        inlineData: {
          data: imageUrl, // This should be base64 data
          mimeType: 'image/jpeg'
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response.text();

      // Parse response
      let analysis = {};
      try {
        analysis = JSON.parse(response);
      } catch (e) {
        analysis = {
          description: 'تم تحليل الصورة بنجاح',
          matchingProducts: [],
          specifications: [],
          confidence: 0.5,
          recommendation: 'يرجى التواصل مع فريق المبيعات للمساعدة'
        };
      }

      // Find matching products
      const matchedProducts = analysis.matchingProducts
        .map(productName => {
          return products.find(p => 
            p.name.toLowerCase().includes(productName.toLowerCase()) ||
            productName.toLowerCase().includes(p.name.toLowerCase())
          );
        })
        .filter(Boolean);

      return {
        success: true,
        data: {
          ...analysis,
          matchedProducts,
          hasMatches: matchedProducts.length > 0
        }
      };

    } catch (error) {
      console.error('Error analyzing customer image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create order automatically from conversation
   */
  async createOrderFromConversation(companyId, customerId, conversationContext) {
    try {
      const settings = await this.getProductAiSettings(companyId);
      
      if (!settings.success || !settings.data.autoCreateOrders) {
        return {
          success: false,
          error: 'إنشاء الطلبات التلقائي غير مفعل'
        };
      }

      const { products } = settings.data;
      const { messages, requestedProducts } = conversationContext;

      // Extract order details from conversation
      const orderItems = [];
      let totalAmount = 0;

      for (const productRequest of requestedProducts) {
        const product = products.find(p => p.id === productRequest.productId);
        if (product) {
          const quantity = productRequest.quantity || 1;
          const itemTotal = product.price * quantity;
          
          orderItems.push({
            productId: product.id,
            quantity,
            price: product.price,
            total: itemTotal
          });
          
          totalAmount += itemTotal;
        }
      }

      if (orderItems.length === 0) {
        return {
          success: false,
          error: 'لم يتم تحديد منتجات للطلب'
        };
      }

      // Create order
      const order = await this.prisma.order.create({
        data: {
          companyId,
          customerId,
          status: 'pending',
          totalAmount,
          notes: `طلب تم إنشاؤه تلقائياً من المحادثة`,
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true
        }
      });

      return {
        success: true,
        data: {
          order,
          message: `تم إنشاء الطلب رقم ${order.id} بنجاح`,
          totalAmount,
          itemsCount: orderItems.length
        }
      };

    } catch (error) {
      console.error('Error creating order from conversation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get product image for sending to customer
   */
  async getProductImage(productId, companyId) {
    try {
      const product = await this.prisma.product.findFirst({
        where: {
          id: productId,
          companyId
        }
      });

      if (!product) {
        return {
          success: false,
          error: 'المنتج غير موجود'
        };
      }

      return {
        success: true,
        data: {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          description: product.description
        }
      };

    } catch (error) {
      console.error('Error getting product image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search products by text
   */
  async searchProducts(companyId, searchQuery) {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          companyId,
          OR: [
            { name: { contains: searchQuery } },
            { description: { contains: searchQuery } }
          ]
        },
        include: {
          category: true
        },
        take: 10
      });

      return {
        success: true,
        data: {
          products,
          count: products.length,
          query: searchQuery
        }
      };

    } catch (error) {
      console.error('Error searching products:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AdvancedProductService;
