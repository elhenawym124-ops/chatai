"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInitials = exports.getFullName = exports.canUpgradePlan = exports.getPlanFeatures = exports.PLAN_FEATURES = exports.SubscriptionPlan = void 0;
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["BASIC"] = "BASIC";
    SubscriptionPlan["PRO"] = "PRO";
    SubscriptionPlan["ENTERPRISE"] = "ENTERPRISE";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
exports.PLAN_FEATURES = {
    [SubscriptionPlan.BASIC]: {
        name: 'Basic',
        maxUsers: 5,
        maxConversations: 1000,
        maxProducts: 100,
        features: [
            'basic_crm',
            'messenger_integration',
            'email_support',
        ],
        price: 99,
        currency: 'SAR',
    },
    [SubscriptionPlan.PRO]: {
        name: 'Pro',
        maxUsers: 20,
        maxConversations: 5000,
        maxProducts: 1000,
        features: [
            'advanced_crm',
            'ai_responses',
            'ecommerce',
            'analytics',
            'priority_support',
        ],
        price: 299,
        currency: 'SAR',
    },
    [SubscriptionPlan.ENTERPRISE]: {
        name: 'Enterprise',
        maxUsers: -1,
        maxConversations: -1,
        maxProducts: -1,
        features: [
            'all_features',
            'custom_integrations',
            'dedicated_support',
            'white_label',
        ],
        price: 999,
        currency: 'SAR',
    },
};
const getPlanFeatures = (plan) => {
    return exports.PLAN_FEATURES[plan];
};
exports.getPlanFeatures = getPlanFeatures;
const canUpgradePlan = (currentPlan, targetPlan) => {
    const plans = [SubscriptionPlan.BASIC, SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE];
    const currentIndex = plans.indexOf(currentPlan);
    const targetIndex = plans.indexOf(targetPlan);
    return targetIndex > currentIndex;
};
exports.canUpgradePlan = canUpgradePlan;
const getFullName = (user) => {
    return `${user.firstName} ${user.lastName}`;
};
exports.getFullName = getFullName;
const getUserInitials = (user) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
};
exports.getUserInitials = getUserInitials;
//# sourceMappingURL=user.js.map