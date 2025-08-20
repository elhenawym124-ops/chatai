/**
 * Common Types
 * 
 * Shared utility types used across the application
 */

// Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Sort order enum
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// Sort interface
export interface Sort {
  field: string;
  order: SortOrder;
}

// Date range interface
export interface DateRange {
  start: Date;
  end: Date;
}

// File upload interface
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  readAt?: Date;
  data?: Record<string, any>;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Activity log interface
export interface Activity {
  id: string;
  userId?: string;
  customerId?: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Integration interface
export interface Integration {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSyncAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Webhook interface
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggeredAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Settings interface
export interface Settings {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  isPublic: boolean;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Search result interface
export interface SearchResult<T = any> {
  items: T[];
  total: number;
  pagination: Pagination;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

// Filter interface
export interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

// Query interface
export interface Query {
  search?: string;
  filters?: Filter[];
  sort?: Sort[];
  pagination?: {
    page: number;
    limit: number;
  };
}

// Bulk operation interface
export interface BulkOperation {
  action: string;
  ids: string[];
  data?: Record<string, any>;
}

// Bulk operation result interface
export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

// Export interface
export interface ExportRequest {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  filters?: Filter[];
  fields?: string[];
  filename?: string;
}

// Import interface
export interface ImportRequest {
  file: File;
  mapping: Record<string, string>;
  options: {
    skipHeader: boolean;
    skipDuplicates: boolean;
    updateExisting: boolean;
  };
}

// Import result interface
export interface ImportResult {
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

// Chart data interface
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// Dashboard widget interface
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: Record<string, any>;
  data?: any;
}

// Theme interface
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Generic ID type
export type ID = string;

// Generic timestamp interface
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

// Generic entity interface
export interface Entity extends Timestamps {
  id: ID;
}

// Generic response wrapper
export interface ResponseWrapper<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: Pagination;
    timestamp: string;
    requestId: string;
  };
}

// Event interface for real-time updates
export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
  companyId: string;
}

// Feature flag interface
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
}

// Audit log interface
export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  changes: Record<string, {
    old: any;
    new: any;
  }>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
