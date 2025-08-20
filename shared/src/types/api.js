"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthErrorResponse = exports.isValidationErrorResponse = exports.isApiPaginatedResponse = exports.isApiErrorResponse = exports.isApiSuccessResponse = void 0;
const isApiSuccessResponse = (response) => {
    return response.success === true;
};
exports.isApiSuccessResponse = isApiSuccessResponse;
const isApiErrorResponse = (response) => {
    return response.success === false;
};
exports.isApiErrorResponse = isApiErrorResponse;
const isApiPaginatedResponse = (response) => {
    return (0, exports.isApiSuccessResponse)(response) && 'pagination' in response;
};
exports.isApiPaginatedResponse = isApiPaginatedResponse;
const isValidationErrorResponse = (response) => {
    return response.error.code === 'VALIDATION_ERROR';
};
exports.isValidationErrorResponse = isValidationErrorResponse;
const isAuthErrorResponse = (response) => {
    return ['AUTHENTICATION_ERROR', 'AUTHORIZATION_ERROR', 'TOKEN_EXPIRED'].includes(response.error.code);
};
exports.isAuthErrorResponse = isAuthErrorResponse;
//# sourceMappingURL=api.js.map