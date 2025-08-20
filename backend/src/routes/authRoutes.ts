import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
} from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';
import { authRateLimiter, passwordResetRateLimiter } from '@/middleware/rateLimiter';

/**
 * Authentication Routes
 * 
 * Defines all authentication-related endpoints
 */

const router = Router();

// Public routes (no authentication required)
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, resetPassword);

// Protected routes (authentication required)
router.use(authenticateToken);

router.post('/logout', logout);
router.get('/me', getCurrentUser);
router.post('/change-password', changePassword);

export default router;
