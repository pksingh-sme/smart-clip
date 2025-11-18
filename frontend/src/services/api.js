import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getUser: (id) => api.get(`/users/${id}`),
  getUserVideos: () => api.get('/users/videos'),
  subscribe: (id) => api.post(`/users/${id}/subscribe`),
  unsubscribe: (id) => api.delete(`/users/${id}/subscribe`),
  getSubscribers: (id) => api.get(`/users/${id}/subscribers`),
  getSubscriptions: (id) => api.get(`/users/${id}/subscriptions`),
};

// Video API
export const videoAPI = {
  uploadVideo: (data) => api.post('/videos', data),
  getVideos: (params) => api.get('/videos', { params }),
  getVideo: (id) => api.get(`/videos/${id}`),
  updateVideo: (id, data) => api.put(`/videos/${id}`, data),
  deleteVideo: (id) => api.delete(`/videos/${id}`),
  searchVideos: (query) => api.get('/videos/search', { params: { q: query } }),
  getTranscript: (id, lang) => api.get(`/videos/${id}/transcript`, { params: { lang } }),
  saveTranscript: (id, data) => api.post(`/videos/${id}/transcript`, data),
};

// Comment API
export const commentAPI = {
  addComment: (videoId, data) => api.post(`/videos/${videoId}/comments`, data),
  getComments: (videoId, params) => api.get(`/videos/${videoId}/comments`, { params }),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  getReplies: (id) => api.get(`/comments/${id}/replies`),
};

// Interaction API
export const interactionAPI = {
  likeVideo: (id) => api.post(`/videos/${id}/like`),
  dislikeVideo: (id) => api.post(`/videos/${id}/dislike`),
  likeComment: (id) => api.post(`/comments/${id}/like`),
  getLikeStatus: (targetId, targetType) => api.get('/interactions/like-status', { 
    params: { target_id: targetId, target_type: targetType } 
  }),
};

// Recommendation API
export const recommendationAPI = {
  getRecommendations: (params) => api.get('/recommendations', { params }),
  getTrending: (params) => api.get('/trending', { params }),
};

export default api;