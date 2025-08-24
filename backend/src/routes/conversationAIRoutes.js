const express = require('express');
const { getSharedPrismaClient } = require('../services/sharedDatabase');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const prisma = getSharedPrismaClient();

/**
 * تشغيل/إيقاف الذكاء الاصطناعي لمحادثة معينة
 * Toggle AI for a specific conversation
 */
router.patch('/conversations/:conversationId/ai-toggle', requireAuth, async (req, res) => {
  console.log('🎯 [AI-TOGGLE-ROUTE] Route hit! Params:', req.params, 'Body:', req.body, 'User:', req.user?.id);
  try {
    const { conversationId } = req.params;
    const { aiEnabled } = req.body;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول - معرف الشركة مطلوب'
      });
    }

    console.log(`🤖 [AI-TOGGLE] Toggling AI for conversation ${conversationId} to ${aiEnabled} (Company: ${companyId})`);

    // التحقق من وجود المحادثة والتأكد من أنها تنتمي للشركة
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        companyId: companyId
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة'
      });
    }

    // تحديث حالة الذكاء الاصطناعي في metadata
    const currentMetadata = conversation.metadata ? JSON.parse(conversation.metadata) : {};
    const newMetadata = {
      ...currentMetadata,
      aiEnabled: Boolean(aiEnabled)
    };

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
        companyId: companyId
      },
      data: { metadata: JSON.stringify(newMetadata) },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    // تسجيل العملية في السجلات
    console.log(`✅ [AI-TOGGLE] AI ${aiEnabled ? 'enabled' : 'disabled'} for conversation ${conversationId}`);
    console.log(`👤 [AI-TOGGLE] Customer: ${conversation.customer?.firstName || 'Unknown'} ${conversation.customer?.lastName || ''}`);

    // استخراج حالة AI من metadata المحدثة
    const updatedMetadata = updatedConversation.metadata ? JSON.parse(updatedConversation.metadata) : {};
    const currentAIStatus = updatedMetadata.aiEnabled !== false; // افتراضي true

    res.json({
      success: true,
      message: `تم ${aiEnabled ? 'تفعيل' : 'إيقاف'} الذكاء الاصطناعي للمحادثة`,
      data: {
        conversationId: updatedConversation.id,
        aiEnabled: currentAIStatus,
        customerName: `${conversation.customer?.firstName || ''} ${conversation.customer?.lastName || ''}`.trim() || 'عميل غير معروف'
      }
    });

  } catch (error) {
    console.error('❌ [AI-TOGGLE] Error toggling AI:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث إعدادات الذكاء الاصطناعي',
      error: error.message
    });
  }
});

/**
 * الحصول على حالة الذكاء الاصطناعي لمحادثة معينة
 * Get AI status for a specific conversation
 */
router.get('/conversations/:conversationId/ai-status', requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول - معرف الشركة مطلوب'
      });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        companyId: companyId
      },
      select: {
        id: true,
        metadata: true,
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة'
      });
    }

    // استخراج حالة AI من metadata
    const metadata = conversation.metadata ? JSON.parse(conversation.metadata) : {};
    const aiEnabled = metadata.aiEnabled !== false; // افتراضي true

    res.json({
      success: true,
      data: {
        conversationId: conversation.id,
        aiEnabled: aiEnabled,
        customerName: `${conversation.customer?.firstName || ''} ${conversation.customer?.lastName || ''}`.trim() || 'عميل غير معروف'
      }
    });

  } catch (error) {
    console.error('❌ [AI-STATUS] Error getting AI status:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الحصول على حالة الذكاء الاصطناعي',
      error: error.message
    });
  }
});

/**
 * تشغيل/إيقاف الذكاء الاصطناعي لعدة محادثات
 * Bulk toggle AI for multiple conversations
 */
router.patch('/conversations/bulk-ai-toggle', requireAuth, async (req, res) => {
  try {
    const { conversationIds, aiEnabled } = req.body;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول - معرف الشركة مطلوب'
      });
    }

    if (!Array.isArray(conversationIds) || conversationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد معرفات المحادثات'
      });
    }

    console.log(`🤖 [BULK-AI-TOGGLE] Toggling AI for ${conversationIds.length} conversations to ${aiEnabled} (Company: ${companyId})`);

    // الحصول على المحادثات وتحديث metadata لكل منها (فقط للشركة المحددة)
    const conversations = await prisma.conversation.findMany({
      where: {
        id: { in: conversationIds },
        companyId: companyId
      },
      select: { id: true, metadata: true }
    });

    let updatedCount = 0;
    for (const conversation of conversations) {
      try {
        const currentMetadata = conversation.metadata ? JSON.parse(conversation.metadata) : {};
        const newMetadata = {
          ...currentMetadata,
          aiEnabled: Boolean(aiEnabled)
        };

        await prisma.conversation.update({
          where: {
            id: conversation.id,
            companyId: companyId
          },
          data: { metadata: JSON.stringify(newMetadata) }
        });
        updatedCount++;
      } catch (error) {
        console.error(`❌ [BULK-AI-TOGGLE] Failed to update conversation ${conversation.id}:`, error);
      }
    }

    console.log(`✅ [BULK-AI-TOGGLE] Updated ${updatedCount} conversations`);

    res.json({
      success: true,
      message: `تم ${aiEnabled ? 'تفعيل' : 'إيقاف'} الذكاء الاصطناعي لـ ${updatedCount} محادثة`,
      data: {
        updatedCount: updatedCount,
        aiEnabled: Boolean(aiEnabled)
      }
    });

  } catch (error) {
    console.error('❌ [BULK-AI-TOGGLE] Error in bulk toggle:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحديث المجمع للذكاء الاصطناعي',
      error: error.message
    });
  }
});

module.exports = router;
