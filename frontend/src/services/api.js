import axios from 'axios';

// In development, force using the relative path so Vite's proxy handles requests
// and avoids CORS regardless of any VITE_API_URL that might be set in the shell.
// In production builds, allow overriding via VITE_API_URL.
let API_BASE_URL = '/api/v1';
if (!import.meta.env.DEV) {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) {
    // If provided backend URL lacks an /api prefix, append /api/v1 for convenience
    const trimmed = configured.replace(/\/$/, '');
    API_BASE_URL = /\/api\//.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
  } else {
    API_BASE_URL = '/api/v1';
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  // Prevent infinite spinners if backend is unreachable
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (import.meta.env.DEV) {
      // Lightweight debug to verify header is set during dev
      // console.debug('[api] Authorization header attached');
    }
  }
  return config;
});

// Global auth error handling: if token is invalid/expired, clear it.
// We avoid hard redirects here to prevent flicker/loops; route guards/pages decide navigation.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try { localStorage.removeItem('token'); } catch {
        // ignore storage errors (e.g., private mode)
      }
      if (import.meta.env.DEV) {
        // console.debug('[api] Auth error', status, error?.response?.data);
      }
    }
    return Promise.reject(error);
  }
);

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
  exportCSV: (fileId, params) => 
    api.get(`/data/${fileId}/export`, { params, responseType: 'blob' }),
};

// AI endpoints removed

export default api;
