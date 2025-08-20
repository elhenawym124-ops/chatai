export declare enum CustomerStatus {
    LEAD = "LEAD",
    PROSPECT = "PROSPECT",
    CUSTOMER = "CUSTOMER",
    VIP = "VIP",
    INACTIVE = "INACTIVE"
}
export declare enum CommunicationChannel {
    FACEBOOK = "FACEBOOK",
    WHATSAPP = "WHATSAPP",
    TELEGRAM = "TELEGRAM",
    EMAIL = "EMAIL",
    SMS = "SMS",
    PHONE = "PHONE",
    WEBSITE = "WEBSITE"
}
export declare enum InteractionType {
    MESSAGE = "MESSAGE",
    CALL = "CALL",
    EMAIL = "EMAIL",
    MEETING = "MEETING",
    NOTE = "NOTE",
    TASK = "TASK",
    ORDER = "ORDER"
}
export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    avatar?: string;
    facebookId?: string;
    whatsappId?: string;
    telegramId?: string;
    status: CustomerStatus;
    tags: string[];
    notes?: string;
    metadata?: Record<string, any>;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CustomerWithStats extends Customer {
    stats: CustomerStats;
}
export interface CustomerStats {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
    totalConversations: number;
    lastInteractionDate?: Date;
    lifetimeValue: number;
    acquisitionChannel: CommunicationChannel;
}
export interface CustomerInteraction {
    id: string;
    customerId: string;
    type: InteractionType;
    channel: CommunicationChannel;
    subject?: string;
    content: string;
    metadata?: Record<string, any>;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateCustomer {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    facebookId?: string;
    whatsappId?: string;
    telegramId?: string;
    status?: CustomerStatus;
    tags?: string[];
    notes?: string;
    metadata?: Record<string, any>;
}
export interface UpdateCustomer {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    status?: CustomerStatus;
    tags?: string[];
    notes?: string;
    metadata?: Record<string, any>;
}
export interface CustomerFilters {
    status?: CustomerStatus[];
    tags?: string[];
    channel?: CommunicationChannel[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    search?: string;
    hasEmail?: boolean;
    hasPhone?: boolean;
    hasOrders?: boolean;
}
export interface CustomerSegment {
    id: string;
    name: string;
    description?: string;
    filters: CustomerFilters;
    customerCount: number;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CustomerActivity {
    id: string;
    customerId: string;
    type: 'conversation' | 'order' | 'interaction' | 'status_change';
    description: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}
export interface CustomerExport {
    format: 'csv' | 'xlsx' | 'json';
    filters?: CustomerFilters;
    fields: string[];
}
export interface CustomerImport {
    file: File;
    mapping: Record<string, string>;
    skipDuplicates: boolean;
    updateExisting: boolean;
}
export declare const CUSTOMER_STATUS_COLORS: {
    LEAD: {
        bg: string;
        text: string;
        border: string;
    };
    PROSPECT: {
        bg: string;
        text: string;
        border: string;
    };
    CUSTOMER: {
        bg: string;
        text: string;
        border: string;
    };
    VIP: {
        bg: string;
        text: string;
        border: string;
    };
    INACTIVE: {
        bg: string;
        text: string;
        border: string;
    };
};
export declare const CHANNEL_ICONS: {
    FACEBOOK: string;
    WHATSAPP: string;
    TELEGRAM: string;
    EMAIL: string;
    SMS: string;
    PHONE: string;
    WEBSITE: string;
};
export declare const getCustomerFullName: (customer: Customer) => string;
export declare const getCustomerDisplayName: (customer: Customer) => string;
export declare const getCustomerInitials: (customer: Customer) => string;
export declare const getCustomerStatusLabel: (status: CustomerStatus) => string;
export declare const getChannelLabel: (channel: CommunicationChannel) => string;
//# sourceMappingURL=customer.d.ts.map