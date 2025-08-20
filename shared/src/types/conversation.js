"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMessageRecent = exports.formatMessageTime = exports.getMessageTypeLabel = exports.getConversationStatusLabel = exports.MESSAGE_TYPE_ICONS = exports.CONVERSATION_STATUS_COLORS = exports.MessageStatus = exports.MessageType = exports.ConversationStatus = void 0;
var ConversationStatus;
(function (ConversationStatus) {
    ConversationStatus["ACTIVE"] = "ACTIVE";
    ConversationStatus["PENDING"] = "PENDING";
    ConversationStatus["RESOLVED"] = "RESOLVED";
    ConversationStatus["CLOSED"] = "CLOSED";
})(ConversationStatus || (exports.ConversationStatus = ConversationStatus = {}));
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["VIDEO"] = "VIDEO";
    MessageType["AUDIO"] = "AUDIO";
    MessageType["FILE"] = "FILE";
    MessageType["LOCATION"] = "LOCATION";
    MessageType["STICKER"] = "STICKER";
    MessageType["EMOJI"] = "EMOJI";
})(MessageType || (exports.MessageType = MessageType = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["SENT"] = "SENT";
    MessageStatus["DELIVERED"] = "DELIVERED";
    MessageStatus["READ"] = "READ";
    MessageStatus["FAILED"] = "FAILED";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
exports.CONVERSATION_STATUS_COLORS = {
    [ConversationStatus.ACTIVE]: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
    },
    [ConversationStatus.PENDING]: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
    },
    [ConversationStatus.RESOLVED]: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
    },
    [ConversationStatus.CLOSED]: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
    },
};
exports.MESSAGE_TYPE_ICONS = {
    [MessageType.TEXT]: 'chat-bubble-left',
    [MessageType.IMAGE]: 'photo',
    [MessageType.VIDEO]: 'video-camera',
    [MessageType.AUDIO]: 'microphone',
    [MessageType.FILE]: 'document',
    [MessageType.LOCATION]: 'map-pin',
    [MessageType.STICKER]: 'face-smile',
    [MessageType.EMOJI]: 'face-smile',
};
const getConversationStatusLabel = (status) => {
    const labels = {
        [ConversationStatus.ACTIVE]: 'نشطة',
        [ConversationStatus.PENDING]: 'في الانتظار',
        [ConversationStatus.RESOLVED]: 'محلولة',
        [ConversationStatus.CLOSED]: 'مغلقة',
    };
    return labels[status];
};
exports.getConversationStatusLabel = getConversationStatusLabel;
const getMessageTypeLabel = (type) => {
    const labels = {
        [MessageType.TEXT]: 'نص',
        [MessageType.IMAGE]: 'صورة',
        [MessageType.VIDEO]: 'فيديو',
        [MessageType.AUDIO]: 'صوت',
        [MessageType.FILE]: 'ملف',
        [MessageType.LOCATION]: 'موقع',
        [MessageType.STICKER]: 'ملصق',
        [MessageType.EMOJI]: 'رمز تعبيري',
    };
    return labels[type];
};
exports.getMessageTypeLabel = getMessageTypeLabel;
const formatMessageTime = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1)
        return 'الآن';
    if (minutes < 60)
        return `${minutes} دقيقة`;
    if (hours < 24)
        return `${hours} ساعة`;
    if (days < 7)
        return `${days} يوم`;
    return date.toLocaleDateString('ar-SA');
};
exports.formatMessageTime = formatMessageTime;
const isMessageRecent = (date, thresholdMinutes = 5) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < thresholdMinutes * 60000;
};
exports.isMessageRecent = isMessageRecent;
//# sourceMappingURL=conversation.js.map