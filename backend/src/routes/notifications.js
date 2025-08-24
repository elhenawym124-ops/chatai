const express = require('express');
const router = express.Router();
const { getSharedPrismaClient } = require('../services/sharedDatabase');

// Use shared Prisma Client
const prisma = getSharedPrismaClient();

// Authentication middleware - relies on global security middleware
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'يجب تسجيل الدخول للوصول لهذا المورد',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }
  next();
};

// Middleware للتحقق من التوثيق مع معالجة أفضل للأخطاء
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // لا يوجد token - مستخدم غير مسجل دخول
    req.user = null;
    return next();
  }

  // استخدام middleware التوثيق العادي
  requireAuth(req, res, next);
};

/**
 * Get recent notifications for user
 */
router.get('/recent', requireAuth, async (req, res) => {
  try {
    const { userId, companyId } = req.user;
    const limit = parseInt(req.query.limit) || 20;

    console.log('🔍 [NOTIFICATIONS-API] Fetching notifications for user:', userId);
    console.log('🔍 [NOTIFICATIONS-API] Company:', companyId);
    console.log('🔍 [NOTIFICATIONS-API] Limit:', limit);

    // جلب الإشعارات من قاعدة البيانات
    const notifications = await prisma.notification.findMany({
      where: {
        companyId: companyId,
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    console.log('✅ [NOTIFICATIONS-API] Found notifications:', notifications.length);

    // تحويل البيانات للتنسيق المطلوب
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type.toLowerCase(),
      title: notification.title,
      message: notification.message,
      timestamp: notification.createdAt,
      isRead: notification.isRead,
      silent: notification.data?.silent || false,
      customerId: notification.data?.customerId,
      errorType: notification.data?.errorType,
      metadata: notification.data
    }));

    console.log('📋 [NOTIFICATIONS-API] Formatted notifications:', formattedNotifications.length);
    console.log('📋 [NOTIFICATIONS-API] Sample notification:', formattedNotifications[0] || 'none');

    res.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    });

  } catch (error) {
    console.error('❌ [NOTIFICATIONS-API] Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

/**
 * Mark notification as read
 */
router.post('/:notificationId/read', requireAuth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.user;

    // FIXED: Add company isolation for security
    // First check if notification exists and belongs to user/company
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        companyId: req.user.companyId, // Company isolation
        OR: [
          { userId: userId },
          { userId: null } // إشعارات عامة
        ]
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Update the notification using updateMany for safety
    const updatedNotification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        companyId: req.user.companyId, // Company isolation
        OR: [
          { userId: userId },
          { userId: null } // إشعارات عامة
        ]
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    if (updatedNotification.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

/**
 * Mark all notifications as read
 */
router.post('/mark-all-read', requireAuth, async (req, res) => {
  try {
    const { userId, companyId } = req.user;

    // FIXED: Ensure company isolation in all conditions
    await prisma.notification.updateMany({
      where: {
        companyId: companyId, // Company isolation
        OR: [
          { userId: userId },
          { userId: null } // إشعارات عامة للشركة
        ],
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
});

/**
 * Delete notification
 */
router.delete('/:notificationId', requireAuth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.user;

    // FIXED: Add company isolation for security
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        companyId: req.user.companyId, // Company isolation
        OR: [
          { userId: userId },
          { userId: null } // إشعارات عامة للشركة
        ]
      }
    });

    res.json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
});

/**
 * Create notification (internal use)
 */
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { type, title, message, userId, companyId, metadata } = req.body;

    const notification = await prisma.notification.create({
      data: {
        type: type.toUpperCase(),
        title,
        message,
        userId: userId || null,
        companyId: companyId || req.user.companyId,
        metadata: metadata || {},
        isRead: false
      }
    });

    res.json({
      success: true,
      notification: {
        id: notification.id,
        type: notification.type.toLowerCase(),
        title: notification.title,
        message: notification.message,
        timestamp: notification.createdAt,
        isRead: notification.isRead,
        metadata: notification.metadata
      }
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    });
  }
});

/**
 * Get notification statistics
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const { userId, companyId } = req.user;

    const stats = await prisma.notification.groupBy({
      by: ['type', 'isRead'],
      where: {
        OR: [
          { userId: userId },
          { companyId: companyId, userId: null }
        ]
      },
      _count: {
        id: true
      }
    });

    const formattedStats = {
      total: 0,
      unread: 0,
      byType: {
        error: 0,
        warning: 0,
        info: 0,
        success: 0
      }
    };

    stats.forEach(stat => {
      formattedStats.total += stat._count.id;
      if (!stat.isRead) {
        formattedStats.unread += stat._count.id;
      }
      
      const type = stat.type.toLowerCase();
      if (formattedStats.byType.hasOwnProperty(type)) {
        formattedStats.byType[type] += stat._count.id;
      }
    });

    res.json({
      success: true,
      stats: formattedStats
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification stats'
    });
  }
});

module.exports = router;
