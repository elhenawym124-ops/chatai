const express = require('express');
const router = express.Router();
const { getSharedPrismaClient } = require('../services/sharedDatabase');
const { requireAuth } = require('../middleware/auth');

const prisma = getSharedPrismaClient();

/**
 * Get recent notifications (simple test version)
 */
router.get('/recent', async (req, res) => {
  try {
    console.log('📋 [NOTIFICATIONS-API] Simple test route called');

    // Return mock data for now
    res.json({
      success: true,
      notifications: [
        {
          id: 'test1',
          type: 'info',
          title: 'اختبار',
          message: 'هذا إشعار تجريبي',
          timestamp: new Date(),
          isRead: false
        }
      ],
      unreadCount: 1
    });

  } catch (error) {
    console.error('❌ [NOTIFICATIONS-API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      details: error.message
    });
  }
});

/**
 * Mark notification as read
 */
router.post('/:notificationId/read', requireAuth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId, companyId } = req.user;

    console.log(`✅ [NOTIFICATIONS-API] Mark as read request for notification: ${notificationId}`);

    const updatedNotification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        companyId: companyId,
        OR: [
          { userId: userId },
          { userId: null }
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
        error: 'Notification not found'
      });
    }

    console.log(`✅ [NOTIFICATIONS-API] Notification marked as read: ${notificationId}`);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('❌ [NOTIFICATIONS-API] Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

/**
 * Delete notification
 */
router.delete('/:notificationId', requireAuth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId, companyId } = req.user;

    console.log(`🗑️ [NOTIFICATIONS-API] Delete request for notification: ${notificationId}`);

    const deletedNotification = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        companyId: companyId,
        OR: [
          { userId: userId },
          { userId: null }
        ]
      }
    });

    if (deletedNotification.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    console.log(`🗑️ [NOTIFICATIONS-API] Notification deleted: ${notificationId}`);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('❌ [NOTIFICATIONS-API] Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
});

/**
 * Mark all notifications as read
 */
router.post('/mark-all-read', requireAuth, async (req, res) => {
  try {
    const { userId, companyId } = req.user;

    console.log(`✅ [NOTIFICATIONS-API] Mark all as read for user: ${userId}`);

    await prisma.notification.updateMany({
      where: {
        companyId: companyId,
        OR: [
          { userId: userId },
          { userId: null }
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
    console.error('❌ [NOTIFICATIONS-API] Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
});

module.exports = router;
