import { Request, Response } from 'express';
import { BaseController } from '../../../shared/base/BaseController';
import { AuthService } from '../services/AuthService';
import { ValidationError, UnauthorizedError } from '../../../shared/errors/AppError';
import { enhancedLogger } from '../../../shared/utils/logger';

/**
 * Authentication Controller
 * 
 * Handles all authentication-related HTTP requests including:
 * - User registration
 * - User login
 * - Token refresh
 * - Password reset
 * - Email verification
 */
export class AuthController extends BaseController {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  register = this.asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, companyName, phone } = req.body;

    // Validate required fields
    this.validateRequiredFields(req.body, [
      'email', 'password', 'firstName', 'lastName', 'companyName'
    ]);

    // Validate email format
    if (!this.validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Sanitize inputs
    const sanitizedData = {
      email: this.sanitizeInput(email.toLowerCase()),
      password,
      firstName: this.sanitizeInput(firstName),
      lastName: this.sanitizeInput(lastName),
      companyName: this.sanitizeInput(companyName),
      phone: phone ? this.sanitizeInput(phone) : undefined,
    };

    const result = await this.authService.register(sanitizedData);

    enhancedLogger.business('user_registered', {
      userId: result.user.id,
      email: result.user.email,
      companyId: result.user.companyId,
    });

    this.success(res, result, 'User registered successfully', 201);
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = this.asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate required fields
    this.validateRequiredFields(req.body, ['email', 'password']);

    // Validate email format
    if (!this.validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    const sanitizedEmail = this.sanitizeInput(email.toLowerCase());
    const result = await this.authService.login(sanitizedEmail, password);

    enhancedLogger.business('user_logged_in', {
      userId: result.user.id,
      email: result.user.email,
      companyId: result.user.companyId,
    });

    this.success(res, result, 'Login successful');
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  refreshToken = this.asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const result = await this.authService.refreshToken(refreshToken);

    this.success(res, result, 'Token refreshed successfully');
  });

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout = this.asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const user = this.getAuthenticatedUser(req);

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    enhancedLogger.business('user_logged_out', {
      userId: user.id,
      email: user.email,
    });

    this.success(res, null, 'Logout successful');
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  getProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const profile = await this.authService.getUserProfile(user.id);

    this.success(res, profile, 'Profile retrieved successfully');
  });

  /**
   * Update user profile
   * PUT /api/v1/auth/profile
   */
  updateProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { firstName, lastName, phone, avatar } = req.body;

    const updateData = {
      ...(firstName && { firstName: this.sanitizeInput(firstName) }),
      ...(lastName && { lastName: this.sanitizeInput(lastName) }),
      ...(phone && { phone: this.sanitizeInput(phone) }),
      ...(avatar && { avatar: this.sanitizeInput(avatar) }),
    };

    const updatedProfile = await this.authService.updateProfile(user.id, updateData);

    enhancedLogger.business('user_profile_updated', {
      userId: user.id,
      updatedFields: Object.keys(updateData),
    });

    this.success(res, updatedProfile, 'Profile updated successfully');
  });

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    this.validateRequiredFields(req.body, ['currentPassword', 'newPassword']);

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters long');
    }

    await this.authService.changePassword(user.id, currentPassword, newPassword);

    enhancedLogger.business('user_password_changed', {
      userId: user.id,
      email: user.email,
    });

    this.success(res, null, 'Password changed successfully');
  });

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword = this.asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Validate required fields
    this.validateRequiredFields(req.body, ['email']);

    // Validate email format
    if (!this.validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    const sanitizedEmail = this.sanitizeInput(email.toLowerCase());
    await this.authService.requestPasswordReset(sanitizedEmail);

    enhancedLogger.business('password_reset_requested', {
      email: sanitizedEmail,
    });

    this.success(res, null, 'Password reset email sent');
  });

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   */
  resetPassword = this.asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    // Validate required fields
    this.validateRequiredFields(req.body, ['token', 'newPassword']);

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters long');
    }

    await this.authService.resetPassword(token, newPassword);

    enhancedLogger.business('password_reset_completed', {
      token: token.substring(0, 10) + '...', // Log partial token for security
    });

    this.success(res, null, 'Password reset successfully');
  });

  /**
   * Verify email address
   * POST /api/v1/auth/verify-email
   */
  verifyEmail = this.asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError('Verification token is required');
    }

    await this.authService.verifyEmail(token);

    enhancedLogger.business('email_verified', {
      token: token.substring(0, 10) + '...', // Log partial token for security
    });

    this.success(res, null, 'Email verified successfully');
  });

  /**
   * Resend email verification
   * POST /api/v1/auth/resend-verification
   */
  resendVerification = this.asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Validate required fields
    this.validateRequiredFields(req.body, ['email']);

    // Validate email format
    if (!this.validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    const sanitizedEmail = this.sanitizeInput(email.toLowerCase());
    await this.authService.resendEmailVerification(sanitizedEmail);

    enhancedLogger.business('email_verification_resent', {
      email: sanitizedEmail,
    });

    this.success(res, null, 'Verification email sent');
  });
}
