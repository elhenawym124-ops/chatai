import { Pagination } from './common';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
    requestId: string;
}
export interface ApiSuccessResponse<T = any> extends ApiResponse<T> {
    success: true;
    data: T;
}
export interface ApiErrorResponse extends ApiResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
        stack?: string;
    };
}
export interface ApiPaginatedResponse<T = any> extends ApiSuccessResponse<T[]> {
    pagination: Pagination;
}
export interface ApiListResponse<T = any> extends ApiSuccessResponse<T[]> {
    total: number;
}
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
export interface ApiExportResponse extends ApiSuccessResponse {
    data: {
        downloadUrl: string;
        filename: string;
        expiresAt: string;
    };
}
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
export interface ApiStatsResponse<T = any> extends ApiSuccessResponse<T> {
    data: T & {
        period: {
            start: string;
            end: string;
        };
        generatedAt: string;
    };
}
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
export interface ValidationErrorDetail {
    field: string;
    message: string;
    value?: any;
    code?: string;
}
export interface ApiValidationErrorResponse extends ApiErrorResponse {
    error: {
        code: 'VALIDATION_ERROR';
        message: string;
        details: ValidationErrorDetail[];
    };
}
export interface ApiAuthErrorResponse extends ApiErrorResponse {
    error: {
        code: 'AUTHENTICATION_ERROR' | 'AUTHORIZATION_ERROR' | 'TOKEN_EXPIRED';
        message: string;
    };
}
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
export interface WebSocketMessage<T = any> {
    type: string;
    data: T;
    timestamp: string;
    id: string;
}
export type WebSocketEventType = 'message_received' | 'conversation_updated' | 'user_typing' | 'user_status_changed' | 'notification' | 'order_updated' | 'system_announcement';
export interface WebSocketResponse<T = any> extends WebSocketMessage<T> {
    success: boolean;
    error?: {
        code: string;
        message: string;
    };
}
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
export interface ApiDocumentation {
    version: string;
    title: string;
    description: string;
    baseUrl: string;
    endpoints: Record<string, ApiEndpoint>;
}
export interface RequestContext {
    requestId: string;
    userId?: string;
    companyId?: string;
    userAgent?: string;
    ipAddress?: string;
    timestamp: string;
}
export interface ResponseMetadata {
    requestId: string;
    timestamp: string;
    processingTime: number;
    version: string;
}
export interface ApiClient {
    get<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
    post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
    put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
    delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
    upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>>;
    download(url: string, filename?: string): Promise<void>;
}
export declare const isApiSuccessResponse: <T>(response: ApiResponse<T>) => response is ApiSuccessResponse<T>;
export declare const isApiErrorResponse: (response: ApiResponse) => response is ApiErrorResponse;
export declare const isApiPaginatedResponse: <T>(response: ApiResponse<T[]>) => response is ApiPaginatedResponse<T>;
export declare const isValidationErrorResponse: (response: ApiErrorResponse) => response is ApiValidationErrorResponse;
export declare const isAuthErrorResponse: (response: ApiErrorResponse) => response is ApiAuthErrorResponse;
//# sourceMappingURL=api.d.ts.map