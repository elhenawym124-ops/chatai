const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient();

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
router.get('/recent', requireAuth, optionalAuth, async (req, res) => {
  try {
    // إذا لم يكن المستخدم مسجل دخول، أرجع قائمة فارغة
    if (!req.user) {
      return res.json({
        success: true,
        notifications: [],
        unreadCount: 0,
        message: 'User not authenticated'
      });
    }

    const { userId, companyId } = req.user;
    const limit = parseInt(req.query.limit) || 20;

    // جلب الإشعارات من قاعدة البيانات
    const notifications = await prisma.notification.findMany({
      where: { companyId: req.user?.companyId },
      where: {
        OR: [
          { userId: userId },
          { companyId: companyId, userId: null } // إشعارات عامة للشركة
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // تحويل البيانات للتنسيق المطلوب
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type.toLowerCase(),
      title: notification.title,
      message: notification.message,
      timestamp: notification.createdAt,
      read: notification.read,
      silent: notification.metadata?.silent || false,
      customerId: notification.metadata?.customerId,
      errorType: notification.metadata?.errorType,
      metadata: notification.metadata
    }));

    res.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount: notifications.filter(n => !n.read).length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
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
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        companyId: req.user.companyId, // Company isolation
        OR: [
          { userId: userId },
          { userId: null } // إشعارات عامة
        ]
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

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
        read: false
      },
      data: {
        read: true,
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
        read: false
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
        read: notification.read,
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
      by: ['type', 'read'],
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
      if (!stat.read) {
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
