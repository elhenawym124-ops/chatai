import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

export interface UploadResponse {
  success: boolean;
  data?: {
    filename: string;
    originalName: string;
    size: number;
    url: string;
    fullUrl: string;
    type: string;
  };
  error?: string;
}

class UploadService {
  /**
   * Upload image for conversation
   */
  async uploadConversationImage(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${API_BASE_URL}/upload/conversation-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error uploading conversation image:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        error: error.message || 'Failed to upload image'
      };
    }
  }

  /**
   * Upload product image
   */
  async uploadProductImage(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${API_BASE_URL}/upload/single`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error uploading product image:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        error: error.message || 'Failed to upload image'
      };
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(files: File[]): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/upload/multiple`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds for multiple files
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error uploading multiple images:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        error: error.message || 'Failed to upload images'
      };
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'Only image files are allowed'
      };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 10MB'
      };
    }

    return { valid: true };
  }

  /**
   * Get file preview URL
   */
  getFilePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const uploadService = new UploadService();
export default uploadService;
