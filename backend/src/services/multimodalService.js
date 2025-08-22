const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class MultimodalService {
  constructor() {
    // سيتم تهيئة Gemini عند الحاجة من قاعدة البيانات
    this.genAI = null;
    this.visionModel = null;
    this.textModel = null;
  }

  async initializeGemini() {
    try {
      console.log('🔧 [MULTIMODAL] Initializing Gemini for image processing...');

      // استخدام نفس نظام المفاتيح المستخدم في aiAgentService
      const aiAgentService = require('./aiAgentService');
      const geminiConfig = await aiAgentService.getCurrentActiveModel();

      if (!geminiConfig) {
        console.log('❌ [MULTIMODAL] No active Gemini key available for image processing');
        return false;
      }

      console.log(`✅ [MULTIMODAL] Using model: ${geminiConfig.model} from key: ${geminiConfig.keyId}`);

      // تهيئة Gemini باستخدام المفتاح النشط
      this.genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
      this.visionModel = this.genAI.getGenerativeModel({ model: geminiConfig.model });
      this.textModel = this.genAI.getGenerativeModel({ model: geminiConfig.model });

      console.log('✅ [MULTIMODAL] Gemini Vision initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ [MULTIMODAL] Error initializing Gemini:', error);
      return false;
    }
  }

  async getAvailableProducts(companyId = null) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // 🔐 فلترة المنتجات حسب الشركة
      const whereClause = { isActive: true };
      if (companyId) {
        whereClause.companyId = companyId;
        console.log(`🔐 [MULTIMODAL] Filtering products for company: ${companyId}`);
      }

      const products = await prisma.product.findMany({
        where: whereClause,
        include: {
          variants: {
            where: { isActive: true }
          }
        }
      });

      let productsList = '';
      products.forEach(product => {
        productsList += `- ${product.name}: ${product.price} جنيه\n`;
        if (product.description) {
          productsList += `  الوصف: ${product.description}\n`;
        }
        if (product.variants && product.variants.length > 0) {
          productsList += `  الألوان/الأنواع المتاحة:\n`;
          product.variants.forEach(variant => {
            productsList += `    * ${variant.name}: ${variant.price} جنيه\n`;
          });
        }
        productsList += '\n';
      });

      await prisma.$disconnect();
      return productsList || 'لا توجد منتجات متاحة حالياً';
    } catch (error) {
      console.error('❌ Error getting available products:', error);
      return 'خطأ في الحصول على المنتجات المتاحة';
    }
  }

  // دالة للحصول على المنتجات كـ array للمقارنة
  async getProductsArray(companyId = null) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // 🔐 فلترة المنتجات حسب الشركة
      const whereClause = { isActive: true };
      if (companyId) {
        whereClause.companyId = companyId;
        console.log(`🔐 [MULTIMODAL] Filtering products array for company: ${companyId}`);
      }

      const products = await prisma.product.findMany({
      where: { companyId: companyId },
        where: whereClause,
        include: {
          variants: {
            where: { isActive: true }
          }
        }
      });

      await prisma.$disconnect();
      return products;
    } catch (error) {
      console.error('❌ [MULTIMODAL] Error getting products array:', error);
      return [];
    }
  }

  async detectMessageType(messageData) {
    // تحديد نوع الرسالة بناءً على المحتوى
    if (messageData.attachments && messageData.attachments.length > 0) {
      const attachment = messageData.attachments[0];
      
      if (attachment.type === 'image') {
        return 'image';
      } else if (attachment.type === 'audio') {
        return 'voice';
      } else if (attachment.type === 'video') {
        return 'video';
      } else if (attachment.type === 'file') {
        return 'file';
      }
    }
    
    return 'text';
  }

  async processImage(messageData) {
    try {
      console.log('🖼️ [MULTIMODAL] Starting image processing...');
      console.log('🖼️ [MULTIMODAL] Message data:', JSON.stringify(messageData, null, 2));

      // تهيئة Gemini إذا لم يكن مُهيأ
      const initialized = await this.initializeGemini();

      if (!initialized || !this.visionModel) {
        console.log('❌ [MULTIMODAL] Vision model not available');
        return {
          type: 'image_error',
          originalMessage: messageData.content || 'صورة',
          processedContent: 'عذراً، خدمة تحليل الصور غير متاحة حالياً. يمكنك وصف ما تريده بالكلمات؟'
        };
      }

      if (!messageData.attachments || messageData.attachments.length === 0) {
        console.log('❌ [MULTIMODAL] No attachments found in message data');
        return {
          type: 'image_error',
          originalMessage: messageData.content || 'صورة',
          processedContent: 'عذراً، لم أتمكن من العثور على الصورة. يرجى إعادة إرسالها.'
        };
      }

      const attachment = messageData.attachments[0];
      console.log('🖼️ [MULTIMODAL] Processing attachment:', attachment);

      if (!attachment.payload || !attachment.payload.url) {
        console.log('❌ [MULTIMODAL] Invalid attachment format');
        return {
          type: 'image_error',
          originalMessage: messageData.content || 'صورة',
          processedContent: 'عذراً، تنسيق الصورة غير صحيح. يرجى إعادة إرسالها.'
        };
      }

      const imageUrl = attachment.payload.url;
      console.log('🖼️ [MULTIMODAL] Image URL:', imageUrl);
      
      // تحميل الصورة
      console.log('📥 [MULTIMODAL] Downloading image from URL...');
      const imageBuffer = await this.downloadImage(imageUrl);
      console.log('✅ [MULTIMODAL] Image downloaded successfully, size:', imageBuffer.length, 'bytes');

      // تحويل الصورة إلى base64
      console.log('🔄 [MULTIMODAL] Converting image to base64...');
      const base64Image = imageBuffer.toString('base64');
      console.log('✅ [MULTIMODAL] Image converted to base64, length:', base64Image.length);

      // الحصول على المنتجات المتاحة للمقارنة
      console.log('📦 [MULTIMODAL] Getting available products...');
      const companyId = messageData.companyId;
      const availableProductsText = await this.getAvailableProducts(companyId);
      const availableProducts = await this.getProductsArray(companyId);
      console.log('✅ [MULTIMODAL] Retrieved products for comparison');

      // تحليل الصورة باستخدام Gemini Vision
      const prompt = `
        أنت مساعد ذكي في متجر أحذية ومنتجات رياضية.
        حلل هذه الصورة واكتب وصفاً مفصلاً لما تراه.

        المنتجات المتاحة في المتجر:
        ${availableProductsText}

        إذا كانت الصورة تحتوي على:
        - حذاء أو كوتشي:
          * اذكر النوع واللون والحالة بالتفصيل
          * قارن مع المنتجات المتاحة أعلاه
          * إذا وجدت تطابق، اذكر اسم المنتج والسعر
          * إذا لم تجد تطابق، اقترح أقرب منتج متاح
        - قدم: اقترح المقاس المناسب إذا أمكن
        - منتج تالف: اذكر نوع التلف
        - فاتورة أو إيصال: اقرأ المعلومات المهمة

        رد باللغة العربية بطريقة ودودة ومفيدة.
        ابدأ ردك بـ "أهلاً بك في متجرنا! يسعدني جداً أن أحلل لك هذه الصورة"
      `;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: attachment.type === 'image' ? 'image/jpeg' : 'image/png'
        }
      };

      console.log('🧠 [MULTIMODAL] Sending image to Gemini Vision for analysis...');
      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const analysis = response.text();

      console.log('✅ [MULTIMODAL] Image analysis completed');
      console.log('📝 [MULTIMODAL] Analysis result:', analysis.substring(0, 200) + '...');

      console.log('✅ Image analysis completed');

      // حفظ تحليل الصورة في الذاكرة للمحادثات المستقبلية مع العزل الأمني
      try {
        const memoryService = require('./memoryService');
        await memoryService.saveInteraction({
          conversationId: messageData.conversationId,
          senderId: messageData.senderId,
          companyId: messageData.companyId, // ✅ إضافة companyId للعزل الأمني
          userMessage: 'صورة',
          aiResponse: analysis,
          intent: 'image_analysis',
          sentiment: 'neutral',
          timestamp: new Date()
        });
        console.log('💾 Image analysis saved to memory');
      } catch (memoryError) {
        console.log('⚠️ Could not save image analysis to memory:', memoryError.message);
      }

      // استخراج المعلومات المهمة فقط للـ AI Agent
      const productMatch = this.extractProductMatch(analysis, availableProducts);

      return {
        type: 'image_analysis',
        originalMessage: messageData.content || 'صورة',
        analysis: analysis,
        imageUrl: imageUrl,
        productMatch: productMatch,
        processedContent: productMatch.found
          ? `العميل أرسل صورة لمنتج. تم العثور على: ${productMatch.productName} - ${productMatch.color} - السعر: ${productMatch.price} جنيه`
          : `العميل أرسل صورة لمنتج غير متوفر في المتجر. يحتاج اقتراح بدائل.`
      };

    } catch (error) {
      console.error('❌ Error processing image:', error);

      // تحديد نوع الخطأ لتقديم رد مناسب
      let errorMessage = '';
      let shouldEscalate = false;

      if (error.message && error.message.includes('429')) {
        // خطأ تجاوز الحد - نرجع للـ AI Agent للرد بشخصية ساره
        return {
          type: 'image_error',
          originalMessage: messageData.content || 'صورة',
          processedContent: `العميل أرسل صورة لكن النظام مشغول. يحتاج مساعدة بديلة.`,
          shouldEscalate: true,
          errorType: 'quota_exceeded'
        };
      } else if (error.message && error.message.includes('503')) {
        // خطأ الخدمة غير متاحة - نرجع للـ AI Agent للرد بشخصية ساره
        return {
          type: 'image_error',
          originalMessage: messageData.content || 'صورة',
          processedContent: `العميل أرسل صورة لكن الخدمة غير متاحة مؤقتاً. يحتاج مساعدة بديلة.`,
          shouldEscalate: true,
          errorType: 'service_unavailable'
        };
      } else {
        // خطأ عام - نرجع للـ AI Agent للرد بشخصية ساره مع المنتجات المتاحة
        return {
          type: 'image_error',
          originalMessage: messageData.content || 'صورة',
          processedContent: `العميل أرسل صورة لكن حدث خطأ في التحليل. يحتاج عرض المنتجات المتاحة.`,
          shouldEscalate: false,
          errorType: 'general_error'
        };
      }


    }
  }

  async processVoice(messageData) {
    try {
      console.log('🎤 Processing voice message...');
      
      // في الوقت الحالي، سنعتبر الرسالة الصوتية كنص
      // يمكن إضافة خدمة تحويل الصوت إلى نص لاحقاً
      
      return {
        type: 'voice_message',
        originalMessage: messageData.content || 'رسالة صوتية',
        processedContent: 'شكراً لرسالتك الصوتية! يمكنك كتابة استفسارك بالنص لمساعدتك بشكل أفضل؟ 🎤'
      };

    } catch (error) {
      console.error('❌ Error processing voice:', error);
      return {
        type: 'voice_error',
        originalMessage: messageData.content || 'رسالة صوتية',
        processedContent: 'عذراً، لم أتمكن من معالجة الرسالة الصوتية. يمكنك كتابة استفسارك؟'
      };
    }
  }

  async processVideo(messageData) {
    try {
      console.log('🎥 Processing video message...');
      
      // معالجة أساسية للفيديو
      return {
        type: 'video_message',
        originalMessage: messageData.content || 'فيديو',
        processedContent: 'شكراً لإرسال الفيديو! يمكنك وصف ما تريد مساعدة فيه بالكلمات؟ 🎥'
      };

    } catch (error) {
      console.error('❌ Error processing video:', error);
      return {
        type: 'video_error',
        originalMessage: messageData.content || 'فيديو',
        processedContent: 'عذراً، لم أتمكن من معالجة الفيديو. يمكنك وصف استفسارك بالكلمات؟'
      };
    }
  }

  async downloadImage(imageUrl) {
    try {
      console.log('📥 [MULTIMODAL] Downloading image from:', imageUrl);

      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'arraybuffer',
        timeout: 10000 // 10 seconds timeout
      });

      console.log('✅ [MULTIMODAL] Image download successful, status:', response.status);
      console.log('📊 [MULTIMODAL] Response headers:', response.headers['content-type']);

      return Buffer.from(response.data);
    } catch (error) {
      console.error('❌ [MULTIMODAL] Error downloading image:', error.message);
      console.error('❌ [MULTIMODAL] Image URL was:', imageUrl);
      throw new Error('Failed to download image: ' + error.message);
    }
  }

  async analyzeImageForProduct(imageBuffer) {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      const prompt = `
        حلل هذه الصورة وحدد:
        1. نوع المنتج (حذاء، كوتشي، صندل، إلخ)
        2. اللون الأساسي
        3. الماركة إن أمكن
        4. الحالة (جديد، مستعمل، تالف)
        5. أي تفاصيل مميزة
        
        رد بتنسيق JSON:
        {
          "productType": "نوع المنتج",
          "color": "اللون",
          "brand": "الماركة",
          "condition": "الحالة",
          "details": "تفاصيل إضافية"
        }
      `;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const analysis = response.text();

      try {
        return JSON.parse(analysis);
      } catch (parseError) {
        // إذا فشل في تحليل JSON، أرجع النص كما هو
        return {
          productType: 'غير محدد',
          color: 'غير محدد',
          brand: 'غير محدد',
          condition: 'غير محدد',
          details: analysis
        };
      }

    } catch (error) {
      console.error('❌ Error analyzing image for product:', error);
      return null;
    }
  }

  async generateImageResponse(imageAnalysis, customerMessage) {
    try {
      const prompt = `
        بناءً على تحليل الصورة التالي:
        ${JSON.stringify(imageAnalysis, null, 2)}
        
        ورسالة العميل: "${customerMessage}"
        
        اكتب رداً مفيداً وودوداً باللغة العربية.
        إذا كان العميل يسأل عن منتج مشابه، اقترح منتجات من المتجر.
        إذا كان المنتج تالف، اعرض المساعدة في الإرجاع أو الاستبدال.
      `;

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      
      return response.text();

    } catch (error) {
      console.error('❌ Error generating image response:', error);
      return 'شكراً لإرسال الصورة! كيف يمكنني مساعدتك؟';
    }
  }

  // تحليل المشاعر من الصورة (تعبيرات الوجه إذا وجدت)
  async analyzeImageSentiment(imageBuffer) {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      const prompt = `
        حلل هذه الصورة وحدد:
        1. هل يوجد وجه أو تعبير في الصورة؟
        2. ما هو المزاج العام للصورة؟
        3. هل تبدو الصورة إيجابية أم سلبية؟
        
        رد بكلمة واحدة: positive, negative, أو neutral
      `;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const sentiment = response.text().trim().toLowerCase();

      if (sentiment.includes('positive')) return 'positive';
      if (sentiment.includes('negative')) return 'negative';
      return 'neutral';

    } catch (error) {
      console.error('❌ Error analyzing image sentiment:', error);
      return 'neutral';
    }
  }

  // إنشاء وصف للمنتج من الصورة
  async generateProductDescription(imageBuffer) {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      const prompt = `
        اكتب وصفاً تسويقياً جذاباً لهذا المنتج باللغة العربية.
        ركز على:
        - المظهر والتصميم
        - الألوان
        - المواد المحتملة
        - الاستخدام المناسب
        
        اجعل الوصف قصيراً ومشوقاً (2-3 جمل).
      `;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      
      return response.text().trim();

    } catch (error) {
      console.error('❌ Error generating product description:', error);
      return 'منتج رائع ومميز!';
    }
  }

  // فحص جودة الصورة
  async checkImageQuality(imageBuffer) {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      const prompt = `
        قيم جودة هذه الصورة من 1 إلى 10:
        - الوضوح
        - الإضاءة
        - زاوية التصوير
        
        رد برقم فقط من 1 إلى 10.
      `;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const quality = parseInt(response.text().trim());

      return isNaN(quality) ? 5 : Math.max(1, Math.min(10, quality));

    } catch (error) {
      console.error('❌ Error checking image quality:', error);
      return 5; // متوسط
    }
  }

  // استخراج معلومات المنتج من التحليل
  extractProductMatch(analysis, availableProducts) {
    try {
      // التحقق من صحة المدخلات
      if (!analysis || typeof analysis !== 'string') {
        console.log('⚠️ [PRODUCT-MATCH] Invalid analysis input');
        return { found: false, reason: 'تحليل الصورة غير صالح' };
      }

      if (!availableProducts || !Array.isArray(availableProducts)) {
        console.log('⚠️ [PRODUCT-MATCH] Invalid products input');
        return { found: false, reason: 'قائمة المنتجات غير متاحة' };
      }

      // البحث عن كلمات مفتاحية في التحليل
      const analysisLower = analysis.toLowerCase();
      console.log('🔍 [PRODUCT-MATCH] Analyzing:', analysisLower.substring(0, 100) + '...');

      // البحث عن منتج مطابق
      for (const product of availableProducts) {
        if (!product || !product.name) {
          console.log('⚠️ [PRODUCT-MATCH] Skipping invalid product:', product);
          continue;
        }

        const productName = product.name.toLowerCase();

        // فحص إذا كان اسم المنتج موجود في التحليل
        if (analysisLower.includes(productName) || analysisLower.includes('كوتشي') || analysisLower.includes('حذاء')) {

          // البحث عن اللون
          let matchedColor = 'غير محدد';
          let matchedPrice = product.price;

          if (product.variants && product.variants.length > 0) {
            // البحث عن اللون المحدد في التحليل
            let foundColor = false;

            // أولاً: البحث عن الألوان الأساسية في بداية التحليل
            const analysisStart = analysisLower.substring(0, 500); // أول 500 حرف فقط
            console.log('🔍 [COLOR-ANALYSIS] Analyzing first 500 chars:', analysisStart);

            for (const variant of product.variants) {
              const colorName = variant.name.toLowerCase();
              console.log('🔍 [COLOR-CHECK] Checking variant:', variant.name, 'against analysis');

              // مطابقة الألوان الشائعة في بداية التحليل أولاً
              if ((analysisStart.includes('أسود') || analysisStart.includes('اسود') || analysisStart.includes('black')) &&
                  (colorName.includes('أسود') || colorName.includes('اسود') || colorName.includes('الاسود'))) {
                matchedColor = variant.name;
                matchedPrice = variant.price;
                foundColor = true;
                console.log('🎯 [COLOR-MATCH] Found black color match:', variant.name);
                break;
              }

              if ((analysisStart.includes('أبيض') || analysisStart.includes('ابيض') || analysisStart.includes('white')) &&
                  (colorName.includes('أبيض') || colorName.includes('ابيض') || colorName.includes('الابيض'))) {
                matchedColor = variant.name;
                matchedPrice = variant.price;
                foundColor = true;
                console.log('🎯 [COLOR-MATCH] Found white color match:', variant.name);
                break;
              }

              if ((analysisStart.includes('بيج') || analysisStart.includes('beige')) &&
                  (colorName.includes('بيج') || colorName.includes('البيج'))) {
                matchedColor = variant.name;
                matchedPrice = variant.price;
                foundColor = true;
                console.log('🎯 [COLOR-MATCH] Found beige color match:', variant.name);
                break;
              }
            }

            // إذا لم نجد مطابقة في البداية، ابحث في النص كاملاً لكن بحذر
            if (!foundColor) {
              console.log('🔍 [COLOR-FALLBACK] No color found in first 500 chars, searching full text...');

              // ترتيب الألوان حسب الأولوية (الأبيض أولاً لأنه الأكثر شيوعاً)
              const colorPriority = ['الابيض', 'الاسود', 'البيج'];

              for (const priorityColor of colorPriority) {
                for (const variant of product.variants) {
                  const colorName = variant.name.toLowerCase();

                  if (colorName.includes(priorityColor)) {
                    // تحقق من وجود اللون في النص
                    const colorKeywords = {
                      'الابيض': ['أبيض', 'ابيض', 'white'],
                      'الاسود': ['أسود', 'اسود', 'black'],
                      'البيج': ['بيج', 'beige']
                    };

                    const keywords = colorKeywords[priorityColor] || [];
                    const hasColorInText = keywords.some(keyword => analysisLower.includes(keyword));

                    if (hasColorInText) {
                      matchedColor = variant.name;
                      matchedPrice = variant.price;
                      foundColor = true;
                      console.log('🎯 [COLOR-MATCH] Priority match found:', variant.name, 'for', priorityColor);
                      break;
                    }
                  }
                }
                if (foundColor) break;
              }

              // إذا لم نجد أي مطابقة، استخدم أول لون متاح
              if (!foundColor && product.variants.length > 0) {
                matchedColor = product.variants[0].name;
                matchedPrice = product.variants[0].price;
                foundColor = true;
                console.log('🎯 [COLOR-MATCH] Using default first variant:', matchedColor);
              }
            }

            // إذا لم نجد لون محدد، استخدم أول variant
            if (!foundColor && product.variants.length > 0) {
              matchedColor = product.variants[0].name;
              matchedPrice = product.variants[0].price;
            }
          }

          return {
            found: true,
            productName: product.name,
            color: matchedColor,
            price: matchedPrice,
            description: product.description,
            productId: product.id
          };
        }
      }

      // لم يتم العثور على منتج مطابق
      return {
        found: false,
        reason: 'المنتج غير متوفر في المتجر'
      };

    } catch (error) {
      console.error('❌ Error extracting product match:', error);
      return {
        found: false,
        reason: 'خطأ في تحليل المنتج'
      };
    }
  }

  // إحصائيات المعالجة
  getProcessingStats() {
    return {
      supportedTypes: ['image', 'voice', 'video', 'text'],
      imageFormats: ['jpeg', 'png', 'gif', 'webp'],
      maxImageSize: '10MB',
      processingTime: 'متوسط 2-5 ثواني',
      accuracy: '85-95%'
    };
  }
}

module.exports = new MultimodalService();
