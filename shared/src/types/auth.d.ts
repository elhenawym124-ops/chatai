export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    COMPANY_ADMIN = "COMPANY_ADMIN",
    MANAGER = "MANAGER",
    AGENT = "AGENT"
}
export declare enum Permission {
    USERS_READ = "users:read",
    USERS_WRITE = "users:write",
    USERS_DELETE = "users:delete",
    CUSTOMERS_READ = "customers:read",
    CUSTOMERS_WRITE = "customers:write",
    CUSTOMERS_DELETE = "customers:delete",
    CONVERSATIONS_READ = "conversations:read",
    CONVERSATIONS_WRITE = "conversations:write",
    CONVERSATIONS_DELETE = "conversations:delete",
    CONVERSATIONS_ASSIGN = "conversations:assign",
    PRODUCTS_READ = "products:read",
    PRODUCTS_WRITE = "products:write",
    PRODUCTS_DELETE = "products:delete",
    ORDERS_READ = "orders:read",
    ORDERS_WRITE = "orders:write",
    ORDERS_DELETE = "orders:delete",
    REPORTS_READ = "reports:read",
    ANALYTICS_READ = "analytics:read",
    COMPANY_READ = "company:read",
    COMPANY_WRITE = "company:write",
    INTEGRATIONS_READ = "integrations:read",
    INTEGRATIONS_WRITE = "integrations:write"
}
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
    phone?: string;
}
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
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface JWTPayload {
    userId: string;
    companyId: string;
    role: UserRole;
    permissions: Permission[];
    iat: number;
    exp: number;
}
export interface ForgotPasswordRequest {
    email: string;
}
export interface ResetPasswordRequest {
    token: string;
    password: string;
}
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
export interface EmailVerificationRequest {
    token: string;
}
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
export declare const ROLE_PERMISSIONS: Record<UserRole, Permission[]>;
export declare const hasPermission: (userRole: UserRole, permission: Permission) => boolean;
export declare const hasAnyPermission: (userRole: UserRole, permissions: Permission[]) => boolean;
export declare const hasAllPermissions: (userRole: UserRole, permissions: Permission[]) => boolean;
//# sourceMappingURL=auth.d.ts.map