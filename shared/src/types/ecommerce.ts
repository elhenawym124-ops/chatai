/**
 * E-commerce Types
 * 
 * Shared types for products, orders, and e-commerce functionality
 */

// Order status enum
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

// Payment status enum
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Payment methods enum
export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
}

// Product interface
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

// Product with category
export interface ProductWithCategory extends Product {
  category?: Category;
}

// Category interface
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

// Category with hierarchy
export interface CategoryWithHierarchy extends Category {
  parent?: Category;
  children: Category[];
  productCount: number;
}

// Order interface
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

// Order with relations
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

// Order item interface
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  metadata?: Record<string, any>;
}

// Order item with product
export interface OrderItemWithProduct extends OrderItem {
  product: {
    id: string;
    name: string;
    sku: string;
    images: string[];
  };
}

// Address interface
export interface Address {
  name: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

// Create product interface
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

// Update product interface
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

// Create order interface
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

// Update order interface
export interface UpdateOrder {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  metadata?: Record<string, any>;
}

// Product filters
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

// Order filters
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

// Product statistics
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

// Order statistics
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

// Inventory movement interface
export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string; // order ID, adjustment ID, etc.
  userId?: string;
  createdAt: Date;
}

// Order status colors for UI
export const ORDER_STATUS_COLORS = {
  [OrderStatus.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  [OrderStatus.CONFIRMED]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  [OrderStatus.PROCESSING]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  [OrderStatus.SHIPPED]: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
  },
  [OrderStatus.DELIVERED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  [OrderStatus.CANCELLED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  [OrderStatus.REFUNDED]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
  },
};

// Payment status colors for UI
export const PAYMENT_STATUS_COLORS = {
  [PaymentStatus.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  [PaymentStatus.COMPLETED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  [PaymentStatus.FAILED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  [PaymentStatus.REFUNDED]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
  },
};

// Helper functions
export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels = {
    [OrderStatus.PENDING]: 'في الانتظار',
    [OrderStatus.CONFIRMED]: 'مؤكد',
    [OrderStatus.PROCESSING]: 'قيد المعالجة',
    [OrderStatus.SHIPPED]: 'تم الشحن',
    [OrderStatus.DELIVERED]: 'تم التسليم',
    [OrderStatus.CANCELLED]: 'ملغي',
    [OrderStatus.REFUNDED]: 'مسترد',
  };
  return labels[status];
};

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  const labels = {
    [PaymentStatus.PENDING]: 'في الانتظار',
    [PaymentStatus.COMPLETED]: 'مكتمل',
    [PaymentStatus.FAILED]: 'فشل',
    [PaymentStatus.REFUNDED]: 'مسترد',
  };
  return labels[status];
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const labels = {
    [PaymentMethod.CASH]: 'نقداً',
    [PaymentMethod.CREDIT_CARD]: 'بطاقة ائتمان',
    [PaymentMethod.BANK_TRANSFER]: 'تحويل بنكي',
    [PaymentMethod.PAYPAL]: 'PayPal',
    [PaymentMethod.STRIPE]: 'Stripe',
  };
  return labels[method];
};

export const formatPrice = (price: number, currency: string = 'SAR'): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
  }).format(price);
};

export const calculateOrderTotal = (items: OrderItem[], tax: number = 0, shipping: number = 0, discount: number = 0): number => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  return subtotal + tax + shipping - discount;
};
