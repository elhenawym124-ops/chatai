import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../../uploads/images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `broadcast-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  }
});

export class UploadController {
  /**
   * Upload single image
   */
  uploadSingleImage = upload.single('image');

  async handleSingleImageUpload(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
        return;
      }

      const imageUrl = `/uploads/images/${req.file.filename}`;

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: imageUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image'
      });
    }
  }

  /**
   * Upload multiple images
   */
  uploadMultipleImages = upload.array('images', 5);

  async handleMultipleImageUpload(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No image files provided'
        });
        return;
      }

      const uploadedImages = files.map(file => ({
        url: `/uploads/images/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }));

      res.json({
        success: true,
        message: `${files.length} images uploaded successfully`,
        data: {
          images: uploadedImages,
          count: files.length
        }
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload images'
      });
    }
  }

  /**
   * Delete uploaded image
   */
  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        res.status(400).json({
          success: false,
          message: 'Filename is required'
        });
        return;
      }

      const filePath = path.join(__dirname, '../../../../uploads/images', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'Image not found'
        });
        return;
      }

      // Delete the file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting image:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete image'
      });
    }
  }

  /**
   * Get image info
   */
  async getImageInfo(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        res.status(400).json({
          success: false,
          message: 'Filename is required'
        });
        return;
      }

      const filePath = path.join(__dirname, '../../../../uploads/images', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'Image not found'
        });
        return;
      }

      const stats = fs.statSync(filePath);

      res.json({
        success: true,
        data: {
          filename,
          url: `/uploads/images/${filename}`,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        }
      });
    } catch (error: any) {
      console.error('Error getting image info:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get image info'
      });
    }
  }
}
