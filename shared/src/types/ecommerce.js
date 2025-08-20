"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOrderTotal = exports.formatPrice = exports.getPaymentMethodLabel = exports.getPaymentStatusLabel = exports.getOrderStatusLabel = exports.PAYMENT_STATUS_COLORS = exports.ORDER_STATUS_COLORS = exports.PaymentMethod = exports.PaymentStatus = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["PAYPAL"] = "PAYPAL";
    PaymentMethod["STRIPE"] = "STRIPE";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
exports.ORDER_STATUS_COLORS = {
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
exports.PAYMENT_STATUS_COLORS = {
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
const getOrderStatusLabel = (status) => {
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
exports.getOrderStatusLabel = getOrderStatusLabel;
const getPaymentStatusLabel = (status) => {
    const labels = {
        [PaymentStatus.PENDING]: 'في الانتظار',
        [PaymentStatus.COMPLETED]: 'مكتمل',
        [PaymentStatus.FAILED]: 'فشل',
        [PaymentStatus.REFUNDED]: 'مسترد',
    };
    return labels[status];
};
exports.getPaymentStatusLabel = getPaymentStatusLabel;
const getPaymentMethodLabel = (method) => {
    const labels = {
        [PaymentMethod.CASH]: 'نقداً',
        [PaymentMethod.CREDIT_CARD]: 'بطاقة ائتمان',
        [PaymentMethod.BANK_TRANSFER]: 'تحويل بنكي',
        [PaymentMethod.PAYPAL]: 'PayPal',
        [PaymentMethod.STRIPE]: 'Stripe',
    };
    return labels[method];
};
exports.getPaymentMethodLabel = getPaymentMethodLabel;
const formatPrice = (price, currency = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency,
    }).format(price);
};
exports.formatPrice = formatPrice;
const calculateOrderTotal = (items, tax = 0, shipping = 0, discount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    return subtotal + tax + shipping - discount;
};
exports.calculateOrderTotal = calculateOrderTotal;
//# sourceMappingURL=ecommerce.js.map