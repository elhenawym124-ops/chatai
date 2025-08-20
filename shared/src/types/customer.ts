/**
 * Customer Types
 * 
 * Shared types for customer management (CRM)
 */

// Customer status enum
export enum CustomerStatus {
  LEAD = 'LEAD',
  PROSPECT = 'PROSPECT',
  CUSTOMER = 'CUSTOMER',
  VIP = 'VIP',
  INACTIVE = 'INACTIVE',
}

// Communication channels enum
export enum CommunicationChannel {
  FACEBOOK = 'FACEBOOK',
  WHATSAPP = 'WHATSAPP',
  TELEGRAM = 'TELEGRAM',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PHONE = 'PHONE',
  WEBSITE = 'WEBSITE',
}

// Interaction types enum
export enum InteractionType {
  MESSAGE = 'MESSAGE',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  NOTE = 'NOTE',
  TASK = 'TASK',
  ORDER = 'ORDER',
}

// Customer interface
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

// Customer with statistics
export interface CustomerWithStats extends Customer {
  stats: CustomerStats;
}

// Customer statistics interface
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

// Customer interaction interface
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

// Create customer interface
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

// Update customer interface
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

// Customer search filters
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

// Customer segment interface
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

// Customer activity interface
export interface CustomerActivity {
  id: string;
  customerId: string;
  type: 'conversation' | 'order' | 'interaction' | 'status_change';
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Customer export interface
export interface CustomerExport {
  format: 'csv' | 'xlsx' | 'json';
  filters?: CustomerFilters;
  fields: string[];
}

// Customer import interface
export interface CustomerImport {
  file: File;
  mapping: Record<string, string>;
  skipDuplicates: boolean;
  updateExisting: boolean;
}

// Customer status colors for UI
export const CUSTOMER_STATUS_COLORS = {
  [CustomerStatus.LEAD]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  [CustomerStatus.PROSPECT]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  [CustomerStatus.CUSTOMER]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  [CustomerStatus.VIP]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  [CustomerStatus.INACTIVE]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
  },
};

// Communication channel icons
export const CHANNEL_ICONS = {
  [CommunicationChannel.FACEBOOK]: 'facebook',
  [CommunicationChannel.WHATSAPP]: 'whatsapp',
  [CommunicationChannel.TELEGRAM]: 'telegram',
  [CommunicationChannel.EMAIL]: 'envelope',
  [CommunicationChannel.SMS]: 'message',
  [CommunicationChannel.PHONE]: 'phone',
  [CommunicationChannel.WEBSITE]: 'globe',
};

// Helper functions
export const getCustomerFullName = (customer: Customer): string => {
  return `${customer.firstName} ${customer.lastName}`;
};

export const getCustomerDisplayName = (customer: Customer): string => {
  const fullName = getCustomerFullName(customer);
  if (customer.email) {
    return `${fullName} (${customer.email})`;
  }
  if (customer.phone) {
    return `${fullName} (${customer.phone})`;
  }
  return fullName;
};

export const getCustomerInitials = (customer: Customer): string => {
  return `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();
};

export const getCustomerStatusLabel = (status: CustomerStatus): string => {
  const labels = {
    [CustomerStatus.LEAD]: 'عميل محتمل',
    [CustomerStatus.PROSPECT]: 'مهتم',
    [CustomerStatus.CUSTOMER]: 'عميل',
    [CustomerStatus.VIP]: 'عميل مميز',
    [CustomerStatus.INACTIVE]: 'غير نشط',
  };
  return labels[status];
};

export const getChannelLabel = (channel: CommunicationChannel): string => {
  const labels = {
    [CommunicationChannel.FACEBOOK]: 'فيسبوك',
    [CommunicationChannel.WHATSAPP]: 'واتساب',
    [CommunicationChannel.TELEGRAM]: 'تيليجرام',
    [CommunicationChannel.EMAIL]: 'بريد إلكتروني',
    [CommunicationChannel.SMS]: 'رسائل نصية',
    [CommunicationChannel.PHONE]: 'هاتف',
    [CommunicationChannel.WEBSITE]: 'موقع إلكتروني',
  };
  return labels[channel];
};
