/**
 * Authentication Types
 * 
 * Shared types for authentication and authorization
 */

// User roles enum
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
}

// Permissions enum
export enum Permission {
  // User management
  USERS_READ = 'users:read',
  USERS_WRITE = 'users:write',
  USERS_DELETE = 'users:delete',

  // Customer management
  CUSTOMERS_READ = 'customers:read',
  CUSTOMERS_WRITE = 'customers:write',
  CUSTOMERS_DELETE = 'customers:delete',

  // Conversation management
  CONVERSATIONS_READ = 'conversations:read',
  CONVERSATIONS_WRITE = 'conversations:write',
  CONVERSATIONS_DELETE = 'conversations:delete',
  CONVERSATIONS_ASSIGN = 'conversations:assign',

  // Product management
  PRODUCTS_READ = 'products:read',
  PRODUCTS_WRITE = 'products:write',
  PRODUCTS_DELETE = 'products:delete',

  // Order management
  ORDERS_READ = 'orders:read',
  ORDERS_WRITE = 'orders:write',
  ORDERS_DELETE = 'orders:delete',

  // Reports and analytics
  REPORTS_READ = 'reports:read',
  ANALYTICS_READ = 'analytics:read',

  // Company settings
  COMPANY_READ = 'company:read',
  COMPANY_WRITE = 'company:write',

  // Integrations
  INTEGRATIONS_READ = 'integrations:read',
  INTEGRATIONS_WRITE = 'integrations:write',
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Registration data interface
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone?: string;
}

// User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication response interface
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// JWT payload interface
export interface JWTPayload {
  userId: string;
  companyId: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}

// Password reset request interface
export interface ForgotPasswordRequest {
  email: string;
}

// Password reset interface
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// Change password interface
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Email verification interface
export interface EmailVerificationRequest {
  token: string;
}

// Session interface
export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.COMPANY_ADMIN]: [
    Permission.USERS_READ,
    Permission.USERS_WRITE,
    Permission.USERS_DELETE,
    Permission.CUSTOMERS_READ,
    Permission.CUSTOMERS_WRITE,
    Permission.CUSTOMERS_DELETE,
    Permission.CONVERSATIONS_READ,
    Permission.CONVERSATIONS_WRITE,
    Permission.CONVERSATIONS_DELETE,
    Permission.CONVERSATIONS_ASSIGN,
    Permission.PRODUCTS_READ,
    Permission.PRODUCTS_WRITE,
    Permission.PRODUCTS_DELETE,
    Permission.ORDERS_READ,
    Permission.ORDERS_WRITE,
    Permission.ORDERS_DELETE,
    Permission.REPORTS_READ,
    Permission.ANALYTICS_READ,
    Permission.COMPANY_READ,
    Permission.COMPANY_WRITE,
    Permission.INTEGRATIONS_READ,
    Permission.INTEGRATIONS_WRITE,
  ],
  [UserRole.MANAGER]: [
    Permission.USERS_READ,
    Permission.CUSTOMERS_READ,
    Permission.CUSTOMERS_WRITE,
    Permission.CONVERSATIONS_READ,
    Permission.CONVERSATIONS_WRITE,
    Permission.CONVERSATIONS_ASSIGN,
    Permission.PRODUCTS_READ,
    Permission.PRODUCTS_WRITE,
    Permission.ORDERS_READ,
    Permission.ORDERS_WRITE,
    Permission.REPORTS_READ,
    Permission.ANALYTICS_READ,
  ],
  [UserRole.AGENT]: [
    Permission.CUSTOMERS_READ,
    Permission.CUSTOMERS_WRITE,
    Permission.CONVERSATIONS_READ,
    Permission.CONVERSATIONS_WRITE,
    Permission.PRODUCTS_READ,
    Permission.ORDERS_READ,
    Permission.ORDERS_WRITE,
  ],
};

// Helper functions
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole].includes(permission);
};

export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};
