export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    CREDIT_CARD = "CREDIT_CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    PAYPAL = "PAYPAL",
    STRIPE = "STRIPE"
}
export interface Product {
    id: string;
    name: string;
    description?: string;
    sku: string;
    price: number;
    comparePrice?: number;
    cost?: number;
    images: string[];
    stock: number;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    categoryId?: string;
    isActive: boolean;
    isFeatured: boolean;
    tags: string[];
    metadata?: Record<string, any>;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ProductWithCategory extends Product {
    category?: Category;
}
export interface Category {
    id: string;
    name: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive: boolean;
    sortOrder: number;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CategoryWithHierarchy extends Category {
    parent?: Category;
    children: Category[];
    productCount: number;
}
export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
    notes?: string;
    shippingAddress?: Address;
    billingAddress?: Address;
    metadata?: Record<string, any>;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface OrderWithRelations extends Order {
    customer: {
        id: string;
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
    };
    items: OrderItemWithProduct[];
}
export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    total: number;
    metadata?: Record<string, any>;
}
export interface OrderItemWithProduct extends OrderItem {
    product: {
        id: string;
        name: string;
        sku: string;
        images: string[];
    };
}
export interface Address {
    name: string;
    phone?: string;
    address: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
}
export interface CreateProduct {
    name: string;
    description?: string;
    sku: string;
    price: number;
    comparePrice?: number;
    cost?: number;
    images?: string[];
    stock?: number;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    categoryId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    tags?: string[];
    metadata?: Record<string, any>;
}
export interface UpdateProduct {
    name?: string;
    description?: string;
    price?: number;
    comparePrice?: number;
    cost?: number;
    images?: string[];
    stock?: number;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    categoryId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    tags?: string[];
    metadata?: Record<string, any>;
}
export interface CreateOrder {
    customerId: string;
    items: {
        productId: string;
        quantity: number;
        price?: number;
    }[];
    paymentMethod: PaymentMethod;
    shippingAddress?: Address;
    billingAddress?: Address;
    notes?: string;
    metadata?: Record<string, any>;
}
export interface UpdateOrder {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    shippingAddress?: Address;
    billingAddress?: Address;
    notes?: string;
    metadata?: Record<string, any>;
}
export interface ProductFilters {
    categoryId?: string;
    priceRange?: {
        min: number;
        max: number;
    };
    inStock?: boolean;
    isActive?: boolean;
    isFeatured?: boolean;
    tags?: string[];
    search?: string;
}
export interface OrderFilters {
    status?: OrderStatus[];
    paymentStatus?: PaymentStatus[];
    paymentMethod?: PaymentMethod[];
    customerId?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
    search?: string;
}
export interface ProductStats {
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    totalValue: number;
    averagePrice: number;
    topSellingProducts: Array<{
        product: Product;
        totalSold: number;
        revenue: number;
    }>;
}
export interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    topCustomers: Array<{
        customerId: string;
        customerName: string;
        totalOrders: number;
        totalSpent: number;
    }>;
}
export interface InventoryMovement {
    id: string;
    productId: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    reason: string;
    reference?: string;
    userId?: string;
    createdAt: Date;
}
export declare const ORDER_STATUS_COLORS: {
    PENDING: {
        bg: string;
        text: string;
        border: string;
    };
    CONFIRMED: {
        bg: string;
        text: string;
        border: string;
    };
    PROCESSING: {
        bg: string;
        text: string;
        border: string;
    };
    SHIPPED: {
        bg: string;
        text: string;
        border: string;
    };
    DELIVERED: {
        bg: string;
        text: string;
        border: string;
    };
    CANCELLED: {
        bg: string;
        text: string;
        border: string;
    };
    REFUNDED: {
        bg: string;
        text: string;
        border: string;
    };
};
export declare const PAYMENT_STATUS_COLORS: {
    PENDING: {
        bg: string;
        text: string;
        border: string;
    };
    COMPLETED: {
        bg: string;
        text: string;
        border: string;
    };
    FAILED: {
        bg: string;
        text: string;
        border: string;
    };
    REFUNDED: {
        bg: string;
        text: string;
        border: string;
    };
};
export declare const getOrderStatusLabel: (status: OrderStatus) => string;
export declare const getPaymentStatusLabel: (status: PaymentStatus) => string;
export declare const getPaymentMethodLabel: (method: PaymentMethod) => string;
export declare const formatPrice: (price: number, currency?: string) => string;
export declare const calculateOrderTotal: (items: OrderItem[], tax?: number, shipping?: number, discount?: number) => number;
//# sourceMappingURL=ecommerce.d.ts.map