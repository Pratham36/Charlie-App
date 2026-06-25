import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('charlie_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('charlie_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
};

// Daily Logs
export const logsAPI = {
  getAll: (params) => api.get('/logs', { params }),
  getToday: () => api.get('/logs/today'),
  getById: (id) => api.get(`/logs/${id}`),
  create: (data) => api.post('/logs', data),
  update: (id, data) => api.put(`/logs/${id}`, data),
  delete: (id) => api.delete(`/logs/${id}`),
  getStats: () => api.get('/logs/stats/summary'),
};

// Health Records
export const healthAPI = {
  get: () => api.get('/health'),
  addVaccine: (data) => api.post('/health/vaccine', data),
  updateVaccine: (id, data) => api.put(`/health/vaccine/${id}`, data),
  deleteVaccine: (id) => api.delete(`/health/vaccine/${id}`),
  addDeworming: (data) => api.post('/health/deworming', data),
  addMedicine: (data) => api.post('/health/medicine', data),
  updateMedicine: (id, data) => api.put(`/health/medicine/${id}`, data),
  addMilestone: (data) => api.post('/health/milestone', data),
  deleteMilestone: (id) => api.delete(`/health/milestone/${id}`),
};

// Training
export const trainingAPI = {
  get: () => api.get('/training'),
  update: (data) => api.put('/training', data),
  addCommand: (data) => api.post('/training/command', data),
  updateCommand: (id, data) => api.put(`/training/command/${id}`, data),
};

// Photos
export const photosAPI = {
  getAll: () => api.get('/photos'),
  upload: (formData) => api.post('/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (data) => api.delete('/photos', { data }),
};

export default api;
