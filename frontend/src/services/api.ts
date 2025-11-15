import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
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
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
};

// Projects API
export const projectsAPI = {
  getAll: (params?: any) => api.get('/projects', { params }),
  getOne: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  getStats: (id: string) => api.get(`/projects/${id}/stats`),
};

// Categories API
export const categoriesAPI = {
  getByProject: (projectId: string) => api.get(`/categories/project/${projectId}`),
  getOne: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
};

// Parts API
export const partsAPI = {
  getByCategory: (categoryId: string) => api.get(`/parts/category/${categoryId}`),
  getOne: (id: string) => api.get(`/parts/${id}`),
  create: (data: any) => api.post('/parts', data),
  update: (id: string, data: any) => api.patch(`/parts/${id}`, data),
  delete: (id: string) => api.delete(`/parts/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getProjectBreakdown: (projectId: string) =>
    api.get(`/analytics/project/${projectId}/breakdown`),
  // Phase 3: Advanced Analytics
  getPortfolioMetrics: () => api.get('/analytics/portfolio'),
  getBudgetVariance: (projectId: string) =>
    api.get(`/analytics/project/${projectId}/budget-variance`),
  getTimelineStatus: (projectId: string) =>
    api.get(`/analytics/project/${projectId}/timeline`),
  getSpendingTrends: (months?: number) =>
    api.get('/analytics/spending-trends', { params: { months } }),
};

// Tasks API
export const tasksAPI = {
  getByProject: (projectId: string, filters?: any) =>
    api.get(`/tasks/project/${projectId}`, { params: filters }),
  getOne: (id: string) => api.get(`/tasks/${id}`),
  create: (projectId: string, data: any) =>
    api.post(`/tasks/project/${projectId}`, data),
  update: (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/tasks/${id}/status`, { status }),
  assignTask: (id: string, assignedToId: string | null) =>
    api.patch(`/tasks/${id}/assign`, { assignedToId }),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Vendors API
export const vendorsAPI = {
  getAll: (search?: string) => api.get('/vendors', { params: { search } }),
  getOne: (id: string) => api.get(`/vendors/${id}`),
  getStats: (id: string) => api.get(`/vendors/${id}/stats`),
  create: (data: any) => api.post('/vendors', data),
  update: (id: string, data: any) => api.patch(`/vendors/${id}`, data),
  delete: (id: string) => api.delete(`/vendors/${id}`),
};

// Purchase Orders API
export const purchaseOrdersAPI = {
  getAll: (filters?: { projectId?: string; vendorId?: string }) =>
    api.get('/vendors/purchase-orders', { params: filters }),
  getOne: (id: string) => api.get(`/vendors/purchase-orders/${id}`),
  create: (data: any) => api.post('/vendors/purchase-orders', data),
  update: (id: string, data: any) => api.patch(`/vendors/purchase-orders/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/vendors/purchase-orders/${id}/status`, { status }),
  receiveItems: (id: string, itemId: string, quantityReceived: number) =>
    api.patch(`/vendors/purchase-orders/${id}/items/${itemId}/receive`, { quantityReceived }),
  delete: (id: string) => api.delete(`/vendors/purchase-orders/${id}`),
};

// Change Orders API
export const changeOrdersAPI = {
  getAll: () => api.get('/change-orders'),
  getByProject: (projectId: string) => api.get(`/change-orders/project/${projectId}`),
  getProjectSummary: (projectId: string) =>
    api.get(`/change-orders/project/${projectId}/summary`),
  getOne: (id: string) => api.get(`/change-orders/${id}`),
  create: (data: any) => api.post('/change-orders', data),
  update: (id: string, data: any) => api.patch(`/change-orders/${id}`, data),
  approve: (id: string) => api.patch(`/change-orders/${id}/approve`),
  reject: (id: string, reason: string) =>
    api.patch(`/change-orders/${id}/reject`, { reason }),
  implement: (id: string, implementationNotes?: string) =>
    api.patch(`/change-orders/${id}/implement`, { implementationNotes }),
  cancel: (id: string) => api.patch(`/change-orders/${id}/cancel`),
  delete: (id: string) => api.delete(`/change-orders/${id}`),
};

// Comments API
export const commentsAPI = {
  getAll: (filters?: { commentableType?: string; commentableId?: string }) =>
    api.get('/comments', { params: filters }),
  getOne: (id: string) => api.get(`/comments/${id}`),
  getThread: (id: string) => api.get(`/comments/${id}/thread`),
  getReplies: (id: string) => api.get(`/comments/${id}/replies`),
  create: (data: any) => api.post('/comments', data),
  update: (id: string, data: any) => api.patch(`/comments/${id}`, data),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

// Labor API
export const laborAPI = {
  getByProject: (projectId: string) => api.get(`/labor/project/${projectId}`),
  // Labor Rates
  getRates: () => api.get('/labor/rates'),
  getActiveRates: () => api.get('/labor/rates/active'),
  createRate: (data: any) => api.post('/labor/rates', data),
  updateRate: (id: string, data: any) => api.patch(`/labor/rates/${id}`, data),
  deleteRate: (id: string) => api.delete(`/labor/rates/${id}`),
  // Time Entries
  getTimeEntries: (filters?: { taskId?: string; laborItemId?: string; userId?: string }) =>
    api.get('/labor/time-entries', { params: filters }),
  createTimeEntry: (data: any) => api.post('/labor/time-entries', data),
  updateTimeEntry: (id: string, data: any) => api.patch(`/labor/time-entries/${id}`, data),
  stopTimer: (id: string) => api.patch(`/labor/time-entries/${id}/stop`),
  deleteTimeEntry: (id: string) => api.delete(`/labor/time-entries/${id}`),
  getTaskTimeSummary: (taskId: string) => api.get(`/labor/tasks/${taskId}/time-summary`),
  getProjectLaborSummary: (projectId: string) =>
    api.get(`/labor/projects/${projectId}/labor-summary`),
};
