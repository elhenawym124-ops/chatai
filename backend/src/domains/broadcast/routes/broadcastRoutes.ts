import { Router } from 'express';
import { BroadcastController } from '../controllers/BroadcastController';

const router = Router();
const broadcastController = new BroadcastController();

// Campaign routes
router.post('/campaigns', broadcastController.createCampaign.bind(broadcastController));
router.get('/campaigns', broadcastController.getCampaigns.bind(broadcastController));
router.get('/campaigns/:id', broadcastController.getCampaign.bind(broadcastController));
router.put('/campaigns/:id', broadcastController.updateCampaign.bind(broadcastController));
router.delete('/campaigns/:id', broadcastController.cancelCampaign.bind(broadcastController));
router.post('/campaigns/:id/pause', broadcastController.pauseCampaign.bind(broadcastController));
router.post('/campaigns/:id/resume', broadcastController.resumeCampaign.bind(broadcastController));
router.post('/campaigns/:id/send', broadcastController.sendCampaign.bind(broadcastController));

// Analytics routes
router.get('/analytics', broadcastController.getAnalytics.bind(broadcastController));
router.get('/analytics/:campaignId', broadcastController.getCampaignAnalytics.bind(broadcastController));

// Customer lists routes
router.get('/customer-lists', broadcastController.getCustomerLists.bind(broadcastController));

// Settings routes
router.get('/settings', broadcastController.getSettings.bind(broadcastController));
router.put('/settings', broadcastController.updateSettings.bind(broadcastController));

export { router as broadcastRoutes };
