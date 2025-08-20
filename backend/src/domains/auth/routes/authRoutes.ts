import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';

/**
 * Authentication Routes
 * 
 * Defines all authentication-related routes with appropriate middleware
 */

const router = Router();
const authController = new AuthController();

// Public routes (no authentication required)
router.post('/register', rateLimitMiddleware.register, authController.register);
router.post('/login', rateLimitMiddleware.login, authController.login);
router.post('/refresh', rateLimitMiddleware.refresh, authController.refreshToken);
router.post('/forgot-password', rateLimitMiddleware.forgotPassword, authController.forgotPassword);
router.post('/reset-password', rateLimitMiddleware.resetPassword, authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', rateLimitMiddleware.resendVerification, authController.resendVerification);

// Protected routes (authentication required)
router.use(authMiddleware); // Apply auth middleware to all routes below

router.post('/logout', authController.logout);
router.get('/me', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/change-password', authController.changePassword);

export { router as authRoutes };
