/**
 * API Response Types
 * 
 * Standardized API response types for consistent communication
 * between frontend and backend
 */

import { Pagination } from './common';

// Base API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  requestId: string;
}

// Success response interface
export interface ApiSuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  data: T;
}

// Error response interface
export interface ApiErrorResponse extends ApiResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string; // Only in development
  };
}

// Paginated response interface
export interface ApiPaginatedResponse<T = any> extends ApiSuccessResponse<T[]> {
  pagination: Pagination;
}

// List response interface (without pagination)
export interface ApiListResponse<T = any> extends ApiSuccessResponse<T[]> {
  total: number;
}

// File upload response interface
export interface ApiFileUploadResponse extends ApiSuccessResponse {
  data: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
  };
}

// Bulk operation response interface
export interface ApiBulkOperationResponse extends ApiSuccessResponse {
  data: {
    success: number;
    failed: number;
    total: number;
    errors: Array<{
      id: string;
      error: string;
    }>;
  };
}

// Export response interface
export interface ApiExportResponse extends ApiSuccessResponse {
  data: {
    downloadUrl: string;
    filename: string;
    expiresAt: string;
  };
}

// Import response interface
export interface ApiImportResponse extends ApiSuccessResponse {
  data: {
    total: number;
    imported: number;
    updated: number;
    skipped: number;
    errors: Array<{
      row: number;
      error: string;
    }>;
  };
}

// Statistics response interface
export interface ApiStatsResponse<T = any> extends ApiSuccessResponse<T> {
  data: T & {
    period: {
      start: string;
      end: string;
    };
    generatedAt: string;
  };
}

// Health check response interface
export interface ApiHealthResponse extends ApiSuccessResponse {
  data: {
    status: 'healthy' | 'unhealthy';
    version: string;
    uptime: number;
    environment: string;
    services: Record<string, {
      status: 'up' | 'down';
      responseTime?: number;
      lastCheck: string;
    }>;
  };
}

// Validation error details interface
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
  code?: string;
}

// Validation error response interface
export interface ApiValidationErrorResponse extends ApiErrorResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: ValidationErrorDetail[];
  };
}

// Authentication error response interface
export interface ApiAuthErrorResponse extends ApiErrorResponse {
  error: {
    code: 'AUTHENTICATION_ERROR' | 'AUTHORIZATION_ERROR' | 'TOKEN_EXPIRED';
    message: string;
  };
}

// Rate limit error response interface
export interface ApiRateLimitErrorResponse extends ApiErrorResponse {
  error: {
    code: 'RATE_LIMIT_EXCEEDED';
    message: string;
    details: {
      limit: number;
      remaining: number;
      resetTime: string;
    };
  };
}

// Not found error response interface
export interface ApiNotFoundErrorResponse extends ApiErrorResponse {
  error: {
    code: 'NOT_FOUND';
    message: string;
    details?: {
      resource: string;
      id?: string;
    };
  };
}

// Conflict error response interface
export interface ApiConflictErrorResponse extends ApiErrorResponse {
  error: {
    code: 'CONFLICT';
    message: string;
    details?: {
      field: string;
      value: any;
    };
  };
}

// Server error response interface
export interface ApiServerErrorResponse extends ApiErrorResponse {
  error: {
    code: 'INTERNAL_SERVER_ERROR';
    message: string;
    details?: {
      errorId: string;
      timestamp: string;
    };
  };
}

// WebSocket message interface
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
  id: string;
}

// WebSocket event types
export type WebSocketEventType = 
  | 'message_received'
  | 'conversation_updated'
  | 'user_typing'
  | 'user_status_changed'
  | 'notification'
  | 'order_updated'
  | 'system_announcement';

// WebSocket response interface
export interface WebSocketResponse<T = any> extends WebSocketMessage<T> {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

// API endpoint configuration interface
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description?: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
  responses?: Record<string, {
    description: string;
    schema?: any;
  }>;
}

// API documentation interface
export interface ApiDocumentation {
  version: string;
  title: string;
  description: string;
  baseUrl: string;
  endpoints: Record<string, ApiEndpoint>;
}

// Request context interface
export interface RequestContext {
  requestId: string;
  userId?: string;
  companyId?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: string;
}

// Response metadata interface
export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  processingTime: number;
  version: string;
}

// Generic API client interface
export interface ApiClient {
  get<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
  upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>>;
  download(url: string, filename?: string): Promise<void>;
}

// Type guards for API responses
export const isApiSuccessResponse = <T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> => {
  return response.success === true;
};

export const isApiErrorResponse = (response: ApiResponse): response is ApiErrorResponse => {
  return response.success === false;
};

export const isApiPaginatedResponse = <T>(response: ApiResponse<T[]>): response is ApiPaginatedResponse<T> => {
  return isApiSuccessResponse(response) && 'pagination' in response;
};

export const isValidationErrorResponse = (response: ApiErrorResponse): response is ApiValidationErrorResponse => {
  return response.error.code === 'VALIDATION_ERROR';
};

export const isAuthErrorResponse = (response: ApiErrorResponse): response is ApiAuthErrorResponse => {
  return ['AUTHENTICATION_ERROR', 'AUTHORIZATION_ERROR', 'TOKEN_EXPIRED'].includes(response.error.code);
};
