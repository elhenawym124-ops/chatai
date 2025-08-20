/**
 * Conversation and Message Types
 * 
 * Shared types for conversations and messaging
 */

import { CommunicationChannel } from './customer';

// Conversation status enum
export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// Message types enum
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  LOCATION = 'LOCATION',
  STICKER = 'STICKER',
  EMOJI = 'EMOJI',
}

// Message status enum
export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

// Conversation interface
export interface Conversation {
  id: string;
  customerId: string;
  assignedUserId?: string;
  channel: CommunicationChannel;
  status: ConversationStatus;
  subject?: string;
  priority: number;
  tags: string[];
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Conversation with relations
export interface ConversationWithRelations extends Conversation {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  assignedUser?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  messageCount: number;
  unreadCount: number;
}

// Message interface
export interface Message {
  id: string;
  conversationId: string;
  senderId?: string;
  type: MessageType;
  content: string;
  attachments: string[];
  metadata?: Record<string, any>;
  isFromCustomer: boolean;
  isRead: boolean;
  readAt?: Date;
  status?: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Message with sender info
export interface MessageWithSender extends Message {
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

// Create conversation interface
export interface CreateConversation {
  customerId: string;
  channel: CommunicationChannel;
  subject?: string;
  priority?: number;
  tags?: string[];
  assignedUserId?: string;
  metadata?: Record<string, any>;
}

// Update conversation interface
export interface UpdateConversation {
  assignedUserId?: string;
  status?: ConversationStatus;
  subject?: string;
  priority?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Send message interface
export interface SendMessage {
  conversationId: string;
  type: MessageType;
  content: string;
  attachments?: string[];
  metadata?: Record<string, any>;
}

// Message attachment interface
export interface MessageAttachment {
  id: string;
  messageId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

// Conversation filters
export interface ConversationFilters {
  status?: ConversationStatus[];
  channel?: CommunicationChannel[];
  assignedUserId?: string[];
  priority?: number[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  isRead?: boolean;
  hasUnreadMessages?: boolean;
}

// Conversation statistics
export interface ConversationStats {
  total: number;
  active: number;
  pending: number;
  resolved: number;
  closed: number;
  averageResponseTime: number; // in minutes
  averageResolutionTime: number; // in hours
  customerSatisfactionRating: number;
}

// Typing indicator interface
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}

// Message reaction interface
export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

// Conversation template interface
export interface ConversationTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Auto-response rule interface
export interface AutoResponseRule {
  id: string;
  name: string;
  trigger: {
    keywords: string[];
    channel?: CommunicationChannel;
    timeRange?: {
      start: string; // HH:mm format
      end: string;
    };
  };
  response: {
    type: 'template' | 'ai' | 'transfer';
    content?: string;
    templateId?: string;
    transferToUserId?: string;
  };
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Conversation status colors for UI
export const CONVERSATION_STATUS_COLORS = {
  [ConversationStatus.ACTIVE]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  [ConversationStatus.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  [ConversationStatus.RESOLVED]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  [ConversationStatus.CLOSED]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
  },
};

// Message type icons
export const MESSAGE_TYPE_ICONS = {
  [MessageType.TEXT]: 'chat-bubble-left',
  [MessageType.IMAGE]: 'photo',
  [MessageType.VIDEO]: 'video-camera',
  [MessageType.AUDIO]: 'microphone',
  [MessageType.FILE]: 'document',
  [MessageType.LOCATION]: 'map-pin',
  [MessageType.STICKER]: 'face-smile',
  [MessageType.EMOJI]: 'face-smile',
};

// Helper functions
export const getConversationStatusLabel = (status: ConversationStatus): string => {
  const labels = {
    [ConversationStatus.ACTIVE]: 'نشطة',
    [ConversationStatus.PENDING]: 'في الانتظار',
    [ConversationStatus.RESOLVED]: 'محلولة',
    [ConversationStatus.CLOSED]: 'مغلقة',
  };
  return labels[status];
};

export const getMessageTypeLabel = (type: MessageType): string => {
  const labels = {
    [MessageType.TEXT]: 'نص',
    [MessageType.IMAGE]: 'صورة',
    [MessageType.VIDEO]: 'فيديو',
    [MessageType.AUDIO]: 'صوت',
    [MessageType.FILE]: 'ملف',
    [MessageType.LOCATION]: 'موقع',
    [MessageType.STICKER]: 'ملصق',
    [MessageType.EMOJI]: 'رمز تعبيري',
  };
  return labels[type];
};

export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `${minutes} دقيقة`;
  if (hours < 24) return `${hours} ساعة`;
  if (days < 7) return `${days} يوم`;
  
  return date.toLocaleDateString('ar-SA');
};

export const isMessageRecent = (date: Date, thresholdMinutes: number = 5): boolean => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff < thresholdMinutes * 60000;
};
