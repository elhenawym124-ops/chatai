import { CommunicationChannel } from './customer';
export declare enum ConversationStatus {
    ACTIVE = "ACTIVE",
    PENDING = "PENDING",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED"
}
export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    FILE = "FILE",
    LOCATION = "LOCATION",
    STICKER = "STICKER",
    EMOJI = "EMOJI"
}
export declare enum MessageStatus {
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ",
    FAILED = "FAILED"
}
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
export interface MessageWithSender extends Message {
    sender?: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
}
export interface CreateConversation {
    customerId: string;
    channel: CommunicationChannel;
    subject?: string;
    priority?: number;
    tags?: string[];
    assignedUserId?: string;
    metadata?: Record<string, any>;
}
export interface UpdateConversation {
    assignedUserId?: string;
    status?: ConversationStatus;
    subject?: string;
    priority?: number;
    tags?: string[];
    metadata?: Record<string, any>;
}
export interface SendMessage {
    conversationId: string;
    type: MessageType;
    content: string;
    attachments?: string[];
    metadata?: Record<string, any>;
}
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
export interface ConversationStats {
    total: number;
    active: number;
    pending: number;
    resolved: number;
    closed: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    customerSatisfactionRating: number;
}
export interface TypingIndicator {
    conversationId: string;
    userId: string;
    isTyping: boolean;
    timestamp: Date;
}
export interface MessageReaction {
    id: string;
    messageId: string;
    userId: string;
    emoji: string;
    createdAt: Date;
}
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
export interface AutoResponseRule {
    id: string;
    name: string;
    trigger: {
        keywords: string[];
        channel?: CommunicationChannel;
        timeRange?: {
            start: string;
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
export declare const CONVERSATION_STATUS_COLORS: {
    ACTIVE: {
        bg: string;
        text: string;
        border: string;
    };
    PENDING: {
        bg: string;
        text: string;
        border: string;
    };
    RESOLVED: {
        bg: string;
        text: string;
        border: string;
    };
    CLOSED: {
        bg: string;
        text: string;
        border: string;
    };
};
export declare const MESSAGE_TYPE_ICONS: {
    TEXT: string;
    IMAGE: string;
    VIDEO: string;
    AUDIO: string;
    FILE: string;
    LOCATION: string;
    STICKER: string;
    EMOJI: string;
};
export declare const getConversationStatusLabel: (status: ConversationStatus) => string;
export declare const getMessageTypeLabel: (type: MessageType) => string;
export declare const formatMessageTime: (date: Date) => string;
export declare const isMessageRecent: (date: Date, thresholdMinutes?: number) => boolean;
//# sourceMappingURL=conversation.d.ts.map