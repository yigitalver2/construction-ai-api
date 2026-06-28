import apiClient from './apiClient';
import { 
  mockStats, 
  mockDistribution, 
  mockTimeline, 
  mockImages,
  mockTopCategories 
} from './mockData';

// Flag to use mock data (set to false when backend is ready)
const USE_MOCK = false;

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Stats API
export const getStats = async () => {
  if (USE_MOCK) {
    await delay(500);
    return mockStats;
  }
  const response = await apiClient.get('/stats');
  return response.data;
};

// Search API
export const searchImages = async (query, filters = {}) => {
  if (USE_MOCK) {
    await delay(800);
    // Filter mock images based on category
    let results = [...mockImages];
    if (filters.category && filters.category !== 'All') {
      results = results.filter(img => img.category === filters.category);
    }
    return results;
  }
  const response = await apiClient.post('/search', {
    query,
    top_k: 50,
    filters
  });
  return response.data;
};

// Photos API
export const getPhotos = async (params = {}) => {
  if (USE_MOCK) {
    await delay(600);
    return mockImages;
  }
  const response = await apiClient.get('/photos', { params });
  return response.data;
};

export const uploadPhotos = async (files, projectId) => {
  if (USE_MOCK) {
    await delay(1500);
    return { success: true, uploaded: files.length };
  }
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('project_id', projectId);
  
  const response = await apiClient.post('/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Analytics API
export const getAnalytics = async () => {
  if (USE_MOCK) {
    await delay(600);
    return {
      distribution: mockDistribution,
      timeline: mockTimeline,
      topCategories: mockTopCategories
    };
  }
  const response = await apiClient.get('/analytics');
  return response.data;
};

export const getDistribution = async () => {
  if (USE_MOCK) {
    await delay(400);
    return mockDistribution;
  }
  const response = await apiClient.get('/analytics/distribution');
  return response.data;
};

export const getTimeline = async (period = '7d') => {
  if (USE_MOCK) {
    await delay(400);
    return mockTimeline;
  }
  const response = await apiClient.get(`/analytics/timeline?period=${period}`);
  return response.data;
};

export const getTopCategories = async () => {
  if (USE_MOCK) {
    await delay(400);
    return mockTopCategories;
  }
  const response = await apiClient.get('/analytics/top-categories');
  return response.data;
};

// Export API
export const exportResults = async (imageIds, format = 'zip') => {
  if (USE_MOCK) {
    await delay(1000);
    alert(`Exporting ${imageIds.length} images as ${format.toUpperCase()}`);
    return { success: true, downloadUrl: '#' };
  }
  const response = await apiClient.post('/export', {
    image_ids: imageIds,
    format
  });
  return response.data;
};
