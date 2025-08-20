import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';
import { authMiddleware, requireRole } from '../../auth/middleware/authMiddleware';
import { rateLimitMiddleware } from '../../auth/middleware/rateLimitMiddleware';

/**
 * Customer Routes
 * 
 * Defines all customer-related routes with appropriate middleware
 */

const router = Router();
const customerController = new CustomerController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Customer search (before :id routes to avoid conflicts)
router.get('/search', customerController.searchCustomers);

// Customer segments and analytics
router.get('/segments', requireRole(['COMPANY_ADMIN', 'MANAGER']), customerController.getCustomerSegments);

// Export customers
router.get('/export', requireRole(['COMPANY_ADMIN', 'MANAGER']), customerController.exportCustomers);

// CRUD operations
router.get('/', customerController.getCustomers);
router.post('/', customerController.createCustomer);
router.get('/:id', customerController.getCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', requireRole(['COMPANY_ADMIN', 'MANAGER']), customerController.deleteCustomer);

// Customer interactions
router.get('/:id/interactions', customerController.getCustomerInteractions);
router.get('/:id/stats', customerController.getCustomerStats);

// Customer notes
router.get('/:id/notes', customerController.getCustomerNotes);
router.post('/:id/notes', customerController.addCustomerNote);

export { router as customerRoutes };
