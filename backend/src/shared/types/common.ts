/**
 * Common Types for the Application
 * 
 * This file contains shared types that are used across multiple domains
 * to ensure consistency and reduce duplication.
 */

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Database Transaction Type
export type TransactionCallback<T> = (tx: any) => Promise<T>;

// File Upload Types
export interface FileUpload {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface AppErrorDetails {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  validationErrors?: ValidationError[];
}

// Configuration Types
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

// Event Types for Domain Events
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  data: Record<string, any>;
  version: number;
  occurredAt: Date;
}

// Use Case Result Types
export type UseCaseResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: AppErrorDetails;
};

// Repository Interface
export interface IRepository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findMany(params?: PaginationParams & FilterParams): Promise<T[]>;
  create(data: Omit<T, keyof BaseEntity>): Promise<T>;
  update(id: string, data: Partial<Omit<T, keyof BaseEntity>>): Promise<T>;
  delete(id: string): Promise<void>;
  count(params?: FilterParams): Promise<number>;
}

// Service Interface
export interface IService {
  // Common service methods can be defined here
}

// Use Case Interface
export interface IUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<UseCaseResult<TResponse>>;
}

// Controller Response Helper
export interface ControllerResponse<T = any> {
  status: number;
  body: ApiResponse<T>;
}

// Middleware Types
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId: string;
  };
}

// Cache Types
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

// Queue Job Types
export interface QueueJob<T = any> {
  id: string;
  type: string;
  data: T;
  attempts: number;
  maxAttempts: number;
  delay?: number;
  priority?: number;
  createdAt: Date;
}

// Notification Types
export interface NotificationData {
  type: 'email' | 'sms' | 'push' | 'in_app';
  recipient: string;
  subject?: string;
  message: string;
  data?: Record<string, any>;
  scheduledAt?: Date;
}

// Health Check Types
export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  details?: Record<string, any>;
  responseTime?: number;
  timestamp: Date;
}

// Metrics Types
export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp: Date;
}

// Feature Flag Types
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  conditions?: Record<string, any>;
  rolloutPercentage?: number;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
