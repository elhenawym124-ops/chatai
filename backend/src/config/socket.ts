import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';
import { config } from '@/config';
import { RedisPubSub } from '@/config/redis';

/**
 * Socket.IO Configuration and Real-time Communication
 * 
 * This module handles WebSocket connections for real-time features
 * like live chat, notifications, and status updates.
 */

interface AuthenticatedSocket extends Socket {
  userId?: string;
  companyId?: string;
  role?: string;
}

interface JWTPayload {
  userId: string;
  companyId: string;
  role: string;
}

let io: SocketIOServer;
let pubsub: RedisPubSub;

/**
 * Setup Socket.IO server with authentication and event handlers
 */
export const setupSocketIO = (socketServer: SocketIOServer): void => {
  io = socketServer;
  pubsub = new RedisPubSub();

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      
      socket.userId = decoded.userId;
      socket.companyId = decoded.companyId;
      socket.role = decoded.role;

      logger.info(`Socket authenticated for user ${decoded.userId}`);
      next();
    } catch (error) {
      logger.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    handleConnection(socket);
  });

  // Setup Redis pub/sub for multi-server scaling
  setupRedisPubSub();

  logger.info('Socket.IO server configured successfully');
};

/**
 * Handle new socket connection
 */
const handleConnection = (socket: AuthenticatedSocket): void => {
  const { userId, companyId, role } = socket;

  logger.info(`User ${userId} connected via Socket.IO`);

  // Join user-specific room
  socket.join(`user:${userId}`);
  
  // Join company-specific room
  if (companyId) {
    socket.join(`company:${companyId}`);
  }

  // Join role-specific room
  if (role) {
    socket.join(`role:${role}`);
  }

  // Send welcome message
  socket.emit('connected', {
    message: 'Connected successfully',
    userId,
    timestamp: new Date().toISOString(),
  });

  // Handle conversation events
  setupConversationHandlers(socket);

  // Handle notification events
  setupNotificationHandlers(socket);

  // Handle typing indicators
  setupTypingHandlers(socket);

  // Handle user status
  setupStatusHandlers(socket);

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    handleDisconnection(socket, reason);
  });

  // Handle errors
  socket.on('error', (error) => {
    logger.error(`Socket error for user ${userId}:`, error);
  });
};

/**
 * Setup conversation-related event handlers
 */
const setupConversationHandlers = (socket: AuthenticatedSocket): void => {
  const { userId, companyId } = socket;

  // Join conversation room
  socket.on('join_conversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
    logger.info(`User ${userId} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
    logger.info(`User ${userId} left conversation ${conversationId}`);
  });

  // Handle new message
  socket.on('new_message', (data: {
    conversationId: string;
    message: string;
    type: string;
  }) => {
    // Broadcast to conversation participants
    socket.to(`conversation:${data.conversationId}`).emit('message_received', {
      conversationId: data.conversationId,
      message: data.message,
      type: data.type,
      senderId: userId,
      timestamp: new Date().toISOString(),
    });

    // Publish to Redis for multi-server scaling
    pubsub.publish('new_message', {
      senderId: userId,
      companyId,
      ...data,
    });
  });

  // Handle message read status
  socket.on('mark_as_read', (data: {
    conversationId: string;
    messageIds: string[];
  }) => {
    socket.to(`conversation:${data.conversationId}`).emit('messages_read', {
      conversationId: data.conversationId,
      messageIds: data.messageIds,
      readBy: userId,
      timestamp: new Date().toISOString(),
    });
  });
};

/**
 * Setup notification event handlers
 */
const setupNotificationHandlers = (socket: AuthenticatedSocket): void => {
  const { userId } = socket;

  // Handle notification acknowledgment
  socket.on('notification_read', (notificationId: string) => {
    logger.info(`User ${userId} read notification ${notificationId}`);
    
    // Update notification status in database
    // This would typically be handled by a service
  });

  // Handle notification preferences update
  socket.on('update_notification_preferences', (preferences: object) => {
    logger.info(`User ${userId} updated notification preferences`);
    
    // Update preferences in database
    // This would typically be handled by a service
  });
};

/**
 * Setup typing indicator handlers
 */
const setupTypingHandlers = (socket: AuthenticatedSocket): void => {
  const { userId } = socket;

  // Handle typing start
  socket.on('typing_start', (conversationId: string) => {
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      userId,
      isTyping: true,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle typing stop
  socket.on('typing_stop', (conversationId: string) => {
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      userId,
      isTyping: false,
      timestamp: new Date().toISOString(),
    });
  });
};

/**
 * Setup user status handlers
 */
const setupStatusHandlers = (socket: AuthenticatedSocket): void => {
  const { userId, companyId } = socket;

  // Update user status to online
  socket.emit('status_update', {
    userId,
    status: 'online',
    timestamp: new Date().toISOString(),
  });

  // Broadcast status to company members
  socket.to(`company:${companyId}`).emit('user_status_changed', {
    userId,
    status: 'online',
    timestamp: new Date().toISOString(),
  });

  // Handle manual status update
  socket.on('update_status', (status: 'online' | 'away' | 'busy' | 'offline') => {
    socket.to(`company:${companyId}`).emit('user_status_changed', {
      userId,
      status,
      timestamp: new Date().toISOString(),
    });
  });
};

/**
 * Handle socket disconnection
 */
const handleDisconnection = (socket: AuthenticatedSocket, reason: string): void => {
  const { userId, companyId } = socket;

  logger.info(`User ${userId} disconnected: ${reason}`);

  // Update user status to offline
  socket.to(`company:${companyId}`).emit('user_status_changed', {
    userId,
    status: 'offline',
    timestamp: new Date().toISOString(),
  });

  // Clean up any user-specific data
  // This could include clearing typing indicators, etc.
};

/**
 * Setup Redis pub/sub for multi-server scaling
 */
const setupRedisPubSub = (): void => {
  // Subscribe to message events
  pubsub.subscribe('new_message', (message) => {
    const data = JSON.parse(message);
    io.to(`conversation:${data.conversationId}`).emit('message_received', data);
  });

  // Subscribe to notification events
  pubsub.subscribe('new_notification', (message) => {
    const data = JSON.parse(message);
    io.to(`user:${data.userId}`).emit('notification', data);
  });

  // Subscribe to system announcements
  pubsub.subscribe('system_announcement', (message) => {
    const data = JSON.parse(message);
    io.emit('system_announcement', data);
  });
};

/**
 * Utility functions for sending events from other parts of the application
 */
export const socketUtils = {
  /**
   * Send notification to specific user
   */
  sendNotificationToUser: (userId: string, notification: object): void => {
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }
  },

  /**
   * Send message to conversation
   */
  sendMessageToConversation: (conversationId: string, message: object): void => {
    if (io) {
      io.to(`conversation:${conversationId}`).emit('message_received', message);
    }
  },

  /**
   * Broadcast to company
   */
  broadcastToCompany: (companyId: string, event: string, data: object): void => {
    if (io) {
      io.to(`company:${companyId}`).emit(event, data);
    }
  },

  /**
   * Broadcast system announcement
   */
  broadcastSystemAnnouncement: (announcement: object): void => {
    if (io) {
      io.emit('system_announcement', announcement);
    }
  },

  /**
   * Get connected users count
   */
  getConnectedUsersCount: (): number => {
    return io ? io.engine.clientsCount : 0;
  },

  /**
   * Get users in room
   */
  getUsersInRoom: async (room: string): Promise<string[]> => {
    if (!io) return [];
    
    const sockets = await io.in(room).fetchSockets();
    return sockets.map(socket => (socket as any).userId).filter(Boolean) as string[];
  },
};

export { io };
