export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export interface Sort {
    field: string;
    order: SortOrder;
}
export interface DateRange {
    start: Date;
    end: Date;
}
export interface FileUpload {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    url?: string;
}
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
export interface SearchResult<T = any> {
    items: T[];
    total: number;
    pagination: Pagination;
    facets?: Record<string, Array<{
        value: string;
        count: number;
    }>>;
}
export interface Filter {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
    value: any;
}
export interface Query {
    search?: string;
    filters?: Filter[];
    sort?: Sort[];
    pagination?: {
        page: number;
        limit: number;
    };
}
export interface BulkOperation {
    action: string;
    ids: string[];
    data?: Record<string, any>;
}
export interface BulkOperationResult {
    success: number;
    failed: number;
    errors: Array<{
        id: string;
        error: string;
    }>;
}
export interface ExportRequest {
    format: 'csv' | 'xlsx' | 'json' | 'pdf';
    filters?: Filter[];
    fields?: string[];
    filename?: string;
}
export interface ImportRequest {
    file: File;
    mapping: Record<string, string>;
    options: {
        skipHeader: boolean;
        skipDuplicates: boolean;
        updateExisting: boolean;
    };
}
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
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type ID = string;
export interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}
export interface Entity extends Timestamps {
    id: ID;
}
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
export interface RealtimeEvent {
    type: string;
    data: any;
    timestamp: Date;
    userId?: string;
    companyId: string;
}
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
//# sourceMappingURL=common.d.ts.map