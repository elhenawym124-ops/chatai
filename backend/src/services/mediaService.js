/**
 * Media and File Management Service
 * 
 * Handles file uploads, media processing, and storage management
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class MediaService {
  constructor() {
    this.uploadPath = path.join(__dirname, '../../uploads');
    this.allowedTypes = {
      images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      videos: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
      documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
      audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
      archives: ['zip', 'rar', '7z', 'tar', 'gz']
    };
    this.maxFileSizes = {
      images: 10 * 1024 * 1024, // 10MB
      videos: 100 * 1024 * 1024, // 100MB
      documents: 25 * 1024 * 1024, // 25MB
      audio: 50 * 1024 * 1024, // 50MB
      archives: 50 * 1024 * 1024 // 50MB
    };
    this.files = new Map(); // File metadata storage
    this.initializeStorage();
  }

  /**
   * Initialize storage directories
   */
  async initializeStorage() {
    try {
      const directories = [
        this.uploadPath,
        path.join(this.uploadPath, 'images'),
        path.join(this.uploadPath, 'videos'),
        path.join(this.uploadPath, 'documents'),
        path.join(this.uploadPath, 'audio'),
        path.join(this.uploadPath, 'archives'),
        path.join(this.uploadPath, 'temp'),
        path.join(this.uploadPath, 'thumbnails')
      ];

      for (const dir of directories) {
        try {
          await fs.access(dir);
        } catch {
          await fs.mkdir(dir, { recursive: true });
        }
      }

      console.log('Media storage directories initialized');
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  /**
   * Upload file
   */
  async uploadFile(fileData, metadata = {}) {
    try {
      const {
        filename,
        mimetype,
        size,
        buffer,
        userId,
        companyId,
        description = '',
        tags = []
      } = fileData;

      // Validate file
      const validation = this.validateFile(filename, mimetype, size);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Generate unique filename
      const fileExtension = path.extname(filename).toLowerCase().slice(1);
      const uniqueFilename = this.generateUniqueFilename(filename);
      const category = this.getFileCategory(fileExtension);
      const filePath = path.join(this.uploadPath, category, uniqueFilename);

      // Save file
      await fs.writeFile(filePath, buffer);

      // Generate thumbnail for images
      let thumbnailPath = null;
      if (category === 'images') {
        thumbnailPath = await this.generateThumbnail(filePath, uniqueFilename);
      }

      // Create file metadata
      const fileMetadata = {
        id: this.generateFileId(),
        originalName: filename,
        filename: uniqueFilename,
        path: filePath,
        url: `/uploads/${category}/${uniqueFilename}`,
        thumbnailUrl: thumbnailPath ? `/uploads/thumbnails/${path.basename(thumbnailPath)}` : null,
        mimetype,
        size,
        category,
        extension: fileExtension,
        userId,
        companyId,
        description,
        tags,
        uploadedAt: new Date(),
        downloads: 0,
        isPublic: metadata.isPublic || false,
        expiresAt: metadata.expiresAt || null,
        checksum: this.calculateChecksum(buffer),
      };

      this.files.set(fileMetadata.id, fileMetadata);

      return {
        success: true,
        data: {
          fileId: fileMetadata.id,
          filename: fileMetadata.filename,
          originalName: fileMetadata.originalName,
          url: fileMetadata.url,
          thumbnailUrl: fileMetadata.thumbnailUrl,
          size: fileMetadata.size,
          category: fileMetadata.category,
          mimetype: fileMetadata.mimetype,
        },
        message: 'تم رفع الملف بنجاح'
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: 'فشل في رفع الملف'
      };
    }
  }

  /**
   * Get file information
   */
  async getFile(fileId) {
    try {
      const file = this.files.get(fileId);
      
      if (!file) {
        return {
          success: false,
          error: 'الملف غير موجود'
        };
      }

      // Check if file exists on disk
      try {
        await fs.access(file.path);
      } catch {
        return {
          success: false,
          error: 'الملف غير موجود على الخادم'
        };
      }

      return {
        success: true,
        data: file
      };
    } catch (error) {
      console.error('Error getting file:', error);
      return {
        success: false,
        error: 'فشل في جلب معلومات الملف'
      };
    }
  }

  /**
   * Download file
   */
  async downloadFile(fileId, userId = null) {
    try {
      const fileResult = await this.getFile(fileId);
      
      if (!fileResult.success) {
        return fileResult;
      }

      const file = fileResult.data;

      // Check permissions
      if (!file.isPublic && file.userId !== userId) {
        return {
          success: false,
          error: 'ليس لديك صلاحية لتحميل هذا الملف'
        };
      }

      // Check expiration
      if (file.expiresAt && new Date() > file.expiresAt) {
        return {
          success: false,
          error: 'انتهت صلاحية الملف'
        };
      }

      // Increment download counter
      file.downloads++;
      this.files.set(fileId, file);

      // Read file
      const fileBuffer = await fs.readFile(file.path);

      return {
        success: true,
        data: {
          buffer: fileBuffer,
          filename: file.originalName,
          mimetype: file.mimetype,
          size: file.size,
        }
      };
    } catch (error) {
      console.error('Error downloading file:', error);
      return {
        success: false,
        error: 'فشل في تحميل الملف'
      };
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId, userId = null) {
    try {
      const file = this.files.get(fileId);
      
      if (!file) {
        return {
          success: false,
          error: 'الملف غير موجود'
        };
      }

      // Check permissions
      if (file.userId !== userId) {
        return {
          success: false,
          error: 'ليس لديك صلاحية لحذف هذا الملف'
        };
      }

      // Delete file from disk
      try {
        await fs.unlink(file.path);
        
        // Delete thumbnail if exists
        if (file.thumbnailUrl) {
          const thumbnailPath = path.join(this.uploadPath, 'thumbnails', path.basename(file.thumbnailUrl));
          try {
            await fs.unlink(thumbnailPath);
          } catch (error) {
            console.warn('Could not delete thumbnail:', error.message);
          }
        }
      } catch (error) {
        console.warn('Could not delete file from disk:', error.message);
      }

      // Remove from metadata
      this.files.delete(fileId);

      return {
        success: true,
        message: 'تم حذف الملف بنجاح'
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: 'فشل في حذف الملف'
      };
    }
  }

  /**
   * Get files list
   */
  async getFiles(filters = {}) {
    try {
      let files = Array.from(this.files.values());

      // Apply filters
      if (filters.userId) {
        files = files.filter(file => file.userId === filters.userId);
      }

      if (filters.companyId) {
        files = files.filter(file => file.companyId === filters.companyId);
      }

      if (filters.category) {
        files = files.filter(file => file.category === filters.category);
      }

      if (filters.extension) {
        files = files.filter(file => file.extension === filters.extension);
      }

      if (filters.isPublic !== undefined) {
        files = files.filter(file => file.isPublic === filters.isPublic);
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        files = files.filter(file => 
          file.originalName.toLowerCase().includes(searchTerm) ||
          file.description.toLowerCase().includes(searchTerm) ||
          file.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Sort by upload date (newest first)
      files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedFiles = files.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedFiles.map(file => ({
          id: file.id,
          originalName: file.originalName,
          filename: file.filename,
          url: file.url,
          thumbnailUrl: file.thumbnailUrl,
          size: file.size,
          category: file.category,
          mimetype: file.mimetype,
          description: file.description,
          tags: file.tags,
          uploadedAt: file.uploadedAt,
          downloads: file.downloads,
          isPublic: file.isPublic,
        })),
        pagination: {
          page,
          limit,
          total: files.length,
          pages: Math.ceil(files.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting files:', error);
      return {
        success: false,
        error: 'فشل في جلب قائمة الملفات'
      };
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(companyId = null) {
    try {
      let files = Array.from(this.files.values());
      
      if (companyId) {
        files = files.filter(file => file.companyId === companyId);
      }

      const stats = {
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        totalDownloads: files.reduce((sum, file) => sum + file.downloads, 0),
        categories: {},
        recentUploads: files
          .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
          .slice(0, 10)
          .map(file => ({
            id: file.id,
            originalName: file.originalName,
            size: file.size,
            category: file.category,
            uploadedAt: file.uploadedAt,
          })),
      };

      // Calculate category statistics
      Object.keys(this.allowedTypes).forEach(category => {
        const categoryFiles = files.filter(file => file.category === category);
        stats.categories[category] = {
          count: categoryFiles.length,
          size: categoryFiles.reduce((sum, file) => sum + file.size, 0),
        };
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات التخزين'
      };
    }
  }

  /**
   * Validate file
   */
  validateFile(filename, mimetype, size) {
    const extension = path.extname(filename).toLowerCase().slice(1);
    
    // Check if extension is allowed
    const category = this.getFileCategory(extension);
    if (!category) {
      return {
        valid: false,
        error: 'نوع الملف غير مدعوم'
      };
    }

    // Check file size
    if (size > this.maxFileSizes[category]) {
      const maxSizeMB = Math.round(this.maxFileSizes[category] / (1024 * 1024));
      return {
        valid: false,
        error: `حجم الملف كبير جداً. الحد الأقصى ${maxSizeMB} ميجابايت`
      };
    }

    return { valid: true };
  }

  /**
   * Get file category based on extension
   */
  getFileCategory(extension) {
    for (const [category, extensions] of Object.entries(this.allowedTypes)) {
      if (extensions.includes(extension)) {
        return category;
      }
    }
    return null;
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalFilename) {
    const extension = path.extname(originalFilename);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}_${random}${extension}`;
  }

  /**
   * Generate file ID
   */
  generateFileId() {
    return `FILE_${Date.now()}_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
  }

  /**
   * Calculate file checksum
   */
  calculateChecksum(buffer) {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  /**
   * Generate thumbnail for images (mock implementation)
   */
  async generateThumbnail(imagePath, filename) {
    try {
      // In a real implementation, you would use a library like Sharp or Jimp
      // For now, we'll just copy the original file as thumbnail
      const thumbnailFilename = `thumb_${filename}`;
      const thumbnailPath = path.join(this.uploadPath, 'thumbnails', thumbnailFilename);
      
      // Mock thumbnail generation - in reality you'd resize the image
      await fs.copyFile(imagePath, thumbnailPath);
      
      return thumbnailPath;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }

  /**
   * Clean up expired files
   */
  async cleanupExpiredFiles() {
    try {
      const now = new Date();
      const expiredFiles = Array.from(this.files.values())
        .filter(file => file.expiresAt && now > file.expiresAt);

      for (const file of expiredFiles) {
        await this.deleteFile(file.id, file.userId);
      }

      console.log(`Cleaned up ${expiredFiles.length} expired files`);
      
      return {
        success: true,
        data: {
          cleanedFiles: expiredFiles.length
        }
      };
    } catch (error) {
      console.error('Error cleaning up expired files:', error);
      return {
        success: false,
        error: 'فشل في تنظيف الملفات المنتهية الصلاحية'
      };
    }
  }

  /**
   * Get file types configuration
   */
  getFileTypesConfig() {
    return {
      success: true,
      data: {
        allowedTypes: this.allowedTypes,
        maxFileSizes: Object.fromEntries(
          Object.entries(this.maxFileSizes).map(([key, value]) => [
            key, 
            Math.round(value / (1024 * 1024)) + ' MB'
          ])
        ),
      }
    };
  }
}

module.exports = new MediaService();
