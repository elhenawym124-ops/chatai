import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { 
  ValidationError, 
  UnauthorizedError, 
  ConflictError, 
  NotFoundError 
} from '../../../shared/errors/AppError';
import { enhancedLogger } from '../../../shared/utils/logger';
import { getPrismaClient } from '../../../config/database';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone?: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId: string;
    company: {
      id: string;
      name: string;
      plan: string;
    };
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface RegisterResponse extends LoginResponse {
  message: string;
}

/**
 * Authentication Service
 * 
 * Handles all authentication business logic including:
 * - User registration and login
 * - JWT token management
 * - Password hashing and verification
 * - Email verification
 * - Password reset
 */
export class AuthService {
  private prisma: PrismaClient;
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private jwtExpiresIn: string;
  private jwtRefreshExpiresIn: string;

  constructor() {
    this.prisma = getPrismaClient();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * Register a new user and company
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create company and user in transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create company
        const company = await tx.company.create({
          data: {
            name: data.companyName,
            email: data.email, // إضافة email المطلوب
            plan: 'BASIC',
            isActive: true,
          }
        });

        // Create user as company admin
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: 'COMPANY_ADMIN',
            isActive: true,
            companyId: company.id,
          },
          include: {
            company: true
          }
        });

        return { user, company };
      });

      // Generate tokens
      const tokens = this.generateTokens(result.user);

      enhancedLogger.business('user_registered', {
        userId: result.user.id,
        email: result.user.email,
        companyId: result.company.id,
      });

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          companyId: result.user.companyId,
          company: {
            id: result.company.id,
            name: result.company.name,
            plan: result.company.plan,
          }
        },
        tokens,
        message: 'Registration successful'
      };
    } catch (error) {
      enhancedLogger.error('Registration failed', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Find user with company
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          company: true
        }
      });

      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedError('Account is not active');
      }

      // Check if company is active
      if (!user.company.isActive) {
        throw new UnauthorizedError('Company account is not active');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate tokens
      const tokens = this.generateTokens(user);

      enhancedLogger.business('user_logged_in', {
        userId: user.id,
        email: user.email,
        companyId: user.companyId,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: user.companyId,
          company: {
            id: user.company.id,
            name: user.company.name,
            plan: user.company.plan,
          }
        },
        tokens
      };
    } catch (error) {
      enhancedLogger.error('Login failed', error, { email });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as any;
      
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { company: true }
      });

      if (!user || !user.isActive || !user.company.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      return tokens;
    } catch (error) {
      enhancedLogger.error('Token refresh failed', error);
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      // In a production app, you would store refresh tokens in database
      // and mark them as revoked here
      enhancedLogger.info('User logged out', { refreshToken: refreshToken.substring(0, 10) + '...' });
    } catch (error) {
      enhancedLogger.error('Logout failed', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          company: true
        }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      enhancedLogger.error('Get profile failed', error, { userId });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: any): Promise<any> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
        }
      });

      enhancedLogger.business('user_profile_updated', {
        userId,
        updatedFields: Object.keys(updateData),
      });

      return user;
    } catch (error) {
      enhancedLogger.error('Update profile failed', error, { userId });
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get current user
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      enhancedLogger.business('user_password_changed', { userId });
    } catch (error) {
      enhancedLogger.error('Change password failed', error, { userId });
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if email exists or not
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Save reset token (you would implement this in your user model)
      // await this.prisma.user.update({
      //   where: { id: user.id },
      //   data: {
      //     resetToken,
      //     resetTokenExpiry
      //   }
      // });

      // Send reset email (implement email service)
      // await this.emailService.sendPasswordResetEmail(email, resetToken);

      enhancedLogger.business('password_reset_requested', { email });
    } catch (error) {
      enhancedLogger.error('Password reset request failed', error, { email });
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Find user by reset token (implement this in your schema)
      // const user = await this.prisma.user.findFirst({
      //   where: {
      //     resetToken: token,
      //     resetTokenExpiry: { gt: new Date() }
      //   }
      // });

      // if (!user) {
      //   throw new UnauthorizedError('Invalid or expired reset token');
      // }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      // await this.prisma.user.update({
      //   where: { id: user.id },
      //   data: {
      //     password: hashedPassword,
      //     resetToken: null,
      //     resetTokenExpiry: null
      //   }
      // });

      enhancedLogger.business('password_reset_completed', { token: token.substring(0, 10) + '...' });
    } catch (error) {
      enhancedLogger.error('Password reset failed', error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      // Implement email verification logic
      enhancedLogger.business('email_verified', { token: token.substring(0, 10) + '...' });
    } catch (error) {
      enhancedLogger.error('Email verification failed', error);
      throw error;
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string): Promise<void> {
    try {
      // Implement resend verification logic
      enhancedLogger.business('email_verification_resent', { email });
    } catch (error) {
      enhancedLogger.error('Resend verification failed', error);
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: any): { accessToken: string; refreshToken: string } {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.jwtRefreshSecret,
      { expiresIn: this.jwtRefreshExpiresIn } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }
}
