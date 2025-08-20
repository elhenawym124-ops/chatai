"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAllPermissions = exports.hasAnyPermission = exports.hasPermission = exports.ROLE_PERMISSIONS = exports.Permission = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["COMPANY_ADMIN"] = "COMPANY_ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["AGENT"] = "AGENT";
})(UserRole || (exports.UserRole = UserRole = {}));
var Permission;
(function (Permission) {
    Permission["USERS_READ"] = "users:read";
    Permission["USERS_WRITE"] = "users:write";
    Permission["USERS_DELETE"] = "users:delete";
    Permission["CUSTOMERS_READ"] = "customers:read";
    Permission["CUSTOMERS_WRITE"] = "customers:write";
    Permission["CUSTOMERS_DELETE"] = "customers:delete";
    Permission["CONVERSATIONS_READ"] = "conversations:read";
    Permission["CONVERSATIONS_WRITE"] = "conversations:write";
    Permission["CONVERSATIONS_DELETE"] = "conversations:delete";
    Permission["CONVERSATIONS_ASSIGN"] = "conversations:assign";
    Permission["PRODUCTS_READ"] = "products:read";
    Permission["PRODUCTS_WRITE"] = "products:write";
    Permission["PRODUCTS_DELETE"] = "products:delete";
    Permission["ORDERS_READ"] = "orders:read";
    Permission["ORDERS_WRITE"] = "orders:write";
    Permission["ORDERS_DELETE"] = "orders:delete";
    Permission["REPORTS_READ"] = "reports:read";
    Permission["ANALYTICS_READ"] = "analytics:read";
    Permission["COMPANY_READ"] = "company:read";
    Permission["COMPANY_WRITE"] = "company:write";
    Permission["INTEGRATIONS_READ"] = "integrations:read";
    Permission["INTEGRATIONS_WRITE"] = "integrations:write";
})(Permission || (exports.Permission = Permission = {}));
exports.ROLE_PERMISSIONS = {
    [UserRole.SUPER_ADMIN]: Object.values(Permission),
    [UserRole.COMPANY_ADMIN]: [
        Permission.USERS_READ,
        Permission.USERS_WRITE,
        Permission.USERS_DELETE,
        Permission.CUSTOMERS_READ,
        Permission.CUSTOMERS_WRITE,
        Permission.CUSTOMERS_DELETE,
        Permission.CONVERSATIONS_READ,
        Permission.CONVERSATIONS_WRITE,
        Permission.CONVERSATIONS_DELETE,
        Permission.CONVERSATIONS_ASSIGN,
        Permission.PRODUCTS_READ,
        Permission.PRODUCTS_WRITE,
        Permission.PRODUCTS_DELETE,
        Permission.ORDERS_READ,
        Permission.ORDERS_WRITE,
        Permission.ORDERS_DELETE,
        Permission.REPORTS_READ,
        Permission.ANALYTICS_READ,
        Permission.COMPANY_READ,
        Permission.COMPANY_WRITE,
        Permission.INTEGRATIONS_READ,
        Permission.INTEGRATIONS_WRITE,
    ],
    [UserRole.MANAGER]: [
        Permission.USERS_READ,
        Permission.CUSTOMERS_READ,
        Permission.CUSTOMERS_WRITE,
        Permission.CONVERSATIONS_READ,
        Permission.CONVERSATIONS_WRITE,
        Permission.CONVERSATIONS_ASSIGN,
        Permission.PRODUCTS_READ,
        Permission.PRODUCTS_WRITE,
        Permission.ORDERS_READ,
        Permission.ORDERS_WRITE,
        Permission.REPORTS_READ,
        Permission.ANALYTICS_READ,
    ],
    [UserRole.AGENT]: [
        Permission.CUSTOMERS_READ,
        Permission.CUSTOMERS_WRITE,
        Permission.CONVERSATIONS_READ,
        Permission.CONVERSATIONS_WRITE,
        Permission.PRODUCTS_READ,
        Permission.ORDERS_READ,
        Permission.ORDERS_WRITE,
    ],
};
const hasPermission = (userRole, permission) => {
    return exports.ROLE_PERMISSIONS[userRole].includes(permission);
};
exports.hasPermission = hasPermission;
const hasAnyPermission = (userRole, permissions) => {
    return permissions.some(permission => (0, exports.hasPermission)(userRole, permission));
};
exports.hasAnyPermission = hasAnyPermission;
const hasAllPermissions = (userRole, permissions) => {
    return permissions.every(permission => (0, exports.hasPermission)(userRole, permission));
};
exports.hasAllPermissions = hasAllPermissions;
//# sourceMappingURL=auth.js.map