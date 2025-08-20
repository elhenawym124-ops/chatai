const express = require('express');
const app = express();

// إضافة endpoint مؤقت لاختبار الذكاء الصناعي
app.post('/test-ai-direct', async (req, res) => {
  try {
    console.log('🧪 Test AI endpoint called');
    console.log('📦 Request body:', req.body);

    const { conversationId, senderId, content, attachments = [], customerData } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    // استيراد AI Agent Service
    const aiAgentService = require('./src/services/aiAgentService');

    // إعداد بيانات الرسالة
    const messageData = {
      conversationId: conversationId || 'test-conversation',
      senderId: senderId || 'test-customer',
      content: content,
      attachments: attachments,
      customerData: customerData || {
        name: 'عميل تجريبي',
        phone: '01234567890',
        email: 'test@example.com',
        orderCount: 0
      }
    };

    console.log('🤖 Processing with AI Agent...');
    console.log('📤 Message data:', JSON.stringify(messageData, null, 2));

    // معالجة الرسالة بالذكاء الصناعي
    const aiResponse = await aiAgentService.processCustomerMessage(messageData);

    if (aiResponse) {
      console.log('✅ AI response generated successfully');
      
      res.json({
        success: true,
        data: {
          content: aiResponse.content,
          intent: aiResponse.intent,
          sentiment: aiResponse.sentiment,
          confidence: aiResponse.confidence,
          shouldEscalate: aiResponse.shouldEscalate,
          images: aiResponse.images || [],
          processingTime: aiResponse.processingTime || 0
        },
        message: 'AI response generated successfully'
      });
    } else {
      console.log('❌ No AI response generated');
      
      res.json({
        success: false,
        error: 'AI Agent did not generate a response',
        details: 'This could be due to AI being disabled, quota exceeded, or other configuration issues'
      });
    }

  } catch (error) {
    console.error('❌ Error in test AI endpoint:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

console.log('✅ Test AI endpoint added: POST /test-ai-direct');

module.exports = app;
