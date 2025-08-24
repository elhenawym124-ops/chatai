import React, { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ShoppingCartIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  UserIcon // أيقونة المستخدم للرسائل اليدوية
} from '@heroicons/react/24/outline';

// استيراد الـ hooks المطلوبة (سنضيفها تدريجياً)
import useSocket from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuthSimple';
import { useCompany } from '../../contexts/CompanyContext';
import { companyAwareApi } from '../../services/companyAwareApi';
import { apiClient } from '../../services/apiClient';
import CompanyProtectedRoute from '../../components/protection/CompanyProtectedRoute';
import OrderModal from '../../components/orders/OrderModal';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  isFromCustomer: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  conversationId: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isAiGenerated?: boolean; // للتمييز بين الرسائل اليدوية ورسائل الذكاء الصناعي
}

interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline?: boolean;
  platform: 'facebook' | 'whatsapp' | 'telegram' | 'unknown';
  messages: Message[];
  aiEnabled?: boolean; // حالة الذكاء الاصطناعي
}



const ConversationsImprovedFixedContent: React.FC = () => {
  // Authentication & Company
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { company, companyId, getCompanyFilter } = useCompany();

  // الحالات الأساسية
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);

  // Socket.IO للرسائل الفورية
  const { socket, isConnected, isReconnecting, emit, on, off } = useSocket();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loadingOldMessages, setLoadingOldMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messagesPage, setMessagesPage] = useState(1);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // حالات الطلبات
  const [showOrderModal, setShowOrderModal] = useState(false);

  // حالات الحذف
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const [deleting, setDeleting] = useState(false);

  // حالات التحكم في الذكاء الاصطناعي
  const [togglingAI, setTogglingAI] = useState<string | null>(null);

  // المراجع
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // تحميل المحادثات من API مع العزل
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      // التحقق من المصادقة
      if (!isAuthenticated) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      // التحقق من وجود الشركة
      if (!companyId) {
        throw new Error('لم يتم العثور على معرف الشركة');
      }

      console.log('🔄 Loading conversations from API...');
      console.log('🏢 Company ID:', companyId);

      // استخدام Company-Aware API
      const response = await companyAwareApi.getConversations();

      if (!response.data) {
        throw new Error('لا توجد بيانات في الاستجابة');
      }

      const result = response.data;
      console.log('✅ Conversations loaded successfully:', result);

      // استخراج البيانات من الاستجابة
      const data = result.data || result || [];
      console.log('📊 Conversations data:', data.length);

      // تحويل البيانات للتنسيق المطلوب
      const formattedConversations = data.map((conv: any) => {
        console.log('🔍 [CONVERSATION-DEBUG] Processing conversation:', conv.id, 'aiEnabled:', conv.aiEnabled);
        return {
          id: conv.id,
          customerId: conv.customerId || conv.id,
          customerName: conv.customerName || conv.customerId || 'عميل غير معروف',
          lastMessage: conv.lastMessage || 'لا توجد رسائل',
          lastMessageTime: new Date(conv.lastMessageTime || conv.lastMessageAt || Date.now()),
          unreadCount: conv.unreadCount || 0,
          platform: (conv.platform || conv.channel || 'unknown') as Conversation['platform'],
          isOnline: false, // سنحدثها لاحقاً مع Socket.IO
          messages: [],
          aiEnabled: conv.aiEnabled !== undefined ? conv.aiEnabled : true // إضافة حالة AI
        };
      });

        setConversations(formattedConversations);
        console.log('✅ Conversations loaded:', formattedConversations.length);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      setError('فشل في تحميل المحادثات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // تحميل محادثة محددة من الخادم
  const loadSpecificConversation = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('رمز المصادقة غير موجود');
      }

      console.log('🔄 Loading specific conversation:', conversationId);
      const response = await fetch(`http://localhost:3001/api/v1/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Specific conversation loaded:', result);

      if (result.success && result.data) {
        const conv = result.data;
        const formattedConversation: Conversation = {
          id: conv.id,
          customerId: conv.customerId || conv.id,
          customerName: conv.customerName || conv.customerId || 'عميل غير معروف',
          lastMessage: conv.lastMessage || 'لا توجد رسائل',
          lastMessageTime: new Date(conv.lastMessageTime || conv.lastMessageAt || Date.now()),
          unreadCount: conv.unreadCount || 0,
          platform: (conv.platform || conv.channel || 'unknown') as Conversation['platform'],
          isOnline: false,
          messages: []
        };

        // إضافة المحادثة للقائمة إذا لم تكن موجودة
        setConversations(prev => {
          const exists = prev.find(c => c.id === conversationId);
          if (!exists) {
            return [formattedConversation, ...prev];
          }
          return prev;
        });

        // اختيار المحادثة
        console.log('✅ Selecting loaded conversation:', conversationId);
        selectConversation(conversationId);
      } else {
        console.error('❌ Failed to load specific conversation:', result);
        // اختيار أول محادثة كبديل
        if (conversations.length > 0) {
          selectConversation(conversations[0].id);
        }
      }
    } catch (error) {
      console.error('❌ Error loading specific conversation:', error);
      // اختيار أول محادثة كبديل
      if (conversations.length > 0) {
        selectConversation(conversations[0].id);
      }
    }
  };

  // تحميل الرسائل لمحادثة محددة
  const loadMessages = async (conversationId: string, page: number = 1, append: boolean = false) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('رمز المصادقة غير موجود');
      }

      console.log('🔄 Loading messages for conversation:', conversationId, 'page:', page);
      const response = await fetch(`http://localhost:3001/api/v1/conversations/${conversationId}/messages?page=${page}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || result || [];
      const messages: Message[] = data.map((msg: any) => {
        const isAiGenerated = msg.isAiGenerated || msg.isAutoGenerated || false;

        // تشخيص مؤقت
        if (!msg.isFromCustomer) {
          console.log(`🔍 [MESSAGE-DEBUG] Message ${msg.id}:`, {
            content: msg.content.substring(0, 50) + '...',
            isAiGenerated: isAiGenerated,
            hasMetadata: !!msg.metadata,
            metadata: msg.metadata ? msg.metadata.substring(0, 100) + '...' : null
          });
        }

        return {
          id: msg.id,
          content: msg.content,
          senderId: msg.sender?.id || 'unknown',
          senderName: msg.sender?.name || (
            msg.isFromCustomer ? 'العميل' : 'أنت'
          ),
          timestamp: new Date(msg.timestamp),
          type: msg.type || 'text',
          isFromCustomer: msg.isFromCustomer,
          status: 'delivered',
          conversationId: conversationId,
          isAiGenerated: isAiGenerated // تحديد نوع الرسالة
        };
      });

      // إحصائيات مؤقتة للتشخيص
      const customerMessages = messages.filter(m => m.isFromCustomer).length;
      const aiMessages = messages.filter(m => !m.isFromCustomer && m.isAiGenerated).length;
      const manualMessages = messages.filter(m => !m.isFromCustomer && !m.isAiGenerated).length;

      console.log('✅ Messages loaded:', messages.length);
      console.log('📊 [FRONTEND-STATS] إحصائيات الرسائل:');
      console.log(`   👤 ${customerMessages} من العملاء`);
      console.log(`   🤖 ${aiMessages} من الذكاء الصناعي`);
      console.log(`   👨‍💼 ${manualMessages} يدوية`);

      // تحديث المحادثة المختارة بالرسائل
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: append ? [...messages, ...prev.messages] : messages
      } : null);

      // تحديث حالة وجود رسائل أقدم
      setHasMoreMessages(messages.length === 50); // إذا كان عدد الرسائل أقل من 50، فلا توجد رسائل أقدم

      if (!append) {
        // التمرير للأسفل بعد تحميل الرسائل الجديدة
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  };

  // تحميل الرسائل القديمة
  const loadOldMessages = async () => {
    if (!selectedConversation || loadingOldMessages || !hasMoreMessages) return;
    
    setLoadingOldMessages(true);
    const nextPage = messagesPage + 1;
    
    try {
      console.log('🔄 Loading old messages, page:', nextPage);
      const response = await fetch(`http://localhost:3001/api/v1/conversations/${selectedConversation.id}/messages?page=${nextPage}&limit=50`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || result || [];

      if (data.length > 0) {
        const oldMessages: Message[] = data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.sender?.id || 'unknown',
          senderName: msg.sender?.name || (
            msg.isFromCustomer ? 'العميل' : 'أنت'
          ),
          timestamp: new Date(msg.timestamp),
          type: msg.type || 'text',
          isFromCustomer: msg.isFromCustomer,
          status: 'delivered',
          conversationId: selectedConversation.id,
          isAiGenerated: msg.isAiGenerated || msg.isAutoGenerated || false // تحديد نوع الرسالة
        }));
        
        console.log('✅ Old messages loaded:', oldMessages.length);
        
        // إضافة الرسائل القديمة في بداية القائمة
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: [...oldMessages, ...prev.messages]
        } : null);
        
        setMessagesPage(nextPage);
        setHasMoreMessages(oldMessages.length === 50);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('❌ Error loading old messages:', error);
    } finally {
      setLoadingOldMessages(false);
    }
  };

  // اختيار محادثة
  const selectConversation = (conversationId: string) => {
    console.log('🎯 selectConversation called with ID:', conversationId);
    console.log('🔍 Available conversations count:', conversations.length);

    const conversation = conversations.find(conv => conv.id === conversationId);
    console.log('🔍 Found conversation:', conversation ? conversation.customerName : 'NOT FOUND');

    if (conversation) {
      console.log('✅ Setting selected conversation:', conversation.customerName);
      setSelectedConversation(conversation);

      // تحديث URL لتضمين معرف المحادثة
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('conversationId', conversationId);
      window.history.replaceState({}, '', newUrl.toString());

      // تحميل الرسائل إذا لم تكن محملة
      if (conversation.messages.length === 0) {
        loadMessages(conversationId);
      }

      // تمييز كمقروءة
      if (conversation.unreadCount > 0) {
        setConversations(prev => prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
      }
    } else {
      console.warn('❌ Conversation not found in selectConversation:', conversationId);
      console.log('📝 Available conversation IDs:', conversations.map(c => c.id));
    }
  };

  // إرسال رسالة مع Socket.IO
  const sendMessage = async (customMessage?: string) => {
    const messageContent = customMessage || newMessage.trim();
    if (!messageContent || !selectedConversation || sending) return;

    if (!customMessage) {
      setNewMessage('');
    }
    setSending(true);

    // إنشاء رسالة مؤقتة
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      senderId: 'current_user',
      senderName: 'أنت',
      timestamp: new Date(),
      type: 'text',
      isFromCustomer: false,
      status: 'sending',
      conversationId: selectedConversation.id,
      isAiGenerated: false // رسالة يدوية
    };

    // إضافة الرسالة مؤقتاً للواجهة
    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, tempMessage]
    } : null);

    // التمرير للأسفل
    setTimeout(() => scrollToBottom(), 100);

    try {
      // إرسال عبر API فقط (لتجنب التضارب)
      const url = `http://localhost:3001/api/v1/conversations/${selectedConversation.id}/messages`;
      const payload = { message: messageContent };

      console.log('🚀 Sending message to:', url);
      console.log('📦 Payload:', payload);

      // البحث عن token بأسماء مختلفة
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('رمز المصادقة غير موجود. يرجى تسجيل الدخول مرة أخرى.');
      }

      console.log('🔑 Using token:', token ? `${token.substring(0, 20)}...` : 'No token');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response status:', response.status);

      if (response.status === 401) {
        // خطأ مصادقة - إعادة توجيه لتسجيل الدخول
        localStorage.removeItem('token');
        alert('انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى.');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      console.log('📤 API Response:', data);

      if (data.success) {
        // تحديث الرسالة المؤقتة بالبيانات الحقيقية
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === tempMessage.id
              ? {
                  ...msg,
                  id: data.data.id,
                  status: 'sent',
                  content: messageContent, // تأكد من المحتوى
                  timestamp: new Date(data.data.timestamp || new Date())
                }
              : msg
          )
        } : null);

        // تحديث قائمة المحادثات
        setConversations(prev => prev.map(conv =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: messageContent,
                lastMessageTime: new Date(),
                lastMessagePreview: messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent
              }
            : conv
        ));

        console.log('✅ Message sent successfully!', data);

        // إعادة تحميل الرسائل لضمان التزامن
        setTimeout(() => {
          loadMessages(selectedConversation.id);
        }, 500);
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // تحديث حالة الرسالة إلى خطأ
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'error' }
            : msg
        )
      } : null);
      
      setNewMessage(messageContent); // إعادة النص في حالة الخطأ
    } finally {
      setSending(false);
    }
  };

  // إرسال مؤشر الكتابة
  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (socket && isConnected && selectedConversation) {
      emit('start_typing', {
        conversationId: selectedConversation.id,
        userId: 'current_user'
      });
      
      // إيقاف مؤشر الكتابة بعد ثانيتين من التوقف
      setTimeout(() => {
        emit('stop_typing', {
          conversationId: selectedConversation.id,
          userId: 'current_user'
        });
      }, 2000);
    }
  };

  // التمرير إلى أسفل
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollToBottom(false);
    setUnreadMessagesCount(0);
  };

  // وظائف الإشعارات
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    
    // إنشاء صوت إشعار بسيط
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const showBrowserNotification = (title: string, body: string, icon?: string) => {
    if (!notificationsEnabled) return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag: 'new-message',
        requireInteraction: false,
        silent: false
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body,
            icon: icon || '/favicon.ico',
            tag: 'new-message'
          });
        }
      });
    }
  };

  // دالة حذف المحادثة
  const deleteConversation = async (conversationId: string) => {
    try {
      setDeleting(true);
      console.log('🗑️ Deleting conversation:', conversationId);

      // الحصول على الـ Token
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Token found:', !!token);

      const response = await apiClient.delete(`/conversations/${conversationId}`);
      const data = response.data;

      if (data.success) {
        console.log('✅ Conversation deleted successfully');

        // إزالة المحادثة من القائمة
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));

        // إذا كانت المحادثة المحذوفة هي المحددة، قم بإلغاء التحديد
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
        }

        // إغلاق النافذة المنبثقة
        setShowDeleteModal(false);
        setConversationToDelete(null);

        // إشعار نجاح
        alert('تم حذف المحادثة بنجاح');
      } else {
        throw new Error(data.message || 'فشل في حذف المحادثة');
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      alert('حدث خطأ أثناء حذف المحادثة');
    } finally {
      setDeleting(false);
    }
  };

  // دالة فتح نافذة تأكيد الحذف
  const openDeleteModal = (conversation: Conversation) => {
    setConversationToDelete(conversation);
    setShowDeleteModal(true);
  };

  // دالة إغلاق نافذة تأكيد الحذف
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setConversationToDelete(null);
  };

  // وظائف رفع الملفات
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // فحص نوع الملف والحجم
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت.');
      return;
    }

    setSelectedFile(file);

    // إنشاء معاينة للصور
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // دالة تشغيل/إيقاف الذكاء الاصطناعي للمحادثة
  const handleToggleAI = async (conversationId: string, currentAIStatus: boolean) => {
    console.log('🤖 [HANDLE-TOGGLE-AI] Function called with:', { conversationId, currentAIStatus, togglingAI });

    if (togglingAI) {
      console.log('🤖 [HANDLE-TOGGLE-AI] Already toggling, returning');
      return; // منع التشغيل المتعدد
    }

    setTogglingAI(conversationId);
    try {
      const newAIStatus = !currentAIStatus;
      console.log(`🤖 [HANDLE-TOGGLE-AI] Toggling AI for conversation ${conversationId} from ${currentAIStatus} to ${newAIStatus}`);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة');
      }

      const response = await fetch(`http://localhost:3001/api/v1/conversations/${conversationId}/ai-toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ aiEnabled: newAIStatus })
      });

      const result = await response.json();
      console.log('🤖 [HANDLE-TOGGLE-AI] API result:', result);

      if (result.success) {
        // تحديث المحادثة محلياً
        setConversations(prev => prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, aiEnabled: newAIStatus }
            : conv
        ));

        // تحديث المحادثة المختارة إذا كانت نفس المحادثة
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(prev => prev ? { ...prev, aiEnabled: newAIStatus } : null);
        }

        // إظهار رسالة نجاح
        const statusText = newAIStatus ? 'تم تفعيل' : 'تم إيقاف';
        console.log(`✅ ${statusText} الذكاء الاصطناعي للمحادثة`);

        // يمكن إضافة toast notification هنا
        if (soundEnabled) {
          playNotificationSound();
        }
      } else {
        throw new Error(result.message || 'فشل في تحديث حالة الذكاء الاصطناعي');
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث حالة الذكاء الاصطناعي:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setTogglingAI(null);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !selectedConversation || uploadingFile) return;

    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('conversationId', selectedConversation.id);
      formData.append('type', selectedFile.type.startsWith('image/') ? 'image' : 'file');

      const response = await fetch(`http://localhost:3001/api/v1/conversations/${selectedConversation.id}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // إنشاء رسالة ملف
        const fileMessage: Message = {
          id: data.data.id,
          content: selectedFile.name,
          senderId: 'current_user',
          senderName: 'أنت',
          timestamp: new Date(),
          type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
          isFromCustomer: false,
          status: 'sent',
          conversationId: selectedConversation.id,
          fileUrl: data.data.fileUrl,
          fileName: selectedFile.name,
          fileSize: selectedFile.size
        };

        // إضافة الرسالة للمحادثة
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, fileMessage]
        } : null);

        // تحديث قائمة المحادثات
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id
            ? { 
                ...conv, 
                lastMessage: `📎 ${selectedFile.name}`,
                lastMessageTime: new Date()
              }
            : conv
        ));

        // إرسال عبر Socket.IO
        if (socket && isConnected) {
          emit('send_message', {
            conversationId: selectedConversation.id,
            content: selectedFile.name,
            type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
            fileUrl: data.data.fileUrl
          });
        }

        // تنظيف الحالة
        setSelectedFile(null);
        setFilePreview(null);
        
        // التمرير للأسفل
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      alert('حدث خطأ أثناء رفع الملف');
    } finally {
      setUploadingFile(false);
    }
  };

  const cancelFileUpload = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  // وظائف الطلبات
  const openOrderModal = () => {
    setShowOrderModal(true);
  };

  // معالجة إنشاء الطلب
  const handleOrderCreated = async (orderData: any) => {
    // إرسال رسالة تأكيد للعميل
    const confirmationMessage = `تم إنشاء طلبك بنجاح! 🎉\n\nرقم الطلب: ${orderData.orderNumber}\nالإجمالي: ${orderData.total} جنيه\n\nسيتم التواصل معك قريباً لتأكيد التفاصيل.`;
    await sendMessage(confirmationMessage);
  };

  // مراقبة التمرير
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    const isAtTop = container.scrollTop <= 100;
    
    setShowScrollToBottom(!isAtBottom);
    
    if (isAtBottom) {
      setUnreadMessagesCount(0);
    }
    
    // تحميل الرسائل القديمة عند الوصول لأعلى الصفحة
    if (isAtTop && hasMoreMessages && !loadingOldMessages) {
      loadOldMessages();
    }
  };

  // إعداد مستمعي أحداث Socket.IO (معطل مؤقتاً لتجنب التضارب مع API)
  useEffect(() => {
    if (!socket || !isConnected) return;

    // تعطيل Socket.IO مؤقتاً
    return;

    // استقبال رسالة جديدة
    const handleNewMessage = (data: any) => {
      console.log('📨 New message received:', data);
      
      const newMessage: Message = {
        id: data.id,
        content: data.content,
        senderId: data.senderId,
        senderName: data.senderName || 'العميل',
        timestamp: new Date(data.timestamp),
        type: data.type || 'text',
        isFromCustomer: data.isFromCustomer,
        status: 'delivered',
        conversationId: data.conversationId
      };

      // إضافة الرسالة للمحادثة المناسبة
      setConversations(prev => prev.map(conv => {
        if (conv.id === data.conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: data.content,
            lastMessageTime: new Date(data.timestamp),
            unreadCount: selectedConversation?.id === data.conversationId ? 0 : conv.unreadCount + 1
          };
        }
        return conv;
      }));

      // تحديث المحادثة المختارة إذا كانت نفس المحادثة
      if (selectedConversation?.id === data.conversationId) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, newMessage],
          lastMessage: data.content,
          lastMessageTime: new Date(data.timestamp)
        } : null);
        
        // إذا لم يكن المستخدم في الأسفل، زيادة عداد الرسائل غير المقروءة
        if (showScrollToBottom) {
          setUnreadMessagesCount(prev => prev + 1);
          
          // تشغيل صوت الإشعار وعرض إشعار المتصفح
          playNotificationSound();
          showBrowserNotification(
            `رسالة جديدة من ${data.senderName || 'العميل'}`,
            data.content.length > 50 ? data.content.substring(0, 50) + '...' : data.content
          );
        } else {
          // التمرير للأسفل إذا كان المستخدم في الأسفل
          setTimeout(() => scrollToBottom(), 100);
        }
      }
    };

    // مؤشر الكتابة
    const handleUserTyping = (data: any) => {
      console.log('✍️ User typing:', data);
      setTypingUsers(prev => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
      
      // إزالة مؤشر الكتابة بعد 3 ثوان
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }, 3000);
    };

    // إيقاف الكتابة
    const handleUserStoppedTyping = (data: any) => {
      setTypingUsers(prev => prev.filter(id => id !== data.userId));
    };

    // حالة الاتصال
    const handleUserOnline = (data: any) => {
      console.log('🟢 User online:', data.userId);
      setOnlineUsers(prev => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
      
      // تحديث حالة المحادثات
      setConversations(prev => prev.map(conv => 
        conv.id === data.userId ? { ...conv, isOnline: true } : conv
      ));
    };

    const handleUserOffline = (data: any) => {
      console.log('🔴 User offline:', data.userId);
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
      
      // تحديث حالة المحادثات
      setConversations(prev => prev.map(conv => 
        conv.id === data.userId ? { ...conv, isOnline: false } : conv
      ));
    };

    // تسجيل مستمعي الأحداث
    on('new_message', handleNewMessage);
    on('user_typing', handleUserTyping);
    on('user_stopped_typing', handleUserStoppedTyping);
    on('user_online', handleUserOnline);
    on('user_offline', handleUserOffline);

    // تنظيف المستمعين عند إلغاء التحميل
    return () => {
      off('new_message', handleNewMessage);
      off('user_typing', handleUserTyping);
      off('user_stopped_typing', handleUserStoppedTyping);
      off('user_online', handleUserOnline);
      off('user_offline', handleUserOffline);
    };
  }, [socket, isConnected, selectedConversation, on, off]);



  // تحميل المحادثات عند بدء التشغيل
  useEffect(() => {
    console.log('🚀 ConversationsImprovedFixed component mounted');
    console.log('🔗 Current URL:', window.location.href);
    console.log('🔗 URL search params:', window.location.search);

    // انتظار انتهاء تحميل المصادقة
    if (authLoading) {
      console.log('⏳ Waiting for auth to load...');
      return;
    }

    // التحقق من المصادقة
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login...');
      window.location.href = '/auth/login';
      return;
    }

    // فحص معامل URL فوراً
    const urlParams = new URLSearchParams(window.location.search);
    const conversationIdFromUrl = urlParams.get('conversationId');
    console.log('🎯 Initial conversation ID from URL:', conversationIdFromUrl);

    loadConversations();
  }, [authLoading, isAuthenticated]);

  // معالجة معامل URL عند تحميل المحادثات
  useEffect(() => {
    if (conversations.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const conversationIdFromUrl = urlParams.get('conversationId');

      console.log('🔄 Conversations loaded, checking URL param:', conversationIdFromUrl);

      if (conversationIdFromUrl) {
        const targetConversation = conversations.find(conv => conv.id === conversationIdFromUrl);
        if (targetConversation) {
          console.log('✅ Found target conversation after loading:', targetConversation.customerName);
          selectConversation(conversationIdFromUrl);
        } else {
          console.warn('⚠️ Conversation not found after loading, trying to load from server');
          loadSpecificConversation(conversationIdFromUrl);
        }
      } else if (!selectedConversation) {
        // اختيار أول محادثة إذا لم يكن هناك معامل URL
        console.log('✅ No URL param, selecting first conversation');
        selectConversation(conversations[0].id);
      }
    }
  }, [conversations]);

  // الاستماع لتغييرات URL
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const conversationIdFromUrl = urlParams.get('conversationId');

      if (conversationIdFromUrl && conversations.length > 0) {
        const targetConversation = conversations.find(conv => conv.id === conversationIdFromUrl);
        if (targetConversation && selectedConversation?.id !== conversationIdFromUrl) {
          console.log('🔄 URL changed, switching to conversation:', conversationIdFromUrl);
          selectConversation(conversationIdFromUrl);
        }
      }
    };

    // استمع لتغييرات التاريخ
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [conversations, selectedConversation]);

  // معالجة الضغط على Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // فلترة المحادثات حسب البحث
  const filteredConversations = conversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // عرض حالة تحميل المصادقة
  if (authLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحقق من المصادقة...</p>
          </div>
        </div>
      </div>
    );
  }

  // إعادة توجيه إذا لم يكن مصادق
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
              <h3 className="text-yellow-800 font-semibold mb-2">🔐 مطلوب تسجيل الدخول</h3>
              <p className="text-yellow-700 mb-4">يجب تسجيل الدخول للوصول للمحادثات</p>
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المحادثات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h3 className="text-red-800 font-semibold mb-2">❌ خطأ في التحميل</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={loadConversations}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* قائمة المحادثات */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* رأس قائمة المحادثات */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              🚀 المحادثات المحسنة
            </h2>
            {isConnected ? (
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">متصل</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm">{isReconnecting ? 'إعادة الاتصال...' : 'غير متصل'}</span>
              </div>
            )}
          </div>
          
          {/* أزرار التحكم */}
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={() => {
                console.log('🔄 Manual reload conversations');
                loadConversations();
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              title="إعادة تحميل المحادثات"
            >
              🔄 إعادة تحميل
            </button>

            <button
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                const conversationIdFromUrl = urlParams.get('conversationId');
                console.log('🧪 Manual URL check:', conversationIdFromUrl);
                if (conversationIdFromUrl && conversations.length > 0) {
                  const found = conversations.find(c => c.id === conversationIdFromUrl);
                  console.log('🧪 Found in current list:', found ? 'YES' : 'NO');
                  if (found) {
                    selectConversation(conversationIdFromUrl);
                  } else {
                    loadSpecificConversation(conversationIdFromUrl);
                  }
                }
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              title="اختبار معامل URL"
            >
              🧪 اختبار URL
            </button>
          </div>

          {/* شريط البحث */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المحادثات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* قائمة المحادثات */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد محادثات'}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center space-x-3 flex-1 cursor-pointer"
                    onClick={() => selectConversation(conversation.id)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {conversation.customerName.charAt(0)}
                      </div>
                      {/* مؤشر حالة الاتصال */}
                      {onlineUsers.includes(conversation.id) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{conversation.customerName}</h3>
                        {onlineUsers.includes(conversation.id) && (
                          <span className="text-xs text-green-600 font-medium">متصل</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <p className="text-sm text-gray-500 truncate flex-1">{conversation.lastMessage}</p>
                        {/* مؤشر نوع آخر رسالة */}
                        {conversation.messages && conversation.messages.length > 0 && (
                          (() => {
                            const lastMessage = conversation.messages[conversation.messages.length - 1];
                            if (!lastMessage.isFromCustomer) {
                              return lastMessage.isAiGenerated ? (
                                <CpuChipIcon className="w-3 h-3 text-green-600" title="آخر رسالة من الذكاء الصناعي" />
                              ) : (
                                <UserIcon className="w-3 h-3 text-blue-600" title="آخر رسالة يدوية" />
                              );
                            }
                            return null;
                          })()
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {conversation.lastMessageTime.toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <div className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 mt-1 inline-block">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    {/* زر الحذف */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(conversation);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="حذف المحادثة"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* منطقة المحادثة */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* شريط علوي مع معلومات المحادثة */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConversation.customerName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedConversation.customerName}</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className={`w-2 h-2 rounded-full ${
                        isConnected ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span>{isConnected ? 'متصل' : 'غير متصل'}</span>
                      {isReconnecting && <span className="text-yellow-600">يعيد الاتصال...</span>}

                      {/* إحصائيات الرسائل */}
                      {selectedConversation.messages && selectedConversation.messages.length > 0 && (
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            👤 {selectedConversation.messages.filter(m => !m.isFromCustomer && !m.isAiGenerated).length} يدوي
                          </span>
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                            🤖 {selectedConversation.messages.filter(m => !m.isFromCustomer && m.isAiGenerated).length} ذكي
                          </span>
                        </div>
                      )}

                      {/* Debug info */}
                      <span className="text-xs text-blue-500 border border-blue-200 px-1 rounded">
                        AI: {selectedConversation.aiEnabled !== undefined ? (selectedConversation.aiEnabled ? 'ON' : 'OFF') : 'UNDEFINED'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* أزرار الإشعارات */}
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-full hover:bg-gray-100 ${
                      soundEnabled ? 'text-blue-600' : 'text-gray-400'
                    }`}
                    title={soundEnabled ? 'إيقاف الصوت' : 'تفعيل الصوت'}
                  >
                    {soundEnabled ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4c0-1.1.9-2 2-2h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm14 11V5h-2v15h2zm-4.5-7h-2v2h2v-2z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                      </svg>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`p-2 rounded-full hover:bg-gray-100 ${
                      notificationsEnabled ? 'text-blue-600' : 'text-gray-400'
                    }`}
                    title={notificationsEnabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات'}
                  >
                    {notificationsEnabled ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 18.69L7.84 6.14 5.27 3.49 4 4.76l2.8 2.8v.01c-.52.99-.8 2.16-.8 3.42v5l-2 2v1h13.73l2 2L21 19.73l-1-1.04zM12 22c1.11 0 2-.89 2-2h-4c0 1.11.89 2 2 2zm4-7.32V11c0-2.76-1.46-5.02-4-5.42V4.5c0-.83-.67-1.5-1.5-1.5S9 3.67 9 4.5v1.08c-.14.04-.28.08-.42.12L16 13.68z"/>
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowOrderModal(true)}
                    className="p-2 text-green-600 hover:text-green-700 rounded-full hover:bg-green-50 border border-green-200"
                    title="إنشاء طلب جديد"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                  </button>



                  {/* زر التحكم في الذكاء الاصطناعي مع نص توضيحي */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        console.log('🤖 [AI-BUTTON] Clicked! Conversation:', selectedConversation?.id, 'AI Status:', selectedConversation?.aiEnabled);
                        if (selectedConversation) {
                          handleToggleAI(selectedConversation.id, selectedConversation.aiEnabled ?? true);
                        }
                      }}
                      disabled={!selectedConversation || togglingAI === selectedConversation?.id}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        selectedConversation?.aiEnabled ?? true
                          ? 'text-green-600 bg-green-50 hover:bg-green-100'
                          : 'text-red-600 bg-red-50 hover:bg-red-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={`${selectedConversation?.aiEnabled ?? true ? 'إيقاف' : 'تفعيل'} الذكاء الاصطناعي`}
                    >
                      {togglingAI === selectedConversation?.id ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CpuChipIcon className="w-5 h-5" />
                      )}
                    </button>
                    <span className={`text-xs font-medium ${
                      selectedConversation?.aiEnabled ?? true
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {selectedConversation?.aiEnabled ?? true ? '🤖 مُفعل' : '👤 يدوي'}
                    </span>
                  </div>

                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <InformationCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* منطقة الرسائل */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
              onScroll={handleScroll}
            >
              {/* مؤشر تحميل الرسائل القديمة */}
              {loadingOldMessages && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center space-x-2 text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm">جاري تحميل الرسائل القديمة...</span>
                  </div>
                </div>
              )}
              
              {selectedConversation.messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد رسائل في هذه المحادثة</p>
                </div>
              ) : (
                <div>
                  {selectedConversation.messages.map((message, index) => (
                    <div
                      key={message.id || `temp-${index}-${Date.now()}`}
                      className={`flex ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg border-l-4 ${
                          message.isFromCustomer
                            ? 'bg-gray-200 text-gray-800 border-l-gray-400'
                            : message.status === 'sending'
                              ? 'bg-blue-400 text-white opacity-70 border-l-blue-600'
                              : message.isAiGenerated
                                ? 'bg-green-500 text-white border-l-green-700 shadow-green-200 shadow-sm' // رسائل الذكاء الصناعي - أخضر مع ظل
                                : 'bg-blue-500 text-white border-l-blue-700 shadow-blue-200 shadow-sm'  // رسائل يدوية - أزرق مع ظل
                        }`}
                      >
                        {/* عرض الرسائل حسب النوع */}
                        {(() => {
                          // Debug logging for image messages
                          if (message.type === 'image' || message.type === 'IMAGE') {
                            console.log('🖼️ [IMAGE-DEBUG] Image message found:', {
                              id: message.id,
                              type: message.type,
                              content: message.content,
                              fileUrl: message.fileUrl,
                              hasContent: !!message.content,
                              startsWithHttp: message.content?.startsWith('http'),
                              shouldShow: !!(message.fileUrl || message.content?.startsWith('http'))
                            });
                          }
                          return null;
                        })()}
                        {(message.type === 'image' || message.type === 'IMAGE') && (message.fileUrl || message.content?.startsWith('http')) ? (
                          <div>
                            <img
                              src={message.fileUrl || message.content}
                              alt={message.fileName || message.content || 'صورة'}
                              className="max-w-full h-auto rounded mb-2 cursor-pointer"
                              onClick={() => window.open(message.fileUrl || message.content, '_blank')}
                              onError={(e) => {
                                console.log('❌ Image load error:', e.target.src);
                                console.log('❌ Message data:', message);
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.innerHTML = '❌ فشل في تحميل الصورة: ' + (message.fileName || 'صورة');
                                }
                              }}
                            />
                            <p className="text-sm">{message.fileName || 'صورة'}</p>
                          </div>
                        ) : (message.type === 'file' || message.type === 'FILE') && message.fileUrl ? (
                          <div className="flex items-center space-x-2">
                            <PaperClipIcon className="w-5 h-5" />
                            <div>
                              <a 
                                href={message.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm underline hover:no-underline"
                              >
                                {message.fileName || message.content}
                              </a>
                              {message.fileSize && (
                                <p className="text-xs opacity-70">
                                  {(message.fileSize / 1024 / 1024).toFixed(2)} ميجابايت
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs mt-1 opacity-70">
                          <div className="flex items-center space-x-1">
                            {/* أيقونة نوع الرسالة */}
                            {!message.isFromCustomer && (
                              message.isAiGenerated ? (
                                <CpuChipIcon className="w-3 h-3" title="ذكاء صناعي" />
                              ) : (
                                <UserIcon className="w-3 h-3" title="رسالة يدوية" />
                              )
                            )}
                            <span>
                              {message.senderName}
                              {!message.isFromCustomer && (
                                message.isAiGenerated ? ' • 🤖 ذكاء صناعي' : ' • 👤 يدوي'
                              )}
                              {' • '}
                              {message.timestamp.toLocaleTimeString('ar-SA', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {!message.isFromCustomer && (
                            <span className="ml-2">
                              {message.status === 'sending' && '⏳'}
                              {message.status === 'sent' && '✓'}
                              {message.status === 'delivered' && '✓✓'}
                              {message.status === 'read' && '✓✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* مؤشرات الكتابة */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div key="dot-1" className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div key="dot-2" className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div key="dot-3" className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-xs">العميل يكتب...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* زر الانتقال للأسفل */}
            {showScrollToBottom && (
              <div className="absolute bottom-20 right-6 z-10">
                <button
                  onClick={scrollToBottom}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  {unreadMessagesCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* معاينة الملف المختار */}
            {selectedFile && (
              <div className="bg-gray-50 border-t border-gray-200 p-4">
                <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                  <div className="flex items-center space-x-3">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <PaperClipIcon className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} ميجابايت
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={uploadFile}
                      disabled={uploadingFile}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      {uploadingFile ? 'جاري الرفع...' : 'رفع'}
                    </button>
                    <button
                      onClick={cancelFileUpload}
                      className="text-gray-500 hover:text-gray-700 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* منطقة إدخال الرسالة */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <label
                  htmlFor="file-upload"
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <PaperClipIcon className="w-5 h-5" />
                </label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب رسالتك هنا..."
                    disabled={sending}
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <FaceSmileIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => sendMessage()}
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <PaperAirplaneIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">اختر محادثة للبدء</h3>
              <p>اختر محادثة من القائمة لعرض الرسائل</p>
            </div>
          </div>
        )}
      </div>



      {/* Order Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        customerId={selectedConversation?.id || ''}
        customerName={selectedConversation?.customerName || ''}
        conversationId={selectedConversation?.id || ''}
        onOrderCreated={handleOrderCreated}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && conversationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 ml-2" />
              <h3 className="text-lg font-semibold text-gray-900">تأكيد حذف المحادثة</h3>
            </div>

            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف المحادثة مع <strong>{conversationToDelete.customerName}</strong>؟
              <br />
              <span className="text-red-600 text-sm">
                ⚠️ سيتم حذف جميع الرسائل نهائياً ولا يمكن استرجاعها.
              </span>
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => deleteConversation(conversationToDelete.id)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4 ml-2" />
                    حذف نهائياً
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// المكون الرئيسي مع الحماية
const ConversationsImprovedFixed: React.FC = () => {
  return (
    <CompanyProtectedRoute>
      <ConversationsImprovedFixedContent />
    </CompanyProtectedRoute>
  );
};

export default ConversationsImprovedFixed;
