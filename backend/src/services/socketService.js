const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
    this.typingUsers = new Map(); // conversationId -> Set of userIds
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:3003'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    console.log('✅ Socket.IO server initialized');
  }

  getIO() {
    return this.io;
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // معالج انضمام المستخدم
      socket.on('user_join', (data) => {
        this.handleUserJoin(socket, data);
      });

      // معالج إرسال الرسائل
      socket.on('send_message', (data) => {
        this.handleSendMessage(socket, data);
      });

      // معالج بدء الكتابة
      socket.on('start_typing', (data) => {
        this.handleStartTyping(socket, data);
      });

      // معالج إيقاف الكتابة
      socket.on('stop_typing', (data) => {
        this.handleStopTyping(socket, data);
      });

      // معالج تمييز الرسائل كمقروءة
      socket.on('mark_as_read', (data) => {
        this.handleMarkAsRead(socket, data);
      });

      // معالج انضمام لمحادثة معينة
      socket.on('join_conversation', (data) => {
        this.handleJoinConversation(socket, data);
      });

      // معالج مغادرة محادثة
      socket.on('leave_conversation', (data) => {
        this.handleLeaveConversation(socket, data);
      });

      // معالج قطع الاتصال
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // معالج الأخطاء
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });
  }

  // انضمام المستخدم
  handleUserJoin(socket, data) {
    const { userId, userName } = data;
    
    if (!userId) {
      socket.emit('error', { message: 'User ID is required' });
      return;
    }

    // تسجيل المستخدم
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, { userId, userName });

    // انضمام لغرفة المستخدم
    socket.join(`user_${userId}`);

    // إشعار المستخدمين الآخرين بالاتصال
    socket.broadcast.emit('user_online', {
      userId,
      userName,
      timestamp: new Date()
    });

    console.log(`👤 User ${userName} (${userId}) joined`);

    // إرسال قائمة المستخدمين المتصلين
    socket.emit('online_users', {
      users: Array.from(this.connectedUsers.keys())
    });
  }

  // إرسال رسالة
  async handleSendMessage(socket, data) {
    try {
      const { conversationId, content, type = 'text', tempId } = data;
      const userInfo = this.userSockets.get(socket.id);

      if (!userInfo) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      // إنشاء الرسالة
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        content,
        type,
        senderId: userInfo.userId,
        senderName: userInfo.userName,
        timestamp: new Date(),
        isFromCustomer: false,
        status: 'sent'
      };

      // إرسال للمستخدمين في المحادثة
      this.io.to(`conversation_${conversationId}`).emit('new_message', message);

      // تأكيد الإرسال للمرسل
      socket.emit('message_sent', {
        tempId,
        message
      });

      // تحديث حالة الرسالة إلى delivered
      setTimeout(() => {
        this.io.to(`conversation_${conversationId}`).emit('message_delivered', {
          messageId: message.id,
          timestamp: new Date()
        });
      }, 1000);

      console.log(`📨 Message sent in conversation ${conversationId}`);

    } catch (error) {
      console.error('Error handling send message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  // بدء الكتابة
  handleStartTyping(socket, data) {
    const { conversationId } = data;
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo || !conversationId) return;

    // إضافة المستخدم لقائمة الكاتبين
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }
    this.typingUsers.get(conversationId).add(userInfo.userId);

    // إشعار المستخدمين الآخرين في المحادثة
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: userInfo.userId,
      userName: userInfo.userName,
      conversationId
    });

    console.log(`✍️ User ${userInfo.userName} started typing in ${conversationId}`);
  }

  // إيقاف الكتابة
  handleStopTyping(socket, data) {
    const { conversationId } = data;
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo || !conversationId) return;

    // إزالة المستخدم من قائمة الكاتبين
    if (this.typingUsers.has(conversationId)) {
      this.typingUsers.get(conversationId).delete(userInfo.userId);
      
      // حذف المحادثة من القائمة إذا لم يعد أحد يكتب
      if (this.typingUsers.get(conversationId).size === 0) {
        this.typingUsers.delete(conversationId);
      }
    }

    // إشعار المستخدمين الآخرين
    socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
      userId: userInfo.userId,
      conversationId
    });

    console.log(`🛑 User ${userInfo.userName} stopped typing in ${conversationId}`);
  }

  // تمييز الرسائل كمقروءة
  handleMarkAsRead(socket, data) {
    const { conversationId, messageId } = data;
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo) return;

    // إشعار بقراءة الرسالة
    socket.to(`conversation_${conversationId}`).emit('message_read', {
      messageId,
      userId: userInfo.userId,
      timestamp: new Date()
    });

    console.log(`👁️ Message ${messageId} marked as read by ${userInfo.userName}`);
  }

  // انضمام لمحادثة
  handleJoinConversation(socket, data) {
    const { conversationId } = data;
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo || !conversationId) return;

    socket.join(`conversation_${conversationId}`);
    console.log(`🏠 User ${userInfo.userName} joined conversation ${conversationId}`);
  }

  // مغادرة محادثة
  handleLeaveConversation(socket, data) {
    const { conversationId } = data;
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo || !conversationId) return;

    socket.leave(`conversation_${conversationId}`);
    
    // إيقاف الكتابة عند المغادرة
    this.handleStopTyping(socket, { conversationId });
    
    console.log(`🚪 User ${userInfo.userName} left conversation ${conversationId}`);
  }

  // قطع الاتصال
  handleDisconnect(socket) {
    const userInfo = this.userSockets.get(socket.id);
    
    if (userInfo) {
      const { userId, userName } = userInfo;

      // إزالة المستخدم من القوائم
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);

      // إزالة من جميع محادثات الكتابة
      for (const [conversationId, typingSet] of this.typingUsers.entries()) {
        if (typingSet.has(userId)) {
          typingSet.delete(userId);
          socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
            userId,
            conversationId
          });
        }
      }

      // إشعار المستخدمين الآخرين بقطع الاتصال
      socket.broadcast.emit('user_offline', {
        userId,
        userName,
        timestamp: new Date()
      });

      console.log(`👋 User ${userName} (${userId}) disconnected`);
    } else {
      console.log(`🔌 Anonymous user ${socket.id} disconnected`);
    }
  }

  // إرسال رسالة لمستخدم معين
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // إرسال رسالة لمحادثة معينة
  sendToConversation(conversationId, event, data) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }

  // إرسال إشعار عام
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // الحصول على المستخدمين المتصلين
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // الحصول على عدد المستخدمين المتصلين
  getOnlineCount() {
    return this.connectedUsers.size;
  }

  // التحقق من اتصال مستخدم
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

// إنشاء instance واحد
const socketService = new SocketService();

module.exports = socketService;
