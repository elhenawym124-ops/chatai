"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannelLabel = exports.getCustomerStatusLabel = exports.getCustomerInitials = exports.getCustomerDisplayName = exports.getCustomerFullName = exports.CHANNEL_ICONS = exports.CUSTOMER_STATUS_COLORS = exports.InteractionType = exports.CommunicationChannel = exports.CustomerStatus = void 0;
var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["LEAD"] = "LEAD";
    CustomerStatus["PROSPECT"] = "PROSPECT";
    CustomerStatus["CUSTOMER"] = "CUSTOMER";
    CustomerStatus["VIP"] = "VIP";
    CustomerStatus["INACTIVE"] = "INACTIVE";
})(CustomerStatus || (exports.CustomerStatus = CustomerStatus = {}));
var CommunicationChannel;
(function (CommunicationChannel) {
    CommunicationChannel["FACEBOOK"] = "FACEBOOK";
    CommunicationChannel["WHATSAPP"] = "WHATSAPP";
    CommunicationChannel["TELEGRAM"] = "TELEGRAM";
    CommunicationChannel["EMAIL"] = "EMAIL";
    CommunicationChannel["SMS"] = "SMS";
    CommunicationChannel["PHONE"] = "PHONE";
    CommunicationChannel["WEBSITE"] = "WEBSITE";
})(CommunicationChannel || (exports.CommunicationChannel = CommunicationChannel = {}));
var InteractionType;
(function (InteractionType) {
    InteractionType["MESSAGE"] = "MESSAGE";
    InteractionType["CALL"] = "CALL";
    InteractionType["EMAIL"] = "EMAIL";
    InteractionType["MEETING"] = "MEETING";
    InteractionType["NOTE"] = "NOTE";
    InteractionType["TASK"] = "TASK";
    InteractionType["ORDER"] = "ORDER";
})(InteractionType || (exports.InteractionType = InteractionType = {}));
exports.CUSTOMER_STATUS_COLORS = {
    [CustomerStatus.LEAD]: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
    },
    [CustomerStatus.PROSPECT]: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
    },
    [CustomerStatus.CUSTOMER]: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
    },
    [CustomerStatus.VIP]: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200',
    },
    [CustomerStatus.INACTIVE]: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
    },
};
exports.CHANNEL_ICONS = {
    [CommunicationChannel.FACEBOOK]: 'facebook',
    [CommunicationChannel.WHATSAPP]: 'whatsapp',
    [CommunicationChannel.TELEGRAM]: 'telegram',
    [CommunicationChannel.EMAIL]: 'envelope',
    [CommunicationChannel.SMS]: 'message',
    [CommunicationChannel.PHONE]: 'phone',
    [CommunicationChannel.WEBSITE]: 'globe',
};
const getCustomerFullName = (customer) => {
    return `${customer.firstName} ${customer.lastName}`;
};
exports.getCustomerFullName = getCustomerFullName;
const getCustomerDisplayName = (customer) => {
    const fullName = (0, exports.getCustomerFullName)(customer);
    if (customer.email) {
        return `${fullName} (${customer.email})`;
    }
    if (customer.phone) {
        return `${fullName} (${customer.phone})`;
    }
    return fullName;
};
exports.getCustomerDisplayName = getCustomerDisplayName;
const getCustomerInitials = (customer) => {
    return `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();
};
exports.getCustomerInitials = getCustomerInitials;
const getCustomerStatusLabel = (status) => {
    const labels = {
        [CustomerStatus.LEAD]: 'عميل محتمل',
        [CustomerStatus.PROSPECT]: 'مهتم',
        [CustomerStatus.CUSTOMER]: 'عميل',
        [CustomerStatus.VIP]: 'عميل مميز',
        [CustomerStatus.INACTIVE]: 'غير نشط',
    };
    return labels[status];
};
exports.getCustomerStatusLabel = getCustomerStatusLabel;
const getChannelLabel = (channel) => {
    const labels = {
        [CommunicationChannel.FACEBOOK]: 'فيسبوك',
        [CommunicationChannel.WHATSAPP]: 'واتساب',
        [CommunicationChannel.TELEGRAM]: 'تيليجرام',
        [CommunicationChannel.EMAIL]: 'بريد إلكتروني',
        [CommunicationChannel.SMS]: 'رسائل نصية',
        [CommunicationChannel.PHONE]: 'هاتف',
        [CommunicationChannel.WEBSITE]: 'موقع إلكتروني',
    };
    return labels[channel];
};
exports.getChannelLabel = getChannelLabel;
//# sourceMappingURL=customer.js.map