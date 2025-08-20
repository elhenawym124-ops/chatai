import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getPrismaClient } from '@/config/database';
import { config } from '@/config';
import { 
  AuthenticationError, 
  ValidationError, 
  ConflictError,
  NotFoundError 
} from '@/middleware/errorHandler';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UserRole,
  ROLE_PERMISSIONS
} from '@/types/shared';
import { emailService } from './emailService';
import { logger } from '@/utils/logger';

/**
 * Authentication Service
 * 
 * Handles user authentication, registration, and token management
 */

class AuthService {
  private prisma = getPrismaClient();

  /**
   * Register a new user and company
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create company and user in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create company
        const company = await tx.company.create({
          data: {
            name: data.companyName,
            email: data.email,
            phone: data.phone,
            plan: 'BASIC',
            settings: {
              timezone: 'Asia/Riyadh',
              currency: 'SAR',
              language: 'ar',
              features: {
                ai: false,
                ecommerce: true,
                analytics: false,
                notifications: true,
              },
            },
          },
        });

        // Create user as company admin
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: UserRole.COMPANY_ADMIN,
            companyId: company.id,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            role: true,
            isActive: true,
            isEmailVerified: true,
            emailVerifiedAt: true,
            lastLoginAt: true,
            companyId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return { user, company };
      });

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(result.user);

      // Send welcome email
      await this.sendWelcomeEmail(result.user);

      // Log registration
      logger.info('User registered successfully', {
        userId: result.user.id,
        email: result.user.email,
        companyId: result.company.id,
      });

      return {
        user: result.user as User,
        accessToken,
        refreshToken,
        expiresIn: this.getTokenExpirationTime(),
      };
    } catch (error) {
      logger.error('Registration failed', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Find user with company
      const user = await this.prisma.user.findUnique({
        where: { email: credentials.email },
        include: {
          company: {
            select: {
              id: true,
              isActive: true,
            },
          },
        },
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('Account is disabled');
      }

      // Check if company is active
      if (!user.company.isActive) {
        throw new AuthenticationError('Company account is disabled');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Log successful login
      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        companyId: user.companyId,
      });

      // Return user without password
      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as User,
        accessToken,
        refreshToken,
        expiresIn: this.getTokenExpirationTime(),
      };
    } catch (error) {
      logger.error('Login failed', { error, email: credentials.email });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          companyId: true,
        },
      });

      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      logger.info('Token refreshed successfully', { userId: user.id });

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user as User;
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
      },
    });

    logger.info('Password changed successfully', { userId });
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token (you might want to create a separate table for this)
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        // You'll need to add these fields to your schema
        // resetToken,
        // resetTokenExpiry,
      },
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);

    logger.info('Password reset requested', { userId: user.id, email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find user by reset token
    const user = await this.prisma.user.findFirst({
      where: {
        // resetToken: token,
        // resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        // resetToken: null,
        // resetTokenExpiry: null,
      },
    });

    logger.info('Password reset successfully', { userId: user.id });
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: any): { accessToken: string; refreshToken: string } {
    const payload = {
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as string,
    });

    const refreshToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn as string,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Get token expiration time in seconds
   */
  private getTokenExpirationTime(): number {
    // Parse expiration time from config (e.g., "7d", "1h", "30m")
    const expiresIn = config.jwt.expiresIn;
    
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60;
    } else if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 60 * 60;
    } else if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    } else {
      return parseInt(expiresIn);
    }
  }

  /**
   * Send welcome email
   */
  private async sendWelcomeEmail(user: any): Promise<void> {
    try {
      await emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (error) {
      logger.error('Failed to send welcome email', { error, userId: user.id });
      // Don't throw error as registration was successful
    }
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): void {
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new ValidationError('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new ValidationError('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new ValidationError('Password must contain at least one special character');
    }
  }
}

export const authService = new AuthService();
