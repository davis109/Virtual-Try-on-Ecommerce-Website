import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8000'; // Your working api.py backend
const STYLIST_BASE_URL = 'http://localhost:5001'; // AI Stylist API

// Create axios instances
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const stylistClient = axios.create({
  baseURL: STYLIST_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptors for loading states
apiClient.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

stylistClient.interceptors.request.use((config) => {
  console.log(`Stylist API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptors for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

stylistClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Stylist API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API Service Functions
export const apiService = {
  // Virtual Try-On Services (using your working api.py)
  async uploadModelImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/upload/model', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async uploadClothImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/upload/cloth', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async processTryOn(modelPath, clothPath, category = 'tops') {
    const response = await apiClient.post('/api/tryon', {
      model_path: modelPath,
      cloth_path: clothPath,
      clothing_category: category,
      use_segmind: true,
    });
    
    return response.data;
  },

  // Get available clothing categories
  async getClothingCategories() {
    // Static categories for now, can be made dynamic later
    return [
      { id: 'tops', name: 'Tops & Shirts', icon: '👔' },
      { id: 'dresses', name: 'Dresses', icon: '👗' },
      { id: 'jackets', name: 'Jackets & Blazers', icon: '🧥' },
      { id: 'pants', name: 'Pants & Jeans', icon: '👖' },
      { id: 'skirts', name: 'Skirts', icon: '👩‍💼' },
      { id: 'sweaters', name: 'Sweaters', icon: '🧶' },
    ];
  },

  // Health check for your backend
  async checkBackendHealth() {
    try {
      const response = await apiClient.get('/health');
      return { status: 'healthy', data: response.data };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },
};

// AI Stylist Services
export const stylistService = {
  // Get clothing items from AI stylist
  async getClothingItems() {
    const response = await stylistClient.get('/api/clothing-items');
    return response.data;
  },

  // Search for clothing items
  async searchClothing(query, userProfile = {}, limit = 10) {
    const response = await stylistClient.post('/api/search-clothing', {
      query,
      user_profile: userProfile,
      limit,
    });
    return response.data;
  },

  // Get style analysis
  async getStyleAnalysis(query, userProfile = {}) {
    const response = await stylistClient.post('/api/style-analysis', {
      query,
      user_profile: userProfile,
    });
    return response.data;
  },

  // Virtual try-on with base64 images
  async virtualTryOnBase64(userImageBase64, clothingItemId) {
    const response = await stylistClient.post('/api/virtual-tryon', {
      user_image: userImageBase64,
      clothing_item_id: clothingItemId,
    });
    return response.data;
  },

  // Virtual try-on with local images
  async virtualTryOnLocal(modelPath, clothingItemId) {
    const response = await stylistClient.post('/api/virtual-tryon-with-local-images', {
      model_image_path: modelPath,
      clothing_item_id: clothingItemId,
    });
    return response.data;
  },

  // Test backend integration
  async testBackendIntegration() {
    const response = await stylistClient.get('/api/test-backend-integration');
    return response.data;
  },

  // Health check for stylist API
  async checkHealth() {
    const response = await stylistClient.get('/health');
    return response.data;
  },
};

// Utility functions
export const utils = {
  // Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  },

  // Validate image file
  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, or WebP)');
    }

    if (file.size > maxSize) {
      throw new Error('Image file size must be less than 10MB');
    }

    return true;
  },

  // Create image preview URL
  createImagePreview(file) {
    return URL.createObjectURL(file);
  },

  // Cleanup preview URL
  cleanupImagePreview(url) {
    URL.revokeObjectURL(url);
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Debounce function for search
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Download result image
  async downloadImage(imageUrl, filename = 'tryon-result.jpg') {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },
};

// Export everything
export default {
  apiService,
  stylistService,
  utils,
};