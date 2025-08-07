import axios from 'axios';

// Base URL for all API requests
const API_BASE_URL = 'http://pdv.gero-pdv.test/api/v-classic';

// Create a configured Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Default headers can be set here
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || '23|0cPfD29JLljWN355qqnywdM2lwB1C06cyFOT4DVx531b824e';

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.status, error.response.data);

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login or refresh token
          console.log('Unauthorized access, please login again');
          break;
        case 403:
          // Forbidden
          console.log('You do not have permission to access this resource');
          break;
        case 404:
          // Not found
          console.log('Resource not found');
          break;
        case 500:
          // Server error
          console.log('Server error, please try again later');
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API endpoints as functions
const endpoints = {
  // System
  system: {
    healthCheck: () => api.get('/articles-all'),
  },

  // Payment
  payment: {
    getAccounts: () => api.get('/comptes'),
    getPaymentMethods: () => api.get('/methodes-paiement'),
  },

  // Products
  products: {
    getAll: (page: number = 1) => api.get(`/articles-all?page=${page}`),
    getById: (id: string) => api.get(`/articles/${id}`),
    create: (data: any) => api.post('/articles', data),
    update: (id: string, data: any) => api.put(`/articles/${id}`, data),
    delete: (id: string) => api.delete(`/articles/${id}`),
  },

  // Clients
  clients: {
    getAll: (search:string  ) => api.get(`/clients-liste?search=${search}`),
    getById: (id: number) => api.get(`/clients/${id}`),
    create: (data: any) => api.post('/clients', data),
    update: (id: number, data: any) => api.put(`/clients/${id}`, data),
    delete: (id: number) => api.delete(`/clients/${id}`),
  },

  // Orders/Checkout
  orders: {
    create: (data: any) => api.post('/ventes', data),
    getById: (id: string) => api.get(`/orders/${id}`),
    getAll: () => api.get('/orders'),
    addPayment: (data: any) => api.post('/ventes-ajouter-paiement', data),
  },

  // Depenses
  depenses: {
    getCategories: () => api.get('/depense-categories'),
    create: (data: any) => api.post('/depense', data),
  },

  // Demandes
  demandes: {
    getIntern: () => api.get('/mes-demandes'),
    getExtern: () => api.get('/demandes-externe'),
    create: (data: any) => api.post('/demande-transfert', data),
    getMagasins: () => api.get('/magasins'),
    cancel: (id: number) => api.post(`/demande-transfert/${id}/annuler`),
    accept: (id: number) => api.post(`/demande-transfert/${id}/accepter`),
    print: (id: number) => api.get(`/demandes-externe-print/${id}`),
    livrer: (id: number, data: any) => api.post(`/demande-transfert/${id}/livrer`, data),
  },

  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh'),
  },
};

export { api, endpoints };
