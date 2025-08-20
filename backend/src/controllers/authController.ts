import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { authService } from '@/services/authService';
import { asyncHandler, ValidationError } from '@/middleware/errorHandler';
import { LoginCredentials, RegisterData } from '@/types/shared';
import { logger } from '@/utils/logger';

/**
 * Authentication Controller
 * 
 * Handles authentication-related HTTP requests
 */

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'يرجى إدخال بريد إلكتروني صحيح',
    'any.required': 'البريد الإلكتروني مطلوب',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    'any.required': 'كلمة المرور مطلوبة',
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'الاسم الأول يجب أن يكون حرفين على الأقل',
    'string.max': 'الاسم الأول يجب أن يكون 50 حرف كحد أقصى',
    'any.required': 'الاسم الأول مطلوب',
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'الاسم الأخير يجب أن يكون حرفين على الأقل',
    'string.max': 'الاسم الأخير يجب أن يكون 50 حرف كحد أقصى',
    'any.required': 'الاسم الأخير مطلوب',
  }),
  companyName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'اسم الشركة يجب أن يكون حرفين على الأقل',
    'string.max': 'اسم الشركة يجب أن يكون 100 حرف كحد أقصى',
    'any.required': 'اسم الشركة مطلوب',
  }),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().messages({
    'string.pattern.base': 'رقم الهاتف غير صحيح',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'يرجى إدخال بريد إلكتروني صحيح',
    'any.required': 'البريد الإلكتروني مطلوب',
  }),
  password: Joi.string().required().messages({
    'any.required': 'كلمة المرور مطلوبة',
  }),
  rememberMe: Joi.boolean().optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'كلمة المرور الحالية مطلوبة',
  }),
  newPassword: Joi.string().min(8).required().messages({
    'string.min': 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل',
    'any.required': 'كلمة المرور الجديدة مطلوبة',
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'يرجى إدخال بريد إلكتروني صحيح',
    'any.required': 'البريد الإلكتروني مطلوب',
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'رمز إعادة التعيين مطلوب',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    'any.required': 'كلمة المرور مطلوبة',
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'رمز التحديث مطلوب',
  }),
});

/**
 * Register new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new ValidationError('بيانات التسجيل غير صحيحة', error.details);
  }

  const registerData: RegisterData = value;

  // Validate password strength
  authService.validatePassword(registerData.password);

  // Register user
  const result = await authService.register(registerData);

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Log registration
  logger.info('User registered successfully', {
    userId: result.user.id,
    email: result.user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(201).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    },
    message: 'تم إنشاء الحساب بنجاح',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new ValidationError('بيانات تسجيل الدخول غير صحيحة', error.details);
  }

  const credentials: LoginCredentials = value;

  // Login user
  const result = await authService.login(credentials);

  // Set refresh token as HTTP-only cookie
  const cookieMaxAge = credentials.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: cookieMaxAge,
  });

  // Log login
  logger.info('User logged in successfully', {
    userId: result.user.id,
    email: result.user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    },
    message: 'تم تسجيل الدخول بنجاح',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  });
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  // Log logout
  logger.info('User logged out', {
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  });
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  // Get refresh token from cookie or body
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new ValidationError('رمز التحديث مطلوب');
  }

  // Refresh token
  const result = await authService.refreshToken(refreshToken);

  // Set new refresh token as HTTP-only cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.json({
    success: true,
    data: {
      accessToken: result.accessToken,
    },
    message: 'تم تحديث الرمز بنجاح',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  });
});

/**
 * Get current user
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('المستخدم غير مصادق عليه');
  }

  const user = await authService.getCurrentUser(req.user.id);

  res.json({
    success: true,
    data: user,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  });
});

/**
 * Change password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('المستخدم غير مصادق عليه');
  }

  // Validate request body
  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) {
    throw new ValidationError('بيانات تغيير كلمة المرور غير صحيحة', error.details);
  }

  // Validate new password strength
  authService.validatePassword(value.newPassword);

  // Change password
  await authService.changePassword(req.user.id, value.currentPassword, value.newPassword);

  // Log password change
  logger.info('Password changed successfully', {
    userId: req.user.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.json({
    success: true,
    message: 'تم تغيير كلمة المرور بنجاح',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  });
});

/**
 * Forgot password
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const { error, value } = forgotPasswordSchema.validate(req.body);
  if (error) {
    throw new ValidationError('البريد الإلكتروني غير صحيح', error.details);
  }

  // Request password reset
  await authService.forgotPassword(value.email);

  // Log password reset request
  logger.info('Password reset requested', {
    email: value.email,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.json({
    success: true,
    message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  });
});

/**
 * Reset password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const { error, value } = resetPasswordSchema.validate(req.body);
  if (error) {
    throw new ValidationError('بيانات إعادة تعيين كلمة المرور غير صحيحة', error.details);
  }

  // Validate new password strength
  authService.validatePassword(value.password);

  // Reset password
  await authService.resetPassword(value.token, value.password);

  // Log password reset
  logger.info('Password reset successfully', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.json({
    success: true,
    message: 'تم إعادة تعيين كلمة المرور بنجاح',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  });
});
