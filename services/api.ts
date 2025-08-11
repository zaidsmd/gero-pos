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

// Request interceptor for adding auth token and session id
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || '31|YyWhzbC5GOjmk0HHF2gh4SWaLmED9xJvKPrsIA8Mf195da9e';
    const sessionId = localStorage.getItem('session_id') || '1';

    // Attach token like before
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    // Add session_id "just like token" for all GETs and POSTs
    try {
      const method = (config.method || 'get').toLowerCase();
      const urlStr = typeof config.url === 'string' ? config.url : '';
      const urlHasSession = urlStr.includes('session_id=');

      // For GET requests: add as query param if not already present
      if (method === 'get') {
        if (!urlHasSession) {
          config.params = { ...(config.params || {}), session_id: sessionId };
        }
      }

      // For POST requests: include in body (JSON) or FormData if not already present
      if (method === 'post') {
        const data = config.data;
        if (data instanceof FormData) {
          if (!data.has('session_id')) {
            data.append('session_id', sessionId);
          }
        } else if (data && typeof data === 'object') {
          if (!('session_id' in data)) {
            (config as any).data = { ...data, session_id: sessionId };
          }
        } else if (!data) {
          // No body yet, initialize with session_id
          (config as any).data = { session_id: sessionId };
        }
      }
    } catch (e) {
      // Fail-safe: don't block the request if something goes wrong here
      console.warn('Failed to attach session_id to request:', e);
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
    getTicket: (id: number | string) => api.get(`/ventes/ticket/${id}`),
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

  // History
  history: {
    getSessionHistory: (sessionId: string | number) => api.get(`/history?session_id=${sessionId}`),
  },

  // Rapports
  rapports: {
    tresorieRapport: () => api.get('/tresorie-rapport'),
    creanceRapport: () => api.get('/creance-rapport'),
    articlesFournisseursRapport: () => api.get('/articles-fournisseurs-rapport'),
    articlesClientsRapport: () => api.get('/articles-clients-rapport'),
    articlesStockRapport: () => api.get('/articles-stock-rapport'),
  },
};

export { api, endpoints };
