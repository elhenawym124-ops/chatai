import { UserRole } from './auth';
export declare enum SubscriptionPlan {
    BASIC = "BASIC",
    PRO = "PRO",
    ENTERPRISE = "ENTERPRISE"
}
export interface Company {
    id: string;
    name: string;
    email: string;
    phone?: string;
    website?: string;
    logo?: string;
    address?: string;
    plan: SubscriptionPlan;
    isActive: boolean;
    settings?: CompanySettings;
    createdAt: Date;
    updatedAt: Date;
}
export interface CompanySettings {
    timezone: string;
    currency: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
    features: {
        ai: boolean;
        ecommerce: boolean;
        analytics: boolean;
        notifications: boolean;
    };
    branding: {
        primaryColor: string;
        secondaryColor: string;
        logo?: string;
        favicon?: string;
    };
    notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
    integrations: {
        facebook: boolean;
        whatsapp: boolean;
        telegram: boolean;
        email: boolean;
    };
}
export interface UpdateUserProfile {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
}
export interface CreateUser {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    companyId: string;
}
export interface UpdateUser {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: UserRole;
    isActive?: boolean;
}
export interface UserWithCompany extends Omit<User, 'companyId'> {
    company: Company;
}
export interface UserStats {
    totalConversations: number;
    activeConversations: number;
    resolvedConversations: number;
    averageResponseTime: number;
    customerSatisfactionRating: number;
    totalMessages: number;
    lastActivity: Date;
}
export interface CompanyStats {
    totalUsers: number;
    activeUsers: number;
    totalCustomers: number;
    totalConversations: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    customerSatisfactionRating: number;
}
export declare const PLAN_FEATURES: {
    BASIC: {
        name: string;
        maxUsers: number;
        maxConversations: number;
        maxProducts: number;
        features: string[];
        price: number;
        currency: string;
    };
    PRO: {
        name: string;
        maxUsers: number;
        maxConversations: number;
        maxProducts: number;
        features: string[];
        price: number;
        currency: string;
    };
    ENTERPRISE: {
        name: string;
        maxUsers: number;
        maxConversations: number;
        maxProducts: number;
        features: string[];
        price: number;
        currency: string;
    };
};
export declare const getPlanFeatures: (plan: SubscriptionPlan) => {
    name: string;
    maxUsers: number;
    maxConversations: number;
    maxProducts: number;
    features: string[];
    price: number;
    currency: string;
} | {
    name: string;
    maxUsers: number;
    maxConversations: number;
    maxProducts: number;
    features: string[];
    price: number;
    currency: string;
} | {
    name: string;
    maxUsers: number;
    maxConversations: number;
    maxProducts: number;
    features: string[];
    price: number;
    currency: string;
};
export declare const canUpgradePlan: (currentPlan: SubscriptionPlan, targetPlan: SubscriptionPlan) => boolean;
export declare const getFullName: (user: {
    firstName: string;
    lastName: string;
}) => string;
export declare const getUserInitials: (user: {
    firstName: string;
    lastName: string;
}) => string;
//# sourceMappingURL=user.d.ts.map