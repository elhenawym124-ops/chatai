/**
 * User and Company Types
 * 
 * Shared types for users and companies
 */

import { UserRole } from './auth';

// Subscription plans enum
export enum SubscriptionPlan {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

// Company interface
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

// Company settings interface
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

// User profile update interface
export interface UpdateUserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

// Create user interface
export interface CreateUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  companyId: string;
}

// Update user interface
export interface UpdateUser {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
}

// User with company interface
export interface UserWithCompany extends Omit<User, 'companyId'> {
  company: Company;
}

// User statistics interface
export interface UserStats {
  totalConversations: number;
  activeConversations: number;
  resolvedConversations: number;
  averageResponseTime: number; // in minutes
  customerSatisfactionRating: number;
  totalMessages: number;
  lastActivity: Date;
}

// Company statistics interface
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

// Subscription plan features
export const PLAN_FEATURES = {
  [SubscriptionPlan.BASIC]: {
    name: 'Basic',
    maxUsers: 5,
    maxConversations: 1000,
    maxProducts: 100,
    features: [
      'basic_crm',
      'messenger_integration',
      'email_support',
    ],
    price: 99,
    currency: 'SAR',
  },
  [SubscriptionPlan.PRO]: {
    name: 'Pro',
    maxUsers: 20,
    maxConversations: 5000,
    maxProducts: 1000,
    features: [
      'advanced_crm',
      'ai_responses',
      'ecommerce',
      'analytics',
      'priority_support',
    ],
    price: 299,
    currency: 'SAR',
  },
  [SubscriptionPlan.ENTERPRISE]: {
    name: 'Enterprise',
    maxUsers: -1, // unlimited
    maxConversations: -1,
    maxProducts: -1,
    features: [
      'all_features',
      'custom_integrations',
      'dedicated_support',
      'white_label',
    ],
    price: 999,
    currency: 'SAR',
  },
};

// Helper functions
export const getPlanFeatures = (plan: SubscriptionPlan) => {
  return PLAN_FEATURES[plan];
};

export const canUpgradePlan = (currentPlan: SubscriptionPlan, targetPlan: SubscriptionPlan): boolean => {
  const plans = [SubscriptionPlan.BASIC, SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE];
  const currentIndex = plans.indexOf(currentPlan);
  const targetIndex = plans.indexOf(targetPlan);
  return targetIndex > currentIndex;
};

export const getFullName = (user: { firstName: string; lastName: string }): string => {
  return `${user.firstName} ${user.lastName}`;
};

export const getUserInitials = (user: { firstName: string; lastName: string }): string => {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
};
