import { Router } from 'express';
import { FacebookController } from '../controllers/FacebookController';
import { authMiddleware, requireRole } from '../../auth/middleware/authMiddleware';
import { rateLimitMiddleware } from '../../auth/middleware/rateLimitMiddleware';

/**
 * Facebook Integration Routes
 * 
 * Defines all Facebook Messenger integration routes
 */

const router = Router();
const facebookController = new FacebookController();

// Webhook routes (no authentication required)
router.get('/webhook', facebookController.verifyWebhook);
router.post('/webhook', facebookController.handleWebhook);

// Protected routes (authentication required)
router.use(authMiddleware);

// Page management (managers and admins only)
router.get('/pages', requireRole(['COMPANY_ADMIN', 'MANAGER']), facebookController.getPages);
router.post('/connect', requireRole(['COMPANY_ADMIN', 'MANAGER']), facebookController.connectPage);
router.delete('/:pageId', requireRole(['COMPANY_ADMIN', 'MANAGER']), facebookController.disconnectPage);

// General integration routes
router.get('/connected', facebookController.getConnectedPages);
router.get('/status', facebookController.getIntegrationStatus);
router.get('/config', facebookController.getAppConfig);

// Message sending
router.post('/send-message', facebookController.sendMessage);

// Testing and configuration
router.post('/test', requireRole(['COMPANY_ADMIN', 'MANAGER']), facebookController.testConnection);

export { router as facebookRoutes };
