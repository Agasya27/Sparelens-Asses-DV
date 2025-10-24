import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/users/me'),
};

export const filesAPI = {
  upload: (formData, onProgress) => 
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  getFiles: (page = 1, pageSize = 10) => 
    api.get('/files', { params: { page, page_size: pageSize } }),
  getFile: (id) => api.get(`/files/${id}`),
  deleteFile: (id) => api.delete(`/files/${id}`),
};

export const dataAPI = {
  getRows: (fileId, params) => 
    api.get(`/data/${fileId}/rows`, { params }),
  aggregate: (fileId, data) => 
    api.post(`/data/${fileId}/aggregate`, data),
  getColumns: (fileId) => 
    api.get(`/data/${fileId}/columns`),
};

export default api;
