import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';

const router = Router();
const uploadController = new UploadController();

// Single image upload
router.post('/image', 
  uploadController.uploadSingleImage,
  uploadController.handleSingleImageUpload.bind(uploadController)
);

// Multiple images upload
router.post('/images', 
  uploadController.uploadMultipleImages,
  uploadController.handleMultipleImageUpload.bind(uploadController)
);

// Delete image
router.delete('/image/:filename', uploadController.deleteImage.bind(uploadController));

// Get image info
router.get('/image/:filename', uploadController.getImageInfo.bind(uploadController));

export { router as uploadRoutes };
